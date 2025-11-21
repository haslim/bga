
import React from 'react';
import { useData } from '../DataContext';
import { LayoutDashboard, Scale, Users, Landmark, CalendarCheck, LogOut, Handshake, FileText, Shield, BookOpen, X, Settings } from 'lucide-react';
import { ViewState, User, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  currentUser: User;
  onLogout: () => void;
  isOpen: boolean; // Mobile state
  onClose: () => void; // Mobile close handler
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  allowedRoles?: UserRole[]; // If undefined, accessible by all
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentUser, onLogout, isOpen, onClose }) => {
  const { siteSettings } = useData();
  
  const allMenuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Panel', 
      icon: LayoutDashboard 
    },
    { 
      id: 'cases', 
      label: 'Dava Dosyaları', 
      icon: Scale,
      allowedRoles: [UserRole.ADMIN, UserRole.LAWYER, UserRole.INTERN, UserRole.SECRETARY]
    },
    { 
      id: 'mediation', 
      label: 'Arabuluculuk', 
      icon: Handshake,
      allowedRoles: [UserRole.ADMIN, UserRole.LAWYER]
    },
    { 
      id: 'clients', 
      label: 'Müvekkiller', 
      icon: Users,
      allowedRoles: [UserRole.ADMIN, UserRole.LAWYER, UserRole.SECRETARY]
    },
    { 
      id: 'finance', 
      label: 'Finans & Kasa', 
      icon: Landmark,
      allowedRoles: [UserRole.ADMIN, UserRole.FINANCE]
    },
    { 
      id: 'invoices', 
      label: 'Faturalar (SMM)', 
      icon: FileText,
      allowedRoles: [UserRole.ADMIN, UserRole.FINANCE]
    },
    { 
      id: 'tasks', 
      label: 'Görevler', 
      icon: CalendarCheck 
    },
    {
      id: 'knowledge',
      label: 'Bilgi Bankası',
      icon: BookOpen
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings
    }
  ];

  // Filter menu items based on the current user's role
  const filteredMenuItems = allMenuItems.filter(item => {
    if (!item.allowedRoles) return true; // Public items
    return item.allowedRoles.includes(currentUser.role);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Content */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out shadow-xl flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              {siteSettings.logoUrl ? (
                <img src={siteSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Scale className="text-white w-5 h-5" />
              )}
            </div>
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold tracking-tight leading-tight truncate">{siteSettings.title}</h1>
              <p className="text-[10px] text-slate-400 truncate">{siteSettings.subtitle}</p>
            </div>
          </div>
          {/* Close Button (Mobile Only) */}
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id as ViewState);
                  onClose(); // Close sidebar on mobile when clicked
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={currentUser.avatarUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-brand-500 object-cover shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 py-2 px-4 rounded-md transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </div>
    </>
  );
};
