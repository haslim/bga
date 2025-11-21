
import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { UserRole } from '../types';
import { Settings, Save, Image as ImageIcon, AlertCircle, Shield } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { siteSettings, updateSiteSettings, currentUser } = useData();
  
  const [formData, setFormData] = useState({
    title: siteSettings.title,
    subtitle: siteSettings.subtitle,
    logoUrl: siteSettings.logoUrl || ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Sync with global state if it changes externally (though less likely here)
  useEffect(() => {
    setFormData({
        title: siteSettings.title,
        subtitle: siteSettings.subtitle,
        logoUrl: siteSettings.logoUrl || ''
    });
  }, [siteSettings]);

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
        <div className="p-8 flex flex-col items-center justify-center h-screen text-slate-500">
            <Shield className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold">Erişim Reddedildi</h2>
            <p>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
        </div>
    );
  }

  const handleSave = () => {
    updateSiteSettings({
        title: formData.title,
        subtitle: formData.subtitle,
        logoUrl: formData.logoUrl
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Sistem Ayarları</h1>
        <p className="text-slate-500 mt-1">Site kimliği ve genel yapılandırma</p>
      </header>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-slate-600" />
                <h3 className="font-bold text-slate-700">Site Kimliği</h3>
            </div>
            
            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Site Başlığı</label>
                    <input 
                        type="text" 
                        className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="Örn: BGAofis"
                    />
                    <p className="text-xs text-slate-400 mt-1">Tarayıcı sekmesinde ve giriş ekranında görünür.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Site Alt Başlığı / Slogan</label>
                    <input 
                        type="text" 
                        className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.subtitle}
                        onChange={e => setFormData({...formData, subtitle: e.target.value})}
                        placeholder="Örn: Hukuk Otomasyonu"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Logo URL</label>
                    <div className="flex gap-4 items-start">
                         <div className="flex-1">
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={formData.logoUrl}
                                    onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                                    placeholder="https://ornek.com/logo.png"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Logonuzun doğrudan resim bağlantısını (URL) yapıştırın. Boş bırakılırsa varsayılan ikon kullanılır.</p>
                         </div>
                         <div className="w-16 h-16 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                             {formData.logoUrl ? (
                                 <img src={formData.logoUrl} alt="Logo Önizleme" className="w-full h-full object-contain" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                             ) : (
                                 <span className="text-xs text-slate-400 text-center">Logo Yok</span>
                             )}
                         </div>
                    </div>
                </div>

                {showSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center text-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Ayarlar başarıyla kaydedildi ve güncellendi.
                    </div>
                )}

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                    onClick={handleSave} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition transform active:scale-95"
                >
                    <Save className="w-4 h-4 mr-2" /> Kaydet ve Uygula
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};