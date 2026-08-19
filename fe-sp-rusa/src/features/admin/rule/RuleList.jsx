import React, { useState, useEffect } from 'react';
import { adminService } from '../../../api/adminService';
import Button from '../../../components/Button';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

const MB_MD_OPTIONS = [
  { value: 1.0, label: 'Sangat Pasti / Pasti (1.0)' },
  { value: 0.8, label: 'Hampir Pasti (0.8)' },
  { value: 0.6, label: 'Kemungkinan Besar (0.6)' },
  { value: 0.4, label: 'Mungkin (0.4)' },
  { value: 0.2, label: 'Kurang Yakin (0.2)' },
  { value: 0.0, label: 'Tidak Tahu / Tidak Berkaitan (0.0)' },
];

const RuleList = () => {
  const [rules, setRules] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, disease_id: '', symptom_id: '', mb: 0.8, md: 0.0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rData, dData, sData] = await Promise.all([
        adminService.getRules(),
        adminService.getDiseases(),
        adminService.getSymptoms()
      ]);
      setRules(rData);
      setDiseases(dData);
      setSymptoms(sData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenForm = (rule = null) => {
    if (rule) {
      setFormData({ 
        id: rule.id, 
        disease_id: rule.disease_id, 
        symptom_id: rule.symptom_id, 
        mb: rule.mb, 
        md: rule.md 
      });
    } else {
      setFormData({ id: null, disease_id: '', symptom_id: '', mb: 0.8, md: 0.0 });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        disease_id: parseInt(formData.disease_id),
        symptom_id: parseInt(formData.symptom_id),
        mb: parseFloat(formData.mb),
        md: parseFloat(formData.md)
      };

      if (formData.id) {
        await adminService.updateRule(formData.id, payload);
      } else {
        await adminService.createRule(payload);
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus aturan pakar ini?')) {
      try {
        await adminService.deleteRule(id);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };

  // Helper untuk get nama dari ID
  const getDiseaseName = (id) => diseases.find(d => d.id === id)?.name || id;
  const getSymptomName = (id) => symptoms.find(s => s.id === id)?.name || id;

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Aturan Pakar (Rule CF)</h2>
          <p className="text-sm text-slate-500">Kelola relasi penyakit, gejala, dan nilai Certainty Factor.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Aturan
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">{formData.id ? 'Edit Aturan' : 'Tambah Aturan Baru'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Penyakit</label>
                <select 
                  value={formData.disease_id}
                  onChange={e => setFormData({...formData, disease_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  required
                >
                  <option value="" disabled>-- Pilih Penyakit --</option>
                  {diseases.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gejala</label>
                <select 
                  value={formData.symptom_id}
                  onChange={e => setFormData({...formData, symptom_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  required
                >
                  <option value="" disabled>-- Pilih Gejala --</option>
                  {symptoms.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Measure of Belief (MB)</label>
                <select 
                  value={formData.mb}
                  onChange={e => setFormData({...formData, mb: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  required
                >
                  {MB_MD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Seberapa yakin gejala ini menunjukkan penyakit.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Measure of Disbelief (MD)</label>
                <select 
                  value={formData.md}
                  onChange={e => setFormData({...formData, md: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  required
                >
                  {MB_MD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Seberapa yakin ketidakhadiran gejala ini menggugurkan penyakit.</p>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl flex items-center justify-between border border-emerald-100">
              <div>
                <p className="text-sm text-emerald-800 font-medium">Kalkulasi CF Pakar (MB - MD)</p>
                <p className="text-xs text-emerald-600">Nilai akhir certainty factor untuk aturan ini</p>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {(formData.mb - formData.md).toFixed(2)}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" isLoading={isSubmitting}>Simpan Aturan</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6">Penyakit</th>
              <th className="p-4">Gejala</th>
              <th className="p-4 text-center">MB</th>
              <th className="p-4 text-center">MD</th>
              <th className="p-4 text-center font-bold text-emerald-700">CF Pakar</th>
              <th className="p-4 text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((rule) => {
              const cf = (rule.mb - rule.md).toFixed(2);
              return (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6 font-medium text-slate-900">{getDiseaseName(rule.disease_id)}</td>
                  <td className="p-4 text-slate-600">{getSymptomName(rule.symptom_id)}</td>
                  <td className="p-4 text-center text-slate-500">{rule.mb.toFixed(1)}</td>
                  <td className="p-4 text-center text-slate-500">{rule.md.toFixed(1)}</td>
                  <td className="p-4 text-center font-bold text-emerald-600">{cf}</td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenForm(rule)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(rule.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RuleList;
