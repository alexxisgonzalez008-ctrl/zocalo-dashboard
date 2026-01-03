import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { Task, TaskStatus } from "@/lib/types";
import TaskItem from "./TaskItem";

interface TaskCategoryProps {
    category: string;
    tasks: Task[];
    isOpen: boolean;
    onToggle: (category: string) => void;
    onToggleTaskstatus: (id: string, status: TaskStatus) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
}

export default function TaskCategory({
    category,
    tasks,
    isOpen,
    onToggle,
    onToggleTaskstatus,
    onEditTask,
    onDeleteTask
}: TaskCategoryProps) {
    const isAllDone = tasks.length > 0 && tasks.every(t => t.status === 'completed');
    const isCurrent = tasks.some(t => t.status === 'in-progress');

    return (
        <div className="relative">
            {/* Category Node on Timeline */}
            <div className={cn(
                "absolute left-[11px] top-6 w-4 h-4 rounded-full border-2 z-10 hidden md:block transition-colors duration-500",
                isAllDone ? "bg-emerald-500 border-white ring-2 ring-emerald-100 dark:ring-emerald-900/20" :
                    isCurrent ? "bg-white border-blue-500 ring-2 ring-blue-100 dark:bg-slate-900 dark:ring-blue-900/20 animate-pulse" :
                        "bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-700"
            )}></div>

            <Card className={cn(
                "transition-all duration-300 overflow-hidden ml-0 md:ml-12 border",
                isCurrent ? "ring-2 ring-blue-500/20 border-blue-200 dark:border-blue-800 shadow-md" : "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
            )}>
                <AccordionTrigger
                    isOpen={isOpen}
                    onClick={() => onToggle(category)}
                    className="px-5 py-4 hover:no-underline hover:bg-slate-50/50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className={cn("font-bold text-base", isAllDone ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200")}>
                            {category}
                        </span>
                        <div className="flex items-center gap-1 ml-2">
                            {isAllDone && <Badge variant="success" className="h-5 px-1.5 text-[10px]">100%</Badge>}
                            {isCurrent && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800 border">En Curso</Badge>}
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent isOpen={isOpen} className="bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-2 space-y-1">
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={(id, status) => onToggleTaskstatus(id, status)}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </div>
                </AccordionContent>
            </Card>
        </div>
    );
}
