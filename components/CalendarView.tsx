
import React, { useState } from 'react';
import { Case, Task } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Gavel, CheckSquare } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  cases: Case[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, cases }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const getEventsForDay = (day: number) => {
    // Format: YYYY-MM-DD (ensure padding)
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

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
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

            return (
                <div key={day} className={`bg-white min-h-[120px] p-2 flex flex-col transition-colors hover:bg-blue-50/30 group relative ${isToday ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                            {day}
                        </span>
                        {(dayHearings.length > 0 || dayTasks.length > 0) && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded">
                                {dayHearings.length + dayTasks.length}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar max-h-[100px]">
                        {dayHearings.map((h, i) => (
                            <div key={`h-${i}`} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-1 rounded border border-red-100 flex items-center truncate" title={`Duruşma: ${h.caseNumber} - ${h.description}`}>
                                <Gavel className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate font-medium">{h.date.split(' ')[1]} {h.caseNumber}</span>
                            </div>
                        ))}
                        {dayTasks.map((t, i) => (
                            <div key={`t-${i}`} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-1 rounded border border-blue-100 flex items-center truncate" title={`Görev: ${t.title}`}>
                                <CheckSquare className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate font-medium">{t.title}</span>
                            </div>
                        ))}
                    </div>
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
      </div>
    </div>
  );
};
