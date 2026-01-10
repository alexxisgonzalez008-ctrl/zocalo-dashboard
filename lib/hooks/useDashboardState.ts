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
        title: "...",
        subtitle: "Gestión de Obra",
        totalBudget: 0
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [rainDays, setRainDays] = useState<string[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

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
                if (data.settings) {
                    setProjectSettings(data.settings);
                } else {
                    // Fallback settings if document exists but settings field is missing
                    setProjectSettings(prev => ({ ...prev, title: "Proyecto Sin Nombre" }));
                }
                if (data.rainDays) setRainDays(data.rainDays);
                if (data.documents) setDocuments(data.documents);
            } else {
                // Initialize if project doesn't exist in Firestore
                setTasks(INITIAL_TASKS);
                setLogs([]);
                setRainDays([]);
                setDocuments([]);
                setProjectSettings({
                    title: "Nuevo Proyecto",
                    subtitle: "Gestión de Obra",
                    totalBudget: 0
                });
            }
            setIsLoaded(true);
        }, (error) => {
            console.error("Error syncing Firestore:", error);
            toast.error("Error al sincronizar datos");
        });

        return () => unsubscribe();
    }, [selectedProjectId]);

    // 1b. Fetch Documents from Prisma API
    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchDocs = async () => {
            setLoadingDocs(true);
            try {
                const res = await fetch(`/api/documents?projectId=${selectedProjectId}`);
                const data = await res.json();
                setDocuments(data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setLoadingDocs(false);
            }
        };

        fetchDocs();
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

    const handleUploadDocument = async (docData: any) => {
        if (!user || !selectedProjectId) return;
        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...docData,
                    projectId: selectedProjectId
                })
            });
            const newDoc = await res.json();
            setDocuments(prev => [newDoc, ...prev]);
            toast.success("Documento registrado");
        } catch (error) {
            toast.error("Error al registrar documento");
        }
    };

    const handleDeleteDocument = async (id: string) => {
        if (!user) return;
        try {
            await fetch(`/api/documents/${id}`, { method: 'DELETE' });
            setDocuments(prev => prev.filter(d => d.id !== id));
            toast.success("Documento eliminado");
        } catch (error) {
            toast.error("Error al eliminar documento");
        }
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
        documents,
        handleUploadDocument,
        handleDeleteDocument,
        resetData,
        isLoaded
    };
}
