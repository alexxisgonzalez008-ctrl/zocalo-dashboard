import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ChatInputSchema } from "@/lib/copilot/types";
import { invokeLLMGateway } from "@/lib/copilot/gateway";
import { handleToolCallAsProposal } from "@/lib/copilot/proposals";

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

        // 5. Llamar al LLM Gateway
        // TODO: Definir schemas de herramientas reales
        const llmResp = await invokeLLMGateway({
            userId,
            projectId: body.projectId || "default",
            messages: history.map((m: any) => ({ role: m.role as any, content: m.content })),
            tools: [] // Schemas Zod convertidos a JSON
        });

        // 6. Si es texto normal: guardar y devolver
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

        // 7. Si es Tool Call: generar propuesta
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
