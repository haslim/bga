
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../DataContext';
import { UserRole, DeadlineTemplate, NotificationSettings, Template, MediatorProfile } from '../types';
import { THEME_COLORS } from '../constants';
import { Settings, Save, Image as ImageIcon, AlertCircle, Shield, Palette, CheckCircle, Users, Clock, Trash2, Plus, Bell, Mail, MessageSquare, Calendar, Radio, Moon, Sun, Smartphone, Zap, Globe, ToggleLeft, ToggleRight, LayoutTemplate, FileText, Edit3, X, Code, Eye, Briefcase } from 'lucide-react';
import { UserManager } from './UserManager';

export const SettingsManager: React.FC = () => {
  const { siteSettings, updateSiteSettings, currentUser, updateUserTheme, deadlineTemplates, addDeadlineTemplate, deleteDeadlineTemplate, notificationSettings, updateNotificationSettings, templates, updateTemplate, mediatorProfile, updateMediatorProfile } = useData();
  
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'users' | 'deadlines' | 'notifications' | 'templates'>('general');

  const [formData, setFormData] = useState({
    title: siteSettings.title,
    subtitle: siteSettings.subtitle,
    logoUrl: siteSettings.logoUrl || '',
    darkMode: siteSettings.darkMode || false
  });

  // Mediator Profile Form State
  const [profileData, setProfileData] = useState<MediatorProfile>({...mediatorProfile});

  // Notification Settings Form State
  const [notifData, setNotifData] = useState<NotificationSettings>({ ...notificationSettings });

  // Deadline form state
  const [newDeadlineName, setNewDeadlineName] = useState('');
  const [newDeadlineDays, setNewDeadlineDays] = useState(7);

  // Template Editor State
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateContent, setTemplateContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
      setProfileData({...mediatorProfile});
  }, [mediatorProfile]);

  // Sync notification settings
  useEffect(() => {
      setNotifData({...notificationSettings});
  }, [notificationSettings]);

  const handleSaveSiteSettings = () => {
    updateSiteSettings({
        title: formData.title,
        subtitle: formData.subtitle,
        logoUrl: formData.logoUrl,
        darkMode: formData.darkMode
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveProfile = () => {
      updateMediatorProfile(profileData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveNotificationSettings = () => {
      updateNotificationSettings(notifData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleNotificationSetting = (key: keyof NotificationSettings) => {
      setNotifData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRuleSetting = (ruleKey: keyof typeof notificationSettings.rules) => {
      setNotifData(prev => ({
          ...prev,
          rules: {
              ...prev.rules,
              [ruleKey]: !prev.rules[ruleKey]
          }
      }));
  };

  const changeIntegration = (key: keyof typeof notificationSettings.integrations, value: string) => {
      setNotifData(prev => ({
          ...prev,
          integrations: {
              ...prev.integrations,
              [key]: value
          }
      }));
  };

  const changeIntegrationConfig = (key: string, value: string) => {
      setNotifData(prev => ({
          ...prev,
          integrations: {
              ...prev.integrations,
              [key]: value
          }
      }));
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
          color: 'red' // Default logic
      };
      addDeadlineTemplate(newTemplate);
      setNewDeadlineName('');
      setNewDeadlineDays(7);
  };

  // Template Logic
  const handleEditTemplate = (template: Template) => {
      setEditingTemplate(template);
      setTemplateContent(template.content);
  };

  const handleSaveTemplate = () => {
      if (editingTemplate) {
          updateTemplate({ ...editingTemplate, content: templateContent });
          setEditingTemplate(null);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
      }
  };

  const insertVariable = (variable: string) => {
      if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const text = templateContent;
          const newText = text.substring(0, start) + variable + text.substring(end);
          setTemplateContent(newText);
          // Set cursor position after insertion (timeout needed for React state update)
          setTimeout(() => {
              if (textareaRef.current) {
                  textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + variable.length;
                  textareaRef.current.focus();
              }
          }, 0);
      }
  };

  if (!currentUser) return null;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onChange, label, description }: { enabled: boolean, onChange: () => void, label: string, description?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
        <div className="mr-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
            {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        <button 
            onClick={onChange}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
  );

  // Input Class for Dark Mode
  const inputClass = "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all";

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in dark:bg-slate-900 dark:text-white">
      {/* Template Edit Modal */}
      {editingTemplate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                          <Edit3 className="w-5 h-5 mr-2 text-brand-600" />
                          Şablon Düzenle: {editingTemplate.name}
                      </h3>
                      <button onClick={() => setEditingTemplate(null)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  
                  <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                      {/* Sidebar: Variables */}
                      <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/30 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Değişkenler</h4>
                          <div className="space-y-2">
                              {[
                                  { code: '{{MUVEKKIL}}', label: 'Müvekkil Adı' },
                                  { code: '{{KARSI_TARAF}}', label: 'Karşı Taraf' },
                                  { code: '{{DOSYA_NO}}', label: 'Dosya Numarası' },
                                  { code: '{{KONU}}', label: 'Uyuşmazlık Konusu' },
                                  { code: '{{TARIH}}', label: 'Bugünün Tarihi' },
                                  { code: '{{ARABULUCU}}', label: 'Arabulucu Adı' },
                                  { code: '{{ARABULUCU_SICIL}}', label: 'Sicil No' },
                                  { code: '{{ARABULUCU_IBAN}}', label: 'IBAN No' },
                              ].map((v) => (
                                  <button 
                                    key={v.code}
                                    onClick={() => insertVariable(v.code)}
                                    className="w-full text-left px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs hover:border-brand-400 hover:text-brand-600 transition group"
                                  >
                                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 block">{v.code}</span>
                                      <span className="text-slate-400 group-hover:text-brand-500">{v.label}</span>
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Editor Area */}
                      <div className="flex-1 flex flex-col">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center">
                              <Code className="w-4 h-4 mr-2" />
                              HTML Editör Modu
                          </div>
                          <textarea 
                              ref={textareaRef}
                              className="flex-1 w-full p-6 font-mono text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 resize-none outline-none focus:bg-slate-50 dark:focus:bg-slate-900 transition-colors"
                              value={templateContent}
                              onChange={e => setTemplateContent(e.target.value)}
                              spellCheck={false}
                          ></textarea>
                      </div>
                  </div>

                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                      <button onClick={() => setEditingTemplate(null)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                      <button onClick={handleSaveTemplate} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-bold shadow-lg flex items-center">
                          <Save className="w-4 h-4 mr-2" /> Değişiklikleri Kaydet
                      </button>
                  </div>
              </div>
          </div>
      )}

      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ayarlar</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Kişisel tercihler ve sistem yapılandırması</p>
        </div>
        {showSuccess && (
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center animate-in fade-in slide-in-from-right">
                <CheckCircle className="w-4 h-4 mr-2" />
                Ayarlar başarıyla kaydedildi!
            </div>
        )}
      </header>

      {/* Settings Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto custom-scrollbar pb-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'general' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
              <Settings className="w-4 h-4 mr-2" />
              Genel Ayarlar
          </button>
          {isAdmin && (
              <button 
                onClick={() => setActiveTab('profile')}
                className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'profile' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Arabulucu Profili
              </button>
          )}
          {isAdmin && (
              <button 
                onClick={() => setActiveTab('templates')}
                className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 flex items-center whitespace-nowrap ${activeTab === 'templates' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Belge Şablonları
              </button>
          )}
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

      <div className="max-w-5xl">
        
        {/* GENERAL SETTINGS */}
        {activeTab === 'general' && (
            <div className="space-y-8 animate-in slide-in-from-left-2 fade-in duration-300">
                
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
                                    className={inputClass}
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Alt Başlık / Slogan</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
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
                                            className={`${inputClass} pl-9`}
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

        {/* PROFILE TAB */}
        {activeTab === 'profile' && isAdmin && (
            <div className="space-y-6 animate-in slide-in-from-right-2 fade-in duration-300">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center bg-slate-50/50 dark:bg-slate-800">
                        <Briefcase className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300" />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Arabulucu Profil Bilgileri</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-xl flex items-start mb-6">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Önemli Bilgi</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                    Burada gireceğiniz bilgiler (Ad, Sicil No, İban, Adres vb.), oluşturulan tüm arabuluculuk belgelerinde (Tutanak, Davet, Ücret Sözleşmesi) otomatik olarak kullanılacaktır.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ad Soyad / Ünvan</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={profileData.name}
                                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Arabulucu Sicil No</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={profileData.registrationNumber}
                                    onChange={e => setProfileData({...profileData, registrationNumber: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Telefon</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={profileData.phone}
                                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">E-Posta</label>
                                <input 
                                    type="email" 
                                    className={inputClass}
                                    value={profileData.email}
                                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adres</label>
                                <textarea 
                                    className={inputClass}
                                    rows={3}
                                    value={profileData.address}
                                    onChange={e => setProfileData({...profileData, address: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">IBAN (Ücret Sözleşmeleri İçin)</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    placeholder="TR..."
                                    value={profileData.iban}
                                    onChange={e => setProfileData({...profileData, iban: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button 
                            onClick={handleSaveProfile} 
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition transform active:scale-95"
                        >
                            <Save className="w-4 h-4 mr-2" /> Bilgileri Güncelle
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && isAdmin && (
            <div className="animate-in slide-in-from-right-2 fade-in duration-300 space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 p-4 rounded-xl flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Şablon Yönetimi Hakkında</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            Burada düzenleyeceğiniz şablonlar sistem genelinde (Varsayılan) olarak kullanılır. 
                            Değişkenleri (örn: <span className="font-mono bg-white dark:bg-slate-800 px-1 rounded">{'{{MUVEKKIL}}'}</span>) silmemeye özen gösteriniz.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:border-brand-300 dark:hover:border-brand-700 transition group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-lg mr-4 ${
                                        template.type === 'Davet' ? 'bg-orange-100 text-orange-600' :
                                        template.type === 'Ucret' ? 'bg-green-100 text-green-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white">{template.name}</h3>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase tracking-wide">{template.type}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                                {template.content.replace(/<[^>]*>?/gm, '')}
                            </p>
                            <button 
                                onClick={() => handleEditTemplate(template)}
                                className="w-full py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-800 transition flex items-center justify-center"
                            >
                                <Edit3 className="w-4 h-4 mr-2" /> Düzenle
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && isAdmin && (
            <div className="animate-in slide-in-from-right-2 fade-in duration-300">
                <UserManager isEmbedded={true} />
            </div>
        )}

        {/* DEADLINES TAB */}
        {activeTab === 'deadlines' && isAdmin && (
            <div className="space-y-6 animate-in slide-in-from-right-2 fade-in duration-300">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center bg-slate-50/50 dark:bg-slate-800">
                        <Clock className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300" />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Yasal Süre Şablonları</h3>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex gap-4 mb-6 items-end bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Şablon Adı</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Cevap Süresi"
                                    className={inputClass}
                                    value={newDeadlineName}
                                    onChange={e => setNewDeadlineName(e.target.value)}
                                />
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Gün Sayısı</label>
                                <input 
                                    type="number" 
                                    className={inputClass}
                                    value={newDeadlineDays}
                                    onChange={e => setNewDeadlineDays(Number(e.target.value))}
                                />
                            </div>
                            <button 
                                onClick={handleAddDeadline}
                                disabled={!newDeadlineName}
                                className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Ekle
                            </button>
                        </div>

                        <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Şablon Adı</th>
                                        <th className="px-6 py-3">Süre (Gün)</th>
                                        <th className="px-6 py-3 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                    {deadlineTemplates.map(dt => (
                                        <tr key={dt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{dt.name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                <span className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-1 rounded text-xs font-bold">
                                                    {dt.days} Gün
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => deleteDeadlineTemplate(dt.id)}
                                                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {deadlineTemplates.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center py-8 text-slate-500 dark:text-slate-400">Kayıtlı şablon yok.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && isAdmin && (
            <div className="space-y-8 animate-in slide-in-from-right-2 fade-in duration-300">
                 {/* ... (Existing Notification Code) ... */}
                 {/* Channels */}
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300" />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Bildirim Kanalları</h3>
                    </div>
                    <div className="p-6 space-y-2">
                        <ToggleSwitch 
                            label="SMS Bildirimleri" 
                            description="Müvekkil ve taraflara SMS ile bilgilendirme gönderilsin."
                            enabled={notifData.smsEnabled}
                            onChange={() => toggleNotificationSetting('smsEnabled')}
                        />
                        <ToggleSwitch 
                            label="E-Posta Bildirimleri" 
                            description="Belge ve bilgilendirme mailleri gönderilsin."
                            enabled={notifData.emailEnabled}
                            onChange={() => toggleNotificationSetting('emailEnabled')}
                        />
                        <ToggleSwitch 
                            label="Mobil Push Bildirimler" 
                            description="Mobil uygulama üzerinden anlık bildirimler."
                            enabled={notifData.pushEnabled}
                            onChange={() => toggleNotificationSetting('pushEnabled')}
                        />
                        <ToggleSwitch 
                            label="Takvim Senkronizasyonu" 
                            description="Duruşma ve görevleri harici takvime (Google/Outlook) işle."
                            enabled={notifData.calendarSync}
                            onChange={() => toggleNotificationSetting('calendarSync')}
                        />
                    </div>
                 </div>

                 {/* Automation Rules */}
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300" />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Otomasyon Kuralları</h3>
                    </div>
                    <div className="p-6 space-y-2">
                        <ToggleSwitch 
                            label="24 Saat Öncesi Hatırlatma" 
                            description="Duruşma ve oturumlardan 24 saat önce taraflara otomatik hatırlatma gönder."
                            enabled={notifData.rules.meetingReminder24h}
                            onChange={() => toggleRuleSetting('meetingReminder24h')}
                        />
                        <ToggleSwitch 
                            label="İmza Uyarısı" 
                            description="Gönderilen belgeler 3 gün içinde imzalanmazsa uyarı ver."
                            enabled={notifData.rules.unsignedDocWarning}
                            onChange={() => toggleRuleSetting('unsignedDocWarning')}
                        />
                        <ToggleSwitch 
                            label="Davet Mektubu Kontrolü" 
                            description="Arabuluculuk dosya açılışında davet gönderilmediyse uyar."
                            enabled={notifData.rules.inviteWarning}
                            onChange={() => toggleRuleSetting('inviteWarning')}
                        />
                    </div>
                 </div>

                 {/* Providers */}
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-300" />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Servis Sağlayıcı Ayarları</h3>
                    </div>
                    
                    {/* SMS CONFIG */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                         <div className="flex items-center justify-between mb-4">
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
                                <Smartphone className="w-4 h-4 mr-2"/> SMS Servisi
                             </label>
                             <select 
                                value={notifData.integrations.smsProvider}
                                onChange={(e) => changeIntegration('smsProvider', e.target.value)}
                                className={inputClass.replace('w-full', 'w-48')}
                            >
                                 <option value="Netgsm">Netgsm</option>
                                 <option value="Twilio">Twilio</option>
                                 <option value="IletiMerkezi">İleti Merkezi</option>
                             </select>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Kullanıcı Adı / Account SID</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={notifData.integrations.smsUsername || ''}
                                    onChange={e => changeIntegrationConfig('smsUsername', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Şifre / Auth Token</label>
                                <input 
                                    type="password" 
                                    className={inputClass}
                                    value={notifData.integrations.smsPassword || ''}
                                    onChange={e => changeIntegrationConfig('smsPassword', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Başlık (Header) / From</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={notifData.integrations.smsHeader || ''}
                                    onChange={e => changeIntegrationConfig('smsHeader', e.target.value)}
                                />
                            </div>
                         </div>
                    </div>

                    {/* EMAIL CONFIG */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                         <div className="flex items-center justify-between mb-4">
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
                                <Mail className="w-4 h-4 mr-2"/> E-Posta Servisi
                             </label>
                             <select 
                                value={notifData.integrations.emailProvider}
                                onChange={(e) => changeIntegration('emailProvider', e.target.value)}
                                className={inputClass.replace('w-full', 'w-48')}
                            >
                                 <option value="SMTP">Özel SMTP</option>
                                 <option value="SendGrid">SendGrid</option>
                                 <option value="AWS SES">AWS SES</option>
                             </select>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                            <div className="md:col-span-2">
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">SMTP Host</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={notifData.integrations.emailHost || ''}
                                    onChange={e => changeIntegrationConfig('emailHost', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Port</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={notifData.integrations.emailPort || ''}
                                    onChange={e => changeIntegrationConfig('emailPort', e.target.value)}
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">E-Posta (Kullanıcı)</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={notifData.integrations.emailUser || ''}
                                    onChange={e => changeIntegrationConfig('emailUser', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Şifre</label>
                                <input 
                                    type="password" 
                                    className={inputClass}
                                    value={notifData.integrations.emailPassword || ''}
                                    onChange={e => changeIntegrationConfig('emailPassword', e.target.value)}
                                />
                            </div>
                         </div>
                    </div>

                    {/* CALENDAR CONFIG */}
                    <div className="p-6">
                         <div className="flex items-center justify-between mb-4">
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
                                <Calendar className="w-4 h-4 mr-2"/> Takvim Servisi
                             </label>
                             <select 
                                value={notifData.integrations.calendarProvider}
                                onChange={(e) => changeIntegration('calendarProvider', e.target.value)}
                                className={inputClass.replace('w-full', 'w-48')}
                            >
                                 <option value="Google">Google Calendar</option>
                                 <option value="Outlook">Microsoft Outlook</option>
                                 <option value="Apple">iCloud Calendar</option>
                             </select>
                         </div>
                         
                         <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">API Key / Entegrasyon Linki</label>
                            <input 
                                type="text" 
                                className={inputClass}
                                value={notifData.integrations.calendarApiKey || ''}
                                onChange={e => changeIntegrationConfig('calendarApiKey', e.target.value)}
                                placeholder="https://..."
                            />
                         </div>
                    </div>
                 </div>

                 <div className="flex justify-end pb-8">
                    <button 
                        onClick={handleSaveNotificationSettings} 
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-brand-600/20 transition transform active:scale-95"
                    >
                        <Save className="w-4 h-4 mr-2" /> Ayarları Güncelle
                    </button>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};
