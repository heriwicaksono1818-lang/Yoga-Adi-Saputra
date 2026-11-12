Anda adalah AI Software Engineer yang bertugas membantu saya membangun aplikasi web untuk Coding Talent Challenge.

Baca dan ikuti seluruh requirement berikut. Jangan mengurangi fitur wajib. Bangun aplikasi secara bertahap, rapi, aman, mudah dipelihara, dan siap di-deploy secara online.

==================================================
PROJECT
==================================================

Nama aplikasi:

Laboratory Inventory & Borrowing Management System

Tujuan:

Membangun aplikasi web untuk mengelola inventaris barang laboratorium komputer dan transaksi peminjaman serta pengembalian barang secara digital.

Aplikasi wajib dapat digunakan secara online dan bukan hanya berjalan di localhost.

==================================================
TEKNOLOGI YANG DIGUNAKAN
==================================================

Gunakan:

- React
- Vite
- JavaScript
- CSS modern atau Tailwind CSS
- Supabase sebagai database PostgreSQL
- Supabase Authentication untuk login
- Supabase Row Level Security (RLS) untuk keamanan akses data
- Git untuk version control
- GitHub sebagai repository
- Vercel untuk deployment

Jangan menggunakan database lokal sebagai database utama.

Semua data utama aplikasi harus tersimpan di Supabase.

==================================================
ROLE PENGGUNA
==================================================

Aplikasi memiliki tepat dua role utama:

1. ADMIN
2. STAFF

ADMIN memiliki akses:

- Login
- Logout
- Dashboard
- Melihat seluruh aktivitas
- Tambah barang
- Edit barang
- Hapus barang
- Pencarian barang
- Melihat seluruh transaksi
- Melihat seluruh Staff
- Menambah akun Staff
- Mengubah data Staff
- Mengaktifkan/menonaktifkan Staff
- Melihat riwayat peminjaman
- Melihat riwayat pengembalian

STAFF memiliki akses:

- Login
- Logout
- Dashboard Staff
- Melihat daftar barang
- Melihat stok
- Mencatat peminjaman
- Mencatat pengembalian
- Melihat transaksi yang relevan
- Melihat riwayat transaksi

STAFF TIDAK BOLEH:

- Menghapus barang
- Mengelola akun pengguna
- Mengakses halaman Admin
- Mengubah role pengguna
- Mengakses pengaturan Admin

Gunakan role-based access control.

Jangan hanya menyembunyikan menu di frontend. Gunakan Supabase RLS untuk memastikan user tidak dapat mengakses data yang tidak sesuai dengan role.

==================================================
FITUR AUTHENTICATION
==================================================

Implementasikan:

- Login email/password menggunakan Supabase Auth
- Logout
- Session persistence
- Protected routes
- Redirect user yang belum login ke halaman login
- Redirect user berdasarkan role
- Admin hanya dapat membuka halaman Admin
- Staff hanya dapat membuka halaman Staff
- Handle loading session
- Handle authentication error
- Jangan menyimpan password sendiri di database
- Gunakan Supabase Auth untuk password

Jangan membuat sistem password custom.

==================================================
DATABASE SUPABASE
==================================================

Buat database PostgreSQL di Supabase.

Minimal gunakan tabel:

1. profiles
2. barang
3. peminjaman
4. pengembalian

Rancang database dengan relasi yang jelas.

Tabel profiles minimal:

- id
- nama
- email
- role
- status
- created_at
- updated_at

role hanya boleh:

- admin
- staff

status dapat digunakan untuk:

- aktif
- nonaktif

Tabel barang minimal:

- id
- kode_barang
- nama_barang
- kategori
- stok
- created_at
- updated_at

kode_barang harus unik.

stok tidak boleh bernilai negatif.

Tabel peminjaman minimal:

- id
- nama_peminjam
- barang_id
- jumlah
- tanggal_peminjaman
- status
- created_by
- created_at
- updated_at

Status minimal:

- dipinjam
- selesai

Tabel pengembalian minimal:

- id
- peminjaman_id
- jumlah_dikembalikan
- tanggal_pengembalian
- created_by
- created_at

Gunakan foreign key dengan benar.

==================================================
ATURAN STOK
==================================================

Ketika barang dipinjam:

stok barang berkurang sesuai jumlah yang dipinjam.

Contoh:

Stok awal = 10

Dipinjam = 3

Stok menjadi = 7

Jika jumlah yang dipinjam lebih besar dari stok tersedia, transaksi harus ditolak.

Jangan pernah membuat stok menjadi negatif.

Ketika barang dikembalikan:

stok barang bertambah sesuai jumlah yang dikembalikan.

Contoh:

Stok = 7

Dikembalikan = 3

Stok menjadi = 10

Setelah pengembalian berhasil, status peminjaman menjadi:

selesai

Pastikan operasi perubahan stok aman dan tidak menyebabkan data tidak konsisten.

==================================================
DATA AWAL
==================================================

Masukkan minimal data berikut:

