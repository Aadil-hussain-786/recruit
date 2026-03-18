
import axios from 'axios';

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev/search';

export async function searchGoogle(query: string) {
    if (!SERPER_API_KEY) {
        throw new Error('SERPER_API_KEY is not defined in environment variables.');
    }

    try {
        const response = await axios.post(SERPER_API_URL, {
            q: query,
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error calling Serper.dev API:', error);
        throw error;
    }
}
