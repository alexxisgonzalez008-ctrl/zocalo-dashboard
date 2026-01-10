const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');

// Basic .env parser
const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
    }, {});

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

async function testTools() {
    try {
        const tools = [{
            functionDeclarations: [{
                name: "propose_material_order",
                description: "Genera una propuesta de pedido de materiales.",
                parameters: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    description: { type: "string" },
                                    requestedQuantity: { type: "number" }
                                }
                            }
                        }
                    },
                    required: ["items"]
                }
            }]
        }];

        console.log("Testing with gemini-3-flash-preview...");
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: "agrega 10 ladrillos" }] }],
            config: {
                systemInstruction: `You are Asistente, a professional construction assistant.
CRITICAL: When the user mentions ANY construction material with a quantity, ALWAYS call propose_material_order IMMEDIATELY.
EXAMPLES:
- "agrega 10 ladrillos" → call propose_material_order with items: [{description: "ladrillos", requestedQuantity: 10}]
NEVER ask questions. Just execute.`,
                toolConfig: {
                    functionCallingConfig: {
                        mode: "ANY"
                    }
                }
            },
            tools: tools
        });

        console.log("Full Response:", JSON.stringify(response, null, 2));

        const candidate = response.candidates?.[0];
        const call = candidate?.content?.parts?.find(p => p.functionCall);

        if (call) {
            console.log("SUCCESS: Tool call found!", call.functionCall.name);
        } else {
            console.log("FAILURE: No tool call found. Response text:", response.text);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testTools();
