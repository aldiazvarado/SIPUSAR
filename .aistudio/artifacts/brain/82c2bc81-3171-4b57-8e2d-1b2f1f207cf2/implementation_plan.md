# Rencana Implementasi: Wajib Isi Alasan & Bukti serta Integrasi Upload Google Drive Otomatis

## 1. Ringkasan Kebutuhan & Keputusan Pengguna
Berdasarkan permintaan dan hasil klarifikasi pengguna:
1. **Wajib Isi (Mandatory)**:
   - Field **Alasan / Keterangan** dan **Upload Bukti Foto / Dokumen Pendukung** diubah menjadi **wajib diisi** (`required`).
   - Ditambahkan indikator visual tanda bintang merah (`*`) pada label kedua field di UI formulir pendaftaran.
   - Validasi sisi klien akan memblokir submit form jika alasan kosong atau berkas bukti belum dipilih.
2. **Format & Batasan Berkas**:
   - Jenis berkas yang diizinkan: **Gambar (JPG, JPEG, PNG)** dan **Dokumen PDF**.
   - Batas maksimal ukuran berkas: **5 MB**.
   - Validasi sisi klien memberikan notifikasi peringatan jika ukuran berkas melebihi 5 MB atau format tidak didukung.
3. **Penyimpanan Berkas ke Google Drive Otomatis (GAS)**:
   - Berkas diunggah secara otomatis ke Google Drive pada folder khusus bernama **`Berkas Bukti Pendaftaran FEB UIKA`**.
   - Folder akan otomatis dibuat jika belum ada di Google Drive akun admin/GAS.
   - Nama berkas di Drive distandarisasi: `[NPM]_[REG_ID]_[Timestamp]_[NamaBerkas]`.
   - Izin berkas disetel agar dapat dilihat (*View link*) oleh staf/pemeriksa ujian.
   - Spreadsheet pada kolom **Bukti Foto** hanya akan menyimpan **URL Google Drive** (`https://drive.google.com/file/d/.../view`), bukan string Base64 yang panjang, sehingga database spreadsheet tetap ringan, cepat, dan terhindar dari batas kuota karakter cell.

---

## 2. Rincian Perubahan File & Komponen

### A. Frontend Web (`index.html`, `public/hostinger/index.html`, `public/gas/Index.html`)
1. **Pembaruan Elemen Formulir Pendaftaran**:
   - Menambahkan tanda bintang merah pada label:
     - `Alasan / Keterangan <span class="text-rose-500 font-bold">*</span>`
     - `Upload Bukti Foto / Dokumen Pendukung <span class="text-rose-500 font-bold">*</span>`
   - Mengatur `textarea#pendaftaranAlasan` dengan atribut `required`.
   - Mengatur `input#pendaftaranBukti` dengan atribut `required`, `accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"`.
2. **Komponen Preview Berkas Unggahan**:
   - Menambahkan wadah preview real-time ketika berkas dipilih:
     - Jika gambar: menampilkan thumbnail preview dengan tombol hapus.
     - Jika PDF: menampilkan ikon dokumen merah dengan nama file, ukuran (KB/MB), dan indikator status siap upload.
3. **Validasi & Penanganan Pengiriman Form (`handleSavePendaftaran`)**:
   - Memeriksa kelengkapan `pendaftaranAlasan` (tidak boleh kosong atau hanya spasi).
   - Memeriksa keberadaan file pada `pendaftaranBukti` saat membuat pendaftaran baru.
   - Memeriksa ukuran file `<= 5 * 1024 * 1024` byte (5 MB).
   - Mengonversi file ke format Base64 beserta informasi `fileName` dan `mimeType` untuk dikirim ke backend Google Apps Script.
   - Menampilkan status proses pengunggahan di tombol submit ("Mengunggah berkas ke Google Drive...").

### B. Google Apps Script Backend (`public/gas/Code.gs`)
1. **Fungsi Manajemen Folder Drive**:
   - `getOrCreateUploadFolder(folderName)`:
     - Mencari folder dengan nama `Berkas Bukti Pendaftaran FEB UIKA`.
     - Jika belum ada, otomatis membuat folder baru di Google Drive utama.
     - Mengembalikan objek `Folder` Google Drive.
2. **Fungsi Upload Berkas ke Drive**:
   - `uploadFileToDrive(base64Data, fileName, mimeType, npm, regId)`:
     - Mem-parsing string Base64 menjadi Blob data dengan MimeType yang sesuai.
     - Menyimpan file ke dalam folder `Berkas Bukti Pendaftaran FEB UIKA`.
     - Mengatur sharing permission file (`DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW`).
     - Mengembalikan URL akses Google Drive (`file.getUrl()`).
3. **Penyelarasan API `simpanPendaftaran` & `doPost`**:
   - Saat action `SAVE_PENDAFTARAN` atau create registration dieksekusi:
     - Jika `buktiFoto` terdeteksi berupa payload Base64 (atau objek berisi data berkas), panggil `uploadFileToDrive`.
     - Masukkan URL Drive yang dihasilkan ke dalam kolom `Bukti Foto` (Kolom O) pada sheet `Pendaftaran`.
     - Catat log aktivitas pengunggahan berkas secara transparan.

---

## 3. Rencana Pengujian & Verifikasi
1. **Uji Validasi Form (Sisi Klien)**:
   - Mencoba submit form pendaftaran dengan mengosongkan Alasan: harus ditolak dengan pesan validasi.
   - Mencoba submit form pendaftaran tanpa memilih berkas bukti: harus ditolak dengan pesan validasi.
   - Memilih file > 5 MB: sistem menampilkan notifikasi bahwa file melebihi batas 5 MB.
   - Memilih file PDF atau JPG/PNG valid: preview muncul dengan rapi.
2. **Uji Integrasi Backend Google Apps Script**:
   - Memastikan fungsi `getOrCreateUploadFolder` dan `uploadFileToDrive` terdefinisi dan kompatibel dengan endpoint API GAS.
3. **Verifikasi Build**:
   - Sinkronisasi kode ke semua target (`index.html`, `public/hostinger/index.html`, `public/gas/Index.html`).
   - Eksekusi `compile_applet` dan `lint_applet` untuk menjamin kualitas sintaks dan kelancaran dev server.
