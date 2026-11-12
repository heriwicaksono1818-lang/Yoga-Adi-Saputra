-- ==============================================================================
-- DATABASE SCHEMA: Laboratory Inventory & Borrowing Management System
-- Supabase PostgreSQL Migration Script
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: PROFILES
-- Menyimpan informasi tambahan pengguna yang berelasi 1-to-1 dengan auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL: BARANG
-- Menyimpan daftar inventaris laboratorium
CREATE TABLE IF NOT EXISTS public.barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_barang VARCHAR(50) NOT NULL UNIQUE,
    nama_barang VARCHAR(255) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    stok INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL: PEMINJAMAN
-- Mencatat transaksi peminjaman barang
CREATE TABLE IF NOT EXISTS public.peminjaman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_peminjam VARCHAR(255) NOT NULL,
    barang_id UUID NOT NULL REFERENCES public.barang(id) ON DELETE RESTRICT,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    tanggal_peminjaman DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'dipinjam' CHECK (status IN ('dipinjam', 'selesai')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL: PENGEMBALIAN
-- Mencatat pengembalian barang yang telah dipinjam
CREATE TABLE IF NOT EXISTS public.pengembalian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    peminjaman_id UUID NOT NULL REFERENCES public.peminjaman(id) ON DELETE RESTRICT,
    jumlah_dikembalikan INTEGER NOT NULL CHECK (jumlah_dikembalikan > 0),
    tanggal_pengembalian DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. INDEXES UNTUK PERFORMA QUERY
CREATE INDEX IF NOT EXISTS idx_barang_kode ON public.barang(kode_barang);
CREATE INDEX IF NOT EXISTS idx_barang_kategori ON public.barang(kategori);
CREATE INDEX IF NOT EXISTS idx_peminjaman_barang ON public.peminjaman(barang_id);
CREATE INDEX IF NOT EXISTS idx_peminjaman_status ON public.peminjaman(status);
CREATE INDEX IF NOT EXISTS idx_peminjaman_created_by ON public.peminjaman(created_by);
CREATE INDEX IF NOT EXISTS idx_pengembalian_peminjaman ON public.pengembalian(peminjaman_id);

-- 7. FUNCTION: AUTO UPDATE updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_barang_updated_at ON public.barang;
CREATE TRIGGER set_barang_updated_at
    BEFORE UPDATE ON public.barang
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_peminjaman_updated_at ON public.peminjaman;
CREATE TRIGGER set_peminjaman_updated_at
    BEFORE UPDATE ON public.peminjaman
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. FUNCTION: AUTO CREATE PROFILE DARI AUTH.USERS SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nama, email, role, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
        'aktif'
    )
    ON CONFLICT (id) DO UPDATE
    SET nama = EXCLUDED.nama,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. STORED PROCEDURES (RPC) UNTUK TRANSAKSI ATOMIK BEBAS RACE CONDITION

-- RPC: PINJAM BARANG
CREATE OR REPLACE FUNCTION public.proses_peminjaman(
    p_nama_peminjam VARCHAR,
    p_barang_id UUID,
    p_jumlah INTEGER,
    p_tanggal_peminjaman DATE,
    p_created_by UUID
)
RETURNS JSONB AS $$
DECLARE
    v_stok_tersedia INTEGER;
    v_peminjaman_id UUID;
    v_result JSONB;
