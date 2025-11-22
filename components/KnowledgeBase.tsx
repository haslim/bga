
import React, { useState } from 'react';
import { useData } from '../DataContext';
import { KnowledgeEntry, KnowledgeCategory } from '../types';
import { BookOpen, Search, Plus, Tag, Calendar, User, X, Save, Trash2, Edit3, FileText, Bookmark } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const { knowledgeBase, addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry, currentUser } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<KnowledgeEntry>>({
      title: '', category: 'İçtihat', content: '', tags: []
  });
  const [newTag, setNewTag] = useState('');

  const filteredEntries = knowledgeBase.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (entry?: KnowledgeEntry) => {
      if (entry) {
          setEditingEntry(entry);
          setFormData({ ...entry });
      } else {
          setEditingEntry(null);
          setFormData({ title: '', category: 'İçtihat', content: '', tags: [] });
      }
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (!formData.title || !formData.content) return;

      if (editingEntry) {
          updateKnowledgeEntry({ ...editingEntry, ...formData } as KnowledgeEntry);
      } else {
          const newEntry: KnowledgeEntry = {
              id: `kb-${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
              author: currentUser.name,
              ...formData as KnowledgeEntry
          };
          addKnowledgeEntry(newEntry);
      }
      setIsModalOpen(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newTag.trim()) {
          e.preventDefault();
          if (!formData.tags?.includes(newTag.trim())) {
              setFormData({ ...formData, tags: [...(formData.tags || []), newTag.trim()] });
          }
          setNewTag('');
      }
  };

  const removeTag = (tagToRemove: string) => {
      setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  const categories: KnowledgeCategory[] = ['İçtihat', 'Mevzuat', 'Dilekçe', 'Not', 'Makale'];

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen animate-in fade-in">
      
      {/* Add/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                          {editingEntry ? 'Kaydı Düzenle' : 'Yeni Bilgi Girişi'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-full transition"><X className="w-5 h-5 text-slate-500" /></button>
                  </div>
                  
                  <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Başlık</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Örn: Yargıtay 9. HD Kararı - İşe İade"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Kategori</label>
                            <select 
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value as KnowledgeCategory})}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">İçerik / Notlar</label>
                          <textarea 
                              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[300px] font-mono"
                              placeholder="Buraya metin, karar özeti veya notlarınızı girin..."
                              value={formData.content}
                              onChange={e => setFormData({...formData, content: e.target.value})}
                          ></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Etiketler</label>
                        <div className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-2 flex flex-wrap gap-2">
                            {formData.tags?.map((tag, idx) => (
                                <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium flex items-center">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-800 dark:hover:text-blue-300"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input 
                                type="text" 
                                className="flex-1 min-w-[100px] outline-none text-sm p-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                placeholder="Etiket ekle (Enter)..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                        </div>
                      </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-xl">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                      <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm flex items-center">
                          <Save className="w-4 h-4 mr-2" /> Kaydet
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Bilgi Bankası</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">İçtihatlar, dilekçeler ve kurumsal hafıza</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Kayıt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-2">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm sticky top-24">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                      <Bookmark className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      Kategoriler
                  </h3>
                  <button 
                      onClick={() => setSelectedCategory('ALL')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex justify-between items-center ${selectedCategory === 'ALL' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                      Tümü
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{knowledgeBase.length}</span>
                  </button>
                  {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex justify-between items-center ${selectedCategory === cat ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                      >
                        {cat}
                        <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{knowledgeBase.filter(k => k.category === cat).length}</span>
                      </button>
                  ))}
              </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
                  <div className="p-4 flex space-x-3">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Bilgi bankasında ara..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                  {filteredEntries.map(entry => (
                      <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition group">
                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border 
                                      ${entry.category === 'İçtihat' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800' : 
                                        entry.category === 'Dilekçe' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                                      {entry.category}
                                  </span>
                                  <span className="text-xs text-slate-400 flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" /> {entry.createdAt}
                                  </span>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => handleOpenModal(entry)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition">
                                      <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => deleteKnowledgeEntry(entry.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>

                          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">{entry.title}</h3>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 whitespace-pre-line leading-relaxed">
                              {entry.content}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                              <div className="flex gap-2">
                                  {entry.tags.map((tag, idx) => (
                                      <span key={idx} className="text-xs bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded flex items-center">
                                          <Tag className="w-3 h-3 mr-1 opacity-50" /> {tag}
                                      </span>
                                  ))}
                              </div>
                              <div className="flex items-center text-xs text-slate-400">
                                  <User className="w-3 h-3 mr-1" /> {entry.author}
                              </div>
                          </div>
                      </div>
                  ))}
                  {filteredEntries.length === 0 && (
                      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500 dark:text-slate-400">Kayıt bulunamadı.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
