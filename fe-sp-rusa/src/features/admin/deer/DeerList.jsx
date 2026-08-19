import React, { useState, useEffect } from 'react';
import { adminService } from '../../../api/adminService';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

const DeerList = () => {
  const [deers, setDeers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDeers();
      setDeers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeers();
  }, []);

  const handleOpenForm = (deer = null) => {
    if (deer) {
      setFormData({ id: deer.id, name: deer.name });
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
        await adminService.updateDeer(formData.id, { name: formData.name });
      } else {
        await adminService.createDeer({ name: formData.name });
      }
      setShowForm(false);
      fetchDeers();
    } catch (error) {
      alert('Gagal menyimpan data rusa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data rusa ini?')) {
      try {
        await adminService.deleteDeer(id);
        fetchDeers();
      } catch (error) {
        alert('Gagal menghapus data rusa');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Data Rusa</h2>
          <p className="text-sm text-slate-500">Daftar rusa yang didaftarkan ke sistem CervoCare.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Rusa
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">{formData.id ? 'Edit Data Rusa' : 'Tambah Rusa Baru'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Nama/Tag Rusa"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Rusa Timur-A12"
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
              <th className="p-4">Nama/Tag Rusa</th>
              <th className="p-4 text-right pr-6 w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deers.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-400">Tidak ada data rusa.</td>
              </tr>
            ) : (
              deers.map((deer) => (
                <tr key={deer.id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6 font-medium text-slate-500">#{deer.id}</td>
                  <td className="p-4 font-semibold text-slate-900">{deer.name}</td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenForm(deer)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(deer.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeerList;
