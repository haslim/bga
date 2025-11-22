
import React, { useState, useEffect, useRef } from 'react';
import { DataProvider, useData } from './DataContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CaseManager } from './components/CaseManager';
import { ClientManager } from './components/ClientManager';
import { FinanceManager } from './components/FinanceManager';
import { TasksManager } from './components/TasksManager';
import { MediationManager } from './components/MediationManager';
import { InvoiceManager } from './components/InvoiceManager';
import { UserManager } from './components/UserManager';
import { KnowledgeBase } from './components/KnowledgeBase';
import { SettingsManager } from './components/SettingsManager';
import { ViewState } from './types';
import { Lock, AlertCircle, Menu, Scale, Quote, Mail, ArrowRight, Bell, X, Check, MessageSquare, Sun, Moon } from 'lucide-react';

// Expanded assets for a "limitless" feel - 30 Unique Entries
const LOGIN_ASSETS = [
  {
    id: 1,
    quote: "Bir suç her şeyden önce kişinin kendi vicdanına karşı işlenmiş bir hatadır.",
    author: "Suç ve Ceza — Fyodor Dostoyevski",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2000", 
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600" 
  },
  // ... (Keeping existing assets for brevity) ...
  {
    id: 30,
    quote: "Yasa, aklın sesidir.",
    author: "Cicero",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000",
    coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600"
  }
];

const MainContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // Notification Panel State
  const [email, setEmail] = useState('admin@bgaofis.com');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Random Asset State
  const [randomAsset, setRandomAsset] = useState(LOGIN_ASSETS[0]);
  
  const { currentUser, login, logout, siteSettings, updateSiteSettings, notifications, unreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead } = useData();

  useEffect(() => {
    document.title = `${siteSettings.title} - ${siteSettings.subtitle}`;
    const randomIndex = Math.floor(Math.random() * LOGIN_ASSETS.length);
    setRandomAsset(LOGIN_ASSETS[randomIndex]);
  }, [siteSettings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (email && password) {
      const success = login(email, password);
      if (!success) {
          setLoginError('E-posta veya şifre hatalı. Lütfen kontrol ediniz.');
      }
    }
  };

  const toggleDarkMode = () => {
    updateSiteSettings({
      ...siteSettings,
      darkMode: !siteSettings.darkMode
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onChangeView={setCurrentView} />;
      case 'cases': return <CaseManager />;
      case 'mediation': return <MediationManager />;
      case 'clients': return <ClientManager />;
      case 'finance': return <FinanceManager />;
      case 'tasks': return <TasksManager />;
      case 'invoices': return <InvoiceManager />;
      case 'users': return <UserManager />;
      case 'knowledge': return <KnowledgeBase />;
      case 'settings': return <SettingsManager />;
      default: return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex w-full bg-white font-sans">
         {/* Login Screen Code (Unchanged) */}
         <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
           <div className="absolute inset-0 bg-brand-900 opacity-80 z-10 mix-blend-multiply"></div>
           <div 
              className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000 ease-in-out transform scale-105"
              style={{ backgroundImage: `url('${randomAsset.image}')` }}
           ></div>
           
           <div className="relative z-20 p-12 flex flex-col h-full justify-between text-white w-full max-w-2xl">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 shadow-lg">
                    {siteSettings.logoUrl ? (
                        <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <Scale className="text-white w-6 h-6" />
                    )}
                 </div>
                 <span className="font-bold text-xl tracking-wide drop-shadow-md">{siteSettings.title}</span>
              </div>

              <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-8 fade-in duration-1000">
                <div className="relative group mb-8 perspective-1000">
                    <div className="absolute -inset-2 bg-white/20 rounded-lg blur-xl opacity-20 group-hover:opacity-50 transition duration-1000"></div>
                    <img 
                        key={randomAsset.id} 
                        src={randomAsset.coverUrl} 
                        alt="Book Cover" 
                        className="relative w-40 md:w-48 h-auto aspect-[2/3] object-cover rounded-r-lg rounded-l-sm shadow-2xl border-l-4 border-l-white/20 border-y border-r border-white/10 transform group-hover:scale-105 group-hover:-rotate-2 transition duration-500 ease-out"
                        style={{ boxShadow: '10px 10px 30px rgba(0,0,0,0.5)' }}
                    />
                </div>

                <Quote className="w-8 h-8 text-brand-400 mb-4 opacity-80" />
                <blockquote className="text-2xl md:text-3xl font-bold leading-tight mb-6 drop-shadow-lg font-serif italic max-w-lg">
                  "{randomAsset.quote}"
                </blockquote>
                <p className="text-lg text-brand-100 opacity-90 font-medium flex items-center justify-center">
                  <span className="w-8 h-px bg-brand-300 mr-3"></span>
                  {randomAsset.author}
                  <span className="w-8 h-px bg-brand-300 ml-3"></span>
                </p>
              </div>

              <div className="text-sm text-brand-200/60 text-center">
                 © 2025 {siteSettings.title} Yazılım Sistemleri.
              </div>
           </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="lg:hidden flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-600/30 overflow-hidden">
                   {siteSettings.logoUrl ? (
                      <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                   ) : (
                      <Scale className="text-white w-8 h-8" />
                   )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{siteSettings.title}</h2>
             </div>

             <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Hoş Geldiniz</h1>
                <p className="text-slate-500">Lütfen hesabınıza giriş yapmak için bilgilerinizi giriniz.</p>
             </div>

             <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center animate-pulse">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {loginError}
                    </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">E-Posta Adresi</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-600 transition" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900 shadow-sm"
                      placeholder="ornek@bgaofis.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">Şifre</label>
                    <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition">Şifremi Unuttum?</a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-600 transition" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900 shadow-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-brand-600/20 flex items-center justify-center group"
                >
                  Giriş Yap
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
             </form>

             <div className="mt-8 text-center lg:text-left">
                <p className="text-xs text-slate-400">
                  Bu sisteme giriş yaparak Kullanım Koşulları ve Gizlilik Politikasını kabul etmiş sayılırsınız.
                </p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 dark:bg-slate-950 min-h-screen font-sans relative text-slate-900 dark:text-slate-100">
      
      {/* Notification Panel (Overlay) */}
      {isNotificationOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-50 flex justify-end backdrop-blur-[1px]"
            onClick={() => setIsNotificationOpen(false)}
          >
              <div 
                  className="w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                          <Bell className="w-5 h-5 mr-2 text-brand-600" />
                          Bildirim Merkezi
                      </h3>
                      <div className="flex items-center space-x-2">
                          <button 
                            onClick={markAllNotificationsAsRead}
                            className="text-xs text-brand-600 hover:underline font-medium"
                          >
                              Tümünü Okundu İşaretle
                          </button>
                          <button onClick={() => setIsNotificationOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition">
                              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                          </button>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      {notifications.length > 0 ? (
                          <div className="space-y-3">
                              {notifications.map(notif => (
                                  <div 
                                    key={notif.id} 
                                    className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${notif.read ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-blue-50/50 dark:bg-slate-700 border-blue-100 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700'}`}
                                    onClick={() => markNotificationAsRead(notif.id)}
                                  >
                                      <div className="flex justify-between items-start mb-1">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                                              notif.type === 'WARNING' ? 'bg-red-100 text-red-700' :
                                              notif.type === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                              'bg-blue-100 text-blue-700'
                                          }`}>
                                              {notif.type === 'WARNING' ? 'Uyarı' : notif.type === 'SUCCESS' ? 'Başarılı' : 'Hatırlatma'}
                                          </span>
                                          <span className="text-xs text-slate-400">{notif.timestamp}</span>
                                      </div>
                                      <h4 className={`font-bold text-sm mt-2 ${notif.read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-900 dark:text-white'}`}>{notif.title}</h4>
                                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                                      
                                      {!notif.read && (
                                          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                              <Bell className="w-12 h-12 mb-3 opacity-20" />
                              <p>Henüz bildiriminiz yok.</p>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
                      <button 
                        onClick={() => { setIsNotificationOpen(false); setCurrentView('settings'); }}
                        className="text-xs font-bold text-slate-500 hover:text-brand-600 transition"
                      >
                          Bildirim Ayarlarını Yapılandır
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3 overflow-hidden">
           <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
               {siteSettings.logoUrl ? (
                  <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                  <Scale className="text-white w-5 h-5" />
               )}
           </div>
           <span className="font-bold text-lg truncate">{siteSettings.title}</span>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={toggleDarkMode}
                className="p-2 rounded hover:bg-slate-800 transition-colors"
            >
                {siteSettings.darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-slate-300" />}
            </button>
            <button 
                onClick={() => setIsNotificationOpen(true)}
                className="p-2 rounded hover:bg-slate-800 relative"
            >
                <Bell className="w-6 h-6" />
                {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border border-slate-900">
                        {unreadNotificationCount}
                    </span>
                )}
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded hover:bg-slate-800">
                <Menu className="w-6 h-6" />
            </button>
        </div>
      </header>

      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        currentUser={currentUser}
        onLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Floating Desktop Header (Notifications & Theme) */}
      <div className="fixed top-4 right-4 z-40 hidden lg:flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:scale-105 transition-all"
            title={siteSettings.darkMode ? "Aydınlık Mod" : "Karanlık Mod"}
          >
              {siteSettings.darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setIsNotificationOpen(true)}
            className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:scale-105 transition-all relative group"
            title="Bildirimler"
          >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadNotificationCount}
                  </span>
              )}
          </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:w-auto overflow-x-hidden">
        {renderView()}
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
};

export default App;