BR001 | Laptop Lenovo | stok 5
BR002 | Mouse Logitech | stok 10
BR003 | Keyboard Mechanical | stok 8
BR004 | Proyektor Epson | stok 3
BR005 | Monitor LG | stok 6

Tambahkan beberapa kategori yang sesuai.

Jangan mengubah kode barang tersebut.

==================================================
DASHBOARD
==================================================

Admin Dashboard harus menampilkan:

- Total Barang
- Total Stok
- Barang Tersedia
- Barang Sedang Dipinjam
- Total Transaksi
- Transaksi Aktif
- Transaksi Selesai
- Aktivitas Terbaru

Staff Dashboard minimal menampilkan:

- Total Barang
- Barang Tersedia
- Barang Dipinjam
- Transaksi Saya
- Transaksi Aktif
- Aktivitas terbaru yang relevan

Gunakan card statistik yang modern.

Tambahkan tabel aktivitas/transaksi terbaru.

==================================================
HALAMAN YANG HARUS DIBUAT
==================================================

PUBLIC:

/login

ADMIN:

/admin
/admin/barang
/admin/barang/tambah
/admin/barang/edit/:id
/admin/peminjaman
/admin/pengembalian
/admin/staff
/admin/staff/tambah
/admin/staff/edit/:id

STAFF:

/staff
/staff/barang
/staff/peminjaman
/staff/pengembalian
/staff/riwayat

Jika struktur routing yang lebih baik diperlukan, boleh gunakan struktur yang lebih rapi selama seluruh fitur tetap tersedia.

==================================================
MANAJEMEN BARANG
==================================================

Admin dapat:

- melihat barang
- menambah barang
- mengedit barang
- menghapus barang
- mencari barang
- melihat stok
- melihat kategori

Form barang:

- kode barang
- nama barang
- kategori
- stok

Validasi:

- kode wajib diisi
- kode tidak boleh duplikat
- nama wajib diisi
- kategori wajib diisi
- stok harus angka
- stok tidak boleh negatif

Staff hanya dapat melihat data barang dan stok.

Staff tidak boleh menghapus atau mengedit barang.

==================================================
PEMINJAMAN
==================================================

Admin dan Staff dapat membuat transaksi peminjaman.

Form:

- nama peminjam
- barang
- jumlah
- tanggal peminjaman

Validasi:

- nama wajib diisi
- barang wajib dipilih
- jumlah harus lebih dari 0
- jumlah tidak boleh melebihi stok
- tanggal wajib diisi

Ketika transaksi berhasil:

- simpan transaksi
- kurangi stok
- status = dipinjam

Tampilkan notifikasi berhasil/gagal.

==================================================
PENGEMBALIAN
==================================================

Admin dan Staff dapat melihat transaksi yang masih dipinjam.

Sediakan tombol:

"Kembalikan"

Form pengembalian:

- jumlah dikembalikan
- tanggal pengembalian

Validasi:

- jumlah > 0
- jumlah tidak boleh melebihi jumlah yang masih dipinjam

Setelah pengembalian:

- stok bertambah
- status transaksi menjadi selesai
- data pengembalian tersimpan
- transaksi tidak boleh diproses kembali jika sudah selesai

==================================================
MANAJEMEN STAFF
==================================================

Hanya Admin.

Admin dapat:

- melihat Staff
- menambah Staff
- mengubah data Staff
- mengaktifkan Staff
- menonaktifkan Staff

Data Staff:

- nama
- email
- role
- status

Role Staff harus otomatis:

staff

Jangan memberikan kemampuan kepada Staff untuk mengubah role dirinya sendiri.

==================================================
UI/UX
==================================================

Buat desain modern, profesional, dan cocok untuk aplikasi laboratorium komputer.

Gunakan layout:

- Sidebar
- Topbar
- Dashboard
- Card statistik
- Tabel data
- Form modern
- Modal konfirmasi
- Toast notification

Responsive untuk:

- desktop
- tablet
- mobile

Gunakan warna yang profesional dan konsisten.

Tampilkan nama aplikasi:

Laboratory Inventory & Borrowing Management System

Sediakan:

- loading state
- empty state
- error state
- success notification
- confirmation sebelum delete

Jangan menggunakan alert browser jika dapat menggunakan modal/toast yang lebih baik.

==================================================
KEAMANAN SUPABASE
==================================================

Ini sangat penting.

Implementasikan Row Level Security.

Pastikan:

Admin dapat mengelola data sesuai hak Admin.

Staff hanya dapat melakukan operasi yang memang diizinkan.

Staff tidak dapat:

- menghapus barang
- mengelola profiles pengguna lain
- mengubah role
- membaca data sensitif yang tidak diperlukan

Jangan menaruh Supabase service role key di frontend.

Frontend hanya boleh menggunakan Supabase anon/publishable key yang aman untuk client-side sesuai konfigurasi Supabase.

Gunakan environment variable:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Jangan commit file .env ke GitHub.

Buat .env.example.

==================================================
STRUKTUR PROJECT
==================================================

Buat struktur project yang rapi, contohnya:

