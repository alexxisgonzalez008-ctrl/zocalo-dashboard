import React, { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { X, Save, DollarSign, Calendar, Tag, Plus } from "lucide-react";
import { Task } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface TaskEditDialogProps {
    task?: Task;
    tasks: Task[]; // All available tasks for dependencies
    categories: string[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedTask: Task) => void;
}

export default function TaskEditDialog({ task, tasks, categories, isOpen, onClose, onSave }: TaskEditDialogProps) {
    const [name, setName] = useState(task?.name || "");
    const [category, setCategory] = useState(task?.category || categories[0] || "");
    const [start, setStart] = useState(task?.start || new Date().toISOString().split('T')[0]);
    const [end, setEnd] = useState(task?.end || new Date().toISOString().split('T')[0]);
    const [budget, setBudget] = useState(task?.budget?.toString() || "0");
    const [dependencies, setDependencies] = useState<string[]>(task?.dependencies || []);
    const [locked, setLocked] = useState(task?.locked || false);
    const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium");
    const [assigneeName, setAssigneeName] = useState(task?.assignee?.name || "");
    const [subtasks, setSubtasks] = useState(task?.subtasks || []);
    const [timeEntries, setTimeEntries] = useState(task?.timeEntries || []);

    useEffect(() => {
        if (isOpen) {
            setName(task?.name || "");
            setCategory(task?.category || categories[0] || "");
            setStart(task?.start || new Date().toISOString().split('T')[0]);
            setEnd(task?.end || new Date().toISOString().split('T')[0]);
            setBudget(task?.budget?.toString() || "0");
            setDependencies(task?.dependencies || []);
            setLocked(task?.locked || false);
            setPriority(task?.priority || "medium");
            setAssigneeName(task?.assignee?.name || "");
            setSubtasks(task?.subtasks || []);
            setTimeEntries(task?.timeEntries || []);
        }
    }, [isOpen, task]);

    if (!isOpen) return null;

    const availableTasks = tasks.filter(t => t.id !== task?.id);

    const toggleDependency = (id: string) => {
        setDependencies(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    // Generate a sequential task ID based on category
    const generateSequentialId = (categoryName: string): string => {
        // Map category names to prefixes
        const prefixMap: Record<string, string> = {
            '1. PRELIMINARES': 'PRL',
            '2. FUNDACIONES': 'FUN',
            '3. EST Y MUROS': 'EST',
            '4. EST PA + INST PB': 'EPA',
            '5. CUBIERTAS E INST': 'CUB',
            '6. REV Y CONTRAPISOS': 'REV',
            '7. TERMINACIONES FINAS': 'TER',
            '8. CIERRE Y ENTREGA': 'CIE'
        };

        const prefix = prefixMap[categoryName] || 'TSK';

        // Find existing tasks in this category and get the highest number
        const categoryTasks = tasks.filter(t => t.category === categoryName);
        const existingNumbers = categoryTasks
            .map(t => {
                const match = t.id.match(new RegExp(`^${prefix}-(\\d+)$`));
                return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => n > 0);

        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...task,
            id: task?.id || generateSequentialId(category),
            category: category,
            status: task?.status || "pending",
            days: differenceInDays(new Date(end), new Date(start)) + 1,
            name,
            start,
            end,
            budget: parseFloat(budget) || 0,
            dependencies,
            locked,
            priority,
            assignee: assigneeName ? { name: assigneeName } : undefined,
            subtasks,
            timeEntries
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 max-h-[90vh] border dark:border-slate-800 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{task ? "Editar Tarea" : "Nueva Tarea"}</h3>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1"><Tag className="w-3 h-3" /> Categoría</label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-white dark:bg-slate-900">{cat}</option>
                                        ))}
                                        <option value="NEW">+ Nueva Categoría...</option>
                                    </select>
                                    {category === 'NEW' && (
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Nombre de categoría"
                                            className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            onBlur={(e) => {
                                                if (e.target.value.trim()) setCategory(e.target.value.trim());
                                                else setCategory(categories[0] || "");
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if ((e.target as HTMLInputElement).value.trim()) setCategory((e.target as HTMLInputElement).value.trim());
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Inicio
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        value={start}
                                        onChange={e => setStart(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Fin
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        value={end}
                                        onChange={e => setEnd(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Presupuesto
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 font-medium">$</span>
                                    <input
                                        type="number"
                                        className="w-full p-2 pl-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono"
                                        value={budget}
                                        onChange={e => setBudget(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Prioridad</label>
                                    <select
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                                        value={priority}
                                        onChange={e => setPriority(e.target.value as any)}
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Responsable</label>
                                    <input
                                        type="text"
                                        placeholder="Nombre..."
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                                        value={assigneeName}
                                        onChange={e => setAssigneeName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* TIMESHEETS MANAGER */}
                            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
                                    <span>Registro de Horas (Timesheets)</span>
                                    <button
                                        type="button"
                                        onClick={() => setTimeEntries([...timeEntries, { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], hours: 0, userId: "me" }])}
                                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 normal-case font-bold"
                                    >
                                        <Plus className="w-3 h-3" /> Registrar
                                    </button>
                                </label>
                                <div className="space-y-2">
                                    {timeEntries.map((te, idx) => (
                                        <div key={te.id} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                            <input
                                                type="date"
                                                className="bg-transparent border-none p-0 text-xs focus:ring-0 outline-none w-28 dark:text-slate-200"
                                                value={te.date}
                                                onChange={e => {
                                                    const next = [...timeEntries];
                                                    next[idx].date = e.target.value;
                                                    setTimeEntries(next);
                                                }}
                                            />
                                            <div className="flex items-center gap-1 flex-1 px-2 border-l border-slate-200 dark:border-slate-700">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="bg-transparent border-none p-0 text-sm focus:ring-0 outline-none w-10 font-bold dark:text-slate-100 placeholder:text-slate-300"
                                                    value={te.hours || ""}
                                                    onChange={e => {
                                                        const next = [...timeEntries];
                                                        next[idx].hours = parseFloat(e.target.value) || 0;
                                                        setTimeEntries(next);
                                                    }}
                                                />
                                                <span className="text-[10px] text-slate-400">hrs</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setTimeEntries(timeEntries.filter(e => e.id !== te.id))}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {timeEntries.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-2">No hay horas registradas aún.</p>}
                                </div>
                            </div>

                            {/* SUBTASKS MANAGER */}
                            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
                                    <span>Subtareas</span>
                                    <button
                                        type="button"
                                        onClick={() => setSubtasks([...subtasks, { id: crypto.randomUUID(), name: "", completed: false }])}
                                        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 normal-case font-bold"
                                    >
                                        <Plus className="w-3 h-3" /> Añadir
                                    </button>
                                </label>
                                <div className="space-y-2">
                                    {subtasks.map((st, idx) => (
                                        <div key={st.id} className="flex gap-2 items-center group">
                                            <input
                                                type="checkbox"
                                                checked={st.completed}
                                                onChange={e => {
                                                    const next = [...subtasks];
                                                    next[idx].completed = e.target.checked;
                                                    setSubtasks(next);
                                                }}
                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Descripción de la subtarea..."
                                                className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 outline-none dark:text-slate-200 placeholder:text-slate-400"
                                                value={st.name}
                                                onChange={e => {
                                                    const next = [...subtasks];
                                                    next[idx].name = e.target.value;
                                                    setSubtasks(next);
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {subtasks.length === 0 && <p className="text-[10px] text-slate-400 italic">No hay subtareas definidas.</p>}
                                </div>
                            </div>

                            {/* DEPENDENCIES & LOCK */}
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                        🔗 Predecesoras (Dependencias)
                                    </label>
                                    <div className="max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950/50 space-y-1 custom-scrollbar">
                                        {availableTasks.length === 0 ? (
                                            <p className="text-xs text-slate-400 dark:text-slate-500 italic p-1">No hay otras tareas disponibles.</p>
                                        ) : (
                                            availableTasks.map(t => (
                                                <div key={t.id} className="flex items-center gap-2 hover:bg-white dark:hover:bg-slate-800 p-1 rounded cursor-pointer transition-colors" onClick={() => toggleDependency(t.id)}>
                                                    <input
                                                        type="checkbox"
                                                        checked={dependencies.includes(t.id)}
                                                        onChange={() => toggleDependency(t.id)}
                                                        className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 relative z-0 bg-white dark:bg-slate-900"
                                                    />
                                                    <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{t.name}</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto bg-slate-100 dark:bg-slate-800 px-1 rounded">{t.start}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-amber-500" />
                                            Bloquear Tarea
                                        </label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Una tarea bloqueada <strong>no se moverá automáticamente</strong> por lluvias o dependencias.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={locked}
                                            onChange={e => setLocked(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                                >
                                    <Save className="w-4 h-4" /> Guardar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
