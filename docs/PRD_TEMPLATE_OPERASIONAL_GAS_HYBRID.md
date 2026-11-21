# Project Requirement Document (PRD) — Template Aplikasi Manajemen Operasional & Layanan Publik (Hybrid Vercel/GitHub Pages + Google Apps Script)

Dokumen ini disusun menggunakan kerangka **5 Tahap PRD Siap Coding** yang dipadukan dengan standar **Web Anti-Lemot**, **UI/UX Anti-Slop & Micro-Interaction**, serta hasil **Audit Celah Operasional & Keamanan** untuk arsitektur Hybrid Static Hosting + Google Apps Script.

---

## Tahap 1 — Konteks Bisnis, Alur Utama, Role & Batasan Teknis

### 1.1 Ringkasan Produk
- **Nama Template Sistem**: **SIP-OPERASIONAL Hybrid Core** *(dapat diganti sesuai instansi/proyek berikutnya)*.
- **Masalah yang Diselesaikan**: Proses layanan administrasi/publik berbasis formulir manual, Excel tersebar, dan pesan chat sering menimbulkan data ganda, keterlambatan persetujuan, kesulitan pelacakan status oleh pemohon, serta audit trail yang tidak mencatat identitas petugas secara akurat.
- **Tujuan Bisnis**:
  1. Memusatkan pengajuan layanan, verifikasi, penjadwalan/penugasan, dan penerbitan dokumen bukti digital dalam satu portal cepat.
  2. Memanfaatkan Google Sheets sebagai database transparan siap audit tanpa biaya server database mahal.
  3. Menjamin kecepatan akses (< 1 detik tampil dari cache + sinkronisasi real-time) melalui hosting statis modern (Vercel / GitHub Pages).

### 1.2 Alur Utama (Core Loop)
1. **Konfigurasi Periode & Master Data** oleh Admin (unit kerja, layanan, jadwal/kuota, tarif/denda bila ada).
2. **Pengajuan Layanan** oleh Pemohon/Operator lengkap dengan unggahan bukti ke Google Drive.
3. **Verifikasi & Persetujuan Berjenjang** (satuan maupun massal) oleh Operator/Supervisor disertai pencatatan **Nama Lengkap & Role** pada Log Aktivitas.
4. **Penjadwalan / Eksekusi Layanan & Penerbitan Dokumen Resmi** (Kartu/Surat Digital ber-QR Code + Ekspor Excel).

### 1.3 Batasan Teknis & Arsitektur
- **Frontend**: HTML5/CSS/JS Modern (Tailwind CSS terkompilasi atau Vite build) di-host di Vercel / GitHub Pages (otomatis mendukung Gzip/Brotli).
- **Backend API & DB**: Google Apps Script Web App (`Code.gs` via `doPost` `text/plain` JSON + `Setup.gs`) terhubung ke Google Sheets & Google Drive.
- **Batasan Penting**:
  - Tidak ada API key sensitif di kode frontend.
  - Maksimal waktu eksekusi per request GAS < 25 detik (operasi panjang harus memakai batch `setValues()` / chunking).
  - Semua tanggal diproses dengan format string naif zona waktu lokal (`Asia/Jakarta`) untuk mencegah pergeseran UTC.

---

## Tahap 2 — Pembagian Role (RBAC), 2 Persona Utama & 8 User Stories

### 2.1 Matriks Pembagian Hak Akses (Role)

| Hak Akses | Pemohon / Guest | Operator / Petugas | Supervisor / Verifikator | Master Admin |
| :--- | :---: | :---: | :---: | :---: |
| Ajukan permohonan & pantau status milik sendiri | Ya | Ya (bantu input) | Tidak perlu | Ya |
| Lihat daftar seluruh pengajuan unit/semua | Hanya milik sendiri | Ya | Ya (unit terkait / semua) | Ya |
| Setujui / tolak pengajuan & ubah status bayar | Tidak | Ya | Ya (approve final) | Ya |
| Kelola penjadwalan / penugasan & upload Excel | Tidak | Ya | Lihat & pantau | Ya |
| Cetak dokumen/kartu digital & ekspor laporan | Milik sendiri (jika lolos syarat) | Ya | Ya | Ya |
| Kelola master data, user, & pengaturan endpoint GAS | Tidak | Terbatas master | Tidak | Ya |
| Lihat & bersihkan Log Aktivitas Sistem | Tidak | Lihat saja | Lihat saja | Lihat & kosongkan (tercatat audit) |

### 2.2 Dua Persona Utama

