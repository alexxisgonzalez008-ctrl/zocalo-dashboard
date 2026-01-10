"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, MessageSquare, Loader2, Sparkles, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import ProposalCard from './ProposalCard';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    proposal?: any;
}

export default function CopilotPanel({ projectId }: { projectId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleClearChat = async () => {
        if (!confirm("¿Deseas limpiar el historial de este chat?")) return;
        try {
            await axios.delete(`/api/copilot/chat?projectId=${projectId}`);
            setMessages([]);
            toast.success("Historial limpiado");
        } catch (error) {
            toast.error("Error al limpiar el historial");
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const resp = await axios.post('/api/copilot/chat', {
                projectId,
                message: input
            });

            const data = resp.data;
            if (data.type === 'message') {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.text }]);
            } else if (data.type === 'proposal') {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: 'He generado una propuesta basada en tu solicitud:',
                    proposal: data.proposal
                }]);
            }
        } catch (error) {
            toast.error("Error al conectar con el Copilot");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (proposalId: string) => {
        setLoading(true);
        try {
            const resp = await axios.post('/api/copilot/confirm', { proposalId, confirm: true });
            toast.success(resp.data.result.message || "Acción confirmada");

            // Disparar evento para que otras partes de la UI se refresquen
            window.dispatchEvent(new CustomEvent('islara-orders-update'));

            // Remove proposal from message
            setMessages(prev => prev.map(m => m.proposal?.id === proposalId ? { ...m, proposal: null, content: `✅ Propuesta ejecutada: ${resp.data.result.message}` } : m));
        } catch (error) {
            toast.error("Error al confirmar la acción");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (proposalId: string) => {
        try {
            await axios.post('/api/copilot/cancel', { proposalId });
            toast.info("Propuesta cancelada");
            setMessages(prev => prev.map(m => m.proposal?.id === proposalId ? { ...m, proposal: null, content: "❌ Propuesta cancelada por el usuario." } : m));
        } catch (error) {
            toast.error("Error al cancelar");
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-slate-900 border border-slate-700 text-emerald-400 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all hover:bg-slate-800"
            >
                <Sparkles className="w-7 h-7" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse border-2 border-slate-900" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed bottom-24 right-6 z-[100] w-[380px] h-[550px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold dark:text-white leading-none">Islara AI</h3>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Online • Llama 3.1 Pro</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleClearChat}
                                    title="Limpiar Chat"
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                        <MessageSquare className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">¿En qué puedo ayudarte hoy?</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Registra gastos, actualiza la bitácora o consulta el estado de la obra por voz o texto.</p>
                                </div>
                            )}
                            {messages.map(m => (
                                <div key={m.id} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                                    <div className={cn(
                                        "max-w-[85%] p-3 rounded-2xl text-xs",
                                        m.role === 'user'
                                            ? "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-500/10"
                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none"
                                    )}>
                                        {m.content}
                                    </div>
                                    {m.proposal && (
                                        <ProposalCard
                                            proposal={m.proposal}
                                            onConfirm={handleConfirm}
                                            onCancel={handleCancel}
                                            loading={loading}
                                        />
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none max-w-[100px]">
                                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                    <span className="text-[10px] font-medium text-slate-400">Pensando...</span>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ej: Registra un gasto de $10.000..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 top-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[9px] text-center mt-3 text-slate-400 font-medium">Asistente AI dedicado a la gestión de obra v1.0</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
