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

export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export interface LogEntry {
    id: string;
    date: string;
    weather: "sunny" | "cloudy" | "rainy" | "windy";
    notes: string;
    expenses: Expense[];
    photos?: string[]; // Base64 strings
}

export type CalendarEventType = "milestone" | "inspection" | "delivery" | "meeting";

export interface CalendarEvent {
    id: string;
    googleEventId?: string;
    title: string;
    type: CalendarEventType;
    start: string; // ISO string or YYYY-MM-DD
    end: string;   // ISO string or YYYY-MM-DD
    description?: string;
    location?: string;
    allDay?: boolean;
}

export interface ProjectSettings {
    title: string;
    subtitle: string;
    totalBudget: number;
    googleCalendarId?: string;
    googleClientId?: string;
    googleApiKey?: string;
}
