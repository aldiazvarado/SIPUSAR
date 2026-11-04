# Rencana Implementasi: Standardisasi Kelas Tanpa Angka & Integrasi Sinkron Kelas - Kategori Kelas

Dokumen ini merinci rencana perbaikan untuk memenuhi permintaan pengguna:
1. **Pembaruan Format Nama Kelas**: Menghapus angka semester dari nama kelas sehingga `Reguler 3A`, `Reguler 1B`, `Karyawan 1A` menjadi **`Reguler A`**, **`Reguler B`**, **`Reguler C`**, **`Karyawan A`**, dan **`Karyawan B`**.
2. **Normalisasi Otomatis Data Lama**: Membersihkan data kelas pada spreadsheet (`User_Mahasiswa`, `Master_Kelas`, `Pendaftaran`) secara otomatis agar data lama langsung tersinkron rapi.
3. **Integrasi & Sinkronisasi Dua Arah Kelas - Kategori Kelas**:
   - Memilih `Kelas` akan otomatis menentukan `Kategori Kelas` (`Reguler` / `Karyawan`).
   - Memilih `Kategori Kelas` akan memfilter daftar pilihan `Kelas` yang relevan.
   - Untuk akun `Mahasiswa`, `Kelas` dan `Kategori Kelas` terisi otomatis dari profil mahasiswa dan terkunci (*locked/readonly*).
   - Seluruh data tersimpan presisi dan sinkron dengan database spreadsheet Google Sheets dan REST API Hostinger.

---

## 1. Arsitektur & Perubahan Komponen

### A. Backend Google Apps Script (`/public/gas/Code.gs` & `/public/gas/Setup.gs`)
- **Fungsi Normalisasi Kelas (`cleanClassName`)**:
  - Regular expression pintar untuk mengubah format `Reguler \d+([A-Za-z]+)` menjadi `Reguler $1` dan `Karyawan \d+([A-Za-z]+)` menjadi `Karyawan $1`.
  - Contoh: `Reguler 3A` $\rightarrow$ `Reguler A`, `Reguler 5B` $\rightarrow$ `Reguler B`, `Karyawan 1A` $\rightarrow$ `Karyawan A`.
- **Pembaruan Skema & Data Awal `Setup.gs`**:
  - `Master_Kelas`: `Reguler A`, `Reguler B`, `Reguler C`, `Karyawan A`, `Karyawan B`.
  - `User_Mahasiswa`: Seluruh sampel data mahasiswa diubah ke `Reguler A`, `Reguler B`, dll.
- **Normalisasi Otomatis pada `Code.gs`**:
  - `getInitialData`: Mengembalikan data master kelas dan user mahasiswa dengan nama kelas yang ternormalisasi.
  - `batchSyncMasterData`: Saat sinkronisasi atau upload data kelas atau user mahasiswa, nama kelas otomatis dinormalisasi.
  - `normalizeExistingClassesInSheet()`: Fungsi utilitas migrasi aman untuk memperbarui baris spreadsheet yang masih memiliki angka semester di kolom Kelas.
  - `addUserMahasiswa`: Menyimpan kelas dalam format bersih.
  - `addPendaftaran` & `updatePendaftaran`: Memastikan kolom `Kelas` dan `Kategori Kelas` tersimpan akurat dan sinkron.

### B. Antarmuka Frontend (`/index.html`, `/public/hostinger/index.html`, `/public/gas/Index.html`)
- **Sinkronisasi Dua Arah pada Modal Pendaftaran (`#modalPendaftaran`)**:
  - Event `onKelasSelectionChange()`:
    - Saat kelas dipilih (misal `Reguler A`), sistem mendeteksi kata depan ("Reguler" atau "Karyawan") dan langsung mengarahkan pilihan `pendaftaranKategoriKelas` ke nilai yang sesuai secara instan.
  - Event `onKategoriKelasChange()`:
    - Saat kategori kelas dipilih (misal `Karyawan`), sistem memfilter opsi di dropdown `pendaftaranKelas` agar hanya menampilkan kelas bertipe Karyawan untuk prodi bersangkutan.
  - **Penguncian Mahasiswa (*Autofill & Autolock*)**:
    - Ketika role `Mahasiswa` membuka form pendaftaran:
      - Field `pendaftaranKelas` terisi kelas mahasiswa (misal `Reguler A`) dan berstatus terkunci (`disabled` / `readonly`).
      - Field `pendaftaranKategoriKelas` otomatis terisi kategori yang sesuai (misal `Reguler`) dan berstatus terkunci.
      - Menampilkan badge visual penanda penguncian `(Terkunci Akun Aktif)`.
- **Form Tambah Mahasiswa Manual (`#modalAddMahasiswa`)**:
  - Pilihan dropdown kelas diperbarui ke daftar kelas standar tanpa angka (`Reguler A`, `Reguler B`, `Reguler C`, `Karyawan A`, `Karyawan B`).
- **Template Excel Resmi (`downloadMasterTemplate`)**:
  - File template `Template_Master_Kelas_FEB_UIKA.xlsx` dan `Template_User_Mahasiswa_FEB_UIKA.xlsx` diperbarui dengan contoh data kelas tanpa angka semester.
- **In-Memory Normalization pada Upload Excel**:
  - Saat file Excel dibaca di memori browser, kolom kelas langsung dibersihkan dari angka sebelum preview dan sinkronisasi.

---

## 2. Tahapan Eksekusi

1. **Backend (`Setup.gs` & `Code.gs`)**:
   - Buat fungsi utilitas `normalizeClassName(val)` dan `detectCategoryFromClass(val)`.
   - Update daftar master kelas default di `Setup.gs` dan `Code.gs`.
   - Update logika `addUserMahasiswa`, `loginUser`, dan `batchSyncMasterData`.
2. **Frontend Logic (`index.html`)**:
   - Update `appData.master.kelas`, `appData.users_mahasiswa`, dan `appData.pendaftaran`.
   - Implementasikan fungsi sinkronisasi interaktif `onKelasSelectionChange()` dan `onKategoriKelasChange()`.
   - Update `openPendaftaranModal(id)` untuk mengunci kelas dan kategori kelas bagi mahasiswa.
   - Update template Excel download untuk `Master_Kelas` dan `User_Mahasiswa`.
   - Update dropdown di modal `#modalAddMahasiswa`.
3. **Replikasi & Sinkronisasi Berkas**:
   - Sinkronkan perubahan ke `/public/hostinger/index.html` dan `/public/gas/Index.html`.
4. **Verifikasi & Validasi**:
   - Jalankan `compile_applet` dan `lint_applet` untuk memastikan bebas error sintaksis.
   - Uji respon HTTP dan pastikan dev server berjalan optimal.

---

## 3. Hasil yang Diharapkan
- Nama kelas seragam dan rapi: `Reguler A`, `Reguler B`, `Reguler C`, `Karyawan A`, `Karyawan B`.
- Form pendaftaran memiliki integrasi mulus antara Kelas (Master Data) dan Kategori Kelas.
- Akun Mahasiswa mendapatkan autofill dan autolock yang presisi.
- Kompatibel 100% dengan Google Apps Script dan Hostinger REST API.
