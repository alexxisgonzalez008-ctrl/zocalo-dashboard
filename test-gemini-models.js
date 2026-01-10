const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
let GEMINI_API_KEY = "";
for (const line of envLines) {
    if (line.includes('GEMINI_API_KEY=')) {
        GEMINI_API_KEY = line.split('=')[1].trim();
        break;
    }
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const modelsToTest = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-8b-latest",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
];

async function testModels() {
    for (const modelName of modelsToTest) {
        console.log(`Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi, say 'ok'");
            const response = await result.response;
            console.log(`✅ Success with ${modelName}: ${response.text().trim()}`);
        } catch (e) {
            console.log(`❌ Fail with ${modelName}: ${e.message}`);
        }
    }
}

testModels();
