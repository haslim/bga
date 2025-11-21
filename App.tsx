import React, { useState } from 'react';
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
import { ViewState } from './types';
import { Lock } from 'lucide-react';

const MainContent: React.FC<{
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
}> = ({ isLoggedIn, setIsLoggedIn }) => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [email, setEmail] = useState('admin@bgaofis.com');
  const [password, setPassword] = useState('password');
  
  // We use useData here just to get currentUser for the sidebar, 
  // or we can just pass it if we are inside Provider.
  const { currentUser } = useData();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
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
      default: return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">BGAofis Giriş</h1>
            <p className="text-slate-500 mt-2">Hukuk Otomasyon Sistemi</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta Adresi</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="ornek@bgaofis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900"
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
            <p className="text-xs text-slate-400">
              © 2023 BGAofis Yazılım. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        currentUser={currentUser}
        onLogout={() => setIsLoggedIn(false)}
      />
      <main className="flex-1 ml-64">
        {renderView()}
      </main>
    </div>
  );
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <DataProvider>
      <MainContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </DataProvider>
  );
};

export default App;