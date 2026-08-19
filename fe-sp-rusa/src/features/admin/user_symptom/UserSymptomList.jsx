import React, { useState, useEffect } from 'react';
import { adminService } from '../../../api/adminService';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const UserSymptomList = () => {
  const [userSymptoms, setUserSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchUserSymptoms = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUserSymptoms(page, limit);
      setUserSymptoms(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSymptoms();
  }, [page]);

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Gejala yang Dialami User</h2>
        <p className="text-sm text-slate-500">Monitoring rekam medis input gejala yang dipilih oleh pengguna (Read-Only).</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6 w-16">ID</th>
              <th className="p-4">Gejala</th>
              <th className="p-4">Tingkat Keyakinan (CF User)</th>
              <th className="p-4">Prediction ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {userSymptoms.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-400">Tidak ada data gejala user.</td>
              </tr>
            ) : (
              userSymptoms.map((us) => (
                <tr key={us.id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6 font-medium text-slate-500">#{us.id}</td>
                  <td className="p-4 font-semibold text-slate-900">{us.symptom?.name || `Gejala #${us.symptom_id}`}</td>
                  <td className="p-4 text-slate-600 font-medium">{us.cf}</td>
                  <td className="p-4 text-emerald-600 font-semibold">#{us.prediction_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Menampilkan {userSymptoms.length} dari {totalItems} data
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

export default UserSymptomList;
