# Rencana Implementasi: Perbaikan Bug Reset Prodi, Cache Pintar (0 Detik), & Paginasi Tabel

## 1. Analisis Masalah & Kebutuhan Pengguna

### A. Bug Reset Program Studi ke Manajemen ('MNJ')
- **Penyebab Utama**:
  Pada `populateMasterDropdowns()`, elemen `<select id="pendaftaranProdi">` dibangun ulang dengan `innerHTML = ...` setiap kali pemanggilan `loadAppData()` selesai.
  Saat mahasiswa membuka formulir, nilainya sempat diatur sesuai akun mahasiswa (misal `AKT`, `BD`, `PI`, atau `PKD`). Namun ketika respons API latar belakang tiba beberapa milidetik kemudian, `populateMasterDropdowns()` berjalan dan menghapus opsi lama tanpa mempertahankan nilai terpilih, sehingga peramban otomatis mengembalikan pilihan ke opsi pertama yaitu `MNJ` (Manajemen).
- **Solusi**:
  1. Pada `populateMasterDropdowns()`, simpan nilai aktif (`currentSelectedVal = prodiSelect.value || currentUser.kodeProdi`) sebelum membangun ulang opsi, lalu setel ulang nilainya.
  2. Proteksi formulir: jika modal pendaftaran sedang terbuka (`#modalPendaftaran` tidak `hidden`) atau pengguna adalah mahasiswa, kunci pilihan prodi agar tidak dapat di-reset oleh proses sinkronisasi latar belakang.

### B. Penyimpanan Cache Pintar (*Stale-While-Revalidate* 0 Detik)
- Menggunakan `localStorage` (`SIP_APP_DATA_CACHE_V2`) untuk menyimpan `appData` (master prodi, matkul, jadwal, dan pendaftaran).
- Saat aplikasi dibuka di Hostinger / GitHub Pages:
  - Data cache langsung dimuat seketika (**0 detik**) sehingga tampilan dashboard dan tabel langsung lengkap tanpa jeda loading spinner.
  - Proses sinkronisasi ke Google Apps Script berjalan di latar belakang (*background sync*).
  - Ketika data terbaru dari spreadsheet diterima, cache diperbarui otomatis dan tampilan di-refresh secara halus tanpa mengganggu input yang sedang dikerjakan pengguna.
  - Sesuai jawaban klarifikasi pengguna, indikator ditampilkan secara senyap di bilah status kanan atas (`Realtime Sync Aktif`).

### C. Paginasi & Pencarian Cepat di Tabel (Default 10 Baris)
- Menambahkan kontrol paginasi pada:
  1. **Tabel Riwayat Pendaftaran**
  2. **Tabel Jadwal Ujian**
- Fitur paginasi:
  - Pilihan jumlah baris: **10 baris (default)**, 25, 50, dan Semua Baris.
  - Status info: *"Menampilkan 1-10 dari 48 pendaftaran"*.
  - Kontrol navigasi ramah pengguna: tombol *Sebelumnya*, nomor halaman aktif, dan *Selanjutnya*.
  - Pencarian dan filter prodi/status tetap bekerja terintegrasi bersama paginasi.

---

## 2. Rincian Perubahan File & Komponen

### Frontend Web (`index.html`, `public/hostinger/index.html`, `public/gas/Index.html`)
1. **Perbaikan `populateMasterDropdowns` & `openPendaftaranModal`**:
   - Mempertahankan nilai prodi dan kelas yang sedang aktif saat membangun dropdown.
   - Mengunci dropdown prodi jika pengguna berstatus mahasiswa (`disabled` / `readonly` dengan badge kunci).
2. **Implementasi Modul Cache Pintar (`initAppDataCache`, `saveAppDataCache`)**:
   - Load awal: `loadCachedAppData()` dijalankan sebelum request jaringan.
   - Background update: `loadAppData()` memperbarui cache dan DOM secara senyap.
3. **Komponen Paginasi Tabel**:
   - Menambahkan state: `paginationState = { pendaftaran: { page: 1, limit: 10 }, jadwal: { page: 1, limit: 10 } }`.
   - Menambahkan helper `renderPaginationControls(containerId, totalItems, currentPage, limit, onPageChange, onLimitChange)`.
   - Memotong array data sebelum di-render ke `tbody`: `items.slice((page - 1) * limit, page * limit)`.

---

## 3. Rencana Pengujian & Verifikasi
1. **Verifikasi Bug Reset Prodi**:
   - Login sebagai mahasiswa non-Manajemen (misal: Siti Nurhaliza Zahra / AKT).
   - Klik "Tambah Pendaftaran Baru": pastikan program studi tetap Akuntansi (AKT) dan tidak berubah ke Manajemen saat sinkronisasi latar belakang selesai.
2. **Verifikasi Cache Pintar**:
   - Refresh halaman: pastikan data langsung tampil seketika (0 detik) dari cache lokal, lalu sinkronisasi latar belakang berjalan dengan indikator senyap di kanan atas.
3. **Verifikasi Paginasi**:
   - Cek tabel Pendaftaran dan Jadwal Ujian: pastikan menampilkan 10 baris per halaman secara rapi, tombol navigasi halaman berfungsi, dan dropdown limit (10, 25, 50) bekerja akurat.
4. **Verifikasi Build**:
   - Sinkronisasi kode ke seluruh direktori distribusi.
   - Eksekusi `compile_applet` dan `lint_applet` bersamaan, dilanjutkan restart dev server.
