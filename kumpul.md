# FORMULIR PENGUMPULAN TUGAS
## Coding Talent Challenge — Laboratory Inventory & Borrowing Management System

Kepada Yth.  
**Dosen Pembimbing: Ari Muzakir, S.Kom., M.Cs.**

Berikut adalah data kelengkapan pengumpulan tugas proyek pengembangan aplikasi web:

---

### 1. Identitas Mahasiswa
- **Nama Lengkap**: Yoga Adi Saputra
- **NIM**: 241420023

---

### 2. Tautan Proyek (Live & Repositori)
- **URL Aplikasi (Sudah Di-hosting)**:  
  👉 [https://laboratorium-inventory-sistem.vercel.app](https://laboratorium-inventory-sistem.vercel.app)
- **URL Repository GitHub**:  
  👉 [https://github.com/heriwicaksono1818-lang/Yoga-Adi-Saputra](https://github.com/heriwicaksono1818-lang/Yoga-Adi-Saputra)

---

### 3. Akun Pengujian Demo (Tersedia Tombol 1-Click Login pada Halaman /login)

#### A. Akun ADMIN (Akses Penuh):
- **Email / Username**: `admin.demo@example.com`
- **Password**: `Demo123!`
- **Hak Akses**: Dashboard analitik, CRUD inventaris barang, kelola akun staff, toggle status aktif/nonaktif, pantau seluruh transaksi peminjaman & pengembalian.

#### B. Akun STAFF (Akses Terbatas / Operasional):
- **Email / Username**: `staff.demo@example.com`
- **Password**: `Demo123!`
- **Hak Akses**: Dashboard staf, melihat katalog stok barang (Read-Only), mencatat peminjaman barang, memproses pengembalian barang, dan melihat riwayat transaksi pribadi.

---

### 4. Teknologi yang Digunakan
1. **Frontend**: React 18, Vite, JavaScript (ES Modules)
2. **Styling & UI**: Tailwind CSS, Lucide React Icons, Custom Modal Dialog, Toast Notifications
3. **Routing & Keamanan Klien**: React Router DOM v6 (Strict Role-Based Protected Routes)
4. **Backend & Database**: Supabase PostgreSQL 15+
5. **Autentikasi**: Supabase GoTrue Authentication (Session Persistence)
6. **Keamanan Basis Data**: Supabase Row Level Security (RLS) & Stored Procedures / RPC (Operasi atomik pengurangan & penambahan stok)
7. **Version Control**: Git & GitHub
8. **Cloud Hosting**: Vercel (disertai konfigurasi `vercel.json` SPA rewrite pencegah error 404 saat refresh)

---

### 5. Ringkasan Fitur Unggulan
- [x] **Role-Based Access Control (RBAC)** ketat pada sisi frontend dan database PostgreSQL.
- [x] **Integritas Stok Atomik**: Stok berkurang saat dipinjam, bertambah saat dikembalikan, dan validasi pencegahan stok bernilai negatif.
- [x] **5 Data Awal Inventaris Lengkap** (`BR001` Laptop Lenovo, `BR002` Mouse, `BR003` Keyboard, `BR004` Proyektor, `BR005` Monitor).
- [x] **Desain Modern & Responsif**: Berjalan mulus di perangkat Desktop, Tablet, dan Smartphone.
- [x] **Koneksi Database Live**: Seluruh perubahan data langsung tersimpan secara *real-time* di Supabase Cloud.

