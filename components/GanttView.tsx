import React, { useState, useMemo } from 'react';
import { Task, LogEntry } from '@/lib/types';
import {
    differenceInDays,
    addDays,
    format,
    isWeekend,
    min,
    max,
    startOfWeek,
    endOfWeek,
    isSameDay,
    parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, useDragControls } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { countWorkdays } from '@/lib/scheduler';

interface GanttViewProps {
    tasks: Task[];
    logs: LogEntry[];
    currentDate: string; // "Today"
    rainDays: string[];
    onRainDelay: (date: string) => void;
    onUpdateTask: (task: Task) => void;
}

export default function GanttView({ tasks, logs, currentDate, rainDays, onRainDelay, onUpdateTask }: GanttViewProps) {
    const [zoom, setZoom] = useState(40); // Pixel width per day

    // 1. Calculate Timeline Range
    const { startDate, endDate, totalDays } = useMemo(() => {
        if (tasks.length === 0) return { startDate: new Date(), endDate: new Date(), totalDays: 0 };

        const starts = tasks.map(t => parseISO(t.start));
        const ends = tasks.map(t => parseISO(t.end));

        // Add buffer
        const minDate = startOfWeek(min(starts), { weekStartsOn: 1 }); // Start week on Monday
        const maxDate = endOfWeek(max(ends), { weekStartsOn: 1 });

        return {
            startDate: minDate,
            endDate: maxDate,
            totalDays: differenceInDays(maxDate, minDate) + 1
        };
    }, [tasks]);

    // 2. Generate Days Array
    const days = useMemo(() => {
        return Array.from({ length: totalDays }, (_, i) => {
            const date = addDays(startDate, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            // Check logs OR rainDays state
            const isRainy = logs.some(log => isSameDay(new Date(log.date), date) && log.weather === 'rainy') || (rainDays || []).includes(dateStr);
            return {
                date,
                isWeekend: isWeekend(date),
                isRainy,
                label: format(date, 'd', { locale: es }),
                headerLabel: format(date, 'EE', { locale: es }).charAt(0),
                fullDate: format(date, 'yyyy-MM-dd')
            };
        });
    }, [startDate, totalDays, logs]);

    // 3. Render Helpers
    const getTaskOffset = (start: string) => differenceInDays(new Date(start), startDate) * zoom;
    const getTaskWidth = (start: string, end: string) => (differenceInDays(new Date(end), new Date(start)) + 1) * zoom;

    const timelineWidth = totalDays * zoom;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

            {/* TOOLBAR */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Cronograma Detallado</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50">
                        <span>🌧 Días de Lluvia: {rainDays.length}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setZoom(z => Math.max(20, z - 10))}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Reducir Zoom"
                    >
                        <ZoomOut className="w-4 h-4 text-slate-500" />
                    </button>
                    <span className="text-xs font-mono text-slate-500 w-12 text-center">{zoom}px</span>
                    <button
                        onClick={() => setZoom(z => Math.min(100, z + 10))}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Aumentar Zoom"
                    >
                        <ZoomIn className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* SCROLLABLE AREA */}
            <div className="flex-1 overflow-auto relative custom-scrollbar">

                <div style={{ width: Math.max(timelineWidth, 100) }} className="relative min-h-full pb-8">

                    {/* 1. HEADER ROW */}
                    <div className="sticky top-0 z-20 flex bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-10">
                        {days.map((day, i) => (
                            <div
                                key={i}
                                style={{ width: zoom }}
                                className={`flex-shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-[10px] uppercase font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${day.isWeekend ? 'text-red-400 bg-red-50/50 dark:bg-red-900/10' : 'text-slate-500'} ${day.isRainy ? 'bg-blue-100/50 dark:bg-blue-900/20' : ''}`}
                                onClick={() => onRainDelay(day.fullDate)}
                                title="Click para marcar/desmarcar lluvia"
                            >
                                <span>{day.headerLabel}</span>
                                <span className={day.isWeekend ? 'font-bold' : ''}>{day.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* 2. GRID & SHADING */}
                    <div className="absolute inset-0 top-10 flex pointer-events-none">
                        {days.map((day, i) => (
                            <div
                                key={i}
                                style={{ width: zoom }}
                                className={`flex-shrink-0 border-r border-slate-100/50 dark:border-slate-800/50 h-full relative 
                                    ${day.isWeekend ? 'bg-slate-100/30 dark:bg-slate-800/20' : ''}
                                `}
                            >
                                {/* Rain Overlay */}
                                {day.isRainy && (
                                    <div className="absolute inset-0 w-full h-full opacity-30"
                                        style={{
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #3b82f6 5px, #3b82f6 10px)'
                                        }}
                                    />
                                )}

                                {/* Today Line */}
                                {day.fullDate === currentDate && (
                                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500 z-30 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                                        <div className="absolute -top-1 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded-sm">HOY</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 3. DEPENDENCY LINES (SVG Layer) */}
                    <svg className="absolute inset-0 top-10 pointer-events-none overflow-visible" style={{ width: timelineWidth }}>
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                            </marker>
                        </defs>
                        {tasks.map((task, taskIndex) => {
                            if (!task.dependencies || task.dependencies.length === 0) return null;

                            const taskY = 4 + taskIndex * (32 + 12) + 16; // 4px padding-top + index * (h-8 + space-y-3) + offset to middle
                            const taskStartX = differenceInDays(parseISO(task.start), startDate) * zoom;

                            return task.dependencies.map(depId => {
                                const depIndex = tasks.findIndex(t => t.id === depId);
                                if (depIndex === -1) return null;

                                const depTask = tasks[depIndex];
                                const depEndY = 4 + depIndex * (32 + 12) + 16;
                                const depEndX = (differenceInDays(parseISO(depTask.end), startDate) + 1) * zoom;

                                // Path logic: Simple elbow curve or straight
                                // From (depEndX, depEndY) to (taskStartX, taskY)
                                const midX = depEndX + (taskStartX - depEndX) / 2;

                                return (
                                    <path
                                        key={`${task.id}-${depId}`}
                                        d={`M ${depEndX} ${depEndY} L ${midX} ${depEndY} L ${midX} ${taskY} L ${taskStartX} ${taskY}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className="text-slate-300 dark:text-slate-600"
                                        markerEnd="url(#arrow)"
                                    />
                                );
                            });
                        })}
                    </svg>

                    {/* 4. TASKS BARS */}
                    <div className="pt-4 px-2 space-y-3 relative z-10">
                        {tasks.map((task) => {
                            // Safe Parsing
                            const startDateObj = parseISO(task.start);
                            const endDateObj = parseISO(task.end);
                            const left = differenceInDays(startDateObj, startDate) * zoom; // Use calculated startDate of view
                            const width = (differenceInDays(endDateObj, startDateObj) + 1) * zoom;

                            // Color logic
                            let colorClass = "bg-blue-500";
                            if (task.status === 'completed') colorClass = "bg-emerald-500";
                            if (task.status === 'late') colorClass = "bg-red-500";
                            if (task.status === 'pending') colorClass = "bg-slate-400";

                            return (
                                <motion.div
                                    key={`${task.id}-${task.start}-${task.end}`} // Force re-render on update to snap
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="relative h-8 rounded-md shadow-sm group hover:ring-2 hover:ring-white/50 transition-all flex items-center pr-2 overflow-visible cursor-grab active:cursor-grabbing"
                                    style={{ marginLeft: left + 'px', width: width + 'px', minWidth: '4px' }}
                                    drag="x"
                                    dragMomentum={false}
                                    dragElastic={0} // No elasticity
                                    onDragEnd={(_, info) => {
                                        const movePixels = info.offset.x;
                                        const moveDays = Math.round(movePixels / zoom);
                                        if (moveDays !== 0) {
                                            const newStart = format(addDays(startDateObj, moveDays), 'yyyy-MM-dd');
                                            const newEnd = format(addDays(endDateObj, moveDays), 'yyyy-MM-dd');
                                            onUpdateTask({ ...task, start: newStart, end: newEnd });
                                        }
                                    }}
                                >
                                    <div className={`absolute inset-0 opacity-80 ${colorClass} rounded-md`} />

                                    {/* Left Resize Handle */}
                                    <motion.div
                                        drag="x"
                                        dragMomentum={false}
                                        dragElastic={0}
                                        dragConstraints={{ left: -1000, right: width - zoom }} // Don't allow reducing below 1 day
                                        onDragEnd={(_, info) => {
                                            const movePixels = info.offset.x;
                                            const moveDays = Math.round(movePixels / zoom);
                                            if (moveDays !== 0) {
                                                const newStart = addDays(startDateObj, moveDays);
                                                const newStartStr = format(newStart, 'yyyy-MM-dd');
                                                // Keep end fixed: Recalculate duration
                                                let newDuration = countWorkdays(newStart, endDateObj, rainDays);
                                                if (newDuration < 1) newDuration = 1;

                                                // If duration is 1, newStart should probably be next workday before/at end
                                                const finalStartStr = newDuration === 1 && newDuration < countWorkdays(newStart, endDateObj, rainDays)
                                                    ? task.start // Fallback to avoid overlap inversion if calculation gets weird
                                                    : newStartStr;

                                                onUpdateTask({ ...task, start: finalStartStr, durationWorkdays: newDuration, days: newDuration });
                                            }
                                        }}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        className="absolute left-0 top-0 bottom-0 w-3 -translate-x-1/2 cursor-col-resize z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-sm flex items-center justify-center gap-0.5 shadow-sm">
                                            <div className="w-[1px] h-3 bg-white/40" />
                                            <div className="w-[1px] h-3 bg-white/40" />
                                        </div>
                                    </motion.div>

                                    {/* Right Resize Handle */}
                                    <motion.div
                                        drag="x"
                                        dragMomentum={false}
                                        dragElastic={0}
                                        dragConstraints={{ left: -(width - zoom), right: 1000 }} // Don't allow reducing below 1 day
                                        onDragEnd={(_, info) => {
                                            const movePixels = info.offset.x;
                                            const moveDays = Math.round(movePixels / zoom);
                                            if (moveDays !== 0) {
                                                const newEnd = addDays(endDateObj, moveDays);
                                                const newEndStr = format(newEnd, 'yyyy-MM-dd');
                                                // Keep start fixed: Recalculate duration
                                                let newDuration = countWorkdays(startDateObj, newEnd, rainDays);
                                                if (newDuration < 1) newDuration = 1;

                                                onUpdateTask({ ...task, durationWorkdays: newDuration, days: newDuration, end: newEndStr });
                                            }
                                        }}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-0 bottom-0 w-3 translate-x-1/2 cursor-col-resize z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-sm flex items-center justify-center gap-0.5 shadow-sm">
                                            <div className="w-[1px] h-3 bg-white/40" />
                                            <div className="w-[1px] h-3 bg-white/40" />
                                        </div>
                                    </motion.div>

                                    {/* Label (Sticky if visible, or inside) */}
                                    <span className="relative z-10 text-white text-xs font-semibold px-2 truncate whitespace-nowrap drop-shadow-md">
                                        {task.name}
                                    </span>

                                    {/* Tooltip on Hover */}
                                    <div className="absolute -top-8 left-0 hidden group-hover:block z-50 bg-slate-900 text-white text-xs rounded px-2 py-1 shadow-xl whitespace-nowrap">
                                        {task.name} ({task.start} - {task.end})
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}
