
import React from 'react';
import { useData } from '../DataContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CheckCircle, TrendingUp, AlertTriangle, Calendar, User, Activity, DollarSign, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { ViewState } from '../types';

interface DashboardProps {
  onChangeView: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const { cases, tasks, finance, knowledgeBase, setTaskFilter } = useData();

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

  // 2. GELECEK 7 GÜN KRİTİK SÜRELER (Including Legal Deadlines now)
  const upcomingHearings = cases.filter(c => c.nextHearingDate && c.nextHearingDate > today && c.nextHearingDate <= sevenDaysLater).map(c => ({
      type: 'Duruşma',
      title: c.title,
      date: c.nextHearingDate,
      urgent: true,
      color: 'text-orange-600'
  }));

  const upcomingTasks = tasks.filter(t => !t.completed && t.dueDate >= today && t.dueDate <= sevenDaysLater).map(t => ({
      type: 'Görev',
      title: t.title,
      date: t.dueDate,
      urgent: t.priority === 'Yüksek',
      color: t.priority === 'Yüksek' ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'
  }));

  const upcomingLegalDeadlines = cases.flatMap(c => (c.deadlines || [])
      .filter(d => !d.isCompleted && d.dueDate >= today && d.dueDate <= sevenDaysLater)
      .map(d => ({
          type: 'Yasal Süre',
          title: `${c.caseNumber} - ${d.title}`,
          date: d.dueDate,
          urgent: true,
          color: 'text-red-700 font-bold'
      }))
  );

