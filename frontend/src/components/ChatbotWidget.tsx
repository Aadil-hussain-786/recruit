"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'bot';
    content: string;
    source?: string;
}

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: "Hi! I'm here to help with your application questions. How can I assist you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await api.post('/chatbot/message', {
                message: userMessage,
                candidateId: null, // Would be populated if user is logged in
                applicationId: null
            });

            if (res.data.success) {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: res.data.data.response,
                    source: res.data.data.source
                }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "I'm experiencing technical difficulties. Please try again or contact our support team.",
                source: 'error'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all hover:scale-105"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col w-96 h-[600px] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <Bot className="text-white" size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">RecruitAI Assistant</h3>
                                <p className="text-xs text-white/80">Online • Instant replies</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role === 'bot' && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                        <Bot size={16} />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                                        msg.role === 'user'
                                            ? "bg-indigo-600 text-white rounded-br-none"
                                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 rounded-bl-none"
                                    )}
                                >
                                    {msg.content}
                                    {msg.source === 'faq' && (
                                        <span className="block mt-1 text-[10px] opacity-70">From FAQ</span>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                                        <User size={16} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl rounded-bl-none px-4 py-2">
                                    <Loader2 className="animate-spin text-zinc-400" size={16} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
