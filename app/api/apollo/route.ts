import { NextResponse } from "next/server";

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

export async function POST(req: Request) {
  if (!APOLLO_API_KEY) {
    return NextResponse.json({ error: "APOLLO_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action, ...payload } = body;

    if (action === "search") {
      const runRes = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          api_key: APOLLO_API_KEY,
          ...payload,
        }),
      });

      if (!runRes.ok) {
        throw new Error(`Apollo API error: ${runRes.status}`);
      }

      const data = await runRes.json();
      return NextResponse.json({ success: true, data });
    }
    
    // Future expansion for AI email drafting if supported by Apollo
    if (action === "ai_draft") {
      return NextResponse.json({ success: true, data: { text: "Apollo AI email generation is not publicly supported by their API yet, but you can integrate OpenAI here to achieve the exact same result." }});
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
