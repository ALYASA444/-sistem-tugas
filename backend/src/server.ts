import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
const multiUpload = upload.fields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ---------- Simple In-Memory Rate Limiter ----------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 20;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

// ---------- Auth Middleware ----------
async function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
  req.authUser = user;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  req.authRole = profile?.role || 'mahasiswa';
  next();
}

// For admin-only routes
function requireKomti(req: any, res: any, next: any) {
  if (req.authRole !== 'komti') {
    return res.status(403).json({ error: 'Forbidden: hanya Komti yang bisa melakukan ini' });
  }
  next();
}

// ---------- Validation Helpers ----------
function requireFields(body: any, fields: string[]): string | null {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || String(body[f]).trim() === '') {
      return `Field '${f}' wajib diisi`;
    }
  }
  return null;
}

function isValidISODate(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  if (!isoRegex.test(str)) return false;
  const d = new Date(str);
  if (isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === str.slice(0, 10);
}

// ---------- Storage Helpers ----------
async function processUploads(files: any) {
  let imageUrl = undefined;
  let attachmentUrl = undefined;
  const uploadedPaths: { bucket: string; path: string }[] = [];

  if (files?.imageFile?.[0]) {
    const file = files.imageFile[0];
    let buffer = file.buffer;
    let mimetype = file.mimetype;
    let fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`;

    if (file.size > 1024 * 1024) {
      try {
        buffer = await sharp(file.buffer).resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
        mimetype = 'image/jpeg';
        fileName = `${Date.now()}-compressed-image.jpg`;
      } catch (sharpErr: any) {
        console.error('[SHARP ERROR] Gagal kompresi gambar:', sharpErr.message);
        return { imageUrl: undefined, attachmentUrl: undefined, uploadedPaths: [], error: 'Gagal memproses gambar: format tidak didukung' };
      }
    }

    const filePath = `public/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('task_images')
      .upload(filePath, buffer, { contentType: mimetype, upsert: false });

    if (uploadError) {
      console.error('[STORAGE ERROR] Gagal mengunggah foto:', uploadError.message);
      return { imageUrl: undefined, attachmentUrl: undefined, uploadedPaths: [], error: `Gagal mengunggah gambar: ${uploadError.message}` };
    }
    uploadedPaths.push({ bucket: 'task_images', path: filePath });
    const { data } = supabase.storage.from('task_images').getPublicUrl(filePath);
    imageUrl = data.publicUrl;
  }

  if (files?.pdfFile?.[0]) {
    const file = files.pdfFile[0];
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('attachments')
      .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });

    if (uploadError) {
      console.error('[STORAGE ERROR] Gagal mengunggah File PDF:', uploadError.message);
      await cleanupUploads(uploadedPaths);
      return { imageUrl: undefined, attachmentUrl: undefined, uploadedPaths: [], error: `Gagal mengunggah PDF: ${uploadError.message}` };
    }
    uploadedPaths.push({ bucket: 'attachments', path: filePath });
    const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
    attachmentUrl = data.publicUrl;
  }

  return { imageUrl, attachmentUrl, uploadedPaths, error: null };
}

async function cleanupUploads(paths: { bucket: string; path: string }[]) {
  for (const { bucket, path } of paths) {
    await supabase.storage.from(bucket).remove([path]);
  }
}

