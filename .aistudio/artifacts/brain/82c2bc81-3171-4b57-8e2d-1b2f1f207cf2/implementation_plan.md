# Rencana Implementasi: Form Pendaftaran Layanan & Sinkronisasi Kelas Master Matkul

## 1. Ringkasan Kebutuhan & Keputusan Pengguna
Berdasarkan arahan dan jawaban klarifikasi pengguna:
1. **Pembaruan Judul Modal Pendaftaran**:
   - Judul modal saat ini: `"Form Pendaftaran Akademik Baru"`
   - Diubah menjadi: `"Form Pendaftaran Layanan Ujian Susulan dan Remedial Teaching"`
2. **Penambahan Kolom Kelas di Sheet Master_Matkul**:
   - Kolom sheet `Master_Matkul` saat ini: `["ID", "Kode Matkul", "Nama Mata Kuliah", "SKS", "Kode Prodi", "Dosen Pengampu"]` (Kolom A-F).
   - Diperbarui menjadi: `["ID", "Kode Matkul", "Nama Mata Kuliah", "SKS", "Kode Prodi", "Dosen Pengampu", "Kelas"]` (Kolom A-G).
   - Format: Setiap baris mewakili 1 mata kuliah dan kelas spesifik (misal: "Reguler A", "Reguler B", atau "Semua Kelas" untuk fleksibilitas).
3. **Filter Otomatis Berdasarkan Kelas Mahasiswa**:
   - Saat mahasiswa membuka formulir pendaftaran, input autocomplete pencarian mata kuliah secara otomatis difilter sesuai dengan kelas mahasiswa yang sedang login (`currentUser.kelas`, e.g., "Reguler A").
   - Dropdown opsi mata kuliah menampilkan badge/identitas kelas (`[Reguler A] Manajemen Keuangan (3 SKS) - Dr. Agung Wibowo, S.E., M.M.`) agar mahasiswa tidak salah mengambil kelas.
   - Untuk role Admin/Staf (jika menginput atas nama mahasiswa), filter menyesuaikan pilihan dropdown Kelas yang dipilih pada formulir.

---

## 2. Rincian Perubahan File & Komponen

### A. Frontend Web (`index.html`, `public/hostinger/index.html`, `public/gas/Index.html`)
1. **Judul Modal Formulir Pendaftaran**:
   - Mengubah elemen `<h3 id="modalPendaftaranTitle" class="text-base font-bold text-slate-800 tracking-tight">Form Pendaftaran Akademik Baru</h3>` menjadi `Form Pendaftaran Layanan Ujian Susulan dan Remedial Teaching`.
2. **Logika Autocomplete Mata Kuliah (`setupAutocomplete` pada `renderMatkulInputCards`)**:
   - Mengambil kelas mahasiswa aktif (`userClass = (currentUser && currentUser.kelas) || (document.getElementById('pendaftaranKelas') ? document.getElementById('pendaftaranKelas').value : '')`).
   - Menyaring `masterData.matkul` berdasarkan Prodi dan Kelas:
     ```javascript
     const filtered = masterData.matkul.filter(m => {
       const matchProdi = !selectedProdi || m.Kode_Prodi === selectedProdi || m['Kode Prodi'] === selectedProdi;
       const itemKelas = (m.Kelas || m.kelas || '').toString().trim().toLowerCase();
       const userKls = (userClass || '').toString().trim().toLowerCase();
       const matchKelas = !userKls || !itemKelas || itemKelas === 'semua' || itemKelas === 'semua kelas' || itemKelas === userKls;
       return matchProdi && matchKelas;
     });
     ```
   - Menampilkan badge kelas pada preview dropdown autocomplete item:
     ```html
     <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">${item.Kelas || 'Semua Kelas'}</span>
     ```
3. **Data Mock / Initial State Master Matkul**:
   - Memperbarui dataset awal `dummyMatkul` dan `masterData.matkul` agar memiliki atribut `Kelas` (misal: `"Reguler A"`, `"Reguler B"`, `"Karyawan"`).

### B. Google Apps Script Backend (`public/gas/Code.gs` & `public/gas/Setup.gs`)
1. **`Setup.gs`**:
   - Memperbarui skema header tabel `Master_Matkul`:
     `['ID', 'Kode Matkul', 'Nama Mata Kuliah', 'SKS', 'Kode Prodi', 'Dosen Pengampu', 'Kelas']`
   - Memperbarui data inisialisasi awal pada fungsi `populateSheetData()` untuk sheet `Master_Matkul` dengan kolom kelas (contoh data terisi `Reguler A`, `Reguler B`, `Karyawan`).
2. **`Code.gs`**:
   - Memperbarui struktur mapping row ke objek JSON pada endpoint `getMasterData()` dan fungsi create/update master mata kuliah agar menyertakan field `Kelas`.
   - Menambahkan skrip pembantu otomatis `upgradeMasterMatkulSchema()` yang aman dieksekusi agar jika sheet `Master_Matkul` sudah ada, kolom G `Kelas` otomatis ditambahkan tanpa menghapus data yang sudah diisi pengguna di spreadsheet.

---

## 3. Rencana Verifikasi & Uji Coba
1. **Verifikasi Visual Form Pendaftaran**:
   - Membuka form pendaftaran dan memastikan judul modal berubah menjadi `"Form Pendaftaran Layanan Ujian Susulan dan Remedial Teaching"`.
2. **Verifikasi Filter Kelas Mahasiswa**:
   - Login sebagai mahasiswa dengan kelas `Reguler A` (misal: Rizky Pratama Putra / 2311010012).
   - Mengetik pada kolom mata kuliah: memastikan hanya mata kuliah kelas `Reguler A` (dan mata kuliah umum "Semua Kelas") yang muncul pada pilihan dropdown.
3. **Verifikasi Sinkronisasi File**:
   - Menjalankan sinkronisasi kode ke seluruh target build (`index.html`, `public/hostinger/index.html`, `public/gas/Index.html`, `Setup.gs`, `Code.gs`).
   - Menjalankan `compile_applet` dan `lint_applet` untuk memastikan tidak ada kesalahan sintaks atau import.
