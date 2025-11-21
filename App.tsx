
import React, { useState, useEffect } from 'react';
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
import { Lock, AlertCircle, Menu, Scale, Quote, Mail, ArrowRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
  const [email, setEmail] = useState('admin@bgaofis.com');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const { currentUser, login, logout, siteSettings } = useData();

  useEffect(() => {
    document.title = `${siteSettings.title} - ${siteSettings.subtitle}`;
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
        {/* Left Side - Branding & Aesthetics (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
           {/* Dynamic Brand Background Overlay */}
           <div className="absolute inset-0 bg-brand-900 opacity-90 z-10"></div>
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center z-0"></div>
           
           <div className="relative z-20 p-16 flex flex-col h-full justify-between text-white w-full max-w-2xl">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                    {siteSettings.logoUrl ? (
                        <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <Scale className="text-white w-6 h-6" />
                    )}
                 </div>
                 <span className="font-bold text-xl tracking-wide">{siteSettings.title}</span>
              </div>

              <div>
                <Quote className="w-12 h-12 text-brand-400 mb-6 opacity-50" />
                <blockquote className="text-3xl font-bold leading-tight mb-6">
                  "Adalet mülkün temelidir."
                </blockquote>
                <p className="text-lg text-brand-100 opacity-80 font-light">
                  Modern hukuk bürosu yönetim sistemi ile süreçlerinizi hızlandırın, müvekkillerinize odaklanın.
                </p>
              </div>

              <div className="text-sm text-brand-200/60">
                 © 2025 {siteSettings.title} Yazılım Sistemleri.
              </div>
           </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             {/* Mobile Logo Header */}
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
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen font-sans">
      
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
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded hover:bg-slate-800">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        currentUser={currentUser}
        onLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
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
