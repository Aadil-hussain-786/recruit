const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function testAI() {
    console.log('Testing OpenRouter connectivity...');
    console.log('Using Key:', OPENROUTER_API_KEY ? (OPENROUTER_API_KEY.substring(0, 10) + '...') : 'MISSING');

    try {
        const response = await axios.post(
            OPENROUTER_URL,
            {
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{ role: 'user', content: 'Say hello' }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );

        console.log('Response:', response.data.choices[0].message.content);
        console.log('SUCCESS');
    } catch (error) {
        console.error('FAILED:', error.response?.data || error.message);
    }
}

testAI();
