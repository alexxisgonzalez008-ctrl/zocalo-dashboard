"use client";

import React, { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { Plus, Folder, Calendar, ArrowRight, Trash2, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ProjectSelectorProps {
    onSelect: (projectId: string) => void;
}

export default function ProjectSelector({ onSelect }: ProjectSelectorProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedProjects = localStorage.getItem('islara_projects_list');
            const legacyTasks = localStorage.getItem('islara_tasks');

            if (savedProjects) {
                setProjects(JSON.parse(savedProjects));
            } else if (legacyTasks) {
                // Migration: Create "Islara" project if old data exists
                const settings = localStorage.getItem('islara_settings');
                let projectName = 'Islara (Anterior)';
                if (settings) {
                    const parsed = JSON.parse(settings);
                    if (parsed.title) projectName = parsed.title;
                }

                const defaultProject: Project = {
                    id: 'islara-default',
                    name: projectName,
                    description: 'Proyecto migrado del sistema anterior',
                    createdAt: new Date().toISOString()
                };
                const list = [defaultProject];
                setProjects(list);
                localStorage.setItem('islara_projects_list', JSON.stringify(list));

                // Migrate keys
                localStorage.setItem(`p_islara-default_tasks`, legacyTasks!);
                const logs = localStorage.getItem('islara_logs');
                if (logs) localStorage.setItem(`p_islara-default_logs`, logs);
                if (settings) localStorage.setItem(`p_islara-default_settings`, settings);
                const rain = localStorage.getItem('islara_rain_days');
                if (rain) localStorage.setItem(`p_islara-default_rain_days`, rain);
            }
        }
    }, []);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const newProject: Project = {
            id: `project-${Date.now()}`,
            name: newName,
            description: newDesc,
            createdAt: new Date().toISOString()
        };

        const updated = [...projects, newProject];
        setProjects(updated);
        localStorage.setItem('islara_projects_list', JSON.stringify(updated));

        // Initialize project data if needed (Dashboard handles empty state)

        setIsCreating(false);
        setNewName('');
        setNewDesc('');
        toast.success(`Proyecto "${newName}" creado`);
    };

    const deleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("¿Estás seguro de eliminar este proyecto y todos sus datos?")) {
            const updated = projects.filter(p => p.id !== id);
            setProjects(updated);
            localStorage.setItem('islara_projects_list', JSON.stringify(updated));

            // Clean up project data
            localStorage.removeItem(`p_${id}_tasks`);
            localStorage.removeItem(`p_${id}_logs`);
            localStorage.removeItem(`p_${id}_settings`);
            localStorage.removeItem(`p_${id}_rain_days`);

            toast.info("Proyecto eliminado");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Mis Proyectos</h1>
                    <p className="text-slate-500 dark:text-slate-400">Selecciona o crea un nuevo proyecto para comenzar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card */}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-slate-400 hover:text-emerald-600"
                    >
                        <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-semibold">Nuevo Proyecto</span>
                    </button>

                    {/* Project Cards */}
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onSelect(project.id)}
                            className="group relative h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-400 transition-colors">
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    <button
                                        onClick={(e) => deleteProject(project.id, e)}
                                        className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{project.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-2 mt-1">{project.description || 'Sin descripción'}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsCreating(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <h2 className="text-xl font-bold dark:text-white">Nuevo Proyecto</h2>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de la Obra</label>
                                    <input
                                        autoFocus
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Ej. Casa Bosque, Edificio Central..."
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción (Opcional)</label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                        rows={3}
                                        placeholder="Detalles sobre la ubicación o el tipo de obra..."
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all font-medium"
                                    >
                                        Crear Proyecto
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
