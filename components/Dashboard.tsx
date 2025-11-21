
import React from 'react';
import { useData } from '../DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, TrendingUp, AlertTriangle, Calendar, User, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { cases, tasks, finance } = useData();

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 1. BUGÜNKÜ DURUŞMALAR
  const todaysHearings = cases
    .filter(c => c.nextHearingDate === today)
    .map(c => ({
      caseNumber: c.caseNumber,
      title: c.title,
      time: c.hearings?.find(h => h.date.startsWith(today))?.date.split(' ')[1] || '09:00'
    }));

  // 2. GELECEK 7 GÜN KRİTİK SÜRELER (Duruşmalar + Görevler)
  const criticalDeadlines = [
    ...cases.filter(c => c.nextHearingDate && c.nextHearingDate > today && c.nextHearingDate <= sevenDaysLater).map(c => ({
      type: 'Duruşma',
      title: c.title,
      date: c.nextHearingDate,
      urgent: true
    })),
    ...tasks.filter(t => !t.completed && t.dueDate >= today && t.dueDate <= sevenDaysLater).map(t => ({
      type: 'Görev',
      title: t.title,
      date: t.dueDate,
      urgent: t.priority === 'Yüksek'
    }))
  ].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // 3. EN AKTİF MÜVEKKİLLER
  const clientCaseCounts: Record<string, number> = {};
  cases.forEach(c => {
    clientCaseCounts[c.clientName] = (clientCaseCounts[c.clientName] || 0) + 1;
  });
  const topClients = Object.entries(clientCaseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // 4. WORKFLOW TAMAMLANMA ORANLARI
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // 5. BU AY TAHSİLAT/MASRAF (Basit simülasyon)
  const financeData = [
    { name: 'Gelir', value: finance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0) },
    { name: 'Gider', value: finance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0) },
  ];

  // 6. AÇIK GÖREVLERİM
  const myOpenTasks = tasks.filter(t => t.assignedTo.includes('Burak') && !t.completed);

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen animate-in fade-in">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Yönetim Paneli</h1>
        <p className="text-slate-500 mt-1">Günlük iş akışı ve performans özetleri</p>
      </header>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Bugünkü Duruşma</p>
             <h3 className="text-2xl font-bold text-blue-600 mt-1">{todaysHearings.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Açık Görevler</p>
             <h3 className="text-2xl font-bold text-orange-600 mt-1">{myOpenTasks.length}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">İş Tamamlanma</p>
             <h3 className="text-2xl font-bold text-green-600 mt-1">%{completionRate}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
        </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Net Kasa (Tüm)</p>
             <h3 className="text-2xl font-bold text-slate-700 mt-1">
               {(financeData[0].value - financeData[1].value).toLocaleString('tr-TR')} ₺
             </h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: URGENT & TODAY */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. BUGÜNKÜ DURUŞMALAR */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-bold text-slate-800">Bugünkü Duruşmalar ({today})</h3>
                </div>
                <div className="p-4">
                    {todaysHearings.length > 0 ? (
                        <div className="space-y-3">
                            {todaysHearings.map((h, idx) => (
                                <div key={idx} className="flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="font-bold text-blue-800 text-lg mr-4 w-16 text-center bg-white rounded py-1 border border-blue-100 shadow-sm">
                                        {h.time}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{h.caseNumber}</p>
                                        <p className="text-sm text-slate-600 truncate">{h.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 italic text-center py-4">Bugün planlanmış duruşma yok.</p>
                    )}
                </div>
            </div>

            {/* 2. GELECEK 7 GÜN KRİTİK SÜRELER */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                        <h3 className="font-bold text-slate-800">Önümüzdeki 7 Gün Kritik Süreler</h3>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">
                        {criticalDeadlines.length} Kayıt
                    </span>
                </div>
                <div className="divide-y divide-slate-100">
                    {criticalDeadlines.map((item, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${item.urgent ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                                    <p className="text-xs text-slate-500">{item.type} • {item.urgent ? 'ACİL' : 'Normal'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-700">{item.date}</p>
                                <p className="text-xs text-slate-400">Tarihinde</p>
                            </div>
                        </div>
                    ))}
                    {criticalDeadlines.length === 0 && (
                         <p className="text-slate-500 italic text-center py-8">Yaklaşan kritik süre bulunmuyor.</p>
                    )}
                </div>
            </div>
            
            {/* 6. WORKFLOW TAMAMLANMA */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Workflow & Görev Tamamlanma
                </h3>
                <div className="flex items-center space-x-4">
                    <div className="w-1/3 h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-700">{completionRate}% Tamamlandı</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                     <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                        <span className="block text-2xl font-bold text-slate-800">{totalTasks}</span>
                        <span className="text-xs text-slate-500">Toplam Görev</span>
                     </div>
                     <div className="p-3 bg-green-50 rounded border border-green-100 text-center">
                        <span className="block text-2xl font-bold text-green-600">{completedTasks}</span>
                        <span className="text-xs text-green-600">Tamamlanan</span>
                     </div>
                     <div className="p-3 bg-orange-50 rounded border border-orange-100 text-center">
                        <span className="block text-2xl font-bold text-orange-600">{totalTasks - completedTasks}</span>
                        <span className="text-xs text-orange-600">Bekleyen</span>
                     </div>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN: STATS */}
        <div className="space-y-6">
            {/* 5. FİNANSAL GRAFİK */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Genel Finans Durumu
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={financeData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                        {financeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

             {/* 3. EN AKTİF MÜVEKKİLLER */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 bg-slate-50">
                     <h3 className="font-bold text-slate-800 flex items-center">
                        <User className="w-5 h-5 mr-2 text-indigo-600" />
                        En Aktif Müvekkiller
                     </h3>
                 </div>
                 <div className="divide-y divide-slate-50">
                    {topClients.map((client, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mr-3">
                                    {idx + 1}
                                </span>
                                <span className="text-sm font-medium text-slate-700">{client.name}</span>
                            </div>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                                {client.count} Dosya
                            </span>
                        </div>
                    ))}
                 </div>
            </div>

            {/* 6. AÇIK GÖREVLERİM ÖZET */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                 <h3 className="font-bold text-slate-800 mb-3 text-sm">Açık Görevlerim</h3>
                 <ul className="space-y-2">
                    {myOpenTasks.slice(0,4).map(t => (
                        <li key={t.id} className="flex items-start text-sm">
                             <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 shrink-0 ${t.priority === 'Yüksek' ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                             <span className="text-slate-600">{t.title}</span>
                        </li>
                    ))}
                    {myOpenTasks.length === 0 && <li className="text-xs text-slate-400">Bekleyen görev yok.</li>}
                 </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
