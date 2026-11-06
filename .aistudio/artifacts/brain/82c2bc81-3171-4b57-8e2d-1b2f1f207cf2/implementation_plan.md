# Peningkatan Fitur Remedial Teaching: Nilai Huruf (D, CD, C, BC) & Dosen Pengampu Terdahulu

Pembaruan ini menambahkan penanganan khusus untuk layanan **Remedial Teaching** pada Formulir Pendaftaran Mahasiswa (`#modalPendaftaran`). Ketika jenis layanan Remedial dipilih, setiap baris mata kuliah yang didaftarkan secara otomatis memunculkan dua atribut wajib akademik: **Nilai Huruf Sebelumnya** (pilihan mutlak: `D`, `CD`, `C`, `BC`) dan **Dosen Mata Kuliah Pada Saat Itu** (pilihan cerdas dari master dosen kampus dengan fleksibilitas ketik manual jika dosen masa lalu telah berganti).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan penting telah dikonfirmasi melalui sesi klarifikasi dan menjadi acuan utama implementasi:

- **Tampilan Input Kondisional**: Muncul secara otomatis per baris mata kuliah dinamis hanya ketika Jenis Layanan adalah `Remedial Teaching`. Jika layanan adalah `UTS Susulan` atau `UAS Susulan`, field ini disembunyikan/ditiadakan agar form tetap ringkas.
- **Pilihan Nilai Huruf yang Memenuhi Syarat**: Tepat 4 opsi nilai huruf standar perbaikan nilai: **`D`**, **`CD`**, **`C`**, dan **`BC`** (nilai yang sah untuk perbaikan indeks prestasi di FEB UIKA).
- **Pengisian Dosen Pada Saat Itu**: Menggunakan input interaktif yang terhubung ke `<datalist>` seluruh dosen aktif FEB UIKA Bogor, dengan opsi mengetik nama dosen baru/terdahulu secara manual apabila mata kuliah tersebut di masa lalu diampu oleh dosen yang berbeda atau dosen tamu.
- **Kompatibilitas Multi-Matkul & Database**: Nilai huruf dan dosen terdahulu terintegrasi ke dalam array objek `mataKuliahList`, terformat rapi pada kolom spreadsheet `Pendaftaran`, dan ditampilkan pada rincian pendaftaran, tabel riwayat, serta kwitansi/kartu ujian.

---

## 1. Overview & Core Concept

- **Tujuan**: Memfasilitasi pendaftaran Remedial Teaching yang membutuhkan verifikasi riwayat akademik mahasiswa, yaitu memastikan mata kuliah yang diajukan memang pernah diambil dengan perolehan nilai huruf yang dapat diperbaiki (`D`, `CD`, `C`, `BC`), serta mencatat siapa dosen pengampu pada semester saat mahasiswa memperoleh nilai tersebut.
- **Pengguna Sasaran**:
  - **Mahasiswa FEB UIKA**: Dapat memilih mata kuliah remedial, mencantumkan nilai yang ingin diperbaiki, dan menentukan dosen pengampu terdahulu tanpa kebingungan.
  - **Dosen Pengampu & Penguji Remedial**: Mengetahui nilai awal mahasiswa dan siapa dosen kelas sebelumnya untuk menyusun materi penugasan dan evaluasi remedial yang tepat sasaran.
  - **Admin Bagian Akademik (TU)**: Memverifikasi keabsahan syarat pendaftaran remedial secara instan berdasarkan nilai huruf yang dilaporkan.

---

## 2. User Experience & Visual Design

### Alur Pengguna (User Flow)
1. **Pemilihan Layanan Remedial Teaching**:
   - Mahasiswa atau Admin membuka formulir pendaftaran.
   - Pilihan `Jenis Layanan` (dapat dipilih langsung pada dropdown form atau mengikuti periode aktif yang berjenis Remedial).
