"use client";

import React, { useState, useMemo, useEffect } from "react";
import { startOfDay, isBefore, isAfter, addDays } from "date-fns";
import {
    Hammer,
    CalendarDays,
    LayoutDashboard,
    Wallet,
    BookOpen,
    Search,
    Download,
    Trash2,
    BarChart2,
    FileText,
    Settings,
    Kanban,
    Plus
} from "lucide-react";
import { Task, TaskStatus, LogEntry } from "@/lib/types";
import { recalculateSchedule, isWorkday } from "@/lib/scheduler";
import { INITIAL_TASKS } from "@/lib/data";
import { downloadCSV, exportTasksToCSV, exportLogsToCSV } from "@/lib/export";
import StatsOverview from "./StatsOverview";
import TaskCategory from "./TaskCategory";
import FinancialView from "./FinancialView";
import KanbanView from "./KanbanView";
import GanttView from "./GanttView";
import DailyLogView from "./DailyLogView";
import TaskEditDialog from "./TaskEditDialog";
import AnalyticsView from "./AnalyticsView";
import SettingsDialog, { ProjectSettings } from "./SettingsDialog";
import { generatePDFReport } from "@/lib/pdf";
import { AnimatePresence, motion } from "framer-motion";
import { ModeToggle } from "./ModeToggle";
import { toast } from "sonner";

