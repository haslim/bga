
import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { UserRole, DeadlineTemplate } from '../types';
import { THEME_COLORS } from '../constants';
import { Settings, Save, Image as ImageIcon, AlertCircle, Shield, Palette, CheckCircle, Users, Clock, Trash2, Plus } from 'lucide-react';
import { UserManager } from './UserManager';

export const SettingsManager: React.FC = () => {
  const { siteSettings, updateSiteSettings, currentUser, updateUserTheme, deadlineTemplates, addDeadlineTemplate, deleteDeadlineTemplate } = useData();
  
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'deadlines'>('general');

  const [formData, setFormData] = useState({
    title: siteSettings.title,
    subtitle: siteSettings.subtitle,
    logoUrl: siteSettings.logoUrl || ''
  });

  // Deadline form state
  const [newDeadlineName, setNewDeadlineName] = useState('');
  const [newDeadlineDays, setNewDeadlineDays] = useState(7);

  const [selectedTheme, setSelectedTheme] = useState(currentUser?.theme || 'blue');
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync with global state if it changes externally
  useEffect(() => {
    setFormData({
        title: siteSettings.title,
        subtitle: siteSettings.subtitle,
        logoUrl: siteSettings.logoUrl || ''
    });
  }, [siteSettings]);

  useEffect(() => {
      if(currentUser?.theme) {
          setSelectedTheme(currentUser.theme);
      }
  }, [currentUser]);

  const handleSaveSiteSettings = () => {
    updateSiteSettings({
        title: formData.title,
        subtitle: formData.subtitle,
        logoUrl: formData.logoUrl
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleThemeChange = (themeKey: string) => {
      setSelectedTheme(themeKey);
      updateUserTheme(themeKey);
  };

  const handleAddDeadline = () => {
      if (!newDeadlineName) return;
      const newTemplate: DeadlineTemplate = {
          id: `dt-${Date.now()}`,
          name: newDeadlineName,
          days: newDeadlineDays,
          color: 'red'
      };
      addDeadlineTemplate(newTemplate);
      setNewDeadlineName('');
      setNewDeadlineDays(7);
  };

  if (!currentUser) return null;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Ayarlar</h1>
        <p className="text-slate-500 mt-1">Kişisel tercihler ve sistem yapılandırması</p>
      </header>

      {/* Settings Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'general' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Settings className="w-4 h-4 mr-2" />
              Genel Ayarlar
          </button>
          
          <button 
            onClick={() => setActiveTab('deadlines')}
            className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'deadlines' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Clock className="w-4 h-4 mr-2" />
              Yasal Süreler
          </button>
          
          {isAdmin && (
              <button 
                onClick={() => setActiveTab('users')}
                className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'users' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                  <Users className="w-4 h-4 mr-2" />
                  Kullanıcılar & Yetkiler
              </button>
          )}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-8 max-w-3xl animate-in slide-in-from-left-2 fade-in duration-300">
            
            {/* Personal Settings - Accessible to everyone */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                    <Palette className="w-5 h-5 mr-2 text-slate-600" />
                    <h3 className="font-bold text-slate-700">Görünüm & Tema</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">Kullanıcı arayüzü için tercih ettiğiniz renk temasını seçin.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.entries(THEME_COLORS).map(([key, theme]) => (
                            <button
                                key={key}
                                onClick={() => handleThemeChange(key)}
                                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${selectedTheme === key ? 'border-brand-500 bg-brand-50/50' : 'border-transparent hover:bg-slate-50'}`}
                            >
                                <div 
                                    className="w-10 h-10 rounded-full mb-2 shadow-sm flex items-center justify-center"
                                    style={{ backgroundColor: `rgb(${theme.colors[600]})` }}
                                >
                                    {selectedTheme === key && <CheckCircle className="w-5 h-5 text-white" />}
                                </div>
                                <span className={`text-xs font-medium ${selectedTheme === key ? 'text-slate-900' : 'text-slate-500'}`}>{theme.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Admin Settings - Restricted */}
            {isAdmin ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-slate-600" />
                        <h3 className="font-bold text-slate-700">Site Kimliği (Admin)</h3>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Site Başlığı</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
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
                                className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
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
                                            className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 text-sm"
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
                            onClick={handleSaveSiteSettings} 
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition transform active:scale-95"
                        >
                            <Save className="w-4 h-4 mr-2" /> Kaydet ve Uygula
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start text-blue-800 text-sm">
                    <Shield className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p>Site genel ayarları (logo, başlık vb.) sadece yönetici tarafından düzenlenebilir.</p>
                </div>
            )}
        </div>
      )}

      {activeTab === 'deadlines' && (
          <div className="space-y-6 max-w-3xl animate-in slide-in-from-left-2 fade-in duration-300">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-slate-600" />
                    <h3 className="font-bold text-slate-700">Yasal Süre Şablonları</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-6">
                        Dava dosyalarında sık kullanılan yasal süreleri buradan tanımlayabilirsiniz. 
                        "Tebliğ Tarihi" girildiğinde otomatik olarak hesaplanacaktır.
                    </p>

                    <div className="flex gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Süre Adı</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                placeholder="Örn: İstinaf Başvurusu"
                                value={newDeadlineName}
                                onChange={e => setNewDeadlineName(e.target.value)}
                            />
                        </div>
                         <div className="w-32">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gün</label>
                            <input 
                                type="number" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                placeholder="7"
                                value={newDeadlineDays}
                                onChange={e => setNewDeadlineDays(Number(e.target.value))}
                            />
                        </div>
                         <button 
                            onClick={handleAddDeadline}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm transition h-[38px]"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Ekle
                        </button>
                    </div>

                    <div className="space-y-3">
                        {deadlineTemplates.map((dt) => (
                            <div key={dt.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-200 transition">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 text-slate-400 mr-3" />
                                    <span className="font-medium text-slate-800">{dt.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                        {dt.days} Gün
                                    </span>
                                    <button 
                                        onClick={() => deleteDeadlineTemplate(dt.id)}
                                        className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          </div>
      )}

      {activeTab === 'users' && isAdmin && (
          <div className="animate-in slide-in-from-right-2 fade-in duration-300">
              <UserManager isEmbedded={true} />
          </div>
      )}
    </div>
  );
};