2. **Kemunculan Field Remedial Dinamis**:
   - Begitu layanan `Remedial Teaching` aktif, setiap kartu baris mata kuliah (`matkulRowCard_0`, `matkulRowCard_1`, dst.) secara otomatis menampilkan kontainer khusus **"Detail Remedial Teaching"** berlatar ungu/indigo lembut (`bg-indigo-50/70 border-indigo-200`).
   - Terdapat dropdown **"Nilai Huruf Sebelumnya"** bertanda bintang merah (`*`) dengan opsi: `D`, `CD`, `C`, dan `BC`.
   - Terdapat input **"Dosen Mata Kuliah Pada Saat Itu"** bertanda bintang merah (`*`) dilengkapi penunjuk datalist nama dosen kampus dan tombol bantuan "Gunakan Dosen Saat Ini" untuk pengisian cepat.
3. **Validasi & Akumulasi**:
   - Jika mahasiswa memilih layanan Remedial Teaching namun belum memilih nilai huruf atau belum mengisi dosen terdahulu pada salah satu baris mata kuliah, tombol simpan akan memberikan panduan validasi yang jelas.
4. **Penyajian Data Riwayat & Cetak Kartu**:
   - Tabel riwayat pendaftaran menampilkan badge nilai huruf awal (contoh: badge `Nilai: BC` berwarna amber, `Nilai: D` berwarna rose).
   - Kartu Pendaftaran / Kartu Ujian mencantumkan kolom keterangan: `Nilai Asal: [C] · Dosen Kelas: [Nama Dosen Saat Itu]`.

---

## 3. Key Product Decisions & Trade-Offs

### Keputusan 1: Input Dosen Terdahulu (Datalist vs Select Kaku)
- **Pendekatan Terpilih**: Kombinasi HTML5 `<input type="text" list="datalistDosenTerdahulu">` yang didukung daftar master dosen FEB UIKA.
- **Alasan**: Mahasiswa yang mengambil mata kuliah 2–3 semester lalu mungkin diajar oleh dosen luar biasa, dosen purnabakti, atau dosen pengganti yang namanya tidak terdaftar di daftar dosen tetap semester aktif. Datalist memberikan kemudahan autocomplete instan bagi nama dosen yang ada, sekaligus tidak mengunci kebebasan mahasiswa untuk mengetik nama aslinya.

### Keputusan 2: Pemilihan Jenis Layanan pada Modal Pendaftaran
- **Pendekatan Terpilih**: Mengubah `#pendaftaranLayanan` menjadi dropdown interaktif jika periode aktif bersifat multi-layanan (seperti "UTS Susulan & Remedial"), atau tetap memberikan opsi toggle layanan bagi Admin dan Mahasiswa untuk keperluan pendaftaran khusus.
- **Alasan**: Memungkinkan pendaftaran Remedial Teaching dilakukan tanpa hambatan bahkan ketika sistem memiliki jadwal simultan susulan dan remedial.

---

## 4. Flowchart Alur Sistem (ASCII Diagram)

```
┌────────────────────────────────────────────────────────┐
│             Buka Form Pendaftaran Mahasiswa            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Deteksi / Pilih Jenis Layanan            │
└───────────────────────────┬────────────────────────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
    [Bukan Remedial]             [Remedial Teaching]
    (UTS / UAS Susulan)                    │
             │                             ▼
             │              ┌────────────────────────────┐
             │              │  Aktifkan Mode Remedial    │
             │              │  pada Seluruh Baris Matkul │
             │              └──────────────┬─────────────┘
             │                             │
             ▼                             ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│ Render Baris Standar:     │ │ Render Baris Remedial:   │
│ - Autocomplete Matkul     │ │ - Autocomplete Matkul    │
│ - Autocomplete Dosen Baru │ │ - Autocomplete Dosen Baru│
│                           │ │ - Dropdown Nilai Huruf:  │
│                           │ │   [D, CD, C, BC]         │
│                           │ │ - Dosen Pada Saat Itu    │
│                           │ │   (Datalist / Ketik Bebas│
└────────────┬──────────────┘ └─────────────┬────────────┘
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           Validasi & Simpan Registrasi                 │
│  - Pastikan semua baris matkul terisi lengkap          │
│  - Jika Remedial: pastikan Nilai Huruf & Dosen diisi   │
│  - Terbitkan 1 ID Registrasi dengan payload terstruktur│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          Sinkronisasi & Tampilan Informasi             │
│  - Simpan ke memory, spreadsheet, dan Hostinger API    │
│  - Tampilkan badge Nilai Huruf & Dosen Lalu di Riwayat │
│  - Format data pada Cetak Kartu Ujian & Kwitansi       │
└────────────────────────────────────────────────────────┘
```

