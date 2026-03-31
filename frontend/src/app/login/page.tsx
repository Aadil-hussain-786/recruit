"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login, register } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login({ email, password });
            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.message || "Invalid credentials");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to connect to server. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white bg-grid text-slate-900 selection:bg-accent-cyan selection:text-white relative font-sans">
            <div className="w-full max-w-md space-y-8 glass-panel p-10 rounded-2xl relative z-10 box-border border border-slate-200">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 shadow-[0_4px_12px_rgba(14,165,233,0.1)]">
                        <LogIn className="h-6 w-6 text-accent-cyan" />
                    </div>
                    <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900 uppercase">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 font-medium">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Create one for free
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Email address</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-slate-900 text-sm font-medium transition-all focus:border-accent-cyan focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:text-slate-400"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Password</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-slate-900 text-sm font-medium transition-all focus:border-accent-cyan focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-medium">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link href="#" className="font-bold text-accent-cyan hover:text-sky-400 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-accent-cyan transition-all shadow-md" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200"></span>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="bg-white px-4 text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full h-12 border-2 border-slate-200 text-slate-900 hover:border-accent-cyan hover:text-accent-cyan transition-all text-xs font-black uppercase tracking-widest"
                        onClick={async () => {
                            setLoading(true);
                            setError("");
                            try {
                                const result = await login({ email: "demo@recruit.ai", password: "password123" });
                                if (result.success) {
                                    router.push("/dashboard");
                                } else {
                                    // If demo login fails, try to register it once for convenience
                                    const regResult = await register({ 
                                        email: "demo@recruit.ai", 
                                        password: "password123",
                                        firstName: "Demo",
                                        lastName: "User",
                                        organizationName: "Demo Corp"
                                    });
                                    if (regResult.success) {
                                        router.push("/dashboard");
                                    } else {
                                        setError("Quick access not available. Please register manually.");
                                    }
                                }
                            } catch (err: any) {
                                setError("Demo login failed. Please register a new account.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        ⚡ Quick Demo Access
                    </Button>
                </form>
            </div>
        </div>
    );
}
