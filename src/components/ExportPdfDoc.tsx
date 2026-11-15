import React from 'react';
import { PendaftaranItem } from '../types';
import { Printer, FileDown } from 'lucide-react';

interface ExportPdfDocProps {
  items: PendaftaranItem[];
  filterProdi?: string;
  filterStatus?: string;
  tahunAkademik?: string;
  semester?: string;
  onPrint?: () => void;
}

export const ExportPdfDoc: React.FC<ExportPdfDocProps> = ({
  items,
  filterProdi,
  filterStatus,
  tahunAkademik = '2026/2027',
  semester = 'Ganjil',
  onPrint
}) => {
  const total = items.length;
  const approved = items.filter(p => p['Status Persetujuan'] === 'Disetujui').length;
  const pending = items.filter(p => p['Status Persetujuan'] === 'Pending').length;
  const totalNominal = items.reduce((acc, p) => acc + (Number(p.Nominal) || 0), 0);
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-3xl border border-slate-300 shadow-xl p-6 sm:p-8 space-y-4 max-w-4xl mx-auto printable-report text-slate-800">
      {/* KOP SURAT RESMI */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-white rounded-xl p-1 border border-slate-300 shadow-xs">
            <img
              src="https://lh3.googleusercontent.com/d/1o6uQ6Fak-bFbJUzhH7LyDqqT_KjVuqge"
              referrerPolicy="no-referrer"
              alt="Logo UIKA"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-950 uppercase tracking-tight">
              UNIVERSITAS IBN KHALDUN BOGOR
            </h2>
            <h3 className="text-xs sm:text-sm font-extrabold text-blue-900 uppercase">
              FAKULTAS EKONOMI DAN BISNIS (FEB)
            </h3>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              REKAPITULASI PENDAFTARAN UJIAN SUSULAN & REMEDIAL
            </p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold text-slate-800">TA {tahunAkademik} ({semester})</p>
          <p className="text-[11px] text-slate-500">Tanggal: {todayStr}</p>
          {filterProdi && <p className="text-[10px] text-blue-800 font-bold">Prodi: {filterProdi}</p>}
          {filterStatus && <p className="text-[10px] text-emerald-800 font-bold">Status: {filterStatus}</p>}
        </div>
      </div>

      {/* STATS SUMMARY BOXES */}
      <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Pengajuan:</span>
          <b className="text-sm sm:text-base text-slate-900">{total} Berkas</b>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Disetujui:</span>
          <b className="text-sm sm:text-base text-emerald-700">{approved} Berkas</b>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Pending TU:</span>
          <b className="text-sm sm:text-base text-amber-700">{pending} Berkas</b>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Retribusi:</span>
          <b className="text-sm sm:text-base text-blue-950 font-mono">Rp {totalNominal.toLocaleString('id-ID')}</b>
        </div>
      </div>

      {/* TABEL DATA REKAPITULASI */}
      <div className="border border-slate-300 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-blue-950 text-white uppercase text-[9.5px] font-bold">
            <tr>
              <th className="p-2 text-center w-8">No</th>
              <th className="p-2">ID Reg</th>
              <th className="p-2">NPM</th>
              <th className="p-2">Nama Mahasiswa</th>
              <th className="p-2">Program Studi</th>
              <th className="p-2">Mata Kuliah</th>
              <th className="p-2">Layanan</th>
              <th className="p-2 text-right">Retribusi</th>
              <th className="p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <tr key={item.ID} className="hover:bg-slate-50">
                <td className="p-2 text-center font-mono text-slate-500">{idx + 1}</td>
                <td className="p-2 font-mono font-bold text-blue-900">{item.ID}</td>
                <td className="p-2 font-mono">{item.NPM}</td>
                <td className="p-2 font-bold text-slate-900">{item['Nama Mahasiswa']}</td>
                <td className="p-2">[{item['Kode Prodi']}] {item['Program Studi']}</td>
                <td className="p-2 font-medium">{item['Mata Kuliah']}</td>
                <td className="p-2">{item['Jenis Layanan']}</td>
                <td className="p-2 text-right font-mono">Rp {Number(item.Nominal || 0).toLocaleString('id-ID')}</td>
                <td className="p-2 text-center font-bold">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                    item['Status Persetujuan'] === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                    item['Status Persetujuan'] === 'Ditolak' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {item['Status Persetujuan']}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-400">
                  Tidak ada data pendaftaran yang sesuai dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TANDA TANGAN PEJABAT DEKANAT */}
      <div className="flex justify-between items-end pt-4 text-xs">
        <div className="text-slate-500 text-[10px] max-w-sm">
          <p><b>Catatan Dokumen:</b></p>
          <p>Rekapitulasi ini dihasilkan secara otomatis dari data resmi FEB UIKA Bogor dan berlaku sah sebagai arsip laporan akademik fakultas.</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-[11px]">Bogor, {todayStr}</p>
          <p className="font-bold text-slate-900 mt-0.5">Wakil Dekan Bidang Akademik,</p>
          <p className="font-black text-slate-900 mt-12 underline text-xs">Dr. Asti Marlina, S.E., MMSI., DBA.</p>
          <p className="text-[10px] font-mono text-slate-500">NIK. 197205151998032002</p>
        </div>
      </div>

      {/* PRINT BUTTON */}
      <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 no-print">
        <button
          type="button"
          onClick={onPrint || (() => window.print())}
          className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center space-x-1.5 cursor-pointer transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Laporan / Simpan PDF</span>
        </button>
      </div>
    </div>
  );
};
