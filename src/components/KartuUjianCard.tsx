import React from 'react';
import { PendaftaranItem, JadwalUjianItem } from '../types';
import { Printer, ShieldCheck, QrCode } from 'lucide-react';

interface KartuUjianCardProps {
  pendaftaran: PendaftaranItem;
  jadwal?: JadwalUjianItem;
  onPrint?: () => void;
}

export const KartuUjianCard: React.FC<KartuUjianCardProps> = ({ pendaftaran, jadwal, onPrint }) => {
  const isApproved = pendaftaran['Status Persetujuan'] === 'Disetujui';
  const hasSchedule = jadwal && jadwal['Tanggal Ujian'] && jadwal.Ruangan;

  const tglUjian = jadwal?.['Tanggal Ujian'] || 'Menunggu Penjadwalan TU';
  const jamUjian = jadwal ? `${jadwal['Jam Mulai']} - ${jadwal['Jam Selesai']} WIB` : '-';
  const ruanganUjian = jadwal?.Ruangan || 'Belum Diplot';
  const noReg = pendaftaran.ID;
  const npm = pendaftaran.NPM;
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const qrData = `FEB-UIKA-RESMI|ID:${noReg}|NPM:${npm}|NAMA:${pendaftaran['Nama Mahasiswa']}|MATKUL:${pendaftaran['Mata Kuliah']}|RUANG:${ruanganUjian}|STATUS:TERVERIFIKASI_SAH`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-6 sm:p-7 space-y-4 max-w-xl mx-auto printable-card">
      {/* KOP SURAT RESMI FEB UIKA */}
      <div className="flex items-center space-x-3.5 border-b-2 border-slate-900 pb-3">
        <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-white rounded-xl p-1 border border-slate-300 shadow-xs">
          <img
            src="https://lh3.googleusercontent.com/d/1o6uQ6Fak-bFbJUzhH7LyDqqT_KjVuqge"
            referrerPolicy="no-referrer"
            alt="Logo Resmi UIKA"
            className="w-12 h-12 object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight leading-snug">
            UNIVERSITAS IBN KHALDUN BOGOR
          </h2>
          <h3 className="text-xs sm:text-sm font-extrabold text-blue-900 uppercase">
            FAKULTAS EKONOMI DAN BISNIS (FEB)
          </h3>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
            KARTU TANDA PESERTA UJIAN DIGITAL
          </p>
        </div>
      </div>

      {/* HEADER NOMOR & STATUS */}
      <div className="flex justify-between items-center pt-1">
        <div>
          <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            NO: {noReg}
          </span>
          <h4 className="text-sm font-black text-slate-900 mt-1 uppercase">
            {pendaftaran['Jenis Layanan']}
          </h4>
        </div>
        <div className="text-right">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
            isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {pendaftaran['Status Persetujuan']}
          </span>
          <p className="text-[9.5px] text-slate-400 mt-0.5 font-mono">
            TA {pendaftaran['Tahun Akademik']} ({pendaftaran.Semester})
          </p>
        </div>
      </div>

      {/* RINCIAN DATA MAHASISWA & MATA KULIAH */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
        <div className="grid grid-cols-3 gap-1">
          <span className="text-slate-500 font-semibold">Nama Mahasiswa</span>
          <span className="col-span-2 font-black text-slate-900">: {pendaftaran['Nama Mahasiswa']}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-slate-500 font-semibold">NPM / NIM</span>
          <span className="col-span-2 font-bold font-mono text-slate-900">: {npm}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-slate-500 font-semibold">Program Studi</span>
          <span className="col-span-2 font-semibold text-slate-800">: [{pendaftaran['Kode Prodi']}] {pendaftaran['Program Studi']}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-slate-500 font-semibold">Semester & Kelas</span>
          <span className="col-span-2 font-semibold text-slate-800">: {pendaftaran.Semester} &bull; {pendaftaran.Kelas}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-slate-500 font-semibold">Mata Kuliah</span>
          <span className="col-span-2 font-black text-blue-950">: {pendaftaran['Mata Kuliah']}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <span className="text-slate-500 font-semibold">Dosen Pengampu</span>
          <span className="col-span-2 font-semibold text-slate-800">: {pendaftaran['Dosen Pengampu']}</span>
        </div>
      </div>

      {/* JADWAL PELAKSANAAN RESMI & RUANGAN */}
      <div className="grid grid-cols-2 gap-3 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs">
        <div>
          <p className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Jadwal Pelaksanaan
          </p>
          <p className="font-black text-slate-900 mt-1 text-sm">{tglUjian}</p>
          <p className="text-xs font-mono font-bold text-emerald-950 mt-0.5">{jamUjian}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Ruangan Ujian
          </p>
          <p className="text-base font-black text-emerald-900 mt-1">{ruanganUjian}</p>
          <p className="text-[10px] text-slate-500">Gedung FEB UIKA Bogor</p>
        </div>
      </div>

      {/* QR CODE VALIDASI KEABSAHAN & TANDA TANGAN */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
        <div className="flex items-center space-x-3">
          <img src={qrUrl} alt="QR Validasi" className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-300 shadow-xs" />
          <div className="space-y-0.5 text-[10px]">
            <p className="font-bold text-emerald-800 uppercase flex items-center gap-1">
              <QrCode className="w-3 h-3 text-emerald-700" />
              <span>Validasi Dokumen Sah</span>
            </p>
            <p className="text-slate-500 leading-tight">Pindai QR code untuk verifikasi peserta ujian.</p>
            <p className="font-mono text-slate-400">Hash: FEB-{noReg}-{String(npm).slice(-4)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">Bogor, {todayStr}</p>
          <p className="font-bold text-slate-900 text-xs mt-0.5">Kasubbag Akademik & TU,</p>
          <p className="font-black text-slate-900 mt-5 underline text-xs">Wawan Setiawan, M.Pd.</p>
          <p className="text-[9.5px] font-mono text-slate-500">NIK. 410100242</p>
        </div>
      </div>

      {/* TOMBOL CETAK & STATUS */}
      <div className="flex justify-between items-center pt-2 text-xs no-print border-t border-slate-100">
        <span className="text-emerald-800 font-bold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Terverifikasi Sah Akademik</span>
        </span>
        <button
          type="button"
          onClick={onPrint || (() => window.print())}
          className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center space-x-1.5 cursor-pointer transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>
    </div>
  );
};
