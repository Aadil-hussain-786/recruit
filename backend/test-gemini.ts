import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing GEMINI_API_KEY:', apiKey ? 'FOUND (starts with ' + apiKey.substring(0, 10) + ')' : 'NOT FOUND');

async function testGemini() {
    if (!apiKey) {
        console.error('No API key found!');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Test Text Generation
        console.log('\n--- Testing Text Generation (gemini-1.5-flash) ---');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello world");
        console.log('Result:', result.response.text());

        // Test Embeddings
        console.log('\n--- Testing Embeddings (text-embedding-004) ---');
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedResult = await embedModel.embedContent("Test text for embedding");
        console.log('Embedding length:', embedResult.embedding.values.length);

        console.log('\n✅ Gemini API is working correctly!');
    } catch (error: any) {
        console.error('\n❌ Gemini API Error:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

testGemini();
