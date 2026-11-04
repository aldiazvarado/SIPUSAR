# Rencana Implementasi: Komponen Autocomplete Interaktif Mata Kuliah & Dosen Pengampu

## Ringkasan Perubahan
1. **Tipografi & Estetika Modern**:
   - Menambahkan Google Fonts (Plus Jakarta Sans) pada `<head>` dan aturan CSS global di `<style>` untuk UI/UX yang modern, rapi, dan konsisten di desktop maupun mobile.
2. **Komponen Autocomplete Interaktif**:
   - Menggantikan input/select biasa pada **Form Pendaftaran Mahasiswa** (`#modalPendaftaran`) dan **Form Input Jadwal Ujian** (`#modalJadwalUjian`) dengan komponen Autocomplete kustom.
   - Fitur lengkap:
     - Pencarian substring case-insensitive (`Nama Mata Kuliah`, `Kode Matkul`, `Nama Dosen`, `NIK/NIDN`).
     - Penyorot teks (`highlightSearchMatch` dengan `<mark>` styling warna amber lembut & teks kontras).
     - Navigasi keyboard komprehensif: `ArrowDown` & `ArrowUp` dengan auto-scroll ke elemen aktif (`scrollIntoView`), `Enter` untuk memilih, `Escape` untuk menutup dropdown, dan `Tab`.
     - Deteksi klik di luar elemen (`click outside`) untuk menutup dropdown otomatis.
     - Tombol pembersih cepat (clear button `X`) di sebelah kanan input.
     - Indikator status visual (hover, focus ring biru navy, active item, dan badge centang konfirmasi pilihan valid).
3. **Relasi Cerdas & Validasi Master Data**:
   - Filter Mata Kuliah secara otomatis menyesuaikan Program Studi mahasiswa/admin (`MNJ`, `AKT`, `BD`, `PI`, `PKD`).
   - Pemilihan Mata Kuliah otomatis menyarankan dan mengisi Dosen Pengampu yang sesuai dengan indikator visual *Disarankan*.
   - Validasi ketat Master Data: pengguna diwajibkan memilih dari daftar master data yang valid, jika diketik sembarangan maka input akan otomatis di-reset disertai notifikasi.
4. **Sinkronisasi Multi-Platform**:
   - Sinkronisasi file utuh ke `index.html`, `public/hostinger/index.html`, dan `public/gas/Index.html`.
   - Penyempurnaan seed data `Master_Matkul` dan `Master_Dosen` di `public/gas/Setup.gs`.

## Hasil Pengujian & Verifikasi
- `compile_applet`: Berhasil tanpa error.
- `lint_applet`: `tsc --noEmit` lolos tanpa error.
- Server lokal HTTP 200 OK.
