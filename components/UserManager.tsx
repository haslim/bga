import React, { useState } from 'react';
import { useData } from '../DataContext';
import { User, UserRole } from '../types';
import { Shield, User as UserIcon, Plus, Trash2, Edit2, Save, X, Activity, Clock, Search } from 'lucide-react';

export const UserManager: React.FC = () => {
  const { users, auditLogs, currentUser, addUser, updateUser, deleteUser, hasPermission } = useData();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // User Form State
  const [formData, setFormData] = useState<Partial<User>>({
      name: '', email: '', role: UserRole.INTERN
  });

  if (!hasPermission('USER_MANAGE')) {
      return (
          <div className="p-8 flex flex-col items-center justify-center h-screen text-slate-500">
              <Shield className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-xl font-bold">Erişim Reddedildi</h2>
              <p>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
          </div>
      );
  }

  const handleOpenModal = (user?: User) => {
      if (user) {
          setEditingUser(user);
          setFormData({ ...user });
      } else {
          setEditingUser(null);
          setFormData({ name: '', email: '', role: UserRole.INTERN });
      }
      setIsModalOpen(true);
  };

  const handleSaveUser = () => {
      if (!formData.name || !formData.email) return;

      if (editingUser) {
          updateUser({ ...editingUser, ...formData } as User);
      } else {
          const newUser: User = {
              id: `u-${Date.now()}`,
              avatarUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
              lastLogin: '-',
              ipAddress: '-',
              ...formData as User
          };
          addUser(newUser);
      }
      setIsModalOpen(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in">
      
      {/* User Edit/Add Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h3>
                      <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad Soyad</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta</label>
                          <input 
                            type="email" 
                            className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol / Yetki</label>
                          <select 
                            className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                          >
                              {Object.values(UserRole).map(role => (
                                  <option key={role} value={role}>{role}</option>
                              ))}
                          </select>
                      </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium">İptal</button>
                      <button onClick={handleSaveUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center">
                          <Save className="w-4 h-4 mr-2" /> Kaydet
                      </button>
                  </div>
              </div>
          </div>
      )}

      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Kullanıcı Yönetimi</h1>
          <p className="text-slate-500 mt-1">Personel yetkilendirme ve sistem logları</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              Kullanıcı Listesi
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              Sistem Logları (Audit)
          </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Aktif Personel</h3>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> Yeni Kullanıcı
                </button>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <tr>
                        <th className="px-6 py-4">Kullanıcı</th>
                        <th className="px-6 py-4">E-Posta</th>
                        <th className="px-6 py-4">Rol</th>
                        <th className="px-6 py-4">Son Giriş</th>
                        <th className="px-6 py-4">IP Adresi</th>
                        <th className="px-6 py-4 text-right">İşlem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 flex items-center">
                                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full mr-3 border border-slate-200" />
                                <span className="font-medium text-slate-800">{user.name}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                                    ${user.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' : 
                                      user.role === UserRole.LAWYER ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">{user.lastLogin || '-'}</td>
                            <td className="px-6 py-4 text-slate-500 text-xs font-mono">{user.ipAddress || '-'}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    <button onClick={() => handleOpenModal(user)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    {user.id !== currentUser.id && (
                                        <button onClick={() => deleteUser(user.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {activeTab === 'logs' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <div className="flex items-center">
                    <Activity className="w-5 h-5 text-slate-400 mr-2" />
                    <h3 className="font-bold text-slate-700">Sistem Hareket Dökümü (Audit Log)</h3>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Loglarda ara..." className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 bg-white text-slate-900 rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                      {auditLogs.map((log, idx) => (
                          <div key={log.id} className="flex items-start space-x-4 relative pb-4 border-b border-slate-100 last:border-0">
                              <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 z-10">
                                      {log.userName.charAt(0)}
                                  </div>
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{log.action}</span>
                                      <div className="flex items-center text-xs text-slate-400">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {new Date(log.timestamp).toLocaleString('tr-TR')}
                                      </div>
                                  </div>
                                  <p className="text-sm text-slate-800 mt-1 font-medium">{log.details}</p>
                                  <div className="flex items-center mt-2 text-xs text-slate-400 space-x-3">
                                      <span className="flex items-center"><UserIcon className="w-3 h-3 mr-1" /> {log.userName}</span>
                                      <span className="font-mono bg-slate-50 px-1 rounded border border-slate-100">IP: {log.ipAddress}</span>
                                      {log.entityType && <span className="font-bold text-slate-500">{log.entityType} #{log.entityId}</span>}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};