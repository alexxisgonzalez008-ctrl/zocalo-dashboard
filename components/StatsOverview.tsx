import React from "react";
import { TrendingUp, Activity, AlertTriangle, CloudRain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsOverviewProps {
    progressPercent: number;
    currentPhase: string;
    completedCount: number;
    lateCount: number;
    rainDaysCount?: number;
    totalDelay?: number;
}

export default function StatsOverview({
    progressPercent,
    currentPhase,
    completedCount,
    lateCount,
    rainDaysCount = 0,
    totalDelay = 0
}: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-900/5 dark:ring-slate-800 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="w-12 h-12" />
                </div>
                <CardContent className="p-5">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Progreso General</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{progressPercent}%</span>
                        <span className="text-sm text-slate-400 dark:text-slate-500 mb-1 font-medium">de la obra</span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5 mt-3 bg-slate-100 dark:bg-slate-800" />
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-900/5 dark:ring-slate-800 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="w-12 h-12" />
                </div>
                <CardContent className="p-5">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Fase Actual</p>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{currentPhase}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs text-emerald-600 font-medium">En ejecución</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-900/5 dark:ring-slate-800 overflow-hidden relative group hover:ring-amber-200 dark:hover:ring-amber-900/40 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertTriangle className="w-12 h-12 text-amber-500" />
                </div>
                <CardContent className="p-5">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Estado Tareas</p>
                    <div className="flex gap-4 mt-2">
                        <div>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}</span>
                            <span className="text-[10px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Listas</span>
                        </div>
                        <div className="h-8 w-px bg-slate-100 dark:bg-slate-800"></div>
                        <div>
                            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {lateCount}
                            </span>
                            <span className="text-[10px] block text-amber-600/70 dark:text-amber-400/70 font-bold uppercase">Atrasadas</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
