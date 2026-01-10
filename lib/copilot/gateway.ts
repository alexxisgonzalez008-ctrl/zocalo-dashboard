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
        // Transform tools for the new GenAI SDK
        const tools = payload.tools.map(t => ({
            function_declarations: [{
                name: t.function.name,
                description: t.function.description,
                parameters: {
                    type: "object",
                    properties: t.function.parameters.properties,
                    required: t.function.parameters.required
                } as any
            }]
        }));

        const systemInstruction = `You are Asistente, a professional construction assistant.
Your primary goal is to help the user manage the project by using the available tools.

STRICT INSTRUCTIONS:
1. Every user message about "pedidos", "gastos" or "bitácora" should be treated as a NEW and ISOLATED request.
2. CONTEXT ISOLATION: Do NOT use items, materials, or vendors from previous turns unless explicitly asked to "add to the previous order".
3. LATEST FOCUS: Focus ONLY on the most recent user message to extract quantities and items. 
4. If the latest message is "agrega 3 sacos de piedra", and the previous was "2 bolsas de arena", you MUST only order 3 sacos de piedra.
5. If the user is just chatting, respond normally.

Current Project ID: ${payload.projectId}`;

        const lastMessage = payload.messages[payload.messages.length - 1].content;
        const history = payload.messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: lastMessage,
            config: {
                systemInstruction: systemInstruction,
            } as any,
            tools: tools as any
        });

        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts;
        const call = parts?.find(p => p.functionCall)?.functionCall;

        if (call) {
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
