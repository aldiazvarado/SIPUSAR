# Perbaikan Autentikasi Login Presisi Berbasis Spreadsheet Google Sheets

Pembaruan arsitektur login untuk memastikan verifikasi kredensial (username dan password) wajib cocok persis dengan data akun di sheet `User_Staff` dan `User_Mahasiswa`, menghapus bypass *universal fallback* yang sebelumnya meloloskan input asal sebagai Master Admin, serta menyediakan penolakan akses yang tegas dan aman di semua lingkungan (Google Apps Script, Hostinger, dan GitHub Pages).

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Terkonfirmasi Berdasarkan Pilihan Pengguna:**
> - **Kebijakan Autentikasi Akun**: Wajib cocok persis (*exact match*) dengan baris akun yang terdaftar pada sheet `User_Staff` atau `User_Mahasiswa` di spreadsheet.
> - **Respons Kredensial Salah**: Sistem akan langsung **menolak akses** dan menampilkan modal peringatan (*error dialog*) bahwa username atau kata sandi tidak ditemukan/keliru. Tidak ada auto-login, tidak ada toleransi password sembarang, dan tidak ada bypass ke akun Master Admin.
> - **Dukungan Lingkungan Hostinger & GitHub Pages**: Data akun resmi dari spreadsheet disinkronkan ke penyimpanan terproteksi memori aplikasi (`appData.users_staff` dan `appData.users_mahasiswa`) saat inisialisasi awal / API fetch, sehingga verifikasi tetap akurat 100% baik saat terkoneksi langsung ke Apps Script maupun saat berjalan di web hosting mandiri.

---

### 1. Overview & Core Concept

- **Tujuan Utama**: Mengamankan gerbang autentikasi sistem SIP-AKADEMIK FEB UIKA agar hak akses 7 role (Master Admin, Admin TU, Dekan, Wakil Dekan, Ketua Program Studi, Sekretaris Program Studi, dan Mahasiswa) hanya dapat dibuka oleh pengguna yang memiliki username dan kata sandi valid di spreadsheet.
- **Permasalahan Saat Ini**:
  1. Di `Code.gs`, terdapat *universal emergency fallback* di akhir fungsi `loginUser()` yang selalu mengembalikan `success: true` dengan role Master Admin jika kredensial tidak cocok.
  2. Di `index.html` (serta salinannya di `public/gas/Index.html` dan `public/hostinger/index.html`), fungsi `handleLogin()` dan `fallbackLocalLogin()` mengisikan default username/password kosong dan meloloskan akun acak ke sesi "Aldiaz Varado (Master Admin)".
- **Hasil yang Diharapkan**:
  Input akun yang tidak terdaftar atau password yang tidak cocok akan **ditolak secara tegas** dengan notifikasi `"Username atau Kata Sandi Salah!"`, dan kolom password akan dikosongkan kembali.

---

### 2. User Experience & Visual Design

- **Alur Login Pengguna**:
  1. Pengguna membuka modal login sistem.
  2. Memasukkan Username (NPM untuk Mahasiswa, NIK/Username untuk Staff/Pejabat) dan Password.
  3. Menekan tombol **Masuk Sistem**.
  4. Tombol berubah ke status loading (*"Memverifikasi Akun..."*).
  5. **Kasus Sukses**: Jika cocok dengan data di sheet `User_Staff` atau `User_Mahasiswa`, sistem menampilkan alert sukses, menyimpan sesi resmi sesuai role akun di spreadsheet, dan membuka dashboard sesuai hak akses role.
  6. **Kasus Gagal**: Jika tidak cocok, sistem menampilkan modal SweetAlert2 berwarna merah:
     - Judul: `"Akses Ditolak"`
     - Pesan: `"Username atau kata sandi yang Anda masukkan tidak sesuai dengan data akun terdaftar FEB UIKA. Silakan periksa kembali."`
     - Tombol login dikembalikan ke status aktif dan input password dikosongkan.

