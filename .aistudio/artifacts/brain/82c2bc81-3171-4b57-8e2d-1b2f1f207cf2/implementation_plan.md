# Perbaikan Tampilan Riwayat Pendaftaran Mahasiswa

Memperbaiki visibilitas riwayat pendaftaran bagi akun Mahasiswa agar berkas yang baru didaftarkan maupun berkas yang ada di Google Spreadsheet langsung muncul seketika di tabel Riwayat Pendaftaran tanpa terhalang filter yang tidak sinkron atau ketidakcocokan NPM/Username.

## User Review & Critical Decisions

> [!IMPORTANT]
> Tiga keputusan utama telah dikonfirmasi dan akan menjadi acuan implementasi:

- **Confirmed Decision 1: Kriteria Pencocokan Fleksibel (NPM & Nama Mahasiswa)**: Sistem mencocokkan riwayat pendaftaran mahasiswa yang sedang login tidak hanya berdasarkan NPM/NIM yang kaku, melainkan mencocokkan NPM, NIM, Username, atau Nama Mahasiswa secara fleksibel (*case-insensitive & trimmed*). Dengan demikian, data seperti akun `Test Adzkia` (NPM: `444`) akan langsung mencocokkan entri pendaftaran bernomor `REG-1002` dan `REG-1003`.
- **Confirmed Decision 2: Pembaruan Seketika (Optimistic UI Update)**: Ketika mahasiswa menekan tombol "Kirim Pendaftaran", formulir langsung menyuntikkan data baru ke dalam state lokal `appData.pendaftaran` dan cache lokal (`localStorage`) serta langsung memanggil `renderPendaftaranTable()` seketika. Sinkronisasi dengan Google Apps Script / Spreadsheet dijalankan di latar belakang dengan indikator status sinkron yang ramah.
- **Confirmed Decision 3: Default Nilai Filter Riwayat**: Dropdown filter pada tabel riwayat mahasiswa akan selalu diset awal ke **"Semua Program Studi"** dan **"Semua Status"** untuk memastikan berkas yang baru didaftarkan tidak hilang akibat filter otomatis. Selain itu, ID elemen filter di HTML dan JavaScript (`filterPendaftaranProdi` vs `pendaftaranFilterProdi`) diselaraskan agar pembacaan nilai filter tidak mengalami kegagalan (undefined).

---

## 1. Overview & Core Concept

- **Apa yang Dilakukan**: Memastikan mahasiswa yang mendaftar ujian susulan/remidi dapat langsung melihat berkas pendaftarannya di tabel *"Pendaftaran & Cek Riwayat Pendaftaran Mahasiswa"*, baik sesaat setelah pengisian formulir berhasil maupun saat membuka halaman riwayat pendaftaran.
- **Target Pengguna**: Mahasiswa FEB UIKA Bogor (khususnya role `Mahasiswa`) dan Admin Akademik.
- **Nilai Utama**: Menghilangkan kebingungan mahasiswa akibat pesan *"Tidak ada berkas pendaftaran yang cocok dengan filter"*, memberikan kepastian bahwa pendaftaran telah tercatat dan sedang diproses, serta menjamin konsistensi data antara antarmuka web dan Google Sheets.

---

## 2. User Experience & Visual Design

- **Alur Pengguna Mahasiswa**:
  1. Mahasiswa login ke sistem (misal akun `Test Adzkia`, NPM: `444`).
  2. Mahasiswa membuka menu **Pendaftaran & Cek Riwayat**. Banner menampilkan identitas `(NPM: 444)`.
  3. Tabel memuat seluruh berkas pendaftaran milik mahasiswa tersebut dengan status `Pending`, `Disetujui`, atau `Terjadwal`.
  4. Ketika mahasiswa mengklik **+ Tambah Pendaftaran** dan mengirim formulir:
     - Modal ditutup dan notifikasi sukses muncul (*toast notification*).
     - Baris pendaftaran baru langsung terpampang di urutan teratas tabel riwayat mahasiswa secara instan.
     - Di latar belakang, proses kirim ke Google Apps Script (Spreadsheet) berjalan; setelah selesai, ID pendaftaran resmi (misal `REG-1005`) dan status diselaraskan tanpa me-reset tampilan tabel mahasiswa.
