import { Index } from '@upstash/vector';
import dotenv from 'dotenv';

dotenv.config();

const UPSTASH_VECTOR_REST_URL = process.env.UPSTASH_VECTOR_REST_URL || '';
const UPSTASH_VECTOR_REST_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN || '';

const index = (UPSTASH_VECTOR_REST_URL && UPSTASH_VECTOR_REST_TOKEN) 
    ? new Index({
        url: UPSTASH_VECTOR_REST_URL,
        token: UPSTASH_VECTOR_REST_TOKEN,
    }) 
    : null;

export const vectorService = {
    /**
     * Upsert a candidate or job into the vector database
     */
    async upsert(id: string, vector: number[], metadata: any) {
        if (!index) return;
        try {
            await index.upsert({
                id,
                vector,
                metadata
            });
            console.log(`[Vector] Upserted ${id}`);
        } catch (error) {
            console.error(`[Vector] Upsert error for ${id}:`, error);
        }
    },

    /**
     * Query the vector database for similar items
     */
    async query(vector: number[], topK: number = 10, filter?: string) {
        if (!index) return [];
        try {
            const results = await index.query({
                vector,
                topK,
                includeMetadata: true,
                filter
            });
            return results;
        } catch (error) {
            console.error('[Vector] Query error:', error);
            return [];
        }
    },

    /**
     * Remove an item from the vector database
     */
    async delete(id: string) {
        if (!index) return;
        try {
            await index.delete(id);
        } catch (error) {
            console.error(`[Vector] Delete error for ${id}:`, error);
        }
    }
};
