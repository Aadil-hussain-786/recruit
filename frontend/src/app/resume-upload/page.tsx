'use client';

import { useState, useRef } from 'react';
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, Sparkles, Download } from 'lucide-react';
import JDSelector from '@/components/JDSelector';
import api from '@/lib/api';

interface Job {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface MatchReport {
  overallMatchScore: number;
  matchedQualifications: string[];
  missingQualifications: string[];
  recommendations: string[];
  interviewQuestions: string[];
  redFlags: string[];
  strengths: string[];
  summary: string;
  confidence: number;
}

export default function ResumeUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchReport | null>(null);
  const [error, setError] = useState('');
  const [uploadedResumeId, setUploadedResumeId] = useState('');
  const [step, setStep] = useState<'upload' | 'analyze' | 'result'>('upload');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setResult(null);
      setStep('upload');
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a resume file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', selectedFile);
      if (selectedJob?._id) {
        formData.append('jobDescriptionId', selectedJob._id);
      }

      const response = await api.post('/v1/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response.data;

      if (!response.status || response.status < 200 || response.status >= 300) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      setUploadedResumeId(data.data.resumeId);
      setStep('analyze');
      setLoading(false);
    } catch (err: any) {
      const serverError = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      setError(serverError);
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedResumeId || !selectedJob) {
      setError('Please upload a resume and select a job');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const res = await api.post('/analysis/analyze', {
        resumeId: uploadedResumeId,
        jobId: selectedJob._id
      });

      if (res.data.success) {
        setResult(res.data.data);
        setStep('result');
      } else {
        throw new Error(res.data.message || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;

    const reportText = `
RESUME ANALYSIS REPORT
======================
Job: ${selectedJob?.title}
Date: ${new Date().toLocaleDateString()}

SUMMARY
-------
${result.summary}

OVERALL MATCH SCORE: ${result.overallMatchScore}%

STRENGTHS
---------
${result.strengths.map(s => `• ${s}`).join('\n')}

MATCHED QUALIFICATIONS
----------------------
${result.matchedQualifications.map(m => `✓ ${m}`).join('\n')}

MISSING QUALIFICATIONS
----------------------
${result.missingQualifications.map(m => `✗ ${m}`).join('\n')}

RECOMMENDATIONS
---------------
${result.recommendations.map(r => `• ${r}`).join('\n')}

INTERVIEW QUESTIONS
-------------------
${result.interviewQuestions.map(q => `Q: ${q}`).join('\n\n')}

RED FLAGS
---------
${result.redFlags.map(r => `⚠ ${r}`).join('\n')}

Confidence: ${Math.round(result.confidence * 100)}%
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${selectedJob?.title.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          AI Resume Analyzer
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Upload a resume and select a job to get AI-powered matching analysis
        </p>

        <div className="grid gap-6">
          {/* Step 1: Job Selection */}
          <JDSelector
            onSelect={handleJobSelect}
            selectedJobId={selectedJob?._id}
          />

          {/* Step 2: Upload */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500">
              <div className="flex items-center gap-2 text-white">
                <FileText size={20} />
                <h2 className="font-semibold text-lg">Upload Resume</h2>
              </div>
            </div>

            <div className="p-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
              >
                <Upload size={48} className="mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to select resume (PDF, DOC, DOCX, TXT)'}
                </p>
                {selectedFile && (
                  <p className="text-sm text-zinc-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className={`mt-4 w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${!selectedFile || loading
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Resume
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 3: Analyze */}
          {step === 'analyze' && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-500">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles size={20} />
                  <h2 className="font-semibold text-lg">AI Analysis</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4 mb-4">
                  <div>
                    <p className="text-sm text-violet-600 dark:text-violet-400">Ready to analyze</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedFile?.name} → {selectedJob?.title}
                    </p>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className={`py-2 px-4 rounded-lg font-semibold flex items-center gap-2 ${analyzing
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                      }`}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Start AI Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 'result' && result && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-black flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle size={20} />
                  <h2 className="font-semibold text-lg">Analysis Complete</h2>
                </div>
                <button
                  onClick={downloadReport}
                  className="py-1.5 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium flex items-center gap-1"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-zinc-700 dark:text-zinc-300">{result.summary}</p>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Match Score</span>
                      <span className={`text-2xl font-bold ${result.overallMatchScore >= 70 ? 'text-green-600' :
                          result.overallMatchScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {result.overallMatchScore}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${result.overallMatchScore >= 70 ? 'bg-green-500' :
                            result.overallMatchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${result.overallMatchScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 mb-2">Strengths</h3>
                    <ul className="space-y-1">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Red Flags */}
                  {result.redFlags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-600 mb-2">Red Flags</h3>
                      <ul className="space-y-1">
                        {result.redFlags.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Matched */}
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 mb-2">Matched</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedQualifications.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          {m}
                        </span>
                      ))}
                      {result.matchedQualifications.length === 0 && (
                        <span className="text-sm text-zinc-500">No matches found</span>
                      )}
                    </div>
                  </div>

                  {/* Missing */}
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 mb-2">Missing</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingQualifications.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                          {m}
                        </span>
                      ))}
                      {result.missingQualifications.length === 0 && (
                        <span className="text-sm text-zinc-500">All requirements met!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Sparkles size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interview Questions */}
                <div>
                  <h3 className="text-sm font-semibold text-violet-600 mb-2">Interview Questions</h3>
                  <div className="space-y-2">
                    {result.interviewQuestions.map((q: any, i) => (
                      <div key={i} className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          <span className="text-violet-600 mr-1">Q{i + 1}:</span> 
                          {typeof q === 'string' ? q : q.question}
                        </p>
                        {typeof q !== 'string' && q.idealAnswer && (
                          <p className="mt-1 text-xs text-zinc-500 italic">
                            Alt: {q.idealAnswer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}