
import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Case, Task } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Gavel, CheckSquare, Plus, X, Save, Clock, AlertCircle, MapPin, Trash2 } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  cases: Case[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, cases }) => {
  const { addTask, toggleTaskComplete } = useData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null); // YYYY-MM-DD
  
  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Yüksek' | 'Orta' | 'Düşük'>('Orta');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay(); // 0 = Sunday
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Adjust for Monday start (Turkey standard)
  // Native: 0=Sun, 1=Mon ... 6=Sat
  // Target: 0=Mon ... 6=Sun
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startOffset }, (_, i) => i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Helper to get events for rendering the grid
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.completed);
    const dayHearings = cases.flatMap(c => 
        (c.hearings || []).filter(h => h.date.startsWith(dateStr)).map(h => ({
            ...h, 
            caseNumber: c.caseNumber, 
            title: c.title 
        }))
    );
    
    return { dayTasks, dayHearings, dateStr };
  };
  
  const handleDayClick = (day: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDateStr(dateStr);
      setNewTaskTitle('');
      setIsAddingTask(false);
  };

  const handleSaveTask = () => {
      if(!selectedDateStr || !newTaskTitle) return;
      
      const newTask: Task = {
          id: `t-${Date.now()}`,
          title: newTaskTitle,
          dueDate: selectedDateStr,
          priority: newTaskPriority,
          completed: false,
          assignedTo: 'Ben', // Default to current user concept
      };
      addTask(newTask);
      setNewTaskTitle('');
      // Don't close modal, just reset form so they can add another
  };

  // Derived state for Modal Content
  let selectedDayEvents = { dayTasks: [] as Task[], dayHearings: [] as any[], dateStr: '' };
  if (selectedDateStr) {
      const selectedTasks = tasks.filter(t => t.dueDate === selectedDateStr);
      const selectedHearings = cases.flatMap(c => 
          (c.hearings || []).filter(h => h.date.startsWith(selectedDateStr)).map(h => ({
              ...h, caseNumber: c.caseNumber, title: c.title 
          }))
      );
      selectedDayEvents = { dayTasks: selectedTasks, dayHearings: selectedHearings, dateStr: selectedDateStr };
  }

  const hasEvents = selectedDayEvents.dayTasks.length > 0 || selectedDayEvents.dayHearings.length > 0;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full relative">
      
      {/* Day Detail Modal */}
      {selectedDateStr && (
          <div className="absolute inset-0 z-20 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[95%] overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                              {new Date(selectedDateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                          </h3>
                          <p className="text-xs text-slate-500">Günlük İş Planı</p>
                      </div>
                      <button onClick={() => setSelectedDateStr(null)} className="p-1 hover:bg-slate-200 rounded-full transition text-slate-500"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                      {hasEvents ? (
                          <div className="space-y-6">
                              {/* Duruşmalar */}
                              {selectedDayEvents.dayHearings.length > 0 && (
                                  <div>
                                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                                          <Gavel className="w-3 h-3 mr-1" /> Duruşmalar
                                      </h4>
                                      <div className="space-y-2">
                                          {selectedDayEvents.dayHearings.map((h, i) => (
                                              <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                                  <div className="flex justify-between items-start mb-1">
                                                      <span className="font-bold text-red-800 text-sm">{h.caseNumber}</span>
                                                      <span className="bg-white text-red-700 text-xs font-bold px-2 py-0.5 rounded shadow-sm">{h.date.split(' ')[1]}</span>
                                                  </div>
                                                  <p className="text-sm text-slate-700 font-medium mb-1">{h.title}</p>
                                                  <p className="text-xs text-slate-500">{h.description}</p>
                                                  {h.location && (
                                                      <div className="mt-2 flex items-center text-xs text-slate-400">
                                                          <MapPin className="w-3 h-3 mr-1" /> {h.location}
                                                      </div>
                                                  )}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              )}

                              {/* Görevler */}
                              {selectedDayEvents.dayTasks.length > 0 && (
                                  <div>
                                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                                          <CheckSquare className="w-3 h-3 mr-1" /> Görevler
                                      </h4>
                                      <div className="space-y-2">
                                          {selectedDayEvents.dayTasks.map((t) => (
                                              <div 
                                                  key={t.id} 
                                                  className={`p-3 border rounded-lg flex items-start space-x-3 transition-all ${t.completed ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                                              >
                                                  <button 
                                                      onClick={() => toggleTaskComplete(t.id)}
                                                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${t.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-blue-500'}`}
                                                  >
                                                      {t.completed && <CheckSquare className="w-3 h-3" />}
                                                  </button>
                                                  <div className="flex-1 min-w-0">
                                                      <p className={`text-sm font-medium truncate ${t.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{t.title}</p>
                                                      <div className="flex items-center mt-1 space-x-2">
                                                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                              t.priority === 'Yüksek' ? 'bg-red-100 text-red-700' : 
                                                              t.priority === 'Orta' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                          }`}>
                                                              {t.priority}
                                                          </span>
                                                          <span className="text-[10px] text-slate-400">Atanan: {t.assignedTo}</span>
                                                      </div>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                      ) : (
                           <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <CalendarIcon className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-medium">Bu tarihte planlanmış bir iş bulunmuyor.</p>
                           </div>
                      )}

                      {/* Add Task Section */}
                      <div className="mt-6 pt-6 border-t border-slate-100">
                          {(!hasEvents || isAddingTask) ? (
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                                      <Plus className="w-4 h-4 mr-1.5 text-blue-600" />
                                      Yeni Görev Ekle
                                  </h4>
                                  <div className="space-y-3">
                                      <input 
                                          type="text" 
                                          placeholder="Görev başlığı giriniz..." 
                                          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                          value={newTaskTitle}
                                          onChange={(e) => setNewTaskTitle(e.target.value)}
                                          autoFocus
                                      />
                                      <div className="flex gap-3">
                                          <select 
                                              className="border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white flex-1"
                                              value={newTaskPriority}
                                              onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                          >
                                              <option value="Düşük">Düşük Öncelik</option>
                                              <option value="Orta">Orta Öncelik</option>
                                              <option value="Yüksek">Yüksek Öncelik</option>
                                          </select>
                                          <button 
                                              onClick={handleSaveTask}
                                              disabled={!newTaskTitle}
                                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition"
                                          >
                                              <Save className="w-4 h-4 mr-2" /> Kaydet
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ) : (
                              <button 
                                  onClick={() => setIsAddingTask(true)}
                                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center font-medium text-sm"
                              >
                                  <Plus className="w-4 h-4 mr-2" /> Bu Güne Görev Ekle
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600">
                <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">{monthNames[month]} {year}</h3>
                <p className="text-xs text-slate-500">Takvim ve Ajanda</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={handleToday} className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition mr-2">
                Bugün
            </button>
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition border border-slate-200 text-slate-600">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full transition border border-slate-200 text-slate-600">
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"].map((d, i) => (
            <div key={i} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {d}
            </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-slate-200 gap-px border-b border-slate-200">
        {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-white min-h-[120px]"></div>
        ))}
        
        {daysArray.map((day) => {
            const { dayTasks, dayHearings, dateStr } = getEventsForDay(day);
            const isToday = dateStr === todayStr;
            const totalEvents = dayHearings.length + dayTasks.length;

            return (
                <div 
                    key={day} 
                    onClick={() => handleDayClick(day)}
                    className={`bg-white min-h-[120px] p-2 flex flex-col transition-colors hover:bg-blue-50 cursor-pointer group relative overflow-hidden ${isToday ? 'bg-blue-50/30' : ''}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 group-hover:bg-slate-200'}`}>
                            {day}
                        </span>
                        {totalEvents > 0 && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {totalEvents}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar max-h-[100px]">
                        {dayHearings.map((h, i) => (
                            <div key={`h-${i}`} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-1 rounded border border-red-100 flex items-center truncate hover:bg-red-100 transition" title={`Duruşma: ${h.caseNumber} - ${h.description}`}>
                                <Gavel className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate font-medium">{h.date.split(' ')[1]} {h.caseNumber}</span>
                            </div>
                        ))}
                        {dayTasks.map((t, i) => (
                            <div key={`t-${i}`} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-1 rounded border border-blue-100 flex items-center truncate hover:bg-blue-100 transition" title={`Görev: ${t.title}`}>
                                <CheckSquare className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate font-medium">{t.title}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Hover Hint */}
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
            );
        })}
      </div>
      
      {/* Legend */}
      <div className="p-3 flex gap-4 text-xs text-slate-500 bg-white rounded-b-xl">
          <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-1.5"></div>
              <span>Duruşmalar</span>
          </div>
          <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-1.5"></div>
              <span>Görevler</span>
          </div>
          <div className="ml-auto text-slate-400 italic">
              * Detaylar için güne tıklayınız
          </div>
      </div>
    </div>
  );
};
