import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { authService } from '../../api/authService';
import useAuthStore from '../../store/useAuthStore';
import { Stethoscope } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      if (response && response.data && response.data.access_token) {
        // Simpan token ke store & localStorage
        login(response.data.access_token);
        
        // Cek role untuk redirect. (Ambil role dari store setelah login, atau dari jwtDecode inline)
        // Karena state update di Zustand itu synchronous (tanpa middleware async di sini), kita bisa akses:
        const user = useAuthStore.getState().user;
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/prediksi');
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Email atau password salah.');
      } else if (err.response?.data?.detail) {
        // Validation errors
        if (Array.isArray(err.response.data.detail)) {
            setError(err.response.data.detail[0].msg);
        } else {
            setError(err.response.data.detail);
        }
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex bg-emerald-100 p-3 rounded-xl mb-4">
            <Stethoscope className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Selamat Datang Kembali</h2>
          <p className="text-slate-500 mt-2">Masuk untuk melanjutkan ke CervoCare</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contoh@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Masuk
          </Button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-8">
          Belum punya akun?{' '}
          <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
