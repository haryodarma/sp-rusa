import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { predictionService } from '../../api/predictionService';
import { authService } from '../../api/authService';
import useAuthStore from '../../store/useAuthStore';
import { Loader2, FileText, ChevronRight } from 'lucide-react';

const RiwayatPrediksi = () => {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const currentUser = await authService.getCurrentUser(user.email);
        if (currentUser) {
          const data = await predictionService.getPredictionsByUser(currentUser.id, 1, 100);
          setPredictions(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user.email]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Diagnosis</h1>
        <p className="text-slate-600 mt-1">Daftar riwayat prediksi penyakit yang pernah Anda lakukan.</p>
      </div>

      {predictions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum Ada Riwayat</h3>
          <p className="text-slate-500 mt-2 max-w-sm mb-6">
            Anda belum pernah melakukan diagnosis penyakit rusa. Mulai diagnosis pertama Anda sekarang.
          </p>
          <Link to="/prediksi" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
            Mulai Diagnosis
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Jenis Rusa</th>
                  <th className="p-4">Hasil Penyakit</th>
                  <th className="p-4">Tingkat Keyakinan</th>
                  <th className="p-4 text-right pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 font-medium text-slate-900">#{item.id}</td>
                    <td className="p-4 text-slate-600">{item.deer?.name || '-'}</td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900">
                        {item.disease?.name || 'Tidak dapat disimpulkan'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${(item.cf || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {((item.cf || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        to={`/prediksi/hasil/${item.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Detail <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatPrediksi;
