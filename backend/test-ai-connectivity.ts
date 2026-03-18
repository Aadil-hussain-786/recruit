import * as dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';

// Force load .env from the current directory (backend)
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function testAI() {
    console.log('Testing AI Connectivity...');
    console.log('API Key exists:', !!OPENROUTER_API_KEY);
    if (OPENROUTER_API_KEY) {
        console.log('API Key prefix:', OPENROUTER_API_KEY.substring(0, 10));
    }

    try {
        const response = await axios.post(
            OPENROUTER_URL,
            {
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{ role: 'user', content: 'Say "AI is working"' }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'Diagnostic',
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );

        console.log('Success!');
        console.log('Response:', response.data.choices[0].message.content);
    } catch (error: any) {
        console.error('AI Test Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAI();
