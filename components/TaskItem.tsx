import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Gem,
    Edit2,
    Trash2,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Task, TaskStatus } from "@/lib/types";

interface TaskItemProps {
    task: Task;
    onToggle: (id: string, status: TaskStatus) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
    return (
        <div
            className={cn(
                "group rounded-lg p-3 text-sm transition-all duration-200 border",
                "grid grid-cols-1 md:grid-cols-[1fr_auto] lg:grid-cols-[60px_1fr_100px_60px_120px_auto] gap-y-3 gap-x-4 items-center",
                "hover:shadow-sm hover:scale-[1.002] active:scale-[0.998]",
                task.status === 'completed' ? "bg-white border-emerald-100/50 opacity-70 hover:opacity-100" :
                    task.status === 'late' ? "bg-red-50/30 border-red-200" :
                        task.status === 'in-progress' ? "bg-white border-blue-300 shadow-sm" :
                            "bg-white/40 border-slate-200/50 hover:bg-white hover:border-slate-300"
            )}
        >
            {/* ID */}
            <div className="font-mono text-[10px] text-slate-400 hidden lg:block whitespace-nowrap">{task.id}</div>

            {/* NAME */}
            <div className="flex flex-col gap-0.5">
                <div className="font-medium text-slate-700 flex items-center gap-2 group-hover:text-slate-900 transition-colors">
                    {task.isMilestone && <Gem className="w-3.5 h-3.5 text-purple-500 animate-bounce-slow" />}
                    {task.locked && <Lock className="w-3.5 h-3.5 text-amber-500" title="Tarea Bloqueada" />}
                    {task.name}
                </div>
                {/* Mobile Meta */}
                <div className="flex lg:hidden gap-3 text-xs text-slate-400 mt-1">
                    <span>{task.days} días</span>
                    <span>•</span>
                    <span>{format(new Date(task.start), 'dd MMM')} - {format(new Date(task.end), 'dd MMM')}</span>
                </div>
            </div>

            {/* DATES (Desktop) */}
            <div className="hidden lg:flex flex-col text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <CalendarIcon className="w-3 h-3 text-slate-400" />
                    {format(new Date(task.start), 'dd MMM', { locale: es })}
                </div>
                <span className="text-slate-400 pl-4.5">{format(new Date(task.end), 'dd MMM', { locale: es })}</span>
            </div>

            {/* DURATION (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 text-slate-500 text-xs bg-slate-100 w-fit px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                {task.days}d
            </div>

            {/* STATUS */}
            {/* STATUS BADGE SELECTOR */}
            <div className="flex gap-2 items-center justify-between lg:justify-start">
                <div className="lg:hidden text-xs font-semibold text-slate-400">Estado</div>
                <div className="relative group/badge">
                    <select
                        value={task.status}
                        onChange={(e) => onToggle(task.id, e.target.value as TaskStatus)}
                        className={cn(
                            "appearance-none pl-3 pr-8 py-0.5 rounded-full text-xs font-medium border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-all w-auto",
                            task.status === 'completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500" :
                                task.status === 'late' ? "bg-red-50 text-red-700 border-red-200 focus:ring-red-500" :
                                    task.status === 'in-progress' ? "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500" :
                                        "bg-slate-100 text-slate-600 border-slate-200 focus:ring-slate-400"
                        )}
                    >
                        <option value="pending">Pendiente</option>
                        <option value="in-progress">En Progreso</option>
                        <option value="completed">Listo</option>
                        <option value="late">Atrasado</option>
                    </select>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end items-center gap-4">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Editar Tarea"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar Tarea"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                <button
                    title="Marcar como listo/pendiente"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Toggle logic for button: if completed -> pending, else -> completed
                        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                        onToggle(task.id, newStatus);
                    }}
                    className={cn(
                        "h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-200",
                        task.status === 'completed'
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200 shadow-md hover:bg-emerald-600 scale-100"
                            : "border-slate-200 text-slate-300 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 scale-90 hover:scale-100"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
