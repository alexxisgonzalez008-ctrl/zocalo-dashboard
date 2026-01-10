import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Trash2, Download, Search, HardDrive, File, Shield, Briefcase, FileSignature, Layers } from "lucide-react";
import { Document } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import DocumentUploadDialog from './DocumentUploadDialog';

interface DocumentsViewProps {
    documents: Document[];
    onUpload: (doc: any) => void;
    onDelete: (id: string) => void;
}

const CATEGORIES = [
    { id: 'planos', label: 'Planos Técnicos', icon: <Layers className="w-4 h-4" />, color: 'text-blue-600', border: 'border-blue-600', bg: 'bg-blue-50/50' },
    { id: 'contratos', label: 'Contratos y Facturas', icon: <FileSignature className="w-4 h-4" />, color: 'text-emerald-600', border: 'border-emerald-600', bg: 'bg-emerald-50/50' },
    { id: 'materiales', label: 'Listas de Materiales', icon: <Briefcase className="w-4 h-4" />, color: 'text-amber-600', border: 'border-amber-600', bg: 'bg-amber-50/50' },
    { id: 'otros', label: 'Otros Archivos', icon: <FileText className="w-4 h-4" />, color: 'text-slate-600', border: 'border-slate-600', bg: 'bg-slate-50/50' },
];

export default function DocumentsView({ documents = [], onUpload, onDelete }: DocumentsViewProps) {
    const [filter, setFilter] = useState<'all' | string>('all');
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const filteredDocs = (documents || []).filter(doc => {
        const matchesFilter = filter === 'all' || doc.category === filter;
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        Centro de Documentación
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 uppercase tracking-widest font-black">
                        ALMACENAMIENTO CENTRALIZADO DE ACTIVOS
                    </p>
                </div>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-black shadow-xl shadow-slate-900/10 dark:shadow-blue-500/20 transition-all active:scale-95 uppercase text-xs tracking-widest"
                >
                    <Plus className="w-4 h-4" /> Nuevo Documento
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o contenido..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto scrollbar-hide">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                            filter === 'all'
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                                : "bg-transparent text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300"
                        )}
                    >
                        Todos
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                                filter === cat.id
                                    ? `bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20`
                                    : "bg-transparent text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500/30 hover:text-blue-500"
                            )}
                        >
                            {cat.label.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {CATEGORIES.map(cat => {
                    const catDocs = filteredDocs.filter(d => d.category === cat.id);
                    if (filter !== 'all' && filter !== cat.id) return null;

                    return (
                        <Card key={cat.id} className="dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full border-t-4 transition-all hover:shadow-md" style={{ borderTopColor: cat.id === 'planos' ? '#2563eb' : cat.id === 'contratos' ? '#10b981' : cat.id === 'materiales' ? '#f59e0b' : '#64748b' }}>
                            <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-800/20">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("p-1.5 rounded-lg shadow-sm bg-white dark:bg-slate-800", cat.color)}>
                                            {cat.icon}
                                        </div>
                                        {cat.label}
                                    </div>
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[9px] text-slate-500 font-bold">
                                        {catDocs.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col">
                                <div className="divide-y divide-slate-50 dark:divide-slate-800/50 flex-1">
                                    <AnimatePresence mode="popLayout">
                                        {catDocs.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex flex-col items-center justify-center p-8 text-center"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2">
                                                    <File className="w-5 h-5 text-slate-300" />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Sin archivos</p>
                                            </motion.div>
                                        ) : (
                                            catDocs.map(doc => {
                                                const handleOpenDocument = (e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    if (doc.url === '#' || !doc.url) {
                                                        toast.info(`Simulando apertura de: ${doc.name}`, {
                                                            description: "En una versión productiva, esto abriría el archivo desde el almacenamiento persistente.",
                                                        });
                                                    } else {
                                                        window.open(doc.url, '_blank');
                                                    }
                                                };

                                                return (
                                                    <motion.div
                                                        key={doc.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        onClick={handleOpenDocument}
                                                        className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{doc.name}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[8px] font-black uppercase text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{doc.type}</span>
                                                                    <span className="text-[8px] text-slate-400 font-bold">{doc.size}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0 transition-all">
                                                            <button
                                                                onClick={handleOpenDocument}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-all"
                                                                title="Abrir Documento"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDelete(doc.id);
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-all"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        )}
                                    </AnimatePresence>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                <div className="p-5 bg-white/5 backdrop-blur-xl rounded-2xl shadow-inner relative z-10 border border-white/10">
                    <Shield className="w-10 h-10 text-blue-400" />
                </div>
                <div className="relative z-10 space-y-2 text-center md:text-left">
                    <h4 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Vault de Seguridad Pro</h4>
                    <p className="text-slate-400 text-sm font-medium max-w-md">Tus activos técnicos se almacenan con redundancia en la nube. Acceso seguro y trazabilidad de cambios en cada documento.</p>
                </div>
                <div className="ml-auto hidden xl:block relative z-10">
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">En Línea</p>
                            <p className="text-lg font-black tracking-tighter text-white">SERVIDOR: ISLARA-01</p>
                        </div>
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                    </div>
                </div>
            </div>

            <DocumentUploadDialog
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSuccess={onUpload}
            />
        </div>
    );
}
