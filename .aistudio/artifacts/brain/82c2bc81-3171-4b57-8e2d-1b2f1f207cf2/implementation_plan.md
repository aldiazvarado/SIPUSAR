# Perbaikan Export Excel Database Website & Integrasi Upload Google Drive

Rencana perbaikan komprehensif untuk memastikan fitur **Export Excel** di menu *Database Website* berfungsi 100% lancar, serta memastikan bukti foto tersimpan rapi sebagai link Google Drive permanen (bukan teks base64) baik pada data baru maupun data lama yang sudah tersimpan di Google Spreadsheet.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi yang telah dikonfirmasi oleh pengguna:
> 1. **Penanganan Bukti Foto di Export Excel**: Tampilkan link URL Google Drive aktif yang dapat diklik langsung, dan bersihkan teks base64 panjang dari baris Excel agar tidak merusak sel dan struktur dokumen.
> 2. **Penanganan Bukti Foto Base64 Lama di Spreadsheet**: Sediakan tombol konversi otomatis di web (*"Migrasi Bukti Base64 ke Drive"*) untuk memindai baris spreadsheet yang masih berisi teks base64 dan mengunggahnya otomatis ke folder Google Drive *"Berkas Bukti Pendaftaran FEB UIKA"*.
> 3. **Format Dokumen Unduhan**: File Microsoft Excel `.xlsx` standar dengan fallback otomatis ke format `.xls` (HTML Spreadsheet) atau CSV UTF-8 ber-BOM jika pustaka SheetJS mengalami pembatasan di peramban.

---

### 1. Overview & Core Concept

- **Masalah Saat Ini**:
  1. Tombol *Export Excel (.xls)* di tab **Database Website** tidak merespons atau gagal mengunduh karena kolom `Bukti Foto` berisi teks raw base64 data URI yang sangat panjang (ratusan ribu karakter), melebihi batas panjang sel Excel (32.767 karakter) serta struktur data objek bersarang (`mataKuliahList`).
  2. Saat pendaftaran dikirim, beberapa bukti foto masih tersimpan dalam format base64 langsung di sel Google Spreadsheet (kolom O) jika pengunggahan ke Google Drive terhambat atau skrip Google Apps Script (GAS) belum memperbarui penanganan upload.
  3. Tampilan tabel sheet di tab *Database Website* menampilkan teks panjang base64 mentah yang membuat tata letak baris tidak rapi.
- **Solusi yang Diterapkan**:
  1. **Sanitasi Data & Dual-Engine Export Excel**: Fungsi `exportActiveSheetExcel()` menyaring setiap baris tabel, membersihkan teks base64 menjadi label ringkas atau URL Google Drive asli, menghapus properti objek kompleks, serta dilengkapi mekanisme `try...catch` berlapis dengan fallback `.xlsx` dan `.xls`.
  2. **Tampilan Tabel Database Website Rapi**: Kolom *Bukti Foto* pada tabel *Database Website* tidak lagi menampilkan teks mentah base64; jika sudah berupa link Drive ditampilkan tombol link tautan, jika masih base64 ditampilkan tombol pratinjau modal *Lihat Bukti Foto*.
  3. **Fitur Migrasi Base64 ke Drive**: Menambahkan fungsi backend `migrateBase64ToDrive()` di Google Apps Script dan tombol antarmuka di web untuk memproses data foto lama di spreadsheet menjadi link Google Drive resmi dalam 1 kali klik.
  4. **Pembaruan Skrip GAS (Code.gs & Setup.gs)**: Memastikan fungsi `addPendaftaran` dan `updatePendaftaran` memvalidasi pengunggahan ke folder Google Drive *"Berkas Bukti Pendaftaran FEB UIKA"* dan tidak pernah memasukkan teks base64 mentah ke sel spreadsheet.

---

### 2. User Experience & Visual Design

#### A. Toolbar Database Website yang Disempurnakan
- Di samping tombol **Export Excel (.xlsx)** dan rumus kalkulasi `fx =SUM(Nominal)`, ditambahkan tombol aksi praktis untuk Master Admin:
  - **Export Excel (.xlsx / .xls)**: Tombol warna emerald dengan status loading spinner saat proses ekspor berlangsung.
  - **Migrasi Bukti Base64 ke Drive**: Tombol warna amber dengan ikon Google Drive (`fa-google-drive`) yang hanya muncul saat melihat sheet *Data Pendaftaran*, memungkinkan verifikator mengonversi bukti pendaftaran lama dengan indikator progres SweetAlert interaktif.

#### B. Visualisasi Kolom "Bukti Foto" di Tabel Sheet
- **Jika berisi URL Google Drive**: Ditampilkan badge biru bernavigasi aman `<a href="..." target="_blank">` dengan ikon eksternal: `Buka Berkas Drive`.
- **Jika berisi Data Base64**: Ditampilkan tombol ringkas `<button>`: `Lihat Foto (Base64)` yang membuka pratinjau modal pop-up visual, tanpa mencemari tampilan tabel dengan ratusan ribu teks string.

