import { Task, LogEntry } from "./types";

export const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportTasksToCSV = (tasks: Task[]) => {
    const headers = ['ID', 'Categoria', 'Nombre', 'Inicio', 'Fin', 'Dias', 'Estado', 'Presupuesto'].join(',');
    const rows = tasks.map(t => [
        t.id,
        `"${t.category}"`,
        `"${t.name}"`,
        t.start,
        t.end,
        t.days,
        t.status,
        t.budget || 0
    ].join(','));

    return [headers, ...rows].join('\n');
};

export const exportLogsToCSV = (logs: LogEntry[]) => {
    const headers = ['Fecha', 'Clima', 'Notas', 'Gasto_Categoria', 'Gasto_Desc', 'Gasto_Monto'].join(',');
    const rows: string[] = [];

    logs.forEach(log => {
        // If no expenses, just log the day
        if (log.expenses.length === 0) {
            rows.push([
                log.date,
                log.weather,
                `"${log.notes.replace(/"/g, '""')}"`, // Escape quotes
                '',
                '',
                0
            ].join(','));
        } else {
            // One row per expense
            log.expenses.forEach(exp => {
                rows.push([
                    log.date,
                    log.weather,
                    `"${log.notes.replace(/"/g, '""')}"`,
                    `"${exp.category}"`,
                    `"${exp.description}"`,
                    exp.amount
                ].join(','));
            });
        }
    });

    return [headers, ...rows].join('\n');
};
