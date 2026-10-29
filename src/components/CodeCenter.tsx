import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, FileCode, Server, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

export const CodeCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'codegs' | 'setupgs' | 'gashtml' | 'hostingerhtml' | 'guide'>('codegs');
  const [codeContent, setCodeContent] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Fetch raw files from public directory
    const fetchFile = async (key: string, url: string) => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          setCodeContent(prev => ({ ...prev, [key]: text }));
        }
      } catch (e) {
        console.warn('Failed to load file for preview:', url, e);
      }
    };

    fetchFile('codegs', '/gas/Code.gs');
    fetchFile('setupgs', '/gas/Setup.gs');
    fetchFile('gashtml', '/gas/Index.html');
    fetchFile('hostingerhtml', '/hostinger/index.html');
  }, []);

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'codegs', label: 'Code.gs (Backend Dual-Mode)', icon: Server, file: 'Code.gs' },
    { id: 'setupgs', label: 'Setup.gs (Inisialisasi Sheet)', icon: FileCode, file: 'Setup.gs' },
    { id: 'gashtml', label: 'Index.html (GAS Template)', icon: Globe, file: 'Index.html' },
    { id: 'hostingerhtml', label: 'index.html (Hostinger Standalone)', icon: ExternalLink, file: 'index.html' },
    { id: 'guide', label: '📖 Panduan Deploy Hostinger', icon: ShieldCheck, file: 'Panduan.txt' }
  ];

  const currentCode = codeContent[activeTab] || '// Memuat kode sumber lengkap...';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
            <Server className="w-3 h-3 text-blue-700" />
            <span>Pusat Kode Sumber Utuh 100% (Tanpa Potongan)</span>
          </div>
          <h2 className="text-lg font-black text-slate-800 mt-1">
            Kode Sumber Google Apps Script & Hostinger Standalone
          </h2>
          <p className="text-xs text-slate-500">
            Salin atau unduh kode lengkap untuk backend spreadsheet dan frontend Hostinger Anda.
          </p>
        </div>

        {activeTab !== 'guide' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy(activeTab, currentCode)}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              {copied === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === activeTab ? 'Berhasil Disalin!' : 'Salin Kode Utuh'}</span>
            </button>
            <button
              onClick={() => handleDownload(tabs.find(t => t.id === activeTab)?.file || 'script.txt', currentCode)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File</span>
            </button>
          </div>
        )}
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                isActive ? 'bg-white text-blue-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-900' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* CODE DISPLAY AREA */}
      {activeTab !== 'guide' ? (
        <div className="relative rounded-2xl border border-slate-300 bg-slate-950 overflow-hidden text-xs">
          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-slate-400 font-mono text-[11px]">
            <span>File: {tabs.find(t => t.id === activeTab)?.file}</span>
            <span>{currentCode.split('\n').length} baris kode &bull; 100% Utuh</span>
          </div>
          <pre className="p-4 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed selection:bg-blue-600 selection:text-white">
            <code>{currentCode}</code>
          </pre>
        </div>
      ) : (
        /* PANDUAN LANGKAH DEMI LANGKAH */
        <div className="space-y-4 text-xs text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs">1</span>
            <span>Langkah Deploy di Google Apps Script (Backend & Native App)</span>
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 ml-2 text-slate-600">
            <li>Buka spreadsheet Google Anda untuk database FEB UIKA.</li>
            <li>Klik menu <b>Ekstensi</b> &rarr; <b>Apps Script</b>.</li>
            <li>Buat file <code>Code.gs</code> dan tempelkan seluruh kode dari tab <b>Code.gs</b> di atas.</li>
            <li>Buat file <code>Setup.gs</code> dan tempelkan kode dari tab <b>Setup.gs</b>, lalu jalankan fungsi <code>setupDatabase()</code> satu kali untuk inisialisasi sheet.</li>
            <li>Buat file HTML dengan nama <code>Index.html</code> dan tempelkan kode dari tab <b>Index.html (GAS Template)</b>.</li>
            <li>Klik <b>Deploy</b> (Terapkan) &rarr; <b>New deployment</b> &rarr; pilih <b>Web app</b>.</li>
            <li>Pilih: Execute as: <b>Me</b>, dan Who has access: <b>Anyone</b> (Penting agar Hostinger dapat mengakses REST API).</li>
            <li>Salin <b>Web app URL</b> (berakhiran <code>/exec</code>).</li>
          </ol>

          <hr className="border-slate-200 my-4" />

          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">2</span>
            <span>Langkah Deploy di Hostinger / cPanel (Frontend Standalone)</span>
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 ml-2 text-slate-600">
            <li>Unduh file <code>index.html</code> dari tab <b>index.html (Hostinger Standalone)</b>.</li>
            <li>Buka File Manager Hostinger (cPanel), masuk ke direktori <code>public_html</code> (atau subdomain kampus Anda).</li>
            <li>Unggah file <code>index.html</code> ke folder tersebut.</li>
            <li>Buka website Anda di browser. Klik tombol <b>"Konfigurasi API GAS"</b> di kanan atas.</li>
            <li>Tempelkan Web App Exec URL yang didapat dari langkah nomor 1.</li>
            <li>Data otomatis terhubung dua arah via REST API (CORS enabled) dan pemfilteran client-side berjalan cepat tanpa lemot!</li>
          </ol>
        </div>
      )}
    </div>
  );
};
