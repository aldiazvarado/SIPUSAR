/**
 * SCRIPT SETUP OTOMATIS DATABASE SPREADSHEET SIP-AKADEMIK
 * Fakultas Ekonomi dan Bisnis - Universitas Ibn Khaldun Bogor
 *
 * Jalankan fungsi `setupDatabase()` sekali pada Google Apps Script
 * untuk membuat seluruh Sheet terpisah, User_Staff, User_Mahasiswa, Master_Ruangan,
 * Jadwal_Ujian, serta Log Aktivitas secara otomatis dan sinkron.
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetNames = [
    'User_Staff',
    'User_Mahasiswa',
    'Users',
    'Master_Ruangan',
    'Jadwal_Ujian',
    'Master_Prodi',
    'Master_Matkul',
    'Master_Kelas',
    'Master_Dosen',
    'Master_Tahun_Akademik',
    'Periode_Pendaftaran',
    'Pendaftaran',
    'Notifikasi',
    'Log_Aktivitas'
  ];

  // 1. Pastikan seluruh sheet tersedia
  sheetNames.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
  });

  // Hapus sheet bawaan "Sheet1" jika ada
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }

  // 1. POPULATE SHEET: User_Staff (ID | Username | Password | Role | Nama Lengkap | NIK | Kode Prodi)
  populateSheetData(ss, 'User_Staff', 
    ["ID", "Username", "Password", "Role", "Nama Lengkap", "NIK", "Kode Prodi"], 
    [
      ["STF-001", "aldiaz", "q007121997", "Master Admin", "Aldiaz Varado", "198501012010121001", "ALL"],
      ["STF-002", "410100242", "123456", "Admin TU", "Wawan Setiawan, M.Pd.", "410100242", "ALL"],
      ["STF-003", "410100314", "123456", "Admin TU", "Iis Isnawati, S.Pd.", "410100314", "ALL"],
      ["STF-004", "410100612", "123456", "Admin TU", "Gadis Mutmainah Permatacahyani, S.Ak.", "410100612", "ALL"],
      ["STF-005", "410100501", "123456", "Admin TU", "Muhammad Royani, A.P.", "410100501", "ALL"],
      ["STF-006", "410200328", "123456", "Admin TU", "Siti Pahira Holilah, A.Md.", "410200328", "ALL"],
      ["STF-007", "410200303", "123456", "Admin TU", "Adzkia Puspa Anjari, S.M.", "410200303", "AKT"],
      ["STF-008", "410200120", "123456", "Admin TU", "Tina Wahyuningsih, S.I.Kom.", "410200120", "MNJ"],
      ["STF-009", "410200106", "123456", "Admin TU", "Melodia Cantika, S.M.", "410200106", "MNJ"],
      ["STF-010", "410200447", "123456", "Admin TU", "Yusril Ismail Permana, S.I.Kom.", "410200447", "MNJ,AKT"],
      ["STF-011", "410100614", "123456", "Admin TU", "Karmila, S.Ak.", "410100614", "BD"],
      ["STF-012", "410200316", "123456", "Admin TU", "Lisa Marliana", "410200316", "PI,PKD"],
      ["STF-013", "seno", "123456", "Admin TU", "Seno Agustiyan, S.T.", "410200550", "ALL"],
      ["STF-014", "dekan", "dekan123", "Dekan", "Prof. Dr. Hj. Immas Nurhayati, S.E., M.S.M.", "196504121990032001", "ALL"],
      ["STF-015", "wadek1", "wadek111", "Wakil Dekan", "Dr. Asti Marlina, S.E., MMSI., DBA.", "197205151998032002", "ALL"],
      ["STF-016", "wadek2", "wadek222", "Wakil Dekan", "Widhi Ariyo Bimo, S.E., M.M.", "197609212003121002", "ALL"],
      ["STF-017", "wadek3", "wadek333", "Wakil Dekan", "Mohammad Jibriel Avessina, S.Sos., M.I.P., M.M.", "198006112005011003", "ALL"],
      ["STF-018", "kaprodiMNJ", "kaprodiMNJ123", "Ketua Program Studi", "Dr. Muhamad Azis Firdaus, S.E., M.M.", "197508202002121003", "MNJ"],
      ["STF-019", "kaprodiAKT", "kaprodiAKT123", "Ketua Program Studi", "Dr. Desmy Riani, S.E., M.Ak.", "197911042006042001", "AKT"],
      ["STF-020", "kaprodiPKD", "kaprodiPKD123", "Ketua Program Studi", "Denia Maulani, S.E., M.M.", "198302172008122002", "PKD"],
      ["STF-021", "kaprodiBisnisDigital", "kaprodiBisnisDigital123", "Ketua Program Studi", "Hendri Maulana, S.E., M.M.", "198207192008011004", "BD"],
      ["STF-022", "kaprodiPI", "kaprodiPI123", "Ketua Program Studi", "Hurriyaturrohman, S.E., M.M., CAP., CCSME., CTM., CPFB.", "198403152010121002", "PI"],
      ["STF-023", "sekprodiStudiMNJ", "sekprodiStudiMNJ123", "Sekretaris Program Studi", "Dr. Agung Wibowo, S.E., M.M.", "198103142006041002", "MNJ"],
      ["STF-024", "sekprodiStudiAKT", "sekprodiStudiAKT123", "Sekretaris Program Studi", "Ofan Maulana Yudista., S.ST., M.Ak., CAP.", "198705222014041001", "AKT"],
      ["STF-025", "sekprodiStudiPKD", "sekprodiStudiPKD123", "Sekretaris Program Studi", "Nora Azmia, S.E., M.M.", "198809102015042002", "PKD"],
      ["STF-026", "sekprodiStudiBisnisDigital", "sekprodiStudiBisnisDigital123", "Sekretaris Program Studi", "Hanif Zaidan Sinaga, S.E., M.M.S.I., M.Kom.", "199011052018031001", "BD"],
      ["STF-027", "sekprodiStudiPI", "sekprodiStudiPI123", "Sekretaris Program Studi", "Anuraga Kusumah, S.E., M.M.", "198904162016011003", "PI"]
    ]
  );

  // 2. POPULATE SHEET: User_Mahasiswa (ID | Username | Password | Role | Nama Lengkap | NPM | Kode Prodi)
  populateSheetData(ss, 'User_Mahasiswa', 
    ["ID", "Username", "Password", "Role", "Nama Lengkap", "NPM", "Kode Prodi"], 
    [
      ["MHS-001", "123", "123", "Mahasiswa", "Test Mahasiswa", "123", "MNJ"],
      ["MHS-002", "2311010012", "123456", "Mahasiswa", "Rizky Pratama Putra", "2311010012", "MNJ"],
      ["MHS-003", "2311020045", "123456", "Mahasiswa", "Siti Nurhaliza Zahra", "2311020045", "AKT"],
      ["MHS-004", "2411030019", "123456", "Mahasiswa", "Muhammad Farhan Ramadhan", "2411030019", "BD"],
      ["MHS-005", "2311040008", "123456", "Mahasiswa", "Nabila Putri Maharani", "2311040008", "PI"],
      ["MHS-006", "2411050031", "123456", "Mahasiswa", "Aditya Pratama Wijaya", "2411050031", "PKD"],
      ["MHS-007", "2311010088", "123456", "Mahasiswa", "Dimas Anggara Saputra", "2311010088", "MNJ"],
      ["MHS-008", "2311020064", "123456", "Mahasiswa", "Aulia Rahmawati", "2311020064", "AKT"],
      ["MHS-009", "2211030015", "123456", "Mahasiswa", "Fajar Siddiq Pratama", "2211030015", "BD"],
      ["MHS-010", "2211040021", "123456", "Mahasiswa", "Nadira Syifa Azzahra", "2211040021", "PI"],
      ["MHS-011", "2311010001", "123456", "Mahasiswa", "Fajar Pratama", "2311010001", "MNJ"],
      ["MHS-012", "2311020014", "123456", "Mahasiswa", "Siti Aisyah", "2311020014", "AKT"]
    ]
  );

  // 3. POPULATE SHEET: Master_Ruangan
  populateSheetData(ss, 'Master_Ruangan', 
    ["ID", "Kode Ruangan", "Nama Ruangan", "Kapasitas", "Gedung", "Keterangan"], 
    [
      ["RNG-001", "R.101", "Ruang Teori 101", 40, "Gedung FEB Lt. 1", "AC, Proyektor LCD, Whiteboard"],
      ["RNG-002", "R.102", "Ruang Teori 102", 40, "Gedung FEB Lt. 1", "AC, Proyektor LCD, Whiteboard"],
      ["RNG-003", "R.201", "Ruang Kuliah 201", 45, "Gedung FEB Lt. 2", "AC, Proyektor LCD, Sound System"],
      ["RNG-004", "R.202", "Ruang Kuliah 202", 45, "Gedung FEB Lt. 2", "AC, Proyektor LCD, Sound System"],
      ["RNG-005", "LAB-KOM-1", "Laboratorium Komputer 1", 35, "Gedung FEB Lt. 3", "35 Unit PC Core i7, LAN, AC"],
      ["RNG-006", "LAB-KOM-2", "Laboratorium Komputer 2", 35, "Gedung FEB Lt. 3", "35 Unit PC Core i7, Internet Gigabit, AC"],
      ["RNG-007", "AUD-FEB", "Auditorium Al-Khawarizmi", 150, "Gedung FEB Lt. 4", "Sound Hall, Double Projector, AC Sentral"]
    ]
  );

  // 4. POPULATE SHEET: Jadwal_Ujian
  populateSheetData(ss, 'Jadwal_Ujian', 
    ["ID", "Tanggal Ujian", "Jam Mulai", "Jam Selesai", "Ruangan", "Kode Prodi", "Program Studi", "Semester", "Kelas", "Mata Kuliah", "Dosen Pengampu", "Jenis Ujian", "Keterangan"], 
    [
      ["JDW-001", "2026-10-15", "08:00", "09:30", "R.101", "MNJ", "Manajemen", "Semester 3", "Reguler 3A", "Manajemen Keuangan", "Dr. Agung Wibowo, S.E., M.M.", "UTS Susulan", "Membawa kartu ujian dan kartu mahasiswa"],
      ["JDW-002", "2026-10-15", "10:00", "11:30", "R.102", "AKT", "Akuntansi", "Semester 3", "Reguler 3B", "Akuntansi Keuangan Menengah II", "Dr. Desmy Riani, S.E., M.Ak.", "UTS Susulan", "Kalkulator diperbolehkan"],
      ["JDW-003", "2026-10-16", "08:30", "10:00", "LAB-KOM-1", "BD", "Bisnis Digital", "Semester 3", "Reguler 3A", "Big Data untuk Bisnis", "Hanif Zaidan Sinaga, S.E., M.M.S.I., M.Kom.", "UTS Susulan", "Praktikum di Lab Komputer 1"],
      ["JDW-004", "2026-10-16", "13:00", "14:30", "R.201", "PI", "Perdagangan Internasional", "Semester 3", "Reguler 3A", "Hukum Perdagangan Internasional", "Hurriyaturrohman, S.E., M.M., CAP., CCSME., CTM., CPFB.", "UTS Susulan", "Ujian tertulis"],
      ["JDW-005", "2026-10-17", "09:00", "10:30", "R.202", "PKD", "Perbankan dan Keuangan Digital", "Semester 3", "Reguler 3A", "Manajemen Perbankan", "Denia Maulani, S.E., M.M.", "UTS Susulan", "Studi kasus perbankan"],
      ["JDW-006", "2026-10-17", "11:00", "12:30", "R.101", "MNJ", "Manajemen", "Semester 3", "Reguler 3A", "Matematika Bisnis", "Prof. Dr. Hj. Immas Nurhayati, S.E., M.S.M.", "UTS Susulan", "Tutup buku (Closed Book)"]
    ]
  );

  // 5. POPULATE SHEET: Master_Prodi
  populateSheetData(ss, 'Master_Prodi', 
    ["ID", "Kode Prodi", "Nama Prodi", "Jenjang"], 
    [
      ["PRD-001", "MNJ", "Manajemen", "S1"],
      ["PRD-002", "AKT", "Akuntansi", "S1"],
      ["PRD-003", "BD", "Bisnis Digital", "S1"],
      ["PRD-004", "PI", "Perdagangan Internasional", "S1"],
      ["PRD-005", "PKD", "Perbankan dan Keuangan Digital", "D4"]
    ]
  );

  // 6. POPULATE SHEET: Master_Tahun_Akademik
  populateSheetData(ss, 'Master_Tahun_Akademik',
    ["ID", "Tahun Akademik", "Semester", "Status", "Keterangan"],
    [
      ["TA-001", "2026/2027", "Ganjil", "Aktif", "Tahun Akademik Berjalan (Default)"],
      ["TA-002", "2025/2026", "Genap", "Arsip", "Tahun Akademik Lalu"],
      ["TA-003", "2027/2028", "Ganjil", "Mendatang", "Tahun Akademik Mendatang"]
    ]
  );

  // 7. POPULATE SHEET: Periode_Pendaftaran
  populateSheetData(ss, 'Periode_Pendaftaran', 
    ["ID", "Tahun Akademik", "Semester", "Jenis Layanan", "Kategori Kelas", "Tanggal & Jam Mulai", "Tanggal & Jam Selesai", "Mulai Terlambat", "Selesai Terlambat", "Biaya Keterlambatan", "Status"], 
    [
      ["PRD-REG-01", "2026/2027", "Ganjil", "UTS Susulan", "Reguler & Karyawan", "2026-09-25 08:00:00", "2026-10-05 23:59:00", "2026-10-06 00:00:00", "2026-10-12 23:59:00", 50000, "Aktif"],
      ["PRD-REG-02", "2026/2027", "Ganjil", "UAS Susulan", "Reguler & Karyawan", "2026-12-10 08:00:00", "2026-12-20 23:59:00", "2026-12-21 00:00:00", "2026-12-27 23:59:00", 50000, "Non-Aktif"],
      ["PRD-REG-03", "2026/2027", "Ganjil", "Remedial Teaching", "Reguler & Karyawan", "2027-01-05 08:00:00", "2027-01-14 23:59:00", "2027-01-15 00:00:00", "2027-01-20 23:59:00", 75000, "Non-Aktif"]
    ]
  );

  // 7. POPULATE SHEET: Notifikasi
  populateSheetData(ss, 'Notifikasi', 
    ["ID", "Waktu", "Judul", "Pesan", "Tipe", "TargetRole", "TargetNPM", "Dibaca"], 
    [
      ["NOTIF-001", "2026-10-06 09:00:00", "Pendaftaran UTS Susulan Disetujui", "Pendaftaran UTS Susulan Anda untuk mata kuliah Manajemen Keuangan telah disetujui oleh Bagian Tata Usaha. Silakan unduh/cetak Kartu Ujian digital Anda.", "Pendaftaran", "Semua", "2311010012", "Belum"],
      ["NOTIF-002", "2026-10-06 08:30:00", "Jadwal Ujian Baru Diterbitkan", "Jadwal UTS Susulan Semester Ganjil 2026/2027 telah dirilis resmi. Periksa ruangan dan jam pelaksanaan pada menu Jadwal Ujian.", "Jadwal", "Semua", "Semua", "Belum"],
      ["NOTIF-003", "2026-10-05 14:00:00", "Pengumuman Penting TU FEB", "Batas akhir unggah bukti retribusi denda keterlambatan pendaftaran UTS Susulan dibuka hingga 12 Oktober 2026 pukul 23:59 WIB.", "Pengumuman", "Mahasiswa", "Semua", "Belum"],
      ["NOTIF-004", "2026-10-05 10:15:00", "Pendaftaran Diterima & Menunggu Verifikasi", "Berkas pengajuan pendaftaran susulan Akuntansi Keuangan Menengah II telah masuk antrean verifikasi Admin TU.", "Pendaftaran", "Semua", "2311020045", "Sudah"]
    ]
  );

  // 8. POPULATE SHEET: Log_Aktivitas & Inisialisasi Persistent Cache
  var initialLogs = [
    ["LOG-001", "2026-10-05 18:30:15", "Aldiaz Varado", "Master Admin", "Update Status Persetujuan", "REG-001 (NPM: 231101001 - Fajar Pratama)", "Mengubah status persetujuan dari \"Pending\" menjadi \"Disetujui\""],
    ["LOG-002", "2026-10-05 17:45:20", "Wawan Setiawan, M.Pd.", "Admin TU", "Update Status Pembayaran", "REG-002 (NPM: 231102014 - Siti Aisyah)", "Memperbarui status pembayaran denda keterlambatan menjadi \"Lunas\""],
    ["LOG-003", "2026-10-05 16:15:00", "Gadis Mutmainah Permatacahyani, S.Ak.", "Admin TU", "Update Jadwal Periode", "PRD-001 (UTS Susulan 2026/2027 Ganjil)", "Sinkronisasi jadwal pendaftaran normal dan aktivasi periode keterlambatan"],
    ["LOG-004", "2026-10-05 15:20:44", "Fajar Pratama", "Mahasiswa", "Tambah Pendaftaran", "REG-001 (UTS Susulan - Manajemen SDM)", "Pengajuan baru berkas pendaftaran UTS Susulan untuk Mata Kuliah MGN251"],
    ["LOG-005", "2026-10-05 14:10:11", "Iis Isnawati, S.Pd.", "Admin TU", "Persetujuan Massal", "3 Berkas Pendaftaran", "Verifikasi dan persetujuan massal pendaftaran mahasiswa Program Studi Manajemen"],
    ["LOG-006", "2026-10-05 11:05:32", "Seno Agustiyan, S.T.", "Admin TU", "Ganti Password", "Akun Pengguna: seno", "Pembaruan kata sandi akun berhasil diverifikasi oleh sistem"]
  ];

  populateSheetData(ss, 'Log_Aktivitas', 
    ["ID", "Waktu", "Pengguna", "Role", "Aksi", "Target", "Keterangan"], 
    initialLogs
  );

  // Inisialisasi PropertiesService agar Log tidak hilang meskipun baris sheet dihapus manual
  try {
    var props = PropertiesService.getScriptProperties();
    var objLogs = initialLogs.map(function(row) {
      return {
        ID: row[0],
        Waktu: row[1],
        Pengguna: row[2],
        Role: row[3],
        Aksi: row[4],
        Target: row[5],
        Keterangan: row[6]
      };
    });
    props.setProperty('SIP_PERSISTENT_LOGS_V2', JSON.stringify(objLogs));
  } catch(e) {}

  SpreadsheetApp.getUi().alert("Inisialisasi Database Berhasil! Seluruh Sheet terpisah User_Staff, User_Mahasiswa, Master_Ruangan, Jadwal_Ujian, Master Data, Notifikasi & Log Aktivitas (Persistent) FEB UIKA Bogor telah siap 100%.");
}

function populateSheetData(ss, sheetName, headers, rows) {
  var sheet = ss.getSheetByName(sheetName);
  sheet.clear();

  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1E3A8A');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  if (rows && rows.length > 0) {
    var dataRange = sheet.getRange(2, 1, rows.length, headers.length);
    dataRange.setValues(rows);
    
    if (sheetName === 'User_Staff' || sheetName === 'User_Mahasiswa') {
      sheet.getRange(2, 2, rows.length, 1).setNumberFormat('@');
      sheet.getRange(2, 3, rows.length, 1).setNumberFormat('@');
      sheet.getRange(2, 6, rows.length, 1).setNumberFormat('@');
    }
  }

  for (var c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
}
