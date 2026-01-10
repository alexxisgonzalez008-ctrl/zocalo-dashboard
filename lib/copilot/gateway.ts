import { GoogleGenAI } from "@google/genai";
import { LLMResponse, CopilotMessage, ToolCall } from './types';

export async function invokeLLMGateway(payload: {
    userId: string;
    projectId: string;
    messages: CopilotMessage[];
    tools: any[];
}): Promise<LLMResponse> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

    if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
        return { assistantText: "Error de configuración: No se encontró la GEMINI_API_KEY. Asegúrate de tenerla en tu archivo .env (local) o en las variables de Vercel (producción)." };
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    try {
        // Transform tools for the new GenAI SDK using functionDeclarations (camelCase)
        const tools = [{
            functionDeclarations: payload.tools.map(t => ({
                name: t.function.name,
                description: t.function.description,
                parameters: {
                    type: "object",
                    properties: t.function.parameters.properties,
                    required: t.function.parameters.required
                } as any
            }))
        }];

        const systemInstruction = `You are Asistente, a professional construction assistant.
Your primary goal is to help the user manage the project by using the available tools.

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. When the user asks to "registrar", "anotar", "pedir", "agregar", "agrega", "quiero", "necesito" or "buscar" anything, YOU MUST IMMEDIATELY USE THE CORRESPONDING TOOL. DO NOT ask for clarification first.
2. When the user mentions ANY construction material (ladrillos, cemento, arena, piedra, hierro, madera, bolsas, sacos, etc.) and a quantity, ALWAYS call propose_material_order IMMEDIATELY.
3. NEVER ask "what else do you need?", "anything more?", or similar questions. Just execute the order with what was given.
4. CONTEXT ISOLATION: Do NOT use items, materials, or vendors from previous turns unless explicitly asked to "add to the previous order".
5. Focus ONLY on the most recent user message to extract quantities and items.

EXAMPLES - When to call propose_material_order:
- "agrega un pedido" → call propose_material_order with items: [{description: "Pedido genérico", requestedQuantity: 1}]
- "agrega 10 ladrillos" → call propose_material_order with items: [{description: "ladrillos", requestedQuantity: 10}]
- "pide 5 bolsas de cemento" → call propose_material_order with items: [{description: "cemento", requestedQuantity: 5, unit: "bolsas"}]
- "necesito arena y piedra" → call propose_material_order with items: [{description: "arena", requestedQuantity: 1}, {description: "piedra", requestedQuantity: 1}]

Only respond with text (no tool) if the user is asking a question that does NOT require any action.

Current Project ID: ${payload.projectId}`;

        const contents = payload.messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                toolConfig: {
                    functionCallingConfig: {
                        mode: "AUTO"
                    }
                },
                tools: tools
            }
        } as any);

        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts;
        const call = parts?.find(p => p.functionCall)?.functionCall;

        if (call && call.name) {
            return {
                toolCall: {
                    name: call.name,
                    arguments: call.args as any
                }
            };
        }

        const textPart = parts?.find(p => p.text)?.text;
        const text = textPart || (response as any).text || "No se recibió respuesta de texto del modelo.";
        return { assistantText: text as string };

    } catch (error: any) {
        console.error("Gemini 3 API Error:", error);

        if (error.message?.includes("API_KEY_INVALID")) {
            return { assistantText: "Error de autenticación: La clave API de Gemini es inválida. Por favor, verifícala en Vercel." };
        }

        return { assistantText: `Error de la IA (Gemini 3): ${error.message}. Por favor, intenta de nuevo en unos segundos.` };
    }
}
