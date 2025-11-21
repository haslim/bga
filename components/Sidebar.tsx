
import React from 'react';
import { LayoutDashboard, Scale, Users, Landmark, CalendarCheck, LogOut, Handshake, FileText } from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentUser, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'cases', label: 'Dava Dosyaları', icon: Scale },
    { id: 'mediation', label: 'Arabuluculuk', icon: Handshake },
    { id: 'clients', label: 'Müvekkiller', icon: Users },
    { id: 'finance', label: 'Finans & Kasa', icon: Landmark },
    { id: 'invoices', label: 'Faturalar (SMM)', icon: FileText },
    { id: 'tasks', label: 'Görevler', icon: CalendarCheck },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl">
      <div className="p-6 border-b border-slate-700 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Scale className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">BGAofis</h1>
          <p className="text-xs text-slate-400">Hukuk Otomasyonu</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={currentUser.avatarUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-blue-500"
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
  );
};
