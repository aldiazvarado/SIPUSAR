# Master Prompt V2 — Pembuatan Web App Operasional / Layanan Publik (Hybrid Vercel / GitHub Pages + Google Apps Script)

Gunakan prompt di bawah ini saat memulai proyek baru agar AI langsung membangun aplikasi web yang **kencang (anti-lemot)**, **berdesain khas (anti-slop & micro-interaction)**, **tahan banting di sisi Google Apps Script**, serta bebas dari bug sinkronisasi dan log audit.

---

## Salin Master Prompt di Bawah Ini

```markdown
Bertindaklah sebagai Senior Full-Stack Web Architect, Product Designer, sekaligus QA & Security Engineer (mengadopsi disiplin kerja Obra/Superpowers: rancang spesifikasi jelas, pecah arsitektur modular, terapkan verifikasi nyata sebelum selesai; prinsip Anthropics Frontend Design: antarmuka khas yang rapi tanpa gaya AI generik/slop; serta standar keandalan Google Apps Script ala Dietrichgebert/Ponytail).

Buatkan saya aplikasi web manajemen operasional & layanan publik bernama **[NAMA_APLIKASI]** untuk **[NAMA_INSTANSI / UNIT]** menggunakan arsitektur **Hybrid (Frontend Statis di Vercel / GitHub Pages + Backend REST API Google Apps Script & Google Sheets)** sekaligus tetap kompatibel dijalankan sebagai Web App GAS native.

---

### 1. Identitas Produk & Pembagian Peran (RBAC)
- **Domain & Tujuan Utama**: [Jelaskan singkat layanan utama, misal: pengajuan berkas/permohonan, verifikasi berjenjang, penjadwalan, dokumen digital/PDF, dan pelaporan eksekutif].
- **Peran Pengguna (Role)**:
  1. `Guest / Pemohon Umum`: Registrasi/cek status/lacak tiket tanpa membuka data pengguna lain.
  2. `Operator / Petugas`: Input, edit, verifikasi harian, dan proses penjadwalan.
  3. `Supervisor / Verifikator`: Persetujuan berjenjang dan pemantauan KPI unit.
  4. `Master Admin`: Konfigurasi penuh, kelola pengguna, endpoint GAS, optimasi data, dan hapus log (dengan jejak audit).

---

### 2. Arsitektur File & Struktur Deployment
Susun codebase yang bersih dan terorganisir:
1. **`Code.gs` (Backend REST API + Native GAS)**:
   - Menangani `doGet(e)` untuk native GAS dan `doPost(e)` berbasis `text/plain` JSON (`{ action, args }`) agar bebas preflight CORS dari Vercel/GitHub Pages.
   - Router fungsi whitelist (`allowedFunctions`) yang ketat dan validasi role server-side pada seluruh endpoint sensitif.
   - Wajib memiliki `getBackendVersionInfo()` dan metadata `backendMeta: { scriptVersion, supportsActorIdentity }` di `getInitialData()`.
2. **`Setup.gs` (Inisialisasi & Migrasi Database Google Sheets)**:
   - Otomatis membuat seluruh sheet, header berwarna kontras, *frozen row*, lebar kolom proporsional, data master awal, dan proteksi agar tidak menimpa data yang sudah ada.
3. **Frontend (`index.html` / struktur Vite modular + salinan siap GAS `Index.html`)**:
   - Satu konstanta tunggal `DEFAULT_GAS_API_URL` beserta fungsi auto-migrasi URL lama di `localStorage` sehingga semua browser user selalu mengarah ke deployment `/exec` terbaru.
   - Indikator status versi GAS otomatis (`GAS Sinkron` vs `GAS Versi Lama`) lengkap dengan tombol **Cek Versi GAS**.
4. **`vercel.json` (Optimasi Header Caching & Kompresi Hosting)**:
   - Atur `Cache-Control` agresif (`public, max-age=31536000, immutable`) untuk aset statis ber-hash/WebP/logo/JS/CSS eksternal dan `no-cache` untuk `index.html` agar pembaruan halaman langsung terbaca user tanpa stuck versi lama.

---

### 3. Fitur Wajib Inti & Ketahanan Sistem
1. **Dashboard Eksekutif**: Ringkasan KPI, grafik proporsional (Chart.js di-load dengan `defer`), serta filter periode & unit kerja aktif.
2. **Alur Transaksi Utama & Persetujuan Massal**: CRUD penuh tanpa reload halaman, pencarian cepat (*live search*), filter multi-kriteria, pagination, modal edit dinamis, dan aksi massal (*bulk action*) dengan validasi checkbox `:not(:disabled)`.
3. **Import / Smart Sync Excel & Export Laporan**:
   - Unduh template `.xlsx`, pratinjau tabel sebelum unggah, **konversi otomatis tanggal & jam serial Excel ke `YYYY-MM-DD` dan `HH:mm`**.
   - Auto-increment ID aman untuk ribuan baris (`padStart` minimal 3–4 digit tanpa pernah memotong angka >= 1000 dengan `slice(-3)`).
   - Export Excel rapi & cetak dokumen/kartu PDF dengan QR Code verifikasi.
4. **Log Aktivitas Sistem Persisten (Audit Anti-Fitnah)**:
   - Simpan di sheet `Log_Aktivitas` dan cadangan `PropertiesService`.
   - Kolom `Pengguna` **WAJIB** selalu menyimpan **Nama Lengkap** asli (resolusi berlapis: payload → `currentUser` → `localStorage` → lookup `User_Staff` / `User_Pemohon` / `Session.getActiveUser().getEmail()`), dan **menolak keras** string berjenis role (`Admin`, `Operator`, `User`, `Sistem`) masuk ke kolom `Pengguna`.
   - Kolom `Role` disimpan secara terpisah di kolom `Role`.
   - Format ID unik `LOG-yyyyMMdd-HHmmss-SSS-rand2` untuk mencegah tabrakan saat aksi beruntun/massal.
5. **Mode Cache Pintar + Fallback Lokal**:
   - *Stale-While-Revalidate* agar dashboard tampil < 0.5 detik dari `localStorage`, lalu sinkronisasi realtime di background.
   - Seluruh aksi CRUD memiliki handler `appendLocalActivityLog` & fallback lokal yang seragam saat offline.

---

### 4. Standar Web Anti-Lemot (Wajib Diterapkan & Diukur)
- **Script Loading**: Seluruh skrip eksternal non-kritis (Chart.js, XLSX, QR, SweetAlert) menggunakan atribut `defer` atau *dynamic import* saat modal/fitur dibuka agar First Contentful Paint (FCP) secepat mungkin.
- **Tipografi Ringan**: Maksimal 1–2 keluarga font saja (misal `Plus Jakarta Sans` + fallback sistem), WAJIB menyertakan `display=swap` (`font-display: swap`), dan hindari bobot font yang tidak terpakai.
- **Optimasi Media & Gambar**:
  - Kompres seluruh aset gambar/ilustrasi ke format **WebP**.
  - Gambar di area *above-the-fold* (Logo instansi & Hero) wajib memakai `loading="eager"` dan `fetchpriority="high"` dengan atribut `width`/`height` eksplisit untuk mencegah CLS.
  - Gambar/lampiran/bukti di dalam daftar tabel atau bagian bawah halaman wajib memakai `loading="lazy"` dan `decoding="async"`.
- **Caching & Kompresi**:
  - Aktifkan Gzip/Brotli di server/CDN (Vercel otomatis; sertakan konfigurasi `.htaccess` / `vercel.json` `Cache-Control` untuk logo, CSS, JS, dan gambar WebP).
- **Optimasi GAS Backend**:
  - Gunakan `CacheService.getScriptCache()` untuk `getInitialData`, `LockService` pada setiap operasi tulis, serta operasi batch `getRange(...).getValues()` / `setValues()` (dilarang memanggil `appendRow` atau `getRange` di dalam loop).

---

### 5. Standar UI/UX (Anti-Slop & Micro-Interaction)
- **Anti-Slop Design**: Hindari tampilan generik berbanyak gradient ungu/biru murahan atau kartu seragam penuh badge pil berlebihan. Gunakan hierarki tipografi yang tegas, kontras permukaan bersih, garis batas halus (`1px solid`), dan komposisi ruang yang lapang sesuai karakter instansi resmi yang modern.
- **Micro-Interaction Bermakna**:
  - Transisi halus (`150–220ms`) pada hover tombol, pembukaan modal/drawer, dan tab switching.
  - Tombol aksi menampilkan state loading (*spinner + disable double-click*) saat memanggil API.
  - Toast notification non-intrusif untuk pembaruan data, serta dialog konfirmasi bertingkat untuk aksi destruktif.
- **Kelengkapan UI States**: Setiap tabel, modal, dan kartu statistik wajib memiliki 4 kondisi lengkap: **Loading State** (skeleton/shimmer, bukan layar kosong), **Empty State** (pesan ramah + tombol CTA), **Error State** (pesan jelas + tombol Coba Lagi), dan **Offline/Fallback Banner**.

---

### 6. Keamanan & Aturan Ketat Sebelum Selesai (Audit Checklist)
- **Anti Timezone Drift**: Normalisasi tanggal menggunakan string naif `YYYY-MM-DD HH:mm:ss` (`Utilities.formatDate` & `getDisplayValues()`) agar tanggal Indonesia (WIB) tidak pernah bergeser H-1 akibat konversi UTC.
- **Keamanan Input & XSS**: Sanitasi seluruh string user sebelum dirender ke HTML DOM (`escapeHtml`), validasi tipe/ukuran unggahan file, dan tolak submit kosong pada seluruh form.
- **Verifikasi Mandiri Sebelum Klaim Selesai**:
  - Jalankan pengujian sintaks + unit test otomatis untuk: konversi tanggal/jam, resolusi Nama Lengkap pada log audit, migrasi cache URL endpoint, dan pengecekan izin role.
  - Pastikan tidak ada konsol error, broken layout di viewport mobile (`375px`) maupun desktop (`1440px`), serta seluruh salinan deploy sinkron identik.

Mulailah dengan menyusun struktur skema sheet `Setup.gs` & kontrak API `Code.gs` terlebih dahulu, lalu lanjutkan membangun frontend dan konfigurasi deployment lengkapnya.
```

---

## Tip Tambahan: Alur 5 Prompt PRD Sebelum Coding
Jika Anda ingin mematangkan ide proyek baru sebelum menempelkan Master Prompt di atas ke AI coding tool:
1. Jalankan **5 prompt PRD secara berurutan** (Konteks & 7 pertanyaan → Role & 8 User Story → Prioritas MVP → Sitemap, DB & API → Audit QA & Security).
2. Tempelkan hasil ringkasan PRD final tersebut ke bagian **`Identitas Produk & Pembagian Peran`** di dalam **Master Prompt V2** di atas.
3. Hasilnya AI akan langsung memiliki konteks bisnis + standar teknis yang lengkap tanpa mengulang bug lama.
