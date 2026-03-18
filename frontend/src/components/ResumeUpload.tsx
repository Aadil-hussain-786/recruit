"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
    onParsed: (data: any) => void;
}

export default function ResumeUpload({ onParsed }: ResumeUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
    const [error, setError] = useState("");
    const [language, setLanguage] = useState("en-US");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [retrying, setRetrying] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getErrorMessage = (err: any): string => {
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            return "Upload timed out. Please try again.";
        }
        if (!navigator.onLine) {
            return "Connection failed. Please check your internet.";
        }
        if (err.response) {
            const status = err.response.status;
            const message = err.response.data?.message || err.response.data?.error;
            if (status === 500) {
                return "Server error. Please try again later.";
            }
            if (status === 400) {
                if (message?.includes('file') || message?.includes('size')) {
                    return "File exceeds 5MB limit.";
                }
                if (message?.includes('type') || message?.includes('format')) {
                    return "Only PDF and DOCX files are allowed.";
                }
                return message || "Server error. Please try again later.";
            }
            if (status === 413) {
                return "File exceeds 5MB limit.";
            }
            if (status >= 400 && status < 500) {
                return message || "Invalid request. Please check your file.";
            }
            return "Server error. Please try again later.";
        }
        if (err.message?.includes('Network error') || err.message?.includes('Network')) {
            return "Connection failed. Please check your internet.";
        }
        return "Failed to parse resume. Please try again.";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            // File type validation
            if (!validTypes.includes(selectedFile.type)) {
                setError("Only PDF and DOCX files are allowed.");
                return;
            }

            // File size validation (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (selectedFile.size > maxSize) {
                setError("File exceeds 5MB limit.");
                return;
            }

            setFile(selectedFile);
            setError("");
            handleUpload(selectedFile);
        }
    };

    const handleUpload = async (fileToUpload: File, isRetry = false) => {
        if (!isRetry) {
            setIsParsing(true);
            setStatus('parsing');
            setError("");
            setUploadProgress(0);
        } else {
            setRetrying(true);
        }

        const formData = new FormData();
        formData.append('resume', fileToUpload);
        formData.append('language', language);

        try {
            const res = await api.post('/candidates/parse-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000, // 30 second timeout
                onUploadProgress: (progressEvent: any) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || fileToUpload.size));
                    setUploadProgress(percent);
                }
            });

            if (res.data.success) {
                setStatus('success');
                onParsed(res.data.data);
            } else {
                throw new Error("Parsing failed");
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setError(getErrorMessage(err));
        } finally {
            setIsParsing(false);
            setUploadProgress(0);
            setRetrying(false);
        }
    };

    const handleRetry = () => {
        if (file) {
            handleUpload(file, true);
        }
    };

    return (
        <div className="w-full">
            <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all",
                    status === 'idle' && "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 bg-zinc-50 dark:bg-zinc-900/50",
                    status === 'parsing' && "border-indigo-400 bg-indigo-50/10",
                    status === 'success' && "border-emerald-400 bg-emerald-50/10",
                    status === 'error' && "border-red-400 bg-red-50/10"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-700 mb-4">
                    {status === 'idle' && <Upload className="text-zinc-600 dark:text-zinc-400" size={24} />}
                    {status === 'parsing' && <Loader2 className="animate-spin text-indigo-600" size={24} />}
                    {status === 'success' && <CheckCircle className="text-emerald-500" size={24} />}
                    {status === 'error' && <AlertCircle className="text-red-500" size={24} />}
                </div>

                <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {status === 'parsing' ? "AI is analyzing resume..." :
                            status === 'success' ? "Resume parsed successfully!" :
                                "Upload Candidate Resume"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        PDF or Word (max 5MB)
                    </p>
                </div>

                {/* Language Selection */}
                {status === 'idle' && (
                    <div className="mt-4">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Interview Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="en-US">English</option>
                            <option value="ja-JP">Japanese</option>
                        </select>
                    </div>
                )}

                {/* Upload Progress */}
                {status === 'parsing' && (
                    <div className="mt-4 w-full max-w-xs">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Preparing upload..."}
                            </span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Retry Button */}
                {status === 'error' && (
                    <div className="mt-4">
                        <Button
                            onClick={handleRetry}
                            disabled={retrying}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw size={16} className={retrying ? "animate-spin" : ""} />
                            {retrying ? "Retrying..." : "Try Again"}
                        </Button>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} /> {error}
                </p>
            )}

            {file && status !== 'idle' && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <FileText className="text-zinc-400" size={18} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">{file.name}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
            )}
        </div>
    );
}
