"use client";

import React, { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Plus,
    RefreshCw,
    AlertCircle,
    Flag,
    Search,
    Truck,
    Users,
    MoreVertical,
    ExternalLink,
    ClipboardList,
    Clock,
    MapPin
} from "lucide-react";
import { useGoogleCalendar } from "@/contexts/GoogleCalendarContext";
import { CalendarEvent, CalendarEventType, Task } from "@/lib/types";
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import EventCreateDialog from "./EventCreateDialog";
import { toast } from "sonner";

const TYPE_COLORS: Record<CalendarEventType, string> = {
    milestone: "bg-red-500",
    inspection: "bg-amber-500",
    delivery: "bg-blue-500",
    meeting: "bg-emerald-500"
};

const TYPE_ICONS: Record<CalendarEventType, React.ReactNode> = {
    milestone: <Flag className="w-4 h-4" />,
    inspection: <Search className="w-4 h-4" />,
    delivery: <Truck className="w-4 h-4" />,
    meeting: <Users className="w-4 h-4" />
};

const TYPE_LABELS: Record<CalendarEventType, string> = {
    milestone: "Hito",
    inspection: "Inspección",
    delivery: "Entrega Materiales",
    meeting: "Reunión de Obra"
};

export default function CalendarView({ onOpenSettings, tasks = [] }: { onOpenSettings?: () => void, tasks?: Task[] }) {
    const { isConnected, isSyncing, connect, fetchEvents, createEvent, error } = useGoogleCalendar();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedType, setSelectedType] = useState<CalendarEventType | 'all'>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const handleRefresh = async () => {
        // Fetch events for the current month range (plus a bit of padding)
        const start = startOfMonth(viewDate).toISOString();
        const end = endOfMonth(viewDate).toISOString();
        const data = await fetchEvents(start, end);
        setEvents(data);
    };

    useEffect(() => {
        if (isConnected) {
            handleRefresh();
        }
    }, [isConnected, viewDate]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                    <CalendarIcon className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Google Calendar no conectado</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8 leading-relaxed">
                    Sincroniza tu calendario para gestionar hitos, entregas y reuniones directamente desde Zócalo.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={connect}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" className="w-5 h-5 grayscale-0" alt="GCal" />
                        Conectar ahora
                    </button>
                    {onOpenSettings && (
                        <button
                            onClick={onOpenSettings}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-black transition-all active:scale-95"
                        >
                            Ir a Configuración
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-8 flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-bold bg-red-50 dark:bg-red-950/20 px-6 py-3 rounded-xl border border-red-100 dark:border-red-900/30">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                        <a
                            href="https://console.cloud.google.com/apis/credentials"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline font-medium flex items-center gap-1"
                        >
                            <ExternalLink className="w-3 h-3" /> Obtener Client ID en Google Cloud
                        </a>
                    </div>
                )}
            </div>
        );
    }

    // Calendar logic
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const filteredEvents = events.filter(e => selectedType === 'all' || e.type === selectedType);

    // Helper to check if a day should display a task
    const getTasksForDay = (day: Date) => {
        return tasks.filter(t => {
            const start = parseISO(t.start);
            const end = parseISO(t.end);
            return isWithinInterval(day, { start, end });
        });
    };

    return (
        <div className="space-y-6">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                        Calendario de Obra
                    </h2>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setViewDate(d => new Date(d.setMonth(d.getMonth() - 1)))}
                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 rotate-180" />
                        </button>
                        <span className="text-sm font-bold min-w-[120px] text-center text-slate-700 dark:text-slate-200 uppercase">
                            {format(viewDate, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button
                            onClick={() => setViewDate(d => new Date(d.setMonth(d.getMonth() + 1)))}
                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 ml-auto" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                    <FilterButton active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="Todos" dotColor="bg-slate-400" />
                    <FilterButton active={selectedType === 'milestone'} onClick={() => setSelectedType('milestone')} label="Hitos" dotColor="bg-red-500" />
                    <FilterButton active={selectedType === 'inspection'} onClick={() => setSelectedType('inspection')} label="Inspecciones" dotColor="bg-amber-500" />
                    <FilterButton active={selectedType === 'delivery'} onClick={() => setSelectedType('delivery')} label="Entregas" dotColor="bg-blue-500" />
                    <FilterButton active={selectedType === 'meeting'} onClick={() => setSelectedType('meeting')} label="Reuniones" dotColor="bg-emerald-500" />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className={cn("p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors", isSyncing && "animate-spin")}
                    >
                        <RefreshCw className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all active:scale-95 text-sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus className="w-4 h-4" /> Nuevo Evento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* CALENDAR GRID */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                            <div key={d} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, i) => {
                            const isCurrentMonth = isSameDay(startOfMonth(day), startOfMonth(viewDate));
                            const dayEvents = filteredEvents.filter(e => isSameDay(parseISO(e.start), day));
                            const dayTasks = getTasksForDay(day);

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30",
                                        !isCurrentMonth && "bg-slate-50/50 dark:bg-slate-950/20"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={cn(
                                            "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                                            isToday(day) ? "bg-blue-600 text-white" : isCurrentMonth ? "text-slate-700 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {/* TASKS */}
                                        {dayTasks.map(t => (
                                            <div
                                                key={t.id}
                                                className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1 font-bold truncate"
                                                title={`Tarea: ${t.name}`}
                                            >
                                                <ClipboardList className="w-2 h-2 shrink-0" />
                                                <span className="truncate">{t.name}</span>
                                            </div>
                                        ))}

                                        {/* GCAL EVENTS */}
                                        {dayEvents.map(e => (
                                            <div
                                                key={e.id}
                                                className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded border border-transparent flex items-center gap-1 cursor-pointer truncate",
                                                    TYPE_COLORS[e.type], "bg-opacity-10 text-slate-700 dark:text-slate-200 font-medium"
                                                )}
                                                title={e.title}
                                            >
                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", TYPE_COLORS[e.type])} />
                                                <span className="truncate">{e.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SIDEBAR: UPCOMING EVENTS */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" /> Próximos Eventos
                        </h3>
                        <div className="space-y-3">
                            {filteredEvents.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-8">No hay eventos próximos.</p>
                            ) : (
                                filteredEvents.slice(0, 5).map(e => (
                                    <div key={e.id} className="group p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className={cn("p-1.5 rounded-md text-white", TYPE_COLORS[e.type])}>
                                                {TYPE_ICONS[e.type]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{e.title}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">{TYPE_LABELS[e.type]}</p>
                                            </div>
                                            <button className="text-slate-300 group-hover:text-slate-500 transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>{format(parseISO(e.start), "d 'de' MMM", { locale: es })}</span>
                                                <span>•</span>
                                                <span>{format(parseISO(e.start), "HH:mm")}</span>
                                            </div>
                                            {e.location && (
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 italic truncate">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{e.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EventCreateDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSave={async (eventData) => {
                    try {
                        await createEvent(eventData);
                        handleRefresh();
                    } catch (err) {
                        toast.error("Error al crear el evento");
                    }
                }}
            />
        </div>
    );
}

function FilterButton({ active, onClick, label, dotColor }: { active: boolean, onClick: () => void, label: string, dotColor: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                    : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
        >
            <div className={cn("w-2 h-2 rounded-full", dotColor)} />
            {label}
        </button>
    );
}
