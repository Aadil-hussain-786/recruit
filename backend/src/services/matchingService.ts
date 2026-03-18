import { callOpenRouter } from './aiWrapper';

export const matchingService = {
    /**
     * Calculate cosine similarity between two vectors.
     * Returns 0 safely if either vector is zero-length or mismatched.
     */
    cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (!vecA || !vecB || vecA.length === 0 || vecB.length !== vecA.length) return 0;
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        if (normA === 0 || normB === 0) return 0;
        const similarity = dotProduct / (normA * normB);
        // Guard against NaN from floating point edge cases
        return isNaN(similarity) ? 0 : Math.max(0, similarity);
    },

    /**
     * Check if an embedding is a usable real vector (not random/zeroed fallback).
     * - Random vectors: all values ~0.5, high variance near 0.25, cosine similarity ~0.5
     * - Real semantic embeddings: values span full range, many near 0
     * - Zero vectors: all 0 (from old broken fallback)
     */
    isValidEmbedding(embedding: number[]): boolean {
        if (!embedding || embedding.length === 0) return false;

        // Zero-filled array = failed embedding
        const nonZero = embedding.some(v => v !== 0);
        if (!nonZero) return false;

        // Detect a random vector: Math.random() fills values in [0,1) with mean ~0.5
        // Real embeddings have mean near 0 and values spanning negative/positive ranges
        // If ALL values are positive and mean > 0.4 it's almost certainly a random fallback
        const mean = embedding.reduce((s, v) => s + v, 0) / embedding.length;
        const allPositive = embedding.every(v => v >= 0);
        if (allPositive && mean > 0.4) return false; // Random fallback detected

        return true;
    },

    /**
     * Keyword + skills overlap score. Used as the primary scorer when embeddings are
     * unavailable so we never return a random/meaningless result.
     * 
     * Scoring breakdown:
     *  - Skills overlap against job tokens: weighted heavily
     *  - Job title match: bonus
     *  - Experience normalised score: bonus
     */
    keywordScore(job: { title: string; description: string }, candidate: any): number {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        const jobTokens = new Set(
            jobText.split(/[^a-z0-9+.#]+/).filter((t: string) => t.length > 2)
        );

        const candidateSkills: string[] = candidate.skills || [];
        const titleTokens = (candidate.currentTitle || '').toLowerCase().split(/\s+/);
        const companyTokens = (candidate.currentCompany || '').toLowerCase().split(/\s+/);
        const allCandTokens = [
            ...candidateSkills.map((s: string) => s.toLowerCase()),
            ...titleTokens,
            ...companyTokens,
        ].filter((t: string) => t.length > 2);

        // If no usable tokens, score is 0 (no fake floors)
        if (allCandTokens.length === 0) return 0;

        let matches = 0;
        let total = 0;

        for (const token of allCandTokens) {
            total++;
            if (jobTokens.has(token)) matches++;
        }

        // Skill overlap ratio (0-65 points)
        const overlapRatio = total > 0 ? matches / total : 0;
        let score = Math.round(overlapRatio * 65);

        // Title bonus (up to 25 points)
        const titleMatch = titleTokens.some((t: string) => t.length > 2 && jobTokens.has(t));
        if (titleMatch) score += 25;

        // No artificial floor — honest scoring
        return Math.min(Math.max(score, 0), 100);
    },

    /**
     * Rank candidates. Uses REAL embeddings if valid, falls back to keyword overlap.
     * Never uses random vectors.
     */
    rankCandidates(job: { title: string; description: string; embedding?: number[] }, candidates: any[]): any[] {
        const hasValidJobEmbedding = job.embedding && this.isValidEmbedding(job.embedding);

        return candidates
            .map(candidate => {
                const hasValidCandEmbedding = candidate.embedding && this.isValidEmbedding(candidate.embedding);

                let score: number;
                let scoreMethod: string;

                if (hasValidJobEmbedding && hasValidCandEmbedding) {
                    // Vector similarity (most accurate) — scale from [-1,1] to [0,100]
                    const similarity = this.cosineSimilarity(job.embedding!, candidate.embedding);
                    score = Math.round(similarity * 100);
                    scoreMethod = 'vector';
                } else {
                    // Keyword overlap (always deterministic and meaningful)
                    score = this.keywordScore(job, candidate);
                    scoreMethod = 'keyword';
                }

                return { ...candidate, matchScore: score, _scoreMethod: scoreMethod };
            })
            .sort((a, b) => b.matchScore - a.matchScore);
    },

    /**
     * Deep qualitative match using the LLM.
     * Builds a clean, readable candidate summary so the AI gets REAL signal.
     */
    async deepQualitativeMatch(
        job: { title: string; description: string },
        candidate: any,
        modelId?: string
    ): Promise<{ score: number; reasoning: string }> {

        // Build a lean, readable profile — no raw JSON dumps
        const expYears = candidate.totalExperience
            ? `${Math.round(candidate.totalExperience / 12)} years`
            : 'unknown';

        const skills = Array.isArray(candidate.skills) && candidate.skills.length > 0
            ? candidate.skills.slice(0, 15).join(', ')
            : 'Not listed';

        const location = candidate.location?.city
            ? `${candidate.location.city}, ${candidate.location.country || ''}`
            : 'Not specified';

        const portfolioLink = candidate.socialLinks?.portfolio || 'Not provided';

        // Include any neural insights from interviews
        const neuralNotes = Array.isArray(candidate.patterns?.notes) && candidate.patterns.notes.length > 0
            ? candidate.patterns.notes[candidate.patterns.notes.length - 1]
            : 'None available (No interview conducted)';

        const candidateProfile = `
Candidate: ${candidate.firstName || ''} ${candidate.lastName || ''}
Current Role: ${candidate.currentTitle || 'Unknown'} at ${candidate.currentCompany || 'Unknown'}
Experience: ${expYears}
Skills: ${skills}
Location: ${location}
Portfolio: ${portfolioLink}
Neural Summary (from AI Interview): ${neuralNotes}
`.trim();

        const jobContext = `
Job Title: ${job.title}
Job Description (excerpt):
${job.description.substring(0, 800)}
`.trim();

        const prompt = `You are an expert technical recruiter. Evaluate how well this candidate matches this job.

${jobContext}

---

${candidateProfile}

---

Instructions:
- Give a match score from 0 to 100 based on REAL skill and experience alignment
- If the candidate's skills are clearly unrelated to the job, score MUST be below 30
- If the candidate's skills strongly match, score should be 70-100
- Be honest and critical. Avoid inflating scores.
- Provide 1-2 sentence reasoning explaining WHY the score is what it is

RETURN ONLY VALID JSON in this exact format:
{"score": <number 0-100>, "reasoning": "<1-2 sentence explanation>"}`;

        try {
            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are a precise recruiter AI. Return only valid JSON. No markdown, no explanation outside JSON.' },
                { role: 'user', content: prompt }
            ], modelId || 'Meta-Llama-3.1-8B-Instruct');

            // Strip markdown code fences if present
            const cleaned = responseText.replace(/```json\n?|\n?```/gi, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON in response');

            const parsed = JSON.parse(jsonMatch[0]);
            const score = typeof parsed.score === 'number'
                ? Math.max(0, Math.min(100, Math.round(parsed.score)))
                : 0;

            return {
                score,
                reasoning: parsed.reasoning || 'No reasoning provided.'
            };
        } catch (error) {
            console.error('[matchingService] deepQualitativeMatch error:', error);
            return { score: 0, reasoning: 'AI analysis could not be completed. Score is based on keyword matching only.' };
        }
    },

    /**
     * Re-rank candidates to ensure diversity (Diversity-Aware Recommendations).
     * Only penalises duplicate companies after the first 5 confirmed matches.
     */
    diversifyRecommendations(rankedCandidates: any[]): any[] {
        const diversified: any[] = [];
        const seenCompanies = new Set<string>();

        for (const candidate of rankedCandidates) {
            const company = (candidate.currentCompany || '').toLowerCase().trim();
            if (!company || !seenCompanies.has(company) || diversified.length >= 5) {
                diversified.push(candidate);
                if (company) seenCompanies.add(company);
            } else {
                diversified.push({
                    ...candidate,
                    matchScore: Math.max(0, candidate.matchScore - 5),
                    biasedFlag: true
                });
            }
        }

        return diversified.sort((a, b) => b.matchScore - a.matchScore);
    }
};
