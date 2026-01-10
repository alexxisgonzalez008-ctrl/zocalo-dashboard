export type TaskStatus = "completed" | "in-progress" | "pending" | "late";

export interface SubTask {
    id: string;
    name: string;
    completed: boolean;
}

export interface TimeEntry {
    id: string;
    date: string;
    hours: number;
    userId: string;
    notes?: string;
}

export interface Document {
    id: string;
    projectId: string;
    name: string;
    type: string;
    url: string;
    category: string;
    size: string;
    createdAt: string;
}

export interface Task {
    id: string;
    category: string;
    name: string;
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
    days: number;
    status: TaskStatus;
    priority?: "low" | "medium" | "high";
    assignee?: {
        name: string;
        avatar?: string;
    };
    isMilestone?: boolean;
    budget?: number; // Estimated cost
    cost?: number;   // Actual cost
    dependencies?: string[]; // IDs of tasks that must finish before this starts
    locked?: boolean; // If true, auto-scheduler won't move it
    durationWorkdays?: number; // Duration in workdays (excluding weekends/rain)
    subtasks?: SubTask[];
    timeEntries?: TimeEntry[];
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
    documents?: Document[];
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
    currency?: string;
}
export interface MaterialOrderItem {
    id: string;
    orderId: string;
    description: string;
    requestedQuantity: number;
    receivedQuantity: number;
    unit?: string;
}

export interface MaterialOrder {
    id: string;
    projectId: string;
    userId: string;
    vendor?: string;
    date: string;
    status: "pending" | "partial" | "completed";
    notes?: string;
    items: MaterialOrderItem[];
    createdAt: string;
    updatedAt: string;
}
