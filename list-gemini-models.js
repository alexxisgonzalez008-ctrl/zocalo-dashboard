const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Basic .env parser
const envPath = path.join(__dirname, '.env');
const env = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
    }, {});

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        console.log("Using API Key:", (env.GEMINI_API_KEY || "").substring(0, 10) + "...");
        const result = await genAI.listModels();
        console.log("AVAILABLE MODELS:");
        // The result of listModels is an iterable
        for await (const model of genAI.listModels()) {
            console.log(`- ${model.name} (Methods: ${model.supportedMethods.join(', ')})`);
        }
    } catch (e) {
        console.error("Error listing models:", e.message);
        if (e.response) {
            console.error("Status:", e.status);
            console.error("Data:", JSON.stringify(e.response.data, null, 2));
        }
    }
}

listModels();
