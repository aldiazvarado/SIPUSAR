import React from 'react';
import { PendaftaranItem } from '../types';
import { Printer } from 'lucide-react';

interface ExportPdfDocProps {
  items: PendaftaranItem[];
  filterProdi?: string;
  filterStatus?: string;
  tahunAkademik?: string;
  semester?: string;
  onPrint?: () => void;
}

interface ParsedCourseEntry {
  text: string;
  nilai?: string;
}

function parseCoursesForPdf(item: PendaftaranItem): ParsedCourseEntry[] {
  const entries: ParsedCourseEntry[] = [];

  if (Array.isArray(item.mataKuliahList) && item.mataKuliahList.length > 0) {
    item.mataKuliahList.forEach(m => {
      const baseName = String(m.nama || m.mataKuliah || '').trim();
      if (!baseName) return;
      const sksVal = Number(m.sks || 0);
      const hasSksLabel = /\(\s*\d+\s*SKS\s*\)/i.test(baseName);
      const text = sksVal > 0 && !hasSksLabel ? `${baseName} (${sksVal} SKS)` : baseName;
      const nilai = String(m.nilaiHuruf || '').trim();
      entries.push({ text, nilai: nilai || undefined });
    });
  }

  if (entries.length === 0) {
    const raw = String(item['Mata Kuliah'] || '').trim();
    if (raw && raw !== '-') {
      raw.split(/\r?\n/).forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        trimmedLine.split(/(?=(?:^|\s)\d+\.\s+)/).forEach(part => {
          const cleaned = part.trim().replace(/^\d+\.\s*/, '').trim();
          if (cleaned) entries.push({ text: cleaned });
        });
      });
    }
  }

  return entries;
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
    <div className="bg-white rounded-3xl border border-slate-300 shadow-xl p-6 sm:p-8 space-y-4 max-w-6xl mx-auto printable-report text-slate-800">
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
          <p className="font-bold text-slate-800">Tahun Akademik: {tahunAkademik} ({semester})</p>
          <p className="text-[11px] text-slate-500">Tanggal Cetak: {todayStr}</p>
          {filterProdi && <p className="text-[10px] text-blue-800 font-bold">Prodi: {filterProdi}</p>}
          {filterStatus && <p className="text-[10px] text-emerald-800 font-bold">Status: {filterStatus}</p>}
        </div>
      </div>

      {/* STATS SUMMARY BOXES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Pengajuan:</span>
          <b className="text-sm sm:text-base text-slate-900 font-mono tabular-nums">{total} Berkas</b>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Disetujui:</span>
          <b className="text-sm sm:text-base text-emerald-700 font-mono tabular-nums">{approved} Berkas</b>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Pending TU:</span>
          <b className="text-sm sm:text-base text-amber-700 font-mono tabular-nums">{pending} Berkas</b>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Retribusi:</span>
          <b className="text-sm sm:text-base text-blue-950 font-mono tabular-nums">Rp {totalNominal.toLocaleString('id-ID')}</b>
        </div>
      </div>

      {/* TABEL DATA REKAPITULASI */}
      <div className="border border-slate-300 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-blue-950 text-white uppercase text-[9.5px] font-bold">
            <tr>
              <th className="p-2 text-center w-9 whitespace-nowrap">No</th>
              <th className="p-2 whitespace-nowrap">ID Reg</th>
              <th className="p-2 whitespace-nowrap">NPM</th>
              <th className="p-2 whitespace-nowrap min-w-[130px]">Nama Mahasiswa</th>
              <th className="p-2 whitespace-nowrap min-w-[115px]">Program Studi</th>
              <th className="p-2 min-w-[230px]">Mata Kuliah</th>
              <th className="p-2 whitespace-nowrap">Layanan</th>
              <th className="p-2 text-right whitespace-nowrap">Retribusi</th>
              <th className="p-2 text-center whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const courses = parseCoursesForPdf(item);
              const nominalVal = Number(item.Nominal || 0);
              const rawBayar = String(item['Status Pembayaran'] || '').trim();
              const statusBayar = !rawBayar
                ? (nominalVal > 0 ? 'Belum Bayar' : 'Gratis (Tepat Waktu)')
                : (rawBayar.toLowerCase().startsWith('belum bayar') ? 'Belum Bayar' : rawBayar);
              const bayarLower = statusBayar.toLowerCase();
              const bayarColorClass = bayarLower.includes('lunas')
                ? 'text-emerald-700'
                : bayarLower.includes('gratis')
                  ? 'text-blue-700'
                  : 'text-rose-700';

              const statusColorClass =
                item['Status Persetujuan'] === 'Disetujui'
                  ? 'text-emerald-700'
                  : item['Status Persetujuan'] === 'Ditolak'
                    ? 'text-rose-700'
                    : 'text-amber-700';

              return (
                <tr key={item.ID} className="hover:bg-slate-50/70">
                  <td className="p-2 align-top text-center font-mono text-slate-500 tabular-nums whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="p-2 align-top font-mono font-bold text-blue-900 tabular-nums whitespace-nowrap">
                    {item.ID}
                  </td>
                  <td className="p-2 align-top font-mono text-slate-700 tabular-nums whitespace-nowrap">
                    {item.NPM}
                  </td>
                  <td className="p-2 align-top font-bold text-slate-900 leading-snug">
                    {item['Nama Mahasiswa']}
                  </td>
                  <td className="p-2 align-top text-slate-700 leading-snug">
                    [{item['Kode Prodi']}] {item['Program Studi']}
                  </td>
                  <td className="p-2 align-top text-slate-800">
                    {courses.length === 0 ? (
                      <span className="text-slate-400">-</span>
                    ) : courses.length === 1 ? (
                      <div className="leading-snug font-medium break-words">
                        {courses[0].text}
                        {courses[0].nilai && (
                          <span className="text-[9.5px] font-bold text-indigo-800 ml-1">
                            [Nilai: {courses[0].nilai}]
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {courses.map((course, cIdx) => (
                          <div key={cIdx} className="flex items-baseline gap-1.5 leading-snug">
                            <span className="font-mono font-bold text-slate-500 shrink-0 tabular-nums w-4 text-right">
                              {cIdx + 1}.
                            </span>
                            <span className="font-medium break-words min-w-0">
                              {course.text}
                              {course.nilai && (
                                <span className="text-[9.5px] font-bold text-indigo-800 ml-1">
                                  [Nilai: {course.nilai}]
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-2 align-top text-slate-700 font-medium whitespace-nowrap">
                    {item['Jenis Layanan']}
                  </td>
                  <td className="p-2 align-top text-right whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      Rp {nominalVal.toLocaleString('id-ID')}
                    </div>
                    <div className={`text-[9.5px] font-semibold leading-tight mt-0.5 whitespace-nowrap ${bayarColorClass}`}>
                      {statusBayar}
                    </div>
                  </td>
                  <td className={`p-2 align-top text-center font-bold whitespace-nowrap ${statusColorClass}`}>
                    {item['Status Persetujuan']}
                  </td>
                </tr>
              );
            })}
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
          className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center space-x-1.5 cursor-pointer transition whitespace-nowrap shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Laporan / Simpan PDF</span>
        </button>
      </div>
    </div>
  );
};
