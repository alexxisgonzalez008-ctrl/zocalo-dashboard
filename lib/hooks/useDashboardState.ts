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

    // 1. Initial Load from Prisma APIs
    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchData = async () => {
            setIsLoaded(false);
            try {
                // Fetch Tasks
                const tasksRes = await fetch(`/api/tasks?projectId=${selectedProjectId}`);
                const tasksData = await tasksRes.json();

                // Fetch Logs
                const logsRes = await fetch(`/api/daily-logs?projectId=${selectedProjectId}`);
                const logsData = await logsRes.json();

                // TODO: Fetch settings and rainDays from a dedicated project API if needed
                // For now we keep settings and rainDays as local/mocked or expand the API

                if (Array.isArray(tasksData)) setTasks(tasksData.map((t: any) => ({
                    ...t,
                    start: t.start.split('T')[0],
                    end: t.end.split('T')[0]
                })));

                if (Array.isArray(logsData)) setLogs(logsData.map((l: any) => ({
                    ...l,
                    date: l.date.split('T')[0]
                })));

                setIsLoaded(true);
            } catch (error) {
                console.error("Error fetching project data:", error);
                toast.error("Error al cargar datos del proyecto");
            }
        };

        fetchData();
    }, [selectedProjectId]);

    // 1b. Fetch Documents from Prisma API
    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchDocs = async () => {
            setLoadingDocs(true);
            try {
                const res = await fetch(`/api/documents?projectId=${selectedProjectId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setDocuments(data);
                } else {
                    console.error("Invalid documents data:", data);
                    setDocuments([]);
                }
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

    // 3. Actions (Migrated to Prisma APIs)
    const handleRainDelay = async (date: string) => {
        if (!user) {
            toast.error("Acceso denegado.");
            return;
        }
        const newRainDays = rainDays.includes(date)
            ? rainDays.filter(d => d !== date)
            : [...rainDays, date];

        const newTasks = recalculateSchedule(tasks, newRainDays);
        setRainDays(newRainDays);
        setTasks(newTasks);

        // Note: Currently rainDays are handled locally as they don't have a Prisma model yet
        toast.info(rainDays.includes(date) ? "Día de lluvia eliminado" : "Día de lluvia registrado");
    };

    const handleSaveLog = async (log: LogEntry) => {
        if (!user || !selectedProjectId) return;
        try {
            const res = await fetch('/api/daily-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...log, projectId: selectedProjectId })
            });
            const savedLog = await res.json();
            setLogs(prev => {
                const existing = prev.findIndex(l => l.date === log.date);
                if (existing >= 0) {
                    const next = [...prev];
                    next[existing] = { ...savedLog, date: savedLog.date.split('T')[0] };
                    return next;
                }
                return [...prev, { ...savedLog, date: savedLog.date.split('T')[0] }];
            });
            toast.success("Bitácora guardada");
        } catch (error) {
            toast.error("Error al guardar bitácora");
        }
    };

    const handleUpdateTask = async (updated: Task) => {
        if (!user || !selectedProjectId) return;
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updated, projectId: selectedProjectId })
            });
            const savedTask = await res.json();
            const formattedTask = { ...savedTask, start: savedTask.start.split('T')[0], end: savedTask.end.split('T')[0] };

            setTasks(prev => {
                const exists = prev.some(t => t.id === formattedTask.id);
                const next = exists
                    ? prev.map(t => t.id === formattedTask.id ? formattedTask : t)
                    : [...prev, formattedTask];
                return recalculateSchedule(next, rainDays);
            });
            toast.success("Tarea actualizada");
        } catch (error) {
            toast.error("Error al actualizar tarea");
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!user) return;
        // Basic local delete for now, should add DELETE /api/tasks/[id]
        setTasks(prev => prev.filter(t => t.id !== id));
        toast.success("Tarea eliminada localmente");
    };

    const handleStatusChange = async (id: string, status: TaskStatus) => {
        if (!user) return;
        const task = tasks.find(t => t.id === id);
        if (task) {
            handleUpdateTask({ ...task, status });
        }
    };

    const updateSettings = async (settings: ProjectSettings) => {
        setProjectSettings(settings);
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
            // Evitar duplicación si ya existe (Next.js dev mode/race conditions)
            setDocuments(prev => {
                const results = Array.isArray(prev) ? prev : [];
                if (results.some(d => d.id === newDoc.id)) return results;
                return [newDoc, ...results];
            });
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
