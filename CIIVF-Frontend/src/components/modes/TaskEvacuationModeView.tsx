import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, Plus, 
  ArrowRight, Shield, Send, Users, ChevronRight, Check
} from 'lucide-react';
import { MapComponent } from '../MapComponent';
import { TaskItem, CityLocation } from '../../types';
import { INITIAL_TASKS } from '../../data/mockData';

interface TaskEvacuationModeViewProps {
  city: CityLocation;
  showMangroveLayer: boolean;
  onToggleMangrove: (val: boolean) => void;
  showHistoricalLayer: boolean;
  onToggleHistorical: (val: boolean) => void;
  onOpenEvacuationModal: () => void;
  isLightMode?: boolean;
}

export const TaskEvacuationModeView: React.FC<TaskEvacuationModeViewProps> = ({
  city,
  showMangroveLayer,
  onToggleMangrove,
  showHistoricalLayer,
  onToggleHistorical,
  onOpenEvacuationModal,
  isLightMode = true,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWard, setNewTaskWard] = useState('Ward 17');
  const [newTaskDept, setNewTaskDept] = useState<TaskItem['department']>('Municipal Corp');

  const moveTask = (id: string, targetStatus: TaskItem['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: targetStatus } : t));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      department: newTaskDept,
      priority: 'High',
      status: 'pending',
      ward: newTaskWard,
      assignee: 'Rapid Response Team',
      timeRemaining: 'T-24h Target'
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="space-y-4">
      {/* Top Banner with "Issue Targeted Evacuation" Standard Blue Button */}
      <div className={`border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors ${
        isLightMode
          ? 'bg-white border-blue-200'
          : 'bg-slate-900 border-blue-800/60'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
            isLightMode
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-blue-950 border-blue-600/50 text-blue-400'
          }`}>
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                Task Management & Evacuation Command
              </h2>
              
            </div>
           
          </div>
        </div>

        {/* Standard Blue Button: Issue Targeted Evacuation matching prompt */}
        <button
          onClick={onOpenEvacuationModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0 border border-blue-400/40 cursor-pointer"
        >
          <Send size={15} />
          <span>Issue Targeted Evacuation</span>
        </button>
      </div>

      {/* Clean Kanban-Style Board (Pending, In-Progress, Done) for Municipal Tasks */}
      <div className={`border rounded-xl p-4 shadow-sm transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200/90'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              Municipal Emergency Task Operations
            </h3>
            <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Assigned to PWD, NDRF, Municipal Corporation, and EMS response battalions.
            </p>
          </div>
          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Plus size={14} />
            <span>Add Municipal Task</span>
          </button>
        </div>

        {/* Create Task Quick Form */}
        {isAddingTask && (
          <form onSubmit={handleCreateTask} className={`mb-4 p-3 rounded-xl border text-xs space-y-2 ${
            isLightMode ? 'bg-slate-50 border-blue-200' : 'bg-slate-950 border-blue-900/60'
          }`}>
            <div className={`font-semibold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              Create New Emergency Action Task
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Task description (e.g. Deploy sandbags...)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className={`sm:col-span-2 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 ${
                  isLightMode
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500'
                }`}
                autoFocus
              />
              <select
                value={newTaskDept}
                onChange={(e) => setNewTaskDept(e.target.value as any)}
                className={`rounded-lg px-2 py-1.5 ${
                  isLightMode
                    ? 'bg-white border border-slate-300 text-slate-800'
                    : 'bg-slate-900 border border-slate-700 text-slate-200'
                }`}
              >
                <option value="Municipal Corp">Municipal Corp</option>
                <option value="NDRF">NDRF</option>
                <option value="PWD Water Supply">PWD Water Supply</option>
                <option value="Health & EMS">Health & EMS</option>
                <option value="Power Utility">Power Utility</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className={`px-3 py-1 rounded-lg text-xs cursor-pointer ${
                  isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white font-medium rounded-lg text-xs cursor-pointer shadow-xs"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* 3 Columns Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Pending Column */}
          <div className={`border rounded-xl p-3 flex flex-col ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className={`flex items-center justify-between pb-2 mb-3 border-b text-xs ${
              isLightMode ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className={`font-bold uppercase tracking-wider text-[11px] ${
                  isLightMode ? 'text-slate-800' : 'text-slate-200'
                }`}>
                  Pending
                </span>
              </div>
              <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
              }`}>
                {pendingTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {pendingTasks.map(task => (
                <div key={task.id} className={`p-3 rounded-lg border text-xs space-y-2 shadow-xs ${
                  isLightMode
                    ? 'bg-white border-slate-200/90 text-slate-800'
                    : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      isLightMode
                        ? 'bg-slate-100 text-blue-700 border-blue-200 font-semibold'
                        : 'bg-slate-800 text-cyan-300 border-slate-700'
                    }`}>
                      {task.department}
                    </span>
                    <span className={`text-[10px] font-bold font-mono ${
                      isLightMode ? 'text-amber-800' : 'text-amber-400'
                    }`}>
                      {task.ward}
                    </span>
                  </div>
                  <h4 className={`font-semibold text-xs leading-snug ${
                    isLightMode ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {task.title}
                  </h4>
                  <div className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isLightMode ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-400'
                  }`}>
                    <span>{task.assignee}</span>
                    <button
                      onClick={() => moveTask(task.id, 'in_progress')}
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      Start <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  No pending tasks
                </div>
              )}
            </div>
          </div>

          {/* 2. In-Progress Column */}
          <div className={`border rounded-xl p-3 flex flex-col ${
            isLightMode ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-950/70 border-amber-900/40'
          }`}>
            <div className={`flex items-center justify-between pb-2 mb-3 border-b text-xs ${
              isLightMode ? 'border-amber-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className={`font-bold uppercase tracking-wider text-[11px] ${
                  isLightMode ? 'text-amber-900' : 'text-amber-300'
                }`}>
                  In-Progress
                </span>
              </div>
              <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${
                isLightMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {inProgressTasks.map(task => (
                <div key={task.id} className={`p-3 rounded-lg border text-xs space-y-2 shadow-xs ${
                  isLightMode
                    ? 'bg-white border-amber-200 text-slate-800'
                    : 'bg-slate-900 border-amber-800/40'
                }`}>
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      isLightMode
                        ? 'bg-amber-50 text-amber-900 border-amber-200 font-semibold'
                        : 'bg-slate-800 text-amber-300 border-slate-700'
                    }`}>
                      {task.department}
                    </span>
                    <span className={`text-[10px] font-bold font-mono ${
                      isLightMode ? 'text-rose-700' : 'text-rose-400'
                    }`}>
                      {task.ward}
                    </span>
                  </div>
                  <h4 className={`font-semibold text-xs leading-snug ${
                    isLightMode ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {task.title}
                  </h4>
                  <div className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isLightMode ? 'border-slate-100 text-slate-500' : 'border-slate-800/80 text-slate-400'
                  }`}>
                    <span className={`font-semibold ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
                      {task.timeRemaining}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveTask(task.id, 'pending')}
                        className={`${isLightMode ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'} cursor-pointer`}
                        title="Move back"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => moveTask(task.id, 'done')}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        Complete <Check size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {inProgressTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  No tasks currently in progress
                </div>
              )}
            </div>
          </div>

          {/* 3. Done Column */}
          <div className={`border rounded-xl p-3 flex flex-col ${
            isLightMode ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-950/70 border-emerald-900/40'
          }`}>
            <div className={`flex items-center justify-between pb-2 mb-3 border-b text-xs ${
              isLightMode ? 'border-emerald-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className={`font-bold uppercase tracking-wider text-[11px] ${
                  isLightMode ? 'text-emerald-900' : 'text-emerald-300'
                }`}>
                  Done
                </span>
              </div>
              <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${
                isLightMode ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {doneTasks.map(task => (
                <div key={task.id} className={`p-3 rounded-lg border text-xs space-y-2 shadow-xs ${
                  isLightMode
                    ? 'bg-white border-emerald-200 text-slate-700 opacity-90'
                    : 'bg-slate-900/60 border-emerald-800/30'
                }`}>
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      isLightMode
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                        : 'bg-slate-800 text-emerald-300 border-slate-700'
                    }`}>
                      {task.department}
                    </span>
                    <span className={`text-[10px] font-bold font-mono flex items-center gap-1 ${
                      isLightMode ? 'text-emerald-700' : 'text-emerald-400'
                    }`}>
                      <CheckCircle2 size={11} />
                      Verified
                    </span>
                  </div>
                  <h4 className={`font-medium text-xs leading-snug line-through ${
                    isLightMode ? 'text-slate-500' : 'text-slate-300 opacity-80'
                  }`}>
                    {task.title}
                  </h4>
                  <div className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isLightMode ? 'border-slate-100 text-slate-400' : 'border-slate-800/80 text-slate-400'
                  }`}>
                    <span>{task.assignee}</span>
                    <button
                      onClick={() => moveTask(task.id, 'in_progress')}
                      className={`${isLightMode ? 'text-slate-500 hover:text-slate-700' : 'text-slate-500 hover:text-slate-300'} cursor-pointer font-medium`}
                      title="Reopen"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
              {doneTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  No completed tasks yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
