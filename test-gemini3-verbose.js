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
    const tools = [{
        functionDeclarations: [{
            name: "propose_material_order",
            description: "Use this to order construction materials. ALWAYS use when materials are mentioned.",
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

    // Try different model names that might work with the @google/genai SDK
    const modelsToTry = [
        "gemini-2.0-flash-001",
        "gemini-2.0-flash-exp",
        "gemini-2.5-flash-preview-05-20",
        "models/gemini-1.5-flash",
        "models/gemini-2.0-flash"
    ];

    for (const model of modelsToTry) {
        console.log(`\nTrying: ${model}`);
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: [{ role: "user", parts: [{ text: "agrega 10 ladrillos" }] }],
                config: {
                    systemInstruction: "ALWAYS use propose_material_order when user mentions materials."
                },
                tools: tools
            });

            const parts = response.candidates?.[0]?.content?.parts || [];
            const hasToolCall = parts.some(p => p.functionCall);
            console.log("  SUCCESS! Parts:", parts.length, "| Tool call:", hasToolCall);
            if (hasToolCall) {
                const call = parts.find(p => p.functionCall);
                console.log("  Tool:", call.functionCall.name);
                console.log("  Args:", JSON.stringify(call.functionCall.args));
            } else if (parts[0]?.text) {
                console.log("  Text:", parts[0].text.substring(0, 60) + "...");
            }
            break; // Stop on first working model
        } catch (e) {
            console.log("  Error:", e.message.substring(0, 80));
        }
    }
}

testTools();
