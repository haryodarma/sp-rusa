import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictionService } from '../../api/predictionService';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/Button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const CF_OPTIONS = [
  { value: 1.0, label: 'Sangat Yakin / Pasti (1.0)' },
  { value: 0.8, label: 'Yakin (0.8)' },
  { value: 0.6, label: 'Cukup Yakin (0.6)' },
  { value: 0.4, label: 'Sedikit Yakin (0.4)' },
  { value: 0.2, label: 'Tidak Tahu (0.2)' }
];

const DashboardUser = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [deers, setDeers] = useState([]);
  
  const [selectedSymptoms, setSelectedSymptoms] = useState([]); // [{ symptom_id: id, cf: 0.8 }]
  const [selectedDeer, setSelectedDeer] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sympData, deerData] = await Promise.all([
          predictionService.getSymptoms(),
          predictionService.getDeers()
        ]);
        setSymptoms(sympData);
        setDeers(deerData);
        
        if (deerData.length > 0) {
          setSelectedDeer(deerData[0].id);
        }
      } catch (err) {
        setError('Gagal memuat data dari server. Silakan muat ulang halaman.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleSymptom = (id) => {
    setSelectedSymptoms(prev => {
      const exists = prev.find(s => s.symptom_id === id);
      if (exists) {
        return prev.filter(s => s.symptom_id !== id);
      } else {
        return [...prev, { symptom_id: id, cf: 0.8 }]; // Default Yakin
      }
    });
  };

  const handleCFChange = (id, cfValue, e) => {
    e.stopPropagation(); // prevent toggling the symptom checkbox
    setSelectedSymptoms(prev => prev.map(s => s.symptom_id === id ? { ...s, cf: parseFloat(cfValue) } : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      setError('Pilih setidaknya satu gejala untuk melakukan diagnosis.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const currentUser = await import('../../api/authService').then(m => m.authService.getCurrentUser(user.email));
      if (!currentUser) throw new Error("User tidak ditemukan di sistem.");

      const predictionPayload = {
        user_id: currentUser.id,
        deer_id: parseInt(selectedDeer),
        user_symptoms: selectedSymptoms
      };
      
      const response = await predictionService.createPrediction(predictionPayload);
      
      navigate(`/prediksi/hasil/${response.id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Terjadi kesalahan saat memproses prediksi. Pastikan server aktif.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Diagnosis Penyakit Baru</h1>
        <p className="text-slate-600 mt-1">Pilih jenis rusa dan gejala-gejala yang dialami.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 mb-6 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-sm font-semibold text-slate-900 mb-3">Pilih Spesies Rusa</label>
          <select 
            value={selectedDeer} 
            onChange={(e) => setSelectedDeer(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-shadow"
            required
          >
            <option value="" disabled>-- Pilih Rusa --</option>
            {deers.map(deer => (
              <option key={deer.id} value={deer.id}>{deer.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-end mb-4">
            <div>
              <label className="block text-base font-semibold text-slate-900">Pilih Gejala Klinis</label>
              <p className="text-sm text-slate-500 mt-1">Pilih semua gejala yang terlihat pada rusa beserta tingkat keyakinan Anda.</p>
            </div>
            <span className="text-sm font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
              {selectedSymptoms.length} Terpilih
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3 mt-6">
            {symptoms.map(symptom => {
              const selectedSymptom = selectedSymptoms.find(s => s.symptom_id === symptom.id);
              const isSelected = !!selectedSymptom;
              return (
                <div 
                  key={symptom.id}
                  onClick={() => handleToggleSymptom(symptom.id)}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected 
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-sm ${isSelected ? 'font-medium text-emerald-900' : 'text-slate-700'}`}>
                      {symptom.name}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="pl-8 md:pl-0" onClick={e => e.stopPropagation()}>
                      <select
                        value={selectedSymptom.cf}
                        onChange={(e) => handleCFChange(symptom.id, e.target.value, e)}
                        className="w-full md:w-48 px-3 py-2 text-sm bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      >
                        {CF_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} className="px-8 py-3 text-base">
            Proses Diagnosis
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DashboardUser;
