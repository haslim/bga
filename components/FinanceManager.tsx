
import React from 'react';
import { useData } from '../DataContext';
import { TrendingUp, TrendingDown, Wallet, Download } from 'lucide-react';

export const FinanceManager: React.FC = () => {
  const { finance } = useData();
  
  const totalIncome = finance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Finans & Kasa</h1>
        <p className="text-slate-500 mt-1">Gelir, gider ve nakit akışı yönetimi</p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">Toplam Gelir</h3>
            <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalIncome.toLocaleString('tr-TR')} ₺</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">Toplam Gider</h3>
            <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalExpense.toLocaleString('tr-TR')} ₺</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Net Kasa</h3>
            <div className="p-2 bg-slate-700 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{balance.toLocaleString('tr-TR')} ₺</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Son Hareketler</h3>
            <button className="flex items-center space-x-2 text-sm text-slate-500 hover:text-blue-600">
                <Download className="w-4 h-4" />
                <span>Excel İndir</span>
            </button>
        </div>
        <table className="w-full text-left">
            <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tür</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Açıklama</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Tutar</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {finance.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {record.type === 'income' ? 'Tahsilat' : 'Ödeme'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">{record.category}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                            {record.description}
                            {record.caseReference && <span className="block text-xs text-slate-400 mt-0.5">{record.caseReference}</span>}
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString('tr-TR')} ₺
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
