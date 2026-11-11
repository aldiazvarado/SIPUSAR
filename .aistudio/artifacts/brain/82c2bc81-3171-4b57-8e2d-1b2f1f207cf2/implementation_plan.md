# Pembaruan Tampilan Banner Ketentuan Jadwal Periode

Memperbarui format tampilan banner informasi jadwal periode pada halaman utama (Riwayat Pendaftaran & Pendaftaran Mahasiswa) agar menampilkan label kategori kelas, penanggalan lengkap standar Indonesia (*Hari, Tanggal Bulan Tahun Pukul HH:mm WIB*), serta keterangan biaya retribusi per mata kuliah.

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan penyesuaian yang telah dikonfirmasi oleh pengguna:

- **Confirmed Decision 1: Label Kategori Kelas**: Menampilkan badge/label kelas pada header ketentuan periode, yaitu **Reguler & Karyawan** (atau sesuai kategori kelas periode aktif).
- **Confirmed Decision 2: Format Penanggalan Lengkap Standar Indonesia**: Rentang jadwal normal dan keterlambatan diformat lengkap menyertakan nama hari, tanggal, bulan Indonesia, tahun, dan penanda jam WIB:
  - *Jadwal Normal*: `Minggu, 15 November 2026 Pukul 00:00 WIB s.d. Jumat, 20 November 2026 Pukul 23:59 WIB`
  - *Batas Keterlambatan*: `Sabtu, 21 November 2026 Pukul 00:00 WIB s.d. Minggu, 22 November 2026 Pukul 23:59 WIB`
- **Confirmed Decision 3: Keterangan Retribusi**: Menyesuaikan label biaya denda keterlambatan menjadi:
  `(Denda Retribusi: Rp 50.000/mata kuliah)`

---

## 1. Overview & Core Concept

- **Apa yang Dilakukan**: Mempercantik dan memperjelas informasi pada banner *Ketentuan Jadwal Periode* sehingga mahasiswa dan pengelola akademik dapat dengan cepat memahami tenggat waktu bebas denda, masa keterlambatan, dan ketentuan retribusi per mata kuliah secara jelas tanpa salah tafsir waktu.
- **Target Pengguna**: Mahasiswa pendaftar ujian susulan/remedial, Dosen, dan Admin Program Studi/TU.
- **Nilai Utama**: Transparansi rentang jadwal pelaksanaan, kejelasan status biaya retribusi per mata kuliah, dan keterbacaan tanggal yang ramah pengguna lokal (*Indonesian Locale*).

---

## 2. User Experience & Visual Design

- **Struktur Tampilan Banner Baru**:
  1. **Header Banner**:
     - Badge Oranye: `KETENTUAN JADWAL PERIODE`
     - Nama Layanan & Tahun: `UTS Susulan (2026/2027)`
     - Badge Kategori Kelas: `Reguler & Karyawan` (Badge biru muda bergaris tepi rapi)
     - Badge Status Periode (Kanan): `PERIODE AKTIF` (Hijau)
  2. **Baris Jadwal Normal**:
     - Ikon kalender centang hijau: `<i class="fas fa-calendar-check text-emerald-600"></i>`
     - Teks: **Jadwal Normal (Bebas Denda):** `Minggu, 15 November 2026 Pukul 00:00 WIB s.d. Jumat, 20 November 2026 Pukul 23:59 WIB`
  3. **Baris Batas Keterlambatan**:
     - Ikon jam peringatan oranye: `<i class="fas fa-clock text-amber-700"></i>`
     - Teks: **Batas Keterlambatan:** `Sabtu, 21 November 2026 Pukul 00:00 WIB s.d. Minggu, 22 November 2026 Pukul 23:59 WIB`
     - Keterangan denda: `(Denda Retribusi: Rp 50.000/mata kuliah)` dalam format font tebal berwarna mawar (*rose-700*).

---

## 3. Key Product Decisions & Trade-Offs

- **Fungsi Helper Penanggalan Dinamis**:
  - *Pendekatan*: Menambahkan fungsi helper `formatIndonesianFullDateTime(dateVal)` dan `formatIndonesianDateTimeRange(startVal, endVal)` yang mampu mem-parsing tanggal baik format ISO, string tanggal spasi (`YYYY-MM-DD HH:mm:ss`), maupun objek `Date`.
  - *Alasan*: Menjamin tampilan banner selalu menampilkan hari, tanggal, bulan Indonesia, dan waktu WIB secara akurat dari data periode mana pun yang di-setting oleh Admin, tanpa bergantung pada browser locale mentah.
- **Sinkronisasi Otomatis**:
  - `syncActivePeriodBanner()` akan memanggil helper ini secara dinamis setiap kali data aplikasi dimuat atau diperbarui melalui modal Edit Periode.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│             Data Periode Aktif di Memory               │
│  Tgl Mulai: 2026-11-15 00:00 | Selesai: 2026-11-20     │
│  Terlambat: 2026-11-21 00:00 s/d 2026-11-22 23:59     │
│  Biaya: 50000 | Kelas: Reguler & Karyawan              │
└───────────────────────────┬────────────────────────────┘
                            │
              Helper: formatIndonesianDateTimeRange()
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Komponen Banner Ketentuan                │
│                                                        │
│  [KETENTUAN JADWAL PERIODE] UTS Susulan (2026/2027)    │
│  [Reguler & Karyawan]                 [PERIODE AKTIF]  │
│                                                        │
│  ✓ Jadwal Normal (Bebas Denda):                        │
│    Minggu, 15 November 2026 Pukul 00:00 WIB s.d.       │
│    Jumat, 20 November 2026 Pukul 23:59 WIB             │
│                                                        │
│  ⏰ Batas Keterlambatan:                               │
│    Sabtu, 21 November 2026 Pukul 00:00 WIB s.d.        │
│    Minggu, 22 November 2026 Pukul 23:59 WIB            │
│    (Denda Retribusi: Rp 50.000/mata kuliah)            │
└────────────────────────────────────────────────────────┘
```
