
import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { Case, CaseStatus, FinancialRecord, Task, Hearing } from '../types';
import { Search, Plus, Filter, FileText, ArrowLeft, User, Gavel, DollarSign, Calendar, MapPin, CheckSquare, Clock, Trash2, X, HelpCircle, AlertCircle } from 'lucide-react';

export const CaseManager: React.FC = () => {
  const { cases, tasks, finance, addCase, updateCase, addTask, addFinanceRecord } = useData();
  
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
  const [newFinance, setNewFinance] = useState<Partial<FinancialRecord>>({ type: 'expense', amount: 0, description: '', date: new Date().toISOString().split('T')[0] });
  
  const [newCase, setNewCase] = useState<Partial<Case>>({ 
      caseNumber: '', title: '', clientName: '', type: 'Dava', status: CaseStatus.OPEN, description: '', assignedTo: 'Av. Burak G.' 
  });

  // Derived local lists for display
  const [caseTasks, setCaseTasks] = useState<Task[]>([]);
  const [caseFinance, setCaseFinance] = useState<FinancialRecord[]>([]);

  // Initialize active case data when selection changes or global data changes
  useEffect(() => {
    if (selectedCase) {
      const updatedCase = cases.find(c => c.id === selectedCase.id) || selectedCase;
      setActiveCaseData({...updatedCase});
      setCaseTasks(tasks.filter(t => t.caseId === updatedCase.id));
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
      case CaseStatus.OPEN: return 'bg-green-100 text-green-700 border-green-200';
      case CaseStatus.CLOSED: return 'bg-gray-100 text-gray-700 border-gray-200';
      case CaseStatus.APPEAL: return 'bg-purple-100 text-purple-700 border-purple-200';
      case CaseStatus.WAITING: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
          category: newFinance.type === 'income' ? 'Vekalet Ücreti' : 'Masraf',
          caseReference: activeCaseData.caseNumber
      };
      
      addFinanceRecord(financeToAdd);
      setIsFinanceModalOpen(false);
      setNewFinance({ type: 'expense', amount: 0, description: '', date: new Date().toISOString().split('T')[0] });
  }

  if (activeCaseData) {
    const totalExpense = caseFinance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = caseFinance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);

    return (
      <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in duration-300 relative">
        {/* Add Hearing Modal */}
        {isHearingModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-bold mb-4">Yeni Duruşma Ekle</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Tarih</label>
                            <input type="datetime-local" className="w-full border p-2 rounded" value={newHearing.date} onChange={e => setNewHearing({...newHearing, date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Tür</label>
                            <select className="w-full border p-2 rounded" value={newHearing.type} onChange={e => setNewHearing({...newHearing, type: e.target.value})}>
                                <option>Ön İnceleme</option>
                                <option>Tahkikat</option>
                                <option>Sözlü Yargılama</option>
                                <option>Karar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Açıklama</label>
                            <textarea className="w-full border p-2 rounded" rows={3} value={newHearing.description} onChange={e => setNewHearing({...newHearing, description: e.target.value})}></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setIsHearingModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">İptal</button>
                        <button onClick={handleAddHearing} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Kaydet</button>
                    </div>
                </div>
            </div>
        )}

        {/* Add Task Modal */}
        {isTaskModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-bold mb-4">Yeni Görev Ekle</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Görev Başlığı</label>
                            <input type="text" className="w-full border p-2 rounded" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Son Tarih</label>
                            <input type="date" className="w-full border p-2 rounded" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Öncelik</label>
                            <select className="w-full border p-2 rounded" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                                <option>Yüksek</option>
                                <option>Orta</option>
                                <option>Düşük</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">İptal</button>
                        <button onClick={handleAddTask} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Görev Ata</button>
                    </div>
                </div>
            </div>
        )}

        {/* Add Finance Modal */}
        {isFinanceModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-bold mb-4">Finansal İşlem Ekle</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">İşlem Türü</label>
                            <div className="flex space-x-2">
                                <button 
                                    className={`flex-1 py-2 rounded border ${newFinance.type === 'expense' ? 'bg-red-100 border-red-500 text-red-700' : 'border-slate-200 text-slate-600'}`}
                                    onClick={() => setNewFinance({...newFinance, type: 'expense'})}
                                >Gider / Masraf</button>
                                <button 
                                    className={`flex-1 py-2 rounded border ${newFinance.type === 'income' ? 'bg-green-100 border-green-500 text-green-700' : 'border-slate-200 text-slate-600'}`}
                                    onClick={() => setNewFinance({...newFinance, type: 'income'})}
                                >Gelir / Tahsilat</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Tutar (TL)</label>
                            <input type="number" className="w-full border p-2 rounded" value={newFinance.amount} onChange={e => setNewFinance({...newFinance, amount: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Açıklama</label>
                            <input type="text" className="w-full border p-2 rounded" value={newFinance.description} onChange={e => setNewFinance({...newFinance, description: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Tarih</label>
                            <input type="date" className="w-full border p-2 rounded" value={newFinance.date} onChange={e => setNewFinance({...newFinance, date: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setIsFinanceModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">İptal</button>
                        <button onClick={handleAddFinance} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Kaydet</button>
                    </div>
                </div>
            </div>
        )}

        <button 
          onClick={() => setSelectedCase(null)}
          className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Listeye Dön
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(activeCaseData.status)}`}>
                {activeCaseData.status}
              </span>
              <h1 className="text-3xl font-bold text-slate-800">{activeCaseData.caseNumber}</h1>
            </div>
            <h2 className="text-xl text-slate-600 font-medium">{activeCaseData.title}</h2>
            <p className="text-slate-500 mt-1 max-w-2xl">{activeCaseData.description}</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm">
              Dava Detaylarını Düzenle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info & Parties */}
          <div className="space-y-8">
            {/* Case Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Dosya Bilgileri
              </h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <dt className="text-slate-500">Tür</dt>
                  <dd className="font-medium text-slate-800">{activeCaseData.type}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <dt className="text-slate-500">Müvekkil</dt>
                  <dd className="font-medium text-slate-800">{activeCaseData.clientName}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <dt className="text-slate-500">Sorumlu Avukat</dt>
                  <dd className="font-medium text-slate-800">{activeCaseData.assignedTo}</dd>
                </div>
                <div className="flex justify-between pt-1">
                   <dt className="text-slate-500">Gelecek Duruşma</dt>
                   <dd className={`font-bold ${activeCaseData.nextHearingDate ? 'text-orange-600' : 'text-slate-400'}`}>
                     {activeCaseData.nextHearingDate || 'Planlanmadı'}
                   </dd>
                </div>
              </dl>
            </div>

            {/* Parties Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Taraf Bilgileri
              </h3>
              {activeCaseData.parties && activeCaseData.parties.length > 0 ? (
                <div className="space-y-4">
                  {activeCaseData.parties.map((party) => (
                    <div key={party.id} className="flex items-start p-3 bg-slate-50 rounded-lg">
                      <div className={`w-2 h-10 rounded-l mr-3 ${party.role === 'Müvekkil' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{party.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                                {party.role}
                            </span>
                            {party.tcVkn && <span className="text-xs text-slate-400">TC/VKN: {party.tcVkn}</span>}
                        </div>
                        {party.contactInfo && <p className="text-xs text-slate-500 mt-1">{party.contactInfo}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Taraf bilgisi girilmemiş.</p>
              )}
            </div>
            
             {/* Financial Summary Card */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                        Finansal Yönetim
                    </h3>
                    <button 
                        onClick={() => setIsFinanceModalOpen(true)}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-medium"
                    >
                        + İşlem Ekle
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs text-green-600 font-medium mb-1">Tahsilat</p>
                        <p className="text-lg font-bold text-green-700">{totalIncome} ₺</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs text-red-600 font-medium mb-1">Masraf</p>
                        <p className="text-lg font-bold text-red-700">{totalExpense} ₺</p>
                    </div>
                </div>

                {caseFinance.length > 0 ? (
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {caseFinance.map(f => (
                            <li key={f.id} className="flex justify-between text-sm p-2 hover:bg-slate-50 rounded border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-medium text-slate-700">{f.description}</p>
                                    <p className="text-xs text-slate-400">{f.date}</p>
                                </div>
                                <span className={`font-bold ${f.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {f.type === 'income' ? '+' : '-'}{f.amount}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-slate-400 italic text-center">Bu dosyaya ait finansal kayıt yok.</p>
                )}
            </div>
          </div>

          {/* Right Column: Hearings & Activities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hearings Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Gavel className="w-5 h-5 mr-2 text-blue-600" />
                    Duruşma ve Kararlar
                  </h3>
                  <button 
                    onClick={() => setIsHearingModalOpen(true)}
                    className="text-sm text-blue-600 hover:underline flex items-center font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Duruşma Ekle
                  </button>
               </div>
               
               {activeCaseData.hearings && activeCaseData.hearings.length > 0 ? (
                 <div className="border-l-2 border-slate-200 ml-3 space-y-8 pl-6 relative">
                    {activeCaseData.hearings.map((hearing) => (
                        <div key={hearing.id} className="relative">
                            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                <h4 className="font-bold text-slate-800">{hearing.type}</h4>
                                <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded mt-1 sm:mt-0">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {hearing.date.replace('T', ' ')}
                                </div>
                            </div>
                            {hearing.location && (
                                <div className="flex items-center text-xs text-slate-500 mb-2">
                                    <MapPin className="w-3 h-3 mr-1" /> {hearing.location}
                                </div>
                            )}
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {hearing.description}
                            </p>
                            {hearing.result && (
                                <div className="mt-2 text-sm font-medium text-green-700 flex items-center">
                                    <span className="mr-2">➔ Sonuç:</span> {hearing.result}
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500 text-sm">Henüz duruşma kaydı bulunmamaktadır.</p>
                 </div>
               )}
            </div>

            {/* Tasks / Workflow */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
                        Görevler & İş Takibi (Workflow)
                    </h3>
                    <button 
                        onClick={() => setIsTaskModalOpen(true)}
                        className="text-sm text-blue-600 hover:underline flex items-center font-medium"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Görev Ata
                    </button>
                </div>
                
                {caseTasks.length > 0 ? (
                    <ul className="space-y-2">
                        {caseTasks.map(task => (
                            <li key={task.id} className="flex items-start p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                                <div className={`mt-1 mr-3 w-4 h-4 rounded border ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                                    {task.completed && <CheckSquare className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <span className={`text-sm block ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}`}>
                                        {task.title}
                                    </span>
                                    <div className="flex items-center mt-1 gap-2">
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                            task.priority === 'Yüksek' ? 'bg-red-100 text-red-700' : 
                                            task.priority === 'Orta' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
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
                    <p className="text-sm text-slate-500 italic text-center py-4">Bu dosyaya atanmış görev bulunmuyor.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in duration-300 relative">
        {/* New Case Modal - Redesigned */}
        {isNewCaseModalOpen && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                         <div>
                             <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                <Plus className="w-6 h-6 mr-3 text-blue-600" />
                                Yeni Dava Dosyası Aç
                             </h3>
                             <p className="text-sm text-slate-500 mt-1 ml-9">UYAP uyumlu dosya kaydı oluşturun.</p>
                         </div>
                         <button onClick={() => setIsNewCaseModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-white hover:shadow-sm rounded-full transition"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Body */}
                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-5">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Temel Bilgiler</h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Dosya Numarası</label>
                                    <div className="relative">
                                        <input type="text" className="w-full border border-slate-300 pl-3 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition" placeholder="2023/123 E." value={newCase.caseNumber} onChange={e => setNewCase({...newCase, caseNumber: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Dava Türü</label>
                                    <input type="text" className="w-full border border-slate-300 pl-3 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition" placeholder="Örn: İş Hukuku" value={newCase.type} onChange={e => setNewCase({...newCase, type: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Dosya Durumu</label>
                                    <div className="relative">
                                        <select className="w-full border border-slate-300 pl-3 pr-8 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none bg-white" value={newCase.status} onChange={e => setNewCase({...newCase, status: e.target.value as CaseStatus})}>
                                            {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-5">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Dosya Detayları</h4>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Konu / Başlık</label>
                                    <input type="text" className="w-full border border-slate-300 pl-3 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition" placeholder="Davanın kısa adı" value={newCase.title} onChange={e => setNewCase({...newCase, title: e.target.value})} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Müvekkil Adı</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input type="text" className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition" placeholder="Ad Soyad" value={newCase.clientName} onChange={e => setNewCase({...newCase, clientName: e.target.value})} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Açıklama / Notlar</label>
                                    <textarea className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]" placeholder="Dosya ile ilgili kısa notlar..." value={newCase.description} onChange={e => setNewCase({...newCase, description: e.target.value})}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end gap-3">
                        <button onClick={() => setIsNewCaseModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-medium transition">İptal</button>
                        <button onClick={handleAddCase} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium shadow-lg hover:shadow-blue-600/30 transition transform active:scale-95 flex items-center">
                            <Plus className="w-4 h-4 mr-2" /> Dosyayı Oluştur
                        </button>
                    </div>
                </div>
            </div>
        )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dava Dosyaları</h1>
          <p className="text-slate-500 mt-1">Tüm aktif ve arşivlenmiş dosyalar</p>
        </div>
        <button 
            onClick={() => setIsNewCaseModalOpen(true)}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Dosya Aç
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Dosya no, müvekkil veya konu ara..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
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
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-4">Dosya No</th>
                <th className="px-6 py-4">Konu / Başlık</th>
                <th className="px-6 py-4">Müvekkil</th>
                <th className="px-6 py-4">Tür</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Duruşma</th>
                <th className="px-6 py-4 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => (
                <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCase(c)}
                >
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition">
                         <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    {c.caseNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-800">{c.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{c.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.clientName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {c.nextHearingDate ? (
                        <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">{c.nextHearingDate}</span>
                    ) : (
                        <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                      Görüntüle
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                         <Search className="w-10 h-10 mb-2 text-slate-300" />
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
