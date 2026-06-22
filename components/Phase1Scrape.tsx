"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { PhaseShell } from "./PhaseShell";
import { Loader2, MapPin, Phone, Star, Globe, MessageCircle, Mail } from "lucide-react";
import type { Lead, ScrapeInput } from "@/lib/types";
import { toast } from "sonner";

const LeadMap = dynamic(() => import("./LeadMap"), { ssr: false });

export function Phase1Scrape({
  leads,
  setLeads,
  onNext,
  onPrev,
}: {
  leads: Lead[];
  setLeads: (l: Lead[]) => void;
  onNext: () => void;
  onPrev?: () => void;
}) {
  const [input, setInput] = useState<ScrapeInput>({ niche: "Dentist", city: "Bandra, Mumbai", count: 12 });
  const [loading, setLoading] = useState(false);

  async function runScrape() {
    setLoading(true);
    setLeads([]);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scrape failed");
      // Stagger in for visual drama
      for (let i = 0; i < data.leads.length; i++) {
        await new Promise((r) => setTimeout(r, 80));
        setLeads(data.leads.slice(0, i + 1));
      }
      toast.success(`${data.leads.length} leads scraped from ${input.city}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PhaseShell
      title="Phase 1 — Scrape leads"
      subtitle="Pull local businesses from Google Maps. We capture contact, reviews, photos, and location to score conversion potential."
      onPrev={onPrev}
      onNext={onNext}
      nextDisabled={leads.length === 0}
      nextLabel="Audit these leads"
    >
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 bg-white/80 border-slate-200 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative z-10">
            <CardTitle>Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 relative z-10">
              <Label htmlFor="niche" className="text-xs uppercase tracking-[0.12em] text-slate-500 font-medium">Niche</Label>
              <Input id="niche" autoComplete="off" value={input.niche} onChange={(e) => setInput({ ...input, niche: e.target.value })} placeholder="e.g. Dentist" className="h-10 text-base bg-white border-slate-200 focus-visible:ring-blue-500/30 text-slate-900 transition-all rounded-xl shadow-sm" />
            </div>
            <div className="space-y-2 relative z-10">
              <Label htmlFor="city" className="text-xs uppercase tracking-[0.12em] text-slate-500 font-medium">Location</Label>
              <Input id="city" autoComplete="off" value={input.city} onChange={(e) => setInput({ ...input, city: e.target.value })} placeholder="e.g. Bandra, Mumbai" className="h-10 text-base bg-white border-slate-200 focus-visible:ring-blue-500/30 text-slate-900 transition-all rounded-xl shadow-sm" />
            </div>
            <div className="space-y-2 relative z-10">
              <Label htmlFor="count" className="text-xs uppercase tracking-[0.12em] text-slate-500 font-medium">Count</Label>
              <Input id="count" type="number" inputMode="numeric" min={1} max={50} value={input.count} onChange={(e) => setInput({ ...input, count: Number(e.target.value) })} className="h-10 text-base font-mono tabular-nums bg-white border-slate-200 focus-visible:ring-blue-500/30 text-slate-900 transition-all rounded-xl shadow-sm" />
              <p className="text-[11px] text-slate-500">Max 25 for free Apify tier.</p>
            </div>
            <Button onClick={runScrape} disabled={loading} className="w-full h-11 transition-all duration-300 active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border border-blue-500/20 rounded-xl relative z-10">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scraping...</> : "Scrape leads"}
            </Button>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Stat label="Found" value={leads.length} />
              <Stat label="With phone" value={leads.filter((l) => l.phone).length} />
              <Stat label="No site" value={leads.filter((l) => !l.website).length} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white/80 border-slate-200 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative z-10 border-b border-slate-100">
            <CardTitle>Live map</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadMap leads={leads} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 bg-white/80 border-slate-200 backdrop-blur-xl shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader className="border-b border-slate-100 relative z-10">
          <CardTitle className="text-slate-900">Results <span className="text-blue-600 text-sm font-normal ml-2">{leads.length > 0 ? `${leads.length} found` : ''}</span></CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative z-10">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Site</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {leads.map((l, i) => (
                    <motion.tr
                      key={l.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-border"
                    >
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {l.address}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-0.5">
                          {l.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {l.phone}</span>}
                          {l.whatsapp && <span className="flex items-center gap-1 text-[color:var(--accent-foreground)]"><MessageCircle className="h-3 w-3" /> WhatsApp</span>}
                          {l.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {l.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-[color:var(--chart-4)] text-[color:var(--chart-4)]" />
                          <span className="font-medium">{l.rating?.toFixed(1)}</span>
                          <span className="text-muted-foreground text-xs">({l.reviewsCount})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {l.website ? (
                          <Badge variant="secondary" className="text-xs font-normal"><Globe className="h-3 w-3 mr-1" /> Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs font-normal text-[color:var(--destructive)] border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/5">No site</Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
            {leads.length === 0 && !loading && (
              <div className="text-center py-12 text-sm text-muted-foreground">Run a scrape to populate leads</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PhaseShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
      <div className="font-display text-xl tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
