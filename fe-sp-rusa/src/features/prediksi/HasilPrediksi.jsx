import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const HasilPrediksi = () => {
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await axiosInstance.get(`/api/predictions/${id}`);
        setPrediction(response.data.data);
      } catch (err) {
        setError('Gagal memuat hasil prediksi. Data mungkin tidak ditemukan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrediction();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl flex flex-col items-center text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Terjadi Kesalahan</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <Link to="/prediksi" className="text-emerald-600 font-semibold hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const cfPercentage = prediction.cf ? (prediction.cf * 100).toFixed(2) : 0;
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/prediksi" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center text-center border-b border-slate-100 pb-8 mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Hasil Diagnosis</h1>
          <p className="text-slate-500">ID Prediksi: #{prediction.id}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Penyakit Terdeteksi</h3>
            <div className="text-2xl font-bold text-slate-900 mb-4">
              {prediction.disease ? prediction.disease.name : 'Tidak dapat disimpulkan'}
            </div>
            
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tingkat Keyakinan (CF)</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-emerald-600">{cfPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full" 
                style={{ width: `${cfPercentage}%` }}
              ></div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Saran Penanganan</h3>
            <div className="prose prose-emerald prose-sm text-slate-600">
              {prediction.disease && prediction.disease.handling ? (
                <p>{prediction.disease.handling}</p>
              ) : (
                <p className="italic">Tidak ada saran penanganan spesifik yang tersedia untuk hasil ini.</p>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">Gejala yang Dipilih</h3>
            <ul className="space-y-2">
              {prediction.user_symptoms && prediction.user_symptoms.length > 0 ? (
                prediction.user_symptoms.map(us => (
                  <li key={us.id} className="flex gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500">•</span>
                    {us.symptom ? us.symptom.name : `Gejala ID ${us.symptom_id}`}
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic text-sm">Tidak ada gejala yang tercatat</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HasilPrediksi;
