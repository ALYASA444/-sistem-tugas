import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Pastikan membaca .env di folder tempat script ini dijalankan
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; 

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
    console.error('ERROR: Anda belum mengisi SUPABASE_URL atau SUPABASE_SERVICE_KEY yang valid di file .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  // Karena form frontend meminta "Username/NIM", kita akan buat 'admin' sebagai username
  // dan diakali dengan dummy domain agar lolos validasi Email Supabase
  const dummyEmail = 'admin@sistemtugas.com';
  const password = 'AdminPassword123!';
  const nim = 'admin';

  console.log('Memulai proses pembuatan akun Komti (Admin)...');
  
  // 1. Buat User di Supabase Auth
  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email: dummyEmail,
    password: password,
    email_confirm: true
  });

  if (authError) {
    console.error('Gagal membuat user Auth:', authError.message);
    return;
  }

  const userId = user.user.id;
  console.log('✓ Akun sandi/SSO berhasil dikaitkan. User ID:', userId);

  // 2. Buat relasi Profile
  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: userId,
      full_name: 'Administrator (Komti)',
      nim: nim,
      role: 'komti'
    }
  ]);

  if (profileError) {
    console.error('✕ Gagal menyuntikkan peran profil (Pastikan tabel profiles & RLS sudah Anda Apply di Supabase):', profileError.message);
  } else {
    console.log('\n=======================================');
    console.log('✓ BERHASIL! Akun Administrator Diciptakan');
    console.log('=======================================');
    console.log('Anda bisa login ke aplikasi Anda dengan:');
    console.log('Username / NIM : admin');
    console.log('Kata Sandi     : AdminPassword123!');
    console.log('=======================================\n');
  }
}

createAdmin();
