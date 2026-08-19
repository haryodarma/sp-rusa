import React, { useState, useEffect } from 'react';
import { adminService } from '../../../api/adminService';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

const PenyakitList = () => {
  const [diseases, setDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', handling: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDiseases = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDiseases();
      setDiseases(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const handleOpenForm = (disease = null) => {
    if (disease) {
      setFormData({ id: disease.id, name: disease.name, handling: disease.handling });
    } else {
      setFormData({ id: null, name: '', handling: '' });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await adminService.updateDisease(formData.id, { name: formData.name, handling: formData.handling });
      } else {
        await adminService.createDisease({ name: formData.name, handling: formData.handling });
      }
      setShowForm(false);
      fetchDiseases();
    } catch (error) {
      alert('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus penyakit ini? Aturan CF terkait mungkin akan error.')) {
      try {
        await adminService.deleteDisease(id);
        fetchDiseases();
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
          <h2 className="text-xl font-bold text-slate-900">Kelola Penyakit</h2>
          <p className="text-sm text-slate-500">Daftar penyakit rusa beserta saran penanganan.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Penyakit
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">{formData.id ? 'Edit Penyakit' : 'Tambah Penyakit Baru'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Penyakit"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Saran Penanganan</label>
              <textarea
                value={formData.handling}
                onChange={e => setFormData({...formData, handling: e.target.value})}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 w-full min-h-[100px]"
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" isLoading={isSubmitting}>Simpan</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6 w-16">ID</th>
              <th className="p-4 w-1/3">Nama Penyakit</th>
              <th className="p-4">Penanganan</th>
              <th className="p-4 text-right pr-6 w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {diseases.map((disease) => (
              <tr key={disease.id} className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-medium text-slate-500">#{disease.id}</td>
                <td className="p-4 font-bold text-slate-900">{disease.name}</td>
                <td className="p-4 text-slate-600 text-sm truncate max-w-[300px]" title={disease.handling}>
                  {disease.handling}
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenForm(disease)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(disease.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
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

export default PenyakitList;
