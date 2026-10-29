# Implementasi Dropdown Semester & Sinkronisasi Kategori Kelas (Reguler & Karyawan)

Rencana kerja terstruktur untuk menambahkan field **Semester (Ganjil & Genap)** pada Master Tahun Akademik serta mengubah opsi kategori kelas **"Eksekutif"** menjadi **"Reguler & Karyawan"** (3 opsi: `Reguler`, `Karyawan`, `Reguler & Karyawan`), tersinkronisasi 100% ke seluruh antarmuka web, modal, tabel, filter, skrip backend Google Apps Script, dan database Google Spreadsheet.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan klarifikasi pada Fase 1 dan analisis antarmuka sistem:
> 
> 1. **Dropdown Semester pada Master Tahun Akademik**:
>    - Pengguna menyetujui opsi rekomendasi: **Menambahkan kolom Semester secara eksplisit pada modal Tambah/Edit Tahun Akademik dan tabel Pengelolaan Tahun Akademik**.
>    - Pilihan Semester: `Ganjil` dan `Genap`.
>    - Header Google Spreadsheet `Master_Tahun_Akademik` diperbarui menjadi 5 kolom: `ID`, `Tahun Akademik`, `Semester`, `Status`, `Keterangan`.
>    - Sistem menyediakan backward-compatibility (auto-migration) otomatis di `Code.gs` agar sheet yang saat ini masih 4 kolom langsung menyesuaikan tanpa merusak data yang telah ada.
> 
> 2. **Pembaruan Kategori Kelas (3 Pilihan Resmi)**:
>    - Mengganti opsi `Eksekutif` menjadi `Reguler & Karyawan`.
>    - Tiga opsi final pada seluruh sistem:
>      1. `Reguler`
>      2. `Karyawan`
>      3. `Reguler & Karyawan`
>    - Diterapkan secara serentak pada:
>      - Modal Tambah & Edit Jadwal Periode (`modalPeriode`).
>      - Formulir pendaftaran mahasiswa (baik modal admin maupun alur mandiri).
>      - Filter tabel Jadwal Periode & Filter tabel Pendaftaran.
>      - Badge tampilan pada baris data tabel Jadwal Periode.
>      - Backend `Code.gs` dan `Setup.gs`.

---

## 1. Overview & Core Concept

- **Tujuan**:
  - Memberikan kepastian identitas semester pada data Master Tahun Akademik sehingga periode perkuliahan Ganjil dan Genap tercatat rapi dan terpisah.
  - Memfasilitasi program kelas gabungan `Reguler & Karyawan` sebagai pengganti `Eksekutif` sesuai kurikulum dan operasional akademik FEB UIKA.
  - Memastikan konsistensi 100% dua arah antara antarmuka web (GAS Native & Hostinger Standalone) dengan database Google Spreadsheet.
- **Komponen Terdampak**:
  1. `index.html` (Aplikasi utama / portal aktif)
  2. `public/gas/Index.html` (Frontend native Google Apps Script)
  3. `public/hostinger/index.html` (Frontend standalone Hostinger)
  4. `public/gas/Code.gs` (Backend controller, CRUD endpoint, & sinkronisasi Google Spreadsheet)
  5. `public/gas/Setup.gs` (Skema awal database & inisialisasi sheet)
  6. Variabel template kode pada menu *Source Code & Skrip* di frontend.

---

## 2. User Experience & Visual Design

### A. Alur Master Tahun Akademik
1. **Modal Tambah / Edit Tahun Akademik**:
   - Terdapat field input:
     - **Tahun Akademik** (Teks, misal `2026/2027`)
     - **Semester** (Dropdown select: `Semester Ganjil`, `Semester Genap`)
     - **Status Periode** (Dropdown select: `Aktif (Tahun Berjalan)`, `Arsip`, `Mendatang`)
     - **Keterangan / Catatan** (Teks)
2. **Tabel Pengelolaan Tahun Akademik**:
   - Kolom tabel: `ID`, `TAHUN AKADEMIK`, `SEMESTER`, `STATUS`, `KETERANGAN`, `AKSI`.
   - Menampilkan badge semester yang bersih (`Semester Ganjil` / `Semester Genap`).
3. **Dropdown Tahun Akademik pada Jadwal Periode**:
   - Menampilkan informasi terpadu: `2026/2027 - Ganjil (Aktif)`.

