import prisma from '../prisma';
import { ToolCall } from './types';

export async function handleToolCallAsProposal(args: {
    userId: string;
    projectId: string;
    conversationId: string;
    toolCall: ToolCall;
}) {
    const { userId, projectId, conversationId, toolCall } = args;

    // 1. Generar Metadata de Previsualización según la herramienta
    const preview = generatePreview(toolCall);

    // 2. Persistir Propuesta en DB (Prisma)
    const proposal = await prisma.copilotProposal.create({
        data: {
            conversationId,
            projectId,
            userId,
            toolName: toolCall.name,
            toolArgs: JSON.stringify(toolCall.arguments),
            preview: JSON.stringify(preview),
            status: "pending",
        }
    });

    // 3. Registrar en Audit Log
    await prisma.copilotAuditLog.create({
        data: {
            proposalId: proposal.id,
            userId,
            action: "PROPOSED",
            payload: JSON.stringify(toolCall)
        }
    });

    return {
        ...proposal,
        preview // Devolvemos el objeto real para el frontend
    };
}

function generatePreview(toolCall: ToolCall) {
    // Aquí mapeamos cada herramienta a un preview legible para el usuario
    switch (toolCall.name) {
        case "propose_expense":
            const amount = toolCall.arguments.amount || 0;
            return {
                title: "Nuevo Gasto Sugerido",
                summary: `Gasto de $${amount.toLocaleString()} en la categoría ${toolCall.arguments.category || 'Sin categoría'}.`,
                details: toolCall.arguments.description
            };
        case "propose_daily_log_entry":
            return {
                title: "Registro de Bitácora",
                summary: "Se ha redactado una nueva entrada para el diario de obra.",
                details: toolCall.arguments.notes
            };
        case "propose_task_changes":
            return {
                title: "Actualización de Tarea",
                summary: `Cambios sugeridos para la tarea: ${toolCall.arguments.taskTitle || 'Tarea'}.`,
                diff: toolCall.arguments
            };
        default:
            return {
                title: "Acción Sugerida",
                summary: "El asistente ha propuesto una acción para el sistema.",
                details: JSON.stringify(toolCall.arguments)
            };
    }
}
