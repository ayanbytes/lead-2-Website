import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { HRLead, HRScrapeInput } from "@/lib/types";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = "apify~google-search-scraper";

async function loadSeed(): Promise<{ leads: HRLead[] }> {
  const p = path.join(process.cwd(), "data", "hr-seed.json");
  const raw = await fs.readFile(p, "utf-8");
  const json = JSON.parse(raw);
  return { leads: json.leads as HRLead[] };
}

export async function POST(req: Request) {
  const input = (await req.json()) as HRScrapeInput;

  if (!APIFY_TOKEN) {
    const { leads } = await loadSeed();
    return NextResponse.json({ source: "seed", leads });
  }

  try {
    let siteFilter = `site:linkedin.com/in OR site:naukri.com/recruiters`;
    if (input.portal === "linkedin") siteFilter = `site:linkedin.com/in`;
    if (input.portal === "naukri") siteFilter = `site:naukri.com/recruiters`;

    let roleFilter = `"HR" OR "Human Resources" OR "Talent Acquisition"`;
    if (input.seniority === "senior") {
      roleFilter = `"Senior HR" OR "VP HR" OR "HR Director" OR "Head of HR" OR "Senior Talent Acquisition" OR "CHRO"`;
    }

    // Handling location
    const locationQuery = (input.location && input.location.toLowerCase() !== "worldwide") ? `"${input.location}"` : "";
    const searchQuery = `${siteFilter} (${roleFilter}) ${locationQuery} ("@gmail.com" OR "@yahoo.com" OR "@hotmail.com" OR "+91" OR "+1" OR "+44")`.trim();
    
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          queries: searchQuery,
          maxPagesPerQuery: 10,
          resultsPerPage: 100,
          countryCode: "us", // "us" acts as a good default for global searches on google
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
        
        const isLinkedIn = url.includes("linkedin.com/in");
        const isNaukri = url.includes("naukri.com/recruiters");
        
        if (!isLinkedIn && !isNaukri) continue;
        
        let name = "Unknown HR";
        let jobTitle = input.seniority === "senior" ? "Senior HR" : "HR Professional";
        let company = "Unknown Company";

        if (isLinkedIn) {
          const titleParts = title.split("-").map(p => p.trim());
          name = titleParts[0] ? titleParts[0].replace(" | LinkedIn", "").trim() : name;
          jobTitle = titleParts[1] ? titleParts[1].replace(" | LinkedIn", "").trim() : jobTitle;
          company = titleParts[2] ? titleParts[2].replace(" | LinkedIn", "").trim() : company;
        } else if (isNaukri) {
          // Naukri title format: "Name - HR Recruiter - Company Name ..."
          const titleParts = title.split("-").map(p => p.trim());
          name = titleParts[0] ? titleParts[0].replace(" | Naukri.com", "").trim() : name;
          jobTitle = titleParts[1] ? titleParts[1].replace(" | Naukri.com", "").trim() : jobTitle;
          company = titleParts[2] ? titleParts[2].replace(" | Naukri.com", "").trim() : company;
        }
        
        const emailMatch = snippet.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        let email = emailMatch ? emailMatch[1] : undefined;
        if (email) email = email.replace(/\.?Read.*/i, '');
        
        const phoneMatch = snippet.match(/(\+91[-.\s]?\d{10}|\b\d{10}\b)/);
        const phone = phoneMatch ? phoneMatch[1] : undefined;

        // Skip if no contact info is found and we want high quality
        if (!email && !phone) continue;

        leads.push({
          id: `hr-live-${String(leads.length + 1).padStart(2, "0")}`,
          name,
          title: jobTitle,
          linkedinUrl: url,
          email,
          phone,
          company,
          city: "India"
        });
      }
    }

    if (leads.length === 0) {
      const { leads: seedLeads } = await loadSeed();
      return NextResponse.json({ source: "seed-fallback", error: "No matches found, showing samples.", leads: seedLeads });
    }

    return NextResponse.json({ source: "apify", leads });
  } catch (e) {
    const { leads } = await loadSeed();
    return NextResponse.json({ source: "seed-fallback", error: (e as Error).message, leads });
  }
}

