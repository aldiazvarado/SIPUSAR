import React, { useState, useMemo } from 'react';
import {
  Users, CheckCircle2, Clock, Wallet, Printer, FileDown, FileSpreadsheet,
  Search, Filter, Plus, Calendar, ShieldCheck, Database, Server,
  ChevronLeft, ChevronRight, CheckSquare, Eye, X, Award, AlertCircle, Receipt, Activity
} from 'lucide-react';
import { INITIAL_APP_DATA } from './data/mockData';
import { PendaftaranItem, UserSession } from './types';
import { KartuUjianCard } from './components/KartuUjianCard';
import { ExportPdfDoc } from './components/ExportPdfDoc';
import { CodeCenter } from './components/CodeCenter';
import { KwitansiModal } from './components/KwitansiModal';
import { ApiTesterModal } from './components/ApiTesterModal';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';

export default function App() {
  const [appState, setAppState] = useState(INITIAL_APP_DATA);
  const [currentUser, setCurrentUser] = useState<UserSession>({
    username: 'aldiaz',
    role: 'Master Admin',
    nama: 'Aldiaz Varado',
    kodeProdi: 'ALL',
    prodi: 'ALL',
    nik: '198501012010121001'
  });

  const [activeTab, setActiveTab] = useState<'pendaftaran' | 'kartu' | 'exportPdf' | 'executive' | 'jadwal' | 'codeCenter'>('pendaftaran');
  
  // Search & Filter state for in-memory processing
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLayanan, setFilterLayanan] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected registrations for bulk approval
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [activeCardItem, setActiveCardItem] = useState<PendaftaranItem | null>(null);
  const [showExportPdfModal, setShowExportPdfModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayItem, setSelectedPayItem] = useState<PendaftaranItem | null>(null);
  const [payStatusRadio, setPayStatusRadio] = useState<'Lunas' | 'Belum Bayar'>('Lunas');
  const [payCatatan, setPayCatatan] = useState('Pembayaran tunai via loket TU FEB UIKA');
  const [selectedKwitansiItem, setSelectedKwitansiItem] = useState<PendaftaranItem | null>(null);
  const [showApiTesterModal, setShowApiTesterModal] = useState(false);

  // Form State for Add Registration
  const [formData, setFormData] = useState({
    nim: '',
    namaMahasiswa: '',
    kodeProdi: 'MNJ',
    prodi: 'Manajemen',
    kelas: 'Reguler 3A',
    kategoriKelas: 'Reguler' as 'Reguler' | 'Karyawan',
    mataKuliah: 'Manajemen Keuangan',
    dosenPengampu: 'Dr. Agung Wibowo, S.E., M.M.',
    jenisLayanan: 'UTS Susulan' as 'UTS Susulan' | 'UAS Susulan' | 'Remedial Teaching',
    alasan: ''
  });

  // Client-side In-Memory Filtering (Anti-lemot)
  const filteredList = useMemo(() => {
    let list = appState.pendaftaran;

    // Mahasiswa only views their own records
    if (currentUser.role === 'Mahasiswa') {
      const myNpm = (currentUser.npm || currentUser.username).toLowerCase();
      list = list.filter(p => p.NPM.toLowerCase() === myNpm);
    }

    if (filterProdi) {
      list = list.filter(p => p['Kode Prodi'].toUpperCase() === filterProdi.toUpperCase());
    }
    if (filterStatus) {
      list = list.filter(p => p['Status Persetujuan'].toLowerCase() === filterStatus.toLowerCase());
    }
    if (filterLayanan) {
      list = list.filter(p => p['Jenis Layanan'].toLowerCase() === filterLayanan.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p['Nama Mahasiswa'].toLowerCase().includes(q) ||
        p.NPM.toLowerCase().includes(q) ||
        p['Mata Kuliah'].toLowerCase().includes(q) ||
        p['Dosen Pengampu'].toLowerCase().includes(q)
      );
    }
    return list;
  }, [appState.pendaftaran, currentUser, filterProdi, filterStatus, filterLayanan, searchQuery]);

  // Pagination calculation
  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Statistics
  const statTotal = appState.pendaftaran.length;
  const statApproved = appState.pendaftaran.filter(p => p['Status Persetujuan'] === 'Disetujui').length;
  const statPending = appState.pendaftaran.filter(p => p['Status Persetujuan'] === 'Pending').length;
  const statNominal = appState.pendaftaran.reduce((acc, p) => acc + (Number(p.Nominal) || 0), 0);

  // Role switching handler
  const handleRoleChange = (role: UserSession['role']) => {
    let nama = 'Aldiaz Varado';
    let kodeProdi = 'ALL';
    let npm = '';

    if (role === 'Master Admin') {
      nama = 'Aldiaz Varado';
    } else if (role === 'Admin TU') {
      nama = 'Wawan Setiawan, M.Pd.';
    } else if (role === 'Dekan') {
      nama = 'Prof. Dr. Hj. Immas Nurhayati, S.E., M.S.M.';
    } else if (role === 'Wakil Dekan') {
      nama = 'Dr. Asti Marlina, S.E., MMSI., DBA.';
    } else if (role === 'Ketua Program Studi') {
      nama = 'Dr. Muhamad Azis Firdaus, S.E., M.M.';
      kodeProdi = 'MNJ';
    } else if (role === 'Sekretaris Program Studi') {
      nama = 'Dr. Desmy Riani, S.E., M.Ak.';
      kodeProdi = 'AKT';
    } else if (role === 'Mahasiswa') {
      nama = 'Rizky Pratama Putra';
      kodeProdi = 'MNJ';
      npm = '2311010012';
    }

    setCurrentUser({
      username: role === 'Mahasiswa' ? '2311010012' : 'staff',
      role,
      nama,
      kodeProdi,
      prodi: kodeProdi === 'ALL' ? 'Semua' : 'Manajemen',
      npm
    });

    if (role === 'Mahasiswa') {
      setActiveTab('pendaftaran');
    }
  };

  // Toggle selection for bulk actions
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedList.map(p => p.ID));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Approve handler
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    setAppState(prev => ({
      ...prev,
      pendaftaran: prev.pendaftaran.map(p =>
        selectedIds.includes(p.ID) ? { ...p, 'Status Persetujuan': 'Disetujui' } : p
      ),
      activityLogs: [
        {
          ID: `LOG-${Date.now().toString().slice(-4)}`,
          Waktu: new Date().toISOString().replace('T', ' ').slice(0, 19),
          Pengguna: currentUser.nama,
          Role: currentUser.role,
          Aksi: 'Persetujuan Massal',
          Target: `${selectedIds.length} Berkas`,
          Keterangan: `Persetujuan massal ${selectedIds.length} berkas pendaftaran berhasil disetujui`
        },
        ...prev.activityLogs
      ]
    }));

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    setSelectedIds([]);
  };

  // Single approve/reject
  const handleSingleStatus = (id: string, status: 'Disetujui' | 'Ditolak') => {
    setAppState(prev => ({
      ...prev,
      pendaftaran: prev.pendaftaran.map(p =>
        p.ID === id ? { ...p, 'Status Persetujuan': status } : p
      )
    }));
  };

  // Save payment status
  const handleSavePayment = () => {
    if (!selectedPayItem) return;
    setAppState(prev => ({
      ...prev,
      pendaftaran: prev.pendaftaran.map(p =>
        p.ID === selectedPayItem.ID
          ? { ...p, 'Status Pembayaran': payStatusRadio, Catatan: payCatatan }
          : p
      )
    }));
    setShowPayModal(false);
    setSelectedPayItem(null);
  };

  // Add Registration
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `REG-${1000 + appState.pendaftaran.length + 1}`;
    const newItem: PendaftaranItem = {
      ID: newId,
      Tanggal: new Date().toISOString().slice(0, 10),
      'Tahun Akademik': '2026/2027',
      Semester: 'Semester 3',
      NPM: formData.nim || '2311010099',
      'Nama Mahasiswa': formData.namaMahasiswa || 'Mahasiswa Baru',
      'Kode Prodi': formData.kodeProdi,
      'Program Studi': formData.prodi,
      Kelas: formData.kelas,
      'Kategori Kelas': formData.kategoriKelas,
      'Mata Kuliah': formData.mataKuliah,
      'Dosen Pengampu': formData.dosenPengampu,
      'Jenis Layanan': formData.jenisLayanan,
      Alasan: formData.alasan || 'Pengajuan pendaftaran ujian',
      'Status Jadwal': 'Tepat Waktu',
      Nominal: 0,
      'Status Pembayaran': 'Gratis (Tepat Waktu)',
      'Status Persetujuan': 'Pending'
    };

    setAppState(prev => ({
      ...prev,
      pendaftaran: [newItem, ...prev.pendaftaran]
    }));
    setShowAddModal(false);
  };

  // Export to Excel (.xlsx) using SheetJS
  const handleExportExcel = () => {
    const rows = filteredList.map((d, i) => ({
      'No': i + 1,
      'ID Pendaftaran': d.ID,
      'Tanggal': d.Tanggal,
      'NPM': d.NPM,
      'Nama Mahasiswa': d['Nama Mahasiswa'],
      'Kode Prodi': d['Kode Prodi'],
      'Program Studi': d['Program Studi'],
      'Mata Kuliah': d['Mata Kuliah'],
      'Dosen Pengampu': d['Dosen Pengampu'],
      'Jenis Layanan': d['Jenis Layanan'],
      'Nominal Retribusi': Number(d.Nominal || 0),
      'Status Pembayaran': d['Status Pembayaran'],
      'Status Persetujuan': d['Status Persetujuan']
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendaftaran_FEB_UIKA');
    XLSX.writeFile(wb, `Pendaftaran_FEB_UIKA_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased font-sans">
      
      {/* TOP HEADER */}
      <header className="bg-blue-950 text-white shadow-md border-b border-blue-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src="https://lh3.googleusercontent.com/d/1o6uQ6Fak-bFbJUzhH7LyDqqT_KjVuqge"
                referrerPolicy="no-referrer"
                alt="Logo UIKA"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight uppercase flex items-center gap-2">
                <span>SIP-AKADEMIK FEB UIKA</span>
                <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded-full font-bold text-blue-200">v6.2</span>
              </h1>
              <p className="text-[11px] text-blue-300 font-medium">
                Pendaftaran Ujian Susulan & Remedial &bull; Google Apps Script & Hostinger
              </p>
            </div>
          </div>

          {/* ROLE SWITCHER TOOLBAR */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center gap-1 bg-blue-900/80 px-2.5 py-1 rounded-xl border border-blue-800 text-xs">
              <span className="text-blue-300 text-[10px] font-bold uppercase mr-1">Role Preview:</span>
              {(['Master Admin', 'Admin TU', 'Dekan', 'Ketua Program Studi', 'Mahasiswa'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                    currentUser.role === r ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-200 hover:text-white'
                  }`}
                >
                  {r === 'Ketua Program Studi' ? 'KaProdi' : r}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowApiTesterModal(true)}
              className="bg-purple-900/90 hover:bg-purple-800 text-purple-200 hover:text-white px-2.5 py-1 rounded-xl text-xs font-bold border border-purple-700/60 transition flex items-center gap-1.5 shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Uji API Hostinger</span>
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-blue-900">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs">
                {currentUser.nama.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight truncate max-w-[140px]">{currentUser.nama}</p>
                <p className="text-[10px] text-blue-300 font-semibold">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS BAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-1 py-2">
            {[
              { id: 'pendaftaran', label: 'Riwayat Pendaftaran & Cetak Kartu', icon: FileDown },
              { id: 'kartu', label: 'Cetak Kartu Ujian (Preview)', icon: Printer },
              { id: 'exportPdf', label: 'Export Rekapitulasi PDF', icon: FileDown },
              { id: 'executive', label: 'Dashboard Executive', icon: Users },
              { id: 'jadwal', label: 'Jadwal Ujian', icon: Calendar },
              { id: 'codeCenter', label: 'Kode Sumber Lengkap (Code.gs & Hostinger)', icon: CodeCenterIcon }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>In-Memory Client Sync</span>
            </span>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-grow">
        
        {/* KPI CARDS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pendaftaran</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{statTotal}</h3>
              <p className="text-[10px] font-bold text-blue-600 mt-1">Semester Ganjil 2026/2027</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center text-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendaftaran Disetujui</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{statApproved}</h3>
              <p className="text-[10px] font-bold text-emerald-600 mt-1">Siap Cetak Kartu Ujian</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Verifikasi</p>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{statPending}</h3>
              <p className="text-[10px] font-bold text-amber-600 mt-1">Pending Tata Usaha</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Retribusi</p>
              <h3 className="text-xl font-black text-purple-900 mt-0.5">Rp {statNominal.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] font-bold text-purple-600 mt-1">Denda & Remedial Teaching</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TAB 1: RIWAYAT PENDAFTARAN & CETAK KARTU UJIAN PER BARIS */}
        {activeTab === 'pendaftaran' && (
          <div className="space-y-4">
            {/* TOOLBAR FILTER & SEARCH */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Cari Nama, NPM, atau Matkul..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <select
                  value={filterProdi}
                  onChange={e => { setFilterProdi(e.target.value); setCurrentPage(1); }}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-blue-900"
                >
                  <option value="">Semua Program Studi</option>
                  <option value="MNJ">Manajemen [MNJ]</option>
                  <option value="AKT">Akuntansi [AKT]</option>
                  <option value="BD">Bisnis Digital [BD]</option>
                  <option value="PI">Perdagangan Internasional [PI]</option>
                  <option value="PKD">Perbankan Keu Dig [PKD]</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-blue-900"
                >
                  <option value="">Semua Status Persetujuan</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Pending">Pending</option>
                  <option value="Ditolak">Ditolak</option>
                </select>

                <select
                  value={filterLayanan}
                  onChange={e => { setFilterLayanan(e.target.value); setCurrentPage(1); }}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-blue-900"
                >
                  <option value="">Semua Jenis Layanan</option>
                  <option value="UTS Susulan">UTS Susulan</option>
                  <option value="UAS Susulan">UAS Susulan</option>
                  <option value="Remedial Teaching">Remedial Teaching</option>
                </select>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedIds.length > 0 && ['Master Admin', 'Admin TU'].includes(currentUser.role) && (
                  <button
                    onClick={handleBulkApprove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Setujui Massal ({selectedIds.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setShowExportPdfModal(true)}
                  className="bg-rose-700 hover:bg-rose-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export Data ke PDF</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pendaftaran</span>
                </button>
              </div>
            </div>

            {/* TABEL DATA PENDAFTARAN */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-800 uppercase font-black tracking-wider border-b border-slate-200">
                    <tr>
                      {['Master Admin', 'Admin TU'].includes(currentUser.role) && (
                        <th className="p-3.5 text-center w-10">
                          <input
                            type="checkbox"
                            checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                            onChange={e => toggleSelectAll(e.target.checked)}
                            className="rounded text-blue-900 cursor-pointer"
                          />
                        </th>
                      )}
                      <th className="p-3.5">ID Reg</th>
                      <th className="p-3.5">Mahasiswa (NPM)</th>
                      <th className="p-3.5">Program Studi & Kelas</th>
                      <th className="p-3.5">Mata Kuliah & Dosen</th>
                      <th className="p-3.5">Layanan</th>
                      <th className="p-3.5">Retribusi</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Jadwal Ujian</th>
                      <th className="p-3.5 text-center font-black text-blue-900 bg-blue-50/70">Aksi Cetak Kartu</th>
                      <th className="p-3.5 text-center">Kelola</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paginatedList.map(item => {
                      const isApproved = item['Status Persetujuan'] === 'Disetujui';
                      const matchJadwal = appState.jadwal.find(j =>
                        j['Kode Prodi'] === item['Kode Prodi'] && j['Mata Kuliah'] === item['Mata Kuliah']
                      );
                      const hasSchedule = matchJadwal && matchJadwal['Tanggal Ujian'] && matchJadwal.Ruangan;

                      let badgeStatus = 'bg-amber-100 text-amber-800 border-amber-300';
                      if (isApproved) badgeStatus = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      else if (item['Status Persetujuan'] === 'Ditolak') badgeStatus = 'bg-rose-100 text-rose-800 border-rose-300';

                      return (
                        <tr key={item.ID} className="hover:bg-slate-50 transition">
                          {['Master Admin', 'Admin TU'].includes(currentUser.role) && (
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(item.ID)}
                                onChange={() => toggleSelectRow(item.ID)}
                                className="rounded text-blue-900 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="p-3.5 font-mono font-bold text-blue-900">{item.ID}</td>
                          <td className="p-3.5">
                            <b className="text-slate-900">{item['Nama Mahasiswa']}</b><br />
                            <span className="font-mono text-slate-500">{item.NPM}</span>
                          </td>
                          <td className="p-3.5 font-semibold">
                            [{item['Kode Prodi']}] {item['Program Studi']}<br />
                            <span className="text-slate-400 text-[11px] font-normal">{item.Semester} &bull; {item.Kelas}</span>
                          </td>
                          <td className="p-3.5">
                            <b className="text-blue-950">{item['Mata Kuliah']}</b><br />
                            <span className="text-slate-500 text-[11px]">{item['Dosen Pengampu']}</span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">{item['Jenis Layanan']}</td>
                          <td className="p-3.5 font-mono font-bold">Rp {Number(item.Nominal || 0).toLocaleString('id-ID')}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${badgeStatus}`}>
                              {item['Status Persetujuan']}
                            </span>
                          </td>
                          <td className="p-3.5 text-center text-xs">
                            {hasSchedule ? (
                              <>
                                <b className="text-slate-800">{matchJadwal['Tanggal Ujian']}</b><br />
                                <span className="text-emerald-700 font-bold">{matchJadwal.Ruangan}</span>
                              </>
                            ) : (
                              <span className="text-slate-400 italic">Belum dijadwalkan</span>
                            )}
                          </td>

                          {/* TOMBOL CETAK KARTU UJIAN DI BARIS TABEL */}
                          <td className="p-3.5 text-center bg-blue-50/30">
                            {isApproved && hasSchedule ? (
                              <button
                                onClick={() => setActiveCardItem(item)}
                                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer mx-auto"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak Kartu</span>
                              </button>
                            ) : isApproved && !hasSchedule ? (
                              <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 block text-center">
                                Menunggu Jadwal
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic block text-center">
                                Pending Verifikasi
                              </span>
                            )}
                          </td>

                          {/* ACTION BUTTONS (APPROVE / PAY / VIEW) */}
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {['Master Admin', 'Admin TU'].includes(currentUser.role) && item['Status Persetujuan'] === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleSingleStatus(item.ID, 'Disetujui')}
                                    title="Setujui"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleSingleStatus(item.ID, 'Ditolak')}
                                    title="Tolak"
                                    className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg text-xs"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {['Master Admin', 'Admin TU'].includes(currentUser.role) && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedPayItem(item);
                                      setPayStatusRadio(item['Status Pembayaran'] === 'Lunas' ? 'Lunas' : 'Belum Bayar');
                                      setShowPayModal(true);
                                    }}
                                    title="Setting Pembayaran"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg text-xs"
                                  >
                                    <Wallet className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedKwitansiItem(item)}
                                    title="Cetak Kwitansi Pembayaran"
                                    className="bg-slate-700 hover:bg-slate-800 text-white p-1.5 rounded-lg text-xs"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedList.length === 0 && (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400">
                          Tidak ada berkas pendaftaran yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION TOOLBAR */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 font-semibold">
                  Menampilkan {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} berkas
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                        p === currentPage ? 'bg-blue-900 text-white border-blue-900' : 'text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CETAK KARTU UJIAN DIGITAL LIVE PREVIEW */}
        {activeTab === 'kartu' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-black text-slate-800">Preview Layout Cetak Kartu Ujian Digital</h2>
                <p className="text-xs text-slate-500">Pilih mahasiswa pendaftar untuk melihat kartu tanda peserta ujian siap cetak.</p>
              </div>
              <select
                className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold bg-white text-slate-800"
                onChange={e => {
                  const itm = appState.pendaftaran.find(p => p.ID === e.target.value);
                  if (itm) setActiveCardItem(itm);
                }}
                value={activeCardItem?.ID || (appState.pendaftaran.find(p => p['Status Persetujuan'] === 'Disetujui')?.ID || '')}
              >
                {appState.pendaftaran.map(p => (
                  <option key={p.ID} value={p.ID}>
                    {p['Nama Mahasiswa']} ({p.NPM}) - {p['Mata Kuliah']} [{p['Status Persetujuan']}]
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const target = activeCardItem || appState.pendaftaran.find(p => p['Status Persetujuan'] === 'Disetujui') || appState.pendaftaran[0];
              const matchJadwal = appState.jadwal.find(j =>
                j['Kode Prodi'] === target['Kode Prodi'] && j['Mata Kuliah'] === target['Mata Kuliah']
              );
              return <KartuUjianCard pendaftaran={target} jadwal={matchJadwal} />;
            })()}
          </div>
        )}

        {/* TAB 3: EXPORT REKAPITULASI LAPORAN KE PDF */}
        {activeTab === 'exportPdf' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-slate-800">Dokumen Rekapitulasi Akademik FEB UIKA</h2>
                <p className="text-xs text-slate-500">Tata letak standar A4 Landscape resmi siap cetak / simpan ke PDF.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>

            <ExportPdfDoc
              items={filteredList}
              filterProdi={filterProdi}
              filterStatus={filterStatus}
            />
          </div>
        )}

        {/* TAB 4: DASHBOARD EXECUTIVE */}
        {activeTab === 'executive' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-blue-200">
                  Analytics & Rekapitulasi
                </span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Dashboard Eksekutif FEB UIKA</h2>
                <p className="text-xs text-slate-500">Pemantauan data pendaftaran, rasio persetujuan, dan retribusi akademik.</p>
              </div>
            </div>

            {/* RASIO PERSETUJUAN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">Rasio Persetujuan Berkas</h4>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-700">Disetujui</span>
                    <span>{statTotal > 0 ? Math.round((statApproved / statTotal) * 100) : 0}% ({statApproved})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{ width: `${statTotal > 0 ? (statApproved / statTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-700">Pending</span>
                    <span>{statTotal > 0 ? Math.round((statPending / statTotal) * 100) : 0}% ({statPending})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2.5 rounded-full"
                      style={{ width: `${statTotal > 0 ? (statPending / statTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* REKAP PRODI TABLE */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs md:col-span-2 space-y-3">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">Rekapitulasi Per Program Studi</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Kode</th>
                        <th className="p-2.5">Program Studi</th>
                        <th className="p-2.5 text-center">Total</th>
                        <th className="p-2.5 text-center text-emerald-700">Disetujui</th>
                        <th className="p-2.5 text-center text-amber-700">Pending</th>
                        <th className="p-2.5 text-right">Retribusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {appState.master.prodi.map(pr => {
                        const count = appState.pendaftaran.filter(p => p['Kode Prodi'] === pr['Kode Prodi']).length;
                        const app = appState.pendaftaran.filter(p => p['Kode Prodi'] === pr['Kode Prodi'] && p['Status Persetujuan'] === 'Disetujui').length;
                        const pnd = appState.pendaftaran.filter(p => p['Kode Prodi'] === pr['Kode Prodi'] && p['Status Persetujuan'] === 'Pending').length;
                        const nom = appState.pendaftaran.filter(p => p['Kode Prodi'] === pr['Kode Prodi']).reduce((acc, x) => acc + (Number(x.Nominal) || 0), 0);

                        return (
                          <tr key={pr['Kode Prodi']} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-blue-900">{pr['Kode Prodi']}</td>
                            <td className="p-2.5 font-semibold text-slate-800">{pr['Nama Prodi']} ({pr.Jenjang})</td>
                            <td className="p-2.5 text-center font-bold text-slate-900">{count}</td>
                            <td className="p-2.5 text-center text-emerald-600 font-bold">{app}</td>
                            <td className="p-2.5 text-center text-amber-600 font-bold">{pnd}</td>
                            <td className="p-2.5 text-right font-mono text-purple-900 font-bold">Rp {nom.toLocaleString('id-ID')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: JADWAL UJIAN */}
        {activeTab === 'jadwal' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-800 text-sm">Jadwal Pelaksanaan Ujian Susulan & Remedial</h3>
                <p className="text-xs text-slate-500">Tersusun rapi dengan tanggal, jam pelaksanaan, dan ruangan resmi FEB UIKA.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase font-black border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Jadwal Pelaksanaan</th>
                    <th className="p-3">Ruangan</th>
                    <th className="p-3">Program Studi & Kelas</th>
                    <th className="p-3">Mata Kuliah</th>
                    <th className="p-3">Dosen Pengampu</th>
                    <th className="p-3">Tata Tertib</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {appState.jadwal.map(j => (
                    <tr key={j.ID} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-900">{j.ID}</td>
                      <td className="p-3">
                        <b className="text-slate-900">{j['Tanggal Ujian']}</b><br />
                        <span className="font-mono text-emerald-800 font-bold">{j['Jam Mulai']} - {j['Jam Selesai']} WIB</span>
                      </td>
                      <td className="p-3"><span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 font-black border border-emerald-300">{j.Ruangan}</span></td>
                      <td className="p-3"><b>{j['Program Studi']}</b><br /><span className="text-slate-500">{j.Semester} &bull; {j.Kelas}</span></td>
                      <td className="p-3"><b className="text-blue-950">{j['Mata Kuliah']}</b></td>
                      <td className="p-3 text-slate-700">{j['Dosen Pengampu']}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{j.Keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: PUSAT KODE SUMBER UTUH (CODE.GS, SETUP.GS, INDEX.HTML, HOSTINGER) */}
        {activeTab === 'codeCenter' && <CodeCenter />}
      </main>

      {/* MODAL: CETAK KARTU UJIAN DIGITAL POPUP */}
      {activeCardItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 no-print">
              <h3 className="font-black text-slate-800 text-sm">Kartu Tanda Peserta Ujian Digital</h3>
              <button onClick={() => setActiveCardItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {(() => {
              const matchJadwal = appState.jadwal.find(j =>
                j['Kode Prodi'] === activeCardItem['Kode Prodi'] && j['Mata Kuliah'] === activeCardItem['Mata Kuliah']
              );
              return <KartuUjianCard pendaftaran={activeCardItem} jadwal={matchJadwal} onPrint={() => window.print()} />;
            })()}
          </div>
        </div>
      )}

      {/* MODAL: EXPORT DATA KE PDF POPUP */}
      {showExportPdfModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 no-print">
              <h3 className="font-black text-slate-800 text-sm">Export Rekapitulasi Data Pendaftaran ke PDF</h3>
              <button onClick={() => setShowExportPdfModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ExportPdfDoc
              items={filteredList}
              filterProdi={filterProdi}
              filterStatus={filterStatus}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      )}

      {/* MODAL: SETTING STATUS PEMBAYARAN */}
      {showPayModal && selectedPayItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-800 text-sm">Setting Status Pembayaran</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <p><b>ID Reg:</b> <span className="font-mono text-blue-900">{selectedPayItem.ID}</span></p>
              <p><b>Mahasiswa:</b> {selectedPayItem['Nama Mahasiswa']} ({selectedPayItem.NPM})</p>
              <p><b>Mata Kuliah:</b> {selectedPayItem['Mata Kuliah']}</p>
              <p><b>Nominal:</b> <span className="font-mono font-black text-emerald-700">Rp {Number(selectedPayItem.Nominal || 0).toLocaleString('id-ID')}</span></p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Pilih Status Pembayaran:</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  payStatusRadio === 'Lunas' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="payRadio"
                    checked={payStatusRadio === 'Lunas'}
                    onChange={() => setPayStatusRadio('Lunas')}
                    className="text-emerald-600"
                  />
                  <span>Lunas</span>
                </label>
                <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  payStatusRadio === 'Belum Bayar' ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="payRadio"
                    checked={payStatusRadio === 'Belum Bayar'}
                    onChange={() => setPayStatusRadio('Belum Bayar')}
                    className="text-amber-600"
                  />
                  <span>Belum Bayar</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Pembayaran:</label>
                <input
                  type="text"
                  value={payCatatan}
                  onChange={e => setPayCatatan(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                className="px-4 py-2 rounded-xl font-bold bg-blue-900 text-white hover:bg-blue-800 text-xs shadow-md"
              >
                Simpan Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PENDAFTARAN */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-800 text-sm">Form Pendaftaran Ujian Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">NPM Mahasiswa</label>
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={e => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Contoh: 2311010045"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.namaMahasiswa}
                    onChange={e => setFormData({ ...formData, namaMahasiswa: e.target.value })}
                    placeholder="Nama Mahasiswa"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Program Studi</label>
                  <select
                    value={formData.kodeProdi}
                    onChange={e => {
                      const opt = appState.master.prodi.find(p => p['Kode Prodi'] === e.target.value);
                      setFormData({
                        ...formData,
                        kodeProdi: e.target.value,
                        prodi: opt?.['Nama Prodi'] || e.target.value
                      });
                    }}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    {appState.master.prodi.map(p => (
                      <option key={p['Kode Prodi']} value={p['Kode Prodi']}>
                        [{p['Kode Prodi']}] {p['Nama Prodi']}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    value={formData.kelas}
                    onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Mata Kuliah</label>
                  <input
                    type="text"
                    required
                    value={formData.mataKuliah}
                    onChange={e => setFormData({ ...formData, mataKuliah: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Dosen Pengampu</label>
                  <input
                    type="text"
                    required
                    value={formData.dosenPengampu}
                    onChange={e => setFormData({ ...formData, dosenPengampu: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Jenis Layanan</label>
                <select
                  value={formData.jenisLayanan}
                  onChange={e => setFormData({ ...formData, jenisLayanan: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white font-bold text-blue-900"
                >
                  <option value="UTS Susulan">UTS Susulan</option>
                  <option value="UAS Susulan">UAS Susulan</option>
                  <option value="Remedial Teaching">Remedial Teaching</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Alasan Pengajuan</label>
                <textarea
                  required
                  rows={2}
                  value={formData.alasan}
                  onChange={e => setFormData({ ...formData, alasan: e.target.value })}
                  placeholder="Keterangan sakit / kedukaan / dinas organisasi..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-blue-900 text-white hover:bg-blue-800 shadow-md"
                >
                  Simpan Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CETAK KWITANSI PEMBAYARAN */}
      {selectedKwitansiItem && (
        <KwitansiModal
          item={selectedKwitansiItem}
          onClose={() => setSelectedKwitansiItem(null)}
          onPrint={() => window.print()}
        />
      )}

      {/* MODAL: API TESTER HOSTINGER */}
      {showApiTesterModal && (
        <ApiTesterModal
          onClose={() => setShowApiTesterModal(false)}
        />
      )}
    </div>
  );
}

function CodeCenterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
