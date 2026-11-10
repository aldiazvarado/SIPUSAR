# Penyaringan Otomatis Mahasiswa Terjadwal pada Input Jadwal Ujian

Rencana implementasi untuk memastikan mahasiswa yang berkas pendaftarannya **sudah memiliki jadwal ujian aktif otomatis hilang (terfilter)** dari dropdown *"1. Pilih Data dari Mahasiswa yang Mendaftar \*"* pada modal Jadwal Ujian, serta pembaruan otomatis status jadwal di sistem.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan yang telah dikonfirmasi oleh pengguna melalui klarifikasi:
> 1. **Kriteria Deteksi "Sudah Terjadwalkan"**: Pendaftaran mahasiswa dideteksi sudah terjadwalkan berdasarkan kecocokan data pendaftaran (Mata Kuliah, Program Studi/Kelas, dan NPM/ID Pendaftar) dengan daftar Jadwal Ujian aktif di memori dan spreadsheet.
> 2. **Mode Edit Jadwal Tersimpan**: Saat Admin TU mengedit jadwal ujian (`JDW-...`), pendaftar terkait jadwal tersebut tetap dimunculkan di dropdown dan langsung terpilih secara otomatis agar admin dapat melihat dan meninjau mahasiswa peserta ujian tersebut.
> 3. **Pembaruan Status Jadwal Otomatis**: Saat Admin TU menyimpan jadwal ujian, sistem secara otomatis memperbarui kolom `Status Jadwal` pada berkas pendaftaran mahasiswa terkait menjadi **"Terjadwal"** baik di antarmuka web maupun di Google Spreadsheet.

---

### 1. Overview & Core Concept

- **Masalah Saat Ini**:
  Pada modal *"Input Data Jadwal Ujian Baru"*, dropdown *1. Pilih Data dari Mahasiswa yang Mendaftar \** memuat seluruh mahasiswa terdaftar tanpa menyaring apakah mahasiswa tersebut sudah dibuatkan jadwal ujiannya atau belum. Akibatnya, Admin TU dapat kebingungan atau berisiko memasukkan jadwal ujian berulang (duplikat) untuk mata kuliah mahasiswa yang sama.
- **Solusi yang Diterapkan**:
  1. **Smart Filtering pada Dropdown**: Saat modal jadwal dibuka, sistem membandingkan daftar `appData.pendaftaran` dengan `appData.jadwal`. Berkas pendaftaran yang sudah memiliki jadwal ujian aktif otomatis dikeluarkan dari pilihan dropdown.
  2. **Preservasi Saat Mode Edit**: Jika Admin mengklik *"Edit"* pada salah satu jadwal yang sudah ada, mahasiswa terkait jadwal tersebut tetap dimasukkan ke dalam dropdown dan otomatis terseleksi (`selected`).
  3. **Auto-Update Status Jadwal**: Saat jadwal berhasil disimpan (`addJadwal`), status jadwal pada sheet `Pendaftaran` dan data memori lokal langsung diperbarui menjadi `"Terjadwal"`. Jika suatu jadwal ujian dihapus (`deleteJadwal`), status pada pendaftaran terkait dikembalikan menjadi belum terjadwal (`"Tepat Waktu"`).
  4. **Indikator Visual & UX Bersih**: Jika seluruh pendaftar telah berhasil dijadwalkan, dropdown menampilkan keterangan ramah: *"-- Semua Mahasiswa Terdaftar Sudah Terjadwalkan --"* dan tombol simpan terproteksi dari input kosong.

---

### 2. User Experience & Visual Design

#### A. Tampilan Dropdown Modal Jadwal Ujian Baru
- **Kondisi Ada Mahasiswa Belum Terjadwalkan**:
  - Pilihan placeholder: `-- Pilih Mahasiswa Terdaftar (Disetujui / Pending) [Sisa: X Mahasiswa] --`
  - Daftar hanya berisi mahasiswa yang belum memiliki jadwal ujian aktif.
  - Ditambahkan keterangan status kecil di bawah label:
    `<span class="text-[11px] text-emerald-700 font-semibold"><i class="fas fa-filter mr-1"></i>Mahasiswa yang sudah terjadwal otomatis disaring</span>`
