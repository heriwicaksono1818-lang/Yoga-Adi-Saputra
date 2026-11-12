# Laboratory Inventory & Borrowing Management System

Aplikasi web modern dan terintegrasi untuk mengelola inventaris peralatan laboratorium komputer serta pencatatan transaksi peminjaman dan pengembalian barang secara real-time. Dibangun khusus untuk memenuhi seluruh spesifikasi **Coding Talent Challenge**.

---

## 🌟 Ringkasan Proyek & Fitur Utama

Aplikasi ini mengimplementasikan **Role-Based Access Control (RBAC)** yang ketat pada sisi klien (*Protected Routes*) dan sisi basis data menggunakan **Supabase Row Level Security (RLS)** serta operasi atomik (*Stored Procedures / RPC*).

### 1. Modul Administrator (`/admin`)
- **Dashboard Statistik Real-time**: Menampilkan total jenis barang, total stok unit, barang tersedia, barang sedang dipinjam, total transaksi, transaksi aktif, transaksi selesai, dan tabel aktivitas sirkulasi terkini.
- **Katalog Inventaris & CRUD Barang**:
  - Penambahan peralatan baru dengan validasi kode barang unik dan stok non-negatif.
  - Perubahan metadata dan stok fisik barang.
  - Penghapusan barang yang diamankan dengan *Foreign Key Restriction* (barang dengan riwayat peminjaman aktif dilindungi).
  - Pencarian cepat dan filter kategori peralatan.
- **Manajemen Peminjaman & Pengembalian**: Memantau seluruh transaksi, memverifikasi barang kembali, dan memulihkan stok inventaris secara otomatis.
- **Manajemen Akun Asisten Staff**:
  - Pendaftaran staf baru (role terkunci otomatis sebagai `staff`).
  - Pengubahan status aktif / nonaktif staf. Staf nonaktif diblokir secara otomatis dari sistem.

### 2. Modul Asisten Staff (`/staff`)
- **Dashboard Personal**: Ringkasan barang tersedia, barang dipinjam, transaksi yang dicatat staf bersangkutan, dan aktivitas terkini.
- **Katalog Read-Only**: Pengecekan ketersediaan stok fisik tanpa akses manipulasi atau penghapusan.
- **Pencatatan Peminjaman**: Validasi stok mencukupi, pengurangan stok atomik, dan pencegahan stok negatif.
- **Proses Pengembalian**: Verifikasi pengembalian dengan tombol cepat, validasi jumlah kembali $\le$ jumlah pinjaman, dan status transaksi beralih ke `selesai`.
- **Riwayat Transaksi Pribadi**: Daftar arsip transaksi yang dicatat oleh staf yang sedang login.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework**: React 18 / 19
- **Build Tool**: Vite (Modular & Optimized Chunks)
- **Styling Engine**: Tailwind CSS + Modern Glassmorphism & Micro-animations
- **Routing**: React Router DOM v6 (Nested Layouts, Strict Protected Routes)
- **Icon Pack**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL 15+)
- **Autentikasi**: Supabase GoTrue Auth (Session Persistence)
- **Keamanan Data**: Supabase Row Level Security (RLS) & RPC Functions
- **Version Control**: Git & GitHub
- **Deployment Platform**: Vercel (disertai konfigurasi SPA rewrite `vercel.json`)

---

## 📁 Struktur Project

```text
CodingChallenge/
├── public/                     # Aset statis & favicon
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ConfirmModal.jsx    # Modal dialog konfirmasi modern
│   │   ├── Navbar.jsx          # Topbar responsif & info profil pengguna
│   │   ├── ProtectedRoute.jsx  # Route guard berbasis autentikasi & role
│   │   └── Sidebar.jsx         # Navigasi samping dinamis sesuai role
│   ├── context/
│   │   ├── AuthContext.jsx     # State manajemen autentikasi & profil Supabase
│   │   └── ToastContext.jsx    # Sistem notifikasi toast non-intrusif
│   ├── layouts/
│   │   ├── AdminLayout.jsx     # Shell tata letak khusus Administrator
│   │   └── StaffLayout.jsx     # Shell tata letak khusus Asisten Staff
│   ├── lib/
│   │   └── supabase.js         # Inisialisasi Supabase Client SDK
│   ├── pages/
│   │   ├── admin/              # Halaman Administrator
│   │   │   ├── barang/         # List, Tambah, dan Edit Barang
│   │   │   ├── staff/          # List, Tambah, dan Edit Status Staff
│   │   │   └── Dashboard.jsx   # Dashboard analitik Admin
│   │   ├── auth/
│   │   │   └── Login.jsx       # Halaman login resmi & tombol 1-Click Demo
│   │   ├── peminjaman/         # Modul transaksi peminjaman barang
│   │   ├── pengembalian/       # Modul pengembalian & pemulihan stok
│   │   └── staff/              # Halaman Asisten Staff
│   │       ├── barang/         # Katalog barang read-only
│   │       ├── riwayat/        # Riwayat transaksi personal
│   │       └── Dashboard.jsx   # Dashboard staf
│   ├── services/               # Abstraksi API & Business Logic Layer
│   │   ├── barangService.js
│   │   ├── dashboardService.js
│   │   ├── dataStore.js        # Seed data & fallback store
│   │   ├── peminjamanService.js
│   │   ├── pengembalianService.js
│   │   └── staffService.js
│   ├── App.jsx                 # Routing sentral aplikasi
│   ├── index.css               # Directives Tailwind CSS & custom styling
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

## ⚡ Panduan Menjalankan Project Secara Lokal

### 1. Prasyarat
- Node.js versi 18+ atau 22+
- NPM atau PNPM

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Catatan: Aplikasi tetap dapat diuji secara lokal menggunakan mode Sandbox / Demo Data bawaan apabila Supabase belum dikonfigurasikan).*

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada alamat: `http://localhost:3000`

