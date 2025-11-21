
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

// Define assets for the random login screen with diverse books and covers
const LOGIN_ASSETS = [
  {
    id: 1,
    quote: "Bir suç her şeyden önce kişinin kendi vicdanına karşı işlenmiş bir hatadır.",
    author: "Suç ve Ceza — Fyodor Dostoyevski",
    // Moody dark library
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2000", 
    // Dark book cover vibe
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600" 
  },
  {
    id: 2,
    quote: "Çoğunluğa bağlı olmayan tek şey insanın vicdanıdır.",
    author: "Bülbülü Öldürmek — Harper Lee",
    // Wooden desk, nostalgic
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000",
    // Old yellowed book
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    quote: "Adalet mülkün temelidir.",
    author: "Mustafa Kemal Atatürk",
    // Marble columns, court
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=2000",
    // Gavel and law book
    coverUrl: "https://images.unsplash.com/photo-1589994965851-08d8095e267f?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 4,
    quote: "Kanun, adalet kavramını gerçekleştirmek için vardır.",
    author: "Sefiller — Victor Hugo",
    // Old Paris vibes, dark bricks
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&q=80&w=2000",
    // Classic leather book
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 5,
    quote: "Doğru olanı yapmak, korkudan titrese bile, ileriye doğru bir adım atmaktır.",
    author: "Dava — Franz Kafka",
    // Abstract, shadows, bureaucratic
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2000",
    // Minimalist dark book
    coverUrl: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 6,
    quote: "Özgürlük, iki kere ikinin dört ettiğini söyleyebilmektir. Buna izin verilirse, gerisi kendiliğinden gelir.",
    author: "1984 — George Orwell",
    // Industrial, grey, surveillance vibe
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000",
    // Red book cover
    coverUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 7,
    quote: "Sorgulanmamış bir hayat, yaşanmaya değmez.",
    author: "Sokrates'in Savunması — Platon",
    // Ancient greek style, stone
    image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=2000",
    // Philosophy texts
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 8,
    quote: "Bir şeyi gerçekten istersen, bütün evren onu gerçekleştirmen için işbirliği yapar.",
    author: "Simyacı — Paulo Coelho",
    // Desert, stars, mystical
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=2000",
    // Book with light
    coverUrl: "https://images.unsplash.com/photo-1519681393784-d8e5b5a4570e?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 9,
    quote: "Bizim mantığımızla hayatın mantığı asla uyuşmadı.",
    author: "Tutunamayanlar — Oğuz Atay",
    // Melancholic, rainy window or messy desk
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=2000",
    // Stack of books
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 10,
    quote: "Adalet peşinde koşmak, onu elde etmekten daha değerlidir.",
    author: "Denemeler — Montaigne",
    // Classic library, leather
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=2000",
    // Antique book spine
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
  }
];

const MainContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
  const [email, setEmail] = useState('admin@bgaofis.com');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Random Asset State
  const [randomAsset, setRandomAsset] = useState(LOGIN_ASSETS[0]);
  
  const { currentUser, login, logout, siteSettings } = useData();

  useEffect(() => {
    document.title = `${siteSettings.title} - ${siteSettings.subtitle}`;
    // Select a random asset on mount
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
           <div className="absolute inset-0 bg-brand-900 opacity-80 z-10 mix-blend-multiply"></div>
           <div 
              className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000 ease-in-out transform scale-105"
              style={{ backgroundImage: `url('${randomAsset.image}')` }}
           ></div>
           
           <div className="relative z-20 p-12 flex flex-col h-full justify-between text-white w-full max-w-2xl">
              {/* Top Logo Area */}
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

              {/* Center Content with Book Cover & Quote */}
              <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-8 fade-in duration-1000">
                
                {/* Book Cover Image */}
                <div className="relative group mb-8 perspective-1000">
                    <div className="absolute -inset-2 bg-white/20 rounded-lg blur-xl opacity-20 group-hover:opacity-50 transition duration-1000"></div>
                    <img 
                        key={randomAsset.id} // Force re-render for animation
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

              {/* Footer Copyright */}
              <div className="text-sm text-brand-200/60 text-center">
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