1. **Rani (21 tahun — Pemohon / Pengguna Layanan Publik)**
   - **Karakteristik**: Mengakses dari HP Android berjaringan 4G standar; butuh kepastian status berkas tanpa harus datang ke loket.
   - **Kebutuhan Utama**: Halaman ringan cepat terbuka, form sederhana anti-error, status transparan (*Menunggu → Disetujui → Terjadwal*), dan kartu digital siap unduh.
2. **Bapak Hendra (34 tahun — Operator / Staf Administrasi Operasional)**
   - **Karakteristik**: Membuka portal dari laptop kantor bersama beberapa staf lain setiap hari; sering memproses puluhan berkas sekaligus dan mengimpor data jadwal dari Excel.
   - **Kebutuhan Utama**: Filter/pencarian instan, persetujuan massal 1-klik yang aman, impor Excel bebas error format tanggal/jam, serta jejak audit jelas siapa staf yang mengubah status.

### 2.3 Delapan User Stories & Acceptance Criteria

1. **Sebagai Pemohon**, saya ingin mengajukan permohonan layanan beserta lampiran berkas secara online, supaya tidak perlu mengantre di loket dan status saya langsung tercatat.
   - *AC1*: Form menolak pengajuan jika field wajib kosong atau format berkas melebihi batas ukuran dan menampilkan pesan error yang spesifik.
   - *AC2*: Setelah submit sukses, tiket baru berstatus awal langsung muncul di riwayat pemohon serta tersimpan di Google Sheets & Log Aktivitas dengan nama pemohon.
2. **Sebagai Pemohon**, saya ingin memantau status persetujuan, pembayaran, dan jadwal pelaksanaan saya secara real-time, supaya saya tahu langkah lanjutan yang harus dilakukan.
   - *AC1*: Pemohon hanya melihat data miliknya sendiri berdasarkan ID/NPM/NIK login (isolasi data terjamin).
   - *AC2*: Saat periode normal berakhir dan masuk masa terlambat, sistem otomatis menampilkan status periode dan estimasi biaya tambahan secara akurat tanpa selisih tanggal timezone.
3. **Sebagai Pemohon**, saya ingin mengunduh kartu/dokumen bukti digital ber-QR Code setelah syarat terpenuhi, supaya dapat ditunjukkan saat verifikasi lapangan.
   - *AC1*: Tombol unduh/cetak aktif hanya jika status persetujuan dan prasyarat jadwal sudah terpenuhi; jika belum, tampil penjelasan yang mudah dipahami.
   - *AC2*: Hasil cetak/PDF menampilkan identitas, jadwal, dan QR Code yang rapi pada kertas A4/mobile preview.
4. **Sebagai Operator**, saya ingin mencari, memfilter, dan menyetujui banyak permohonan sekaligus, supaya pemrosesan ratusan berkas tidak memakan waktu seharian.
   - *AC1*: Kotak centang "Pilih Semua" hanya memilih baris yang memenuhi syarat (mengabaikan baris yang berstatus terkunci/disabled).
   - *AC2*: Aksi persetujuan massal memperbarui Google Sheets dalam satu operasi batch (`setValues`), memperbarui tampilan tanpa reload, dan mencatat nama lengkap Operator di Log Aktivitas.
5. **Sebagai Operator**, saya ingin mengimpor data jadwal atau master pengguna melalui file Excel (`.xlsx`/`.csv`), supaya input data massal tidak perlu dilakukan satu per satu.
   - *AC1*: Sistem mempratinjau 4–5 baris awal data dan otomatis mengonversi angka serial tanggal/jam Excel menjadi format standar `YYYY-MM-DD` dan `HH:mm`.
   - *AC2*: Penomoran ID baru otomatis mengikuti angka tertinggi di sheet tanpa memotong digit ribuan (misal `JDW-1012` tetap utuh, bukan `JDW-012`).
6. **Sebagai Supervisor**, saya ingin melihat dashboard ringkasan KPI, grafik tren, dan status antrean pending, supaya saya dapat memantau kinerja layanan per unit.
   - *AC1*: Dashboard langsung merender angka dari cache lokal (< 0.5 detik) saat dibuka lalu memperbarui senyap begitu data server tiba.
   - *AC2*: Grafik tetap responsif dan menampilkan *empty state* yang rapi ketika jumlah data masih nol.
7. **Sebagai Master Admin**, saya ingin melihat Log Aktivitas Sistem yang mencatat nama lengkap pelaku dan rolenya secara terpisah, supaya audit pertanggungjawaban operasional bebas kekeliruan.
   - *AC1*: Kolom `Pengguna` selalu berisi Nama Lengkap asli (tidak pernah berisi nama role seperti `Admin` atau `Operator`), sedangkan `Role` berada di kolom tersendiri.
   - *AC2*: Setiap ID log unik sampai level milidetik + angka acak sehingga eksekusi beruntun tidak pernah duplikat ID.