BEGIN
    -- Validasi jumlah
    IF p_jumlah <= 0 THEN
        RAISE EXCEPTION 'Jumlah peminjaman harus lebih besar dari 0';
    END IF;

    -- Lock baris barang untuk update (mencegah race condition)
    SELECT stok INTO v_stok_tersedia
    FROM public.barang
    WHERE id = p_barang_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Barang dengan ID tersebut tidak ditemukan';
    END IF;

    -- Validasi stok mencukupi
    IF v_stok_tersedia < p_jumlah THEN
        RAISE EXCEPTION 'Stok tidak mencukupi. Stok tersedia: %, diminta: %', v_stok_tersedia, p_jumlah;
    END IF;

    -- Kurangi stok barang
    UPDATE public.barang
    SET stok = stok - p_jumlah
    WHERE id = p_barang_id;

    -- Buat record transaksi peminjaman
    INSERT INTO public.peminjaman (
        nama_peminjam,
        barang_id,
        jumlah,
        tanggal_peminjaman,
        status,
        created_by
    )
    VALUES (
        p_nama_peminjam,
        p_barang_id,
        p_jumlah,
        p_tanggal_peminjaman,
        'dipinjam',
        p_created_by
    )
    RETURNING id INTO v_peminjaman_id;

    SELECT jsonb_build_object(
        'success', true,
        'peminjaman_id', v_peminjaman_id,
        'sisa_stok', v_stok_tersedia - p_jumlah
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: PENGEMBALIAN BARANG
CREATE OR REPLACE FUNCTION public.proses_pengembalian(
    p_peminjaman_id UUID,
    p_jumlah_dikembalikan INTEGER,
    p_tanggal_pengembalian DATE,
    p_created_by UUID
)
RETURNS JSONB AS $$
DECLARE
    v_peminjaman RECORD;
    v_pengembalian_id UUID;
    v_result JSONB;
BEGIN
    -- Validasi jumlah
    IF p_jumlah_dikembalikan <= 0 THEN
        RAISE EXCEPTION 'Jumlah pengembalian harus lebih besar dari 0';
    END IF;

    -- Lock dan ambil data peminjaman
    SELECT * INTO v_peminjaman
    FROM public.peminjaman
    WHERE id = p_peminjaman_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaksi peminjaman tidak ditemukan';
    END IF;

    IF v_peminjaman.status = 'selesai' THEN
        RAISE EXCEPTION 'Transaksi peminjaman ini sudah selesai dikembalikan sebelumnya';
    END IF;

    IF p_jumlah_dikembalikan > v_peminjaman.jumlah THEN
        RAISE EXCEPTION 'Jumlah yang dikembalikan (%) melebihi jumlah pinjaman (%)', p_jumlah_dikembalikan, v_peminjaman.jumlah;
    END IF;

    -- Kembalikan stok ke barang
    UPDATE public.barang
    SET stok = stok + p_jumlah_dikembalikan
    WHERE id = v_peminjaman.barang_id;

    -- Update status peminjaman menjadi selesai
    UPDATE public.peminjaman
    SET status = 'selesai'
    WHERE id = p_peminjaman_id;

    -- Catat data pengembalian
    INSERT INTO public.pengembalian (
        peminjaman_id,
        jumlah_dikembalikan,
        tanggal_pengembalian,
        created_by
    )
    VALUES (
        p_peminjaman_id,
        p_jumlah_dikembalikan,
        p_tanggal_pengembalian,
        p_created_by
    )
    RETURNING id INTO v_pengembalian_id;

    SELECT jsonb_build_object(
        'success', true,
        'pengembalian_id', v_pengembalian_id,
        'status', 'selesai'
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peminjaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengembalian ENABLE ROW LEVEL SECURITY;

-- Helper function: cek apakah user saat ini adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND status = 'aktif'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: cek apakah user aktif
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND status = 'aktif'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES: PROFILES
-- Semua user yang login dapat membaca profiles (diperlukan untuk relasi nama peminjam/staf)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Hanya Admin yang boleh insert/update/delete profiles (manajemen staff)
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin() OR auth.uid() = id)
    WITH CHECK (public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- POLICIES: BARANG
-- Semua user aktif (Admin & Staff) dapat melihat barang
DROP POLICY IF EXISTS "Active users can view barang" ON public.barang;
CREATE POLICY "Active users can view barang"
    ON public.barang FOR SELECT
    TO authenticated
    USING (public.is_active_user());

-- Hanya Admin yang boleh tambah, edit, dan hapus barang
DROP POLICY IF EXISTS "Admins can insert barang" ON public.barang;
CREATE POLICY "Admins can insert barang"
    ON public.barang FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update barang" ON public.barang;
CREATE POLICY "Admins can update barang"
    ON public.barang FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete barang" ON public.barang;
CREATE POLICY "Admins can delete barang"
    ON public.barang FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- POLICIES: PEMINJAMAN
-- Admin & Staff aktif dapat melihat peminjaman
DROP POLICY IF EXISTS "Active users can view peminjaman" ON public.peminjaman;
CREATE POLICY "Active users can view peminjaman"
    ON public.peminjaman FOR SELECT
    TO authenticated
    USING (public.is_active_user());

-- Admin & Staff aktif dapat membuat transaksi peminjaman
DROP POLICY IF EXISTS "Active users can insert peminjaman" ON public.peminjaman;
CREATE POLICY "Active users can insert peminjaman"
    ON public.peminjaman FOR INSERT
    TO authenticated
    WITH CHECK (public.is_active_user() AND auth.uid() = created_by);

-- Update peminjaman (misal status jadi selesai) via Admin atau RPC
DROP POLICY IF EXISTS "Active users can update peminjaman" ON public.peminjaman;
CREATE POLICY "Active users can update peminjaman"
    ON public.peminjaman FOR UPDATE
    TO authenticated
    USING (public.is_active_user());

-- POLICIES: PENGEMBALIAN
-- Admin & Staff aktif dapat melihat data pengembalian
DROP POLICY IF EXISTS "Active users can view pengembalian" ON public.pengembalian;
CREATE POLICY "Active users can view pengembalian"
    ON public.pengembalian FOR SELECT
    TO authenticated
    USING (public.is_active_user());

-- Admin & Staff aktif dapat mencatat pengembalian
DROP POLICY IF EXISTS "Active users can insert pengembalian" ON public.pengembalian;
CREATE POLICY "Active users can insert pengembalian"
    ON public.pengembalian FOR INSERT
    TO authenticated
    WITH CHECK (public.is_active_user() AND auth.uid() = created_by);

-- 11. DATA AWAL (SEED DATA WAJIB)
INSERT INTO public.barang (kode_barang, nama_barang, kategori, stok)
VALUES
    ('BR001', 'Laptop Lenovo', 'Laptop', 5),
    ('BR002', 'Mouse Logitech', 'Aksesoris', 10),
    ('BR003', 'Keyboard Mechanical', 'Aksesoris', 8),
    ('BR004', 'Proyektor Epson', 'Multimedia', 3),
    ('BR005', 'Monitor LG', 'Periferal', 6)
ON CONFLICT (kode_barang) DO UPDATE
SET nama_barang = EXCLUDED.nama_barang,
    kategori = EXCLUDED.kategori,
    stok = EXCLUDED.stok;

-- ==============================================================================
-- SELESAI
-- Jalankan skrip ini pada Supabase SQL Editor:
-- Supabase Dashboard -> Project Anda -> SQL Editor -> New Query -> Run
-- ==============================================================================
