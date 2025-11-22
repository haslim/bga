
import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { Case, CaseStatus, FinancialRecord, Task, Hearing, LegalDeadline } from '../types';
import { Search, Plus, Filter, FileText, ArrowLeft, User, Gavel, DollarSign, Calendar, MapPin, CheckSquare, Clock, Trash2, X, HelpCircle, AlertCircle, TrendingUp, TrendingDown, AlarmClock } from 'lucide-react';

export const CaseManager: React.FC = () => {
  const { cases, tasks, finance, addCase, updateCase, deleteCase, addTask, addFinanceRecord, deadlineTemplates } = useData();
  
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [activeCaseData, setActiveCaseData] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modal states
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  
  // Form states
  const [newHearing, setNewHearing] = useState<Partial<Hearing>>({ date: '', type: 'Duruşma', description: '' });
  const [newTask, setNewTask] = useState<Partial<Task>>({ title: '', priority: 'Orta', dueDate: '' });
  const [newFinance, setNewFinance] = useState<Partial<FinancialRecord>>({ 
    type: 'expense', 
    amount: 0, 
    description: '', 
    category: 'Gider Avansı',
    date: new Date().toISOString().split('T')[0] 
  });
  
  const [newCase, setNewCase] = useState<Partial<Case>>({ 
      caseNumber: '', title: '', clientName: '', type: 'Dava', status: CaseStatus.OPEN, description: '', assignedTo: 'Av. Burak G.' 
  });

  // Deadline Form State
  const [deadlineTriggerDate, setDeadlineTriggerDate] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customDeadlineName, setCustomDeadlineName] = useState('');
  const [customDeadlineDays, setCustomDeadlineDays] = useState(7);
  const [isCustomDeadline, setIsCustomDeadline] = useState(false);


  // Derived local lists for display
  const [caseTasks, setCaseTasks] = useState<Task[]>([]);
  const [caseFinance, setCaseFinance] = useState<FinancialRecord[]>([]);

  // Initialize active case data when selection changes or global data changes
  useEffect(() => {
    if (selectedCase) {
      const updatedCase = cases.find(c => c.id === selectedCase.id) || selectedCase;
      setActiveCaseData({...updatedCase});
      setCaseTasks(tasks.filter(t => t.caseId === updatedCase.id));
      // Filter finance records by case number
      setCaseFinance(finance.filter(f => f.caseReference === updatedCase.caseNumber));
    } else {
      setActiveCaseData(null);
    }
  }, [selectedCase, cases, tasks, finance]);

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: CaseStatus) => {
    switch(status) {
      case CaseStatus.OPEN: return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case CaseStatus.CLOSED: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      case CaseStatus.APPEAL: return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case CaseStatus.WAITING: return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const inputClass = "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  const handleAddCase = () => {
      if(!newCase.caseNumber || !newCase.title) return;
      
      const caseToAdd: Case = {
          id: `c-${Date.now()}`,
          caseNumber: newCase.caseNumber || '',
          title: newCase.title || '',
          clientName: newCase.clientName || 'Bilinmeyen',
          type: newCase.type || 'Genel',
          status: newCase.status || CaseStatus.OPEN,
          description: newCase.description || '',
          assignedTo: newCase.assignedTo || 'Ben',
          parties: [],
          hearings: []
      };
      
      addCase(caseToAdd);
      setIsNewCaseModalOpen(false);
      setNewCase({ caseNumber: '', title: '', clientName: '', type: 'Dava', status: CaseStatus.OPEN, description: '', assignedTo: 'Av. Burak G.' });
  }

  const handleDeleteCase = (id: string, event?: React.MouseEvent) => {
    if(event) event.stopPropagation();
    if (window.confirm('Bu dava dosyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        deleteCase(id);
        if (selectedCase && selectedCase.id === id) {
            setSelectedCase(null);
        }
    }
  };

  const handleAddHearing = () => {
      if (!activeCaseData || !newHearing.date || !newHearing.type) return;
      
      const hearingToAdd: Hearing = {
          id: `h-${Date.now()}`,
          date: newHearing.date || '',
          type: newHearing.type || '',
          description: newHearing.description || '',
          location: newHearing.location || 'Mahkeme Kalemi'
      };

      const updatedHearings = [...(activeCaseData.hearings || []), hearingToAdd];
      const updatedCase = { ...activeCaseData, hearings: updatedHearings, nextHearingDate: hearingToAdd.date.split('T')[0] };
      
      updateCase(updatedCase);
      setIsHearingModalOpen(false);
      setNewHearing({ date: '', type: 'Duruşma', description: '' });
  };

  const handleAddTask = () => {
    if (!activeCaseData || !newTask.title) return;
    
    const taskToAdd: Task = {
        id: `nt-${Date.now()}`,
        title: newTask.title || '',
        dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
        priority: (newTask.priority as 'Yüksek' | 'Orta' | 'Düşük') || 'Orta',
        completed: false,
        assignedTo: 'Ben',
        caseId: activeCaseData.id
    };

    addTask(taskToAdd);
    setIsTaskModalOpen(false);
    setNewTask({ title: '', priority: 'Orta', dueDate: '' });
  };

  const handleAddFinance = () => {
      if (!activeCaseData || !newFinance.amount || !newFinance.description) return;
      
      const financeToAdd: FinancialRecord = {
          id: `nf-${Date.now()}`,
          type: newFinance.type as 'income' | 'expense',
          amount: Number(newFinance.amount),
          description: newFinance.description || '',
          date: newFinance.date || '',
          category: newFinance.category || (newFinance.type === 'income' ? 'Vekalet Ücreti' : 'Masraf'),
          caseReference: activeCaseData.caseNumber // Automatically link to current case
      };
      
      addFinanceRecord(financeToAdd);
      setIsFinanceModalOpen(false);
      setNewFinance({ type: 'expense', amount: 0, description: '', category: 'Gider Avansı', date: new Date().toISOString().split('T')[0] });
  };

  // LEGAL DEADLINE LOGIC
  const handleAddDeadline = () => {
      if (!activeCaseData || !deadlineTriggerDate) return;

      let title = '';
      let days = 0;

      if (isCustomDeadline) {
          title = customDeadlineName;
          days = customDeadlineDays;
      } else {
          const template = deadlineTemplates.find(t => t.id === selectedTemplateId);
          if (!template) return;
          title = template.name;
          days = template.days;
      }

      if (!title) return;

      const trigger = new Date(deadlineTriggerDate);
      const due = new Date(trigger);
      due.setDate(trigger.getDate() + days);
      const dueDateStr = due.toISOString().split('T')[0];

      const newDeadline: LegalDeadline = {
          id: `ld-${Date.now()}`,
          title: title,
          triggerDate: deadlineTriggerDate,
          dueDate: dueDateStr,
          isCompleted: false,
          description: `${days} Günlük Yasal Süre`
      };

      const updatedDeadlines = [...(activeCaseData.deadlines || []), newDeadline];
      updateCase({ ...activeCaseData, deadlines: updatedDeadlines });
      
      // Reset form
      setDeadlineTriggerDate('');
      setSelectedTemplateId('');
      setCustomDeadlineName('');
      setIsCustomDeadline(false);
  };

  const handleCompleteDeadline = (deadlineId: string) => {
      if (!activeCaseData) return;
      const updatedDeadlines = activeCaseData.deadlines?.map(d => 
          d.id === deadlineId ? { ...d, isCompleted: !d.isCompleted } : d
      );
      updateCase({ ...activeCaseData, deadlines: updatedDeadlines });
  };

  const handleDeleteDeadline = (deadlineId: string) => {
      if (!activeCaseData) return;
      if(window.confirm('Bu süreyi silmek istediğinizden emin misiniz?')) {
        const updatedDeadlines = activeCaseData.deadlines?.filter(d => d.id !== deadlineId);
        updateCase({ ...activeCaseData, deadlines: updatedDeadlines });
      }
  };

  if (activeCaseData) {
    const totalExpense = caseFinance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = caseFinance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const netBalance = totalIncome - totalExpense;

    return (
      <div className="p-4 md:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen animate-in fade-in duration-300 relative">
        {/* Add Hearing Modal */}
        {isHearingModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Yeni Duruşma Ekle</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
                            <input type="datetime-local" className={inputClass} value={newHearing.date} onChange={e => setNewHearing({...newHearing, date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tür</label>
                            <select className={inputClass} value={newHearing.type} onChange={e => setNewHearing({...newHearing, type: e.target.value})}>
                                <option>Ön İnceleme</option>
                                <option>Tahkikat</option>
                                <option>Sözlü Yargılama</option>
                                <option>Karar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Açıklama</label>
                            <textarea className={inputClass} rows={3} value={newHearing.description} onChange={e => setNewHearing({...newHearing, description: e.target.value})}></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setIsHearingModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">İptal</button>
                        <button onClick={handleAddHearing} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Kaydet</button>
                    </div>
                </div>
            </div>
        )}

        {/* Add Task Modal */}
        {isTaskModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Yeni Görev Ekle</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Görev Başlığı</label>
                            <input type="text" className={inputClass} value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Son Tarih</label>
                            <input type="date" className={inputClass} value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Öncelik</label>
                            <select className={inputClass} value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                                <option>Yüksek</option>
                                <option>Orta</option>
                                <option>Düşük</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">İptal</button>
                        <button onClick={handleAddTask} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Görev Ata</button>
                    </div>
                </div>
            </div>
        )}

        {/* Add Finance Modal */}
        {isFinanceModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center text-slate-800 dark:text-white">
                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                        Finansal İşlem Ekle
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Dosya No</label>
                            <input type="text" disabled className="w-full border p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" value={activeCaseData.caseNumber} />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">İşlem Türü</label>
                            <div className="flex space-x-2">
                                <button 
                                    className={`flex-1 py-2 rounded border font-medium transition ${newFinance.type === 'expense' ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                                    onClick={() => setNewFinance({...newFinance, type: 'expense', category: 'Gider Avansı'})}
                                >
                                    Gider / Masraf
                                </button>
                                <button 
                                    className={`flex-1 py-2 rounded border font-medium transition ${newFinance.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                                    onClick={() => setNewFinance({...newFinance, type: 'income', category: 'Vekalet Ücreti'})}
                                >
                                    Gelir / Tahsilat
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
                            <select 
                                className={inputClass}
                                value={newFinance.category} 
                                onChange={e => setNewFinance({...newFinance, category: e.target.value})}
                            >
                                {newFinance.type === 'expense' ? (
                                    <>
                                        <option>Gider Avansı</option>
                                        <option>Başvurma Harcı</option>
                                        <option>Peşin Harç</option>
                                        <option>Vekalet Harcı</option>
                                        <option>Bilirkişi Ücreti</option>
                                        <option>Tebligat Gideri</option>
                                        <option>Yol Gideri</option>
                                        <option>Ofis Masrafı</option>
                                        <option>Diğer Masraf</option>
                                    </>
                                ) : (
                                    <>
                                        <option>Vekalet Ücreti</option>
                                        <option>Danışmanlık</option>
                                        <option>Masraf İadesi</option>
                                        <option>İcra Tahsilatı</option>
                                        <option>Diğer Gelir</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tutar (TL)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className={`${inputClass} pl-8`}
                                    value={newFinance.amount} 
                                    onChange={e => setNewFinance({...newFinance, amount: Number(e.target.value)})} 
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₺</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Açıklama</label>
                            <input type="text" className={inputClass} value={newFinance.description} onChange={e => setNewFinance({...newFinance, description: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
                            <input type="date" className={inputClass} value={newFinance.date} onChange={e => setNewFinance({...newFinance, date: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setIsFinanceModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">İptal</button>
                        <button onClick={handleAddFinance} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Kaydet</button>
                    </div>
                </div>
            </div>
        )}

        <button 
          onClick={() => setSelectedCase(null)}
          className="flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Listeye Dön
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold border ${getStatusColor(activeCaseData.status)}`}>
                {activeCaseData.status}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white break-all">{activeCaseData.caseNumber}</h1>
            </div>
            <h2 className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium">{activeCaseData.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl text-sm md:text-base">{activeCaseData.description}</p>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={() => handleDeleteCase(activeCaseData.id)} 
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 shadow-sm text-sm md:text-base flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Dosyayı Sil
            </button>
            <button className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm text-sm md:text-base">
              Dava Detaylarını Düzenle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Info & Parties & DEADLINES */}
          <div className="space-y-6 md:space-y-8">
            
            {/* LEGAL DEADLINE TRACKING */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900 p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center relative z-10">
                    <AlarmClock className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                    Yasal Süre Takibi
                </h3>
                
                <div className="space-y-3 mb-4 relative z-10">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tebliğ Tarihi</label>
                        <input 
                            type="date" 
                            className="w-full border border-slate-200 dark:border-slate-600 rounded p-1.5 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-red-500" 
                            value={deadlineTriggerDate}
                            onChange={e => setDeadlineTriggerDate(e.target.value)}
                        />
                    </div>
                    
                    {isCustomDeadline ? (
                         <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Süre Adı</label>
                                <input type="text" className="w-full border border-slate-200 dark:border-slate-600 rounded p-1.5 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={customDeadlineName} onChange={e => setCustomDeadlineName(e.target.value)} placeholder="Örn: Ek Süre" />
                            </div>
                             <div className="w-20">
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Gün</label>
                                <input type="number" className="w-full border border-slate-200 dark:border-slate-600 rounded p-1.5 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={customDeadlineDays} onChange={e => setCustomDeadlineDays(Number(e.target.value))} />
                            </div>
                         </div>
                    ) : (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Şablon Seçin</label>
                            <select 
                                className="w-full border border-slate-200 dark:border-slate-600 rounded p-1.5 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-red-500"
                                value={selectedTemplateId}
                                onChange={e => setSelectedTemplateId(e.target.value)}
                            >
                                <option value="">Seçiniz...</option>
                                {deadlineTemplates.map(dt => (
                                    <option key={dt.id} value={dt.id}>{dt.name} ({dt.days} Gün)</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                         <button 
                            onClick={() => setIsCustomDeadline(!isCustomDeadline)}
                            className="text-xs text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                         >
                             {isCustomDeadline ? 'Şablon Listesine Dön' : 'Manuel Giriş Yap'}
                         </button>
                         <button 
                            onClick={handleAddDeadline}
                            disabled={!deadlineTriggerDate || (!isCustomDeadline && !selectedTemplateId) || (isCustomDeadline && !customDeadlineName)}
                            className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition"
                         >
                             Hesapla & Ekle
                         </button>
                    </div>
                </div>

                {/* List of Deadlines */}
                {activeCaseData.deadlines && activeCaseData.deadlines.length > 0 ? (
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 relative z-10">
                        {activeCaseData.deadlines.map(dl => {
                            const today = new Date();
                            const due = new Date(dl.dueDate);
                            const diffTime = due.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                            
                            return (
                                <div key={dl.id} className={`p-2.5 rounded-lg border flex flex-col ${dl.isCompleted ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 opacity-60' : 'bg-white dark:bg-slate-700 border-red-100 dark:border-red-900 hover:border-red-300 dark:hover:border-red-700'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold ${dl.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{dl.title}</span>
                                        {!dl.isCompleted && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${diffDays <= 3 ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                                                {diffDays > 0 ? `${diffDays} Gün Kaldı` : 'SÜRESİ DOLDU'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                            Son Gün: <span className="font-semibold">{dl.dueDate}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                             <button onClick={() => handleCompleteDeadline(dl.id)} className={`p-1 rounded transition ${dl.isCompleted ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 'text-slate-400 hover:text-green-600'}`} title="Tamamlandı İşaretle">
                                                 <CheckSquare className="w-3.5 h-3.5" />
                                             </button>
                                             <button onClick={() => handleDeleteDeadline(dl.id)} className="p-1 rounded text-slate-400 hover:text-red-600 transition" title="Sil">
                                                 <Trash2 className="w-3.5 h-3.5" />
                                             </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 italic text-center mt-2">Aktif süre takibi yok.</p>
                )}
            </div>

            {/* Case Details Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Dosya Bilgileri
              </h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">Tür</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{activeCaseData.type}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">Müvekkil</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{activeCaseData.clientName}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">Sorumlu Avukat</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{activeCaseData.assignedTo}</dd>
                </div>
                <div className="flex justify-between pt-1">
                   <dt className="text-slate-500 dark:text-slate-400">Gelecek Duruşma</dt>
                   <dd className={`font-bold ${activeCaseData.nextHearingDate ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`}>
                     {activeCaseData.nextHearingDate || 'Planlanmadı'}
                   </dd>
                </div>
              </dl>
            </div>

            {/* Parties Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Taraf Bilgileri
              </h3>
              {activeCaseData.parties && activeCaseData.parties.length > 0 ? (
                <div className="space-y-4">
                  {activeCaseData.parties.map((party) => (
                    <div key={party.id} className="flex items-start p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className={`w-2 h-10 rounded-l mr-3 ${party.role === 'Müvekkil' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{party.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded text-slate-500 dark:text-slate-300">
                                {party.role}
                            </span>
                            {party.tcVkn && <span className="text-xs text-slate-400">TC/VKN: {party.tcVkn}</span>}
                        </div>
                        {party.contactInfo && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{party.contactInfo}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Taraf bilgisi girilmemiş.</p>
              )}
            </div>
            
             {/* Financial Summary Card */}
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Finansal Yönetim
                    </h3>
                    <button 
                        onClick={() => setIsFinanceModalOpen(true)}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium flex items-center shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-1" /> İşlem Ekle
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                    <div className="p-2 md:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Tahsilat</p>
                        <p className="text-sm md:text-lg font-bold text-green-700 dark:text-green-300">{totalIncome.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <div className="p-2 md:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Masraf</p>
                        <p className="text-sm md:text-lg font-bold text-red-700 dark:text-red-300">{totalExpense.toLocaleString('tr-TR')} ₺</p>
                    </div>
                     <div className={`p-2 md:p-3 rounded-lg border ${netBalance >= 0 ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900'}`}>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Net Bakiye</p>
                        <p className={`text-sm md:text-lg font-bold ${netBalance >= 0 ? 'text-slate-700 dark:text-slate-200' : 'text-orange-700 dark:text-orange-300'}`}>{netBalance.toLocaleString('tr-TR')} ₺</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Son İşlemler</h4>
                    {caseFinance.length > 0 ? (
                        <ul className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                            {caseFinance.map(f => (
                                <li key={f.id} className="flex items-start justify-between text-sm p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600 hover:border-blue-100 dark:hover:border-blue-900 transition">
                                    <div className="flex items-start space-x-3 overflow-hidden">
                                        <div className={`mt-1 p-1.5 rounded-full shrink-0 ${f.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {f.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-700 dark:text-slate-200 text-xs truncate">{f.category}</p>
                                            <p className="text-slate-600 dark:text-slate-300 text-xs truncate">{f.description}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{f.date}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-xs md:text-sm ml-2 shrink-0 ${f.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {f.type === 'income' ? '+' : '-'}{f.amount.toLocaleString('tr-TR')} ₺
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-slate-400 italic text-center py-4">Bu dosyaya ait finansal kayıt bulunmuyor.</p>
                    )}
                </div>
            </div>
          </div>

          {/* Right Column: Hearings & Activities */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Hearings Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                    <Gavel className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Duruşma ve Kararlar
                  </h3>
                  <button 
                    onClick={() => setIsHearingModalOpen(true)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Duruşma Ekle
                  </button>
               </div>
               
               {activeCaseData.hearings && activeCaseData.hearings.length > 0 ? (
                 <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 pl-6 relative">
                    {activeCaseData.hearings.map((hearing) => (
                        <div key={hearing.id} className="relative">
                            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-slate-800 shadow-sm"></div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                <h4 className="font-bold text-slate-800 dark:text-white">{hearing.type}</h4>
                                <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mt-1 sm:mt-0 w-fit">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {hearing.date.replace('T', ' ')}
                                </div>
                            </div>
                            {hearing.location && (
                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                                    <MapPin className="w-3 h-3 mr-1" /> {hearing.location}
                                </div>
                            )}
                            <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                {hearing.description}
                            </p>
                            {hearing.result && (
                                <div className="mt-2 text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
                                    <span className="mr-2">➔ Sonuç:</span> {hearing.result}
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Henüz duruşma kaydı bulunmamaktadır.</p>
                 </div>
               )}
            </div>

            {/* Tasks / Workflow */}
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Görevler & İş Takibi
                    </h3>
                    <button 
                        onClick={() => setIsTaskModalOpen(true)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center font-medium"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Görev Ata
                    </button>
                </div>
                
                {caseTasks.length > 0 ? (
                    <ul className="space-y-2">
                        {caseTasks.map(task => (
                            <li key={task.id} className="flex items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all">
                                <div className={`mt-1 mr-3 w-4 h-4 rounded border shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-500'}`}>
                                    {task.completed && <CheckSquare className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={`text-sm block truncate ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                                        {task.title}
                                    </span>
                                    <div className="flex items-center mt-1 gap-2 flex-wrap">
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                            task.priority === 'Yüksek' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                            task.priority === 'Orta' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> {task.dueDate}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {task.assignedTo}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">Bu dosyaya atanmış görev bulunmuyor.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen animate-in fade-in duration-300 relative">
        {/* New Case Modal - Redesigned */}
        {isNewCaseModalOpen && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 md:px-8 py-4 md:py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                         <div>
                             <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center">
                                <Plus className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-blue-600 dark:text-blue-400" />
                                Yeni Dava Dosyası Aç
                             </h3>
                             <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 ml-8 md:ml-9">UYAP uyumlu dosya kaydı oluşturun.</p>
                         </div>
                         <button onClick={() => setIsNewCaseModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-full transition"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-5">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Temel Bilgiler</h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dosya Numarası</label>
                                    <div className="relative">
                                        <input type="text" className={inputClass} placeholder="2025/123 E." value={newCase.caseNumber} onChange={e => setNewCase({...newCase, caseNumber: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dava Türü</label>
                                    <input type="text" className={inputClass} placeholder="Örn: İş Hukuku" value={newCase.type} onChange={e => setNewCase({...newCase, type: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dosya Durumu</label>
                                    <div className="relative">
                                        <select className={inputClass} value={newCase.status} onChange={e => setNewCase({...newCase, status: e.target.value as CaseStatus})}>
                                            {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-5">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Dosya Detayları</h4>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Konu / Başlık</label>
                                    <input type="text" className={inputClass} placeholder="Davanın kısa adı" value={newCase.title} onChange={e => setNewCase({...newCase, title: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Müvekkil Adı</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="text" className={`${inputClass} pl-10`} placeholder="Ad Soyad" value={newCase.clientName} onChange={e => setNewCase({...newCase, clientName: e.target.value})} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Açıklama / Notlar</label>
                                    <textarea className={inputClass} placeholder="Dosya ile ilgili kısa notlar..." value={newCase.description} onChange={e => setNewCase({...newCase, description: e.target.value})}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 md:px-8 py-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button onClick={() => setIsNewCaseModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition">İptal</button>
                        <button onClick={handleAddCase} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium shadow-lg hover:shadow-blue-600/30 transition transform active:scale-95 flex items-center">
                            <Plus className="w-4 h-4 mr-2" /> Dosyayı Oluştur
                        </button>
                    </div>
                </div>
            </div>
        )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Dava Dosyaları</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tüm aktif ve arşivlenmiş dosyalar</p>
        </div>
        <button 
            onClick={() => setIsNewCaseModalOpen(true)}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Dosya Aç
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Dosya no, müvekkil veya konu ara..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-800"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.values(CaseStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-4 whitespace-nowrap">Dosya No</th>
                <th className="px-6 py-4 whitespace-nowrap">Konu / Başlık</th>
                <th className="px-6 py-4 whitespace-nowrap">Müvekkil</th>
                <th className="px-6 py-4 whitespace-nowrap">Tür</th>
                <th className="px-6 py-4 whitespace-nowrap">Durum</th>
                <th className="px-6 py-4 whitespace-nowrap">Duruşma</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredCases.map((c) => (
                <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCase(c)}
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition">
                            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </div>
                        {c.caseNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{c.title}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px]">{c.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{c.clientName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{c.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {c.nextHearingDate ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">{c.nextHearingDate}</span>
                    ) : (
                        <span className="text-slate-400 dark:text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                        <button 
                            onClick={(e) => handleDeleteCase(c.id, e)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                            title="Sil"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-bold bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition">
                        Görüntüle
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center">
                         <Search className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" />
                         Kayıt bulunamadı.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
