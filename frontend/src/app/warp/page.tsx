"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Workflow,
  Shield,
  Cpu,
  Zap,
  Rocket,
  Terminal,
} from "lucide-react";
import { useState } from "react";

function SectionHeading({ kicker, title, highlight }: { kicker?: string; title: string; highlight?: string }) {
  return (
    <div className="text-center mb-12">
      {kicker && (
        <div className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-500 mb-4">{kicker}</div>
      )}
      <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] font-display uppercase">
        {title} {highlight && <span className="italic text-zinc-400">{highlight}</span>}
      </h2>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-colors hover:bg-black hover:text-white">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(600px_200px_at_20%_0%,#000,transparent)` }} />
      <Icon className="h-6 w-6 mb-6 text-zinc-700 group-hover:text-white" />
      <h3 className="text-xl font-black mb-2 uppercase tracking-tight font-display">{title}</h3>
      <p className="text-zinc-500 group-hover:text-zinc-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200">
      <button
        className="w-full py-5 flex items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-base md:text-lg font-semibold">{q}</span>
        <span className="ml-4 text-zinc-400" aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-6 text-zinc-500 leading-relaxed">{a}</div>}
    </div>
  );
}

export default function WarpPage() {
  return (
    <div className="bg-white text-black selection:bg-black selection:text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_0%,rgba(0,0,0,0.05),transparent)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        </div>
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-24 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 bg-white text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-600">
              <Sparkles className="h-3.5 w-3.5" /> Agentic Development
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] font-display uppercase">
              Warp — The Agentic
              <br className="hidden md:block" />
              Development Environment
            </h1>
            <p className="mt-6 text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto">
              Build faster with an always-on AI pair‑agent that understands your repo, runs tools, and ships changes end‑to‑end.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="premium" className="rounded-none px-8 py-6 font-black tracking-[0.2em] uppercase">
                  Get Started
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="rounded-none px-8 py-6 font-black tracking-[0.05em] uppercase">
                  See it in action
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-zinc-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-center justify-center gap-10 opacity-50">
            {[
              "Stripe",
              "Linear",
              "Vercel",
              "Scale",
              "Open Source Teams",
            ].map((name) => (
              <span key={name} className="text-[10px] font-black uppercase tracking-[0.4em]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-zinc-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker="How it works" title="From repo to results" highlight="in minutes" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connect your repo",
                desc: "Warp indexes your codebase, tools, and scripts so it can act safely in your project.",
              },
              {
                step: "02",
                title: "Plan with the agent",
                desc: "It drafts changes, checks impact, and proposes a safe procedure before touching files.",
              },
              {
                step: "03",
                title: "Execute & verify",
                desc: "Warp edits files, runs commands and tests, then summarizes diffs for review.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8"
              >
                <div className="absolute -top-8 -right-4 text-[10rem] font-black text-zinc-100 pointer-events-none select-none font-display">
                  {s.step}
                </div>
                <div className="text-sm font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">/{s.step}</div>
                <h3 className="text-2xl font-black uppercase tracking-tight font-display mb-3">{s.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading kicker="Capabilities" title="Everything you need" highlight="— built in" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature icon={Workflow} title="Tool-aware planning" desc="Understands your scripts, package.json, and CI so plans are executable, not theoretical." />
            <Feature icon={Shield} title="Guardrails by default" desc="Runs read-only first, summarizes intent, and asks before risky steps." />
            <Feature icon={Cpu} title="Repo understanding" desc="Indexes files and symbols to reference code accurately across edits." />
            <Feature icon={Zap} title="Fast iterations" desc="Edits, lints, and re-runs quickly with concise status updates." />
            <Feature icon={Terminal} title="Commands that explain" desc="Every non-trivial command includes the why, so changes are auditable." />
            <Feature icon={Rocket} title="From idea to PR" desc="Produces clean diffs and summaries ready for review." />
          </div>
        </div>
      </section>

      {/* Preview band */}
      <section className="relative py-24 bg-gradient-to-b from-zinc-50 to-white overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 flex items-center gap-2 text-xs text-zinc-500">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="ml-2">warp session</span>
            </div>
            <div className="p-6 font-mono text-[12px] leading-relaxed text-zinc-800 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),transparent)]">
              <div className="opacity-60">$ npx warp plan "Add marketing page at /warp"</div>
              <div>• Analyze repo structure… done</div>
              <div>• Create route /warp… done</div>
              <div>• Implement sections… in progress</div>
              <div className="opacity-60">$ git diff --stat</div>
              <div> frontend/src/app/warp/page.tsx | +420</div>
              <div className="opacity-60">$ open http://localhost:3000/warp</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white py-28 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tight font-display mb-8">
            Ship with an agentic workflow
          </h3>
          <Link href="/register">
            <Button size="lg" variant="premium" className="bg-zinc-100 text-black hover:bg-white rounded-none px-10 py-7 font-black tracking-[0.25em] uppercase">
              Start free
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading kicker="FAQ" title="Answers at a glance" />
          <div className="divide-y divide-zinc-200 border-t border-b">
            <FaqItem q="Does this replace my IDE?" a="No. Warp augments your existing tools and workflows. Use it alongside your editor and CI." />
            <FaqItem q="Will it run commands automatically?" a="Only when you ask. For non-trivial steps it summarizes what will run and why before proceeding." />
            <FaqItem q="How do I try it on my repo?" a="Create an account, connect your repository, and follow the guided setup. The agent will propose a safe plan before any edits." />
            <FaqItem q="Is team usage supported?" a="Yes. You can invite teammates and review diffs together before merging." />
          </div>
        </div>
      </section>
    </div>
  );
}
