
import React from 'react';
import { useData } from '../DataContext';
import { CalendarView } from './CalendarView';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';

export const TasksManager: React.FC = () => {
  const { tasks, cases, toggleTaskComplete } = useData();

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-in fade-in">
       <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Görevler & Takvim</h1>
        <p className="text-slate-500 mt-1">Yapılacaklar listesi ve süreli işler takibi</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Task List Sidebar */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
                        Görev Listesi
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{tasks.filter(t => !t.completed).length} Bekleyen</span>
                </div>
                <div className="divide-y divide-slate-100 overflow-y-auto flex-1 custom-scrollbar">
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

             {/* Critical Upcoming Summary */}
             <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h4 className="flex items-center text-orange-800 font-bold text-sm mb-3">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Yaklaşan Kritik Süreler (7 Gün)
                </h4>
                <ul className="space-y-2 text-sm text-orange-900">
                    {tasks.filter(t => !t.completed && t.priority === 'Yüksek').slice(0, 3).map(t => (
                        <li key={t.id} className="flex justify-between border-b border-orange-200 pb-1 last:border-0">
                            <span className="truncate pr-2">{t.title}</span>
                            <span className="font-bold whitespace-nowrap">{t.dueDate}</span>
                        </li>
                    ))}
                    {tasks.filter(t => !t.completed && t.priority === 'Yüksek').length === 0 && (
                        <li className="text-orange-700/70 italic">Acil/Yüksek öncelikli görev yok.</li>
                    )}
                </ul>
            </div>
        </div>

        {/* Calendar View Main Area */}
        <div className="lg:col-span-2 order-1 lg:order-2 h-[750px]">
            <CalendarView tasks={tasks} cases={cases} />
        </div>
      </div>
    </div>
  );
};
