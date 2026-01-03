import { useState, useEffect } from 'react';
import { Task, LogEntry, ProjectSettings, TaskStatus } from '../types';
import { INITIAL_TASKS } from '../data';
import { recalculateSchedule } from '../scheduler';
import { toast } from 'sonner';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export function useDashboardState(selectedProjectId: string | null, user: any) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
        title: "Cargando...",
        subtitle: "Gestión de Obra",
        totalBudget: 0
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [rainDays, setRainDays] = useState<string[]>([]);

    // 1. Initial Load and Realtime Sync from Firestore
    useEffect(() => {
        if (!selectedProjectId) return;

        setIsLoaded(false);
        const projectDocRef = doc(db, 'projects', selectedProjectId);

        // Listen for changes
        const unsubscribe = onSnapshot(projectDocRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.tasks) setTasks(data.tasks);
                if (data.logs) setLogs(data.logs);
                if (data.settings) setProjectSettings(data.settings);
                if (data.rainDays) setRainDays(data.rainDays);
            } else {
                // Initialize if project doesn't exist in Firestore
                setTasks(INITIAL_TASKS);
                setLogs([]);
                setRainDays([]);
                // Note: projectSettings will be set via ProjectSelector or a default
            }
            setIsLoaded(true);
        }, (error) => {
            console.error("Error syncing Firestore:", error);
            toast.error("Error al sincronizar datos");
        });

        return () => unsubscribe();
    }, [selectedProjectId]);

    // Helper to update Firestore
    const saveToFirestore = async (updates: any) => {
        if (!selectedProjectId) return;
        try {
            const projectDocRef = doc(db, 'projects', selectedProjectId);
            await setDoc(projectDocRef, updates, { merge: true });
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            toast.error("Error al guardar cambios");
        }
    };

    // 3. Actions
    const handleRainDelay = async (date: string) => {
        if (!user) {
            toast.error("Acceso denegado.");
            return;
        }
        const newRainDays = rainDays.includes(date)
            ? rainDays.filter(d => d !== date)
            : [...rainDays, date];

        const newTasks = recalculateSchedule(tasks, newRainDays);

        await saveToFirestore({
            rainDays: newRainDays,
            tasks: newTasks
        });
        toast.info(rainDays.includes(date) ? "Día de lluvia eliminado" : "Día de lluvia registrado");
    };

    const handleSaveLog = async (log: LogEntry) => {
        if (!user) return;
        const index = logs.findIndex(l => l.date === log.date);
        let newLogs = [...logs];
        if (index >= 0) {
            newLogs[index] = log;
        } else {
            newLogs = [...logs, log];
        }
        await saveToFirestore({ logs: newLogs });
        toast.success("Bitácora guardada");
    };

    const handleUpdateTask = async (updated: Task) => {
        if (!user) return;
        const exists = tasks.some(t => t.id === updated.id);
        let newTasks = exists
            ? tasks.map(t => t.id === updated.id ? updated : t)
            : [...tasks, updated];

        const finalTasks = recalculateSchedule(newTasks, rainDays);
        await saveToFirestore({ tasks: finalTasks });
        toast.success("Tarea actualizada");
    };

    const handleDeleteTask = async (id: string) => {
        if (!user) return;
        const taskToDelete = tasks.find(t => t.id === id);
        if (!taskToDelete) return;
        const newTasks = tasks.filter(t => t.id !== id);
        await saveToFirestore({ tasks: newTasks });
        toast.success("Tarea eliminada");
    };

    const handleStatusChange = async (id: string, status: TaskStatus) => {
        if (!user) return;
        const newTasks = tasks.map(t => t.id === id ? { ...t, status } : t);
        await saveToFirestore({ tasks: newTasks });
    };

    const updateSettings = async (settings: ProjectSettings) => {
        await saveToFirestore({ settings });
    };

    const resetData = async () => {
        if (selectedProjectId && confirm("¿Borrar todos los datos de este proyecto?")) {
            await saveToFirestore({
                tasks: INITIAL_TASKS,
                logs: [],
                rainDays: []
            });
            toast.success("Datos reseteados");
        }
    };

    return {
        tasks,
        setTasks,
        logs,
        projectSettings,
        setProjectSettings: updateSettings,
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
