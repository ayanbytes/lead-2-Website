import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { HRLead } from "@/lib/types";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = "apify~google-search-scraper";

async function loadSeed(): Promise<{ leads: HRLead[] }> {
  // We can reuse the HR seed or provide a generic one if we don't have a needs-seed
  try {
    const p = path.join(process.cwd(), "data", "hr-seed.json");
    const raw = await fs.readFile(p, "utf-8");
    const json = JSON.parse(raw);
    return { leads: json.leads as HRLead[] };
  } catch (e) {
    return { leads: [] };
  }
}

export async function POST(req: Request) {
  const input = await req.json().catch(() => ({}));
  const service = input.service || "IT services";

  if (!APIFY_TOKEN) {
    const { leads } = await loadSeed();
    return NextResponse.json({ source: "seed", leads: leads.slice(0, 3) }); // Just return a few
  }

  try {
    // Search Google across the web for companies posting their IT needs
    const keywordFilter = `"looking for a ${service} agency" OR "need ${service}" OR "looking for ${service}" OR "seeking ${service}" OR "hire ${service} consultant" OR "RFP ${service}"`;
    
    // Exclude major job boards/freelance sites to focus on direct client websites/forums, and require some contact signal
    const searchQuery = `(${keywordFilter}) -site:upwork.com -site:fiverr.com -site:freelancer.com ("+1" OR "+44" OR "+91" OR "@gmail.com" OR "@yahoo.com" OR "contact")`.trim();
    
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          queries: searchQuery,
          maxPagesPerQuery: 5,
          resultsPerPage: 100,
          countryCode: "us", 
        }),
      },
    );
    
    if (!runRes.ok) throw new Error(`Apify ${runRes.status}`);
    const items = (await runRes.json()) as Array<Record<string, unknown>>;

    const leads: HRLead[] = [];
    
    for (const item of items) {
      const organicResults = (item.organicResults as Array<Record<string, unknown>>) || [];
      
      for (const r of organicResults) {
        const url = String(r.url || "");
        const title = String(r.title || "");
        const snippet = String(r.description || "");
        
        // Removed the LinkedIn restriction here so it processes all web results
        
        let name = "Potential Client";
        let jobTitle = "Seeking IT Services";
        let company = "Unknown Company";

        // Try to guess the company from the domain name
        try {
          const urlObj = new URL(url);
          company = urlObj.hostname.replace("www.", "");
        } catch (e) {
          // ignore
        }

        const titleParts = title.split("-").map(p => p.trim());
        if (titleParts.length > 0) {
           name = titleParts[0];
        }
        
        const phoneMatch = snippet.match(/(\+?\d{1,3}[-.\s]?\d{10}|\b\d{10}\b)/);
        const emailMatch = snippet.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
        
        const phone = phoneMatch ? phoneMatch[0] : undefined;
        const email = emailMatch ? emailMatch[0] : undefined;

        if (!phone && !email) continue;

        leads.push({
          id: `needs-live-${String(leads.length + 1).padStart(2, "0")}`,
          name,
          title: jobTitle,
          linkedinUrl: url,
          email,
          phone,
          company,
          city: "Worldwide"
        });
      }
    }

    if (leads.length === 0) {
      const { leads: seedLeads } = await loadSeed();
      return NextResponse.json({ source: "seed-fallback", error: "No matches found, showing samples.", leads: seedLeads.slice(0, 3) });
    }

    return NextResponse.json({ source: "apify", leads });
  } catch (e) {
    const { leads } = await loadSeed();
    return NextResponse.json({ source: "seed-fallback", error: (e as Error).message, leads: leads.slice(0, 3) });
  }
}
