
import React from 'react';
import { useData } from '../DataContext';
import { CalendarView } from './CalendarView';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';

export const TasksManager: React.FC = () => {
  const { tasks, cases, toggleTaskComplete, taskFilter, setTaskFilter } = useData();

  const filteredTasks = tasks.filter(t => {
      if (taskFilter === 'COMPLETED') return t.completed;
      if (taskFilter === 'PENDING') return !t.completed;
      return true;
  });

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen animate-in fade-in">
       <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Görevler & Takvim</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Yapılacaklar listesi ve süreli işler takibi</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Task List Sidebar */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center">
                            <CheckSquare className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                            {taskFilter === 'ALL' ? 'Tüm Görevler' : taskFilter === 'COMPLETED' ? 'Tamamlananlar' : 'Bekleyen Görevler'}
                        </h3>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">{filteredTasks.length} Kayıt</span>
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={() => setTaskFilter('ALL')} className={`flex-1 py-1.5 text-xs font-medium rounded transition ${taskFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>Tümü</button>
                        <button onClick={() => setTaskFilter('PENDING')} className={`flex-1 py-1.5 text-xs font-medium rounded transition ${taskFilter === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>Bekleyen</button>
                        <button onClick={() => setTaskFilter('COMPLETED')} className={`flex-1 py-1.5 text-xs font-medium rounded transition ${taskFilter === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>Biten</button>
                    </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 overflow-y-auto flex-1 custom-scrollbar">
                    {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                        <div key={task.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-start justify-between group">
                            <div className="flex items-start space-x-3">
                                <div 
                                    onClick={() => toggleTaskComplete(task.id)}
                                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-500 hover:border-blue-500'}`}
                                >
                                    {task.completed && <CheckSquare className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center mt-1 space-x-3">
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                            task.priority === 'Yüksek' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                                            task.priority === 'Orta' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
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
                        <p className="text-center text-slate-400 py-8 text-sm">Kriterlere uygun görev bulunmuyor.</p>
                    )}
                </div>
            </div>

             {/* Critical Upcoming Summary */}
             <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-xl p-4">
                <h4 className="flex items-center text-orange-800 dark:text-orange-400 font-bold text-sm mb-3">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Yaklaşan Kritik Süreler (7 Gün)
                </h4>
                <ul className="space-y-2 text-sm text-orange-900 dark:text-orange-300">
                    {tasks.filter(t => !t.completed && t.priority === 'Yüksek').slice(0, 3).map(t => (
                        <li key={t.id} className="flex justify-between border-b border-orange-200 dark:border-orange-800 pb-1 last:border-0">
                            <span className="truncate pr-2">{t.title}</span>
                            <span className="font-bold whitespace-nowrap">{t.dueDate}</span>
                        </li>
                    ))}
                    {tasks.filter(t => !t.completed && t.priority === 'Yüksek').length === 0 && (
                        <li className="text-orange-700/70 dark:text-orange-400/70 italic">Acil/Yüksek öncelikli görev yok.</li>
                    )}
                </ul>
            </div>
        </div>

        {/* Calendar View Main Area */}
        <div className="lg:col-span-2 order-1 lg:order-2 h-[750px]">
            <CalendarView tasks={filteredTasks} cases={cases} />
        </div>
      </div>
    </div>
  );
};
