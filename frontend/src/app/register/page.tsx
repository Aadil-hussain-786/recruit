"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UserPlus, Mail, Lock, User, Building, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        organizationName: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await register(formData);
            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.message || "Registration failed");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to connect to server. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white bg-grid text-slate-900 selection:bg-accent-cyan selection:text-white relative font-sans">
            <div className="w-full max-w-lg space-y-8 glass-panel p-10 rounded-2xl relative z-10 box-border border border-slate-200 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 shadow-[0_4px_12px_rgba(14,165,233,0.1)]">
                        <UserPlus className="h-6 w-6 text-accent-cyan" />
                    </div>
                    <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900 uppercase">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 font-medium">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-accent-cyan hover:text-sky-400 transition-colors">
                            Sign in instead
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">First Name</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                </div>
                                <input
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-slate-900 text-sm font-medium transition-all focus:border-accent-cyan focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:text-slate-400"
                                    placeholder="John"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Last Name</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                </div>
                                <input
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-slate-900 text-sm font-medium transition-all focus:border-accent-cyan focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:text-slate-400"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Organization Name</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <Building className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            </div>
                            <input
                                name="organizationName"
                                required
                                value={formData.organizationName}
                                onChange={handleChange}
                                className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-slate-900 text-sm font-medium transition-all focus:border-accent-cyan focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:text-slate-400"
                                placeholder="Acme Inc."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Email address</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
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
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-slate-900 text-sm font-medium transition-all focus:border-accent-cyan focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-cyan placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-accent-cyan transition-all shadow-md mt-6" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create account"
                        )}
                    </Button>
                </form>

                <p className="mt-4 text-center text-xs text-slate-500 font-medium">
                    By signing up, you agree to our{" "}
                    <Link href="#" className="underline hover:text-accent-cyan transition-colors">Terms of Service</Link> and{" "}
                    <Link href="#" className="underline hover:text-accent-cyan transition-colors">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}
