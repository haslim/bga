
import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { Mediation, MediationStatus, MediationMeeting, Template, TemplateType, MediatorProfile } from '../types';
import { processTemplate } from '../utils';
import { Handshake, Plus, Search, Filter, ArrowLeft, User, Printer, Clock, Save, FileText, X, Calendar, FileSignature, Scale, MessageSquare, Settings, Edit3, CreditCard, MapPin, Mail, Phone } from 'lucide-react';

export const MediationManager: React.FC = () => {
  const { mediations, addMediation, updateMediation, templates, updateTemplate, mediatorProfile, updateMediatorProfile } = useData();
  
  const [selectedMediation, setSelectedMediation] = useState<Mediation | null>(null);
  const [activeMediationData, setActiveMediationData] = useState<Mediation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal/Form states
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [templatePreviewContent, setTemplatePreviewContent] = useState('');
  
  // Template Editing State
  const [selectedTemplateToEdit, setSelectedTemplateToEdit] = useState<Template | null>(null);
  const [editedTemplateContent, setEditedTemplateContent] = useState('');

  // Profile Editing State
  const [editedProfile, setEditedProfile] = useState<MediatorProfile>({...mediatorProfile});

  const [newMeeting, setNewMeeting] = useState<Partial<MediationMeeting>>({ date: '', participants: '', notes: '' });
  const [newApplication, setNewApplication] = useState<Partial<Mediation>>({
      clientName: '', counterParty: '', subject: '', mediatorName: '', fileNumber: ''
  });

  useEffect(() => {
    if (selectedMediation) {
        // Sync with global state in case it was updated
        const freshData = mediations.find(m => m.id === selectedMediation.id);
        setActiveMediationData(freshData || null);
    } else {
        setActiveMediationData(null);
    }
  }, [selectedMediation, mediations]);
  
  const filteredMediations = mediations.filter(m => 
    m.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.counterParty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: MediationStatus) => {
    switch(status) {
      case MediationStatus.AGREEMENT: return 'bg-green-100 text-green-700 border-green-200';
      case MediationStatus.NO_AGREEMENT: return 'bg-red-100 text-red-700 border-red-200';
      case MediationStatus.PROCESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case MediationStatus.APPLIED: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleGenerateDoc = (docType: TemplateType) => {
      if (!activeMediationData) return;
      
      // Find the current template from global state
      const template = templates.find(t => t.type === docType);
      if (!template) {
          alert('Şablon bulunamadı!');
          return;
      }

      // Pass the MediatorProfile to the processor
      const html = processTemplate(template.content, activeMediationData, mediatorProfile);
      setTemplatePreviewContent(html);
      setIsTemplateModalOpen(true);
  };

  const handlePrint = () => {
      const printWindow = window.open('', '', 'height=600,width=800');
      if(printWindow) {
          printWindow.document.write('<html><head><title>Yazdır</title></head><body>');
          printWindow.document.write(templatePreviewContent);
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
      }
  };

  // --- Profile Handlers ---
  const handleOpenProfileModal = () => {
      setEditedProfile({...mediatorProfile});
      setIsProfileModalOpen(true);
  };

  const handleSaveProfile = () => {
      updateMediatorProfile(editedProfile);
      setIsProfileModalOpen(false);
  };
  // -----------------------

  // --- Template Editor Handlers ---
  const openTemplateEditor = (type: TemplateType) => {
      const template = templates.find(t => t.type === type);
      if (template) {
          setSelectedTemplateToEdit(template);
          setEditedTemplateContent(template.content);
          setIsTemplateEditorOpen(true);
      }
  };

  const saveTemplate = () => {
      if (selectedTemplateToEdit) {
          updateTemplate({
              ...selectedTemplateToEdit,
              content: editedTemplateContent
          });
          setIsTemplateEditorOpen(false);
      }
  };
  // -------------------------------

  const handleAddMeeting = () => {
    if (!activeMediationData || !newMeeting.date || !newMeeting.notes) return;

    const meetingToAdd: MediationMeeting = {
        id: `mm-${Date.now()}`,
        date: newMeeting.date || '',
        participants: newMeeting.participants || 'Taraflar',
        notes: newMeeting.notes || '',
        outcome: 'Ertelendi' // default
    };

    const updatedMeetings = [...activeMediationData.meetings, meetingToAdd];
    const updatedMediation = { ...activeMediationData, meetings: updatedMeetings };
    
    updateMediation(updatedMediation); // Update global state
    setIsMeetingModalOpen(false);
    setNewMeeting({ date: '', participants: '', notes: '' });
  };

  const handleOpenApplicationModal = () => {
      // Auto-fill mediator name from profile
      setNewApplication({
          clientName: '', 
          counterParty: '', 
          subject: '', 
          mediatorName: mediatorProfile.name, // Auto-fill
          fileNumber: ''
      });
      setIsApplicationModalOpen(true);
  };

  const handleCreateApplication = () => {
      if (!newApplication.clientName || !newApplication.counterParty) return;
      
      const application: Mediation = {
          id: `nm-${Date.now()}`,
          fileNumber: newApplication.fileNumber || 'ARB-Yeni',
          clientName: newApplication.clientName || '',
          counterParty: newApplication.counterParty || '',
          subject: newApplication.subject || '',
          mediatorName: newApplication.mediatorName || mediatorProfile.name,
          status: MediationStatus.APPLIED,
          applicationDate: new Date().toISOString().split('T')[0],
          meetings: []
      };
      
      addMediation(application);
      setIsApplicationModalOpen(false);
  };

  return (
        <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in duration-300 relative">
            
            {/* Mediator Profile Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                             <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                                Arabulucu Profil Ayarları
                             </h3>
                             <button onClick={() => setIsProfileModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad Soyad</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="text" className="w-full border bg-white text-slate-900 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                        value={editedProfile.name} onChange={e => setEditedProfile({...editedProfile, name: e.target.value})} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sicil Numarası</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="text" className="w-full border bg-white text-slate-900 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                        value={editedProfile.registrationNumber} onChange={e => setEditedProfile({...editedProfile, registrationNumber: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">İletişim (E-Posta)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="email" className="w-full border bg-white text-slate-900 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                        value={editedProfile.email} onChange={e => setEditedProfile({...editedProfile, email: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">İletişim (Telefon)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="text" className="w-full border bg-white text-slate-900 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                        value={editedProfile.phone} onChange={e => setEditedProfile({...editedProfile, phone: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adres</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                    <textarea className="w-full border bg-white text-slate-900 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[60px]" 
                                        value={editedProfile.address} onChange={e => setEditedProfile({...editedProfile, address: e.target.value})} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IBAN (Anlaşma Belgesi İçin)</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="text" className="w-full border bg-white text-slate-900 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" 
                                        value={editedProfile.iban} onChange={e => setEditedProfile({...editedProfile, iban: e.target.value})} />
                                </div>
                            </div>
                        </div>
                         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium">İptal</button>
                            <button onClick={handleSaveProfile} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Bilgileri Güncelle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Preview Modal */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                Evrak Önizleme
                            </h3>
                            <div className="flex space-x-2">
                                <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center transition shadow-sm">
                                    <Printer className="w-4 h-4 mr-2" /> Yazdır
                                </button>
                                <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
                             <div className="bg-white shadow-lg p-10 min-h-full mx-auto" dangerouslySetInnerHTML={{ __html: templatePreviewContent }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Template Editor Modal */}
            {isTemplateEditorOpen && selectedTemplateToEdit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center text-lg">
                                    <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
                                    Şablon Düzenle: {selectedTemplateToEdit.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">HTML formatında düzenleme yapabilirsiniz. Değişkenleri süslü parantez içinde kullanın.</p>
                            </div>
                            <button onClick={() => setIsTemplateEditorOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex flex-1 overflow-hidden">
                            {/* Editor Area */}
                            <div className="flex-1 p-0 border-r border-slate-200 flex flex-col">
                                <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200">HTML Editör</div>
                                <textarea 
                                    className="flex-1 w-full h-full p-4 font-mono text-sm outline-none resize-none bg-white text-slate-800"
                                    value={editedTemplateContent}
                                    onChange={(e) => setEditedTemplateContent(e.target.value)}
                                />
                            </div>
                            
                            {/* Sidebar: Variables */}
                            <div className="w-64 bg-slate-50 p-4 overflow-y-auto">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Kullanılabilir Değişkenler</h4>
                                <div className="space-y-2">
                                    <div className="text-xs p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200" onClick={() => setEditedTemplateContent(prev => prev + '{{DOSYA_NO}}')}>
                                        <span className="font-bold text-blue-600">{'{{DOSYA_NO}}'}</span>
                                        <p className="text-slate-500 mt-1">Dosya Numarası</p>
                                    </div>
                                    <div className="text-xs p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200" onClick={() => setEditedTemplateContent(prev => prev + '{{MUVEKKIL}}')}>
                                        <span className="font-bold text-blue-600">{'{{MUVEKKIL}}'}</span>
                                        <p className="text-slate-500 mt-1">Başvurucu Adı</p>
                                    </div>
                                    <div className="text-xs p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200" onClick={() => setEditedTemplateContent(prev => prev + '{{KARSI_TARAF}}')}>
                                        <span className="font-bold text-blue-600">{'{{KARSI_TARAF}}'}</span>
                                        <p className="text-slate-500 mt-1">Karşı Taraf Adı</p>
                                    </div>
                                    <div className="text-xs p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200" onClick={() => setEditedTemplateContent(prev => prev + '{{KONU}}')}>
                                        <span className="font-bold text-blue-600">{'{{KONU}}'}</span>
                                        <p className="text-slate-500 mt-1">Uyuşmazlık Konusu</p>
                                    </div>
                                    <div className="text-xs p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200" onClick={() => setEditedTemplateContent(prev => prev + '{{ARABULUCU}}')}>
                                        <span className="font-bold text-blue-600">{'{{ARABULUCU}}'}</span>
                                        <p className="text-slate-500 mt-1">Arabulucu Adı (Profil)</p>
                                    </div>
                                    <div className="text-xs p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200" onClick={() => setEditedTemplateContent(prev => prev + '{{ARABULUCU_SICIL}}')}>
                                        <span className="font-bold text-blue-600">{'{{ARABULUCU_SICIL}}'}</span>
                                        <p className="text-slate-500 mt-1">Sicil No (Profil)</p>
                                    </div>
                                     <div className="text-xs p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200" onClick={() => setEditedTemplateContent(prev => prev + '{{BUGUN}}')}>
                                        <span className="font-bold text-blue-600">{'{{BUGUN}}'}</span>
                                        <p className="text-slate-500 mt-1">Bugünün Tarihi</p>
                                    </div>
                                    <div className="text-xs p-2 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200" onClick={() => setEditedTemplateContent(prev => prev + '{{SONUC_METNI}}')}>
                                        <span className="font-bold text-blue-600">{'{{SONUC_METNI}}'}</span>
                                        <p className="text-slate-500 mt-1">Otomatik Sonuç</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button onClick={() => setIsTemplateEditorOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition">İptal</button>
                            <button onClick={saveTemplate} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Şablonu Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Meeting Modal */}
            {isMeetingModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                             <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                Yeni Toplantı Planla
                             </h3>
                             <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Tarih & Saat</label>
                                    <div className="relative">
                                        <input type="datetime-local" className="w-full border border-slate-300 bg-white text-slate-900 pl-3 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Katılımcılar</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="text" className="w-full border border-slate-300 bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Örn: Müvekkil, Vekiller..." value={newMeeting.participants} onChange={e => setNewMeeting({...newMeeting, participants: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Toplantı Gündemi / Notlar</label>
                                <div className="relative">
                                    <textarea className="w-full border border-slate-300 bg-white text-slate-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm min-h-[100px]" placeholder="Toplantıda görüşülecek konular..." value={newMeeting.notes} onChange={e => setNewMeeting({...newMeeting, notes: e.target.value})}></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
                            <button onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition">Vazgeç</button>
                            <button onClick={handleAddMeeting} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md hover:shadow-lg transition flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View/Edit Mode */}
            {activeMediationData ? (
            <>
                <button 
                    onClick={() => setSelectedMediation(null)}
                    className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors group"
                >
                    <div className="p-1 rounded-full bg-white border border-slate-200 mr-2 group-hover:border-blue-200 shadow-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Listeye Dön</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                         <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(activeMediationData.status)}`}>
                                {activeMediationData.status}
                            </span>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{activeMediationData.fileNumber}</h1>
                        </div>
                        <p className="text-slate-600 flex items-center">
                            <Scale className="w-4 h-4 mr-1.5 text-slate-400" />
                            {activeMediationData.subject}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsMeetingModalOpen(true)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Toplantı Ekle
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        {/* Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                                <Handshake className="w-5 h-5 mr-2 text-blue-600" />
                                Başvuru Detayları
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm font-medium">Başvuru Tarihi</span>
                                    <span className="text-slate-800 font-semibold text-sm bg-slate-50 px-2 py-1 rounded">{activeMediationData.applicationDate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm font-medium">Arabulucu</span>
                                    <span className="text-slate-800 font-semibold text-sm flex items-center">
                                        <User className="w-3 h-3 mr-1 text-slate-400" />
                                        {activeMediationData.mediatorName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Parties Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                Taraf Bilgileri
                            </h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50 hover:border-green-200 transition">
                                    <span className="text-[10px] uppercase tracking-wider text-green-600 font-bold block mb-1">BAŞVURUCU (MÜVEKKİL)</span>
                                    <span className="text-slate-800 font-bold text-sm block">{activeMediationData.clientName}</span>
                                </div>
                                <div className="flex justify-center">
                                    <div className="w-px h-4 bg-slate-200"></div>
                                </div>
                                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100/50 hover:border-red-200 transition">
                                    <span className="text-[10px] uppercase tracking-wider text-red-600 font-bold block mb-1">KARŞI TARAF</span>
                                    <span className="text-slate-800 font-bold text-sm block">{activeMediationData.counterParty}</span>
                                </div>
                            </div>
                        </div>

                        {/* Document Generator */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
                             <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center">
                                <Printer className="w-5 h-5 mr-2" />
                                Otomatik Şablonlar
                            </h3>
                            <p className="text-xs text-indigo-600/80 mb-5 leading-relaxed">
                                Seçili dosya verilerini kullanarak aşağıdaki resmi evrakları tek tıkla oluşturabilirsiniz.
                            </p>
                            <div className="space-y-2.5">
                                {['Basvuru', 'Tutanak', 'Anlasma'].map((type) => (
                                    <div key={type} className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleGenerateDoc(type as TemplateType)}
                                            className="flex-1 bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:text-indigo-700 py-3 px-4 rounded-xl text-sm font-medium transition-all text-left flex items-center justify-between group"
                                        >
                                            <span className="flex items-center">
                                                <FileText className="w-4 h-4 mr-3 text-slate-400 group-hover:text-indigo-500" />
                                                {type === 'Basvuru' ? 'Başvuru Formu' : type === 'Tutanak' ? 'Son Tutanak' : 'Anlaşma Belgesi'}
                                            </span>
                                            <span className="opacity-0 group-hover:opacity-100 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Oluştur</span>
                                        </button>
                                        <button 
                                            onClick={() => openTemplateEditor(type as TemplateType)}
                                            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                                            title="Şablonu Düzenle"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Meetings Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-full">
                            <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                Süreç Zaman Çizelgesi
                            </h3>
                            
                            {activeMediationData.meetings.length > 0 ? (
                                <div className="space-y-8 relative pl-8 border-l-2 border-slate-100 ml-2">
                                    {activeMediationData.meetings.map((meeting, idx) => (
                                        <div key={meeting.id} className="relative group">
                                            <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center transition-transform group-hover:scale-110
                                                ${meeting.outcome === 'Olumlu' ? 'bg-green-500' : meeting.outcome === 'Olumsuz' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                            </div>
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-blue-200 group-hover:translate-x-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="font-bold text-slate-800 block text-lg">{meeting.date.replace('T', ' ')}</span>
                                                        <span className="text-xs text-slate-400 font-medium">Oturum #{idx + 1}</span>
                                                    </div>
                                                    {meeting.outcome && (
                                                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
                                                            meeting.outcome === 'Olumlu' ? 'bg-green-100 text-green-700' : 
                                                            meeting.outcome === 'Olumsuz' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                                                        }`}>
                                                            {meeting.outcome}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg inline-block">
                                                    <User className="w-3 h-3 mr-2 text-slate-400" />
                                                    <span className="font-semibold mr-1">Katılımcılar:</span> {meeting.participants}
                                                </div>
                                                <div className="text-sm text-slate-600 leading-relaxed pl-3 border-l-2 border-slate-200">
                                                    {meeting.notes}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                                    <Calendar className="w-12 h-12 text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">Henüz toplantı kaydı girilmemiştir.</p>
                                    <button onClick={() => setIsMeetingModalOpen(true)} className="mt-3 text-blue-600 hover:underline text-sm">İlk toplantıyı planla</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
            ) : (
                // --- LIST VIEW ---
                <>
                {/* New Application Modal - Redesigned */}
                {isApplicationModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            
                            {/* Header */}
                            <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                        <FileSignature className="w-6 h-6 mr-3 text-blue-600" />
                                        Yeni Arabuluculuk Dosyası
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 ml-9">Başvuru bilgilerini girerek süreci başlatın.</p>
                                </div>
                                <button onClick={() => setIsApplicationModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-200 hover:border-slate-300 transition"><X className="w-5 h-5" /></button>
                            </div>
                            
                            {/* Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Sol Kolon: Dosya Bilgileri */}
                                    <div className="space-y-5">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Dosya Bilgileri</h4>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dosya Numarası</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    className="w-full border border-slate-300 bg-white text-slate-900 pl-3 pr-3 py-2.5 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                                    placeholder="2025/..." 
                                                    value={newApplication.fileNumber} 
                                                    onChange={e => setNewApplication({...newApplication, fileNumber: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Uyuşmazlık Konusu</label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input type="text" className="w-full border border-slate-300 bg-white text-slate-900 pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition" placeholder="Örn: Kıdem Tazminatı" value={newApplication.subject} onChange={e => setNewApplication({...newApplication, subject: e.target.value})} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Atanan Arabulucu</label>
                                            <div className="relative">
                                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input type="text" className="w-full border border-slate-300 bg-slate-100 text-slate-600 pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition cursor-not-allowed" 
                                                    value={newApplication.mediatorName} disabled />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Profil ayarlarından otomatik çekilir.</p>
                                        </div>
                                    </div>

                                    {/* Sağ Kolon: Taraf Bilgileri */}
                                    <div className="space-y-5">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Taraf Bilgileri</h4>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Başvurucu (Müvekkil)</label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 w-4 h-4 transition" />
                                                <input type="text" className="w-full border border-slate-300 bg-white text-slate-900 pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm transition" placeholder="Müvekkil Seç veya Yaz" value={newApplication.clientName} onChange={e => setNewApplication({...newApplication, clientName: e.target.value})} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Karşı Taraf</label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 w-4 h-4 transition" />
                                                <input type="text" className="w-full border border-slate-300 bg-white text-slate-900 pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition" placeholder="Karşı Taraf Adı Soyadı" value={newApplication.counterParty} onChange={e => setNewApplication({...newApplication, counterParty: e.target.value})} />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                                            <p className="text-xs text-blue-800 leading-relaxed">
                                                <span className="font-bold">Bilgi:</span> Yeni başvuru oluşturulduğunda durum otomatik olarak <span className="font-bold">"Başvuru"</span> statüsüne geçecektir.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end gap-3">
                                <button onClick={() => setIsApplicationModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-medium transition">Vazgeç</button>
                                <button onClick={handleCreateApplication} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium shadow-lg hover:shadow-blue-600/30 transition transform active:scale-95 flex items-center">
                                    <Plus className="w-4 h-4 mr-2" /> Başvuruyu Oluştur
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                    <div>
                    <h1 className="text-3xl font-bold text-slate-800">Arabuluculuk Dosyaları</h1>
                    <p className="text-slate-500 mt-1">Başvuru, süreç ve anlaşma takibi</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleOpenProfileModal}
                            className="mt-4 sm:mt-0 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-medium flex items-center transition-all"
                        >
                            <Settings className="w-5 h-5 mr-2 text-slate-500" />
                            Arabulucu Ayarları
                        </button>
                        <button 
                            onClick={handleOpenApplicationModal}
                            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                        >
                        <Plus className="w-5 h-5 mr-2" />
                        Yeni Başvuru
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                            type="text"
                            placeholder="Arabuluculuk no, taraf ismi..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 flex items-center font-medium text-sm transition">
                            <Filter className="w-4 h-4 mr-2" /> Filtrele
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                                    <th className="px-6 py-4">Dosya No</th>
                                    <th className="px-6 py-4">Konu</th>
                                    <th className="px-6 py-4">Müvekkil</th>
                                    <th className="px-6 py-4">Karşı Taraf</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4">Başvuru Tar.</th>
                                    <th className="px-6 py-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMediations.map(m => (
                                    <tr 
                                        key={m.id} 
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedMediation(m)}
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-700 flex items-center">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition">
                                                <Handshake className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                            </div>
                                            {m.fileNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{m.subject}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{m.clientName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{m.counterParty}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(m.status)}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{m.applicationDate}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                                                Yönet
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMediations.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                    <Search className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-medium">Aradığınız kriterlere uygun kayıt bulunamadı.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};
