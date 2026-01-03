import { Task } from "./types";
import { addDays, isWeekend, parseISO, format, isAfter, isBefore } from "date-fns";

/**
 * Helper: Check if a date is a workday (Mon-Fri and not in rainDays)
 * @param date The date to check
 * @param rainDaysSet A Set of rain days in 'yyyy-MM-dd' format for O(1) lookup
 */
export const isWorkday = (date: Date, rainDaysSet: Set<string>): boolean => {
    if (isWeekend(date)) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return !rainDaysSet.has(dateStr);
};

/**
 * Helper: Count workdays between two dates (inclusive)
 * @param start The start date
 * @param end The end date
 * @param rainDaysSet A Set of rain days strings
 */
export const countWorkdays = (start: Date | string, end: Date | string, rainDaysSet: Set<string> | string[]): number => {
    let current = typeof start === 'string' ? parseISO(start) : start;
    const endObj = typeof end === 'string' ? parseISO(end) : end;
    const set = Array.isArray(rainDaysSet) ? new Set(rainDaysSet) : rainDaysSet;

    if (isAfter(current, endObj)) return 0;

    let count = 0;
    while (!isAfter(current, endObj)) {
        if (isWorkday(current, set)) {
            count++;
        }
        current = addDays(current, 1);
    }
    return count;
};

/**
 * Helper: Get next valid workday (for start dates)
 */
export const getNextWorkday = (date: Date | string, rainDaysSet: Set<string> | string[]): string => {
    let current = typeof date === 'string' ? parseISO(date) : date;
    const set = Array.isArray(rainDaysSet) ? new Set(rainDaysSet) : rainDaysSet;
    while (!isWorkday(current, set)) {
        current = addDays(current, 1);
    }
    return format(current, 'yyyy-MM-dd');
};
/**
 * Helper: Add N workdays to a date
 * @param startDate The date to start from
 * @param days The number of workdays (duration). days=1 means the task ends on the same day if it's a workday.
 * @param rainDaysSet A Set of rain days strings.
 */
export const addWorkdays = (startDate: Date | string, days: number, rainDaysSet: Set<string>): string => {
    let current = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    let daysAdded = 0;

    // First, ensure start is a workday
    while (!isWorkday(current, rainDaysSet)) {
        current = addDays(current, 1);
    }

    if (days <= 1) return format(current, 'yyyy-MM-dd');

    // We count the first day as 1 since it's now guaranteed to be a workday
    daysAdded = 1;

    while (daysAdded < days) {
        current = addDays(current, 1);
        if (isWorkday(current, rainDaysSet)) {
            daysAdded++;
        }
    }

    return format(current, 'yyyy-MM-dd');
};

/**
 * Topological Sort to handle task dependencies correctly
 */
export const topologicalSort = (tasks: Task[]): Task[] => {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const visited = new Set<string>();
    const sorted: Task[] = [];
    const temp = new Set<string>();

    const visit = (taskId: string) => {
        if (temp.has(taskId)) throw new Error("Cycle detected in dependencies");
        if (visited.has(taskId)) return;

        temp.add(taskId);
        const task = taskMap.get(taskId);
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

    return sorted; // Returns dependencies before dependents
};

/**
 * Main Recalculation Engine
 * Adjusts all tasks based on rain days and dependencies.
 */
export const recalculateSchedule = (tasks: Task[], rainDays: string[]): Task[] => {
    const rainDaysSet = new Set(rainDays);

    let sortedTasks: Task[] = [];
    try {
        sortedTasks = topologicalSort(tasks);
    } catch (e) {
        console.error("Cycle detected in dependencies, returning original tasks", e);
        return tasks;
    }

    const taskMap = new Map<string, Task>();
    // Initialize with clones to avoid mutating input during calculation
    tasks.forEach(t => taskMap.set(t.id, { ...t }));

    const minBaseline = parseISO("1970-01-01");

    for (const originalTask of sortedTasks) {
        const task = taskMap.get(originalTask.id)!;

        // Locked tasks do not move, but we keep them in the map for dependents
        if (task.locked) {
            continue;
        }

        const duration = task.durationWorkdays || task.days || 1;
        let minStartFromDeps = minBaseline;

        // Calculate minimum start date based on all dependencies finishing
        if (task.dependencies && task.dependencies.length > 0) {
            task.dependencies.forEach(depId => {
                const dep = taskMap.get(depId);
                if (dep) {
                    const depEnd = parseISO(dep.end);
                    // Next workday after dependency ends
                    let nextDay = addDays(depEnd, 1);
                    while (!isWorkday(nextDay, rainDaysSet)) {
                        nextDay = addDays(nextDay, 1);
                    }
                    if (isAfter(nextDay, minStartFromDeps)) {
                        minStartFromDeps = nextDay;
                    }
                }
            });
        }

        let cleanStart = parseISO(task.start);

        // If dependencies push it forward, update start
        if (isBefore(cleanStart, minStartFromDeps)) {
            cleanStart = minStartFromDeps;
        }

        // Ensure current start is a valid workday (not weekend or rain day)
        while (!isWorkday(cleanStart, rainDaysSet)) {
            cleanStart = addDays(cleanStart, 1);
        }

        const newStartStr = format(cleanStart, 'yyyy-MM-dd');
        const newEndStr = addWorkdays(cleanStart, duration, rainDaysSet);

        // Update task state
        task.start = newStartStr;
        task.end = newEndStr;
        taskMap.set(task.id, task);
    }

    // Return tasks in their original order (from the input array)
    return tasks.map(t => taskMap.get(t.id)!);
};
