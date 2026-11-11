# Perbaikan Edit Jadwal Periode Pendaftaran (Fix 'Data periode undefined tidak ditemukan')

Memperbaiki kegagalan saat menyimpan perubahan Jadwal Periode Pendaftaran (contoh `PRD-REG-01`) yang memicu pop-up pesan gagal *"Data periode undefined tidak ditemukan."*

## User Review & Critical Decisions

> [!IMPORTANT]
> Masalah utama dan strategi solusi yang akan diterapkan:

- **Penyebab Utama**: Pada fungsi `handleSavePeriode()` di frontend, pemanggilan `google.script.run.updatePeriode(editId, payload)` mengirimkan 2 argumen (`editId` dan `payload`), sedangkan fungsi `updatePeriode(payload)` di backend Google Apps Script (`Code.gs`) hanya menerima 1 parameter `payload`. Akibatnya, `payload` di backend terisi string ID (`"PRD-REG-01"`), sehingga `payload.id` bernilai `undefined`, yang memicu error `Data periode undefined tidak ditemukan.`
- **Dua Sisi Perbaikan (Backend & Frontend)**:
  1. **Backend (`Code.gs`)**: Fungsi `updatePeriode(arg1, arg2)` dibuat fleksibel untuk menerima baik 1 parameter `payload` (berisi `.id`) maupun 2 parameter `(id, payload)` secara bersamaan.
  2. **Frontend (`index.html`, `public/hostinger/index.html`, `public/gas/Index.html`)**: Memperbaiki pemanggilan agar mengirim payload lengkap ber-ID (`payload.id = editId`).
  3. **Penyediaan Jalur API Mandiri & Fallback Lokal**: Menambahkan penanganan `addPeriode`, `updatePeriode`, dan `deletePeriode` pada `handleLocalGasFallback` serta rute `callGasApi()` saat aplikasi dijalankan di luar lingkungan Google Apps Script langsung (Hostinger / GitHub Pages / Dev Server).

---

## 1. Overview & Core Concept

- **Apa yang Dilakukan**: Memastikan tombol **Simpan Periode** pada modal *Edit Jadwal Periode* berfungsi tanpa pesan error, memperbarui data periode di Google Sheets (`Periode_Pendaftaran`), dan langsung memperbarui tampilan tabel periode serta banner periode aktif di aplikasi.
- **Target Pengguna**: Admin TU dan Master Admin yang mengatur jadwal periode pendaftaran (UTS Susulan, UAS Susulan, Remedial Teaching).
- **Nilai Utama**: Admin dapat leluasa mengatur rentang waktu pendaftaran normal, masa keterlambatan, biaya retribusi, dan status periode (Aktif / Ditutup) tanpa kendala teknis.

---

## 2. User Experience & Visual Design

- **Alur Edit Periode**:
  1. Admin membuka menu **Jadwal & Periode**.
  2. Admin mengklik tombol **Edit** pada salah satu baris periode (misal `PRD-REG-01`).
  3. Modal *Edit Jadwal Periode (PRD-REG-01)* terbuka dengan data form terisi lengkap (Tahun Akademik, Semester, Jenis Layanan, Tanggal Mulai/Selesai, Tanggal Terlambat, Biaya, Status).
  4. Admin mengubah tanggal atau status, lalu menekan **Simpan Periode**.
  5. Sistem menampilkan loading singkat, modal tertutup, dan muncul notifikasi sukses: *"Jadwal periode PRD-REG-01 berhasil diperbarui."*
  6. Tabel periode dan banner status periode aktif di dashboard langsung diperbarui seketika.

---

## 3. Key Product Decisions & Trade-Offs

- **Penanganan Parameter Ganda di Backend (`Code.gs`)**:
  - *Pendekatan*:
    ```javascript
    function updatePeriode(arg1, arg2) {
      var payload = (typeof arg1 === 'object' && arg1 !== null) ? arg1 : (arg2 || {});
      var targetId = String(payload.id || (typeof arg1 === 'string' ? arg1 : '')).trim();
      payload.id = targetId;
      ...
    }
    ```
  - *Alasan*: Kompatibel ke belakang (*backward-compatible*) dengan pemanggilan lama maupun baru, memastikan `targetId` tidak pernah bernilai `undefined`.
- **Dukungan Lingkungan Lengkap**:
  - Menyediakan fallback pada `handleLocalGasFallback` agar pengujian lokal maupun server dev Vite selalu berhasil menyimpan data periode ke memori lokal tanpa terhambat CORS atau error jaringan.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│             Modal Edit Jadwal Periode                  │
│       ID: PRD-REG-01 | Status: Aktif / Ditutup         │
└───────────────────────────┬────────────────────────────┘
                            │
               Klik Tombol [Simpan Periode]
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Frontend: handleSavePeriode()              │
│ 1. Susun payload: { id: "PRD-REG-01", ...fields }      │
│ 2. Optimistic update ke appData.master.periode         │
│ 3. Panggil google.script.run ATAU callGasApi()         │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
         Native GAS                 Hostinger / Standalone
               │                          │
               ▼                          ▼
┌─────────────────────────────┐ ┌────────────────────────┐
│     Code.gs: updatePeriode  │ │   callGasApi Endpoint  │
│ - Ekstrak targetId aman     │ │   & Local Fallback     │
│ - Update sheet baris        │ │ - Update cache lokal   │
│   Periode_Pendaftaran       │ │ - Return success res   │
└─────────────────────────────┘ └────────────────────────┘
```