  const criticalDeadlines = [
    ...upcomingLegalDeadlines,
    ...upcomingHearings,
    ...upcomingTasks
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
  
  // 5. GELİŞMİŞ FİNANSAL TREND ANALİZİ (Son 6 Ay)
  const getTrendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d);
    }

    return months.map(date => {
      const monthKey = date.toLocaleString('default', { month: 'short' }); // 'Eki', 'Kas' vs.
      const yearMonth = date.toISOString().slice(0, 7); // 2023-10
      
      // Filter records belonging to this month
      const monthRecords = finance.filter(f => f.date.startsWith(yearMonth));
      
      const income = monthRecords.filter(f => f.type === 'income').reduce((sum, r) => sum + r.amount, 0);
      const expense = monthRecords.filter(f => f.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

      return {
        name: monthKey,
        Gelir: income,
        Gider: expense
      };
    });
  };

  const trendData = getTrendData();
  const currentMonthIncome = trendData[trendData.length - 1].Gelir;
  const currentMonthExpense = trendData[trendData.length - 1].Gider;
  const netBalance = finance.filter(f => f.type === 'income').reduce((a,b) => a + b.amount, 0) - finance.filter(f => f.type === 'expense').reduce((a,b) => a + b.amount, 0);

  // 6. AÇIK GÖREVLERİM
  const myOpenTasks = tasks.filter(t => t.assignedTo.includes('Burak') && !t.completed);

  // 7. SON BİLGİ BANKASI KAYITLARI
  const latestKnowledge = knowledgeBase.slice(0, 3);

  // Helper: Handle navigation with task filter
  const handleTaskFilterClick = (filter: 'ALL' | 'COMPLETED' | 'PENDING') => {
      setTaskFilter(filter);
      onChangeView('tasks');
  };

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
          <p className="text-sm text-green-600 font-medium">
            Gelir: {payload[0].value.toLocaleString('tr-TR')} ₺
          </p>
          <p className="text-sm text-red-600 font-medium">
            Gider: {payload[1].value.toLocaleString('tr-TR')} ₺
          </p>
          <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
             <p className="text-xs text-slate-500 dark:text-slate-400">Net: {(payload[0].value - payload[1].value).toLocaleString('tr-TR')} ₺</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-slate-950 min-h-screen animate-in fade-in">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Yönetim Paneli</h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">Günlük iş akışı ve performans özetleri</p>
      </header>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
            onClick={() => onChangeView('cases')}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 hover:border-brand-200 group active:scale-95"
        >
          <div>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide group-hover:text-brand-600 transition-colors">Bugünkü Duruşma</p>
             <h3 className="text-2xl font-bold text-brand-600 mt-1">{todaysHearings.length}</h3>
          </div>
          <div className="p-3 bg-brand-50 dark:bg-brand-900/30 text-brand-600 rounded-lg group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div 
            onClick={() => onChangeView('tasks')}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 hover:border-orange-200 group active:scale-95"
        >
          <div>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide group-hover:text-orange-600 transition-colors">Açık Görevler</p>
             <h3 className="text-2xl font-bold text-orange-600 mt-1">{myOpenTasks.length}</h3>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div 
            onClick={() => onChangeView('tasks')}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 hover:border-green-200 group active:scale-95"
        >
          <div>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide group-hover:text-green-600 transition-colors">İş Tamamlanma</p>
             <h3 className="text-2xl font-bold text-green-600 mt-1">%{completionRate}</h3>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
            <Activity className="w-6 h-6" />
          </div>
        </div>

         <div 
            onClick={() => onChangeView('finance')}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 hover:border-slate-300 group active:scale-95"
        >
          <div>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Toplam Net Kasa</p>
             <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-1">
               {netBalance.toLocaleString('tr-TR')} ₺
             </h3>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: URGENT & TODAY */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* 1. BUGÜNKÜ DURUŞMALAR */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <Calendar className="w-5 h-5 text-brand-600 mr-2" />
                    <h3 className="font-bold text-slate-800 dark:text-white">Bugünkü Duruşmalar ({today})</h3>
                </div>
                <div className="p-4">
                    {todaysHearings.length > 0 ? (
                        <div className="space-y-3">
                            {todaysHearings.map((h, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => onChangeView('cases')}
                                    className="flex items-center p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-lg cursor-pointer hover:bg-brand-100 dark:hover:bg-brand-900/40 transition group"
                                >
                                    <div className="font-bold text-brand-800 dark:text-brand-300 text-lg mr-4 w-16 text-center bg-white dark:bg-slate-800 rounded py-1 border border-brand-100 dark:border-brand-700 shadow-sm">
                                        {h.time}
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{h.caseNumber}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{h.title}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic text-center py-4">Bugün planlanmış duruşma yok.</p>
                    )}
                </div>
            </div>

            {/* 2. GELECEK 7 GÜN KRİTİK SÜRELER */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2 animate-pulse" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">Kritik Süreler ve Ajanda (7 Gün)</h3>
                    </div>
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full font-bold whitespace-nowrap">
                        {criticalDeadlines.length} Kayıt
                    </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {criticalDeadlines.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => onChangeView(item.type === 'Görev' ? 'tasks' : 'cases')}
                            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition group"
                        >
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${item.type === 'Yasal Süre' ? 'bg-red-600 animate-pulse' : item.urgent ? 'bg-orange-500' : 'bg-blue-400'}`}></div>
                                <div className="overflow-hidden">
                                    <p className={`text-sm font-bold truncate ${item.color || 'text-slate-800 dark:text-slate-200'}`}>{item.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                                        {item.type === 'Yasal Süre' && <Clock className="w-3 h-3 mr-1 text-red-500" />}
                                        {item.type} • {item.urgent ? 'ACİL' : 'Normal'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right ml-2 shrink-0">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.date}</p>
                                <p className="text-xs text-slate-400">Son Tarih</p>
                            </div>
                        </div>
                    ))}
                    {criticalDeadlines.length === 0 && (
                         <p className="text-slate-500 dark:text-slate-400 italic text-center py-8">Yaklaşan kritik süre bulunmuyor.</p>
                    )}
                </div>
            </div>
            
            {/* 6. WORKFLOW TAMAMLANMA */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Workflow & Görev Tamamlanma
                </h3>
                <div className="flex items-center space-x-4">
                    <div className="w-1/3 h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm md:text-base">{completionRate}% Tamamlandı</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 md:gap-4">
                     <div 
                        onClick={() => handleTaskFilterClick('ALL')}
                        className="p-2 md:p-3 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-600 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                     >
                        <span className="block text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{totalTasks}</span>
                        <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Toplam Görev</span>
                     </div>
                     <div 
                        onClick={() => handleTaskFilterClick('COMPLETED')}
                        className="p-2 md:p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-900 text-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition"
                     >
                        <span className="block text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</span>
                        <span className="text-[10px] md:text-xs text-green-600 dark:text-green-400">Tamamlanan</span>
                     </div>
                     <div 
                        onClick={() => handleTaskFilterClick('PENDING')}
                        className="p-2 md:p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-100 dark:border-orange-900 text-center cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition"
                     >
                        <span className="block text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{totalTasks - completedTasks}</span>
                        <span className="text-[10px] md:text-xs text-orange-600 dark:text-orange-400">Bekleyen</span>
                     </div>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN: STATS */}
        <div className="space-y-6">
            {/* 5. FİNANSAL GRAFİK (YENİ - AREA CHART) */}
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-[350px] md:h-[400px] flex flex-col">
                <div className="mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center text-sm md:text-base">
                        <TrendingUp className="w-5 h-5 mr-2 text-brand-600" />
                        Finansal Trend
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Son 6 Ay</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-slate-400">Bu Ay</p>
                     <div className="flex flex-col items-end">
                       <span className="text-xs font-bold text-green-600">+{currentMonthIncome.toLocaleString('tr-TR')}</span>
                       <span className="text-xs font-bold text-red-500">-{currentMonthExpense.toLocaleString('tr-TR')}</span>
                     </div>
                  </div>
                </div>

                <div className="flex-1 w-full h-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />
                      <Area type="monotone" dataKey="Gelir" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 6 }} />
                      <Area type="monotone" dataKey="Gider" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>

             {/* 3. EN AKTİF MÜVEKKİLLER */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                     <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                        <User className="w-5 h-5 mr-2 text-brand-600" />
                        En Aktif Müvekkiller
                     </h3>
                 </div>
                 <div className="divide-y divide-slate-50 dark:divide-slate-700">
                    {topClients.map((client, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => onChangeView('clients')}
                            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition group"
                        >
                            <div className="flex items-center overflow-hidden">
                                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold mr-3 shrink-0 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                    {idx + 1}
                                </span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{client.name}</span>
                            </div>
                            <span className="text-xs font-bold bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-1 rounded-full shrink-0">
                                {client.count} Dosya
                            </span>
                        </div>
                    ))}
                 </div>
            </div>
            
            {/* 7. BİLGİ BANKASI ÖZET (YENİ) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                     <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                        Son Eklenen İçerikler
                     </h3>
                 </div>
                 <div className="divide-y divide-slate-50 dark:divide-slate-700">
                    {latestKnowledge.length > 0 ? latestKnowledge.map((k) => (
                        <div 
                            key={k.id} 
                            onClick={() => onChangeView('knowledge')}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${
                                     k.category === 'İçtihat' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800' : 
                                     'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                }`}>
                                    {k.category}
                                </span>
                                <span className="text-[10px] text-slate-400">{k.createdAt}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{k.title}</p>
                                <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    )) : (
                        <p className="text-xs text-slate-400 italic text-center py-4">İçerik bulunmuyor.</p>
                    )}
                 </div>
            </div>

            {/* 6. AÇIK GÖREVLERİM ÖZET */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                 <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-sm">Açık Görevlerim</h3>
                 <ul className="space-y-2">
                    {myOpenTasks.slice(0,4).map(t => (
                        <li 
                            key={t.id} 
                            onClick={() => onChangeView('tasks')}
                            className="flex items-start text-sm p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer transition group"
                        >
                             <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 shrink-0 ${t.priority === 'Yüksek' ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                             <span className="text-slate-600 dark:text-slate-300 line-clamp-1 flex-1">{t.title}</span>
                             <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
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
