"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Briefcase, LogIn, UserPlus, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Jobs", href: "/jobs" },
    { name: "Candidates", href: "/candidates" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (pathname === "/") return null;

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-zinc-900 bg-black/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-900 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] overflow-hidden">
                                <img src="/logo.png" alt="Recruit Logo" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col -gap-1">
                                <span className="text-lg font-black tracking-tighter text-white font-display uppercase italic leading-none">
                                    Recruit
                                </span>
                                <span className="text-[8px] font-black tracking-[0.4em] text-zinc-600 uppercase">
                                    Engineering_Works
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center gap-10">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 hover:text-white",
                                        pathname === item.href
                                            ? "text-white"
                                            : "text-zinc-500"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden items-center gap-6 md:flex">
                        {!user ? (
                            <>
                                <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors">
                                    Protocol_Login
                                </Link>
                                <Link href="/register">
                                    <Button variant="premium" className="rounded-none bg-white text-black hover:bg-zinc-200 px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">
                                        Initialize System
                                    </Button>
                                </Link>

                            </>
                        ) : (
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 px-4 py-2 border border-zinc-800 bg-zinc-900">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                        {user.firstName}
                                    </span>
                                </div>
                                <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-red-500 transition-colors">
                                    Shutdown
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="border-b border-zinc-900 bg-black p-6 md:hidden">
                    <div className="flex flex-col gap-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <hr className="border-zinc-900" />
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                            Protocol_Login
                        </Link>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="premium" className="w-full rounded-none bg-white text-black text-[10px] font-black uppercase tracking-[0.2em]">
                                Initialize System
                            </Button>
                        </Link>

                    </div>
                </div>
            )}
        </nav>
    );
}
