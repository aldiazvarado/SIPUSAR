export interface UserSession {
  username: string;
  role: 'Master Admin' | 'Admin TU' | 'Dekan' | 'Wakil Dekan' | 'Ketua Program Studi' | 'Sekretaris Program Studi' | 'Mahasiswa';
  nama: string;
  kodeProdi: string; // 'ALL' | 'MNJ' | 'AKT' | 'BD' | 'PI' | 'PKD'
  prodi: string;
  nik?: string;
  npm?: string;
}

export interface PendaftaranItem {
  ID: string;
  Tanggal: string;
  'Tahun Akademik': string;
  Semester: string;
  NPM: string;
  'Nama Mahasiswa': string;
  'Kode Prodi': string;
  'Program Studi': string;
  Kelas: string;
  'Kategori Kelas': 'Reguler' | 'Karyawan' | 'Eksekutif';
  'Mata Kuliah': string;
  'Dosen Pengampu': string;
  'Jenis Layanan': 'UTS Susulan' | 'UAS Susulan' | 'Remedial Teaching';
  Alasan: string;
  'Bukti Foto'?: string;
  'Status Jadwal': 'Tepat Waktu' | 'Terlambat';
  Nominal: number;
  'Status Pembayaran': 'Gratis (Tepat Waktu)' | 'Belum Bayar' | 'Lunas';
  'Status Persetujuan': 'Pending' | 'Disetujui' | 'Ditolak';
  Catatan?: string;
}

export interface JadwalUjianItem {
  ID: string;
  'Tanggal Ujian': string;
  'Jam Mulai': string;
  'Jam Selesai': string;
  Ruangan: string;
  'Kode Prodi': string;
  'Program Studi': string;
  Semester: string;
  Kelas: string;
  'Mata Kuliah': string;
  'Dosen Pengampu': string;
  'Jenis Ujian': string;
  Keterangan?: string;
}

export interface PeriodeItem {
  ID: string;
  'Tahun Akademik': string;
  Semester: string;
  'Jenis Layanan': string;
  'Kategori Kelas': string;
  'Tanggal & Jam Mulai': string;
  'Tanggal & Jam Selesai': string;
  'Mulai Terlambat': string;
  'Selesai Terlambat': string;
  'Biaya Keterlambatan': number;
  Status: 'Aktif' | 'Ditutup';
}

export interface RuanganItem {
  ID: string;
  'Kode Ruangan': string;
  'Nama Ruangan': string;
  Kapasitas: number;
  Gedung: string;
  Keterangan: string;
}

export interface ProdiItem {
  ID: string;
  'Kode Prodi': string;
  'Nama Prodi': string;
  Jenjang: string;
}

export interface NotifikasiItem {
  ID: string;
  Waktu: string;
  Judul: string;
  Pesan: string;
  Tipe: 'Pengumuman' | 'Jadwal' | 'Pendaftaran';
  TargetRole: string;
  TargetNPM: string;
  Dibaca: 'Sudah' | 'Belum';
}

export interface ActivityLogItem {
  ID: string;
  Waktu: string;
  Pengguna: string;
  Role: string;
  Aksi: string;
  Target: string;
  Keterangan: string;
}

export interface TahunAkademikItem {
  ID: string;
  'Tahun Akademik': string;
  Status: 'Aktif' | 'Arsip' | 'Mendatang';
  Keterangan: string;
}

export interface AppMasterData {
  prodi: ProdiItem[];
  matkul: { 'Kode Matkul': string; 'Nama Mata Kuliah': string; SKS: number; 'Kode Prodi': string }[];
  kelas: { 'Nama Kelas': string; Kategori: string; Semester: string; 'Kode Prodi': string }[];
  dosen: { 'Nama Dosen': string; NIK: string; 'Kode Prodi': string }[];
  periode: PeriodeItem[];
  ruangan: RuanganItem[];
  tahunAkademik: TahunAkademikItem[];
  logs: ActivityLogItem[];
}

export interface AppStateData {
  version: string;
  master: AppMasterData;
  pendaftaran: PendaftaranItem[];
  jadwal: JadwalUjianItem[];
  notifications: NotifikasiItem[];
  activityLogs: ActivityLogItem[];
}
