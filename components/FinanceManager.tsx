
import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext';
import { TrendingUp, TrendingDown, Wallet, Download, Search, Filter, Calendar, X, RefreshCw, ArrowUpRight, ArrowDownLeft, PieChart } from 'lucide-react';

export const FinanceManager: React.FC = () => {
  const { finance } = useData();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'income' | 'expense'>('ALL');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Derived Data: Apply filters
  const filteredRecords = useMemo(() => {
    return finance.filter(record => {
      // 1. Search Term (Description, Category, or Case Ref)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        record.description.toLowerCase().includes(searchLower) ||
        record.category.toLowerCase().includes(searchLower) ||
        (record.caseReference && record.caseReference.toLowerCase().includes(searchLower));

      // 2. Type Filter
      const matchesType = filterType === 'ALL' || record.type === filterType;

      // 3. Date Range
      const matchesStart = !dateRange.start || record.date >= dateRange.start;
      const matchesEnd = !dateRange.end || record.date <= dateRange.end;

      return matchesSearch && matchesType && matchesStart && matchesEnd;
    });
  }, [finance, searchTerm, filterType, dateRange]);

  // Calculate Totals based on FILTERED data (Dynamic Dashboard)
  const totalIncome = filteredRecords.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = filteredRecords.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = searchTerm !== '' || filterType !== 'ALL' || dateRange.start !== '' || dateRange.end !== '';

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Finans & Kasa</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gelir, gider ve nakit akışı yönetimi</p>
      </header>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
           <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-green-50 dark:from-green-900/20 to-transparent opacity-50"></div>
           <div className="flex items-center justify-between relative z-10 mb-4">
             <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
               <TrendingUp className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
               {hasActiveFilters ? 'Filtrelenen' : 'Toplam'}
             </span>
           </div>
           <div className="relative z-10">
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Gelirler (Tahsilat)</p>
             <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{totalIncome.toLocaleString('tr-TR')} ₺</h3>
           </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
           <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-red-50 dark:from-red-900/20 to-transparent opacity-50"></div>
           <div className="flex items-center justify-between relative z-10 mb-4">
             <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
               <TrendingDown className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg">
               {hasActiveFilters ? 'Filtrelenen' : 'Toplam'}
             </span>
           </div>
           <div className="relative z-10">
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Giderler (Ödeme)</p>
             <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{totalExpense.toLocaleString('tr-TR')} ₺</h3>
           </div>
        </div>

        {/* Balance Card */}
        <div className={`p-6 rounded-2xl shadow-lg relative overflow-hidden text-white transition-all duration-300 ${
            balance >= 0 ? 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-900' : 'bg-gradient-to-br from-red-900 to-red-800'
        }`}>
           <div className="absolute right-0 top-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="flex items-center justify-between relative z-10 mb-4">
             <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
               <Wallet className="w-6 h-6 text-white" />
             </div>
             {balance < 0 && (
                 <span className="text-xs font-bold uppercase tracking-wider text-white bg-red-500/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                   Dikkat: Eksi Bakiye
                 </span>
             )}
           </div>
           <div className="relative z-10">
             <p className="text-slate-300 text-sm font-medium mb-1">Net Kasa Bakiyesi</p>
             <h3 className="text-3xl font-bold tracking-tight">{balance.toLocaleString('tr-TR')} ₺</h3>
           </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Arama</label>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Açıklama, kategori veya dosya no..."
                        className="w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-700 dark:text-white transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 bg-slate-200 dark:bg-slate-600 rounded-full hover:bg-slate-300 dark:hover:bg-slate-500 transition">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">İşlem Türü</label>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <select 
                        className="w-full pl-9 pr-8 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-700 dark:text-white appearance-none cursor-pointer font-medium transition-all"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <option value="ALL">Tümü</option>
                        <option value="income">Tahsilat (Gelir)</option>
                        <option value="expense">Ödeme (Gider)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Date Range Start */}
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Başlangıç</label>
                <div className="relative">
                    <input 
                        type="date" 
                        className="w-full pl-3 pr-2 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-600 dark:text-white font-medium transition-all"
                        value={dateRange.start}
                        onChange={e => setDateRange({...dateRange, start: e.target.value})}
                    />
                </div>
            </div>

            {/* Date Range End */}
             <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Bitiş</label>
                <div className="relative">
                    <input 
                        type="date" 
                        className="w-full pl-3 pr-2 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-600 dark:text-white font-medium transition-all"
                        value={dateRange.end}
                        onChange={e => setDateRange({...dateRange, end: e.target.value})}
                    />
                </div>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-2">
                <button 
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                        hasActiveFilters 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900 shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${hasActiveFilters ? 'group-hover:animate-spin' : ''}`} /> 
                    Temizle
                </button>
            </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                     <PieChart className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Hareket Dökümü</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Son işlemler ve detaylar</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">
                    {filteredRecords.length} Kayıt
                </span>
                <button className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-xl transition font-medium">
                    <Download className="w-4 h-4" />
                    <span>Excel</span>
                </button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">Tür</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tarih & Kategori</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Açıklama</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Tutar</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                                    record.type === 'income' 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                }`}>
                                    {record.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 dark:text-white text-sm">{record.category}</span>
                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(record.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{record.description}</span>
                                    {record.caseReference && (
                                        <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] border border-slate-200 dark:border-slate-600 w-fit font-medium">
                                            Dosya: {record.caseReference}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                <span className={`text-lg font-bold tracking-tight ${record.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString('tr-TR')} ₺
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-slate-800 dark:text-white font-bold text-lg">Kayıt Bulunamadı</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">Arama kriterlerinize uygun finansal işlem bulunmamaktadır.</p>
                                    <button onClick={clearFilters} className="mt-4 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition">
                                        Filtreleri Temizle
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
