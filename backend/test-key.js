const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function test() {
    console.log("Testing API Key:", apiKey ? "FOUND" : "MISSING");
    if (!apiKey) return;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Let's try to list models first
        // Note: listModels is on the genAI object or requires a different approach in some versions
        // Actually, let's just try 'gemini-pro' which is the most basic name
        const modelsToTry = ["gemini-pro", "gemini-1.5-flash", "gemini-1.0-pro"];
        
        for (const m of modelsToTry) {
            try {
                console.log(`Trying model: ${m}`);
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Say hello");
                console.log(`SUCCESS with ${m}:`, result.response.text());
                return;
            } catch (e) {
                console.log(`FAILURE with ${m}:`, e.message);
            }
        }
    } catch (e) {
        console.log("GENERAL FAILURE:", e.message);
    }
}
test();