- **Kerapian Filter**:
  - Filter pencarian nama/matkul/NPM tetap responsif.
  - Filter Program Studi dan Status secara default menampilkan opsi "Semua", sehingga seluruh berkas pendaftaran mahasiswa tetap terlihat jelas.
- **Umpan Balik Visual**:
  - Menampilkan badge status pendaftaran yang jelas: `Pending` (Kuning), `Disetujui` (Biru), `Terjadwal` (Hijau), `Ditolak` (Merah).

---

## 3. Key Product Decisions & Trade-Offs

- **Pencocokan Multi-Atribut (NPM, NIM, Nama Lengkap, Username)**:
  - *Pendekatan*: Mengecek apakah `item.NPM`, `item.NIM`, atau `item['Nama Mahasiswa']` cocok dengan `currentUser.npm`, `currentUser.username`, atau `currentUser.nama`.
  - *Alasan*: Menghindari kasus di mana akun mahasiswa login menggunakan Username (nama) atau format nomor NPM di spreadsheet memiliki spasi/tipe data berbeda, sehingga data tetap valid dan muncul di akun mahasiswa yang tepat.
- **Perbaikan Mismatch ID Elemen HTML**:
  - *Pendekatan*: Menyelaraskan atribut ID elemen select filter di `index.html`, `public/hostinger/index.html`, dan `public/gas/Index.html` antara DOM (`filterPendaftaranProdi`, `filterPendaftaranStatus`) dan kode JavaScript (`pendaftaranFilterProdi`, `pendaftaranFilterStatus`).
- **Penyelarasan Backend GAS (`getInitialData` di `Code.gs`)**:
  - *Pendekatan*: Pada fungsi `getInitialData` di `Code.gs`, filter role `Mahasiswa` diperluas agar juga mencocokkan `item['Nama Mahasiswa']` dan `item.NPM` secara case-insensitive terhadap parameter mahasiswa yang aktif.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Sesi Mahasiswa                        │
│   currentUser = { username: "444", nama: "Test Adzkia",     │
│                   npm: "444", role: "Mahasiswa" }           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Form Tambah Pendaftaran Submit
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Optimistic UI Handler (Client-Side)             │
│ 1. Buat record pendaftaran lokal sementara                  │
│ 2. Masukkan ke appData.pendaftaran (unshift/prepend)        │
│ 3. Simpan ke cache lokal (localStorage)                     │
│ 4. Jalankan renderPendaftaranTable() seketika               │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        Tampil Langsung                 Background Sync
               │                              │
               ▼                              ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│   Tabel Riwayat Mahasiswa   │  │    Google Apps Script      │
│ Filter:                     │  │    google.script.run       │
│ - NPM / NIM match OR        │  │    .addPendaftaran(...)    │
│ - Nama Mahasiswa match      │  │            │               │
│ - Default: Semua Prodi &    │  │            ▼               │
│   Semua Status              │  │  Google Spreadsheet       │
│ Hasil: 2+ Berkas Ditampilkan│  │  Sheet "Pendaftaran"      │
└─────────────────────────────┘  └────────────────────────────┘
```

### Data Model & State Mapping
- **Identitas Mahasiswa**:
  - `currentUser.npm`: Nilai NPM (misal `"444"`).
  - `currentUser.nama`: Nama lengkap (misal `"Test Adzkia"`).
  - `currentUser.username`: Username login (bisa NPM atau email).
- **Kondisi Filter Tabel Mahasiswa (`renderPendaftaranTable`)**:
  ```javascript
  if (currentUser.role === 'Mahasiswa') {
    const myNpm = String(currentUser.npm || currentUser.username || '').trim().toLowerCase();
    const myName = String(currentUser.nama || '').trim().toLowerCase();
    list = list.filter(p => {
      const pNpm = String(p.NPM || p.NIM || '').trim().toLowerCase();
      const pName = String(p['Nama Mahasiswa'] || p.nama || '').trim().toLowerCase();
      return (myNpm && pNpm === myNpm) || (myName && pName === myName) || (myNpm && pName.includes(myNpm));
    });
  }
  ```
- **Sinkronisasi Kode**:
  - Terapkan pembaruan serentak pada `index.html`, `public/hostinger/index.html`, `public/gas/Index.html`, dan `public/gas/Code.gs`.