8. **Sebagai Master Admin**, saya ingin sistem otomatis mendeteksi jika Web App Google Apps Script masih menjalankan versi kode lama, supaya tidak terjadi ketimpangan perilaku antar perangkat staf.
   - *AC1*: Panel status koneksi mengecek metadata versi backend secara otomatis saat muat awal dan menyediakan tombol **Cek Versi GAS**.
   - *AC2*: Jika URL endpoint default diperbarui di aplikasi web, cache URL lama pada browser seluruh staf otomatis bermigrasi tanpa perlu pengaturan manual ulang.

---

## Tahap 3 — Prioritas Fitur MVP

### Kelompok 1: Wajib (Must-Have) — Maksimal 5 Fitur Inti
1. **Portal Pengajuan & Pelacakan Status Layanan** *(Kerumitan: Sedang)*
   - *Alasan*: Merupakan inti alur layanan dari sisi pemohon dan menggantikan input manual.
2. **Manajemen Verifikasi, Persetujuan Massal & Pembayaran** *(Kerumitan: Sedang)*
   - *Alasan*: Menghilangkan bottleneck harian Operator dengan validasi batch aman di `Code.gs`.
3. **Upload & Smart Sync Excel (Konversi Serial Date/Time & Export Laporan)** *(Kerumitan: Tinggi)*
   - *Alasan*: Operasional nyata selalu membutuhkan unggah data massal dari spreadsheet lokal staf dan laporan ekspor resmi.
4. **Log Aktivitas Audit Anti-Hilang + Deteksi Versi GAS** *(Kerumitan: Sedang)*
   - *Alasan*: Menjamin transparansi audit siapa mengubah apa serta memastikan seluruh browser tersinkron ke skrip backend terbaru.
5. **Dashboard Eksekutif & Cetak Bukti Digital PDF/QR** *(Kerumitan: Sedang)*
   - *Alasan*: Memberikan visibilitas manajerial instan sekaligus luaran bukti resmi bagi pemohon.

*(Fitur fondasi standar seperti Autentikasi/Login, RBAC Multi-Role, dan Manajemen Master Data termasuk syarat dasar sistem).*

### Kelompok 2: Bagus Kalau Ada (Nice-to-Have)
- Notifikasi dalam aplikasi terarah per role/pengguna (*broadcast* pengumuman periode).
- Arsip data per semester/tahun buku otomatis ke sheet arsip terpisah & tool optimasi baris kosong.
- Unggah bukti otomatis terarsip per folder kategori di Google Drive (mengganti base64).

### Kelompok 3: Nanti Dulu (Future)
- Integrasi asisten tanya jawab AI berbasis Gemini (dipanggil melalui endpoint backend aman dengan pembatasan konteks sesuai role).
- Pembayaran otomatis berbasis Payment Gateway / Virtual Account callback.
- Ekspor & kirim notifikasi otomatis via WhatsApp Gateway / Email SMTP.

---

## Tahap 4 — User Flow, Sitemap Desktop/Mobile, Database Google Sheets & API

### 4.1 User Flow Utama (End-to-End)
```text
[Buka Web App] -> [Render Instant dari Cache Lokal + Cek Sesi]
      |
      +---> Belum Login -> [Halaman Login / Info Layanan Publik] -> [Autentikasi GAS / Fallback]
      |
      +---> Pemohon -----> [Dashboard Status & Periode] -> [Form Pengajuan + Upload Bukti]
      |                         -> [Menunggu Verifikasi] -> [Terjadwal] -> [Unduh Kartu PDF/QR]
      |
      +---> Operator ----> [Daftar Pengajuan] -> [Filter/Cari] -> [Approve Satuan / Massal]
      |                         -> [Atur Jadwal / Upload Excel] -> [Sinkron ke Sheet & Log]
      |
      +---> Master Admin -> [Dashboard KPI] -> [Master Data & Audit Log + Cek Versi GAS]
                                -> [Kelola Endpoint GAS / Optimasi Storage / Arsip]
```

### 4.2 Sitemap & Penyesuaian UI Desktop vs Mobile