#### C. Alur Notifikasi Export & Migrasi
- Export berhasil: SweetAlert hijau menampilkan jumlah baris dan nama file yang diunduh (`Pendaftaran_FEB_UIKA_YYYY-MM-DD.xlsx`).
- Migrasi selesai: SweetAlert menginformasikan jumlah baris bukti foto yang berhasil diunggah ke Google Drive beserta tautan foldernya.

---

### 3. Key Product Decisions & Trade-Offs

- **Sanitasi Kolom Sebelum Pembuatan Spreadsheet**:
  - *Keputusan*: Memetakan (mapping) data sheet sebelum diserahkan ke pustaka SheetJS, mengganti teks base64 panjang dengan link URL aktif Google Drive atau string informatif `[Berkas Bukti Tersimpan di Sistem]`.
  - *Alasan*: Menghindari crash memori pada SheetJS dan mengatasi limitasi 32.767 karakter per sel pada aplikasi Microsoft Excel desktop maupun mobile.
- **Dual-Engine Export (SheetJS + HTML Table Blob)**:
  - *Keputusan*: Memprioritaskan `XLSX.writeFile(wb, fileName)` untuk format modern `.xlsx`. Jika browser memblokir atau pustaka gagal, sistem secara otomatis mengekspor via format XML/HTML Spreadsheet (`.xls`) dengan encoding UTF-8.
  - *Alasan*: Menjamin 100% tombol selalu menghasilkan file unduhan tanpa pernah macet atau tidak bereaksi.
- **Pembersihan Server-Side di Google Spreadsheet**:
  - *Keputusan*: Menyediakan skrip migrasi GAS yang membaca kolom *Bukti Foto*, mendekode base64, menyimpannya ke folder Google Drive target, dan menimpa sel spreadsheet dengan URL Drive publik.
  - *Alasan*: Menjaga ukuran spreadsheet tetap kecil (bebas dari kuota 10 juta sel / ukuran byte berlebih) dan memastikan tautan dapat diakses oleh tim akademik.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANTARMUKA WEB (FRONTEND)                        │
├────────────────────────────────────────────────────────────────────────┤
│  [Database Website Tab]                                               │
│   ├── Pilihan Sheet: Data Pendaftaran, Jadwal Ujian, Master Data...    │
│   ├── Tabel Spreadsheet Interaktif (Pratinjau Foto Rapi, Bukan Base64) │
│   ├── Tombol [Export Excel (.xlsx / .xls)]                             │
│   │     └── exportActiveSheetExcel() -> Sanitasi Kolom -> SheetJS/XLS  │
│   └── Tombol [Migrasi Bukti Base64 ke Drive]                          │
│         └── migrateBase64ToDrive() -> callGasApi / google.script.run   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ HTTP POST / Runner
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND GOOGLE APPS SCRIPT (GAS)                     │
├────────────────────────────────────────────────────────────────────────┤
│  [Code.gs & Setup.gs]                                                  │
│   ├── uploadBuktiToDrive(base64, name, mime, npm, regId)               │
│   │     └── Folder: "Berkas Bukti Pendaftaran FEB UIKA"               │
│   │     └── Return: driveFile.getUrl()                                 │
│   ├── addPendaftaran(payload) / updatePendaftaran(payload)             │
│   │     └── Validasi ketat: Selalu simpan URL Drive, jangan raw base64 │
│   └── migrateBase64ToDrive()                                           │
│         └── Scan baris sheet Pendaftaran -> Konversi sel base64        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  GOOGLE DRIVE & SPREADSHEET STORAGE                    │
├────────────────────────────────────────────────────────────────────────┤
│   ├── Google Drive Folder: "Berkas Bukti Pendaftaran FEB UIKA"         │
│   │     └── File: NPM_REG_TIMESTAMP_Bukti.jpg / .png / .pdf            │
│   └── Google Spreadsheet: "Pendaftaran UTS/UAS Susulan & Remedial"     │
│         └── Kolom O "Bukti Foto": Berisi link URL Google Drive bersih  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Komponen yang Diperbarui:
1. `index.html`:
   - Fungsi `exportActiveSheetExcel()`: Pembersihan base64, flattening objek, perbaikan dual-engine export (`.xlsx` dan `.xls`), penambahan error handling lengkap.
   - Fungsi `renderSpreadsheetWorkbook()`: Perbaikan perenderan kolom *Bukti Foto* (link Drive atau tombol modal preview, bukan string base64 mentah).
   - Tombol dan fungsi `triggerMigrateBase64ToDrive()` dengan dialog konfirmasi SweetAlert.
2. `public/gas/Code.gs` & `public/gas/Setup.gs`:
   - Penambahan fungsi `migrateBase64ToDrive()` untuk mengeksekusi konversi data lama di Google Spreadsheet secara massal.
   - Penyempurnaan `addPendaftaran` dan `updatePendaftaran` agar jika proses upload Drive menemui kendala, error dilaporkan secara transparan dan sel spreadsheet tidak dicemari teks base64.
3. Sinkronisasi repositori file:
   - Menyalin pembaruan ke `public/hostinger/index.html` dan `public/gas/Index.html`.
