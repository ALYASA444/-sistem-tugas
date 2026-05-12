import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// Load .env variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload middleware (Memory Storage for forwarding to Supabase)
const upload = multer({ storage: multer.memoryStorage() });
const multiUpload = upload.fields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]);

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for backend admin tasks
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Endpoint: Check Health
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Helper function to handle image compression and PDF uploads
async function processUploads(files: any) {
  let imageUrl = undefined;
  let attachmentUrl = undefined;
  const uploadedPaths: { bucket: string; path: string }[] = [];

  // Process Image
  if (files?.imageFile?.[0]) {
    const file = files.imageFile[0];
    let buffer = file.buffer;
    let mimetype = file.mimetype;
    let fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`;

    if (file.size > 1024 * 1024) { // Compress if > 1MB
      buffer = await sharp(file.buffer).resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
      mimetype = 'image/jpeg';
      fileName = `${Date.now()}-compressed-image.jpg`;
    }

    const filePath = `public/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('task_images')
      .upload(filePath, buffer, { contentType: mimetype });
    
    if (uploadError) {
      console.error('[STORAGE ERROR] Gagal mengunggah foto:', uploadError.message);
    } else {
      uploadedPaths.push({ bucket: 'task_images', path: filePath });
      const { data } = supabase.storage.from('task_images').getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }
  }

  // Process PDF
  if (files?.pdfFile?.[0]) {
    const file = files.pdfFile[0];
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = `public/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from('attachments')
      .upload(filePath, file.buffer, { contentType: file.mimetype });
      
    if (uploadError) {
      console.error('[STORAGE ERROR] Gagal mengunggah File PDF:', uploadError.message);
    } else {
      uploadedPaths.push({ bucket: 'attachments', path: filePath });
      const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
      attachmentUrl = data.publicUrl;
    }
  }

  return { imageUrl, attachmentUrl, uploadedPaths };
}

async function cleanupUploads(paths: { bucket: string; path: string }[]) {
  for (const { bucket, path } of paths) {
    await supabase.storage.from(bucket).remove([path]);
  }
}

// ========================
// AUTH & LOGIN ROUTE
// ========================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let validEmail = username;
    // Jika tidak pakai @, asumsikan itu adalah NIM
    if (!username.includes('@')) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('nim', username).single();
      if (profile) {
        // Ambil email asli milik NIM tersebut dari Supabase Auth
        const { data: userObj } = await supabase.auth.admin.getUserById(profile.id);
        if (userObj?.user?.email) validEmail = userObj.user.email;
        else validEmail = `${username.replace(/\s+/g, '')}@sistemtugas.com`;
      } else {
        validEmail = `${username.replace(/\s+/g, '')}@sistemtugas.com`;
      }
    }
    
    // Create a temporary client so we don't pollute the global admin client with a user session
    const tempSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const { data, error } = await tempSupabase.auth.signInWithPassword({ email: validEmail, password });
    if (error) return res.status(401).json({ error: error.message });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    return res.json({ session: data.session, user: data.user, role: profile?.role || 'mahasiswa' });
  } catch (err: any) { return res.status(500).json({ error: 'Internal Server Error' }); }
});

// ========================
// USERS ROUTE
// ========================
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) return res.status(400).json({ error: error.message });
  
  // Mencocokkan email asli dari dalam sistem autentikasi
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  
  const formattedUsers = data.map((p: any) => {
    const authU = authUsers?.users?.find(u => u.id === p.id);
    return { 
      id: p.id, 
      name: p.full_name, 
      nim: p.nim, 
      role: p.role, 
      email: authU?.email || `${p.nim}@sistemtugas.com` 
    };
  });
  
  res.json(formattedUsers);
});

app.post('/api/users', async (req, res) => {
  const { name, nim, role, password, email } = req.body;
  try {
    const validEmail = email || `${nim}@sistemtugas.com`;
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({ email: validEmail, password, email_confirm: true });
    
    if (authError) {
      console.error('[API USERS] Auth Error:', authError.message);
      return res.status(400).json({ error: authError.message });
    }

    const { data, error: profileError } = await supabase.from('profiles').insert([{ id: authUser.user.id, full_name: name, nim, role }]).select().single();
    
    if (profileError) {
      console.error('[API USERS] Profile Error:', profileError.message);
      // Kalau profil gagal (misal NIM duplicate), hapus auth user agar tak nyangkut
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ error: profileError.message || 'Gagal menyimpan profil pengguna' });
    }
    res.json({ id: data.id, name: data.full_name, nim: data.nim, role: data.role, email: validEmail });
  } catch (err: any) { 
    console.error('[API USERS] System Error:', err.message);
    res.status(500).json({ error: err.message }); 
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, nim, role, password } = req.body;
  try {
    if (password && password.trim() !== '') await supabase.auth.admin.updateUserById(id, { password });
    const { data, error } = await supabase.from('profiles').update({ full_name: name, nim, role }).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ id: data.id, name: data.full_name, nim: data.nim, role: data.role });
  } catch(err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  await supabase.from('task_completions').delete().eq('user_id', id);
  await supabase.from('profiles').delete().eq('id', id);

  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// ========================
// TASKS ROUTE
// ========================
app.get('/api/tasks', async (req, res) => {
  let { data, error } = await supabase.from('tasks').select('*, task_completions(user_id)');
  
  if (error) {
    // Fallback jika tabel task_completions belum dibuat:
    const fallback = await supabase.from('tasks').select('*');
    if (fallback.error) return res.status(400).json({ error: fallback.error.message });
    data = fallback.data;
  }
  
  res.json((data || []).map((t: any) => ({
    id: t.id, 
    title: t.title, 
    course: t.subject || 'Lainnya', 
    description: t.description, 
    deadline: t.deadline, 
    requiresSubmission: true, 
    status: 'pending', 
    imageUrl: t.image_url, 
    attachmentUrl: t.attachment_url,
    completedBy: t.task_completions ? t.task_completions.map((comp: any) => comp.user_id) : []
  })));
});

app.post('/api/tasks/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { userId, cancel } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    if (cancel) {
      await supabase.from('task_completions').delete().match({ task_id: id, user_id: userId });
    } else {
      await supabase.from('task_completions').upsert([{ task_id: id, user_id: userId }]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', multiUpload, async (req, res) => {
  const { title, course, description, deadline } = req.body;
  let finalImageUrl = req.body.imageUrl;
  let finalAttachmentUrl = req.body.attachmentUrl;

  const uploads = await processUploads(req.files);
  if (uploads.imageUrl) finalImageUrl = uploads.imageUrl;
  if (uploads.attachmentUrl) finalAttachmentUrl = uploads.attachmentUrl;

  const { data, error } = await supabase.from('tasks').insert([{
    title, subject: course, description, deadline: deadline ? new Date(deadline).toISOString() : null, 
    image_url: finalImageUrl, attachment_url: finalAttachmentUrl
  }]).select().single();
  
  if (error) {
    await cleanupUploads(uploads.uploadedPaths);
    return res.status(400).json({ error: error.message });
  }
  res.json({ 
    ...data, 
    id: data.id,
    course: data.subject, 
    imageUrl: data.image_url, 
    attachmentUrl: data.attachment_url,
    status: 'pending',
    requiresSubmission: true,
    completedBy: []
  });
});

app.put('/api/tasks/:id', multiUpload, async (req, res) => {
  const { id } = req.params;
  const { title, course, description, deadline } = req.body;
  let payload: any = { title, subject: course, description, deadline: deadline ? new Date(deadline).toISOString() : null };

  const uploads = await processUploads(req.files);
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ 
    ...data, 
    id: data.id,
    course: data.subject, 
    imageUrl: data.image_url, 
    attachmentUrl: data.attachment_url,
    status: 'pending',
    requiresSubmission: true,
    completedBy: []
  });
});

app.delete('/api/tasks/:id', async (req, res) => {
  // Hapus referensi foreign key di task_completions terlebih dahulu agar tidak terjadi FK error
  await supabase.from('task_completions').delete().eq('task_id', req.params.id);
  const { error } = await supabase.from('tasks').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// ========================
// MATERIALS ROUTE
// ========================
app.get('/api/materials', async (req, res) => {
  const { data, error } = await supabase.from('materials').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map((m: any) => ({ ...m, dateAdded: m.date_added, attachmentUrl: m.attachment_url, imageUrl: m.image_url })));
});

app.post('/api/materials', multiUpload, async (req, res) => {
  const { title, course, url, type } = req.body;
  
  let payload: any = { title, course, url, type };
  const uploads = await processUploads(req.files);
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('materials').insert([payload]).select().single();
  if (error) {
    await cleanupUploads(uploads.uploadedPaths);
    return res.status(400).json({ error: error.message });
  }
  res.json({ ...data, dateAdded: data.date_added, attachmentUrl: data.attachment_url, imageUrl: data.image_url });
});

app.put('/api/materials/:id', multiUpload, async (req, res) => {
  const { id } = req.params;
  const { title, course, url, type } = req.body;
  let payload: any = { title, course, url, type };

  const uploads = await processUploads(req.files);
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('materials').update(payload).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ...data, dateAdded: data.date_added, attachmentUrl: data.attachment_url, imageUrl: data.image_url });
});

app.delete('/api/materials/:id', async (req, res) => {
  const { error } = await supabase.from('materials').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// ========================
// ANNOUNCEMENTS ROUTE
// ========================
app.get('/api/announcements', async (req, res) => {
  const { data, error } = await supabase.from('announcements').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map((m: any) => ({ ...m, attachmentUrl: m.attachment_url, imageUrl: m.image_url })));
});

app.post('/api/announcements', multiUpload, async (req, res) => {
  const { title, content, author, priority } = req.body;
  
  let payload: any = { title, content, author, priority };
  const uploads = await processUploads(req.files);
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('announcements').insert([payload]).select().single();
  if (error) {
    await cleanupUploads(uploads.uploadedPaths);
    return res.status(400).json({ error: error.message });
  }
  res.json({ ...data, attachmentUrl: data.attachment_url, imageUrl: data.image_url });
});

app.put('/api/announcements/:id', multiUpload, async (req, res) => {
  const { id } = req.params;
  const { title, content, author, priority } = req.body;
  let payload: any = { title, content, author, priority };

  const uploads = await processUploads(req.files);
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('announcements').update(payload).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ...data, attachmentUrl: data.attachment_url, imageUrl: data.image_url });
});

app.delete('/api/announcements/:id', async (req, res) => {
  const { error } = await supabase.from('announcements').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Backend Server running on http://localhost:${port}`);
});
