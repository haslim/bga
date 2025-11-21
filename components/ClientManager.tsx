
import React from 'react';
import { useData } from '../DataContext';
import { Client } from '../types';
import { Mail, Phone, MoreHorizontal, User as UserIcon, Building } from 'lucide-react';

interface ClientManagerProps {
  clients?: Client[]; // Optional now since we use context
}

export const ClientManager: React.FC<ClientManagerProps> = () => {
  const { clients } = useData();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Müvekkiller</h1>
          <p className="text-slate-500 mt-1">Müvekkil listesi ve cari hesap özetleri</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Yeni Müvekkil Ekle
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${client.type === 'Kurumsal' ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'}`}>
                  {client.type === 'Kurumsal' ? <Building className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{client.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{client.type}</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-slate-600">
                <Phone className="w-4 h-4 mr-3 text-slate-400" />
                {client.phone}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Mail className="w-4 h-4 mr-3 text-slate-400" />
                {client.email}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-400">Cari Bakiye</p>
                    <p className={`font-bold ${client.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {client.balance.toLocaleString('tr-TR')} ₺
                    </p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:underline">
                    Detaylar
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
