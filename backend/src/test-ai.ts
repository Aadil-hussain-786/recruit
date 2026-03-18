import { callOpenRouter } from './services/aiWrapper';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testing OpenRouter AI Compatibility...');
    try {
        const response = await callOpenRouter([
            { role: 'user', content: 'Say hello world' }
        ]);
        console.log('Response:', response);
        console.log('SUCCESS: OpenRouter API is working!');
    } catch (err: any) {
        console.error('FAILURE: OpenRouter API error:');
        console.error(err.message);
    }
}

test();
