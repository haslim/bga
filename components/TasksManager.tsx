
import React, { useState } from 'react';
import { useData } from '../DataContext';
import { getDaysInMonth, getFirstDayOfMonth } from '../utils';
import { Calendar, CheckSquare, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const TasksManager: React.FC = () => {
  const { tasks, cases, toggleTaskComplete } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const todayStr = new Date().toISOString().split('T')[0];

  const days = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month); // 0 = Sunday

  // Correct for Monday start (Turkey standard)
  // JS getDay: 0=Sun, 1=Mon ... 6=Sat
  // Target: 0=Mon ... 6=Sun
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 
  const emptyDays = Array(startOffset).fill(null);

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Determine events for a specific day string (YYYY-MM-DD)
  const getEventsForDay = (dateStr: string) => {
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    const dayHearings = cases.flatMap(c => 
        (c.hearings || []).filter(h => h.date.startsWith(dateStr)).map(h => ({...h, caseNumber: c.caseNumber}))
    );
    return { dayTasks, dayHearings };
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
       <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Görevler & Takvim</h1>
        <p className="text-slate-500 mt-1">Yapılacaklar listesi ve süreli işler takibi</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Task List */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
                        Görev Listesi
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{tasks.filter(t => !t.completed).length} Bekleyen</span>
                </div>
                <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                    {tasks.length > 0 ? tasks.map((task) => (
                        <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between group">
                            <div className="flex items-start space-x-3">
                                <div 
                                    onClick={() => toggleTaskComplete(task.id)}
                                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-blue-500'}`}
                                >
                                    {task.completed && <CheckSquare className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center mt-1 space-x-3">
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                            task.priority === 'Yüksek' ? 'bg-red-100 text-red-700' : 
                                            task.priority === 'Orta' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> {task.dueDate}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Atanan: {task.assignedTo}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-slate-400 py-8 text-sm">Görev bulunmuyor.</p>
                    )}
                </div>
            </div>
        </div>

        {/* Calendar Widget */}
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                        <h3 className="text-xl font-bold text-slate-800">{monthNames[month]} {year}</h3>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                    </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                    {["Paz", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(d => (
                        <div key={d} className="text-slate-400 font-medium text-xs py-1">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                    {emptyDays.map((_, idx) => (
                        <div key={`empty-${idx}`} className="h-32 bg-slate-50/50 rounded-lg border border-transparent"></div>
                    ))}
                    {days.map((day) => {
                        const dateStr = day.toISOString().split('T')[0]; // YYYY-MM-DD (local timezone issue might imply offset, simplified here)
                        // Fix timezone for ISO string getting previous day
                        const localDateStr = new Date(day.getTime() - (day.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                        
                        const { dayTasks, dayHearings } = getEventsForDay(localDateStr);
                        const isToday = localDateStr === todayStr;

                        return (
                            <div key={localDateStr} className={`h-32 p-2 rounded-lg border flex flex-col transition hover:shadow-md ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}>
                                <span className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                                    {day.getDate()}
                                </span>
                                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                                    {dayHearings.map((h, i) => (
                                        <div key={i} className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded truncate font-medium" title={h.type}>
                                            ⚖️ {h.date.split(' ')[1] || ''} {h.caseNumber}
                                        </div>
                                    ))}
                                    {dayTasks.map((t, i) => (
                                        <div key={i} className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded truncate" title={t.title}>
                                            ✓ {t.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Critical Upcoming */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h4 className="flex items-center text-orange-800 font-bold text-sm mb-3">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Yaklaşan Kritik Süreler (Önümüzdeki 7 Gün)
                </h4>
                <ul className="space-y-2 text-sm text-orange-900">
                    {/* Logic to show actual upcoming events */}
                    {tasks.filter(t => !t.completed && t.priority === 'Yüksek').slice(0, 3).map(t => (
                        <li key={t.id} className="flex justify-between border-b border-orange-200 pb-1 last:border-0">
                            <span>{t.title}</span>
                            <span className="font-bold">{t.dueDate}</span>
                        </li>
                    ))}
                    {tasks.filter(t => !t.completed && t.priority === 'Yüksek').length === 0 && <li>Kritik görev bulunmuyor.</li>}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
