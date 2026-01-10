const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyCpJ_gKnOtvj1er4dLv7LbQDxsze7iTI9c");

async function listModels() {
    try {
        const models = await genAI.listModels();
        console.log("AVAILABLE MODELS:");
        models.models.forEach(m => {
            console.log(`- ${m.name} (Methods: ${m.supportedMethods.join(', ')})`);
        });
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
