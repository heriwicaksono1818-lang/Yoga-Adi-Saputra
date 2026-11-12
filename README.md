# Laboratory Inventory & Borrowing Management System
### Tugas Proyek Pengembangan Aplikasi Web — Coding Talent Challenge

---

## 🎓 Identitas Mahasiswa & Dosen Pembimbing

| Informasi | Keterangan |
| :--- | :--- |
| **Nama Mahasiswa** | **Yoga Adi Saputra** |
| **NIM** | **241420023** |
| **Dosen Pembimbing** | **Ari Muzakir, S.Kom., M.Cs.** |
| **Repositori GitHub** | [https://github.com/heriwicaksono1818-lang/Yoga-Adi-Saputra](https://github.com/heriwicaksono1818-lang/Yoga-Adi-Saputra) |
| **Aplikasi Live (Vercel)** | [https://yoga-adi-saputra.vercel.app](https://yoga-adi-saputra.vercel.app) |
| **Database Cloud** | Supabase PostgreSQL (`zcuybstjppqjanctstkl.supabase.co`) |

---

## 📌 Ringkasan Proyek

Aplikasi web untuk mengelola inventaris perangkat laboratorium komputer dan sirkulasi transaksi peminjaman serta pengembalian barang secara digital. Sistem dibangun menggunakan arsitektur **Role-Based Access Control (RBAC)** dan transaksi stok atomik berbasis **Supabase PostgreSQL**.

### 🛠️ Tech Stack Utama:
- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL 15+, GoTrue Auth, Row Level Security)
- **Deployment**: Vercel (disertai konfigurasi `vercel.json` SPA rewrite)

---

## 🔐 Akun Demo untuk Pengujian Cepat

Pada halaman login (`/login`), tersedia tombol **1-Click Akses Cepat** untuk memudahkan penguji:

| Role Akun | Email Demo | Password Demo | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin.demo@example.com` | `Demo123!` | Akses penuh: Dashboard analitik, CRUD barang, manajemen akun staff, pantau seluruh transaksi |
| **STAFF** | `staff.demo@example.com` | `Demo123!` | Akses operasional: Cek stok (read-only), catat peminjaman, proses pengembalian, riwayat pribadi |

> **Catatan Keamanan (RBAC)**: Staf diblokir dari halaman admin, tidak dapat mengedit/menghapus barang, dan tidak dapat mengubah hak akses.

---

## 📦 Data Awal Inventaris Laboratorium (Wajib)

Data awal telah terisi dan aktif di database Supabase:

| Kode Barang | Nama Barang | Kategori | Stok Awal | Status |
| :---: | :--- | :--- | :---: | :---: |
| **BR001** | Laptop Lenovo | Laptop | **5** unit | Tersedia |
| **BR002** | Mouse Logitech | Aksesoris | **10** unit | Tersedia |
| **BR003** | Keyboard Mechanical | Aksesoris | **8** unit | Tersedia |
| **BR004** | Proyektor Epson | Multimedia | **3** unit | Tersedia |
| **BR005** | Monitor LG | Periferal | **6** unit | Tersedia |

---

## ⚙️ Aturan Bisnis & Logika Stok Atomik

1. **Peminjaman Barang**:
   - Stok barang otomatis berkurang saat transaksi berhasil dicatat.
   - Sistem menolak transaksi jika jumlah diminta $>$ stok tersedia. Stok tidak pernah bernilai negatif.
2. **Pengembalian Barang**:
   - Hanya transaksi berstatus `dipinjam` yang dapat diproses.
   - Stok barang otomatis bertambah kembali sesuai jumlah yang dikembalikan.
   - Status peminjaman otomatis beralih menjadi `selesai`.

---

## 💻 Panduan Menjalankan Secara Lokal

```bash
# 1. Clone repositori
git clone https://github.com/heriwicaksono1818-lang/Yoga-Adi-Saputra.git
cd Yoga-Adi-Saputra

# 2. Instal dependensi
npm install

# 3. Jalankan server lokal
npm run dev
```
Buka browser pada: **`http://localhost:3000`**

### Variabel Lingkungan (`.env`):
```env
VITE_SUPABASE_URL=https://zcuybstjppqjanctstkl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_u0R9yEBX3JtmDw0tnBSUOw_JKfzYODa
```

---

## 🗄️ Skema Database Supabase (`supabase/schema.sql`)

Struktur 4 tabel utama:
1. `profiles`: Relasi 1-to-1 dengan Supabase Auth (`id`, `nama`, `email`, `role`, `status`).
2. `barang`: Data inventaris (`id`, `kode_barang UNIQUE`, `nama_barang`, `kategori`, `stok >= 0`).
3. `peminjaman`: Transaksi peminjaman (`id`, `nama_peminjam`, `barang_id`, `jumlah`, `status`, `created_by`).
4. `pengembalian`: Transaksi pengembalian (`id`, `peminjaman_id`, `jumlah_dikembalikan`, `created_by`).
- Dilengkapi Stored Procedure / RPC (`proses_peminjaman`, `proses_pengembalian`) dan Row Level Security (RLS).

---

## ✅ Checklist Pemenuhan Kriteria Tugas

- [x] Tech Stack: React + Vite + Tailwind CSS + Supabase PostgreSQL
- [x] Dua Role Terpisah: **ADMIN** dan **STAFF** (Protected Routes & RLS)
- [x] Autentikasi Supabase Auth & Session Persistence
- [x] CRUD Barang lengkap dengan validasi kode unik & stok non-negatif
- [x] Transaksi Peminjaman (stok berkurang otomatis)
- [x] Transaksi Pengembalian (stok bertambah & status `selesai`)
- [x] Manajemen Akun Staff (tambah staf, kunci role `staff`, toggle status aktif/nonaktif)
- [x] 5 Data Awal Inventaris Lengkap (`BR001` - `BR005`)
- [x] UI/UX Responsif (Desktop, Tablet, Mobile) dengan Dashboard metrik
- [x] Penanganan Error & Notifikasi Toast modern
- [x] File sensitif `.env` terlindungi di `.gitignore`
- [x] Konfigurasi Vercel SPA (`vercel.json`) pencegah error 404 saat refresh
- [x] Siap diuji online dan terintegrasi dengan database cloud Supabase
