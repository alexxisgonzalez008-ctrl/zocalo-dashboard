import { Task } from "./types";
import { addDays, isWeekend, parseISO, format, isAfter, isBefore, isSameDay, add } from "date-fns";

// Helper: Check if a date is a workday (Mon-Fri and not in rainDays)
export const isWorkday = (date: Date, rainDays: string[]): boolean => {
    if (isWeekend(date)) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    if (rainDays.includes(dateStr)) return false;
    return true;
};

// Helper: Add N workdays to a date
export const addWorkdays = (startDate: Date | string, days: number, rainDays: string[]): string => {
    let current = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    let daysAdded = 0;

    // If days=0/1 (duration), we still need to ensure start is valid? 
    // Usually 'days' implies duration. 1 day duration = start on X, end on X (if X is workday).
    // If we are adding 'days' to a date (offset), logic differs slightly.
    // Let's assume this function finds the End Date given Start + Duration (days).
    // duration 1 = same day. duration 2 = next workday.

    // Adjust logic: Find end date for a task starting on `current` with `days` duration.
    // First, ensure start is a workday.
    while (!isWorkday(current, rainDays)) {
        current = addDays(current, 1);
    }

    if (days <= 1) return format(current, 'yyyy-MM-dd');

    // We count the first day as 1.
    daysAdded = 1;

    while (daysAdded < days) {
        current = addDays(current, 1);
        if (isWorkday(current, rainDays)) {
            daysAdded++;
        }
    }

    return format(current, 'yyyy-MM-dd');
};

// Helper: Get next valid workday (for start dates)
export const getNextWorkday = (date: Date | string, rainDays: string[]): string => {
    let current = typeof date === 'string' ? parseISO(date) : date;
    while (!isWorkday(current, rainDays)) {
        current = addDays(current, 1);
    }
    return format(current, 'yyyy-MM-dd');
};

// Topological Sort
export const topologicalSort = (tasks: Task[]): Task[] => {
    const visited = new Set<string>();
    const sorted: Task[] = [];
    const temp = new Set<string>();

    const visit = (taskId: string) => {
        if (temp.has(taskId)) throw new Error("Cycle detected in dependencies");
        if (visited.has(taskId)) return;

        temp.add(taskId);
        const task = tasks.find(t => t.id === taskId);
        if (task && task.dependencies) {
            task.dependencies.forEach(depId => visit(depId));
        }
        temp.delete(taskId);
        visited.add(taskId);
        if (task) sorted.push(task);
    };

    tasks.forEach(t => {
        if (!visited.has(t.id)) visit(t.id);
    });

    return sorted; // Returns dependencies first
};

// Main Recalculation Engine
export const recalculateSchedule = (tasks: Task[], rainDays: string[]): Task[] => {
    // 1. Sort dependencies first
    // Note: We need a map for quick lookup of updated dates
    let sortedTasks: Task[] = [];
    try {
        sortedTasks = topologicalSort(tasks);
    } catch (e) {
        console.error("Cycle detected, returning original tasks");
        return tasks;
    }

    const taskMap = new Map<string, Task>();
    tasks.forEach(t => taskMap.set(t.id, { ...t }));

    const updatedTasks: Task[] = [];

    // 2. Iterate and adjust
    for (const originalTask of sortedTasks) {
        const task = taskMap.get(originalTask.id)!;
        const duration = task.durationWorkdays || task.days || 1;

        // Determine Start Constraints
        // 1. Manual Start (current task.start)
        // 2. Dependencies (Predecessor End + 1 workday)

        let minStartFromDeps = parseISO("1970-01-01");

        if (task.dependencies && task.dependencies.length > 0) {
            task.dependencies.forEach(depId => {
                const dep = taskMap.get(depId);
                if (dep) {
                    const depEnd = parseISO(dep.end);
                    // Next workday after dependency ends
                    let nextDay = addDays(depEnd, 1);
                    while (!isWorkday(nextDay, rainDays)) {
                        nextDay = addDays(nextDay, 1);
                    }
                    if (isAfter(nextDay, minStartFromDeps)) {
                        minStartFromDeps = nextDay;
                    }
                }
            });
        }

        // Current start (assumed manual or previous state)
        // If we strictly follow "rain delay only", we should trust task.start unless deps push it.
        // But what if task.start falls on a rain day? It must move.

        // 1. Resolve Start Date
        let cleanStart = parseISO(task.start);

        // If dependencies push it forward, use dependency start.
        if (isBefore(cleanStart, minStartFromDeps)) {
            cleanStart = minStartFromDeps;
        }

        // Ensure start is a workday (handles Rain Day / Weekend on start date)
        while (!isWorkday(cleanStart, rainDays)) {
            // If locked, we shouldn't move? 
            // Requirement: "Las tareas con locked=true no se mueven" -> "registrar warning"
            if (task.locked) {
                // Keep original, but maybe log warning?
                // For scheduler output, we return it as is, maybe with a flag?
                // But let's assume locked means locked to a DATE.
                // If that date is now Rain, it's physically impossible to work?
                // Or maybe "locked" means "don't auto-schedule".
                // Let's respect Locked = Ignore all changes.
                break;
            }
            cleanStart = addDays(cleanStart, 1);
        }

        if (task.locked) {
            // Do nothing to start/end, but verify dependencies
            const currentStart = parseISO(task.start);
            if (isBefore(currentStart, minStartFromDeps)) {
                console.warn(`Task ${task.name} is locked but violates dependency constraint.`);
            }
            updatedTasks.push(task);
            continue;
        }

        // 2. Calculate End Date
        const newStartStr = format(cleanStart, 'yyyy-MM-dd');
        const newEndStr = addWorkdays(cleanStart, duration, rainDays);

        // Update task
        task.start = newStartStr;
        task.end = newEndStr;

        updatedTasks.push(task);
        taskMap.set(task.id, task); // Update map for subsequent lookups
    }

    // Return in original order or sorted? 
    // React state usually doesn't care, but stable order is nice.
    // Let's re-sort by ID or original index? 
    // Actually, `tasks.map` using the map is safer to preserve UI order.
    return tasks.map(t => taskMap.get(t.id)!);
};
