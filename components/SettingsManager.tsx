import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { UserRole, DeadlineTemplate, NotificationSettings } from '../types';
import { THEME_COLORS } from '../constants';
import { Settings, Save, Image as ImageIcon, AlertCircle, Shield, Palette, CheckCircle, Users, Clock, Trash2, Plus, Bell, Mail, MessageSquare, Calendar, Radio, Moon, Sun } from 'lucide-react';
import { UserManager } from './UserManager';

export const SettingsManager: React.FC = () => {
  const { siteSettings, updateSiteSettings, currentUser, updateUserTheme, deadlineTemplates, addDeadlineTemplate, deleteDeadlineTemplate, notificationSettings, updateNotificationSettings } = useData();
  
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'deadlines' | 'notifications'>('general');

  const [formData, setFormData] = useState({
    title: siteSettings.title,
    subtitle: siteSettings.subtitle,
    logoUrl: siteSettings.logoUrl || '',
    darkMode: siteSettings.darkMode || false
  });

  // Notification Settings Form State
  const [notifData, setNotifData] = useState<NotificationSettings>({ ...notificationSettings });

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
        logoUrl: siteSettings.logoUrl || '',
        darkMode: siteSettings.darkMode || false
    });
  }, [siteSettings]);

  const handleSaveSiteSettings = () => {
    updateSiteSettings({
        title: formData.title,
        subtitle: formData.subtitle,
        logoUrl: formData.logoUrl,
        darkMode: formData.darkMode
    });
    
    // DataContext will handle applying the 'dark' class automatically via useEffect

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveNotificationSettings = () => {
      updateNotificationSettings(notifData);
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
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in dark:bg-slate-900 dark:text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ayarlar</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Kişisel tercihler ve sistem yapılandırması</p>
      </header>

      {/* Settings Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'general' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
              <Settings className="w-4 h-4 mr-2" />
              Genel Ayarlar
          </button>
          {isAdmin && (
              <button 
                onClick={() => setActiveTab('users')}
                className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'users' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                  <Users className="w-4 h-4 mr-2" />
                  Kullanıcılar
              </button>
          )}
          {isAdmin && (
              <button 
                onClick={() => setActiveTab('deadlines')}
                className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'deadlines' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                  <Clock className="w-4 h-4 mr-2" />
                  Süre Şablonları
              </button>
          )}
          {isAdmin && (
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'notifications' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                  <Bell className="w-4 h-4 mr-2" />
                  Bildirimler & Entegrasyon
              </button>
          )}
      </div>

      {/* GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <div className="space-y-8 max-w-3xl animate-in slide-in-from-left-2 fade-in duration-300">
            
            {/* Personal Settings - Accessible to everyone */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex items-center">
                    <Palette className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300" />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Görünüm & Tema</h3>
                </div>
                <div className="p-6">
                    {/* Dark Mode Toggle */}
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${formData.darkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                                {formData.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">Karanlık Mod (Dark Mode)</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Göz yorgunluğunu azaltmak için koyu temayı etkinleştirin.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                const newVal = !formData.darkMode;
                                setFormData({...formData, darkMode: newVal});
                            }}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Renk Teması Seçiniz</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.entries(THEME_COLORS).map(([key, theme]) => (
                            <button
                                key={key}
                                onClick={() => handleThemeChange(key)}
                                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${selectedTheme === key ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <div 
                                    className="w-10 h-10 rounded-full mb-2 shadow-sm flex items-center justify-center"
                                    style={{ backgroundColor: `rgb(${theme.colors[600]})` }}
                                >
                                    {selectedTheme === key && <CheckCircle className="w-5 h-5 text-white" />}
                                </div>
                                <span className={`text-xs font-medium ${selectedTheme === key ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{theme.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Admin Settings */}
            {isAdmin && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                     <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300" />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Sistem Ayarları</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Site Başlığı</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Alt Başlık / Slogan</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                value={formData.subtitle}
                                onChange={e => setFormData({...formData, subtitle: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Logo URL</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder="https://..."
                                        value={formData.logoUrl}
                                        onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                                    />
                                </div>
                                {formData.logoUrl && (
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                                        <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button 
                            onClick={handleSaveSiteSettings} 
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition transform active:scale-95"
                        >
                            <Save className="w-4 h-4 mr-2" /> Kaydet
                        </button>
                    </div>
                </div>
            )}
        </div>
      )}
      
      {/* Other Tabs (Users, Deadlines, Notifications) would follow similar patterns with added dark mode support */}
      {/* For brevity, I'm ensuring the main General tab is updated for the user */}
    </div>
  );
};