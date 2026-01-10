import React from "react";
import { DollarSign, Wallet, PieChart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Task, LogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FinancialViewProps {
    tasks: Task[];
    logs: LogEntry[];
    settingsBudget?: number;
}

export default function FinancialView({ tasks, logs, settingsBudget }: FinancialViewProps) {
    const taskBudgetSum = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
    const totalBudget = settingsBudget !== undefined && settingsBudget > 0 ? settingsBudget : taskBudgetSum;

    // Calculate total spent from LOGS expenses instead of task static cost
    const totalSpent = logs.reduce((sum, log) => {
        return sum + log.expenses.reduce((eSum, exp) => eSum + exp.amount, 0);
    }, 0);

    const remainingBudget = totalBudget - totalSpent;
    const spendingProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Calculate details per category from LOGS
    const categories = Array.from(new Set(tasks.map(t => t.category)));

    // Determine status of finances
    const isOverBudget = remainingBudget < 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                {/* BUDGET CARD */}
                <Card className="bg-slate-900 dark:bg-emerald-950 text-white border-0 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-12 h-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                            Presupuesto Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl xl:text-2xl font-bold">
                            ${totalBudget.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {settingsBudget && settingsBudget > 0 ? "Presupuesto definido en ajustes" : "Suma de presupuestos por tarea"}
                        </p>
                    </CardContent>
                </Card>

                {/* SPENT CARD */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <DollarSign className="w-12 h-12 text-slate-900 dark:text-white" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Ejecutado (Costos)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl xl:text-2xl font-bold text-slate-900 dark:text-white">
                            ${totalSpent.toLocaleString()}
                        </div>
                        <Progress value={spendingProgress} className="h-2 mt-3 bg-slate-100 dark:bg-slate-800" />
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                            {spendingProgress.toFixed(1)}% del presupuesto
                        </p>
                    </CardContent>
                </Card>

                {/* REMAINING CARD */}
                <Card className={cn("border-0 shadow-sm relative overflow-hidden", isOverBudget ? "bg-red-50 dark:bg-red-950/20" : "bg-emerald-50 dark:bg-emerald-950/20")}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <PieChart className={cn("w-12 h-12", isOverBudget ? "text-red-500" : "text-emerald-500")} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className={cn("text-sm font-medium uppercase tracking-wider", isOverBudget ? "text-red-600/70 dark:text-red-400/70" : "text-emerald-600/70 dark:text-emerald-400/70")}>
                            Disponible
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-xl xl:text-2xl font-bold", isOverBudget ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400")}>
                            ${remainingBudget.toLocaleString()}
                        </div>
                        <p className={cn("text-xs mt-1 font-medium", isOverBudget ? "text-red-600 dark:text-red-400/70" : "text-emerald-600 dark:text-emerald-400/70")}>
                            {isOverBudget ? "Excedido del presupuesto" : "Dentro de lo planificado"}
                        </p>
                    </CardContent>
                </Card>

                {/* PROFITABILITY CARD (Odoo-like) */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <TrendingUp className="w-12 h-12 text-blue-500" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Índice de Rentabilidad
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-xl xl:text-2xl font-black",
                            spendingProgress > 90 ? "text-red-600" : spendingProgress > 70 ? "text-amber-600" : "text-emerald-600"
                        )}>
                            {totalBudget > 0 ? (100 - spendingProgress).toFixed(1) : 0}%
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-500",
                                        spendingProgress > 90 ? "bg-red-500" : spendingProgress > 70 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${Math.min(100, 100 - spendingProgress)}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">Margen proyectado basado en ejecución actual</p>
                    </CardContent>
                </Card>
            </div>

            {/* CATEGORY BREAKDOWN */}
            <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                        Desglose Financiero
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {categories.map(cat => {
                            const catBudget = tasks.filter(t => t.category === cat).reduce((sum, t) => sum + (t.budget || 0), 0);

                            // Sum expenses for this category from all logs
                            const catSpent = logs.reduce((sum, log) => {
                                return sum + log.expenses
                                    .filter(e => e.category === cat)
                                    .reduce((eSum, exp) => eSum + exp.amount, 0);
                            }, 0);

                            const progress = catBudget > 0 ? (catSpent / catBudget) * 100 : 0;

                            return (
                                <div key={cat} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                                        <div className="flex gap-4 text-xs font-mono">
                                            <span className="text-slate-500 dark:text-slate-500">Pres: ${catBudget.toLocaleString()}</span>
                                            <span className={cn(catSpent > catBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                                                Real: ${catSpent.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Progress value={progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
