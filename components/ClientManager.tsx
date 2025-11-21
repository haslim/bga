
import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Client } from '../types';
import { Mail, Phone, MoreHorizontal, User as UserIcon, Building, Plus, Search, Filter, MapPin, Tag, X, Save, CreditCard, FileText } from 'lucide-react';
import { validateTaxNumber } from '../utils';

export const ClientManager: React.FC = () => {
  const { clients, addClient, updateClient, cases, finance } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
      name: '', type: 'Bireysel', phone: '', email: '', address: '', taxNumber: '', tags: [], status: 'Aktif', balance: 0
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredClients = clients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || c.type === filterType;
      return matchesSearch && matchesType;
  });

  const handleOpenModal = (client?: Client) => {
      if (client) {
          setFormData({ ...client });
          setSelectedClient(client);
      } else {
          setFormData({ name: '', type: 'Bireysel', phone: '', email: '', address: '', taxNumber: '', tags: [], status: 'Aktif', balance: 0 });
          setSelectedClient(null);
      }
      setIsModalOpen(true);
      setErrors({});
  };

  const handleSave = () => {
      // Validation
      const newErrors: Record<string, string> = {};
      if (!formData.name) newErrors.name = 'İsim zorunludur';
      if (!formData.email) newErrors.email = 'E-posta zorunludur';
      if (formData.taxNumber && !validateTaxNumber(formData.taxNumber)) newErrors.taxNumber = 'Geçersiz TCKN/VKN (10 veya 11 hane olmalı)';
      
      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
      }

      if (selectedClient) {
          updateClient({ ...selectedClient, ...formData } as Client);
      } else {
          const newClient: Client = {
              id: `cl-${Date.now()}`,
              ...formData as Client,
              balance: 0
          };
          addClient(newClient);
      }
      setIsModalOpen(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newTag.trim()) {
          e.preventDefault();
          if (!formData.tags?.includes(newTag.trim())) {
              setFormData({ ...formData, tags: [...(formData.tags || []), newTag.trim()] });
          }
          setNewTag('');
      }
  };

  const removeTag = (tagToRemove: string) => {
      setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  // Derived Data for Detail View
  const clientCases = selectedClient ? cases.filter(c => c.clientName === selectedClient.name) : [];
  // Simple finance logic: records where description contains client name
  const clientTransactions = selectedClient ? finance.filter(f => f.description.includes(selectedClient.name)) : [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in">
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">{selectedClient ? 'Müvekkil Düzenle' : 'Yeni Müvekkil Ekle'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Müvekkil Tipi</label>
                            <div className="flex space-x-2">
                                <button 
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${formData.type === 'Bireysel' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                    onClick={() => setFormData({...formData, type: 'Bireysel'})}
                                >Bireysel</button>
                                <button 
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${formData.type === 'Kurumsal' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                    onClick={() => setFormData({...formData, type: 'Kurumsal'})}
                                >Kurumsal</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Durum</label>
                            <select 
                                className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="Aktif">Aktif</option>
                                <option value="Pasif">Pasif</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">İsim / Ünvan *</label>
                        <input 
                            type="text" 
                            className={`w-full border bg-white text-slate-900 rounded-lg p-2.5 text-sm outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">TCKN / VKN</label>
                            <input 
                                type="text" 
                                className={`w-full border bg-white text-slate-900 rounded-lg p-2.5 text-sm outline-none focus:ring-2 ${errors.taxNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                                value={formData.taxNumber}
                                onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                                placeholder="11 veya 10 haneli"
                            />
                            {errors.taxNumber && <p className="text-xs text-red-500 mt-1">{errors.taxNumber}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vergi Dairesi</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.taxOffice}
                                onChange={(e) => setFormData({...formData, taxOffice: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefon</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta *</label>
                            <input 
                                type="email" 
                                className={`w-full border bg-white text-slate-900 rounded-lg p-2.5 text-sm outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                             {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adres</label>
                        <textarea 
                            className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Etiketler</label>
                        <div className="border border-slate-300 rounded-lg p-2 flex flex-wrap gap-2 bg-white">
                            {formData.tags?.map((tag, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium flex items-center">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-800"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input 
                                type="text" 
                                className="flex-1 min-w-[100px] outline-none text-sm p-1 bg-white text-slate-900"
                                placeholder="Etiket ekle (Enter)..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium">İptal</button>
                    <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Kaydet
                    </button>
                </div>
            </div>
          </div>
      )}
      
      {/* Detail View Modal */}
      {isDetailOpen && selectedClient && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedClient.type === 'Kurumsal' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                                {selectedClient.type}
                            </span>
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedClient.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                {selectedClient.status}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">{selectedClient.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedClient.tags?.map((tag, i) => (
                                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center border border-slate-200">
                                    <Tag className="w-3 h-3 mr-1" /> {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">İletişim & Kimlik</h4>
                        <div className="flex items-center text-sm text-slate-600">
                            <Phone className="w-4 h-4 mr-3 text-slate-400" /> {selectedClient.phone}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                            <Mail className="w-4 h-4 mr-3 text-slate-400" /> {selectedClient.email}
                        </div>
                        <div className="flex items-start text-sm text-slate-600">
                            <MapPin className="w-4 h-4 mr-3 text-slate-400 mt-0.5" /> {selectedClient.address || '-'}
                        </div>
                         <div className="flex items-start text-sm text-slate-600">
                            <CreditCard className="w-4 h-4 mr-3 text-slate-400 mt-0.5" /> 
                            <div>
                                <p>VKN/TCKN: {selectedClient.taxNumber || '-'}</p>
                                {selectedClient.taxOffice && <p className="text-xs text-slate-400">{selectedClient.taxOffice} VD.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 flex justify-between">
                            Dosyalar
                            <span className="text-slate-800">{clientCases.length}</span>
                        </h4>
                        {clientCases.length > 0 ? (
                            <ul className="space-y-2">
                                {clientCases.map(c => (
                                    <li key={c.id} className="text-sm p-2 bg-slate-50 rounded border border-slate-100 group hover:border-blue-200 transition">
                                        <div className="font-medium text-slate-800 flex items-center">
                                            <FileText className="w-3 h-3 mr-2 text-slate-400" />
                                            {c.caseNumber}
                                        </div>
                                        <div className="text-slate-500 text-xs truncate pl-5">{c.title}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-400 italic">Kayıtlı dosya yok.</p>}
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 flex justify-between">
                            Finans Özeti
                            <span className={`${selectedClient.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>{selectedClient.balance} ₺</span>
                        </h4>
                        {clientTransactions.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                                {clientTransactions.slice(0,5).map(f => (
                                    <li key={f.id} className="flex justify-between text-xs p-1 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-600 truncate w-2/3">{f.description}</span>
                                        <span className={f.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                            {f.type === 'income' ? '+' : '-'}{f.amount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-400 italic">Finansal hareket yok.</p>}
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                    <button 
                        onClick={() => { setIsDetailOpen(false); handleOpenModal(selectedClient); }}
                        className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-100"
                    >
                        Düzenle
                    </button>
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        Dosya Aç
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Main List View */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Müvekkil Yönetimi</h1>
          <p className="text-slate-500 mt-1">CRM ve iletişim kayıtları</p>
        </div>
        <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center shadow-lg shadow-blue-600/20"
        >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Müvekkil
        </button>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 bg-slate-50/50">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="İsim, e-posta veya telefon ara..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select 
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="ALL">Tüm Tipler</option>
                    <option value="Bireysel">Bireysel</option>
                    <option value="Kurumsal">Kurumsal</option>
                </select>
            </div>
        </div>
        
        {/* Grid for Clients */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map(client => {
            const caseCount = cases.filter(c => c.clientName === client.name).length;
            return (
            <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${client.type === 'Kurumsal' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                        {client.type === 'Kurumsal' ? <Building className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{client.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase font-bold tracking-wide">{client.type}</span>
                                {client.tags?.slice(0,2).map((t,i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 border border-slate-200 text-slate-500 rounded">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setSelectedClient(client); setIsDetailOpen(true); }}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-2 mb-5 pl-1">
                    <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-4 h-4 mr-3 text-slate-400" />
                        {client.phone || '-'}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <Mail className="w-4 h-4 mr-3 text-slate-400" />
                        {client.email}
                    </div>
                    {client.address && (
                        <div className="flex items-center text-sm text-slate-600 truncate">
                             <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                             <span className="truncate">{client.address}</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex gap-5">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Dosya</p>
                            <p className="font-bold text-slate-700">{caseCount}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Bakiye</p>
                            <p className={`font-bold ${client.balance < 0 ? 'text-red-600' : client.balance > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                                {client.balance.toLocaleString('tr-TR')} ₺
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setSelectedClient(client); setIsDetailOpen(true); }}
                        className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                        Profili Görüntüle
                    </button>
                </div>
            </div>
            )})}
        </div>
      </div>
    </div>
  );
};
