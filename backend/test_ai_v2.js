const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function testAI() {
    console.log('Testing OpenRouter connectivity with Gemini Flash (faster)...');
    
    try {
        const response = await axios.post(
            OPENROUTER_URL,
            {
                model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
                messages: [{ role: 'user', content: 'Say hello' }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        console.log('Response:', response.data.choices[0].message.content);
        console.log('SUCCESS');
    } catch (error) {
        console.error('FAILED:', error.response?.data || error.message);
    }
}

testAI();
