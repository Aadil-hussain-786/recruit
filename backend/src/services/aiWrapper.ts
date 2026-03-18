import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || ''; // Usually empty for local Ollama
const SERPER_API_KEY = process.env.SERPER_API_KEY || '';
const SERPER_URL = 'https://google.serper.dev/search';

/**
 * Perform OSINT search via Serper (Keep this as it's a search utility, not a model provider)
 */
export async function searchWeb(query: string) {
    if (!SERPER_API_KEY) return null;
    try {
        const response = await axios.post(SERPER_URL, { q: query }, {
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error('[SearchWeb] Failed:', error);
        return null;
    }
}

/**
 * Direct call to local Ollama instance
 */
async function callOllama(messages: any[], modelName: string = OLLAMA_MODEL, options: any = {}) {
    try {
        console.log(`[Ollama] Local Request. Model: ${modelName}`);
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
                timeout: options.timeout || 30000,
            }
        );

        return response.data.message.content;
    } catch (error: any) {
        console.warn(`[Ollama] Local instance failed: ${error.message}`);
        throw error;
    }
}

/**
 * Unified AI call utility. Now strictly uses ONLY local Ollama as requested.
 * We keep the name 'callOpenRouter' to avoid breaking existing code.
 */
export async function callOpenRouter(messages: any[], model: string = 'meta-llama/llama-3.3-70b-instruct', options: any = {}) {
    // Strictly use Only Local Ollama
    try {
        return await callOllama(messages, OLLAMA_MODEL, options);
    } catch (error: any) {
        console.error('[Ollama] Failed to process request:', error.message);
        throw new Error(`OLLAMA_FAILURE: ${error.message}`);
    }
}

/**
 * Shared utility for local embeddings
 */
export async function getEmbeddings(text: string, model: string = 'nomic-embed-text') {
    // Only use local Ollama embeddings as requested
    try {
        const response = await axios.post(
            'http://localhost:11434/api/embeddings',
            { model, prompt: text },
            { timeout: 10000 }
        );
        return response.data.embedding;
    } catch (error: any) {
        console.error('[Ollama] Embedding failed:', error.message);
        throw new Error(`EMBEDDING_FAILURE: ${error.message}`);
    }
}
