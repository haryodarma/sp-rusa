import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const GuestLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                  <Stethoscope className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="font-bold text-xl text-slate-800 tracking-tight">CervoCare</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow active:scale-95"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} CervoCare. Sistem Pakar Prediksi Penyakit Rusa.</p>
        </div>
      </footer>
    </div>
  );
};

export default GuestLayout;
