import axios from 'axios';
import { LLMResponse, CopilotMessage, ToolCall } from './types';

// TODO: En producción, esto vendría de variables de entorno
const LLM_GATEWAY_URL = process.env.LLM_GATEWAY_URL || 'https://api-inference.huggingface.co/models/google/functiongemma-270m-it';
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

export async function invokeLLMGateway(payload: {
    userId: string;
    projectId: string;
    messages: CopilotMessage[];
    tools: any[];
}): Promise<LLMResponse> {
    // Convertimos el historial al formato que espera FunctionGemma
    // El modelo usa rol 'developer' para las herramientas
    const formattedMessages = [
        { role: 'developer', content: 'You are a model that can do function calling with the following functions' },
        ...payload.messages.map(m => ({ role: m.role, content: m.content }))
    ];

    try {
        // Si no hay token de HF, simulamos respuesta para desarrollo local si es necesario
        // Pero aquí implementamos la estructura real
        const response = await axios.post(
            LLM_GATEWAY_URL,
            {
                inputs: JSON.stringify({
                    messages: formattedMessages,
                    tools: payload.tools
                }),
                // Parámetros específicos del modelo si se usa vía Inference API
            },
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Parsing manual del output estructurado de FunctionGemma
        // El modelo devuelve algo como: <start_function_call>call:nombre{...}<end_function_call>
        const outputText = response.data[0]?.generated_text || "";

        return parseFunctionGemmaOutput(outputText);
    } catch (error) {
        console.error('LLM Gateway Error:', error);
        return { assistantText: "Lo siento, tuve un error al procesar tu solicitud con el modelo de IA." };
    }
}

function parseFunctionGemmaOutput(text: string): LLMResponse {
    const toolCallMatch = text.match(/<start_function_call>call:(\w+)\{(.*)\}<end_function_call>/);

    if (toolCallMatch) {
        const name = toolCallMatch[1];
        const argsString = `{${toolCallMatch[2]}}`;
        try {
            const args = JSON.parse(argsString);
            return { toolCall: { name, arguments: args } };
        } catch (e) {
            console.error("Error parsing arguments from model:", e);
        }
    }

    // Si no hay match de herramienta, devolvemos el texto plano (limpiando tags si existen)
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    return { assistantText: cleanText || "No pude interpretar la acción." };
}