| Halaman / Tab Modul | Rute / State ID | Komponen Utama | Desktop (>= 1024px) | Mobile (< 768px) |
| :--- | :--- | :--- | :--- | :--- |
| Autentikasi & Publik | `/login` | Kartu login, info periode aktif, bantuan cepat | Layout 2 kolom (branding instansi + form) | Kartu tunggal full-width, logo ringkas di atas |
| Dashboard KPI | `/dashboard` | 4 KPI cards, 2 grafik Chart.js, ringkasan antrean | Grid 4 kolom KPI + 2 kolom chart | Stack 1–2 kolom, grafik scrollable tinggi tetap |
| Transaksi / Pengajuan | `/submissions` | Filter bar, action toolbar, bulk bar, tabel data | Tabel penuh dengan sticky header & aksi inline | Filter stack vertikal, tabel overflow-x + badge ringkas |
| Penjadwalan & Excel Sync | `/schedule` | Form penjadwalan, modal Smart Sync Excel + preview | Modal lebar max-w-2xl + tabel pratinjau 4 baris | Drawer/modal full-height, tombol aksi sticky di bawah |
| Dokumen Digital (PDF/QR) | `/documents` | Kartu/surat siap cetak dengan QR & kop instansi | Preview A4 berpusat + tombol cetak PDF | Skalakan preview fit-screen + tombol download utama |
| Master Data & Log Audit | `/master` | Tabel referensi, panel Log Aktivitas, status versi GAS | Grid master 2 kolom + panel log lebar penuh | Accordion / stack 1 kolom, filter log ringkas |
| Pengaturan Sistem (Admin) | `/settings` | Endpoint GAS URL, Cek Versi GAS, Optimasi & Arsip | Panel tabulasi + salin kode `Code.gs`/`Setup.gs` | Stack vertikal dengan copy button besar |

### 4.3 Skema Database Google Sheets (`Setup.gs`)

| Nama Sheet | Kolom Utama | Primary Key | Catatan Desain |
| :--- | :--- | :--- | :--- |
| `User_Staff` | `ID`, `Username`, `PasswordHash`, `Role`, `Nama Lengkap`, `NIK`, `Email`, `Unit/Prodi` | `Username` / `NIK` | `Nama Lengkap` wajib valid (bukan nama role) |
| `User_Pemohon` | `ID`, `Username`, `PasswordHash`, `Role`, `Nama Lengkap`, `NomorInduk`, `Unit/Kategori`, `Angkatan`, `Status` | `NomorInduk` / `Username` | Diindeks cepat saat login & pemetaan log |
| `Periode_Layanan` | `ID`, `Tahun`, `SubPeriode`, `JenisLayanan`, `Kategori`, `Mulai`, `Selesai`, `MulaiTerlambat`, `SelesaiTerlambat`, `BiayaDenda`, `Status` | `ID` (`PRD-...`) | Seluruh tanggal disimpan sbg teks naif `YYYY-MM-DD HH:mm:ss` |
| `Pengajuan` | `ID`, `Tanggal`, `PeriodeID`, `NomorInduk`, `NamaPemohon`, `Unit`, `Layanan`, `Detail`, `LampiranURL`, `StatusJadwal`, `Nominal`, `StatusBayar`, `StatusPersetujuan`, `Catatan` | `ID` (`REG-1001`) | ID menggunakan increment aman >= 4 digit |
| `Jadwal_Operasional` | `ID`, `TanggalJadwal`, `JamMulai`, `JamSelesai`, `Lokasi/Ruangan`, `Unit`, `Detail`, `PenanggungJawab`, `Jenis`, `Keterangan` | `ID` (`JDW-1001`) | Mendukung sinkron kolom peserta di kanan sheet |
| `Log_Aktivitas` | `ID`, `Waktu`, `Pengguna`, `Role`, `Aksi`, `Target`, `Keterangan` | `ID` (`LOG-yyyyMMdd-HHmmss-SSS-XX`) | Append-only audit log + cadangan di `PropertiesService` |

### 4.4 Daftar Endpoint REST API Utama (`Code.gs` via `doPost`)

| Action | Parameter Utama | Hak Akses | Fungsi |
| :--- | :--- | :--- | :--- |
| `getBackendVersionInfo` | `-` | Semua | Mengembalikan versi skrip aktif & fitur yang didukung |
| `getInitialData` | `userRole, username, unit` | Authenticated | Memuat master data, transaksi terfilter role, log, & `backendMeta` |
| `checkRealtimeSync` | `clientVersion` | Authenticated | Polling ringan berbasis composite version signature |
| `loginUser` / `changePassword` | Kredensial & actor meta | Semua / Owner | Autentikasi user & pembaruan sandi terlog |
| `createSubmission` / `updateSubmission` / `deleteSubmission` | Payload + `actorName`, `actorRole` | Pemohon / Operator / Admin | CRUD pengajuan + upload lampiran Drive |
| `updateApprovalStatus` / `bulkUpdateApproval` | `ids, status, actorName, actorRole` | Operator / Supervisor / Admin | Persetujuan satuan & batch dengan validasi RBAC |
| `updatePaymentStatus` | `id, status, note, actorName, actorRole` | Operator / Admin | Pembaruan status pembayaran |
| `batchSyncMasterData` | `sheetName, rows, actorName, actorRole` | Admin / Operator | Sinkronisasi batch Excel dengan normalisasi tanggal & ID |
| `clearActivityLogs` / `archiveSemesterData` | `actorRole, actorName, filter` | Master Admin | Pembersihan log berjejak audit & pengarsipan berkala |

