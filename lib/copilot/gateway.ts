import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMResponse, CopilotMessage, ToolCall } from './types';

// Gemini Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function invokeLLMGateway(payload: {
    userId: string;
    projectId: string;
    messages: CopilotMessage[];
    tools: any[];
}): Promise<LLMResponse> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
        return { assistantText: "Configuración incompleta: No se encontró un GEMINI_API_KEY válido en las Environment Variables de Vercel." };
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are Asistente, a professional construction assistant.
Your primary goal is to help the user manage the project by using the available tools.

STRICT INSTRUCTIONS:
1. Every user message about "pedidos", "gastos" or "bitácora" should be treated as a NEW and ISOLATED request.
2. CONTEXT ISOLATION: Do NOT use items, materials, or vendors from previous turns unless explicitly asked to "add to the previous order".
3. LATEST FOCUS: Focus ONLY on the most recent user message to extract quantities and items. 
4. If the latest message is "agrega 3 sacos de piedra", and the previous was "2 bolsas de arena", you MUST only order 3 sacos de piedra.
5. If the user is just chatting, respond normally.

Current Project ID: ${payload.projectId}`,
    });

    try {
        // Transformar herramientas para Gemini
        const geminiTools = [
            {
                functionDeclarations: payload.tools.map(t => ({
                    name: t.function.name,
                    description: t.function.description,
                    parameters: t.function.parameters
                }))
            }
        ];

        const chat = model.startChat({
            history: payload.messages.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            })),
            tools: geminiTools as any,
        });

        const lastMessage = payload.messages[payload.messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = result.response;
        const call = response.functionCalls()?.[0];

        if (call) {
            return {
                toolCall: {
                    name: call.name,
                    arguments: call.args as any
                }
            };
        }

        const text = response.text();
        return { assistantText: text };

    } catch (error: any) {
        console.error("Gemini API Error:", error);

        if (error.message?.includes("API_KEY_INVALID")) {
            return { assistantText: "Error de autenticación: La clave API de Gemini es inválida. Por favor, verifícala en Vercel." };
        }

        return { assistantText: `Error de la IA: ${error.message}. Por favor, intenta de nuevo en unos segundos.` };
    }
}
