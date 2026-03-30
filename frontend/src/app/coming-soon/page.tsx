import Link from "next/link";
import { ArrowLeft, Sparkles, Compass } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl border border-white/5 bg-white/5 backdrop-blur-xl p-10 md:p-16 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 mb-8 mx-auto shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-white/10">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
          Something Extraordinary
          <br className="hidden md:block" /> is Coming Soon.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl font-light">
          We are currently crafting an experience that will redefine possibilities. 
          The infrastructure is being laid, stay tuned for the revolution.
        </p>

        <Link 
          href="/"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 rounded-full text-white font-medium shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.15)] backdrop-blur-md"
        >
          <Compass className="w-5 h-5 text-blue-400 group-hover:-rotate-45 transition-transform duration-500" />
          Return to Hub
        </Link>
      </div>

      {/* Decorative lines grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
    </div>
  );
}
