
import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { User, UserRole } from '../types';
import { Shield, User as UserIcon, Plus, Trash2, Edit2, Save, X, Activity, Clock, Search, Lock, RefreshCw, Image as ImageIcon, Flag } from 'lucide-react';

interface UserManagerProps {
  isEmbedded?: boolean;
}

export const UserManager: React.FC<UserManagerProps> = ({ isEmbedded = false }) => {
  const { users, auditLogs, currentUser, addUser, updateUser, deleteUser, hasPermission, siteSettings } = useData();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Helper to determine default avatar
  const getDefaultAvatar = () => {
    if (siteSettings.logoUrl && siteSettings.logoUrl.trim().length > 0) {
        return siteSettings.logoUrl;
    }
    return 'https://flagcdn.com/w320/tr.png';
  };

  // User Form State
  const [formData, setFormData] = useState<Partial<User>>({
      name: '', email: '', role: UserRole.INTERN, password: '', avatarUrl: ''
  });

  if (!hasPermission('USER_MANAGE')) {
      if (isEmbedded) return null; // Return null if embedded to avoid showing error screen inside settings
      return (
          <div className="p-8 flex flex-col items-center justify-center h-screen text-slate-500 dark:text-slate-400">
              <Shield className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h2 className="text-xl font-bold">Erişim Reddedildi</h2>
              <p>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
          </div>
      );
  }

  const handleOpenModal = (user?: User) => {
      if (user) {
          setEditingUser(user);
          // Şifre alanını boş getir, böylece kullanıcı sadece değiştirmek isterse yazar
          setFormData({ ...user, password: '' });
      } else {
          setEditingUser(null);
          setFormData({ 
              name: '', 
              email: '', 
              role: UserRole.INTERN, 
              password: '',
              avatarUrl: getDefaultAvatar()
          });
      }
      setIsModalOpen(true);
  };

  const handleSaveUser = () => {
      if (!formData.name || !formData.email) return;

      if (editingUser) {
          // Eğer şifre alanı boş bırakıldıysa eski şifreyi koru, doluysa güncelle
          const updatedUser: User = {
              ...editingUser,
              ...formData as User,
              password: formData.password && formData.password.trim() !== '' ? formData.password : editingUser.password
          };
          updateUser(updatedUser);
      } else {
          const newUser: User = {
              id: `u-${Date.now()}`,
              avatarUrl: formData.avatarUrl || getDefaultAvatar(),
              lastLogin: '-',
              ipAddress: '-',
              ...formData as User,
              // Yeni kullanıcıda şifre girilmezse varsayılan ata
              password: formData.password || '123456'
          };
          addUser(newUser);
      }
      setIsModalOpen(false);
  };

  const generateAvatar = () => {
      if (formData.name) {
          const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&size=200`;
          setFormData({...formData, avatarUrl: url});
      }
  };

  const setAvatarToDefault = () => {
      setFormData({...formData, avatarUrl: getDefaultAvatar()});
  };

  return (
    <div className={isEmbedded ? "animate-in fade-in" : "p-8 bg-gray-50 dark:bg-slate-900 min-h-screen animate-in fade-in"}>
      
      {/* User Edit/Add Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 dark:text-white">{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h3>
                      <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                      
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center mb-4">
                          <div className="relative group">
                              <img 
                                src={formData.avatarUrl || getDefaultAvatar()} 
                                alt="Avatar" 
                                className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 shadow-sm object-cover bg-white dark:bg-slate-700"
                                onError={(e) => { (e.target as HTMLImageElement).src = getDefaultAvatar() }}
                              />
                          </div>
                          <div className="flex gap-2 mt-3">
                              <button 
                                type="button"
                                onClick={generateAvatar}
                                className="text-xs flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition border border-slate-200 dark:border-slate-600"
                                title="İsimden Otomatik Oluştur"
                              >
                                  <RefreshCw className="w-3 h-3 mr-1" /> Oto. Oluştur
                              </button>
                              <button 
                                type="button"
                                onClick={setAvatarToDefault}
                                className="text-xs flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition border border-slate-200 dark:border-slate-600"
                                title="Varsayılan (Logo veya Bayrak)"
                              >
                                  <Flag className="w-3 h-3 mr-1" /> Varsayılan
                              </button>
                          </div>
                          
                          <div className="w-full mt-3">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 text-center">Veya Resim URL'i Girin</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg pl-8 pr-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                    value={formData.avatarUrl}
                                    onChange={e => setFormData({...formData, avatarUrl: e.target.value})}
                                />
                            </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Ad Soyad</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">E-Posta</label>
                          <input 
                            type="email" 
                            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                              {editingUser ? 'Yeni Şifre (Değişmeyecekse boş bırakın)' : 'Şifre'}
                          </label>
                          <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={editingUser ? "******" : "Şifre belirleyin"}
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                              />
                          </div>
                          {!editingUser && !formData.password && (
                              <p className="text-[10px] text-slate-400 mt-1">Boş bırakılırsa varsayılan: 123456</p>
                          )}
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Rol / Yetki</label>
                          <select 
                            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                          >
                              {Object.values(UserRole).map(role => (
                                  <option key={role} value={role}>{role}</option>
                              ))}
                          </select>
                      </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                      <button onClick={handleSaveUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center">
                          <Save className="w-4 h-4 mr-2" /> Kaydet
                      </button>
                  </div>
              </div>
          </div>
      )}

      {!isEmbedded && (
        <header className="mb-8 flex justify-between items-center">
            <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Kullanıcı Yönetimi</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Personel yetkilendirme ve sistem logları</p>
            </div>
        </header>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
              Kullanıcı Listesi
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${activeTab === 'logs' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
              Sistem Logları (Audit)
          </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Aktif Personel</h3>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> Yeni Kullanıcı
                </button>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    <tr>
                        <th className="px-6 py-4">Kullanıcı</th>
                        <th className="px-6 py-4">E-Posta</th>
                        <th className="px-6 py-4">Rol</th>
                        <th className="px-6 py-4">Son Giriş</th>
                        <th className="px-6 py-4">IP Adresi</th>
                        <th className="px-6 py-4 text-right">İşlem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                            <td className="px-6 py-4 flex items-center">
                                <img 
                                    src={user.avatarUrl || getDefaultAvatar()} 
                                    alt="" 
                                    className="w-8 h-8 rounded-full mr-3 border border-slate-200 dark:border-slate-600 object-cover bg-white dark:bg-slate-700"
                                    onError={(e) => { (e.target as HTMLImageElement).src = getDefaultAvatar() }}
                                />
                                <span className="font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                                    ${user.role === UserRole.ADMIN ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                                      user.role === UserRole.LAWYER ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{user.lastLogin || '-'}</td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-mono">{user.ipAddress || '-'}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    <button onClick={() => handleOpenModal(user)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    {user.id !== currentUser.id && (
                                        <button onClick={() => deleteUser(user.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-between items-center">
                 <div className="flex items-center">
                    <Activity className="w-5 h-5 text-slate-400 mr-2" />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Sistem Hareket Dökümü (Audit Log)</h3>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Loglarda ara..." className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                      {auditLogs.map((log, idx) => (
                          <div key={log.id} className="flex items-start space-x-4 relative pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
                              <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 z-10">
                                      {log.userName.charAt(0)}
                                  </div>
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded uppercase">{log.action}</span>
                                      <div className="flex items-center text-xs text-slate-400">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {new Date(log.timestamp).toLocaleString('tr-TR')}
                                      </div>
                                  </div>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium">{log.details}</p>
                                  <div className="flex items-center mt-2 text-xs text-slate-400 space-x-3">
                                      <span className="flex items-center"><UserIcon className="w-3 h-3 mr-1" /> {log.userName}</span>
                                      <span className="font-mono bg-slate-50 dark:bg-slate-700 px-1 rounded border border-slate-100 dark:border-slate-600">IP: {log.ipAddress}</span>
                                      {log.entityType && <span className="font-bold text-slate-500 dark:text-slate-400">{log.entityType} #{log.entityId}</span>}
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
