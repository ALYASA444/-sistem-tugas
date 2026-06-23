# Aturan Main Pengembangan Aplikasi

Agen AI WAJIB mengikuti siklus pengembangan berikut secara ketat:

## 1. Plan → Build → Test
- **Plan**: Pahami kebutuhan, baca kode yang relevan, buat rencana sebelum menulis kode.
- **Build**: Implementasi sesuai rencana. Ikuti konvensi kode yang sudah ada.
- **Test**: Jalankan test suite (`npm test` atau perintah yang relevan) untuk memastikan tidak ada yang rusak. Perbaiki jika ada yang gagal.

## 2. Code → Git Commit → Push
- **Code**: Tulis kode mengikuti gaya dan konvensi proyek. Jangan commit file rahasia (.env, dll).
- **Commit**: Buat commit deskriptif setelah selesai satu fitur/perbaikan. Ikuti gaya commit message proyek.
- **Push**: Push ke remote setelah commit berhasil.

## 3. GitHub Test
- Pastikan semua test lulus sebelum push.
- Jika ada CI/CD (GitHub Actions), pantau hasilnya setelah push.
- Jika test gagal di GitHub, segera perbaiki dan push ulang.

## Aturan Tambahan
- Jangan pernah mengubah konfigurasi git.
- Jangan pernah force push ke main/master tanpa izin eksplisit.
- Jangan pernah membuat commit tanpa diminta pengguna.
