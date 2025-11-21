
import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext';
import { TrendingUp, TrendingDown, Wallet, Download, Search, Filter, Calendar, X, RefreshCw } from 'lucide-react';

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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Finans & Kasa</h1>
        <p className="text-slate-500 mt-1">Gelir, gider ve nakit akışı yönetimi</p>
      </header>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">
                {hasActiveFilters ? 'Filtrelenen Gelir' : 'Toplam Gelir'}
            </h3>
            <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalIncome.toLocaleString('tr-TR')} ₺</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">
                {hasActiveFilters ? 'Filtrelenen Gider' : 'Toplam Gider'}
            </h3>
            <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalExpense.toLocaleString('tr-TR')} ₺</p>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow text-white ${balance >= 0 ? 'bg-slate-800 border-slate-700' : 'bg-red-900 border-red-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-300">
                {hasActiveFilters ? 'Filtrelenen Bakiye' : 'Net Kasa'}
            </h3>
            <div className="p-2 bg-white/10 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold">{balance.toLocaleString('tr-TR')} ₺</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arama</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Açıklama, kategori veya dosya no..."
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">İşlem Türü</label>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select 
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white appearance-none cursor-pointer"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <option value="ALL">Tümü</option>
                        <option value="income">Tahsilat (Gelir)</option>
                        <option value="expense">Ödeme (Gider)</option>
                    </select>
                </div>
            </div>

            {/* Date Range Start */}
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Başlangıç</label>
                <div className="relative">
                    <input 
                        type="date" 
                        className="w-full pl-3 pr-2 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-600"
                        value={dateRange.start}
                        onChange={e => setDateRange({...dateRange, start: e.target.value})}
                    />
                </div>
            </div>

            {/* Date Range End */}
             <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bitiş</label>
                <div className="relative">
                    <input 
                        type="date" 
                        className="w-full pl-3 pr-2 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-600"
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
                    className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center transition ${
                        hasActiveFilters 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${hasActiveFilters ? 'animate-spin-once' : ''}`} /> 
                    Temizle
                </button>
            </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">Hareket Dökümü</h3>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {filteredRecords.length} Kayıt
                </span>
            </div>
            <button className="flex items-center space-x-2 text-sm text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">
                <Download className="w-4 h-4" />
                <span>Excel İndir</span>
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tarih</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tür</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Kategori</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Açıklama</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Tutar</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-2 text-slate-400" />
                                    {record.date}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                    record.type === 'income' 
                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                    : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    {record.type === 'income' ? 'Tahsilat' : 'Ödeme'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-800 font-medium">{record.category}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                                {record.description}
                                {record.caseReference && (
                                    <span className="inline-flex ml-2 items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs border border-slate-200">
                                        Dosya: {record.caseReference}
                                    </span>
                                )}
                            </td>
                            <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString('tr-TR')} ₺
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                        <Search className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="font-medium text-slate-500">Kriterlere uygun kayıt bulunamadı.</p>
                                    <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">Filtreleri Temizle</button>
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
