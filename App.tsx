
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
import { Lock, AlertCircle, Menu, Scale } from 'lucide-react';

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
      case 'dashboard': return <Dashboard />;
      case 'cases': return <CaseManager />;
      case 'mediation': return <MediationManager />;
      case 'clients': return <ClientManager />;
      case 'finance': return <FinanceManager />;
      case 'tasks': return <TasksManager />;
      case 'invoices': return <InvoiceManager />;
      case 'users': return <UserManager />;
      case 'knowledge': return <KnowledgeBase />;
      case 'settings': return <SettingsManager />;
      default: return <Dashboard />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-brand-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30 overflow-hidden">
               {siteSettings.logoUrl ? (
                  <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                  <Scale className="text-white w-8 h-8" />
               )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{siteSettings.title} Giriş</h1>
            <p className="text-slate-500 mt-2">{siteSettings.subtitle}</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {loginError}
                </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta Adresi</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="ornek@bgaofis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-95 shadow-lg"
            >
              Giriş Yap
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-xs text-slate-400 mb-2">Varsayılan Şifre: 123456</p>
            <p className="text-xs text-slate-400">
              © 2025 {siteSettings.title} Yazılım. Tüm hakları saklıdır.
            </p>
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