import { callOpenRouter } from './aiWrapper';

export const assessmentService = {
    /**
     * Generate a comprehensive assessment with multiple question types
     * covering technical, behavioral, situational, and cognitive dimensions
     */
    async generateQuiz(
        role: string,
        skills: string[],
        difficulty: 'easy' | 'medium' | 'hard' = 'medium',
        experienceLevel: string = 'mid'
    ): Promise<any> {
        const prompt = `You are an elite assessment architect. Design a comprehensive skills evaluation for:
        
Role: ${role}
Core Skills: ${skills.join(', ')}
Difficulty: ${difficulty}
Experience Level: ${experienceLevel}

Generate EXACTLY 15 questions covering these 5 dimensions (3 questions each):

1. TECHNICAL KNOWLEDGE (3 questions):
   - MCQ questions testing deep technical understanding, not surface-level trivia
   - Include architecture decisions, trade-offs, and "why" questions
   
2. PROBLEM SOLVING (3 questions):
   - Scenario-based questions presenting a real-world problem
   - Type: "scenario" — with 4 options representing different approaches
   - Test analytical thinking and decision-making process
   
3. BEHAVIORAL & COMMUNICATION (3 questions):
   - Situational judgment questions: "You are in situation X, what do you do?"
   - Type: "situational" — with 4 options ranging from poor to excellent response
   - Test leadership, teamwork, conflict resolution, communication
   
4. COGNITIVE & ADAPTABILITY (3 questions):
   - Questions testing ability to learn new concepts, handle ambiguity
   - Type: "cognitive" — with 4 options
   - Test critical thinking and adaptability to change
   
5. DOMAIN DEPTH (3 questions):
   - Open-ended questions requiring explanation (type: "open_ended")
   - No options. Instead provide an "idealAnswer" field with what a great answer looks like
   - Test depth of knowledge and ability to articulate complex ideas

JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "type": "mcq" | "scenario" | "situational" | "cognitive" | "open_ended",
      "dimension": "technical" | "problem_solving" | "behavioral" | "cognitive" | "domain_depth",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "idealAnswer": null,
      "difficulty": "easy" | "medium" | "hard",
      "skill": "specific skill being tested",
      "weight": 1
    }
  ]
}

For open_ended questions: options should be null, correctAnswer should be null, and idealAnswer should contain the benchmark answer.
For all other types: idealAnswer should be null, correctAnswer must be one of the options.

CRITICAL: Questions must be ROLE-SPECIFIC and test REAL competency, not generic knowledge.
RETURN ONLY VALID JSON.`;

        try {
            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are an expert assessment designer. Return valid JSON only. No markdown, no explanation.' },
                { role: 'user', content: prompt }
            ], undefined, { temperature: 0.3, timeout: 45000 });

            const cleaned = responseText.replace(/```json\n?|\n?```/gi, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{"questions": []}');

            // Validate and normalize questions
            if (parsed.questions && Array.isArray(parsed.questions)) {
                parsed.questions = parsed.questions.map((q: any, i: number) => ({
                    id: q.id || i + 1,
                    question: q.question || '',
                    type: q.type || 'mcq',
                    dimension: q.dimension || 'technical',
                    options: q.type === 'open_ended' ? null : (q.options || []),
                    correctAnswer: q.type === 'open_ended' ? null : (q.correctAnswer || null),
                    idealAnswer: q.idealAnswer || null,
                    difficulty: q.difficulty || difficulty,
                    skill: q.skill || skills[0] || role,
                    weight: q.weight || 1
                }));
            }

            return parsed;
        } catch (error) {
            console.error('Error generating quiz:', error);
            return { questions: [] };
        }
    },

    /**
     * Grade assessment with dimension-wise scoring breakdown
     * Handles MCQ, scenario, situational, cognitive (auto-graded) and open-ended (AI-graded)
     */
    async gradeAssessment(questions: any[], candidateAnswers: any[]): Promise<any> {
        let totalWeightedScore = 0;
        let totalWeight = 0;
        const dimensionScores: Record<string, { correct: number; total: number; weight: number }> = {};
        const skillScores: Record<string, { correct: number; total: number }> = {};
        const openEndedForAI: { question: string; answer: string; idealAnswer: string; index: number }[] = [];

        const results: any[] = questions.map((q: any, index: number) => {
            const candidateAnswer = candidateAnswers[index] || '';
            const dimension = q.dimension || 'technical';
            const skill = q.skill || 'general';
            const weight = q.weight || 1;

            // Initialize dimension tracker
            if (!dimensionScores[dimension]) {
                dimensionScores[dimension] = { correct: 0, total: 0, weight: 0 };
            }
            dimensionScores[dimension].total++;
            dimensionScores[dimension].weight += weight;

            // Initialize skill tracker
            if (!skillScores[skill]) {
                skillScores[skill] = { correct: 0, total: 0 };
            }
            skillScores[skill].total++;

            if (q.type === 'open_ended') {
                // Queue for AI grading
                openEndedForAI.push({
                    question: q.question,
                    answer: candidateAnswer,
                    idealAnswer: q.idealAnswer || '',
                    index
                });
                return {
                    questionId: q.id,
                    question: q.question,
                    dimension,
                    type: q.type,
                    candidateAnswer,
                    idealAnswer: q.idealAnswer,
                    isCorrect: null, // Will be filled by AI
                    score: null,
                    skill,
                    weight
                };
            }

            // Auto-grade MCQ, scenario, situational, cognitive
            const isCorrect = q.correctAnswer === candidateAnswer;
            if (isCorrect) {
                dimensionScores[dimension].correct++;
                skillScores[skill].correct++;
                totalWeightedScore += weight;
            }
            totalWeight += weight;

            return {
                questionId: q.id,
                question: q.question,
                dimension,
                type: q.type,
                candidateAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                score: isCorrect ? 100 : 0,
                skill,
                weight
            };
        });

        // AI-grade open-ended questions
        if (openEndedForAI.length > 0) {
            try {
                const gradingPrompt = `Grade these open-ended answers. For each, provide a score (0-100) and brief feedback.
                
${openEndedForAI.map((item, i) => `
Q${i + 1}: ${item.question}
Ideal Answer: ${item.idealAnswer}
Candidate Answer: ${item.answer}
`).join('\n')}

Return JSON: { "grades": [{ "index": 0, "score": 75, "feedback": "..." }] }
RETURN ONLY JSON.`;

                const gradeResponse = await callOpenRouter([
                    { role: 'system', content: 'You are a fair technical evaluator. Return JSON only.' },
                    { role: 'user', content: gradingPrompt }
                ], undefined, { temperature: 0.1 });

                const cleaned = gradeResponse.replace(/```json\n?|\n?```/gi, '').trim();
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const gradeData = JSON.parse(jsonMatch[0]);
                    if (Array.isArray(gradeData.grades)) {
                        for (const grade of gradeData.grades) {
                            const originalItem = openEndedForAI[grade.index];
                            if (originalItem && results[originalItem.index]) {
                                const score = Math.max(0, Math.min(100, grade.score || 0));
                                results[originalItem.index].score = score;
                                results[originalItem.index].isCorrect = score >= 60;
                                results[originalItem.index].feedback = grade.feedback;

                                const dimension = results[originalItem.index].dimension;
                                const skill = results[originalItem.index].skill;
                                const weight = results[originalItem.index].weight;

                                totalWeightedScore += (score / 100) * weight;
                                totalWeight += weight;

                                if (score >= 60) {
                                    dimensionScores[dimension].correct++;
                                    skillScores[skill].correct++;
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error AI-grading open-ended questions:', err);
                // Mark as ungraded
                for (const item of openEndedForAI) {
                    results[item.index].score = 0;
                    results[item.index].isCorrect = false;
                    results[item.index].feedback = 'Could not be auto-graded. Manual review required.';
                    totalWeight += results[item.index].weight;
                }
            }
        }

        // Calculate overall score
        const overallScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;

        // Build dimension breakdown
        const dimensionBreakdown = Object.entries(dimensionScores).map(([dimension, data]) => ({
            dimension,
            label: dimension.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
            correct: data.correct,
            total: data.total
        }));

        // Build skill breakdown
        const skillBreakdown = Object.entries(skillScores).map(([skill, data]) => ({
            skill,
            score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
            correct: data.correct,
            total: data.total
        }));

        return {
            score: overallScore,
            totalQuestions: questions.length,
            correctAnswers: results.filter(r => r.isCorrect === true).length,
            dimensionBreakdown,
            skillBreakdown,
            results
        };
    }
};
