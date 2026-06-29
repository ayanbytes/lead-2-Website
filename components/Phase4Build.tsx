"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { Copy, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import type { RankedLead } from "@/lib/types";
import { toast } from "sonner";

const PLATFORMS = [
  { id: "lovable", label: "Lovable", url: "https://lovable.dev" },
  { id: "claude-code", label: "Claude Code", url: "https://claude.com/claude-code" },
  { id: "bolt", label: "Bolt.new", url: "https://bolt.new" },
  { id: "codex", label: "Codex", url: "https://chat.openai.com" },
];

export function Phase4Build({
  selected,
  onNext,
  onPrev,
}: {
  selected: RankedLead | null;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [platform, setPlatform] = useState("lovable");
  const [prompt, setPrompt] = useState("");
  const [typed, setTyped] = useState("");
  const [building, setBuilding] = useState(false);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  async function generateAIPrompt() {
    if (!selected) return;
    setIsGeneratingAI(true);
    setTyped("");
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: selected, platform })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI prompt");
      setPrompt(data.prompt);
      toast.success("AI Prompt generated successfully!");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsGeneratingAI(false);
    }
  }

  useEffect(() => {
    if (!selected) return;
    const p = buildPrompt(selected, platform);
    setPrompt(p);
  }, [selected, platform]);

  useEffect(() => {
    setTyped("");
    if (!prompt) return;
    let i = 0;
    const id = setInterval(() => {
      i += 8;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) clearInterval(id);
    }, 12);
    return () => clearInterval(id);
  }, [prompt]);

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied. Paste into " + PLATFORMS.find((p) => p.id === platform)?.label);
  }

  function openPlatform() {
    const url = PLATFORMS.find((p) => p.id === platform)?.url;
    if (url) window.open(url, "_blank");
  }

  function simulateBuild() {
    setBuilding(true);
    setTimeout(() => {
      setBuilding(false);
      toast.success("Demo site ready. Preview loaded.");
    }, 1800);
  }

  if (!selected) {
    return (
      <PhaseShell
        title="Phase 4 — Generate website"
        subtitle="Pick a platform. We craft a battle-tested prompt with brand, structure, sections, and SEO baked in."
        onPrev={onPrev}
        onNext={onNext}
        nextDisabled
        nextLabel="Draft outreach"
      >
        <IncompleteState
          title="No lead selected yet"
          description="Run scrape and audit, then pick the highest-scoring prospect in Phase 3. We'll generate a complete website prompt (Lovable / Bolt / Claude Code / Codex) plus a live preview here."
          prevPhaseLabel="Rank"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell
      title="Phase 4 — Generate website"
      subtitle={`Pick a platform. We craft a battle-tested prompt with brand, structure, sections, and SEO baked in.`}
      onPrev={onPrev}
      onNext={onNext}
      nextLabel="Draft outreach"
    >
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Selected lead</div>
          <div className="font-display text-2xl mt-1">{selected.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{selected.address}</div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
            <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              {PLATFORMS.map((p) => (
                <SelectItem key={p.id} value={p.id} className="hover:bg-slate-50">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm" onClick={openPlatform}><ExternalLink className="h-4 w-4 mr-2" /> Open</Button>
          <Button variant="outline" className="border-slate-200 bg-white hover:bg-indigo-50 text-indigo-700 shadow-sm" onClick={generateAIPrompt} disabled={isGeneratingAI}>
            {isGeneratingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-indigo-500" /> : <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />}
            {isGeneratingAI ? "Generating..." : "Generate AI Prompt"}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-white transition-all" onClick={copyPrompt}><Copy className="h-4 w-4 mr-2" /> Copy prompt</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-white/80 border-slate-200 backdrop-blur-xl relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader className="border-b border-slate-100 relative z-10">
            <CardTitle className="text-slate-900">Generated prompt</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 p-4">
            <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 text-slate-800 rounded-xl p-4 max-h-[520px] overflow-y-auto border border-slate-200 shadow-inner">
              {typed}<span className="animate-pulse text-blue-500">▌</span>
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-slate-200 backdrop-blur-xl relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 relative z-10">
            <CardTitle className="text-slate-900">Live preview</CardTitle>
            <Button size="sm" className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm" variant="outline" onClick={simulateBuild} disabled={building}>
              {building ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-blue-600" /> Building...</> : <><Sparkles className="h-3.5 w-3.5 mr-2 text-blue-600" /> Build site</>}
            </Button>
          </CardHeader>
          <CardContent className="relative z-10 p-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 h-[520px] shadow-sm bg-white relative">
              {building && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                  <div className="text-blue-600 text-sm mt-4 tracking-widest uppercase animate-pulse font-medium">Generating UI...</div>
                </div>
              )}
              <iframe
                title="Preview"
                srcDoc={demoSiteHtml(selected)}
                className="w-full h-full bg-[#f5efe6] transition-opacity duration-1000"
                style={{ opacity: building ? 0 : 1 }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PhaseShell>
  );
}

function buildPrompt(l: RankedLead, platform: string): string {
  const name = l.name;
  const niche = l.category;
  const phone = l.phone ?? "+91 XXXXX XXXXX";
  const whatsapp = l.whatsapp ?? phone;
  const addr = l.address;
  const rating = l.rating ?? 4.5;
  const reviews = l.reviewsCount ?? 0;
  const gap = l.audit.biggestGap;
  return `You are building a highly interactive, animated 3D portfolio website for ${name} (${niche}).

# DESIGN & AESTHETICS
- Cutting-edge, award-winning Awwwards style aesthetic.
- Dark mode by default with glowing neon accents or sleek monochrome metallic tones.
- Heavy use of smooth scroll animations (e.g., GSAP or Framer Motion).
- Implement 3D elements (e.g., using Three.js, React Three Fiber, or Spline embeds) that react to mouse movement.
- Large, bold typography for headers with sleek sans-serif body text.
- Custom cursor and magnetic button effects.

# SECTIONS
1. Hero: Immersive 3D interactive background or Spline embed. Huge typography introducing the portfolio owner ("Creative Developer / ${niche}"). Call-to-action to "Explore Work".
2. About: Scroll-triggered text reveal animations. Brief biography emphasizing technical excellence and creativity.
3. Projects Showcase: Horizontal scroll or a 3D carousel of past work. Each project card should have a 3D tilt hover effect and reveal details on click.
4. Skills & Tech Stack: Floating 3D icons or a dynamic particle cloud representing technologies and tools used.
5. Footer/Contact: Massive footer with a magnetic "Let's Talk" button. Include links to GitHub, LinkedIn, and Twitter.

# TECHNICAL REQUIREMENTS
- Responsive design: ensure 3D elements degrade gracefully or remain performant on mobile devices.
- Seamless page transitions.
- Semantic HTML and accessible contrast, despite the dark 3D theme.

${
  platform === "lovable" || platform === "bolt"
    ? "OUTPUT: Single React + Tailwind page. No backend. Use Framer Motion and Lucide icons."
    : platform === "claude-code"
      ? "OUTPUT: Next.js 15 app with app router, Tailwind, Framer Motion, and Three.js/R3F."
      : "OUTPUT: Static HTML + Tailwind CDN + GSAP + Three.js via CDN."
}

Generate the complete, working code for this stunning 3D portfolio.`;
}

function demoSiteHtml(l: RankedLead): string {
  const wa = (l.whatsapp ?? l.phone ?? "919999999999").replace(/\D/g, "");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${l.name}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>body{font-family:ui-serif,Georgia,'Times New Roman',serif;background:#f5efe6;color:#2c2620}h1,h2,.sans{font-family:ui-sans-serif,system-ui,sans-serif}</style>
</head><body>
<header class="border-b border-stone-200 bg-[#faf6ee]"><div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between"><div class="font-medium tracking-tight text-stone-800">${l.name}</div><a href="tel:${(l.phone ?? "").replace(/\s/g, "")}" class="text-sm text-stone-600 sans">${l.phone ?? ""}</a></div></header>
<section><div class="max-w-5xl mx-auto px-6 py-20 sm:py-28"><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 sans">${l.category} · ${l.city}</div><h1 class="text-4xl sm:text-6xl font-medium mt-4 leading-[1.05] tracking-tight text-stone-900">A name ${l.city.split(",")[0]}<br/>has trusted for years.<br/><span class="italic text-stone-500">Now online.</span></h1><p class="mt-6 text-lg text-stone-600 max-w-xl leading-relaxed">${l.rating} on Google · ${l.reviewsCount} reviews. Book in under a minute on WhatsApp — no calls, no waiting.</p><div class="mt-8 flex gap-3 sans"><a href="https://wa.me/${wa}" class="bg-stone-900 text-stone-50 font-medium px-7 py-3.5 rounded-full text-sm tracking-wide hover:bg-stone-700 transition">Book on WhatsApp →</a><a href="tel:${(l.phone ?? "").replace(/\s/g, "")}" class="border border-stone-300 text-stone-700 px-7 py-3.5 rounded-full text-sm tracking-wide">Call us</a></div></div></section>
<section class="bg-[#ede4d3] border-y border-stone-200"><div class="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8 text-center"><div><div class="text-4xl font-medium tracking-tight text-stone-900">${l.reviewsCount}+</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Happy customers</div></div><div><div class="text-4xl font-medium tracking-tight text-stone-900">${l.rating}</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Google rating</div></div><div><div class="text-4xl font-medium tracking-tight text-stone-900">${l.yearsInBusiness ?? 8}+</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Years in ${l.city.split(",")[0]}</div></div></div></section>
<section class="max-w-5xl mx-auto px-6 py-16"><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 sans">Services</div><h2 class="text-3xl font-medium tracking-tight text-stone-900 mt-2">What we do well.</h2><div class="grid sm:grid-cols-3 gap-px bg-stone-200 mt-8 border border-stone-200">${["Service one","Service two","Service three","Service four","Service five","Service six"].map((s)=>`<div class="bg-[#faf6ee] p-6"><div class="font-medium tracking-tight text-stone-900">${s}</div><div class="text-xs text-stone-500 mt-1.5 sans">Reliable · modern · affordable</div></div>`).join("")}</div></section>
<section class="max-w-5xl mx-auto px-6 py-16 border-t border-stone-200"><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 sans">Visit us</div><h2 class="text-3xl font-medium tracking-tight text-stone-900 mt-2">${l.address}</h2><div class="mt-6 rounded-lg overflow-hidden bg-stone-200/60 border border-stone-300 h-64 flex items-center justify-center text-stone-500 sans text-sm">[Google Maps embed]</div></section>
<a href="https://wa.me/${wa}" class="fixed bottom-6 right-6 bg-stone-900 text-stone-50 rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-md">○</a>
<footer class="bg-[#ede4d3] border-t border-stone-200 sans"><div class="max-w-5xl mx-auto px-6 py-8 text-xs text-stone-500 flex justify-between"><span>© ${l.name}</span><span>${l.address}</span></div></footer>
</body></html>`;
}
