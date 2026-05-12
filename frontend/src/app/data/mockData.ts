import { Task, Announcement, Material, User } from '../types';

export const initialUsers: User[] = [
  {
    id: 'u1',
    name: 'Budi Santoso',
    nim: '2201010101',
    role: 'mahasiswa',
    email: 'budi@student.univ.edu'
  },
  {
    id: 'u2',
    name: 'Siti Aminah',
    nim: '2201010102',
    role: 'mahasiswa',
    email: 'siti@student.univ.edu'
  },
  {
    id: 'u3',
    name: 'Admin Kelas',
    nim: '2201010000',
    role: 'komti',
    email: 'admin@student.univ.edu'
  }
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Tugas Makalah Basis Data',
    course: 'Basis Data',
    description: 'Buatlah makalah tentang Normalisasi Database hingga bentuk 3NF, sertakan dengan contoh kasus nyata.',
    deadline: '2026-04-10T23:59:00',
    requiresSubmission: true,
    status: 'pending',
    submissionUrl: 'https://drive.google.com/drive/folders/contoh-folder-tugas-basis-data',
    imageUrl: 'https://images.unsplash.com/photo-1619296330981-b882d7e93425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3NpZ25tZW50JTIwbGFwdG9wfGVufDF8fHx8MTc3NTU3MjY3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 't2',
    title: 'Latihan Soal Aljabar Linear',
    course: 'Aljabar Linear',
    description: 'Kerjakan soal latihan di buku bab 4 nomor 1-10.',
    deadline: '2026-04-08T12:00:00',
    requiresSubmission: false,
    status: 'pending',
    attachmentUrl: 'Latihan-Bab4.pdf',
  },
  {
    id: 't3',
    title: 'Proyek Akhir Pemrograman Web',
    course: 'Pemrograman Web',
    description: 'Kumpulkan link repository dan link deployment aplikasi akhir kelompok Anda.',
    deadline: '2026-04-20T23:59:00',
    requiresSubmission: true,
    status: 'pending',
    submissionUrl: 'https://forms.gle/contoh-link-pengumpulan-proyek',
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Kelas Pengganti Jaringan Komputer',
    content: 'Kelas Jarkom hari rabu ditiadakan dan diganti menjadi hari kamis jam 14.00 di Ruang 304.',
    author: 'Komti',
    date: '2026-04-06T09:00:00',
    priority: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tfGVufDF8fHx8MTc3NTU3MjY3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 'a2',
    title: 'Pembayaran Uang Kas Kelas',
    content: 'Mengingatkan kembali untuk teman-teman agar melunasi uang kas kelas bulan ini.',
    author: 'Bendahara',
    date: '2026-04-05T15:30:00',
    priority: 'normal',
  }
];

export const initialMaterials: Material[] = [
  {
    id: 'm1',
    title: 'Slide Pertemuan 5 - Rekayasa Perangkat Lunak',
    course: 'Rekayasa Perangkat Lunak',
    url: 'https://example.com/rpl-5',
    dateAdded: '2026-04-05T10:00:00',
    type: 'pdf',
    imageUrl: 'https://images.unsplash.com/photo-1761319115499-872737b89e44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMG1hdGVyaWFsc3xlbnwxfHx8fDE3NzU1NzI2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 'm2',
    title: 'Tutorial Instalasi Docker',
    course: 'Pemrograman Web',
    url: 'https://example.com/docker-tutor',
    dateAdded: '2026-04-04T08:15:00',
    type: 'video',
  }
];
