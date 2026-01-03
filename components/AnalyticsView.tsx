import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Task, LogEntry } from '@/lib/types';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';

interface AnalyticsViewProps {
    tasks: Task[];
    logs: LogEntry[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function AnalyticsView({ tasks, logs }: AnalyticsViewProps) {

    // 1. Data Preparation for Cost S-Curve (Budget vs Actual Cumulative)
    const costCurveData = useMemo(() => {
        // ... (Logic to generate daily cumulative data)
        const allDates = new Set<string>();
        tasks.forEach(t => {
            allDates.add(t.start);
            allDates.add(t.end);
        });
        logs.forEach(l => allDates.add(l.date));

        const sortedDates = Array.from(allDates).sort();
        if (sortedDates.length === 0) return [];

        const startDate = parseISO(sortedDates[0]);
        const endDate = parseISO(sortedDates[sortedDates.length - 1]);

        // Generate daily range
        const days = eachDayOfInterval({ start: startDate, end: addDays(endDate, 7) }); // Add buffer

        let cumulativeBudget = 0;
        let cumulativeActual = 0;

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');

            // Add budget for tasks starting today (simplified distribution)
            // Ideally budget is distributed over task duration, but for S-curve starts are often used or linear distribution
            // Let's use linear distribution for smoother curve
            let dailyBudget = 0;
            tasks.forEach(t => {
                if (day >= parseISO(t.start) && day <= parseISO(t.end)) {
                    const duration = (parseISO(t.end).getTime() - parseISO(t.start).getTime()) / (1000 * 3600 * 24) + 1;
                    if (duration > 0 && t.budget) {
                        dailyBudget += t.budget / duration;
                    }
                }
            });
            cumulativeBudget += dailyBudget;

            // Add actuals from logs
            const log = logs.find(l => l.date === dateStr);
            if (log) {
                const dayCost = log.expenses.reduce((sum, e) => sum + e.amount, 0);
                cumulativeActual += dayCost;
            }

            return {
                date: format(day, 'dd/MM'),
                budget: Math.round(cumulativeBudget),
                actual: Math.round(cumulativeActual)
            };
        });
    }, [tasks, logs]);

    // 2. Data for Category Pie Chart
    const categoryData = useMemo(() => {
        const catMap = new Map<string, number>();
        logs.forEach(log => {
            log.expenses.forEach(exp => {
                const current = catMap.get(exp.category) || 0;
                catMap.set(exp.category, current + exp.amount);
            });
        });
        return Array.from(catMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [logs]);

    // 3. Weekly Task Completion
    const velocityData = useMemo(() => {
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const weeks = new Map<string, number>();

        completedTasks.forEach(t => {
            // Use end date as completion date proxy if no actual completion date
            const weekStart = format(startOfWeek(parseISO(t.end), { weekStartsOn: 1 }), 'dd/MM', { locale: es });
            weeks.set(weekStart, (weeks.get(weekStart) || 0) + 1);
        });

        return Array.from(weeks.entries()).map(([week, count]) => ({ week, count }));
    }, [tasks]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* ROW 1: S-Curve */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Curva S de Costos (Acumulado)</h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={costCurveData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" tickFormatter={(val) => `$${val / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}
                                itemStyle={{ color: '#f8fafc' }}
                                labelStyle={{ color: '#94a3b8' }}
                                formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="budget" name="Presupuesto" stroke="#475569" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="actual" name="Gasto Real" stroke="#3b82f6" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ROW 2: Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Category Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <PieIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Gasto por Categoría</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                    formatter={(value: any) => `$${value.toLocaleString()}`}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Velocity */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Velocidad (Tareas/Semana)</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={velocityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} stroke="#334155" />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Bar dataKey="count" name="Tareas Completadas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
