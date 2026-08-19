import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../../api/adminService';
import { Loader2, ArrowLeft, ClipboardList, Info, HelpCircle } from 'lucide-react';

const PredictionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [traceLogs, setTraceLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'trace'

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load prediction detail
        const pData = await adminService.getPredictionById(id);
        setPrediction(pData);

        // Load reference data to rebuild the CF-DS calculation trace
        const [diseases, symptoms, rules] = await Promise.all([
          adminService.getDiseases(),
          adminService.getSymptoms(),
          adminService.getRules()
        ]);

        const diseaseMap = {};
        for (const d of diseases) diseaseMap[d.id] = d;

        const symptomMap = {};
        for (const s of symptoms) symptomMap[s.id] = s;

        // Run client-side trace calculation for visualization
        generateTraceLogs(pData, diseaseMap, symptomMap, rules);
      } catch (error) {
        console.error("Error loading prediction detail", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const setKeString = (himpunan) => {
    if (himpunan === 'theta') return 'Theta (Θ)';
    return '{' + Array.from(himpunan).join(', ') + '}';
  };

  const generateTraceLogs = (pred, diseaseMap, symptomMap, rules) => {
    const logs = [];
    const userSymptoms = pred.user_symptoms || [];

    if (userSymptoms.length === 0) return;

    const daftarBpa = [];

    // --- Langkah 1: BPA per Gejala ---
    for (const us of userSymptoms) {
      const symptomId = us.symptom_id;
      const cfUser = us.cf;
      const symptomName = symptomMap[symptomId]?.name || `Gejala #${symptomId}`;

      // Cari relasi pakar untuk gejala ini
      const relasiGejala = rules.filter(r => r.symptom_id === symptomId);
      
      const bpaLog = {
        type: 'bpa',
        symptomId,
        symptomName,
        cfUser,
        details: []
      };

      if (relasiGejala.length > 0) {
        const focalSetList = [];
        const cfAkhirList = [];

        for (const r of relasiGejala) {
          const diseaseId = r.disease_id;
          const diseaseName = diseaseMap[diseaseId]?.name || `Penyakit #${diseaseId}`;
          const mb = r.mb;
          const md = r.md;
          const cfPakar = mb - md;
          const cfAkhir = cfPakar * cfUser;

          bpaLog.details.push({
            diseaseId,
            diseaseName,
            mb,
            md,
            cfPakar,
            cfAkhir
          });

          focalSetList.push(diseaseId);
          cfAkhirList.append ? cfAkhirList.append(cfAkhir) : cfAkhirList.push(cfAkhir);
        }

        const totalCf = cfAkhirList.reduce((acc, curr) => acc + curr, 0);
        const massFocal = totalCf / cfAkhirList.length;
        const massTheta = 1.0 - massFocal;
        const focalSet = new Set(focalSetList);

        const bpaMap = {
          focal: { set: focalSet, mass: massFocal },
          theta: { mass: massTheta }
        };

        bpaLog.bpa = bpaMap;
        daftarBpa.push(bpaMap);
        logs.push(bpaLog);
      }
    }

    // --- Langkah 2: Dempster-Shafer Combination ---
    if (daftarBpa.length > 0) {
      let bpaGabungan = daftarBpa[0];

      for (let i = 1; i < daftarBpa.length; i++) {
        const m1 = bpaGabungan;
        const m2 = daftarBpa[i];

        const combineLog = {
          type: 'combine',
          labelM1: i === 1 ? 'M1' : `M1..${i}`,
          labelM2: `M${i+1}`,
          combinations: [],
          conflictK: 0.0,
          pembagi: 1.0,
          result: []
        };

        const hasilSementara = [];
        
        // Helper function to find intersection
        const getIntersection = (set1, set2) => {
          if (!set1) return null; // means theta
          if (!set2) return null; // means theta
          return new Set([...set1].filter(x => set2.has(x)));
        };

        // Combine m1 and m2
        const itemsM1 = [
          { set: m1.focal?.set, mass: m1.focal?.mass, name: m1.focal ? setKeString(m1.focal.set) : null },
          { set: null, mass: m1.theta.mass, name: 'Theta' }
        ].filter(x => x.mass !== undefined);

        const itemsM2 = [
          { set: m2.focal?.set, mass: m2.focal?.mass, name: m2.focal ? setKeString(m2.focal.set) : null },
          { set: null, mass: m2.theta.mass, name: 'Theta' }
        ].filter(x => x.mass !== undefined);

        for (const item1 of itemsM1) {
          for (const item2 of itemsM2) {
            const perkalian = item1.mass * item2.mass;
            let irisan = null;
            let isConflict = false;

            if (item1.set === null && item2.set === null) {
              irisan = null; // theta
            } else if (item1.set === null) {
              irisan = item2.set;
            } else if (item2.set === null) {
              irisan = item1.set;
            } else {
              irisan = getIntersection(item1.set, item2.set);
              if (irisan.size === 0) {
                isConflict = true;
              }
            }

            const strIrisan = isConflict ? '∅' : (irisan ? setKeString(irisan) : 'Theta');

            combineLog.combinations.push({
              f1: item1.name,
              f2: item2.name,
              m1: item1.mass,
              m2: item2.mass,
              perkalian,
              irisan: strIrisan,
              isConflict
            });

            if (isConflict) {
              combineLog.conflictK += perkalian;
            } else {
              // Add to temporary result
              const key = irisan ? Array.from(irisan).sort().join(',') : 'theta';
              const existing = hasilSementara.find(x => x.key === key);
              if (existing) {
                existing.mass += perkalian;
              } else {
                hasilSementara.push({ key, set: irisan, mass: perkalian });
              }
            }
          }
        }

        const pembagi = 1.0 - combineLog.conflictK;
        combineLog.pembagi = pembagi;

        const combinedResult = {};
        for (const hs of hasilSementara) {
          const massBaru = pembagi === 0 ? hs.mass : hs.mass / pembagi;
          if (hs.set) {
            combinedResult.focal = { set: hs.set, mass: massBaru };
            combineLog.result.push({ name: setKeString(hs.set), mass: massBaru });
          } else {
            combinedResult.theta = { mass: massBaru };
            combineLog.result.push({ name: 'Theta', mass: massBaru });
          }
        }

        bpaGabungan = combinedResult;
        logs.push(combineLog);
      }
    }

    setTraceLogs(logs);
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>;
  if (!prediction) return <div className="text-center p-10 text-slate-500">Data diagnosis tidak ditemukan.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/predictions')}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Detail Hasil Diagnosis #{prediction.id}</h2>
          <p className="text-sm text-slate-500">Trace log perhitungan hybrid Certainty Factor - Dempster Shafer.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'info' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Informasi Diagnosis
        </button>
        <button
          onClick={() => setActiveTab('trace')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'trace' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Trace Kalkulasi Matematika
        </button>
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Diagnosis Result Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                Hasil Diagnosis Utama
              </div>
              {prediction.disease ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Penyakit Terdeteksi</h4>
                    <p className="text-2xl font-black text-slate-900 mt-1">{prediction.disease.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Nilai Keyakinan (Mass)</h4>
                      <p className="text-xl font-bold text-emerald-600 mt-1">{(prediction.cf * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Nama Rusa</h4>
                      <p className="text-xl font-semibold text-slate-800 mt-1">{prediction.deer?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Solusi / Penanganan</h4>
                    <p className="text-slate-700 text-sm leading-relaxed mt-2 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                      {prediction.disease.handling || 'Belum ada panduan penanganan.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-xl">
                  Gejala tidak mengarah secara signifikan ke penyakit tertentu.
                </div>
              )}
            </div>

            {/* Selected Symptoms Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
                <Info className="w-5 h-5 text-emerald-600" />
                Gejala yang Dipilih
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="p-3 pl-4">ID Gejala</th>
                      <th className="p-3">Nama Gejala</th>
                      <th className="p-3 text-right pr-4">CF Pilihan User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prediction.user_symptoms.map((us, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="p-3 pl-4 text-slate-400">#{us.symptom_id}</td>
                        <td className="p-3 font-semibold text-slate-800">
                          {/* Nama Gejala jika ada */}
                          {us.symptom?.name || `Gejala #${us.symptom_id}`}
                        </td>
                        <td className="p-3 text-right pr-4 text-slate-600 font-medium">{us.cf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                Informasi Penguji
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400 block">Nama User</span>
                  <span className="font-semibold text-slate-800">{prediction.user?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800">{prediction.user?.email || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Role</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 border border-slate-100 text-slate-600 capitalize">
                    {prediction.user?.role || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Trace */}
      {activeTab === 'trace' && (
        <div className="space-y-8 max-w-4xl">
          {traceLogs.map((log, idx) => {
            if (log.type === 'bpa') {
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">1</span>
                      BPA Gejala: {log.symptomName}
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-semibold">CF User: {log.cfUser}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border border-slate-100">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="p-3">Penyakit</th>
                            <th className="p-3">MB</th>
                            <th className="p-3">MD</th>
                            <th className="p-3">CF Pakar (MB - MD)</th>
                            <th className="p-3 text-right">CF Akhir (CF Pakar × CF User)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {log.details.map((detail, dIdx) => (
                            <tr key={dIdx}>
                              <td className="p-3 font-semibold text-slate-800">{detail.diseaseName}</td>
                              <td className="p-3 text-slate-600">{detail.mb}</td>
                              <td className="p-3 text-slate-600">{detail.md}</td>
                              <td className="p-3 text-slate-600">{detail.cfPakar.toFixed(2)}</td>
                              <td className="p-3 text-right text-emerald-600 font-bold">{detail.cfAkhir.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {log.bpa && (
                      <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm border border-slate-100">
                        <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">Hasil BPA (Mass Function):</p>
                        <div className="flex gap-6">
                          <p><span className="font-semibold text-slate-800">m(Focal Set):</span> {log.bpa.focal.mass.toFixed(4)}</p>
                          <p><span className="font-semibold text-slate-800">m(Theta):</span> {log.bpa.theta.mass.toFixed(4)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (log.type === 'combine') {
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
                      Kombinasi Dempster-Shafer: {log.labelM1} ⊕ {log.labelM2}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Combinations List */}
                    <div className="space-y-3">
                      <p className="font-bold text-xs uppercase tracking-wider text-slate-400">Proses Perkalian Irisan</p>
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                        {log.combinations.map((c, cIdx) => (
                          <div key={cIdx} className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                            c.isConflict ? 'bg-red-50/50 border-red-100 text-red-800' : 'bg-slate-50/50 border-slate-100 text-slate-700'
                          }`}>
                            <div className="flex justify-between font-semibold mb-1">
                              <span>{c.f1} × {c.f2}</span>
                              <span className={c.isConflict ? 'text-red-600' : 'text-slate-600'}>
                                {c.isConflict ? 'Conflict (∅)' : 'Valid'}
                              </span>
                            </div>
                            <p>{c.m1.toFixed(4)} × {c.m2.toFixed(4)} = <span className="font-bold">{c.perkalian.toFixed(4)}</span></p>
                            <p className="mt-1 text-slate-400">Irisan: {c.irisan}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conflict & Normalization Summary */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-4 flex flex-col justify-center">
                      <div>
                        <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Total Conflict (K)</span>
                        <span className="text-xl font-bold text-red-600">{log.conflictK.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Pembagi (1 - K)</span>
                        <span className="text-xl font-bold text-slate-800">{log.pembagi.toFixed(4)}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider mb-2">Nilai Mass Setelah Normalisasi</span>
                        <div className="space-y-1.5 text-xs font-semibold">
                          {log.result.map((res, rIdx) => (
                            <div key={rIdx} className="flex justify-between bg-white px-3 py-2 rounded-lg border border-slate-100">
                              <span className="text-slate-700">{res.name}</span>
                              <span className="text-emerald-600">{res.mass.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default PredictionDetail;
