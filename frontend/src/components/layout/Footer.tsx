import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-900 text-white">
                <Briefcase size={20} className="stroke-white" />
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
            <p className="mt-8 max-w-xs text-[10px] font-medium leading-relaxed uppercase tracking-widest text-zinc-500">
              Autonomous Talent Extraction Layer. 
              Built for the next generation of engineering leadership.
            </p>
          </div>
          
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Directories</h3>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.2em]">
              <li><Link href="/jobs" className="text-zinc-500 hover:text-white transition-colors">Talent_Pool</Link></li>
              <li><Link href="/candidates" className="text-zinc-500 hover:text-white transition-colors">Neural_Mappings</Link></li>
              <li><Link href="/register" className="text-zinc-500 hover:text-white transition-colors">Join_Ecosystem</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Protocols</h3>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.2em]">
              <li><Link href="/about" className="text-zinc-500 hover:text-white transition-colors">System_Specs</Link></li>
              <li><Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors">Security_Layer</Link></li>
              <li><button className="text-zinc-500 hover:text-white transition-colors text-left uppercase">Support_Terminal</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-700">
            © {new Date().getFullYear()} RECRUIT_ENGINEERING_WORKS // ALL_SYSTEMS_GO
          </p>
          <div className="flex gap-8">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-800">Status: Operational</span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-800">Version: 1.0.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
