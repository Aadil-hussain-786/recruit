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
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                        <LogIn className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
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
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email address</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
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
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-900 dark:text-zinc-300">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" variant="premium" className="w-full h-12 text-base" disabled={loading}>
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
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">Or continue with</span>
                        </div>
                    </div>

                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full h-12 border-2 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50"
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