---

## 5. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MODAL PENDAFTARAN (#modalPendaftaran)                 │
│                                                                             │
│  [Jenis Layanan: Remedial Teaching] ◄─── Mengontrol Mode Remedial           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ dynamicMatkulContainer (Baris #i)                                     │  │
│  │                                                                       │  │
│  │  [Nama Mata Kuliah (Autocomplete)]       [Dosen Pengampu Saat Ini]    │  │
│  │                                                                       │  │
│  │  ┌── KHUSUS REMEDIAL TEACHING ─────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  [Nilai Huruf Sebelumnya]             [Dosen Pada Saat Itu]     │  │  │
│  │  │  <select>                              <input list="datalist">  │  │  │
│  │  │  - Nilai D                             - Autocomplete Dosen     │  │  │
│  │  │  - Nilai CD                            - Bisa Ketik Manual      │  │  │
│  │  │  - Nilai C                                                      │  │  │
│  │  │  - Nilai BC                                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │ Payload: { mataKuliahList: [
                                       │   { nama, dosen, nilaiHuruf, dosenLalu, sks }
                                       │ ]}
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PENYIMPANAN & SINKRONISASI                         │
│                                                                             │
│  - appData.pendaftaran (Client Memory)                                      │
│  - Google Apps Script (Code.gs & Sheet 'Pendaftaran')                       │
│  - Hostinger Standalone API Endpoint                                        │
│  - Tabel Riwayat, Detail View, & Kartu Ujian Remedial                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Rencana Tahapan Eksekusi

1. **Pembaruan Kontrol Jenis Layanan pada Form Pendaftaran**:
   - Memastikan `#pendaftaranLayanan` dapat memilih layanan `Remedial Teaching` atau mengikuti periode aktif.
   - Menambahkan event listener `onLayananChange()` yang secara otomatis memperbarui tampilan kontainer mata kuliah dinamis.
2. **Pembaruan Dynamic Matkul Row Generator (`renderDynamicMatkulInputs`)**:
   - Menambahkan blok input kondisional untuk setiap baris:
     - Dropdown Nilai Huruf: pilihan `D`, `CD`, `C`, dan `BC`.
     - Input Dosen Pada Saat Itu: terhubung ke `<datalist id="datalistDosenTerdahulu">` dengan tombol bantu "Salin dari Dosen Saat Ini".
   - Memperbarui fungsi `collectCurrentMatkulFormData()` untuk membaca `nilaiHuruf` dan `dosenLalu`.
3. **Penyimpanan, Validasi, dan Sinkronisasi Data**:
   - Memperbarui `handleSavePendaftaran()`: validasi wajib isi nilai huruf dan dosen masa lalu jika jenis layanan adalah Remedial Teaching.
   - Menata string representasi di Spreadsheet sheet `Pendaftaran` agar memuat informasi nilai huruf dan dosen saat itu tanpa merusak kolom yang ada.
   - Memperbarui pembacaan saat mode edit (`openPendaftaranModal(id)`) agar memuat kembali nilai huruf dan dosen terdahulu.
4. **Penyajian Data di Tabel Riwayat, Modal Detail, dan Kartu Ujian**:
   - Menampilkan badge visual nilai huruf (`D`, `CD`, `C`, `BC`) dan nama dosen terdahulu pada kolom mata kuliah di tabel pendaftaran.
   - Menampilkan rincian nilai huruf dan dosen terdahulu pada kartu cetak ujian / kwitansi pendaftaran.
5. **Sinkronisasi Multi-File & Pengujian Kompilasi**:
   - Sinkronisasi perubahan ke `index.html`, `public/hostinger/index.html`, dan `public/gas/Index.html`.
   - Menjalankan `compile_applet` dan `lint_applet` untuk menjamin nol kesalahan sintaks dan tipe.
