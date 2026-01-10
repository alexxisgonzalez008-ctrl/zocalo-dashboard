import axios from 'axios';
import { LLMResponse, CopilotMessage, ToolCall } from './types';

// TODO: En producción, esto vendría de variables de entorno
const DEFAULT_MODEL = 'meta-llama/Llama-3.1-8B-Instruct';
const LLM_GATEWAY_URL = process.env.LLM_GATEWAY_URL || `https://router.huggingface.co/v1/chat/completions`;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN?.trim();

export async function invokeLLMGateway(payload: {
    userId: string;
    projectId: string;
    messages: CopilotMessage[];
    tools: any[];
}): Promise<LLMResponse> {
    const systemPrompt = `You are Islara AI, a professional construction assistant.
Your primary goal is to help the user manage the project by using the available tools.

STRICT INSTRUCTIONS:
1. When the user asks to register, create, search, or propose something (like a material order, expense, or daily log), you MUST call the appropriate tool.
2. DO NOT respond with a list or a conversational response if a tool call is more appropriate.
3. CONTEXT ISOLATION: Use ONLY the information provided in the user's LATEST message for tool call arguments. 
4. FRESH START: Every new user request for an order is a blank slate. Do not carry over items from previous messages or assistant responses.
5. If the user mentions items in a conversational way but hasn't asked to "order" or "register" them yet, ask for clarification instead of calling a tool with old data.

NEGATIVE EXAMPLE (WHAT NOT TO DO):
User: "Carga un pedido de 10 bolsas de cemento"
Assistant (WRONG): "Aquí tienes la lista: Piedra, Arena, Cemento, Hierro..." (DO NOT DO THIS)
Assistant (CORRECT): <start_function_call>call:propose_material_order{"items": [{"description": "Bolsas de cemento", "requestedQuantity": 10}]}<end_function_call>

Current Project ID: ${payload.projectId}
Available tools: ${JSON.stringify(payload.tools)}`;

    try {
        const response = await axios.post(
            LLM_GATEWAY_URL,
            {
                model: DEFAULT_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...payload.messages.map(m => ({ role: m.role, content: m.content }))
                ],
                max_tokens: 500,
                temperature: 0.1, // Baja temperatura para mayor consistencia en el formato
            },
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const outputText = response.data.choices[0]?.message?.content || "";
        console.log("RAW LLM OUTPUT:", outputText);
        return parseFunctionGemmaOutput(outputText);
    } catch (error: any) {
        console.error("Hugging Face API Error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            return { assistantText: "Error de autenticación: El token de Hugging Face es inválido. Por favor, verifica el archivo .env." };
        }

        if (error.response?.status === 404 || error.response?.status === 410) {
            return { assistantText: `El modelo de IA (${DEFAULT_MODEL}) no está disponible (Error ${error.response?.status}). Por favor, intenta más tarde o cambia el modelo.` };
        }

        return { assistantText: "Lo siento, tuve un error al procesar tu solicitud con el modelo de IA. Verifica tu conexión o el token de Hugging Face." };
    }
}

function parseFunctionGemmaOutput(text: string): LLMResponse {
    // 1. Intentar match con tags: <start_function_call>call:name{JSON}<end_function_call>
    let toolCallMatch = text.match(/<start_function_call>\s*call:(\w+)\s*(\{[\s\S]*\})\s*<end_function_call>/);

    // 2. Si no hay match con tags, intentar match directo con call:name{JSON}
    if (!toolCallMatch) {
        toolCallMatch = text.match(/call:(\w+)\s*(\{[\s\S]*\})/);
    }

    if (toolCallMatch) {
        const name = toolCallMatch[1];
        let argsString = toolCallMatch[2].trim();

        // 3. Limpiar el JSON si el modelo incluyó texto extra después de la última llave
        const lastBraceIndex = argsString.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            argsString = argsString.substring(0, lastBraceIndex + 1);
        }

        try {
            const args = JSON.parse(argsString);
            return { toolCall: { name, arguments: args } };
        } catch (e) {
            console.error("Error parsing arguments from model. argsString:", argsString, e);
            // Si el JSON falla, intentamos devolver el texto original para no perder la info
        }
    }

    // 4. Si no hay match de herramienta o falló el parseo, devolvemos el texto plano limpio
    const cleanText = text
        .replace(/<start_function_call>/g, '')
        .replace(/<end_function_call>/g, '')
        .replace(/call:\w+\s*\{[\s\S]*\}/, '')
        .trim();

    return { assistantText: cleanText || "Recibí una respuesta pero no pude interpretarla como una acción. ¿Podrías repetirlo?" };
}
