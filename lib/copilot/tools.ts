import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// 1. Lectura de Contexto
export const GetUserContextSchema = z.object({});
export const ListProjectsSchema = z.object({});
export const GetProjectSnapshotSchema = z.object({ projectId: z.string() });

// 2. Búsqueda de Datos
export const SearchTasksSchema = z.object({
    query: z.string().optional(),
    status: z.enum(["pending", "in_progress", "completed"]).optional(),
});
export const SearchDailyLogsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    query: z.string().optional(),
});
export const SearchExpensesSchema = z.object({
    category: z.string().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
});
export const SearchPhotosSchema = z.object({
    query: z.string().optional(),
    date: z.string().optional(),
});

// 3. Propuestas de Escritura (Two-Step Commit)
export const ProposeExpenseSchema = z.object({
    amount: z.number(),
    description: z.string(),
    category: z.string(),
    date: z.string().optional(),
});
export const ProposeDailyLogEntrySchema = z.object({
    date: z.string(),
    notes: z.string(),
    weather: z.enum(["sunny", "cloudy", "rainy", "windy"]).optional(),
});
export const ProposeTaskChangesSchema = z.object({
    taskId: z.string(),
    updates: z.record(z.string(), z.any()),
});
export const ProposeReportSchema = z.object({
    type: z.enum(["financial", "daily_log", "project_summary"]),
    format: z.enum(["pdf", "csv"]),
});
export const ProposeCalendarEventSchema = z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
});
export const ProposeMaterialOrderSchema = z.object({
    vendor: z.string().optional(),
    items: z.array(z.object({
        description: z.string(),
        requestedQuantity: z.number(),
        unit: z.string().optional()
    })),
    notes: z.string().optional()
});

// Mapeo de herramientas para el LLM
export const COPILOT_TOOLS = [
    {
        name: "get_user_context",
        description: "Obtiene información básica del usuario y sus permisos.",
        schema: GetUserContextSchema
    },
    {
        name: "list_projects",
        description: "Lista todos los proyectos disponibles para el usuario.",
        schema: ListProjectsSchema
    },
    {
        name: "get_project_snapshot",
        description: "Obtiene un resumen completo de un proyecto específico (tareas, presupuesto, estado).",
        schema: GetProjectSnapshotSchema
    },
    {
        name: "search_tasks",
        description: "Busca tareas dentro del proyecto actual por nombre o estado.",
        schema: SearchTasksSchema
    },
    {
        name: "search_daily_logs",
        description: "Busca entradas en la bitácora de obra por fecha o contenido.",
        schema: SearchDailyLogsSchema
    },
    {
        name: "search_expenses",
        description: "Filtra y busca gastos registrados en el proyecto.",
        schema: SearchExpensesSchema
    },
    {
        name: "search_photos",
        description: "Busca fotografías cargadas en el proyecto por tags o fecha.",
        schema: SearchPhotosSchema
    },
    {
        name: "propose_expense",
        description: "Genera una propuesta para registrar un nuevo gasto. Requiere confirmación posterior.",
        schema: ProposeExpenseSchema
    },
    {
        name: "propose_daily_log_entry",
        description: "Sugiere una nueva entrada para la bitácora diaria. Requiere confirmación.",
        schema: ProposeDailyLogEntrySchema
    },
    {
        name: "propose_task_changes",
        description: "Propone cambios en una tarea existente (estado, descripción, fechas).",
        schema: ProposeTaskChangesSchema
    },
    {
        name: "propose_report",
        description: "Sugiere la generación de un reporte formal del proyecto.",
        schema: ProposeReportSchema
    },
    {
        name: "propose_calendar_event",
        description: "Propone la creación de un evento en Google Calendar.",
        schema: ProposeCalendarEventSchema
    },
    {
        name: "propose_material_order",
        description: "Genera una propuesta de pedido de materiales (bolsones, hierro, cemento, etc).",
        schema: ProposeMaterialOrderSchema
    }
];

// Función para obtener los schemas en formato JSON para el LLM Gateway
export function getToolsJsonSchema() {
    return COPILOT_TOOLS.map(tool => {
        // Al no pasar el nombre como segundo argumento, zod-to-json-schema 
        // devuelve el esquema del objeto directamente en lugar de usar definitions/$ref.
        const fullSchema = zodToJsonSchema(tool.schema as any) as any;

        // Gemini no acepta estas propiedades de metadatos en el objeto de parámetros.
        const { $schema, definitions, ...cleanSchema } = fullSchema;

        return {
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: cleanSchema
            }
        };
    });
}
