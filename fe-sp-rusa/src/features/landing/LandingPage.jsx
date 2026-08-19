import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, ChevronRight, Stethoscope } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 pt-24 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-700 font-semibold text-sm mb-6 shadow-sm border border-emerald-200/50">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Akurasi Tinggi Berbasis Kepakaran
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Diagnosis Penyakit Rusa <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Lebih Cepat & Akurat
            </span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Sistem pakar berbasis kecerdasan buatan untuk mengidentifikasi penyakit pada rusa peliharaan atau ternak Anda, didukung oleh metode perhitungan Certainty Factor dari ahli veteriner.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-95"
            >
              Mulai Diagnosis
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-white text-slate-700 px-8 py-3.5 rounded-xl font-semibold text-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Fitur & Cara Kerja */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bagaimana CervoCare Bekerja?</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Proses diagnosis dirancang sesederhana mungkin bagi pengguna tanpa menghilangkan akurasi medis kepakaran.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group bg-slate-50 rounded-2xl p-8 hover:bg-emerald-50 transition-colors border border-slate-100 hover:border-emerald-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                <Activity className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Pilih Gejala</h3>
              <p className="text-slate-600 leading-relaxed">
                Anda hanya perlu memasukkan atau memilih gejala-gejala klinis yang terlihat pada rusa yang sakit melalui antarmuka yang intuitif.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative group bg-slate-50 rounded-2xl p-8 hover:bg-emerald-50 transition-colors border border-slate-100 hover:border-emerald-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Analisis Sistem</h3>
              <p className="text-slate-600 leading-relaxed">
                Sistem kami akan memproses gejala menggunakan metode <span className="font-semibold text-emerald-700">Certainty Factor</span>, membandingkannya dengan basis pengetahuan dari pakar kedokteran hewan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative group bg-slate-50 rounded-2xl p-8 hover:bg-emerald-50 transition-colors border border-slate-100 hover:border-emerald-100">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                <Stethoscope className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Hasil Diagnosis</h3>
              <p className="text-slate-600 leading-relaxed">
                Dapatkan hasil prediksi penyakit beserta persentase tingkat keyakinan (akurasi) dan saran penanganan pertama secara instan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-600/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-6">Siap Menjaga Kesehatan Rusa Anda?</h2>
          <p className="text-slate-300 mb-10 text-lg">
            Bergabunglah sekarang dan manfaatkan sistem pakar kami untuk deteksi dini penyakit pada rusa.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
          >
            Daftar Gratis Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
