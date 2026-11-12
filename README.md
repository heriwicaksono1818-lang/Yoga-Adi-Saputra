# Laboratory Inventory & Borrowing Management System
### *Coding Talent Challenge Submission*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

Aplikasi web modern dan responsif untuk manajemen inventaris perangkat laboratorium komputer serta pencatatan transaksi peminjaman dan pengembalian barang secara digital dan *real-time*. Proyek ini dirancang secara modular, aman (*Row Level Security*), memiliki operasi atomik pada pergerakan stok barang, dan siap dideploy secara online.

---

## 📌 Informasi Pengumpulan Tugas

- **Nama Peserta**: Yoga Adi Saputra
- **Nama Aplikasi**: Laboratory Inventory & Borrowing Management System
- **Repositori GitHub**: [https://github.com/heriwicaksono1818-lang/Yoga-Adi-Saputra](https://github.com/heriwicaksono1818-lang/Yoga-Adi-Saputra)
- **Deployment URL**: [https://yoga-adi-saputra.vercel.app](https://yoga-adi-saputra.vercel.app)
- **Database**: Supabase PostgreSQL (`zcuybstjppqjanctstkl.supabase.co`)

---

## 🚀 Fitur Utama Berdasarkan Role

Sistem mengimplementasikan **Role-Based Access Control (RBAC)** ketat baik pada sisi navigasi frontend (*Protected Routes*) maupun sisi basis data (*Supabase Row Level Security*).

### 1. Modul Administrator (`/admin`)
- **Dashboard Eksekutif**:
  - Metrik statistik: Total Jenis Barang, Total Stok Fisik, Barang Tersedia, Barang Sedang Dipinjam, Total Transaksi, Transaksi Aktif, dan Transaksi Selesai.
  - Tabel aktivitas & transaksi terkini secara langsung.
- **Katalog & Manajemen Barang (Full CRUD)**:
  - Tambah barang baru (validasi kode barang unik, nama, kategori, stok $\ge 0$).
  - Ubah metadata barang dan penyesuaian stok.
  - Hapus barang dengan proteksi relasi (*Foreign Key Restriction*).
  - Pencarian *live* berdasarkan nama/kode dan filter kategori.
- **Pusat Sirkulasi Peminjaman & Pengembalian**:
  - Melihat riwayat transaksi seluruh staf/mahasiswa.
  - Memverifikasi pengembalian dan pemulihan stok otomatis.
- **Manajemen Akun Asisten Staff**:
  - Menambah akun staf baru (role terkunci otomatis sebagai `staff`).
  - Mengubah data staf dan toggle status keaktifan (`aktif` / `nonaktif`). Staf nonaktif otomatis diblokir saat login.

### 2. Modul Asisten Staff (`/staff`)
- **Dashboard Staf**:
  - Metrik ringkas: Total Barang, Barang Tersedia, Unit Dipinjam, dan Transaksi Saya.
  - Tabel aktivitas peminjaman personal.
- **Katalog Barang (Read-Only)**:
  - Cek ketersediaan stok lab tanpa izin mengubah atau menghapus data.
- **Pencatatan Peminjaman**:
  - Formulir peminjaman dengan validasi stok mencukupi (stok dilarang negatif).
  - Pengurangan stok secara atomik (*Stored Procedure / RPC*).
- **Proses Pengembalian Barang**:
  - Tombol cepat *"Kembalikan"* pada transaksi aktif.
  - Validasi jumlah kembali $\le$ jumlah pinjaman.
  - Status peminjaman otomatis beralih menjadi `selesai`.
- **Riwayat Transaksi**:
  - Arsip seluruh catatan transaksi yang diproses oleh staf yang bersangkutan.

---

## 📦 Data Awal Inventaris Laboratorium (Wajib)

Data awal telah terintegrasi di skrip SQL migrasi dan penyimpanan lokal:

| Kode Barang | Nama Barang | Kategori | Stok Awal | Status |
| :---: | :--- | :--- | :---: | :---: |
| **BR001** | Laptop Lenovo | Laptop | **5** unit | Tersedia |
| **BR002** | Mouse Logitech | Aksesoris | **10** unit | Tersedia |
| **BR003** | Keyboard Mechanical | Aksesoris | **8** unit | Tersedia |
| **BR004** | Proyektor Epson | Multimedia | **3** unit | Tersedia |
| **BR005** | Monitor LG | Periferal | **6** unit | Tersedia |

---

## 🔐 Akun Demo untuk Pengujian Cepat

Pada halaman login (`/login`), tersedia **tombol 1-Click Demo** untuk pengujian langsung tanpa perlu mengetik manual:

| Role Akun | Alamat Email | Kata Sandi Demo | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin.demo@example.com` | `Demo123!` | Akses penuh (Dashboard Admin, CRUD barang, manajemen staff, transaksi) |
| **STAFF** | `staff.demo@example.com` | `Demo123!` | Akses terbatas (Dashboard Staff, katalog read-only, catat pinjam, pengembalian) |

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend**: React 18 / 19, JavaScript (ES Modules), Vite Bundler
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **UI Components & Icons**: Lucide React, Glassmorphism, Micro-interactions, Modal konfirmasi kustom, Toast notifications
- **Routing**: React Router DOM v6 (Strict Role Guard & Nested Layouts)
- **Database**: Supabase PostgreSQL 15+
- **Autentikasi**: Supabase GoTrue Auth (Email & Password, Session Persistence)
- **Keamanan Data**: Supabase Row Level Security (RLS) & Atomic RPC Functions
- **Deployment**: Vercel dengan konfigurasi SPA Rewrite (`vercel.json`) bebas error 404 saat refresh

---

## 📂 Struktur Direktori Proyek

```text
CodingChallenge/
├── public/                     # Aset statis dan ikon favicon
├── src/
│   ├── components/             # Komponen UI reusable
│   │   ├── ConfirmModal.jsx    # Modal dialog konfirmasi tindakan destruktif
│   │   ├── Navbar.jsx          # Topbar navigasi & info profil pengguna
│   │   ├── ProtectedRoute.jsx  # Route guard berbasis autentikasi & role
│   │   └── Sidebar.jsx         # Navigasi samping dinamis sesuai role
│   ├── context/
│   │   ├── AuthContext.jsx     # State manajemen autentikasi & profil pengguna
│   │   └── ToastContext.jsx    # Sistem notifikasi toast non-intrusif
│   ├── layouts/
│   │   ├── AdminLayout.jsx     # Shell tata letak khusus Administrator
│   │   └── StaffLayout.jsx     # Shell tata letak khusus Asisten Staff
│   ├── lib/
│   │   └── supabase.js         # Inisialisasi Supabase Client SDK
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── barang/         # List, Tambah, dan Edit Barang (Admin)
│   │   │   ├── staff/          # List, Tambah, dan Edit Status Staff (Admin)
│   │   │   └── Dashboard.jsx   # Dashboard analitik Administrator
│   │   ├── auth/
│   │   │   └── Login.jsx       # Halaman login resmi & tombol 1-Click Demo
│   │   ├── peminjaman/
│   │   │   └── PeminjamanPage.jsx # Modul transaksi peminjaman alat
│   │   ├── pengembalian/
│   │   │   └── PengembalianPage.jsx # Modul pengembalian & pemulihan stok
│   │   └── staff/
│   │       ├── barang/         # Katalog barang read-only (Staff)
│   │       ├── riwayat/        # Riwayat transaksi personal staf
│   │       └── Dashboard.jsx   # Dashboard Asisten Staff
│   ├── services/               # Abstraksi API & Business Logic Layer
│   │   ├── barangService.js    # Layanan CRUD data barang
│   │   ├── dashboardService.js # Agregasi metrik analitik dashboard
│   │   ├── dataStore.js        # Penyimpanan data awal & fallback sandbox
│   │   ├── peminjamanService.js# Transaksi peminjaman dan pengurangan stok
│   │   ├── pengembalianService.js # Transaksi pengembalian dan penambahan stok
│   │   └── staffService.js     # Manajemen akun dan status staf
│   ├── App.jsx                 # Routing sentral aplikasi
│   ├── index.css               # Directives Tailwind CSS & styling kustom
│   └── main.jsx                # React DOM entry point
├── supabase/
│   └── schema.sql              # Skrip migrasi DDL, RLS, Trigger, RPC, & Data Awal
├── .env.example                # Panduan variabel lingkungan
├── .gitignore                  # Filter keamanan repository Git
├── index.html                  # Dokumen HTML utama
├── package.json                # Daftar dependensi & scripts
├── postcss.config.js           # Konfigurasi PostCSS
├── tailwind.config.js          # Konfigurasi tema Tailwind CSS
├── vercel.json                 # Aturan SPA routing Vercel
└── vite.config.js              # Konfigurasi Vite & code-splitting
```

---

## ⚡ Panduan Menjalankan di Komputer Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/heriwicaksono1818-lang/Yoga-Adi-Saputra.git
cd Yoga-Adi-Saputra
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi File Environment
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel dengan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://zcuybstjppqjanctstkl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_u0R9yEBX3JtmDw0tnBSUOw_JKfzYODa
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka peramban pada alamat: **`http://localhost:3000`**

### 5. Build untuk Produksi
```bash
npm run build
```

---

## 🗄️ Panduan Inisialisasi Database Supabase

1. Buka [Supabase Dashboard](https://supabase.com).
2. Masuk ke proyek Anda, lalu pilih menu **SQL Editor**.
3. Buka file [`supabase/schema.sql`](supabase/schema.sql), salin seluruh isinya, tempel ke dalam SQL Editor Supabase, lalu tekan tombol **Run**.
4. Skrip secara otomatis akan menyiapkan:
   - Tabel `profiles`, `barang`, `peminjaman`, dan `pengembalian`.
   - *Foreign Key* dan *Constraint* (`stok >= 0`, `jumlah > 0`).
   - Trigger otomatis `handle_new_user` untuk sinkronisasi `auth.users` ke `public.profiles`.
   - *Stored Procedures (RPC)* `proses_peminjaman` dan `proses_pengembalian` (transaksi aman dari *race condition*).
   - Seluruh kebijakan **Row Level Security (RLS)** untuk Admin dan Staff.
   - 5 Data awal inventaris wajib (`BR001` - `BR005`).

---

## 🚀 Panduan Deployment ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com) dan hubungkan akun GitHub Anda.
2. Klik **Add New Project** $\rightarrow$ **Import** repository `heriwicaksono1818-lang/Yoga-Adi-Saputra`.
3. Pada menu konfigurasi **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` : `https://zcuybstjppqjanctstkl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` : `sb_publishable_u0R9yEBX3JtmDw0tnBSUOw_JKfzYODa`
4. Klik tombol **Deploy**.
5. File [`vercel.json`](vercel.json) di repositori akan otomatis menangani penulisan ulang rute (*SPA rewrites*) sehingga rute `/admin`, `/staff`, atau `/login` dapat di-refresh langsung tanpa kendala error 404.

---

## ✅ Checklist Pemenuhan Kriteria Tugas (Coding Talent Challenge)

- [x] **Tech Stack Sesuai**: React + Vite + Tailwind CSS + Supabase PostgreSQL + Git + Vercel
- [x] **Dua Role Utama Terimplementasi**: **ADMIN** & **STAFF**
- [x] **Role-Based Access Control**: Protected routes pada frontend dan RLS pada database Supabase
- [x] **Supabase Authentication**: Login email & password, session persistence, logout
- [x] **Pencegahan Akses Ilegal**: Staff tidak dapat mengakses rute admin, mengubah role, atau menghapus barang
- [x] **Skema Basis Data Lengkap**: Tabel `profiles`, `barang`, `peminjaman`, `pengembalian`
- [x] **Integritas Aturan Stok**:
  - Peminjaman otomatis mengurangi stok barang
  - Pengembalian otomatis menambah stok barang
  - Status peminjaman beralih menjadi `selesai`
  - Validasi stok non-negatif dan penolakan transaksi jika jumlah $\gt$ stok tersedia
- [x] **5 Data Awal Inventaris Lengkap**: `BR001` s/d `BR005`
- [x] **Dashboard Administrator**: 7 kartu metrik analitik lengkap & tabel aktivitas terkini
- [x] **Dashboard Asisten Staff**: Metrik barang, transaksi personal, dan aktivitas staf
- [x] **Manajemen Barang (CRUD)**: Tambah, edit, hapus (dengan konfirmasi modal), dan pencarian/filter
- [x] **Manajemen Akun Staff**: Tambah akun staff, kunci role otomatis `staff`, toggle status aktif/nonaktif
- [x] **UI/UX Modern**: Desain bersih, Sidebar, Topbar, Card statistik, Modal dialog, Toast responsif
- [x] **Keamanan Kredensial**: `.env` terabaikan di Git, hanya publishable/anon key yang digunakan di frontend
- [x] **Akun Demo Cepat**: Tombol 1-Click Demo untuk Admin dan Staff di halaman login
- [x] **Dokumentasi Lengkap**: File `README.md` terstruktur rapi untuk kemudahan evaluasi penguji
