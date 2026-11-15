import React from 'react';
import { PendaftaranItem } from '../types';
import { Printer, X, Receipt, CheckCircle } from 'lucide-react';

interface KwitansiModalProps {
  item: PendaftaranItem;
  onClose: () => void;
  onPrint?: () => void;
}

export const KwitansiModal: React.FC<KwitansiModalProps> = ({ item, onClose, onPrint }) => {
  const nominal = Number(item.Nominal) || 0;
  const isLunas = (item['Status Pembayaran'] || '').toLowerCase() === 'lunas';
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  function terbilang(angka: number): string {
    const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    function convert(n: number): string {
      if (n < 12) return satuan[n];
      if (n < 20) return convert(n - 10) + ' Belas';
      if (n < 100) return convert(Math.floor(n / 10)) + ' Puluh ' + convert(n % 10);
      if (n < 200) return 'Seratus ' + convert(n - 100);
      if (n < 1000) return convert(Math.floor(n / 100)) + ' Ratus ' + convert(n % 100);
      if (n < 2000) return 'Seribu ' + convert(n - 1000);
      if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Ribu ' + convert(n % 1000);
      if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Juta ' + convert(n % 1000000);
      return '';
    }
    const val = Math.floor(Math.abs(angka));
    if (val === 0) return 'Nol Rupiah';
    return (convert(val) + ' Rupiah').replace(/\s+/g, ' ').trim();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 no-print">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center text-sm font-bold">
              <Receipt className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-800 text-sm">Kwitansi Bukti Pembayaran Resmi</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint || (() => window.print())}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> <span>Cetak Kwitansi</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="printable-card bg-white p-6 border-2 border-slate-300 rounded-3xl space-y-4 text-slate-800">
          <div className="flex items-center space-x-3.5 border-b-2 border-slate-900 pb-3">
            <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-white rounded-xl p-1 border border-slate-300 shadow-xs">
              <img
                src="https://lh3.googleusercontent.com/d/1o6uQ6Fak-bFbJUzhH7LyDqqT_KjVuqge"
                referrerPolicy="no-referrer"
                alt="Logo UIKA"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-black text-slate-900 uppercase leading-snug">UNIVERSITAS IBN KHALDUN BOGOR</h2>
              <h3 className="text-xs font-bold text-blue-900 uppercase">FAKULTAS EKONOMI DAN BISNIS (FEB)</h3>
              <p className="text-[10px] text-slate-600">Jl. KH. Sholeh Iskandar, Kedungbadak, Tanah Sareal, Kota Bogor 16162</p>
            </div>
          </div>

          <div className="text-center py-1">
            <h4 className="text-sm font-black uppercase underline decoration-2 tracking-wider">KWITANSI BUKTI PEMBAYARAN</h4>
            <p className="text-xs font-mono font-bold text-slate-600 mt-1">NO: KWT-FEB/2026/INV-{item.ID}</p>
          </div>

          <table className="w-full text-xs font-medium border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 w-36 font-semibold">Telah Diterima Dari</td>
                <td className="py-2 text-slate-900 font-bold">: {item['Nama Mahasiswa']} (NPM: {item.NPM})</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Program Studi / Kelas</td>
                <td className="py-2 text-slate-900 font-bold">: [{item['Kode Prodi']}] {item['Program Studi']} - {item.Kelas}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Untuk Pembayaran</td>
                <td className="py-2 text-slate-900 font-bold">: Retribusi {item['Jenis Layanan']} ({item['Mata Kuliah']})</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Terbilang</td>
                <td className="py-2 text-blue-900 font-black italic bg-blue-50/50 px-2 rounded-lg">: {terbilang(nominal)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Status Pembayaran</td>
                <td className="py-2 font-bold">: 
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                    isLunas ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {item['Status Pembayaran']}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between items-end pt-4">
            <div className="border-2 border-slate-800 bg-slate-50 rounded-xl px-4 py-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Jumlah Nominal</span>
              <span className="text-xl font-black text-slate-900 font-mono">Rp {nominal.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Metode: Pembayaran Tunai (Loket Tata Usaha)</span>
              </span>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-600">Bogor, {todayStr}</p>
              <p className="text-[10px] font-semibold text-slate-700 max-w-[210px] leading-tight">Pj. Kasubbag. Administrasi Umum & Keuangan</p>
              <div className="border-b border-slate-800 w-44 mx-auto mt-10"></div>
              <p className="text-xs font-bold text-slate-900 mt-1">Gadis Mutmainah Permatacahyani, S.Ak.</p>
              <p className="text-[9px] text-slate-400 italic mt-0.5">( Tanda Tangan & Stempel Sah )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
