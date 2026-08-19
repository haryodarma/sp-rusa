import React, { useState, useEffect } from 'react';
import { adminService } from '../../../api/adminService';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

const GejalaList = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSymptoms = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSymptoms();
      setSymptoms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const handleOpenForm = (symptom = null) => {
    if (symptom) {
      setFormData({ id: symptom.id, name: symptom.name });
    } else {
      setFormData({ id: null, name: '' });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await adminService.updateSymptom(formData.id, { name: formData.name });
      } else {
        await adminService.createSymptom({ name: formData.name });
      }
      setShowForm(false);
      fetchSymptoms();
    } catch (error) {
      alert('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus gejala ini?')) {
      try {
        await adminService.deleteSymptom(id);
        fetchSymptoms();
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Gejala</h2>
          <p className="text-sm text-slate-500">Daftar gejala klinis penyakit rusa.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Gejala
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">{formData.id ? 'Edit Gejala' : 'Tambah Gejala Baru'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Nama Gejala"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Suhu tubuh tinggi"
                required
              />
            </div>
            <Button type="submit" isLoading={isSubmitting}>Simpan</Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6 w-16">ID</th>
              <th className="p-4">Nama Gejala</th>
              <th className="p-4 text-right pr-6 w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {symptoms.map((symptom) => (
              <tr key={symptom.id} className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-medium text-slate-500">#{symptom.id}</td>
                <td className="p-4 font-medium text-slate-900">{symptom.name}</td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenForm(symptom)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(symptom.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GejalaList;
