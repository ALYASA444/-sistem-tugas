# SAMPUL

**PANDUAN PENGGUNA (USER MANUAL)**
**SISTEM MANAJEMEN TUGAS DAN PEMBELAJARAN TERPADU**

Disusun Oleh: [Nama Mahasiswa / Analis Sistem]
Versi Dokumen: 1.0
Tanggal: 29 April 2026

---

# HALAMAN JUDUL

**PANDUAN PENGGUNA (USER MANUAL)**
**Sistem Manajemen Tugas Berbasis Web Terintegrasi**

Dokumen ini adalah panduan lengkap mengenai pedoman pengoperasian Sistem Manajemen Tugas. Panduan ini disusun menggunakan standar tata bahasa formal akademik agar setiap pengguna—baik Administrator (pengajar/dosen) maupun Siswa (mahasiswa)—dapat memahami instruksi sistem dan menggunakan prosedur fungsionalitas aplikasi ini secara optimal dan efisien.

---

# HALAMAN REVISI

| Versi | Tanggal | Deskripsi Perubahan | Direvisi Oleh |
| :--- | :--- | :--- | :--- |
| 1.0 | 29 April 2026 | Rilis Awal Panduan Pengguna | Analis Sistem |

---

# DAFTAR ISI 

- [BAB 1: PENDAHULUAN](#bab-1-pendahuluan)
  - [1.1 Tentang Aplikasi](#11-tentang-aplikasi)
  - [1.2 Tujuan Manual](#12-tujuan-manual)
  - [1.3 Prasyarat Sistem](#13-prasyarat-sistem)
- [BAB 2: MEMULAI CEPAT](#bab-2-memulai-cepat)
  - [2.1 Login Pertama Kali](#21-login-pertama-kali)
  - [2.2 Navigasi Dasar](#22-navigasi-dasar)
- [BAB 3: PANDUAN FITUR](#bab-3-panduan-fitur)
  - [3.1 Dashboard](#31-dashboard)
  - [3.2 Manajemen Data](#32-manajemen-data)
  - [3.3 Laporan](#33-laporan)
  - [3.4 Pengaturan](#34-pengaturan)
- [BAB 4: ADMINISTRASI](#bab-4-administrasi)
  - [4.1 Manajemen Pengguna](#41-manajemen-pengguna)
  - [4.2 Backup & Restore](#42-backup--restore)
- [BAB 5: TROUBLESHOOTING & FAQ](#bab-5-troubleshooting--faq)
  - [5.1 Troubleshooting](#51-troubleshooting)
  - [5.2 FAQ](#52-faq)
- [BAB 6: LAMPIRAN](#bab-6-lampiran)
  - [6.1 Glosarium](#61-glosarium)
  - [6.2 Kontak Dukungan](#62-kontak-dukungan)

---

# BAB 1: PENDAHULUAN

## 1.1 Tentang Aplikasi
Sistem Manajemen Tugas merupakan aplikasi berbasis web (*web-based application*) yang dirancang untuk memfasilitasi kegiatan evaluasi akademik dan pembelajaran secara daring. Melalui sistem ini, pengajar (Administrator) dapat menyebarkan pengumuman, membagikan materi pembelajaran, dan mendistribusikan penugasan. Sementara itu, siswa dapat menerima informasi, mengunduh rujukan materi, dan mengumpulkan tugasnya langsung melalui sistem. Aplikasi ini dirancang agar mudah digunakan, responsif, serta terlindungi karena didukung oleh infrastruktur basis data Supabase (termasuk penerapan keamanan baris data per pengguna atau *Row-Level Security*).

## 1.2 Tujuan Manual
Panduan operasional ini disusun sistematis dengan tujuan untuk:
1. Membantu pengguna dalam mengidentifikasi fungsi dan cara kerja setiap antarmuka pada aplikasi dengan jelas.
2. Memandu pengguna baru (baik pada struktur level Administrator maupun Siswa) agar dapat mempraktikkan pengoperasian sistem dengan lancar saat tahap adaptasi pertama kali.
3. Menjadi dokumen pelaporan resmi dan sumber rujukan apabila pengguna mengalami kendala teknis dalam masa operasional.

## 1.3 Prasyarat Sistem
Agar aplikasi beroperasi pada tingkatan yang optimal, pastikan ketersediaan perangkat memenuhi prasyarat berikut:
- **Perangkat Keras:** Komputer pribadi (PC), laptop, komputer tablet, atau ponsel pintar yang terkoneksi pada layanan jaringan internet yang stabil. Koneksi yang ajek sangat disarankan untuk mendukung stabilitas pengunggahan (*upload*) berkas tugas.
- **Sistem Operasi:** Aplikasi ini bersifat lintas-platform yang dapat diakses dari Windows, macOS, Linux, Android, maupun iOS.
- **Peramban Web (*Web Browser*):** Sangat direkomendasikan untuk menavigasikan aplikasi menggunakan versi peramban terbaru dari Google Chrome, Mozilla Firefox, Microsoft Edge, atau instalasi Safari.
- **Akun Pengguna:** Pengguna wajib memiliki otoritas penggunaan berupa Alamat Surat Elektronik (Email) dan Kata Sandi (*Password*) yang telah didaftarkan langsung oleh Administrator pada fase pertama peluncuran.

---

# BAB 2: MEMULAI CEPAT

## 2.1 Login Pertama Kali
Saat aplikasi ini dibuka untuk sesi log masuk, pengguna akan disajikan jendela Halaman Otentikasi. Berikut adalah tahapan prosedur yang berlaku:
1. Buka peramban jaringan (browser) pada perangkat, kemudian masukkan alamat tautan (*URL*) Sistem Manajemen Tugas.
2. Pada layar yang muncul, isi kolom **Email** dan penulisan **Kata Sandi (Password)** Anda secara presisi.
3. Klik tombol aksi berjudul **"Masuk / Login"**.
4. Apabila pencocokan rekam data divalidasi dengan berhasil, pengguna secara otomatis direstorasi menuju antarmuka Halaman Utama (*Dashboard*). Sistem dirancang agar dapat mengenali tingkat peran *(Role)* Anda, guna menyesuaikan visualisasi modul khusus otoritas Siswa ataupun khusus Administrator.

## 2.2 Navigasi Dasar
Arsitektur penataan letak antarmuka sistem dikonstruksi secermat mungkin mengikuti standarisasi tata kelola (*User Experience*):
- **Bilah Sisi Samping (Sidebar Kiri):** Menampilkan indeks permodulan halaman yang terdiri dari navigasi atas:
  - *Dashboard*: Beranda ringkasan pemantauan informasi.
  - *Announcements*: Papan modul khusus penyiaran pengumuman.
  - *Materials*: Direktori modul bagi ketersediaan bahan literasi berkas materi.
  - *Tasks*: Ruang eksekusi parameter evaluasi laporan tugas.
  - *Users*: Pusat pendataan kelengkapan akun pengguna (*Akses Modul Terbatas untuk Administrator*).
- **Bilah Header (Atas Kanan):** Menampilkan status eksistensi identitas sesi pengguna berjalan sekaligus menampung fungsi interaksi keluar aplikasi **Logout (Keluar)** yang mesti didahulukan begitu sesi telah berakhir agar privasi dan rekaman persisten data akademik terjaga.
- **Bilah Ruang Area Tengah:** Lokasi elemen kanvas fungsional menampilkan muatan halaman tabel aktif per harinya.

---

# BAB 3: PANDUAN FITUR

## 3.1 Dashboard
Fitur Dashboard memegang fungsi visualisasi agregasi rekaman evaluasi dari keseluruhan modul.
- **Tampilan Administrator:** Administrator dapat menghimpun statistik yang menyuguhkan jumlah persentase pengguna terdata aktif, agregat tugas terkumpul maupun persediaan publikasi, dan utamanya memuat metrik "*Status Kelas*". Hal ini mempermudah identifikasi komparatif jumlah murid yang disiplin mengumpulkan dokumen tugas sejalan terhadap murid yang belum berpartisipasi menurut agregat spesifik tertentu.
- **Tampilan Siswa:** Menjabarkan prioritas pemeringkatan kewajiban daftar tugas tenggat waktu (*deadline*), disuplai oleh peringatan rekam visual penyelesaian status yang terkategori Tuntas atau penanda Lalai. 

## 3.2 Manajemen Data
Ini adalah pengorganisasian lalu lintas modul krusial di instansi bersangkutan. Secara mendasar dibagikan atas tiga struktur:

### 3.2.1 Pengumuman (*Announcements*)
Modul tempat ditayangkannya informasi mutlak (*broadcasting*) ke seluruh lingkup pengabdi terdaftar.
- **Fungsi Administrator:** Tekan parameter *"Add"* (Tambah) > Masukkan entitas teks pada form Judul serta muatan rincian siaran isinya > Tekan tombol operasional *"Simpan"*. Pengumuman segera direplikasi merata di setiap antarmuka siswa.
- **Fungsi Siswa:** Akomodasi pengguna yang hanya berlisensi melihat tayangan terbaru secara berurutan sistematis (*Read-only*).

### 3.2.2 Materi Pelajaran (*Materials*)
Ruang kompilatif khusus pendistribusian diktat elektronik atau jurnal untuk pendalaman per kelas yang diadakan.
- **Fungsi Administrator:** Memperluas pengetikan poin pengingat dan berwewenang merangkaian tautan atau lampiran berkas dokumen silabus penunjangnya. 
- **Fungsi Siswa:** Mengeksplorasi lumbung direktori tabel material dan difasilitasi instruksi guna menyimpan salinan mandiri dengan model pengunduhan *(Download Process)*.

### 3.2.3 Tugas & Evaluasi (*Tasks*)
Fitur integral paling dominan bagi peningkatkan pertanggungjawaban peserta yang mengonverjensikan instruksi.
- **Fungsi Administrator:** Administrator meretas interaksi dengan menginisiasi opsi *Tambah Tugas*, berwajib melengkapi standar parameter percontohan deskriptif maupun pembatasan tempo waktu tenggat *(Due Date)*. Fitur juga mumpuni mengakomodasi rekayasa revisi *(Editing Update)* atau koreksi berkas jika menjumpai kelalaian eja sewaktu pembuatannya.
- **Fungsi Siswa:** Jika teralokasikan suatu penugasan tabel, modul di layar Siswa mengakomodasi antarmuka instruksi spesifik. Siswa perlu mendisposisikan hasil arsip kerjanya yang kemudian menekan parameter perintah *(Upload/Submit Task)* menuju pangkalan server *(storage server)* sebelum terdegradasi batas durasi yang diinstruksikan.

## 3.3 Laporan
Sistem didesain meluruhkan pekerjaan manual akumulasi pengawasan data secara drastis melalui sistem komputer terintegrasi:
- **Laporan Kepatuhan Pelaksanaan Dokumen:** Lewat panel penugasan, entitas Administrator dapat menelaah tingkat klasifikasi status pengumpulan dan secara komprehensif mengindentifikasi validasi *"Siapa Saja yang Telah atau Terlambat Menyerahkan Dokumen"* secara teliti dengan acuan akurasi catatan waktu *Time-stamp*.

## 3.4 Pengaturan
Sirkuit pengesahan otoritatif pada menu preferensi disiapkan secara struktural. 
- Diperuntukkan secara spesifik guna memungkinkan adaptasi setelan autentikasi kata sandi apabila proteksi sandi pengguna direduksi keabsahannya, memberikan ketahanan terhadap peretasan akses tak berizin (*Cybersecurity Layer*) untuk profilnya. 

---

# BAB 4: ADMINISTRASI

*(Bab ini eksklusif diperuntukkan pada pengotentikasian level otoritas Administrator yang terverifikasi)*

## 4.1 Manajemen Pengguna
Halaman ini (`Users.tsx`) merepresentasikan modul komando pengorganisasian inventaris data akun.
- **Penambahan Pemilik Akun (Registration):** Pengikutsertaan anggota diinstruksikan melalui *Form Add User*. Admin mengotorisasi atribut esensial (Surat Elektronik, Nama, dan pendistribusian sandi baku (*default password*)). Peran dispesifikasikan dalam lingkup entitas Admin maupun Siswa. 
- **Penyuntingan dan Dekonstruksi Informasi (Edit & Delete):** Mengizinkan modifikasi atas profil subjek pengguna apaila terindikasi *typo*. Bersamaan dengan eksistensi modul *Delete*, yang mencabut kepesertaan pengguna secara absolut disertai metode blokir dialog darurat sebelum tindakan final (*Validation Prompt*).

## 4.2 Backup & Restore (Penyimpanan Cadangan)
- **Modul Rekam Cadangan Persisten:** Integrasi basis data ditangani langsung oleh arsitektur internal layanan asinkron *Supabase*, memperkenankan replikasi data terlindung berjadwal pada struktur arsitektural peladen aslinya senantiasa terantisipasi, mengurangi kewajiban intervensi pencadangan instan.
- **Ekspor Dokumen Rekapitulasi Berjenjang:** Administrator pada setiap putaran periodiknya dihimbau secara akademis melakukan rekapan penilaian pengumpulan konvensional menjadi form lembar pencadangan independen pada arsip fasilitas lembaganya melalui parameter luaran ekspor.

---

# BAB 5: TROUBLESHOOTING & FAQ

## 5.1 Troubleshooting (Penyelesaian Kendala Gangguan)
Manakala menjumpai kendala pergeseran instruksional saat interaksi sesi kerja, pedoman diagnostik ringan berikut diterbitkan untuk kemudahan investigasi mandiri:

1. **Pertanda Kesalahan Notifikasi Berupa: "JSON Object Response" Saat Upaya Penyuntingan Deskripsi Tugas**
   - **Diagnostik Latar Belakang:** Ditemukan gangguan pada inkonsistensi pertukaran tanggapan antara program *Frontend Client* di komputansi terhadap peladen antarmuka API (*Application Programming Interface*) di *Backend Data*.
   - **Indikasi Resolusi:** Terapkan pemuatan ulang halaman secara utuh dengan metode segarkan aplikasi peramban (*Refresh / F5*). Jika malfungsi tidak pulih, rujuk masalah pada personil manajemen rekayasa teknis *(Developer)* bagi perbaikan struktur kebijakan asinkronasi (RLS).
   
2. **Gejala Kebertahanan Munculnya Entitas Tabel Daftar *"Tugas"* Sepaska Penindakan Modul "Hapus/Delete"**
   - **Diagnostik Latar Belakang:** Indikasi kendala interupsi sementara renderisasi atau penumpukan berkas residu transisi *(Cache Component/Data Context)* yang merintangi kebaruan representasi di antarmuka sistem. 
   - **Indikasi Resolusi:** Transisi/keluar secara manual ke halaman fitur material/menu sekunder lain, kemudian merestorasi peninjauan modul Tasks. Untuk persistensinya direkomendasi implementasi pelepasan sesi (Logout) dan penyempurnaan konektivitas masukan (Login) yang berdaya me-reset statusnya.
   
3. **Malfungsi Stagnasi atau Latensi pada Saat Memproses Unggahan Arsip Dokumen Hasil**
   - **Indikasi Resolusi:** Pastikan kelancaran pita lebar *(bandwidth)* infrastruktur nirkabel Anda terkualifikasi memadai. Kendati instrumen sistem dioptimasi mengompres formasi foto grafis otomatis, hindari alokasi ekseskusi data komputasi file bermuatan puluhan *Megabyte* berpotensi berimbas kehabisan toleransi server *(Timed-out Request)*.

## 5.2 FAQ (Frekuensi Pertanyaan yang Paling Diusulkan)
- **Q: Apakah konvensi format kepasitas instrumen tertentu diakui aplikasinya sewaktu dikumpul?**
  **A:** Ya, sistem diakomodasi pemrosesan fleksibilitas dokumen generik berupa entitas PDF maupun paket teks lainnya. Filter kompresi dirancang adaptif menghimpun dokumen sehingga mengonveksikan penyusutan tanpa menyedot ruang beban kapasitas basis data server berlebihan.
- **Q: Bagaimanakah perlakuan konsekuensi saat tenggat penyelesaian *Deadline* mutlak diabaikan?**
  **A:** Secara prosedural Siswa memperoleh kelonggaran menyerahkan dokumuntasinya, akan tetapi *System Application* mendokumentasikan log jam per serahan melalui penanda warna merah tegas dikategorikan penyerahan bersyarat "Terlambat (Late)". Bukti kedisiplinan dan transparansi laporan tersebut tertayang konsisten di otoritas pendidik (Admin) tanpa kompromi modifikasi siswa.

---

# BAB 6: LAMPIRAN

## 6.1 Glosarium
- **Dashboard:** Instrumen navigasi antarmuka perangkum laporan eksekutif statistik ketika interaksi *Login* diverifikasi sistem.
- **Real-Time:** Terminologi rekam transfer aktual pemrosesan waktu serempak berbanding lurus, tanpa selisih kelambatan antrian.  
- **CRUD (*Create, Read, Update, Delete*):** Kerangka parameter standar basis rekayasa instrumen lunak pada wewenang kompilatif terhadap berkas (*Pembuatan Form, Pembacaan Entitas, Pembaharuan Variabel, sampai Pehilangannya*).
- **RLS (*Row-Level Security*):** Infrastruktur kebijakan penjagaan peladen mematoki tiap *database* pengunci interupsi level kerentanan dari otoritas tak sah di antar-profilnya, memastikan penyegelan data rahasia individu di sistem secara teknikal komprehensif.
- **Supabase:** Korporasi penyokong arsitektural infrastruktur perihal utilitas relasi komprehensif peladen asinkronisasi pendukungnya (*Backend-as-a-Service*).

## 6.2 Kontak Dukungan Resmi
Demi mendistribusikan komunikasi eskalasi komplain bila ditemukan keterbatasan instruksional aplikasi pada pedoman manual termonitoring, korespondensi bantuan dipusatkan via kontak berikut:
- **Departemen:** Bagian Biro Sistem Informasi Teknologi Evaluasi Berbasis Web
- **Bantuan Virtual:** dukungan.sistem@sistemtugas.co.id
- **Telepon Darurat / WhatsApp Representatif:** (021) 12xxx / +62 811-xx11-xxxx
- **Masa Operasional Pelayanan Publik:** Senin - Jumat (08.00 s.d. 16.00 WIB)