- **Daftar Akun Referensi Resmi Spreadsheet FEB UIKA**:
  - **Master Admin**: Username `aldiaz` / Password `q007121997`
  - **Admin TU**: Username `410100242` / Password `123456`
  - **Dekan**: Username `dekan` / Password `dekan123`
  - **Wakil Dekan 1**: Username `wadek1` / Password `wadek111`
  - **KaProdi Manajemen**: Username `kaprodiMNJ` / Password `kaprodiMNJ123`
  - **SekProdi Akuntansi**: Username `sekprodiStudiAKT` / Password `sekprodiStudiAKT123`
  - **Mahasiswa**: Username `2311010012` (atau NPM terdaftar lainnya) / Password `123456`

---

### 3. Key Product Decisions & Trade-Offs

- **Penghapusan Universal Fallback**:
  - *Keputusan*: Menghapus total blok kode universal fallback di `Code.gs` dan `index.html` yang sebelumnya mengizinkan sembarang teks untuk masuk sebagai Master Admin.
  - *Alasan*: Menjamin integritas data, keamanan role-based access control (RBAC), dan mencegah celah keamanan fatal di mana siapa pun bisa mengakses menu Master.
- **Dual-Mode Verification (Apps Script & Hostinger Standalone)**:
  - *Keputusan*: Jika aplikasi berjalan di dalam Apps Script (`google.script.run`), verifikasi dieksekusi langsung di server backend spreadsheet. Jika berjalan di Hostinger/GitHub Pages, sistem mencocokkan input terhadap `appData.users_staff` dan `appData.users_mahasiswa` yang disinkronkan dari spreadsheet, serta mengirim permintaan verifikasi ke endpoint REST API `doPost({ action: 'loginUser' })`.
  - *Alasan*: Menjaga performa tetap secepat kilat (anti-lemot) tanpa mengorbankan kepatuhan terhadap data spreadsheet.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      ANTARMUKA LOGIN                        │
│   Input: Username (NPM / NIK / User) & Kata Sandi           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │       Apakah di lingkungan Google Apps       │
        │               Script Runtime?                │
        └──────────────┬────────────────┬──────────────┘
                       │                │
             YA (Native GAS)      TIDAK (Hostinger/GitHub)
                       │                │
                       ▼                ▼
         ┌─────────────────────────┐  ┌─────────────────────────┐
         │ google.script.run       │  │ Verifikasi memori aman  │
         │ .loginUser(user, pass)  │  │ (appData.users_staff /   │
         │                         │  │  appData.users_mahasiswa)│
         └─────────────┬───────────┘  └─────────────┬───────────┘
                       │                            │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                ┌────────────────────────────────────────┐
                │ Cocok persis di User_Staff             │
                │ atau User_Mahasiswa?                   │
                └────────────┬──────────────┬────────────┘
                             │              │
                        YA (Valid)      TIDAK (Salah)
                             │              │
                             ▼              ▼
           ┌───────────────────────────┐  ┌───────────────────────────┐
           │ • Set currentUser         │  │ • Swal Error Alert        │
           │ • Buka Dashboard Sesuai   │  │ • Reset input password    │
           │   Role (1 dari 7 Role)    │  │ • Blokir akses & batalkan │
           │ • Simpan sesi aktif       │  │   sesi                    │
           └───────────────────────────┘  └───────────────────────────┘
```

- **File yang Akan Diperbarui Secara Selaras**:
  1. `public/gas/Code.gs`: Memperbaiki `loginUser()` agar strictly query ke `User_Staff` dan `User_Mahasiswa`, membandingkan password secara presisi, dan mengembalikan `{ success: false, message: 'Username atau kata sandi tidak valid.' }` jika tidak cocok.
  2. `index.html`: Memperbaiki `handleLogin()` dan `fallbackLocalLogin()` agar memverifikasi username & password terhadap data spreadsheet, menolak input asal, serta menampilkan modal error.
  3. `public/gas/Index.html` & `public/hostinger/index.html`: Menyinkronkan perubahan logika autentikasi yang sama.
  4. `src/data/mockData.ts` & `src/types/index.ts`: Memastikan struktur tipe pengguna sinkron.
