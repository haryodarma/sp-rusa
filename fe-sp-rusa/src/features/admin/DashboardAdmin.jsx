import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { Loader2, Activity, Database, GitMerge } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardAdmin = () => {
  const [stats, setStats] = useState({ diseases: 0, symptoms: 0, rules: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dData, sData, rData] = await Promise.all([
          adminService.getDiseases(),
          adminService.getSymptoms(),
          adminService.getRules()
        ]);
        setStats({
          diseases: dData.length,
          symptoms: sData.length,
          rules: rData.length
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>;
  }

  const statCards = [
    { name: 'Total Penyakit', value: stats.diseases, icon: Database, color: 'bg-blue-500', link: '/admin/penyakit' },
    { name: 'Total Gejala', value: stats.symptoms, icon: Activity, color: 'bg-emerald-500', link: '/admin/gejala' },
    { name: 'Total Rule CF', value: stats.rules, icon: GitMerge, color: 'bg-purple-500', link: '/admin/rule' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Ikhtisar Sistem</h2>
        <p className="text-slate-500 mt-1">Ringkasan data master sistem pakar CervoCare.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} to={stat.link} className="block group">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group-hover:border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-800">{stat.value}</span>
                </div>
                <h3 className="text-slate-600 font-medium group-hover:text-emerald-700 transition-colors">{stat.name}</h3>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 bg-emerald-50 border border-emerald-100 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Selamat Datang di Admin Panel</h3>
        <p className="text-emerald-700 max-w-2xl leading-relaxed">
          Gunakan menu di sidebar untuk mengelola basis pengetahuan (knowledge base) sistem pakar.
          Perubahan pada Gejala, Penyakit, dan Rule akan langsung berdampak pada hasil diagnosis yang dilakukan pengguna.
        </p>
      </div>
    </div>
  );
};

export default DashboardAdmin;
