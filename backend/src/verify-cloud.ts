import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyCloud() {
    const url = process.env.OLLAMA_URL || '';
    const key = process.env.OLLAMA_API_KEY || '';
    
    if (!url) {
        console.error('OLLAMA_URL is missing in .env');
        return;
    }

    console.log('Testing Cloud Endpoint:', url);
    
    // Convert completions URL to models URL
    const modelsUrl = url.replace('/v1/chat/completions', '/v1/models').replace('/api/chat', '/api/tags');

    try {
        const response = await axios.get(modelsUrl, {
            headers: key ? { 'Authorization': `Bearer ${key}` } : {},
            timeout: 5000
        });

        console.log('\n--- Available Models ---');
        if (response.data.data) {
            // OpenAI format
            response.data.data.forEach((m: any) => console.log(`- ${m.id}`));
        } else if (response.data.models) {
            // Ollama native format
            response.data.models.forEach((m: any) => console.log(`- ${m.name}`));
        } else {
            console.log('Unknown response format:', response.data);
        }
        console.log('\nCopy the exact name of the model you want and paste it into OLLAMA_MODEL in your .env');

    } catch (err: any) {
        console.error('\nFailed to list models.');
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data));
        }
        console.log('\nEnsure your OLLAMA_URL is correct and includes the protocol (http/https).');
    }
}

verifyCloud();
