import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || ''; // Usually empty for local Ollama

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SERPER_API_KEY = process.env.SERPER_API_KEY || '';
const SERPER_URL = 'https://google.serper.dev/search';

/**
 * Perform OSINT search via Serper
 */
export async function searchWeb(query: string) {
    if (!SERPER_API_KEY) {
        console.warn('[SearchWeb] Missing SERPER_API_KEY in .env');
        return null;
    }
    try {
        console.log(`[SearchWeb] Searching OSINT: ${query}`);
        const response = await axios.post(SERPER_URL, { q: query }, {
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error: any) {
        console.error('[SearchWeb] API Error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Direct call to Groq Cloud (Primary)
 */
async function callGroq(messages: any[], modelName: string = GROQ_MODEL, options: any = {}) {
    if (!GROQ_API_KEY) throw new Error('MISSING_GROQ_KEY');

    try {
        console.log(`[Groq] Requesting ${modelName}...`);
        const response = await axios.post(
            GROQ_URL,
            {
                model: modelName,
                messages: messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens || 4096,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: options.timeout || 30000,
            }
        );

        return response.data.choices[0].message.content;
    } catch (error: any) {
        console.error(`[Groq] API failed: ${error.response?.data?.error?.message || error.message}`);
        throw error;
    }
}

/**
 * Direct call to local Ollama instance (Fallback)
 */
async function callOllama(messages: any[], modelName: string = OLLAMA_MODEL, options: any = {}) {
    try {
        console.log(`[Ollama] Local Request. Model: ${modelName}. messages: ${messages.length}`);
        const response = await axios.post(
            OLLAMA_URL,
            {
                model: modelName,
                messages: messages,
                temperature: options.temperature ?? 0.7,
                stream: false
            },
            {
                headers: OLLAMA_API_KEY ? { 'Authorization': `Bearer ${OLLAMA_API_KEY}` } : {},
                timeout: options.timeout || 45000,
            }
        );

        return response.data.message.content;
    } catch (error: any) {
        console.error(`[Ollama] Local instance failed: ${error.message}`);
        throw error;
    }
}

/**
 * Unified AI call utility. 
 * Priorities: 1. Groq (Fastest/Reliable) 2. Ollama (Local)
 */
export async function callOpenRouter(messages: any[], model: string = '', options: any = {}) {
    // 1. Try Groq if key exists
    if (GROQ_API_KEY) {
        try {
            return await callGroq(messages, model || GROQ_MODEL, options);
        } catch (error: any) {
            console.warn('[AI Wrapper] Groq failed, falling back to Ollama...');
        }
    }

    // 2. Fallback to Ollama
    try {
        return await callOllama(messages, OLLAMA_MODEL, options);
    } catch (error: any) {
        console.error('[AI Wrapper] All AI providers failed.');
        throw new Error(`AI_FAILURE: ${error.message}`);
    }
}

/**
 * Shared utility for local embeddings
 */
export async function getEmbeddings(text: string, model: string = 'nomic-embed-text') {
    try {
        const response = await axios.post(
            'http://localhost:11434/api/embeddings',
            { model, prompt: text },
            { timeout: 10000 }
        );
        return response.data.embedding;
    } catch (error: any) {
        console.error('[Ollama] Embedding failed:', error.message);
        // If local embedding fails, we return empty to let the caller handle it (e.g. skip vector search)
        return [];
    }
}

