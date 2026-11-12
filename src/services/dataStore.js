// Penyimpanan data lokal untuk inisialisasi awal dan mode pengujian demo offline

const INITIAL_BARANG = [
  { id: 'b1-uuid-001', kode_barang: 'BR001', nama_barang: 'Laptop Lenovo', kategori: 'Laptop', stok: 5, created_at: new Date().toISOString() },
  { id: 'b2-uuid-002', kode_barang: 'BR002', nama_barang: 'Mouse Logitech', kategori: 'Aksesoris', stok: 10, created_at: new Date().toISOString() },
  { id: 'b3-uuid-003', kode_barang: 'BR003', nama_barang: 'Keyboard Mechanical', kategori: 'Aksesoris', stok: 8, created_at: new Date().toISOString() },
  { id: 'b4-uuid-004', kode_barang: 'BR004', nama_barang: 'Proyektor Epson', kategori: 'Multimedia', stok: 3, created_at: new Date().toISOString() },
  { id: 'b5-uuid-005', kode_barang: 'BR005', nama_barang: 'Monitor LG', kategori: 'Periferal', stok: 6, created_at: new Date().toISOString() },
]

const INITIAL_STAFF = [
  { id: 'demo-admin-uuid-001', nama: 'Administrator Laboratorium', email: 'admin.demo@example.com', role: 'admin', status: 'aktif', created_at: new Date().toISOString() },
  { id: 'demo-staff-uuid-002', nama: 'Staff Asisten Lab', email: 'staff.demo@example.com', role: 'staff', status: 'aktif', created_at: new Date().toISOString() },
  { id: 'staff-uuid-003', nama: 'Budi Santoso', email: 'budi.lab@example.com', role: 'staff', status: 'aktif', created_at: new Date().toISOString() },
  { id: 'staff-uuid-004', nama: 'Siti Rahma', email: 'siti.lab@example.com', role: 'staff', status: 'nonaktif', created_at: new Date().toISOString() },
]

const INITIAL_PEMINJAMAN = [
  {
    id: 'pem-001',
    nama_peminjam: 'Ahmad Fauzi (Mahasiswa TI)',
    barang_id: 'b1-uuid-001',
    jumlah: 1,
    tanggal_peminjaman: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    status: 'dipinjam',
    created_by: 'demo-staff-uuid-002',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    barang: INITIAL_BARANG[0],
    profile: INITIAL_STAFF[1],
  },
  {
    id: 'pem-002',
    nama_peminjam: 'Dewi Lestari (Dosen Jarkom)',
    barang_id: 'b4-uuid-004',
    jumlah: 1,
    tanggal_peminjaman: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    status: 'selesai',
    created_by: 'demo-admin-uuid-001',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    barang: INITIAL_BARANG[3],
    profile: INITIAL_STAFF[0],
  },
]

const INITIAL_PENGEMBALIAN = [
  {
    id: 'peng-001',
    peminjaman_id: 'pem-002',
    jumlah_dikembalikan: 1,
    tanggal_pengembalian: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    created_by: 'demo-admin-uuid-001',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    peminjaman: INITIAL_PEMINJAMAN[1],
  },
]

export const getLocalStore = () => {
  const barang = localStorage.getItem('lab_barang')
    ? JSON.parse(localStorage.getItem('lab_barang'))
    : INITIAL_BARANG
  const staff = localStorage.getItem('lab_staff')
    ? JSON.parse(localStorage.getItem('lab_staff'))
    : INITIAL_STAFF
  const peminjaman = localStorage.getItem('lab_peminjaman')
    ? JSON.parse(localStorage.getItem('lab_peminjaman'))
    : INITIAL_PEMINJAMAN
  const pengembalian = localStorage.getItem('lab_pengembalian')
    ? JSON.parse(localStorage.getItem('lab_pengembalian'))
    : INITIAL_PENGEMBALIAN

  // Inisialisasi jika belum ada di localStorage
  if (!localStorage.getItem('lab_barang')) localStorage.setItem('lab_barang', JSON.stringify(INITIAL_BARANG))
  if (!localStorage.getItem('lab_staff')) localStorage.setItem('lab_staff', JSON.stringify(INITIAL_STAFF))
  if (!localStorage.getItem('lab_peminjaman')) localStorage.setItem('lab_peminjaman', JSON.stringify(INITIAL_PEMINJAMAN))
  if (!localStorage.getItem('lab_pengembalian')) localStorage.setItem('lab_pengembalian', JSON.stringify(INITIAL_PENGEMBALIAN))

  return { barang, staff, peminjaman, pengembalian }
}

export const saveLocalStore = (key, data) => {
  localStorage.setItem(`lab_${key}`, JSON.stringify(data))
}