export default function Dashboard() {
    // 1. Initial State Load (Lazy Initialization)
    // 1. State Management
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
        title: "Zócalo",
        subtitle: "Gestión de Obra"
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [rainDays, setRainDays] = useState<string[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTasks = localStorage.getItem('islara_tasks');
            const savedLogs = localStorage.getItem('islara_logs');
            const savedSettings = localStorage.getItem('islara_settings');

            if (savedTasks) setTasks(JSON.parse(savedTasks));
            if (savedLogs) setLogs(JSON.parse(savedLogs));

            // Migration: Force update to Zocalo if old default exists
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed.title === "Islara | Funes" || parsed.title.includes("Islara")) {
                    parsed.title = "Zócalo";
                    localStorage.setItem('islara_settings', JSON.stringify(parsed));
                }
                setProjectSettings(parsed);
            }
            setIsLoaded(true);
        }
    }, []);

    // Load rain days
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRain = localStorage.getItem('islara_rain_days');
            if (savedRain) setRainDays(JSON.parse(savedRain));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('islara_rain_days', JSON.stringify(rainDays));
        }
    }, [rainDays]);

    const handleRainDelay = (date: string) => {
        // Toggle Rain Day
        let newRainDays = [...rainDays];
        if (rainDays.includes(date)) {
            newRainDays = newRainDays.filter(d => d !== date);
            toast.info("Día de lluvia eliminado. Recalculando...");
        } else {
            newRainDays.push(date);
            toast.info("Día de lluvia registrado. Recalculando...");
        }

        setRainDays(newRainDays);

        // Recalculate whole schedule
        // Note: For a real app, we might want to store 'baseline' dates vs 'scheduled' dates.
        // For now, we recalculate based on current state (which acts as the baseline intent + delays).
        // Since 'recalculateSchedule' pulls 'duration' or 'days', it rebuilds the dates.
        const newTasks = recalculateSchedule(tasks, newRainDays);
        setTasks(newTasks);
    };

    const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [openCategories, setOpenCategories] = useState<string[]>([]);

    // 2. Persistence Effects
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('islara_tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('islara_logs', JSON.stringify(logs));
        }
    }, [logs]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('islara_settings', JSON.stringify(projectSettings));
        }
    }, [projectSettings]);

    // Handle saving logs
    const handleSaveLog = (log: LogEntry) => {
        setLogs(prev => {
            const index = prev.findIndex(l => l.date === log.date);
            if (index >= 0) {
                const newLogs = [...prev];
                newLogs[index] = log;
                return newLogs;
            }
            return [...prev, log];
        });
        toast.success("Bitácora guardada correctamente");
    };

    // Initialize categories
    const categories = useMemo(() => Array.from(new Set(INITIAL_TASKS.map(t => t.category))), []);

    // Update statuses when date changes
    useEffect(() => {
        setTasks(prevTasks => {
            const now = startOfDay(new Date(currentDate));

            const newTasks = prevTasks.map(task => {
                if (task.status === 'completed') return task;

                const start = startOfDay(new Date(task.start));
                const end = startOfDay(new Date(task.end));

                if (isBefore(now, start)) {
                    return { ...task, status: 'pending' };
                } else if (isAfter(now, end)) {
                    return { ...task, status: 'late' };
                } else {
                    return { ...task, status: 'in-progress' };
                }
            });

            const activeCategories = new Set(
                newTasks
                    .filter(t => t.status === 'in-progress' || t.status === 'late')
                    .map(t => t.category)
            );

            setOpenCategories(prev => Array.from(new Set([...prev, ...Array.from(activeCategories)])));

            return newTasks as Task[];
        });
    }, [currentDate]);

    const toggleTaskStatus = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            if (t.status === 'completed') {
                const now = startOfDay(new Date(currentDate));
                const start = startOfDay(new Date(t.start));
                const end = startOfDay(new Date(t.end));
                let status: TaskStatus = 'pending';
                if (isBefore(now, start)) status = 'pending';
                else if (isAfter(now, end)) status = 'late';
                else status = 'in-progress';
                return { ...t, status };
            } else {
                return { ...t, status: 'completed' };
            }
        }));
    };

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleUpdateTask = (updated: Task) => {
        setTasks(prev => {
            const exists = prev.some(t => t.id === updated.id);
            let newTasks = exists
                ? prev.map(t => t.id === updated.id ? updated : t)
                : [...prev, updated];

            // Recalculate in case dependencies or dates changed
            newTasks = recalculateSchedule(newTasks, rainDays);
            return newTasks;
        });
        setEditingTask(null); // Close dialog
        toast.success(updated.id === editingTask?.id ? "Tarea actualizada" : "Tarea creada");
    };

    const handleDeleteTask = (id: string) => {
        const taskToDelete = tasks.find(t => t.id === id);
        if (!taskToDelete) return;

        setTasks(prev => prev.filter(t => t.id !== id));

        toast.success("Tarea eliminada", {
            action: {
                label: "Deshacer",
                onClick: () => {
                    setTasks(prev => [...prev, taskToDelete]);
                    toast.success("Tarea restaurada");
                }
            }
        });
    };

    const handleStatusChange = (id: string, status: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        toast.success("Estado actualizado");
    };

    // Handlers for Export/Reset
    const handleExportTasks = () => {
        try {
            const csv = exportTasksToCSV(tasks);
            downloadCSV(csv, `Zocalo_Cronograma_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success("Cronograma exportado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al exportar cronograma");
        }
    };

    const handleExportLogs = () => {
        try {
            const csv = exportLogsToCSV(logs);
            downloadCSV(csv, `Zocalo_Bitacora_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success("Bitácora exportada correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al exportar bitácora");
        }
    };

    const handleExportPDF = () => {
        try {
            generatePDFReport(logs, `${projectSettings.title} - Bitácora`);
            toast.success("PDF generado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al generar PDF. Revise la consola.");
        }
    };

    const handleResetData = () => {
        if (typeof window !== 'undefined') {
            if (confirm("¿Estás seguro de borrar todos los datos locales? Esto revertirá a la versión inicial.")) {
                localStorage.removeItem('islara_tasks');
                localStorage.removeItem('islara_logs');
                localStorage.removeItem('islara_settings');
                window.location.reload();
            }
        }
    };

    // Filtered Data
    const filteredTasks = useMemo(() => {
        let result = tasks;
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = tasks.filter(t =>
                t.name.toLowerCase().includes(lower) ||
                t.category.toLowerCase().includes(lower) ||
                t.id.toLowerCase().includes(lower)
            );
        }
        return result.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [tasks, searchTerm]);

    const filteredCategories = useMemo(() => {
        return Array.from(new Set(filteredTasks.map(t => t.category)));
    }, [filteredTasks]);

    // Stats (Always global)
    const totalTasks = tasks.length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const lateCount = tasks.filter(t => t.status === 'late').length;
    const progressPercent = Math.round((completedCount / totalTasks) * 100) || 0;

    const currentPhase = tasks.find(t => t.status === 'in-progress')?.category.split('. ')[1] || "Sin Actividad";

    const [activeTab, setActiveTab] = useState<"schedule" | "kanban" | "gantt" | "financial" | "analytics" | "logs">("schedule");

    if (!isLoaded) return null; // Or a loading spinner

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-900 dark:selection:text-emerald-100">

            {/* HEADER */}
            <div className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
                    {/* BRAND */}
                    <div className="flex items-center gap-2">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">{projectSettings.title}</h1>
                            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider text-left">{projectSettings.subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* SEARCH BAR (Desktop) */}
                        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 w-64 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Buscar tarea..."
                                className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-600">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* TABS (Desktop) */}
                        <div className="hidden md:flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab("schedule")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Cronograma
                            </button>
                            <button
                                onClick={() => setActiveTab("kanban")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'kanban' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Tablero
                            </button>
                            <button
                                onClick={() => setActiveTab("gantt")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'gantt' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Gantt
                            </button>
                            <button
                                onClick={() => setActiveTab("financial")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'financial' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Finanzas
                            </button>
                            <button
                                onClick={() => setActiveTab("analytics")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Analítica
                            </button>
                            <button
                                onClick={() => setActiveTab("logs")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'logs' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Bitácora
                            </button>
                        </div>

                        {/* SIMULATOR WIDGET */}
                        <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-emerald-300 transition-colors group">
                            <CalendarDays className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">SIMULADOR</div>
                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block"></div>
                            <input
                                type="date"
                                value={currentDate}
                                onChange={(e) => {
                                    setCurrentDate(e.target.value);
                                    toast.info(`Fecha simulada: ${e.target.value}`);
                                }}
                                className="bg-transparent border-none p-0 text-sm text-slate-700 dark:text-slate-200 font-mono font-medium focus:ring-0 outline-none w-32 cursor-pointer"
                            />
                        </div>

                        {/* SETTINGS BUTTON */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        {/* ADD TASK BUTTON */}
                        <button
                            onClick={() => setEditingTask({} as any)}
                            className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-4 py-1.5 rounded-full hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Nueva Tarea</span>
                        </button>
                        <ModeToggle />
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">

                {/* TABS (Mobile) */}
                <div className="flex md:hidden bg-slate-100/50 p-1 rounded-lg border border-slate-200 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("schedule")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab("kanban")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'kanban' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <Kanban className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab("gantt")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'gantt' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <CalendarDays className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab("financial")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'financial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Wallet className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <BarChart2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab("logs")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <BookOpen className="w-4 h-4" />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'schedule' ? (
                        <motion.div
                            key="schedule"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* STAT CARDS */}
                            <StatsOverview
                                progressPercent={progressPercent}
                                currentPhase={currentPhase}
                                completedCount={completedCount}
                                lateCount={lateCount}
                                rainDaysCount={rainDays.length}
                                totalDelay={rainDays.length} // Simplified Estimate
                            />

                            {/* TASK LIST */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-800">Cronograma de Ejecución</h2>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Listo</div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white border border-blue-400"></div>En Curso</div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-100 border border-red-300"></div>Atrasado</div>
                                    </div>
                                </div>

                                <div className="relative pl-4 sm:pl-0">
                                    {/* Main Timeline Line (Visible on Desktop) */}
                                    <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-200 hidden md:block"></div>

                                    <div className="space-y-4">
                                        {filteredCategories.map((cat) => (
                                            <TaskCategory
                                                key={cat}
                                                category={cat}
                                                tasks={filteredTasks.filter(t => t.category === cat)}
                                                isOpen={openCategories.includes(cat) || !!searchTerm} // Auto-expand on search
                                                onToggle={toggleCategory}
                                                onToggleTaskstatus={handleStatusChange}
                                                onEditTask={setEditingTask}
                                                onDeleteTask={handleDeleteTask}
                                            />
                                        ))}
                                        {filteredCategories.length === 0 && (
                                            <div className="text-center py-12 text-slate-400">
                                                No se encontraron tareas para "{searchTerm}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute left-[15px] bottom-0 w-2 h-2 rounded-full bg-slate-300 hidden md:block"></div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'kanban' ? (
                        <motion.div
                            key="kanban"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <KanbanView
                                tasks={filteredTasks}
                                onStatusChange={handleStatusChange}
                            />
                        </motion.div>
                    ) : activeTab === 'gantt' ? (
                        <motion.div
                            key="gantt"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="h-[600px]"
                        >
                            <GanttView
                                tasks={filteredTasks}
                                logs={logs}
                                currentDate={currentDate}
                                rainDays={rainDays}
                                onRainDelay={handleRainDelay}
                                onUpdateTask={handleUpdateTask}
                            />
                        </motion.div>
                    ) : activeTab === 'financial' ? (
                        <motion.div
                            key="financial"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <FinancialView tasks={tasks} logs={logs} />
                        </motion.div>
                    ) : activeTab === 'analytics' ? (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AnalyticsView tasks={tasks} logs={logs} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="logs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DailyLogView
                                currentDate={currentDate}
                                logs={logs}
                                categories={categories}
                                onSaveLog={handleSaveLog}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {!!editingTask && (
                    <TaskEditDialog
                        task={Object.keys(editingTask).length === 0 ? undefined : editingTask}
                        tasks={tasks}
                        categories={categories}
                        isOpen={!!editingTask}
                        onClose={() => setEditingTask(null)}
                        onSave={handleUpdateTask}
                    />
                )}

                <SettingsDialog
                    settings={projectSettings}
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    onSave={setProjectSettings}
                />
            </main>

            {/* FOOTER TOOLS */}
            <div className="max-w-5xl mx-auto px-8 pb-12 pt-4 border-t border-slate-200 mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex gap-4">
                        <button onClick={handleExportTasks} className="flex items-center gap-2 hover:text-slate-800 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Exportar Cronograma
                        </button>
                        <button onClick={handleExportLogs} className="flex items-center gap-2 hover:text-slate-800 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Exportar Bitácora
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center gap-2 hover:text-slate-800 transition-colors">
                            <FileText className="w-3.5 h-3.5" /> Exportar PDF
                        </button>
                    </div>
                    <button onClick={handleResetData} className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Borrar Datos Locales (Reset)
                    </button>
                </div>
            </div>
        </div>
    );
}
