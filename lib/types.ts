export type TaskStatus = "completed" | "in-progress" | "pending" | "late";

export interface Task {
    id: string;
    category: string;
    name: string;
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
    days: number;
    status: TaskStatus;
    isMilestone?: boolean;
    budget?: number; // Estimated cost
    cost?: number;   // Actual cost
    dependencies?: string[]; // IDs of tasks that must finish before this starts
    locked?: boolean; // If true, auto-scheduler won't move it
    durationWorkdays?: number; // Duration in workdays (excluding weekends/rain)
}

export interface Expense {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
}

export interface LogEntry {
    id: string;
    date: string;
    weather: "sunny" | "cloudy" | "rainy" | "windy";
    notes: string;
    expenses: Expense[];
    photos?: string[]; // Base64 strings
}