### B. Alur Kategori Kelas (Reguler, Karyawan, Reguler & Karyawan)
1. **Modal Jadwal Periode**:
   - Dropdown `Kategori Kelas` berisi 3 pilihan:
     - `Reguler`
     - `Karyawan`
     - `Reguler & Karyawan`
2. **Tabel & Filter**:
   - Kolom `KATEGORI KELAS` menampilkan badge warna yang konsisten:
     - Reguler: Badge Biru Slate
     - Karyawan: Badge Indigo / Violet
     - Reguler & Karyawan: Badge Emerald / Cyan
   - Filter Kategori Kelas di dashboard atau tabel pendaftaran mencakup ketiga pilihan tersebut.

---

## 3. Key Technical Decisions & Data Schema

### A. Skema Spreadsheet `Master_Tahun_Akademik`
- Struktur kolom baru:
  ```
  Col A: ID (e.g. TA-001)
  Col B: Tahun Akademik (e.g. 2026/2027)
  Col C: Semester (e.g. Ganjil / Genap)
  Col D: Status (e.g. Aktif / Arsip / Mendatang)
  Col E: Keterangan (e.g. Tahun Akademik Berjalan)
  ```
- **Auto-Migration di `Code.gs`**:
  Jika baris header di sheet `Master_Tahun_Akademik` hanya memiliki 4 kolom (`ID`, `Tahun Akademik`, `Status`, `Keterangan`), sistem secara otomatis menyisipkan kolom `Semester` di antara `Tahun Akademik` dan `Status`, mengisi default `'Ganjil'`, sehingga tidak ada data yang bergeser atau hilang.

### B. Sinkronisasi Data CRUD di Backend (`Code.gs`)
- `getTahunAkademikList()`: Mengembalikan objek `{ id, tahun, semester, status, keterangan }`.
- `addTahunAkademik(payload)`: Menyimpan baris `[id, payload.tahun, payload.semester, payload.status, payload.keterangan]`.
- `updateTahunAkademik(payload)`: Memperbarui nilai tahun, semester, status, dan keterangan secara tepat pada baris yang sesuai di spreadsheet.
- `deleteTahunAkademik(id)`: Menghapus baris terkait secara presisi.

---

## 4. Execution Plan (Step-by-Step)

### Step 1: Penyesuaian Backend Google Apps Script (`Code.gs` & `Setup.gs`)
- Perbarui struktur default sheet `Master_Tahun_Akademik` di `Setup.gs` menjadi 5 kolom (menambahkan kolom Semester).
- Perbarui handler CRUD `Master_Tahun_Akademik` di `Code.gs` dengan dukungan kolom `Semester` dan auto-migration header sheet jika masih format lama.
- Pastikan enum atau validasi kategori kelas di `Code.gs` menerima `'Reguler'`, `'Karyawan'`, dan `'Reguler & Karyawan'`.

### Step 2: Penyesuaian Antarmuka Web (`index.html`)
- **Master Tahun Akademik**:
  - Tambahkan elemen `<select id="inputTahunAkademikSemester">` dengan opsi `Ganjil` dan `Genap` pada `modalTahunAkademik`.
  - Tambahkan kolom header `SEMESTER` pada tabel Pengelolaan Tahun Akademik.
  - Perbarui fungsi JavaScript `renderTahunAkademikTable()`, `openTahunAkademikModal()`, dan `handleSaveTahunAkademik()` untuk memproses field `semester`.
- **Kategori Kelas**:
  - Ganti opsi `<option value="Eksekutif">` menjadi `<option value="Reguler & Karyawan">` pada `select id="periodeKategoriKelas"`.
  - Ganti seluruh filter atau form lain yang memuat opsi `Eksekutif` agar menggunakan `Reguler & Karyawan`.
  - Perbarui styling badge kategori kelas pada baris tabel periode dan pendaftaran.

### Step 3: Sinkronisasi ke File Deployment (`public/gas/Index.html` & `public/hostinger/index.html`)
- Terapkan perubahan yang sama persis pada:
  - `public/gas/Index.html` (versi native Google Apps Script)
  - `public/hostinger/index.html` (versi standalone Hostinger)
- Perbarui data template kode di menu *Source Code & Skrip* agar selalu menyajikan kode terbaru yang siap salin dan unduh.

### Step 4: Verifikasi & Uji Kualitas
- Jalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada kesalahan sintaks atau kompilasi.
- Uji alur pembuatan data Tahun Akademik baru dengan Semester Ganjil/Genap.
- Uji pembuatan Jadwal Periode baru dengan Kategori Kelas `Reguler & Karyawan`.