- **Kondisi Semua Mahasiswa Sudah Terjadwalkan**:
  - Placeholder: `-- Semua Mahasiswa Terdaftar Sudah Terjadwalkan (0 Menunggu) --`
  - Dropdown dinonaktifkan (`disabled`) dengan pesan konfirmasi bahwa seluruh pendaftar telah memiliki jadwal ujian resmi.
- **Kondisi Edit Jadwal Ujian**:
  - Dropdown tetap memuat mahasiswa yang dijadwalkan pada entri jadwal tersebut, ditandai dengan badge atau teks `[Jadwal Aktif Ini]`.

---

### 3. Key Product Decisions & Trade-Offs

- **Logika Pencocokan Ganda (ID Pendaftar & Mata Kuliah)**:
  - *Pendekatan*: Pendaftaran dicocokkan melalui dua lapis:
    1. Relasi eksplisit `pendaftarId` atau `Keterangan` yang memuat ID pendaftaran / NPM.
    2. Pencocokan prodi + mata kuliah + kelas untuk menjaga konsistensi data lama.
  - *Alasan*: Menjamin akurasi 100% sehingga tidak ada mahasiswa yang sudah dijadwalkan muncul kembali secara keliru.
- **Pembaruan Status Jadwal Real-time**:
  - *Pendekatan*: Selain memutakhirkan Google Spreadsheet melalui backend GAS `addJadwal`, frontend juga langsung melakukan pembaruan lokal (*optimistic UI update*) ke objek `appData.pendaftaran`.
  - *Alasan*: Transisi instan (0 detik) tanpa perlu menunggu putaran penuh network request.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MODAL JADWAL UJIAN (FRONTEND)                     │
├────────────────────────────────────────────────────────────────────────┤
│  openJadwalModal(realId)                                               │
│   ├── Ambil appData.pendaftaran & appData.jadwal                        │
│   ├── Identifikasi pendaftaran yang sudah memiliki jadwal aktif         │
│   │     (Pengecualian: Jadwal yang sedang diedit realId tetap lolos)   │
│   ├── Filter list pendaftar: Exclude yang sudah terjadwalkan           │
│   └── Render opsi <option> ke #jadwalSelectPendaftar                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Simpan Jadwal
┌────────────────────────────────────────────────────────────────────────┐
│                   HANDLE SAVE & UPDATE STATUS JADWAL                   │
├────────────────────────────────────────────────────────────────────────┤
│  handleSaveJadwal()                                                    │
│   ├── Kirim payload ke addJadwal / updateJadwal                        │
│   ├── Backend GAS: Update sheet Jadwal_Ujian                           │
│   ├── Backend GAS: Update kolom "Status Jadwal" di sheet Pendaftaran    │
│   │     menjadi "Terjadwal"                                            │
│   └── Frontend: Update optimis appData.pendaftaran[].StatusJadwal      │
└────────────────────────────────────────────────────────────────────────┘
```

#### Komponen yang Diperbarui:
1. `index.html`:
   - Fungsi `openJadwalModal(id)`: Penerapan filter penyaringan pendaftar yang belum terjadwal.
   - Fungsi `handleSaveJadwal(e)`: Pengiriman `pendaftarId` dan pembaruan optimis `Status Jadwal = 'Terjadwal'`.
   - Fungsi `deleteJadwalItem(id)`: Pemulihan `Status Jadwal` pada pendaftar terkait saat jadwal dihapus.
2. `public/gas/Code.gs`:
   - Fungsi `addJadwal(payload)`: Pembaruan baris sheet `Pendaftaran` terkait menjadi `"Terjadwal"`.
   - Fungsi `deleteJadwal(id)`: Pemulihan status pendaftaran jika jadwal dibatalkan/dihapus.
3. Sinkronisasi file repositori:
   - Menyalin pembaruan ke `public/hostinger/index.html` dan `public/gas/Index.html`.
