"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    Send,
    Terminal,
    Sparkles,
    ShieldCheck,
    Zap,
    Loader2,
    User,
    Cpu,
    ArrowRight,
    CheckCircle2,
    Video,
    VideoOff,
    MicOff,
    Volume2,
    Camera,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface Message {
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
}

export default function AIInterviewPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const applicationId = searchParams.get('appId');
    const candId = searchParams.get('candId');
    const candidateName = searchParams.get('name');

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: candidateName 
                ? `Neural link established. Welcome, ${candidateName}. Click 'Initiate Sequence' to begin your protocol.`
                : "Neural link established. Click 'Initiate Sequence' to begin.",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isAIspeaking, setIsAIspeaking] = useState(false);
    const [interviewStatus, setInterviewStatus] = useState<'intro' | 'active' | 'completed'>('intro');
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // Live Q&A tracking: stores {question, answer} pairs captured in real-time
    const [rawQA, setRawQA] = useState<{ question: string; answer: string }[]>([]);
    const pendingQuestionRef = useRef<string | null>(null);
    const [showVideo, setShowVideo] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isMicOnRef = useRef(true);
    const isAIspeakingRef = useRef(false);
    const isTypingRef = useRef(false);
    const interviewStatusRef = useRef<'intro' | 'active' | 'completed'>('intro');

    // Sync refs with state
    useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
    useEffect(() => { isAIspeakingRef.current = isAIspeaking; }, [isAIspeaking]);
    useEffect(() => { isTypingRef.current = isTyping; }, [isTyping]);
    useEffect(() => { interviewStatusRef.current = interviewStatus; }, [interviewStatus]);

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const availableVoices = window.speechSynthesis.getVoices();
                if (availableVoices.length > 0) setVoices(availableVoices);
            }
        };
        loadVoices();
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const [speechError, setSpeechError] = useState<string | null>(null);

    // Speech Recognition Setup
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = process.env.NEXT_PUBLIC_INTERVIEW_LANGUAGE || 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
                setSpeechError(null);

                if (transcript.trim()) {
                    // Immediate trigger if voice match detected
                    handleSendMessage(undefined, transcript);
                }
            };

            const retryCountRef = { current: 0 };
            const MAX_RETRIES = 3;

            recognitionRef.current.onerror = (event: any) => {
                if (event.error !== 'no-speech') {
                    console.error('Speech recognition error:', event.error);
                }
                setIsListening(false);

                // Set specific error message for UI
                if (event.error === 'network') {
                    if (!window.navigator.onLine) {
                        setSpeechError("Internet connection lost. Please check your network and try again.");
                    } else if (retryCountRef.current < MAX_RETRIES) {
                        retryCountRef.current++;
                        setSpeechError(`Voice engine connection unstable. Retrying (${retryCountRef.current}/${MAX_RETRIES})...`);
                        setTimeout(() => {
                            // Re-check mic status from state is tricky in closure, 
                            // but isMicOn is likely stable enough for this use case
                            safeStartRecognition();
                        }, 2000);
                    } else {
                        setSpeechError("The browser's voice engine is having persistent connection trouble. Please try refreshing the page or continue by typing below.");
                    }
                } else if (event.error === 'not-allowed') {
                    setSpeechError("Microphone access denied. Please allow microphone permissions in your browser settings.");
                } else if (event.error === 'no-speech') {
                    // Silently handle or show a very soft hint instead of a hard error
                    setSpeechError("I didn't hear anything. Let's try typing, or click the mic to try again.");
                    // Auto-clear this specific "soft" error after 3 seconds
                    setTimeout(() => setSpeechError(prev => prev?.includes("didn't hear") ? null : prev), 4000);
                } else {
                    setSpeechError(`Voice engine error: ${event.error}. Please try typing or refresh.`);
                }
            };

            recognitionRef.current.onstart = () => {
                if (speechError?.includes("Retrying")) {
                    setSpeechError(null);
                }
                retryCountRef.current = 0; // Reset on success
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);

                // Auto-restart if it ended due to silence (not a manual stop or result)
                // and we are still in an active interview state
                if (isMicOnRef.current && !isAIspeakingRef.current && !isTypingRef.current && interviewStatusRef.current === 'active') {
                    // Small delay to avoid tight loops
                    setTimeout(() => {
                        if (isMicOnRef.current && !isAIspeakingRef.current && !isTypingRef.current && interviewStatusRef.current === 'active') {
                            safeStartRecognition();
                        }
                    }, 500);
                }
            };

            return () => {
                if (recognitionRef.current) {
                    recognitionRef.current.abort();
                }
            };
        }
    }, [applicationId]);

    const safeStartRecognition = () => {
        if (!recognitionRef.current || isAIspeaking || isTyping) return;

        setSpeechError(null);
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err: any) {
            // Already started error is common and can be ignored
            if (err.name !== 'InvalidStateError' && err.name !== 'NotAllowedError') {
                console.error('Failed to start recognition:', err);
                setIsListening(false);
            } else if (err.name === 'InvalidStateError') {
                // Already running, just ensure state is correct
                setIsListening(true);
            }
        }
    };

    // Safety resets
    useEffect(() => {
        if (isTyping) {
            const timer = setTimeout(() => setIsTyping(false), 20000);
            return () => clearTimeout(timer);
        }
    }, [isTyping]);

    useEffect(() => {
        if (isAIspeaking) {
            const timer = setTimeout(() => setIsAIspeaking(false), 45000);
            return () => clearTimeout(timer);
        }
    }, [isAIspeaking]);

    const speak = (text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Force-clear any stuck synthesis
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        setIsAIspeaking(false);

        // Required for some browsers to allow speech after a small delay
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance; // Keep reference to prevent GC

            utterance.onstart = () => {
                console.log('Speech started');
                setIsAIspeaking(true);
            };

            utterance.onend = () => {
                console.log('Speech ended');
                setIsAIspeaking(false);
                utteranceRef.current = null;

                // AUTO-TRIGGER LISTENING after AI finishes speaking
                if (isMicOnRef.current && interviewStatusRef.current === 'active') {
                    setTimeout(() => {
                        safeStartRecognition();
                    }, 400);
                }
            };

            utterance.onerror = (event: any) => {
                const errorMapping: any = {
                    'not-allowed': 'Permission denied by browser.',
                    'network': 'Voice server connection failed.',
                    'canceled': 'Speech interrupted.',
                    'interrupted': 'Speech interrupted by new request.'
                };
                const friendlyError = errorMapping[event.error] || `Voice engine error (${event.error || 'Unknown'})`;
                console.error('SpeechSynthesisUtterance error detail:', {
                    error: event.error,
                    message: event.message,
                    originalEvent: event
                });

                // If it's a hard error, notify the user so it doesn't feel like a "buggy" game
                if (event.error && event.error !== 'canceled' && event.error !== 'interrupted') {
                    setSpeechError(`Voice engine notice: I'll continue text-only for a moment. (${friendlyError})`);
                }

                setIsAIspeaking(false);
                utteranceRef.current = null;

                // Critical: recovery trigger
                if (isMicOnRef.current && interviewStatusRef.current === 'active') {
                    safeStartRecognition();
                }
            };

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            // Attempt to get voices if they are still empty
            let currentVoices = voices;
            if (currentVoices.length === 0) {
                currentVoices = window.speechSynthesis.getVoices();
                if (currentVoices.length > 0) setVoices(currentVoices);
            }

            if (currentVoices.length > 0) {
                const targetLang = process.env.NEXT_PUBLIC_INTERVIEW_LANGUAGE || 'en-US';
                const langCode = targetLang.split('-')[0];

                const preferredVoice = currentVoices.find(v => v.lang === targetLang && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    currentVoices.find(v => v.lang.startsWith(langCode) && (v.name.includes('Natural') || v.name.includes('Online'))) ||
                    currentVoices.find(v => v.lang.startsWith(langCode)) ||
                    currentVoices.find(v => v.name.includes('Natural')) ||
                    currentVoices.find(v => v.lang.startsWith('en'));

                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
                utterance.lang = targetLang;
            }

            window.speechSynthesis.speak(utterance);
        }, 100);
    };

    const handleSendMessage = async (e?: React.FormEvent, overrideMessage?: string) => {
        e?.preventDefault();
        const userMessage = overrideMessage || inputValue.trim();
        if (!userMessage || isTyping) return;

        setSpeechError(null);
        setInputValue("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
        setIsTyping(true);

        // If there's a pending AI question, pair it with this candidate answer
        if (pendingQuestionRef.current) {
            setRawQA(prev => [...prev, { question: pendingQuestionRef.current!, answer: userMessage }]);
            pendingQuestionRef.current = null;
        }

        try {
            // Keep history lean (last 8 messages)
            const history = messages.slice(-8).map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await api.post('/chatbot/message', {
                message: userMessage,
                history,
                applicationId,
                context: { type: 'interview', stage: 'preliminary' }
            });

            const aiResponse = res.data?.data?.response || "I'm processing your answer, but I'm having a momentary connection issue. Could you please clarify your last point?";

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            }]);

            // Track this AI message as the pending question for the next candidate answer
            pendingQuestionRef.current = aiResponse;

            // Wait for state to settle then speak
            setTimeout(() => speak(aiResponse), 100);

        } catch (err: any) {
            console.error('Chat error:', err);
            const errorMsg = err.response?.data?.message || "Connection sync error. Please check your signal and I'll wait.";
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, timestamp: new Date() }]);
            speak(errorMsg);
        } finally {
            setIsTyping(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            safeStartRecognition();
        }
    };

    useEffect(() => {
        if (showVideo && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(err => console.error("Error accessing camera:", err));
        }
    }, [showVideo]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const startInterview = () => {
        setInterviewStatus('active');
        setShowVideo(true);
        // Automatically trigger the first question from the AI
        handleSendMessage(undefined, "I am ready to start the interview. Please begin.");
    };

    const handleFinishInterview = async () => {
        setIsAnalyzing(true);
        setInterviewStatus('completed');
        window.speechSynthesis.cancel();
        try {
            const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
            // Also send rawQA: the exact Q&A pairs captured live (no AI re-extraction needed)
            const res = await api.post('/chatbot/complete-interview', {
                candidateId: candId,
                applicationId,
                transcript,
                rawQA
            });
            if (res.data.success) {
                setAnalysis(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white selection:bg-white selection:text-black">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-xl z-20">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                        Secure Interview Session // 0x4A2B
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">End-to-End Encrypted</span>
                    </div>
                    <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest" onClick={() => router.back()}>
                        Terminate
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative flex flex-col items-center">
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

                {interviewStatus === 'intro' ? (
                    <div className="max-w-2xl w-full px-6 flex flex-col items-center justify-center h-full text-center z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-black mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                                <Zap size={32} />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight font-display mb-6">
                                Warp-In <br /><span className="text-zinc-500">Interview</span>
                            </h1>
                            <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
                                Welcome to your AI-led technical screening. We'll discuss your background, skills, and problem-solving approach.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
                                {[
                                    { icon: Cpu, title: 'Neural Analysis', desc: 'Real-time skill vector mapping' },
                                    { icon: Terminal, title: 'Code Context', desc: 'Discuss your technical choices' }
                                ].map((item, i) => (
                                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                        <item.icon size={20} className="mb-3 text-zinc-300" />
                                        <h3 className="text-sm font-bold uppercase tracking-widest mb-1">{item.title}</h3>
                                        <p className="text-xs text-zinc-500">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={startInterview}
                                variant="premium"
                                className="bg-white text-black hover:bg-zinc-200 rounded-none px-12 py-8 text-sm font-black tracking-[0.3em] uppercase transition-all hover:scale-105"
                            >
                                Initiate Sequence
                            </Button>
                        </motion.div>
                    </div>
                ) : interviewStatus === 'active' ? (
                    <div className="w-full h-full flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
                        {/* LEFT: Meeting Tiles */}
                        <div className="flex-[2] flex flex-col gap-4 h-full overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                {/* AI TILE */}
                                <div className="relative bg-zinc-900 rounded-[32px] overflow-hidden border border-white/5 flex items-center justify-center group shadow-2xl">
                                    <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Neural Recruiter // V2</span>
                                    </div>

                                    <div className="relative flex items-center justify-center">
                                        <div className={`absolute h-48 w-48 rounded-full border border-indigo-500/20 transition-all duration-500 ${isAIspeaking ? 'scale-150 animate-pulse bg-indigo-500/5' : 'scale-100'}`} />
                                        <div className={`absolute h-64 w-64 rounded-full border border-indigo-500/10 transition-all duration-700 ${isAIspeaking ? 'scale-125' : 'scale-100'}`} />

                                        <div className="relative z-10 h-32 w-32 rounded-full bg-black border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.2)]">
                                            <div className={`h-full w-full bg-gradient-to-t from-indigo-500/20 to-emerald-500/20 absolute inset-0 ${isAIspeaking ? 'animate-pulse' : ''}`} />
                                            <Cpu size={48} className={isAIspeaking ? 'text-indigo-400 scale-110 transition-transform' : 'text-zinc-700'} />
                                        </div>

                                        {isAIspeaking && (
                                            <div className="absolute bottom-[-60px] flex items-center gap-1">
                                                {[...Array(8)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: [4, 24, 4] }}
                                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                        className="w-1 bg-indigo-500/50 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5">
                                            <p className="text-sm font-medium text-indigo-200 leading-relaxed italic line-clamp-2">
                                                {isTyping ? "Processing your last point..." : messages[messages.length - 1].role === 'assistant' ? messages[messages.length - 1].content : "Listening..."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CANDIDATE TILE */}
                                <div className="relative bg-zinc-900 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                                    {showVideo ? (
                                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale opacity-80" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                            <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                                                <User size={40} />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Connection Estabilished</span>
                                        </div>
                                    )}
                                    <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">LOKI CANDIDATE</span>
                                    </div>

                                    {isListening && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/10 border-2 border-indigo-500/50 rounded-[32px] pointer-events-none z-30">
                                            <div className="animate-ping h-20 w-20 rounded-full bg-indigo-500/20" />
                                            <Mic size={32} className="text-white absolute mt-0" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* MEETING CONTROLS */}
                            <div className="h-20 bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-3xl flex items-center justify-center gap-8 shadow-2xl">
                                <button onClick={() => setIsMicOn(!isMicOn)} className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-rose-500/20 text-rose-500'}`}>
                                    {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                                </button>
                                <button onClick={() => setShowVideo(!showVideo)} className={`p-4 rounded-2xl transition-all ${showVideo ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-rose-500/20 text-rose-500'}`}>
                                    {showVideo ? <Video size={24} /> : <VideoOff size={24} />}
                                </button>
                                <button onClick={handleFinishInterview} className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all hover:scale-105">
                                    End Interview
                                </button>
                                <div className="h-10 w-[1px] bg-white/10 mx-4" />
                                <Volume2 size={20} className="text-zinc-500" />
                            </div>
                        </div>

                        {/* RIGHT Sidebar */}
                        <div className="hidden lg:flex flex-col flex-1 bg-zinc-950/50 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Sequence Transcript</h3>
                            </div>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                {messages.map((msg, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between group/msg">
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${msg.role === 'assistant' ? 'text-indigo-400' : 'text-zinc-400'}`}>
                                                {msg.role === 'assistant' ? 'Neural Recruiter' : 'Candidate'}
                                            </span>
                                            {msg.role === 'assistant' && (
                                                <button
                                                    onClick={() => speak(msg.content)}
                                                    className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 hover:text-indigo-400"
                                                >
                                                    <Volume2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                                            {msg.content}
                                        </p>
                                    </div>
                                ))}
                                {isTyping && <div className="h-4 w-12 bg-white/5 rounded-full animate-pulse" />}
                            </div>

                            <div className="p-6 border-t border-white/5">
                                {speechError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-400 flex items-center gap-2"
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        {speechError}
                                    </motion.div>
                                )}
                                <form onSubmit={handleSendMessage} className="relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => {
                                            setInputValue(e.target.value);
                                            if (speechError) setSpeechError(null);
                                        }}
                                        placeholder={isListening ? "Listening..." : "Type or speak your answer..."}
                                        className={`w-full bg-white/5 border ${isListening ? 'border-indigo-500/50' : 'border-white/10'} rounded-2xl py-4 pl-6 pr-20 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-zinc-100`}
                                    />
                                    <div className="absolute right-2 top-2 bottom-2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={toggleListening}
                                            title="Toggle Microphone"
                                            className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-indigo-500 text-white animate-pulse' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            <Mic size={16} />
                                        </button>
                                        <button type="submit" disabled={isTyping || !inputValue.trim()} className="bg-white/10 text-white p-2 rounded-xl hover:bg-white/20 transition-all">
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-2 text-[9px] text-zinc-600 flex justify-between px-2">
                                    <span>{speechError ? "Manual input required" : "Auto-listening is enabled"}</span>
                                    <span className="cursor-help underline" title="If voice recognition fails, try refreshing the page or checking your internet connection.">Troubleshooting</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl w-full px-6 flex flex-col items-center justify-center h-full text-center z-10">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                            {isAnalyzing ? (
                                <>
                                    <div className="relative h-32 w-32 mx-auto">
                                        <div className="absolute inset-0 rounded-full border-2 border-white/5 animate-ping" />
                                        <div className="absolute inset-0 flex items-center justify-center text-indigo-500"><Cpu size={40} className="animate-spin-slow" /></div>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Synthesizing Neural Patterns</h2>
                                </>
                            ) : (
                                <>
                                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-black mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]"><CheckCircle2 size={32} /></div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Sequence Terminated</h2>
                                    {analysis && (analysis.status === 'insufficient_data' || analysis.status === 'error') ? (
                                        <div className="max-w-xl mx-auto p-12 bg-white/5 border border-white/10 rounded-[40px] mb-12 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative z-10 text-center">
                                                <div className={`h-16 w-16 ${analysis.status === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-white/5 text-zinc-500'} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                                    {analysis.status === 'error' ? <Zap size={32} /> : <AlertCircle size={32} />}
                                                </div>
                                                <h3 className="text-lg font-black uppercase tracking-tight mb-4">
                                                    {analysis.status === 'error' ? 'Analysis Offline' : 'Insufficient Evidence'}
                                                </h3>
                                                <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                                                    {analysis.status === 'error'
                                                        ? "The neural engine encountered a network error during synthesis. Your interview has been recorded, but pattern extraction is currently unavailable."
                                                        : "The interview was too brief for a reliable neural assessment. Meaningful pattern extraction requires a more detailed technical conversation."
                                                    }
                                                </p>
                                                <div className="flex flex-col items-center gap-2 py-4 border-y border-white/5 mb-8">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Metric Lockdown</div>
                                                    <div className="flex gap-2 opacity-30">
                                                        {[...Array(5)].map((_, i) => <div key={i} className="h-1 w-8 bg-zinc-600 rounded-full" />)}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Manual Review by Recruiter Recommended</p>
                                            </div>
                                        </div>
                                    ) : analysis ? (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                                                {[
                                                    { label: 'Technical', val: analysis.technicalAptitude },
                                                    { label: 'Leadership', val: analysis.leadershipPotential },
                                                    { label: 'Culture', val: analysis.culturalAlignment },
                                                    { label: 'Creativity', val: analysis.creativity },
                                                    { label: 'Confidence', val: analysis.confidence }
                                                ].map((stat, i) => (
                                                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                                        <div className="text-2xl font-black mb-1">{stat.val}</div>
                                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="max-w-xl mx-auto text-left space-y-6 mb-12">
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
                                                        <Sparkles size={14} /> Neural Summary
                                                    </h3>
                                                    <p className="text-sm text-zinc-400 leading-relaxed italic">
                                                        "{analysis.summary}"
                                                    </p>
                                                </div>

                                                {analysis.biasAnalysis && (
                                                    <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-4 flex items-center gap-2">
                                                            <AlertCircle size={14} /> Fairness & Bias Report
                                                        </h3>
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="text-2xl font-black text-amber-500">{analysis.biasAnalysis.score}</div>
                                                            <div className="text-[10px] text-amber-500/50 font-bold uppercase tracking-widest leading-tight">Diversity & Inclusion<br />Index</div>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {Array.isArray(analysis.biasAnalysis.findings) && analysis.biasAnalysis.findings.map((finding: string, i: number) => (
                                                                <li key={i} className="text-[11px] text-zinc-500 flex gap-3">
                                                                    <span className="text-amber-500">•</span> {finding}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="max-w-xl mx-auto p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl mb-12">
                                            <AlertCircle size={32} className="text-rose-500 mx-auto mb-4" />
                                            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Analysis Sync Failed</h3>
                                            <p className="text-xs text-zinc-500 leading-relaxed">
                                                We encountered a temporary error while synthesizing your results.
                                                Don't worry—your interview has been saved and our team will review it shortly.
                                            </p>
                                        </div>
                                    )}
                                    <Button onClick={() => router.push('/')} variant="outline" className="border-white/10 hover:bg-white/5 py-6 px-12 text-[10px] font-black uppercase tracking-widest">Exit Terminal</Button>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