src/
├── components/
├── pages/
│   ├── auth/
│   ├── admin/
│   └── staff/
├── layouts/
├── lib/
│   └── supabase.js
├── services/
├── hooks/
├── utils/
├── App.jsx
└── main.jsx

Boleh menyesuaikan struktur jika ada alasan teknis yang lebih baik.

Pisahkan:

- UI
- routing
- authentication
- database query
- reusable components

Jangan menaruh semua kode di satu file.

==================================================
VALIDASI
==================================================

Tambahkan validasi frontend dan database jika diperlukan.

Tangani:

- data kosong
- duplicate kode
- stok negatif
- jumlah peminjaman melebihi stok
- jumlah pengembalian melebihi pinjaman
- user tidak memiliki akses
- session expired
- error Supabase
- network error

Tampilkan pesan error yang mudah dipahami pengguna.

==================================================
GITHUB
==================================================

Siapkan project agar mudah dimasukkan ke GitHub.

Buat:

.gitignore

Pastikan file berikut tidak masuk GitHub:

.env
node_modules
dist

Buat README.md yang berisi:

- nama project
- deskripsi
- teknologi
- fitur
- struktur project
- cara menjalankan project
- konfigurasi Supabase
- environment variables
- cara deployment
- akun demo
- URL aplikasi setelah deployment

Jangan menaruh password asli di source code.

==================================================
DEPLOYMENT
==================================================

Aplikasi wajib dapat berjalan online.

Gunakan Vercel.

Pastikan:

- build berhasil
- environment variable sudah dikonfigurasi
- Supabase URL benar
- Supabase key benar
- routing React tidak menyebabkan 404 saat refresh
- login berjalan di production
- database production terhubung
- aplikasi dapat diakses melalui URL publik

Setelah deployment, lakukan pengecekan:

1. buka halaman login
2. login Admin
3. buka dashboard Admin
4. tambah barang
5. edit barang
6. hapus barang
7. login Staff
8. cek batas akses Staff
9. buat peminjaman
10. cek stok berkurang
11. proses pengembalian
12. cek stok bertambah
13. cek status transaksi menjadi selesai

==================================================
AKUN DEMO
==================================================

Siapkan dua akun untuk pengujian:

ADMIN:
email: admin.demo@example.com
password: buat password demo yang aman

STAFF:
email: staff.demo@example.com
password: buat password demo yang aman

Jangan hardcode password ke source code.

Jika sistem Supabase membutuhkan pembuatan akun melalui Supabase Auth, jelaskan langkah pembuatannya.

==================================================
ATURAN KERJA AI AGENT
==================================================

Jangan langsung mengubah banyak file tanpa menjelaskan pekerjaan.

Kerjakan project secara bertahap:

TAHAP 1:
Analisis requirement dan rancang arsitektur.

TAHAP 2:
Buat project React + Vite.

TAHAP 3:
Install dependency yang diperlukan.

TAHAP 4:
Konfigurasi Supabase.

TAHAP 5:
Buat database schema dan SQL migration.

TAHAP 6:
Buat authentication dan role.

TAHAP 7:
Buat layout dan routing.

TAHAP 8:
Buat Admin Dashboard.

TAHAP 9:
Buat Staff Dashboard.

TAHAP 10:
Buat CRUD barang.

TAHAP 11:
Buat peminjaman.

TAHAP 12:
Buat pengembalian.

TAHAP 13:
Buat manajemen Staff.

TAHAP 14:
Implementasikan RLS dan security.

TAHAP 15:
Testing seluruh fitur.

TAHAP 16:
Perbaiki bug.

TAHAP 17:
Siapkan GitHub.

TAHAP 18:
Deploy ke Vercel.

TAHAP 19:
Testing production.

TAHAP 20:
Buat README dan checklist pengumpulan.

Setelah setiap tahap selesai:

- jelaskan file yang dibuat/diubah
- jelaskan fungsi perubahan
- tampilkan command yang harus saya jalankan jika diperlukan
- beritahu apakah saya perlu melakukan konfigurasi manual
- jangan melanjutkan ke tahap berikutnya jika ada error yang harus saya perbaiki terlebih dahulu

==================================================
ATURAN PENTING
==================================================

Jangan menghapus file project saya tanpa alasan.

Sebelum mengubah konfigurasi penting, periksa kondisi project saat ini.

Jika menemukan error, jelaskan penyebab dan solusi.

Jangan mengarang nama tabel, kolom, environment variable, atau API yang tidak tersedia.

Jika ada keputusan teknis yang belum ditentukan, gunakan pilihan yang paling sederhana, aman, dan cocok untuk tugas mahasiswa.

Prioritaskan aplikasi yang:

- berfungsi
- mudah dipahami
- mudah dipresentasikan
- aman
- responsive
- dapat di-deploy
- memenuhi seluruh requirement Coding Talent Challenge

Mulai dari TAHAP 1.

Jangan langsung membuat seluruh aplikasi sekaligus.

Pertama tampilkan analisis requirement, arsitektur yang akan digunakan, struktur database Supabase, hubungan antar tabel, dan rencana pengerjaan.