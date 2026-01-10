"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle2, Circle, AlertCircle, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { MaterialOrder, MaterialOrderItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import OrderCreateDialog from './OrderCreateDialog';

export default function OrdersView({ projectId }: { projectId: string }) {
    const [orders, setOrders] = useState<MaterialOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        fetchOrders();

        // Escuchar actualización desde el Copilot u otros componentes
        const handleRefresh = () => fetchOrders();
        window.addEventListener('islara-orders-update', handleRefresh);

        return () => window.removeEventListener('islara-orders-update', handleRefresh);
    }, [projectId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`/api/material-orders?projectId=${projectId}`);
            setOrders(resp.data);
        } catch (error) {
            toast.error("Error al cargar los pedidos");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = async (orderId: string, itemId: string, current: number, delta: number) => {
        const newValue = Math.max(0, current + delta);
        try {
            const resp = await axios.patch(`/api/material-orders/${orderId}`, {
                itemId,
                receivedQuantity: newValue
            });

            // Update local state
            setOrders(prev => prev.map(o => o.id === orderId ? resp.data : o));
            toast.success("Cantidad actualizada");
        } catch (error) {
            toast.error("No se pudo actualizar la cantidad");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Cargando pedidos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Control de Pedidos</h2>
                    <p className="text-slate-500 text-sm font-medium">Seguimiento de materiales solicitados y recibidos.</p>
                </div>
                <button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-lg transition-transform active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Nuevo Pedido
                </button>
            </div>

            {orders.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No hay pedidos registrados</h3>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Comienza pidiéndole al Copilot: "Carga el pedido de hoy: 10 bolsas de cemento y 5 hierros del 8".
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <Card key={order.id} className={cn(
                            "overflow-hidden transition-all duration-300 border-l-4",
                            order.status === 'completed' ? "border-l-emerald-500" :
                                order.status === 'partial' ? "border-l-amber-500" : "border-l-blue-500"
                        )}>
                            <div
                                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-4"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-2 rounded-xl",
                                        order.status === 'completed' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                                            order.status === 'partial' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                                                "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                                    )}>
                                        {order.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            Pedido a {order.vendor || "Proveedor"}
                                            <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border dark:border-slate-700/50 letter tracking-wider">
                                                #{order.id.slice(0, 4)}
                                            </span>
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            {format(new Date(order.date), "dd 'de' MMMM", { locale: es })} • {order.items.length} ítems
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden md:block text-right">
                                        <p className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            order.status === 'completed' ? "text-emerald-600" :
                                                order.status === 'partial' ? "text-amber-600" : "text-blue-600"
                                        )}>
                                            {order.status === 'completed' ? "Entregado" : order.status === 'partial' ? "Entrega Parcial" : "Pendiente"}
                                        </p>
                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-500",
                                                    order.status === 'completed' ? "bg-emerald-500" :
                                                        order.status === 'partial' ? "bg-amber-500" : "bg-blue-500"
                                                )}
                                                style={{ width: `${(order.items.reduce((acc, i) => acc + (i.receivedQuantity / i.requestedQuantity), 0) / order.items.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    {expandedOrder === order.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </div>
                            </div>

                            {expandedOrder === order.id && (
                                <CardContent className="p-4 pt-0 border-t border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
                                    <div className="mt-4 space-y-3">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    {item.receivedQuantity >= item.requestedQuantity ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : item.receivedQuantity > 0 ? (
                                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 text-slate-300" />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.description}</p>
                                                        <p className="text-[10px] text-slate-500">
                                                            Pedido: {item.requestedQuantity} {item.unit} • Recibido: {item.receivedQuantity} {item.unit}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateItem(order.id, item.id, item.receivedQuantity, -1)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-mono font-bold text-emerald-600">
                                                        {item.receivedQuantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateItem(order.id, item.id, item.receivedQuantity, 1)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 font-bold"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateItem(order.id, item.id, 0, item.requestedQuantity)}
                                                        className="ml-2 px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-md hover:bg-emerald-600 hover:text-white transition-colors"
                                                    >
                                                        Todo
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {order.notes && (
                                        <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter mb-1">Notas del pedido</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{order.notes}"</p>
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            <OrderCreateDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                projectId={projectId}
                onSuccess={fetchOrders}
            />
        </div>
    );
}
