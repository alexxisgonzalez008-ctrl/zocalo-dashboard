import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ChatInputSchema } from "@/lib/copilot/types";
import { invokeLLMGateway } from "@/lib/copilot/gateway";
import { handleToolCallAsProposal } from "@/lib/copilot/proposals";
import { getToolsJsonSchema } from "@/lib/copilot/tools";

export async function POST(req: NextRequest) {
    try {
        const body = ChatInputSchema.parse(await req.json());

        // 1. Mock de Auth (TODO: Integrar con AuthContext/NextAuth)
        const userId = "user_dev_alex";

        // 2. Obtener o crear conversación
        let conversation = await prisma.copilotConversation.findFirst({
            where: { projectId: body.projectId || "default", userId }
        });

        if (!conversation) {
            conversation = await prisma.copilotConversation.create({
                data: {
                    projectId: body.projectId || "default",
                    userId
                }
            });
        }

        const conversationId = conversation.id;

        // 3. Guardar mensaje del usuario
        await prisma.copilotMessage.create({
            data: {
                conversationId,
                role: "user",
                content: body.message
            }
        });

        // 4. Cargar historial reciente para contexto
        const history = await prisma.copilotMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 10
        });

        // 5. Podar historial (Context Pruning)
        // Solo enviamos los últimos 6 mensajes para mantener el foco.
        // Además, si un mensaje del asistente contiene una lista larga, lo neutralizamos.
        const prunedHistory = history.slice(-6).map((m: any) => {
            if (m.role === 'assistant' && (m.content.length > 200 || (m.content.match(/-/g) || []).length > 3)) {
                // Si el mensaje del asistente parece ser una lista larga generada por error,
                // lo reemplazamos por un marcador neutro para evitar que el modelo lo use como base.
                return { role: m.role, content: "[Propuesta previa entregada]" };
            }
            return { role: m.role as any, content: m.content };
        });

        // 6. Llamar al LLM Gateway
        const llmResp = await invokeLLMGateway({
            userId,
            projectId: body.projectId || "default",
            messages: prunedHistory,
            tools: getToolsJsonSchema()
        });

        // 7. Si es texto normal: guardar y devolver
        if (llmResp.assistantText && !llmResp.toolCall) {
            await prisma.copilotMessage.create({
                data: {
                    conversationId,
                    role: "assistant",
                    content: llmResp.assistantText
                }
            });
            return NextResponse.json({ type: "message", text: llmResp.assistantText });
        }

        // 8. Si es Tool Call: generar propuesta
        if (llmResp.toolCall) {
            const proposal = await handleToolCallAsProposal({
                userId,
                projectId: body.projectId || "default",
                conversationId,
                toolCall: llmResp.toolCall
            });

            // Guardamos la intención del asistente en el chat también
            await prisma.copilotMessage.create({
                data: {
                    conversationId,
                    role: "assistant",
                    content: `He generado una propuesta para: ${llmResp.toolCall.name}. ¿Deseas confirmarla?`
                }
            });

            return NextResponse.json({
                type: "proposal",
                proposal
            });
        }

        return NextResponse.json({ type: "message", text: "No pude procesar la respuesta adecuadamente." });

    } catch (error: any) {
        console.error("Copilot Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || "default";
        const userId = "user_dev_alex";

        const conversation = await prisma.copilotConversation.findFirst({
            where: { projectId, userId }
        });

        if (conversation) {
            await prisma.copilotMessage.deleteMany({
                where: { conversationId: conversation.id }
            });
            await prisma.copilotProposal.deleteMany({
                where: { conversationId: conversation.id }
            });
        }

        return NextResponse.json({ ok: true, message: "Historial de chat borrado" });
    } catch (error: any) {
        console.error("Clear Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
