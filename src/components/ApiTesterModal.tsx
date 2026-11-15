import React, { useState } from 'react';
import { Server, Activity, ArrowRight, CheckCircle2, AlertTriangle, X, Play, RefreshCw, Send } from 'lucide-react';

interface ApiTesterModalProps {
  onClose: () => void;
}

export const ApiTesterModal: React.FC<ApiTesterModalProps> = ({ onClose }) => {
  const [endpointUrl, setEndpointUrl] = useState(localStorage.getItem('uika_gas_api_url') || '');
  const [testAction, setTestAction] = useState<'getInitialData' | 'checkRealtimeSync' | 'renderKartuUjianDigital' | 'loginUser'>('getInitialData');
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST'>('GET');
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<{
    status: number | string;
    timeMs: number;
    data: any;
    error?: string;
  } | null>(null);

  const handleTest = async () => {
    if (!endpointUrl.trim()) {
      alert('Masukkan URL Web App Google Apps Script terlebih dahulu!');
      return;
    }

    setLoading(true);
    setResponseLog(null);
    const start = performance.now();

    try {
      localStorage.setItem('uika_gas_api_url', endpointUrl.trim());

      let res: Response;
      if (httpMethod === 'GET') {
        const url = `${endpointUrl.trim()}?action=${testAction}&args=${encodeURIComponent(JSON.stringify(['Admin TU', 'admin', 'ALL']))}`;
        res = await fetch(url, { method: 'GET', mode: 'cors' });
      } else {
        res = await fetch(endpointUrl.trim(), {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: testAction,
            args: ['Admin TU', 'admin', 'ALL']
          })
        });
      }

      const elapsed = Math.round(performance.now() - start);
      const json = await res.json();

      setResponseLog({
        status: res.status,
        timeMs: elapsed,
        data: json
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setResponseLog({
        status: 'NETWORK_ERROR',
        timeMs: elapsed,
        data: null,
        error: err.message || 'CORS atau URL tidak dapat diakses. Pastikan deployment di-set ke "Who has access: Anyone".'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-black text-slate-800 text-sm">Hostinger & GAS REST API Tester (CORS Live)</h3>
              <p className="text-[11px] text-slate-500">Uji langsung koneksi endpoint doGet / doPost dari frontend Hostinger ke Google Apps Script.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Google Apps Script Web App Exec URL:</label>
            <input
              type="text"
              value={endpointUrl}
              onChange={e => setEndpointUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-xs focus:ring-2 focus:ring-purple-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">HTTP Method:</label>
              <select
                value={httpMethod}
                onChange={e => setHttpMethod(e.target.value as any)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
              >
                <option value="GET">GET (Query Params doGet)</option>
                <option value="POST">POST (JSON Body doPost)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Action API Test:</label>
              <select
                value={testAction}
                onChange={e => setTestAction(e.target.value as any)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
              >
                <option value="getInitialData">getInitialData (Ambil Semua Sheet)</option>
                <option value="checkRealtimeSync">checkRealtimeSync (Cek Versi Real-time)</option>
                <option value="renderKartuUjianDigital">renderKartuUjianDigital (HTML Kartu Ujian)</option>
                <option value="loginUser">loginUser (Simulasi Login Otentikasi)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleTest}
              disabled={loading}
              className="bg-purple-800 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{loading ? 'Menguji Koneksi...' : 'Kirim Request API'}</span>
            </button>
          </div>

          {/* RESPONSE LOG INSPECTOR */}
          {responseLog && (
            <div className="rounded-2xl border border-slate-300 bg-slate-950 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-[11px] pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${responseLog.status === 200 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  <span className="text-slate-200 font-bold">Status: {responseLog.status}</span>
                </span>
                <span className="text-purple-300">Latensi: {responseLog.timeMs} ms</span>
              </div>

              {responseLog.error ? (
                <div className="text-rose-400 text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Gagal Menghubungi API
                  </p>
                  <p>{responseLog.error}</p>
                </div>
              ) : (
                <pre className="text-emerald-400 text-[10.5px] max-h-48 overflow-y-auto overflow-x-auto leading-relaxed">
                  {JSON.stringify(responseLog.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
