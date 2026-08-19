import React, { useState, useEffect } from 'react';
import { adminService } from '../../../api/adminService';
import { Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PredictionList = () => {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPredictions(page, limit);
      setPredictions(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [page]);

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Riwayat Prediksi & Diagnosis</h2>
        <p className="text-sm text-slate-500">Daftar rekam medis dan hasil diagnosis penyakit rusa (Read-Only).</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6 w-16">ID</th>
              <th className="p-4">Rusa</th>
              <th className="p-4">Hasil Diagnosis</th>
              <th className="p-4">Tingkat Kepastian (CF/Mass)</th>
              <th className="p-4">User Penguji</th>
              <th className="p-4 text-right pr-6 w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {predictions.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">Tidak ada riwayat prediksi.</td>
              </tr>
            ) : (
              predictions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6 font-medium text-slate-500">#{p.id}</td>
                  <td className="p-4 font-semibold text-slate-900">{p.deer?.name || `Rusa #${p.deer_id}`}</td>
                  <td className="p-4">
                    {p.disease ? (
                      <span className="text-slate-950 font-semibold">{p.disease.name}</span>
                    ) : (
                      <span className="text-slate-400 italic">Tidak terdeteksi</span>
                    )}
                  </td>
                  <td className="p-4 font-medium text-emerald-600">
                    {p.cf !== null && p.cf !== undefined ? `${(p.cf * 100).toFixed(2)}%` : '-'}
                  </td>
                  <td className="p-4 text-slate-600">{p.user?.name || `User #${p.user_id}`}</td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => navigate(`/admin/predictions/${p.id}`)}
                      className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5 ml-auto text-xs font-semibold"
                    >
                      <Eye className="w-4 h-4" /> Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Menampilkan {predictions.length} dari {totalItems} data
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="flex items-center px-4 text-sm font-semibold text-slate-700">
                Halaman {page} dari {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionList;
