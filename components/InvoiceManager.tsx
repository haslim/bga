import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Invoice, InvoiceItem } from '../types';
import { Plus, FileText, Download, Trash2, Calculator, X, CheckCircle, Briefcase, Calendar } from 'lucide-react';

export const InvoiceManager: React.FC = () => {
  const { invoices, addInvoice, clients } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([{ description: 'Avukatlık Danışmanlık Hizmeti', amount: 0 }]);
  const [vatRate, setVatRate] = useState(20);
  const [stopajRate, setStopajRate] = useState(20);

  // Calculations
  const subTotal = items.reduce((acc, item) => acc + item.amount, 0);
  const stopajAmount = (subTotal * stopajRate) / 100;
  const vatAmount = (subTotal * vatRate) / 100;
  const totalAmount = subTotal + vatAmount - stopajAmount; // Net ele geçen (Basitleştirilmiş SMM mantığı: Genelde Tahsil edilen = Brüt + KDV, ama Stopaj kaynakta kesilir)
  // SMM Logic:
  // Brüt: 1000
  // Stopaj (%20): 200
  // Net: 800
  // KDV (%20): 200 (Brüt üzerinden)
  // Tahsil Edilen: 1000 + 200 - 200 = 1000 (Eğer stopajı karşı taraf yatırıyorsa)
  // Makbuz Toplamı Genelde: Brüt + KDV'dir.
  
  // Let's use standard display:
  // Toplam Hizmet Bedeli (Brüt): X
  // KDV: Y
  // Tevkifat (Stopaj): Z
  // Genel Toplam (KDV Dahil): X + Y
  const grandTotal = subTotal + vatAmount;

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = () => {
    if (!clientName || subTotal <= 0) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `SMM-2023/${invoices.length + 101}`,
      clientName,
      date: invoiceDate,
      dueDate: invoiceDate, // Simplified
      items,
      subTotal,
      vatRate,
      vatAmount,
      stopajRate,
      stopajAmount,
      totalAmount: grandTotal,
      status: 'Bekliyor'
    };

    addInvoice(newInvoice);
    setIsModalOpen(false);
    // Reset form
    setClientName('');
    setItems([{ description: 'Avukatlık Danışmanlık Hizmeti', amount: 0 }]);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in">
      
      {/* Create Invoice Modal - Redesigned */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
               <div>
                   <h2 className="text-xl font-bold text-slate-800 flex items-center">
                     <FileText className="w-6 h-6 mr-3 text-blue-600" />
                     Yeni Serbest Meslek Makbuzu
                   </h2>
                   <p className="text-sm text-slate-500 mt-1 ml-9">Hizmet bedellerini hesaplayın ve makbuz oluşturun.</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Scrollable Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {/* Top Info Section */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Müvekkil Seçiniz</label>
                      <div className="relative">
                         <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                         <select 
                            className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition text-slate-900"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                          >
                            <option value="">Seçiniz...</option>
                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Makbuz Tarihi</label>
                      <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input 
                            type="date" 
                            className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-slate-900"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                          />
                      </div>
                    </div>
                  </div>
              </div>

              {/* Items Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-700">HİZMET KALEMLERİ</h3>
                  <button onClick={handleAddItem} className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition flex items-center">
                      <Plus className="w-3 h-3 mr-1" /> Satır Ekle
                  </button>
                </div>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Açıklama</th>
                                <th className="px-4 py-3 w-40 text-right">Tutar (TL)</th>
                                <th className="px-4 py-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3">
                                    <input 
                                        type="text" 
                                        placeholder="Hizmet açıklaması giriniz..."
                                        className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                      />
                                </td>
                                <td className="p-3">
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        className="w-full border border-slate-300 rounded p-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white text-slate-900"
                                        value={item.amount}
                                        onChange={(e) => handleItemChange(idx, 'amount', Number(e.target.value))}
                                      />
                                </td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleRemoveItem(idx)} className="text-slate-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                </td>
                            </tr>
                          ))}
                        </tbody>
                    </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="flex justify-end">
                 <div className="w-full md:w-1/2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                     <div className="grid grid-cols-2 gap-6 mb-4 border-b border-slate-200 pb-4">
                        <div>
                           <label className="block text-xs font-medium text-slate-500 mb-1">KDV Oranı</label>
                           <select className="w-full border p-1.5 rounded text-sm bg-white text-slate-900" value={vatRate} onChange={e => setVatRate(Number(e.target.value))}>
                             <option value="0">%0</option>
                             <option value="10">%10</option>
                             <option value="20">%20</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-500 mb-1">Stopaj Oranı</label>
                           <select className="w-full border p-1.5 rounded text-sm bg-white text-slate-900" value={stopajRate} onChange={e => setStopajRate(Number(e.target.value))}>
                             <option value="0">%0</option>
                             <option value="20">%20</option>
                           </select>
                        </div>
                     </div>
                     
                    <div className="space-y-3 text-sm">
                       <div className="flex justify-between text-slate-600">
                         <span>Ara Toplam (Brüt):</span>
                         <span className="font-medium">{subTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺</span>
                       </div>
                       <div className="flex justify-between text-slate-600">
                         <span>Stopaj Kesintisi (-):</span>
                         <span className="text-red-500 font-medium">({stopajAmount.toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺)</span>
                       </div>
                       <div className="flex justify-between text-slate-600">
                         <span>KDV Tutarı (+):</span>
                         <span className="text-green-600 font-medium">{vatAmount.toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺</span>
                       </div>
                       <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                         <span className="font-bold text-lg text-slate-800">Genel Toplam:</span>
                         <span className="font-bold text-xl text-blue-700">{grandTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺</span>
                       </div>
                       <div className="text-right text-xs text-slate-400 italic mt-1">
                         (Net Ele Geçen Tutar: {(subTotal - stopajAmount + vatAmount).toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺)
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-medium transition">İptal</button>
               <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center font-medium transform active:scale-95">
                 <Calculator className="w-4 h-4 mr-2" /> Makbuzu Onayla
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Faturalar & Makbuzlar</h1>
          <p className="text-slate-500 mt-1">Serbest Meslek Makbuzu (e-SMM) yönetimi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Makbuz Kes
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Makbuz No</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tarih</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Müvekkil</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tutar (KDV Dahil)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Durum</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length > 0 ? invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/80 transition cursor-pointer group">
                <td className="px-6 py-4 font-medium text-slate-800 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    {inv.invoiceNumber}
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">{inv.date}</td>
                <td className="px-6 py-4 text-slate-700 font-medium">{inv.clientName}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{inv.totalAmount.toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold 
                    ${inv.status === 'Ödendi' ? 'bg-green-100 text-green-700 border border-green-200' : 
                      inv.status === 'Bekliyor' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="text-slate-400 hover:text-blue-600 transition p-2 hover:bg-slate-100 rounded-full">
                     <Download className="w-5 h-5" />
                   </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400">
                     <div className="flex flex-col items-center">
                        <Calculator className="w-12 h-12 text-slate-300 mb-3" />
                        <p>Henüz kesilmiş makbuz bulunmamaktadır.</p>
                     </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};