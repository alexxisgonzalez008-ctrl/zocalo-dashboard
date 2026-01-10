"use client";

import React, { useState, useMemo, useEffect } from "react";
import { startOfDay, isBefore, isAfter, addDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
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
    Plus,
    Calendar as CalendarIcon,
    LogOut,
    Home,
    UserPlus,
    Package
} from "lucide-react";
import ShareDialog from "./ShareDialog";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { Task, TaskStatus, LogEntry, Project, ProjectSettings } from "@/lib/types";
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
import SettingsDialog from "./SettingsDialog";
import ProjectSelector from "./ProjectSelector";
import OrdersView from "./OrdersView";
import { generatePDFReport } from "@/lib/pdf";
import DocumentsView from "./DocumentsView";
import { AnimatePresence, motion } from "framer-motion";
import { ModeToggle } from "./ModeToggle";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "./LoginPage";
import { GoogleCalendarProvider } from "@/contexts/GoogleCalendarContext";
import CalendarView from "./CalendarView";
import { cn } from "@/lib/utils";
import CopilotPanel from "./Copilot/CopilotPanel";

const NAV_TABS = [
    { id: 'overview', label: 'Panel', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'kanban', label: 'Tablero', icon: <Kanban className="w-4 h-4" /> },
    { id: 'gantt', label: 'Gantt', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'calendar', label: 'Agenda', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'financial', label: 'Finanzas', icon: <Wallet className="w-4 h-4" /> },
    { id: 'orders', label: 'Pedidos', icon: <Package className="w-4 h-4" /> },
    { id: 'analytics', label: 'Métricas', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'logs', label: 'Bitácora', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'documents', label: 'Documentos', icon: <FileText className="w-4 h-4" /> },
];
import { useDashboardState } from "@/lib/hooks/useDashboardState";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const {
        tasks,
        setTasks,
        logs,
        projectSettings,
        setProjectSettings,
        rainDays,
        handleRainDelay,
        handleSaveLog,
        handleUpdateTask,
        handleDeleteTask,
        handleStatusChange,
        documents,
        handleUploadDocument,
        handleDeleteDocument,
        resetData,
        isLoaded
    } = useDashboardState(selectedProjectId, user);

    const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [openCategories, setOpenCategories] = useState<string[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'gantt' | 'financial' | 'analytics' | 'logs' | 'calendar' | 'orders' | 'documents'>('overview');

    // Invitation Handling Logic
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const inviteId = urlParams.get('invite');

        if (inviteId && user) {
            const handleInvitation = async () => {
                try {
                    const projectListDoc = doc(db, 'projects_list', inviteId);
                    const snapshot = await getDoc(projectListDoc);

                    if (snapshot.exists()) {
                        await updateDoc(projectListDoc, {
                            members: arrayUnion(user.id)
                        });
                        toast.success(`Te has unido al proyecto: ${snapshot.data().name}`);
                        // Clear param and select project
                        window.history.replaceState({}, '', window.location.pathname);
                        setSelectedProjectId(inviteId);
                    } else {
                        toast.error("El enlace de invitación ya no es válido");
                    }
                } catch (error) {
                    console.error("Error joining project:", error);
                }
            };
            handleInvitation();
        }
    }, [user, setSelectedProjectId]);

    // Initialize categories (Dynamic based on tasks)
    const categories = useMemo(() => {
        const base = Array.from(new Set(INITIAL_TASKS.map((t: Task) => t.category)));
        const current = Array.from(new Set(tasks.map((t: Task) => t.category)));
        return Array.from(new Set([...base, ...current]));
    }, [tasks]);

    // Update statuses when date changes
    useEffect(() => {
        if (!isLoaded) return;

        setTasks((prevTasks: Task[]) => {
            const now = startOfDay(new Date(currentDate));

            const newTasks = prevTasks.map((task: Task) => {
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
                (newTasks as Task[])
                    .filter((t: Task) => t.status === 'in-progress' || t.status === 'late')
                    .map((t: Task) => t.category)
            );

            setOpenCategories((prev: string[]) => Array.from(new Set([...prev, ...Array.from(activeCategories)])) as string[]);

            return newTasks as Task[];
        });
    }, [currentDate, isLoaded]); // Simplified to depend on currentDate and isLoaded

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleExportTasks = () => {
        try {
            const csv = exportTasksToCSV(tasks);
            downloadCSV(csv, `${projectSettings.title.replace(/\s+/g, '_')}_Cronograma_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success("Cronograma exportado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al exportar cronograma");
        }
    };

    const handleExportLogs = () => {
        try {
            const csv = exportLogsToCSV(logs);
            downloadCSV(csv, `${projectSettings.title.replace(/\s+/g, '_')}_Bitacora_${new Date().toISOString().split('T')[0]}.csv`);
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

    // Filtered Data
    const filteredTasks = useMemo(() => {
        let result = tasks;
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = tasks.filter((t: Task) =>
                t.name.toLowerCase().includes(lower) ||
                t.category.toLowerCase().includes(lower) ||
                t.id.toLowerCase().includes(lower)
            );
        }
        return [...result].sort((a: Task, b: Task) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [tasks, searchTerm]);

    const filteredCategories = useMemo(() => {
        return Array.from(new Set(filteredTasks.map((t: Task) => t.category)));
    }, [filteredTasks]);

    // Stats
    const totalTasks = tasks.length;
    const completedCount = tasks.filter((t: Task) => t.status === 'completed').length;
    const lateCount = tasks.filter((t: Task) => t.status === 'late').length;
    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    const currentPhase = tasks.find((t: Task) => t.status === 'in-progress')?.category.split('. ')[1] || "Sin Actividad";

    if (!user) return <LoginPage />;
    if (!selectedProjectId) return <ProjectSelector onSelect={setSelectedProjectId} />;

    return (
        <GoogleCalendarProvider settings={projectSettings}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-900 dark:selection:text-emerald-100 overflow-x-hidden flex flex-col w-full">

                {/* 1. HEADER */}
                <header className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-4">
                        {/* BRAND */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedProjectId(null)}
                                className="p-2 mr-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
                                title="Volver a la selección de proyectos"
                            >
                                <Home className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                                    <Hammer className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white leading-tight">ZOCALO</h1>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest text-left truncate max-w-[120px] md:max-w-[200px]">{projectSettings.title}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                            {/* TABS (Desktop) */}
                            <nav className="hidden lg:flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                {NAV_TABS.map(tab => (
                                    <TabButton
                                        key={tab.id}
                                        active={activeTab === tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        icon={tab.icon}
                                        label={tab.label}
                                    />
                                ))}
                            </nav>

                            <div className="flex items-center gap-2">
                                <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5 w-32 xl:w-40 border border-slate-200 dark:border-slate-700">
                                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full border border-emerald-500/20" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">{user.username}</span>
                                </div>
                                <ModeToggle />
                                <button
                                    onClick={() => setIsShareOpen(true)}
                                    className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                    title="Compartir Proyecto"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => (window as any).logout ? (window as any).logout() : logout()}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2. MAIN CONTENT */}
                <main className="flex-1 max-w-[1280px] mx-auto w-full p-4 md:p-8 space-y-6">
                    {/* SIMULATOR BAR (only on Gantt or Calendar) */}
                    {(activeTab === 'gantt' || activeTab === 'calendar') && (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600">
                                    <CalendarDays className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Simulador de Tiempo</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Ajusta la fecha de hoy para visualizar el avance del proyecto.</p>
                                </div>
                            </div>
                            <input
                                type="date"
                                value={currentDate}
                                onChange={(e) => {
                                    setCurrentDate(e.target.value);
                                    toast.info(`Simulando fecha: ${e.target.value}`);
                                }}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' ? (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Panel de Control</h2>
                                        <p className="text-slate-500 font-medium">Estado actual del proyecto - {format(parseISO(currentDate), 'EEEE dd MMM', { locale: es })}</p>
                                    </div>
                                    <button
                                        onClick={() => setEditingTask({} as Task)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                                    >
                                        <Plus className="w-5 h-5" /> Nueva Tarea
                                    </button>
                                </div>

                                <StatsOverview
                                    progressPercent={progressPercent}
                                    currentPhase={currentPhase}
                                    completedCount={completedCount}
                                    lateCount={lateCount}
                                />

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                <Hammer className="w-5 h-5 text-emerald-600" /> Cronograma de Ejecución
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            {filteredTasks.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all text-center">
                                                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
                                                        <Plus className="w-10 h-10 text-emerald-600" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No hay tareas registradas</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8">
                                                        Tu cronograma está vacío. Comienza agregando la primera tarea para organizar la ejecución de tu obra.
                                                    </p>
                                                    <button
                                                        onClick={() => setEditingTask({} as Task)}
                                                        className="px-8 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all active:scale-95"
                                                    >
                                                        Crear mi primera tarea
                                                    </button>
                                                </div>
                                            ) : (
                                                filteredCategories.map(cat => (
                                                    <TaskCategory
                                                        key={cat}
                                                        category={cat}
                                                        tasks={filteredTasks.filter(t => t.category === cat)}
                                                        isOpen={openCategories.includes(cat) || !!searchTerm}
                                                        onToggle={toggleCategory}
                                                        onToggleTaskstatus={handleStatusChange}
                                                        onEditTask={setEditingTask}
                                                        onDeleteTask={handleDeleteTask}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <BarChart2 className="w-5 h-5 text-blue-600" /> Resumen Financiero
                                        </h3>
                                        <FinancialView tasks={tasks} logs={logs} settingsBudget={projectSettings.totalBudget} />
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === 'kanban' ? (
                            <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <KanbanView tasks={filteredTasks} onStatusChange={handleStatusChange} />
                            </motion.div>
                        ) : activeTab === 'gantt' ? (
                            <motion.div key="gantt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <GanttView
                                    tasks={filteredTasks}
                                    logs={logs}
                                    currentDate={currentDate}
                                    rainDays={rainDays}
                                    onRainDelay={handleRainDelay}
                                    onUpdateTask={handleUpdateTask}
                                />
                            </motion.div>
                        ) : activeTab === 'calendar' ? (
                            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <CalendarView
                                    onOpenSettings={() => setIsSettingsOpen(true)}
                                    tasks={tasks}
                                />
                            </motion.div>
                        ) : activeTab === 'financial' ? (
                            <motion.div key="financial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <FinancialView tasks={tasks} logs={logs} settingsBudget={projectSettings.totalBudget} />
                            </motion.div>
                        ) : activeTab === 'analytics' ? (
                            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <AnalyticsView tasks={tasks} logs={logs} />
                            </motion.div>
                        ) : activeTab === 'orders' ? (
                            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <OrdersView projectId={selectedProjectId || ""} />
                            </motion.div>
                        ) : activeTab === 'logs' ? (
                            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <DailyLogView
                                    currentDate={currentDate}
                                    logs={logs}
                                    categories={categories}
                                    onSaveLog={handleSaveLog}
                                    onDateChange={setCurrentDate}
                                />
                            </motion.div>
                        ) : (
                            <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <DocumentsView
                                    documents={documents}
                                    onUpload={handleUploadDocument}
                                    onDelete={handleDeleteDocument}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* MODALS */}
                <ShareDialog
                    isOpen={isShareOpen}
                    onClose={() => setIsShareOpen(false)}
                    projectId={selectedProjectId || ''}
                    projectName={projectSettings.title}
                />
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

                {/* MOBILE FAB (Optional) */}
                <div className="fixed bottom-6 right-6 lg:hidden z-50">
                    <button
                        onClick={() => setEditingTask({} as any)}
                        className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-600/30 active:scale-95 transition-transform"
                    >
                        <Plus className="w-8 h-8" />
                    </button>
                </div>
                {/* MOBILE NAVIGATION */}
                <nav className="lg:hidden fixed bottom-1 left-0 right-0 z-[60] px-3 pb-safe">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl flex items-center justify-around p-1 max-w-lg mx-auto overflow-x-auto no-scrollbar">
                        {NAV_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all flex-1 min-w-[50px]",
                                    activeTab === tab.id
                                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-400/10"
                                        : "text-slate-500 dark:text-slate-400"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-lg mb-0.5",
                                    activeTab === tab.id ? "bg-emerald-100 dark:bg-emerald-400/20" : ""
                                )}>
                                    {React.cloneElement(tab.icon as React.ReactElement, { className: "w-5 h-5 shadow-sm" })}
                                </div>
                                <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>
                <CopilotPanel projectId={selectedProjectId} />
            </div>
        </GoogleCalendarProvider>
    );
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-all whitespace-nowrap",
                active
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
        >
            <div className="flex-shrink-0">{icon}</div>
            <span className="truncate">{label}</span>
        </button>
    );
}
