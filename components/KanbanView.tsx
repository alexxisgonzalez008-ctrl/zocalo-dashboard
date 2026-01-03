import React, { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { motion } from 'framer-motion';

interface KanbanViewProps {
    tasks: Task[];
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const columns: { id: TaskStatus; label: string; color: string; ringRGB: string }[] = [
    { id: 'pending', label: 'Pendiente', color: 'bg-slate-100 dark:bg-slate-800', ringRGB: '148, 163, 184' },
    { id: 'in-progress', label: 'En Progreso', color: 'bg-blue-50 dark:bg-blue-900/20', ringRGB: '59, 130, 246' },
    { id: 'completed', label: 'Completado', color: 'bg-emerald-50 dark:bg-emerald-900/20', ringRGB: '16, 185, 129' },
    { id: 'late', label: 'Atrasado', color: 'bg-red-50 dark:bg-red-900/20', ringRGB: '239, 68, 68' },
];

export default function KanbanView({ tasks, onStatusChange }: KanbanViewProps) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [targetCol, setTargetCol] = useState<TaskStatus | null>(null);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggingId(taskId);
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        if (targetCol !== status) {
            setTargetCol(status);
        }
    };

    const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onStatusChange(taskId, status);
        }
        setDraggingId(null);
        setTargetCol(null);
    };

    return (
        <div className="h-full overflow-y-auto overflow-x-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[1000px] lg:min-w-0">
                {columns.map((col) => {
                    const colTasks = tasks.filter(t => t.status === col.id);
                    const isOver = targetCol === col.id;

                    return (
                        <div
                            key={col.id}
                            className={`
                                rounded-xl flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/40 border-2 transition-all duration-200
                                ${isOver ? `border-[rgb(${col.ringRGB})] ring-2 ring-[rgb(${col.ringRGB})]/20` : 'border-transparent'}
                            `}
                            onDragOver={(e) => handleDragOver(e, col.id)}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* HEADER */}
                            <div className={`p-3 rounded-t-xl border-b border-slate-100 dark:border-slate-800 ${col.color}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-bold text-sm ${isOver ? 'text-[rgb(' + col.ringRGB + ')]' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {col.label}
                                    </h3>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-slate-500 dark:text-slate-400">
                                        {colTasks.length}
                                    </span>
                                </div>
                            </div>

                            {/* DROP AREA */}
                            <div className="flex-1 p-3 space-y-3 min-h-[150px]">
                                {colTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        layoutId={task.id}
                                        draggable
                                        onDragStart={(e: any) => handleDragStart(e, task.id)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`
                                            bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 
                                            hover:shadow-md hover:border-emerald-300 transition-all cursor-grab active:cursor-grabbing group relative
                                            ${draggingId === task.id ? 'opacity-50 rotate-3' : ''}
                                        `}
                                    >
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">{task.category}</div>
                                        <div className="font-medium text-sm text-slate-800 dark:text-slate-100 leading-tight mb-2">{task.name}</div>
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/50 pt-2">
                                            <span>{task.end}</span>
                                            {task.budget && (
                                                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">${task.budget.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {colTasks.length === 0 && (
                                    <div className={`h-full flex items-center justify-center text-sm italic transition-colors ${isOver ? 'text-[rgb(' + col.ringRGB + ')]/60' : 'text-slate-400/50'}`}>
                                        {isOver ? 'Soltar aquí' : 'Vacío'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
