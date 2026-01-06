import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Sun,
    Cloud,
    CloudRain,
    Wind,
    Plus,
    DollarSign,
    Save,
    Trash2,
    StickyNote,
    Download
} from "lucide-react";
import WeatherWidget from "./WeatherWidget";
import PhotoUpload from "./PhotoUpload";
import PhotoGalleryView from "./PhotoGalleryView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogEntry, Expense, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { downloadCSV, exportLogsToCSV } from "@/lib/export";

interface DailyLogViewProps {
    currentDate: string;
    logs: LogEntry[];
    categories: string[];
    onSaveLog: (log: LogEntry) => void;
}

export default function DailyLogView({ currentDate, logs, categories, onSaveLog }: DailyLogViewProps) {
    const [viewMode, setViewMode] = useState<'daily' | 'gallery'>('daily');
    // Local state for form
    const [weather, setWeather] = useState<LogEntry["weather"]>("sunny");
    const [notes, setNotes] = useState("");
    const [photos, setPhotos] = useState<string[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Expense form state
    const [expAmount, setExpAmount] = useState("");
    const [expDesc, setExpDesc] = useState("");
    const [expCat, setExpCat] = useState(categories[0] || "");

    // Load existing log for current date
    useEffect(() => {
        const existingLog = logs.find(l => l.date === currentDate);
        if (existingLog) {
            setWeather(existingLog.weather);
            setNotes(existingLog.notes);
            setPhotos(existingLog.photos || []);
            setExpenses(existingLog.expenses);
        } else {
            // Reset for new day
            setWeather("sunny");
            setNotes("");
            setPhotos([]);
            setExpenses([]);
        }
    }, [currentDate, logs]);

    const handleAddExpense = () => {
        if (!expAmount || !expDesc) return;
        const newExpense: Expense = {
            id: crypto.randomUUID(),
            date: currentDate,
            category: expCat,
            description: expDesc,
            amount: parseFloat(expAmount)
        };
        setExpenses([...expenses, newExpense]);
        setExpAmount("");
        setExpDesc("");
    };

    const handleRemoveExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const handleSave = () => {
        const log: LogEntry = {
            id: logs.find(l => l.date === currentDate)?.id || crypto.randomUUID(),
            date: currentDate,
            weather,
            notes,
            photos,
            expenses
        };
        onSaveLog(log);
    };

    const handleExport = () => {
        const csv = exportLogsToCSV(logs);
        downloadCSV(csv, `Bitacora_Islara_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    };

    const formattedDate = format(new Date(currentDate), "EEEE d 'de' MMMM, yyyy", { locale: es });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                        {viewMode === 'daily' ? formattedDate : "Galería de Avances"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {viewMode === 'daily' ? "Registro diario de actividad" : "Todas las fotos del proyecto"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                viewMode === 'daily' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Diario
                        </button>
                        <button
                            onClick={() => setViewMode('gallery')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                viewMode === 'gallery' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Galería
                        </button>
                    </div>

                    {viewMode === 'daily' && (
                        <>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                title="Descargar historial completo"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">CSV</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-none"
                            >
                                <Save className="w-4 h-4" />
                                <span className="hidden sm:inline">Guardar</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {viewMode === 'gallery' ? (
                <PhotoGalleryView logs={logs} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Weather & Notes */}
                    <div className="space-y-6 md:col-span-2">
                        <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Clima & Observaciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Weather Widget */}
                                <WeatherWidget />

                                {/* Weather Selector */}
                                <div className="flex gap-2">
                                    {(["sunny", "cloudy", "rainy", "windy"] as const).map(w => (
                                        <button
                                            key={w}
                                            onClick={() => setWeather(w)}
                                            className={cn(
                                                "flex-1 p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                                                weather === w ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-600 hover:border-slate-200 dark:hover:border-slate-700"
                                            )}
                                        >
                                            {w === "sunny" && <Sun className="w-6 h-6" />}
                                            {w === "cloudy" && <Cloud className="w-6 h-6" />}
                                            {w === "rainy" && <CloudRain className="w-6 h-6" />}
                                            {w === "windy" && <Wind className="w-6 h-6" />}
                                            <span className="text-xs font-medium capitalize">{w}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Notes */}
                                <div className="relative">
                                    <StickyNote className="absolute top-3 left-3 w-5 h-5 text-slate-400 dark:text-slate-600" />
                                    <textarea
                                        className="w-full min-h-[150px] p-3 pl-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none text-slate-700 dark:text-slate-200"
                                        placeholder="Escriba aquí las observaciones del día, incidentes, visitas, etc..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                {/* Photos */}
                                <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Expenses */}
                    <div className="md:col-span-1">
                        <Card className="h-full flex flex-col dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Gastos del Día
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col p-4 gap-4">
                                {/* Form */}
                                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <select
                                        className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200"
                                        value={expCat}
                                        onChange={(e) => setExpCat(e.target.value)}
                                    >
                                        {categories.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Descripción del gasto"
                                        className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200"
                                        value={expDesc}
                                        onChange={(e) => setExpDesc(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-2 top-2 text-slate-400">$</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full p-2 pl-6 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200"
                                                value={expAmount}
                                                onChange={(e) => setExpAmount(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddExpense}
                                            className="bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 transition"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
                                    {expenses.length === 0 && (
                                        <div className="text-center py-8 text-slate-400 text-xs italic">
                                            No hay gastos registrados hoy
                                        </div>
                                    )}
                                    {expenses.map(exp => (
                                        <div key={exp.id} className="flex justify-between items-center p-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded shadow-sm group">
                                            <div className="overflow-hidden">
                                                <div className="font-medium text-slate-700 dark:text-slate-200 text-sm truncate">{exp.description}</div>
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{exp.category}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">${exp.amount.toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleRemoveExpense(exp.id)}
                                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total Footer */}
                                {expenses.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Total Día</span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            ${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
