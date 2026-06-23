# SistemKelas — Task Management System

Aplikasi manajemen tugas dan pembelajaran terpadu berbasis web. Memfasilitasi pengajar (Komti) dalam membagikan tugas, materi, dan pengumuman, serta memantau status pengumpulan mahasiswa secara real-time.

## Fitur

- **Dashboard** — Ringkasan statistik tugas aktif, pengumuman terbaru, dan materi kuliah
- **Manajemen Tugas** — Buat, edit, hapus tugas dengan deadline, lampiran gambar/PDF, dan tautan pengumpulan
- **Pelacakan Status** — Mahasiswa menandai selesai, Komti melihat progress kelas
- **Materi Kuliah** — Unggah PDF, tautan video, atau URL referensi
- **Pengumuman** — Siarkan informasi dengan prioritas (rendah/normal/tinggi)
- **Manajemen Pengguna** — CRUD mahasiswa & admin (khusus Komti)
- **Upload File** — Kompresi gambar otomatis (>1MB di-compress), lampiran PDF
- **Autentikasi** — Login via NIM atau email dengan Supabase Auth
- **Session Persistence** — Status login tersimpan di localStorage

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, Radix UI |
| Backend | Express.js, TypeScript, tsx |
| Database | PostgreSQL via Supabase |
| Storage | Supabase Storage (gambar + PDF) |
| Auth | Supabase Auth (email/password) |
| Testing | Vitest, Testing Library |

## Prerequisites

- Node.js 18.x / 20.x
- npm
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

## Instalasi

```bash
# Clone repository
git clone https://github.com/ALYASA444/-sistem-tugas.git
cd -sistem-tugas

# Install dependencies backend
cd backend
npm install

# Install dependencies frontend
cd ../frontend
npm install
```

## Konfigurasi

### 1. Supabase Setup

Buat project di [Supabase Dashboard](https://supabase.com/dashboard), lalu:

1. **SQL Editor** → Jalankan migrasi dari folder `supabase/migrations/` secara berurutan:
   - `0001_initial_schema.sql`
   - `0002_rest_of_schema.sql`
   - `0003_pdf_schema.sql`
   - `0004_task_submissions.sql`

2. **Storage** — Dua bucket akan otomatis terbuat:
   - `task_images` — untuk gambar tugas/materi/pengumuman
   - `attachments` — untuk file PDF

### 2. Environment Variables

Salin `.env.example` menjadi `.env` di folder `backend/`:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=3000
```

### 3. Create Admin Account

```bash
cd backend
npx tsx src/createAdmin.ts
```

Login: **admin** / **AdminPassword123!**

## Menjalankan Aplikasi

```bash
# Backend (port 3000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

Buka `http://localhost:5173` di browser.

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Build frontend
cd frontend
npm run build
```

## Struktur Project

```
.
├── .github/workflows/    # CI/CD pipeline
├── backend/
│   ├── src/
│   │   ├── server.ts         # Express API (auth, CRUD)
│   │   ├── createAdmin.ts    # Seed admin account
│   │   └── server.test.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # HTTP client services
│   │   ├── app/
│   │   │   ├── components/   # UI & form modals
│   │   │   ├── context/      # RoleContext, DataContext
│   │   │   ├── pages/        # Dashboard, Tasks, Materials, dll
│   │   │   ├── types.ts      # TypeScript interfaces
│   │   │   └── App.tsx
│   │   ├── styles/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── supabase/migrations/      # Database schema
├── Panduan_Pengguna.md       # User manual (Bahasa Indonesia)
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| POST | `/api/login` | ❌ | — | Login (rate-limited) |
| GET | `/api/health` | ❌ | — | Health check |
| GET | `/api/users` | ✅ | All | Daftar pengguna |
| POST | `/api/users` | ✅ | Komti | Tambah pengguna |
| PUT | `/api/users/:id` | ✅ | Komti | Edit pengguna |
| DELETE | `/api/users/:id` | ✅ | Komti | Hapus pengguna |
| GET | `/api/tasks` | ✅ | All | Daftar tugas (dengan status) |
| POST | `/api/tasks` | ✅ | Komti | Buat tugas |
| PUT | `/api/tasks/:id` | ✅ | Komti | Edit tugas |
| DELETE | `/api/tasks/:id` | ✅ | Komti | Hapus tugas |
| POST | `/api/tasks/:id/submit` | ✅ | All | Tandai selesai/batal |
| GET | `/api/materials` | ✅ | All | Daftar materi |
| POST | `/api/materials` | ✅ | Komti | Tambah materi |
| PUT | `/api/materials/:id` | ✅ | Komti | Edit materi |
| DELETE | `/api/materials/:id` | ✅ | Komti | Hapus materi |
| GET | `/api/announcements` | ✅ | All | Daftar pengumuman |
| POST | `/api/announcements` | ✅ | Komti | Buat pengumuman |
| PUT | `/api/announcements/:id` | ✅ | Komti | Edit pengumuman |
| DELETE | `/api/announcements/:id` | ✅ | Komti | Hapus pengumuman |

## Lisensi

Project ini dikembangkan untuk keperluan akademik.
