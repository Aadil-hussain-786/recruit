import dotenv from 'dotenv';
import { callOpenRouter } from './src/services/aiWrapper';

dotenv.config();

async function test() {
    console.log('Testing OpenRouter connection...');
    try {
        const response = await callOpenRouter([
            { role: 'user', content: 'Say "Connection successful" if you can hear me.' }
        ]);
        console.log('Response:', response);
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

test();
