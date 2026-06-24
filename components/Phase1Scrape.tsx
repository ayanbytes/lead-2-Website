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
import { Loader2, MapPin, Phone, Star, Globe, MessageCircle, Mail, Users } from "lucide-react";
import type { Lead, ScrapeInput, HRLead, HRScrapeInput } from "@/lib/types";
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

  // HR Scraper states
  const [hrInput, setHrInput] = useState<HRScrapeInput>({ location: "Worldwide", seniority: "senior", portal: "both" });
  const [hrLoading, setHrLoading] = useState(false);
  const [hrLeads, setHrLeads] = useState<HRLead[]>([]);
  const [hrProgress, setHrProgress] = useState({ current: 0, total: 0 });

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

  async function runHRScrape() {
    setHrLoading(true);
    setHrLeads([]);
    setHrProgress({ current: 0, total: 0 });
    try {
      const res = await fetch("/api/scrape-hr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(hrInput),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "HR Scrape failed");
      
      if (data.source === "seed-fallback" && data.error) {
        toast.warning(`Live search failed: ${data.error}. Showing mock data.`);
      }

      for (let i = 0; i < data.leads.length; i++) {
        await new Promise((r) => setTimeout(r, 200));
        setHrLeads(data.leads.slice(0, i + 1));
        setHrProgress({ current: i + 1, total: data.leads.length });
      }
      toast.success(`${data.leads.length} HR contacts generated`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setHrLoading(false);
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
                      <TableCell className="text-slate-500">{i + 1}</TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="font-medium text-slate-900 truncate" title={l.name}>{l.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate" title={l.address}>
                          <MapPin className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{l.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px]">
                        <div className="flex flex-col gap-0.5 text-slate-600">
                          {l.phone && <span className="flex items-center gap-1 truncate" title={l.phone}><Phone className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{l.phone}</span></span>}
                          {l.whatsapp && <span className="flex items-center gap-1 text-green-600"><MessageCircle className="h-3 w-3 flex-shrink-0" /> WhatsApp</span>}
                          {l.email && <span className="flex items-center gap-1 truncate" title={l.email}><Mail className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{l.email}</span></span>}
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

      {/* HR Contacts Generator Section */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card className="md:col-span-1 bg-white/80 border-slate-200 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-600"/> HR Contacts Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-slate-500 font-medium">Seniority</Label>
                <select 
                  value={hrInput.seniority} 
                  onChange={(e) => setHrInput({ ...hrInput, seniority: e.target.value })}
                  className="w-full h-10 px-3 text-base bg-white border border-slate-200 focus-visible:ring-blue-500/30 text-slate-900 transition-all rounded-xl shadow-sm"
                >
                  <option value="any">Any Level</option>
                  <option value="senior">Senior / Director</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-slate-500 font-medium">Portal</Label>
                <select 
                  value={hrInput.portal} 
                  onChange={(e) => setHrInput({ ...hrInput, portal: e.target.value })}
                  className="w-full h-10 px-3 text-base bg-white border border-slate-200 focus-visible:ring-blue-500/30 text-slate-900 transition-all rounded-xl shadow-sm"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="naukri">Naukri.com</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.12em] text-slate-500 font-medium">Location</Label>
              <Input type="text" value={hrInput.location} onChange={(e) => setHrInput({ ...hrInput, location: e.target.value })} placeholder="e.g. Worldwide, US, UK, India" className="h-10 text-base bg-white border-slate-200 rounded-xl shadow-sm" />
            </div>
            <Button onClick={runHRScrape} disabled={hrLoading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all duration-300">
              {hrLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scraping...</> : "Generate HR Contacts"}
            </Button>
            {hrLoading && hrProgress.current > 0 && (
              <div className="text-sm text-center text-blue-600 mt-2 font-medium animate-pulse">
                Scraping... extracted {hrProgress.current} contacts so far
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white/80 border-slate-200 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>HR Leads {hrLeads.length > 0 && <span className="text-blue-600 text-sm ml-2 font-normal">{hrLeads.length} found</span>}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company / LinkedIn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {hrLeads.map((l, i) => (
                      <motion.tr key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border">
                        <TableCell>
                          <div className="font-medium text-slate-900">{l.name}</div>
                          <div className="text-xs text-slate-500">{l.title}</div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {l.phone && <div className="flex items-center gap-1 text-slate-600"><Phone className="h-3 w-3"/> {l.phone}</div>}
                          {l.email && <div className="flex items-center gap-1 text-slate-600 mt-0.5"><Mail className="h-3 w-3"/> {l.email}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-800 text-sm">{l.company}</div>
                          <a href={l.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"><Globe className="h-3 w-3"/> View Profile</a>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {hrLeads.length === 0 && !hrLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-sm text-muted-foreground">Set your filters and generate contacts</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

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