### 5. Melakukan Build untuk Produksi
```bash
npm run build
```

---

## 🗄️ Konfigurasi Database Supabase

1. Buat project baru pada [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor** pada project Supabase Anda.
3. Buka file [`supabase/schema.sql`](file:///c:/Users/L/Desktop/CodingChallenge/supabase/schema.sql) dari repositori ini, salin seluruh isinya, tempel ke dalam SQL Editor, lalu tekan **Run**.
4. Skrip tersebut secara otomatis akan:
   - Membuat tabel `profiles`, `barang`, `peminjaman`, dan `pengembalian`.
   - Menyiapkan relasi *foreign key*, constraint stok non-negatif, dan trigger `updated_at`.
   - Mengaktifkan **Row Level Security (RLS)** dengan policy yang mengunci izin Staff dan memberi kuasa penuh kepada Admin.
   - Membuat *Stored Procedure* (`proses_peminjaman` dan `proses_pengembalian`) untuk menjamin transaksi stok bebas dari *race condition*.
   - Memasukkan data awal inventaris wajib:
     - `BR001` - Laptop Lenovo (Stok: 5)
     - `BR002` - Mouse Logitech (Stok: 10)
     - `BR003` - Keyboard Mechanical (Stok: 8)
     - `BR004` - Proyektor Epson (Stok: 3)
     - `BR005` - Monitor LG (Stok: 6)

---

## 🔐 Akun Demo untuk Pengujian

Aplikasi dilengkapi dengan tombol akses cepat 1-Click pada halaman login untuk memudahkan penguji:

| Role | Alamat Email | Password Demo | Hak Akses |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin.demo@example.com` | `Demo123!` | Akses penuh dashboard, kelola barang, kelola staff, transaksi |
| **STAFF** | `staff.demo@example.com` | `Demo123!` | Dashboard staf, cek stok barang, catat pinjam & kembali |

> [!NOTE]
> Untuk menambahkan akun pada Supabase Auth di lingkungan *live*:
> Buat user di Supabase Dashboard -> **Authentication** -> **Users** -> **Add User**, lalu masukkan profil di tabel `profiles` dengan role yang sesuai (`admin` atau `staff`).

---

## 🚀 Panduan Deployment ke Vercel

1. Buat repository baru di **GitHub** (misalnya `lab-inventory-system`).
2. Hubungkan folder project lokal dan lakukan push ke GitHub:
   ```bash
   git add .
   git commit -m "feat: complete laboratory inventory and borrowing management system"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```
3. Buka dashboard [Vercel](https://vercel.com) dan pilih **Add New Project**.
4. Import repository GitHub yang baru saja dibuat.
5. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
6. Klik tombol **Deploy**.
7. File [`vercel.json`](file:///c:/Users/L/Desktop/CodingChallenge/vercel.json) yang telah disediakan akan menangani SPA rewrite otomatis agar halaman tidak mengalami error 404 saat pengguna melakukan refresh rute.

---

## 🌐 URL Aplikasi Setelah Deployment

- **Production URL**: `https://your-app-name.vercel.app` *(Dapat disesuaikan setelah deploy)*
- **Repository GitHub**: `https://github.com/USERNAME/lab-inventory-system`

---

## ✅ Checklist Pengumpulan (Coding Talent Challenge)

- [x] Tech Stack: React + Vite + Tailwind CSS + Supabase
- [x] Dual-Role terverifikasi: **Admin** & **Staff**
- [x] Role-Based Access Control (Protected routes & database RLS)
- [x] Autentikasi Supabase Auth & Session persistence
- [x] Skema database: `profiles`, `barang`, `peminjaman`, `pengembalian`
- [x] Aturan stok atomik: peminjaman mengurangi stok, pengembalian memulihkan stok
- [x] Validasi stok non-negatif & pencegahan peminjaman melebihi stok
- [x] Seed data awal lengkap (`BR001` - `BR005`)
- [x] Admin Dashboard (7+ kartu metrik analitik & tabel aktivitas)
- [x] Staff Dashboard (metrik personal & riwayat transaksi staf)
- [x] CRUD barang lengkap dengan validasi kode unik
- [x] Modul Peminjaman & Pengembalian dengan notifikasi toast dan status `selesai`
- [x] Manajemen staf (tambah staf, kunci role staff, aktif/nonaktifkan)
- [x] Responsive layout (Desktop, Tablet, Mobile)
- [x] `.env.example` tersedia dan `.env` terisolasi di `.gitignore`
- [x] Konfigurasi SPA Vercel (`vercel.json`) bebas error 404 saat refresh
- [x] Akun demo siap uji (`admin.demo@example.com` & `staff.demo@example.com`)
