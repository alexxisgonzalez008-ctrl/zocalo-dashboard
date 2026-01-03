import { useState, useEffect, useMemo } from 'react';
import { Task, LogEntry, Project, ProjectSettings, TaskStatus } from '../types';
import { INITIAL_TASKS } from '../data';
import { recalculateSchedule } from '../scheduler';
import { toast } from 'sonner';
import { startOfDay, isBefore, isAfter } from 'date-fns';

export function useDashboardState(selectedProjectId: string | null, user: any) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
        title: "Islara",
        subtitle: "Gestión de Obra",
        totalBudget: 1500000
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [rainDays, setRainDays] = useState<string[]>([]);

    // 1. Initial Load when project changes
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedProjectId) {
            setIsLoaded(false);

            const savedTasks = localStorage.getItem(`p_${selectedProjectId}_tasks`);
            const savedLogs = localStorage.getItem(`p_${selectedProjectId}_logs`);
            const savedSettings = localStorage.getItem(`p_${selectedProjectId}_settings`);
            const savedRain = localStorage.getItem(`p_${selectedProjectId}_rain_days`);

            if (savedTasks) setTasks(JSON.parse(savedTasks));
            else setTasks(INITIAL_TASKS);

            if (savedLogs) setLogs(JSON.parse(savedLogs));
            else setLogs([]);

            if (savedSettings) {
                setProjectSettings(JSON.parse(savedSettings));
            } else {
                const list = JSON.parse(localStorage.getItem('islara_projects_list') || '[]');
                const p = list.find((p: Project) => p.id === selectedProjectId);
                setProjectSettings({
                    title: p?.name || "Nuevo Proyecto",
                    subtitle: "Gestión de Obra",
                    totalBudget: 0
                });
            }

            if (savedRain) setRainDays(JSON.parse(savedRain));
            else setRainDays([]);

            setIsLoaded(true);
        }
    }, [selectedProjectId]);

    // 2. Persistence
    useEffect(() => {
        if (isLoaded && selectedProjectId) {
            localStorage.setItem(`p_${selectedProjectId}_tasks`, JSON.stringify(tasks));
        }
    }, [tasks, selectedProjectId, isLoaded]);

    useEffect(() => {
        if (isLoaded && selectedProjectId) {
            localStorage.setItem(`p_${selectedProjectId}_logs`, JSON.stringify(logs));
        }
    }, [logs, selectedProjectId, isLoaded]);

    useEffect(() => {
        if (isLoaded && selectedProjectId) {
            localStorage.setItem(`p_${selectedProjectId}_settings`, JSON.stringify(projectSettings));
            localStorage.setItem(`p_${selectedProjectId}_rain_days`, JSON.stringify(rainDays));
        }
    }, [projectSettings, rainDays, selectedProjectId, isLoaded]);

    // 3. Actions
    const handleRainDelay = (date: string) => {
        if (!user) {
            toast.error("Acceso denegado.");
            return;
        }
        const newRainDays = rainDays.includes(date)
            ? rainDays.filter(d => d !== date)
            : [...rainDays, date];

        setRainDays(newRainDays);
        const newTasks = recalculateSchedule(tasks, newRainDays);
        setTasks(newTasks);
        toast.info(rainDays.includes(date) ? "Día de lluvia eliminado" : "Día de lluvia registrado");
    };

    const handleSaveLog = (log: LogEntry) => {
        if (!user) return;
        setLogs(prev => {
            const index = prev.findIndex(l => l.date === log.date);
            if (index >= 0) {
                const newLogs = [...prev];
                newLogs[index] = log;
                return newLogs;
            }
            return [...prev, log];
        });
        toast.success("Bitácora guardada");
    };

    const handleUpdateTask = (updated: Task) => {
        if (!user) return;
        setTasks(prev => {
            const exists = prev.some(t => t.id === updated.id);
            let newTasks = exists
                ? prev.map(t => t.id === updated.id ? updated : t)
                : [...prev, updated];
            return recalculateSchedule(newTasks, rainDays);
        });
        toast.success("Tarea actualizada");
    };

    const handleDeleteTask = (id: string) => {
        if (!user) return;
        const taskToDelete = tasks.find(t => t.id === id);
        if (!taskToDelete) return;
        setTasks(prev => prev.filter(t => t.id !== id));
        toast.success("Tarea eliminada", {
            action: { label: "Deshacer", onClick: () => setTasks(prev => [...prev, taskToDelete]) }
        });
    };

    const handleStatusChange = (id: string, status: TaskStatus) => {
        if (!user) return;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    const resetData = () => {
        if (selectedProjectId && confirm("¿Borrar todos los datos de este proyecto?")) {
            localStorage.removeItem(`p_${selectedProjectId}_tasks`);
            localStorage.removeItem(`p_${selectedProjectId}_logs`);
            localStorage.removeItem(`p_${selectedProjectId}_settings`);
            localStorage.removeItem(`p_${selectedProjectId}_rain_days`);
            window.location.reload();
        }
    };

    return {
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
        resetData,
        isLoaded
    };
}