---

## Tahap 5 — Audit Celah QA, Keamanan & Checklist Performa Anti-Lemot

### 5.1 Temuan Audit & Mitigasi Edge Cases

1. **Sinkronisasi Versi Deployment GAS vs Cache Browser (Anti-Drift)**
   - *Risiko*: Admin men-deploy *Deployment baru* sehingga URL `/exec` berubah, namun staf lain masih memakai URL default lama yang masih menjalankan `Code.gs` lawas.
   - *Solusi*: Tetapkan `DEFAULT_GAS_API_URL` tunggal, tambahkan tabel `LEGACY_GAS_DEPLOYMENT_IDS` untuk auto-migrasi `localStorage` user lama, dan tampilkan peringatan visual bila `backendMeta.scriptVersion` tidak cocok.
2. **Integritas Identitas Log Aktivitas**
   - *Risiko*: Jika frontend/backend lupa mengirim nama aktor atau sesi belum terhidrasi, kolom `Pengguna` terisi nilai generik seperti `'Admin'` atau `'Admin TU'`.
   - *Solusi*: Terapkan fungsi `resolveActorIdentity` (di backend & frontend) yang menolak label role masuk ke `Pengguna`, memetakan ulang username/ID/email ke `Nama Lengkap` dari master user, dan menyimpan role di kolom `Role` terpisah.
3. **Konversi Data Excel & Pemotongan ID**
   - *Risiko*: Excel mengirim tanggal sebagai angka serial (`46315`), jam sebagai pecahan desimal (`0.3333`), dan generator ID memakai `.slice(-3)` yang merusak nomor >= `1000`.
   - *Solusi*: Konversi serial tanggal/jam SheetJS secara eksplisit sebelum preview & di server, serta gunakan padding angka utuh (`num >= 1000 ? String(num) : padStart(3, '0')`).
4. **Keamanan & Isolasi Data**
   - *Risiko*: Mahasiswa/Pemohon mencoba memanipulasi DOM atau memanggil endpoint persetujuan massal / hapus log.
   - *Solusi*: Validasi ulang `userRole` di sisi backend `Code.gs` pada setiap fungsi sensitif (bukan hanya menyembunyikan tombol di UI), serta filter baris data milik Pemohon langsung di server pada `getInitialData`.
5. **Kelengkapan UI States**
   - *Loading State*: Skeleton screen / spinner dengan penguncian tombol ganda (*double-submit prevention*).
   - *Empty State*: Ilustrasi ringan + teks jelas + tombol aksi cepat saat filter/pencarian tidak menghasilkan baris.
   - *Error State*: Pesan penyebab yang ramah pengguna (bahasa Indonesia) dengan tombol **Coba Lagi**, serta mode offline banner jika endpoint gagal dijangkau.

### 5.2 Checklist Verifikasi "Web Anti-Lemot" & "Anti-Slop"

| Aspek | Standar Wajib | Target Verifikasi |
| :--- | :--- | :--- |
| Script Eksternal | Gunakan atribut `defer` atau *lazy dynamic load* untuk library grafik/Excel | Tidak ada `<script>` eksternal render-blocking di `<head>` |
| Tipografi | Maksimal 2 jenis font, Google Fonts dengan `&display=swap` (`font-display: swap`) | Teks langsung terbaca (*zero invisible text flash*) |
| Aset Gambar | Kompresi ke **WebP**; logo/hero memakai `loading="eager"` + `fetchpriority="high"`; gambar lain `loading="lazy"` | Ukuran total gambar awal < 150 KB, zero layout shift (CLS ~ 0) |
| Caching & Kompresi | `Cache-Control` panjang (`immutable`) untuk logo/CSS/JS statis & `no-cache` untuk HTML; aktifkan **Brotli/Gzip** | Verifikasi header respons HTTP di Vercel / CDN |
| UI/UX & Micro-Interaction | Hierarki jelas, kontras WCAG AA, transisi halus 150–220ms, feedback toast instan, responsif 375px–1440px | Lolos pemeriksaan visual Desktop & Mobile tanpa horizontal scroll nyasar |
