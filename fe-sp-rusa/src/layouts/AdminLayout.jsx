import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Stethoscope, LogOut, LayoutDashboard, Database, Activity, GitMerge, Users, Notebook, ClipboardList, History } from 'lucide-react';

const AdminLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Gejala', path: '/admin/gejala', icon: Activity },
    { name: 'Penyakit', path: '/admin/penyakit', icon: Database },
    { name: 'Aturan Pakar', path: '/admin/rule', icon: GitMerge },
    { name: 'Kelola User', path: '/admin/users', icon: Users },
    { name: 'Kelola Rusa', path: '/admin/deers', icon: Notebook },
    { name: 'Gejala User', path: '/admin/user-symptoms', icon: ClipboardList },
    { name: 'Riwayat Prediksi', path: '/admin/predictions', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 bg-slate-950/50">
          <div className="flex items-center gap-2 text-white">
            <Stethoscope className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-xl tracking-tight">AdminPanel</span>
          </div>
        </div>

        <div className="p-4 mb-4 border-b border-slate-800">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Signed in as</p>
          <p className="text-sm font-medium text-white truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content (Offset by sidebar width) */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center px-8 z-10 sticky top-0">
          <h1 className="text-lg font-semibold text-slate-800 capitalize">
            {location.pathname.split('/').pop() === 'admin' ? 'Dashboard' : location.pathname.split('/').pop().replace('-', ' ')}
          </h1>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
