"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface AssessmentQuizProps {
    jobId: string;
    candidateId: string;
    role: string;
    skills: string[];
}

export default function AssessmentQuiz({ jobId, candidateId, role, skills }: AssessmentQuizProps) {
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        loadQuiz();
    }, []);

    useEffect(() => {
        if (quiz && !submitted) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [quiz, submitted]);

    const loadQuiz = async () => {
        try {
            const res = await api.post('/assessments/generate', { role, skills, difficulty: 'medium' });
            if (res.data.success) {
                setQuiz(res.data.data);
                setAnswers(new Array(res.data.data.questions.length).fill(''));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (answer: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        try {
            const res = await api.post('/assessments/submit', {
                candidateId,
                jobId,
                questions: quiz.questions,
                answers
            });
            if (res.data.success) {
                setResults(res.data.data);
                setSubmitted(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="p-8 text-center text-zinc-500">Generating personalized quiz...</div>;
    }

    if (submitted && results) {
        return (
            <div className="space-y-6">
                <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 rounded-2xl">
                    <CheckCircle className="mx-auto text-emerald-500" size={64} />
                    <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Assessment Complete!</h2>
                    <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mt-6">{results.score}%</p>
                    <p className="text-sm text-zinc-500 mt-2">{results.correctAnswers} out of {results.totalQuestions} correct</p>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Dimension Breakdown</h3>
                    {(results.dimensionBreakdown || []).map((db: any) => (
                        <div key={db.dimension} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{db.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-400">{db.correct}/{db.total}</span>
                                <span className={cn("text-sm font-bold", db.score >= 70 ? "text-emerald-600" : db.score >= 50 ? "text-amber-600" : "text-red-600")}>{db.score}%</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Skill Breakdown</h3>
                    {(results.skillBreakdown || []).map((sb: any) => (
                        <div key={sb.skill} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{sb.skill}</span>
                            <span className={cn("text-sm font-bold", sb.score >= 70 ? "text-emerald-600" : sb.score >= 50 ? "text-amber-600" : "text-red-600")}>{sb.score}%</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    <Clock size={16} className="text-zinc-400" />
                    {formatTime(timeRemaining)}
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex items-start gap-3 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {currentQuestion + 1}
                    </div>
                    <div className="flex-1">
                        <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">{question.question}</p>
                        <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase">
                            {question.skill}
                        </span>
                    </div>
                </div>

                {(question.type === 'mcq' || question.type === 'scenario' || question.type === 'situational' || question.type === 'cognitive') && question.options && (
                    <div className="space-y-2">
                        {question.type !== 'mcq' && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-3">
                                {question.type === 'scenario' ? 'Scenario Analysis' : question.type === 'situational' ? 'Situational Judgment' : 'Cognitive Assessment'}
                            </p>
                        )}
                        {question.options.map((option: string, index: number) => (
                            <label
                                key={index}
                                className={cn(
                                    "flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                                    answers[currentQuestion] === option
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                )}
                            >
                                <input type="radio" name="answer" value={option} checked={answers[currentQuestion] === option} onChange={(e) => handleAnswerChange(e.target.value)} className="h-4 w-4 text-indigo-600" />
                                <span className="text-sm text-zinc-900 dark:text-zinc-50">{option}</span>
                            </label>
                        ))}
                    </div>
                )}

                {question.type === 'open_ended' && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Open Response — Explain your answer</p>
                        <textarea
                            value={answers[currentQuestion] || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            placeholder="Type your detailed answer here..."
                            rows={6}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                >
                    Previous
                </Button>
                {currentQuestion === quiz.questions.length - 1 ? (
                    <Button variant="premium" className="gap-2" onClick={handleSubmit}>
                        <Send size={16} />
                        Submit Assessment
                    </Button>
                ) : (
                    <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
}