// ---------- Health (no auth) ----------
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// ========================
// AUTH & LOGIN
// ========================
app.post('/api/login', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!rateLimit(`login:${ip}`)) {
    return res.status(429).json({ error: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  try {
    let validEmail = username;
    if (!username.includes('@')) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('nim', username).single();
      if (profile) {
        const { data: userObj } = await supabase.auth.admin.getUserById(profile.id);
        if (userObj?.user?.email) validEmail = userObj.user.email;
        else validEmail = `${username.replace(/\s+/g, '')}@sistemtugas.com`;
      } else {
        validEmail = `${username.replace(/\s+/g, '')}@sistemtugas.com`;
      }
    }

    const tempSupabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await tempSupabase.auth.signInWithPassword({ email: validEmail, password });
    if (error) return res.status(401).json({ error: error.message });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    return res.json({
      session: data.session,
      user: data.user,
      role: profile?.role || 'mahasiswa'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========================
// USERS
// ========================
app.get('/api/users', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) return res.status(400).json({ error: error.message });

  const { data: authUsers } = await supabase.auth.admin.listUsers();

  const formattedUsers = (data || []).map((p: any) => {
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

app.post('/api/users', authenticate, requireKomti, async (req, res) => {
  const { name, nim, role, password, email } = req.body;
  const missing = requireFields(req.body, ['name', 'nim', 'password']);
  if (missing) return res.status(400).json({ error: missing });

  try {
    const validEmail = email || `${nim}@sistemtugas.com`;
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: validEmail, password, email_confirm: true
    });

    if (authError) {
      console.error('[API USERS] Auth Error:', authError.message);
      return res.status(400).json({ error: authError.message });
    }

    const { data, error: profileError } = await supabase.from('profiles').insert([{
      id: authUser.user.id, full_name: name, nim, role: role || 'mahasiswa'
    }]).select().single();

    if (profileError) {
      console.error('[API USERS] Profile Error:', profileError.message);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ error: profileError.message || 'Gagal menyimpan profil pengguna' });
    }
    res.json({ id: data.id, name: data.full_name, nim: data.nim, role: data.role, email: validEmail });
  } catch (err: any) {
    console.error('[API USERS] System Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', authenticate, requireKomti, async (req, res) => {
  const { id } = req.params;
  const { name, nim, role, password } = req.body;
  try {
    if (password?.trim()) {
      const { error: pwErr } = await supabase.auth.admin.updateUserById(id, { password });
      if (pwErr) {
        console.error('[API USERS] Password update error:', pwErr.message);
        return res.status(400).json({ error: `Gagal memperbarui password: ${pwErr.message}` });
      }
    }
    const { data, error } = await supabase.from('profiles').update({
      full_name: name, nim, role
    }).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ id: data.id, name: data.full_name, nim: data.nim, role: data.role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', authenticate, requireKomti, async (req, res) => {
  const { id } = req.params;

  const errors: string[] = [];
  const { error: compErr } = await supabase.from('task_completions').delete().eq('user_id', id);
  if (compErr) errors.push(compErr.message);

  const { error: profErr } = await supabase.from('profiles').delete().eq('id', id);
  if (profErr) errors.push(profErr.message);

  const { error: authErr } = await supabase.auth.admin.deleteUser(id);
  if (authErr) errors.push(authErr.message);

  if (errors.length > 0) {
    return res.status(400).json({ error: `Gagal menghapus user: ${errors.join('; ')}` });
  }
  res.json({ success: true });
});

// ========================
// TASKS
// ========================
app.get('/api/tasks', authenticate, async (req, res) => {
  let { data, error } = await supabase.from('tasks').select('*, task_completions(user_id)');

  if (error) {
    const fallback = await supabase.from('tasks').select('*');
    if (fallback.error) return res.status(400).json({ error: fallback.error.message });
    data = fallback.data;
  }

  res.json((data || []).map((t: any) => {
    const completedBy = t.task_completions ? t.task_completions.map((comp: any) => comp.user_id) : [];
    const now = new Date();
    const deadline = t.deadline ? new Date(t.deadline) : null;
    let status: 'pending' | 'submitted' | 'overdue' = 'pending';
    if (completedBy.length > 0) status = 'submitted';
    else if (deadline && deadline < now) status = 'overdue';

    return {
      id: t.id,
      title: t.title,
      course: t.subject || 'Lainnya',
      description: t.description,
      deadline: t.deadline,
      requiresSubmission: true,
      status,
      imageUrl: t.image_url,
      attachmentUrl: t.attachment_url,
      completedBy
    };
  }));
});

app.post('/api/tasks/:id/submit', authenticate, async (req, res) => {
  const { id } = req.params;
  const { userId, cancel } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    if (cancel) {
      await supabase.from('task_completions').delete().match({ task_id: id, user_id: userId });
    } else {
      await supabase.from('task_completions').upsert(
        [{ task_id: id, user_id: userId }],
        { onConflict: 'task_id, user_id', ignoreDuplicates: true }
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', authenticate, requireKomti, multiUpload, async (req, res) => {
  const { title, course, description, deadline } = req.body;
  const missing = requireFields(req.body, ['title', 'course']);
  if (missing) return res.status(400).json({ error: missing });
  if (deadline && !isValidISODate(deadline)) return res.status(400).json({ error: 'Format deadline tidak valid' });

  let finalImageUrl = req.body.imageUrl;
  let finalAttachmentUrl = req.body.attachmentUrl;

  const uploads = await processUploads(req.files);
  if (uploads.error) return res.status(400).json({ error: uploads.error });
  if (uploads.imageUrl) finalImageUrl = uploads.imageUrl;
  if (uploads.attachmentUrl) finalAttachmentUrl = uploads.attachmentUrl;

  const { data, error } = await supabase.from('tasks').insert([{
    title, subject: course, description,
    deadline: deadline ? new Date(deadline).toISOString() : null,
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

app.put('/api/tasks/:id', authenticate, requireKomti, multiUpload, async (req, res) => {
  const { id } = req.params;
  const { title, course, description, deadline } = req.body;
  const missing = requireFields(req.body, ['title', 'course']);
  if (missing) return res.status(400).json({ error: missing });
  if (deadline && !isValidISODate(deadline)) return res.status(400).json({ error: 'Format deadline tidak valid' });

  let payload: any = { title, subject: course, description, deadline: deadline ? new Date(deadline).toISOString() : null };

  const uploads = await processUploads(req.files);
  if (uploads.error) return res.status(400).json({ error: uploads.error });
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

app.delete('/api/tasks/:id', authenticate, requireKomti, async (req, res) => {
  const { id } = req.params;

  const { data: task } = await supabase.from('tasks').select('image_url, attachment_url').eq('id', id).single();
  const pathsToClean: { bucket: string; path: string }[] = [];
  if (task?.image_url) {
    const pathMatch = task.image_url.match(/task_images\/public\/(.+)/);
    if (pathMatch) pathsToClean.push({ bucket: 'task_images', path: `public/${pathMatch[1]}` });
  }
  if (task?.attachment_url) {
    const pathMatch = task.attachment_url.match(/attachments\/public\/(.+)/);
    if (pathMatch) pathsToClean.push({ bucket: 'attachments', path: `public/${pathMatch[1]}` });
  }

  await supabase.from('task_completions').delete().eq('task_id', id);
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });

  await cleanupUploads(pathsToClean);
  res.json({ success: true });
});

// ========================
// MATERIALS
// ========================
app.get('/api/materials', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('materials').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map((m: any) => ({
    ...m, dateAdded: m.date_added, attachmentUrl: m.attachment_url, imageUrl: m.image_url
  })));
});

app.post('/api/materials', authenticate, requireKomti, multiUpload, async (req, res) => {
  const { title, course, url, type } = req.body;
  const missing = requireFields(req.body, ['title', 'course']);
  if (missing) return res.status(400).json({ error: missing });

  let payload: any = { title, course, url: url || null, type };
  const uploads = await processUploads(req.files);
  if (uploads.error) return res.status(400).json({ error: uploads.error });
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('materials').insert([payload]).select().single();
  if (error) {
    await cleanupUploads(uploads.uploadedPaths);
    return res.status(400).json({ error: error.message });
  }
  res.json({ ...data, dateAdded: data.date_added, attachmentUrl: data.attachment_url, imageUrl: data.image_url });
});

app.put('/api/materials/:id', authenticate, requireKomti, multiUpload, async (req, res) => {
  const { id } = req.params;
  const { title, course, url, type } = req.body;
  let payload: any = { title, course, url: url || null, type };

  const uploads = await processUploads(req.files);
  if (uploads.error) return res.status(400).json({ error: uploads.error });
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('materials').update(payload).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ...data, dateAdded: data.date_added, attachmentUrl: data.attachment_url, imageUrl: data.image_url });
});

app.delete('/api/materials/:id', authenticate, requireKomti, async (req, res) => {
  const { id } = req.params;

  const { data: mat } = await supabase.from('materials').select('image_url, attachment_url').eq('id', id).single();
  const pathsToClean: { bucket: string; path: string }[] = [];
  if (mat?.image_url) {
    const p = mat.image_url.match(/task_images\/public\/(.+)/);
    if (p) pathsToClean.push({ bucket: 'task_images', path: `public/${p[1]}` });
  }
  if (mat?.attachment_url) {
    const p = mat.attachment_url.match(/attachments\/public\/(.+)/);
    if (p) pathsToClean.push({ bucket: 'attachments', path: `public/${p[1]}` });
  }

  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  await cleanupUploads(pathsToClean);
  res.json({ success: true });
});

// ========================
// ANNOUNCEMENTS
// ========================
app.get('/api/announcements', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('announcements').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map((m: any) => ({ ...m, attachmentUrl: m.attachment_url, imageUrl: m.image_url })));
});

app.post('/api/announcements', authenticate, requireKomti, multiUpload, async (req, res) => {
  const { title, content, author, priority } = req.body;
  const missing = requireFields(req.body, ['title', 'content']);
  if (missing) return res.status(400).json({ error: missing });

  let payload: any = { title, content, author, priority };
  const uploads = await processUploads(req.files);
  if (uploads.error) return res.status(400).json({ error: uploads.error });
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('announcements').insert([payload]).select().single();
  if (error) {
    await cleanupUploads(uploads.uploadedPaths);
    return res.status(400).json({ error: error.message });
  }
  res.json({ ...data, attachmentUrl: data.attachment_url, imageUrl: data.image_url });
});

app.put('/api/announcements/:id', authenticate, requireKomti, multiUpload, async (req, res) => {
  const { id } = req.params;
  const { title, content, author, priority } = req.body;
  let payload: any = { title, content, author, priority };

  const uploads = await processUploads(req.files);
  if (uploads.error) return res.status(400).json({ error: uploads.error });
  if (uploads.imageUrl) payload.image_url = uploads.imageUrl;
  if (uploads.attachmentUrl) payload.attachment_url = uploads.attachmentUrl;

  const { data, error } = await supabase.from('announcements').update(payload).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ...data, attachmentUrl: data.attachment_url, imageUrl: data.image_url });
});

app.delete('/api/announcements/:id', authenticate, requireKomti, async (req, res) => {
  const { id } = req.params;

  const { data: ann } = await supabase.from('announcements').select('image_url, attachment_url').eq('id', id).single();
  const pathsToClean: { bucket: string; path: string }[] = [];
  if (ann?.image_url) {
    const p = ann.image_url.match(/task_images\/public\/(.+)/);
    if (p) pathsToClean.push({ bucket: 'task_images', path: `public/${p[1]}` });
  }
  if (ann?.attachment_url) {
    const p = ann.attachment_url.match(/attachments\/public\/(.+)/);
    if (p) pathsToClean.push({ bucket: 'attachments', path: `public/${p[1]}` });
  }

  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  await cleanupUploads(pathsToClean);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Backend Server running on http://localhost:${port}`);
});
