import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    console.log('Fetching OpenRouter models...');
    try {
        const response = await axios.get('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
            }
        });

        const models = response.data.data;
        const freeModels = models.filter((m: any) => m.id.includes(':free'));
        console.log(`Found ${freeModels.length} free models.`);
        freeModels.forEach((m: any) => console.log(`- ${m.id}`));
    } catch (err: any) {
        console.error('Error listing models:', err.message);
    }
}

listModels();
