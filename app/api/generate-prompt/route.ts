import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured in environment variables." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { leadData, platform } = body;

    if (!leadData) {
      return NextResponse.json({ error: "Missing lead data" }, { status: 400 });
    }

    const systemPrompt = `You are a world-class AI prompt engineer and frontend developer.
Your task is to generate an incredibly detailed, comprehensive, and exhaustive prompt that will be fed into an AI website builder (like Lovable, Bolt, or Claude Code). The goal is to build a cutting-edge, award-winning Animated 3D Website Portfolio for the following business lead.

LEAD DETAILS:
Name: ${leadData.name}
Niche: ${leadData.category}
City: ${leadData.city}
Rating: ${leadData.rating ?? 4.5}★ (${leadData.reviewsCount ?? 0} reviews)
Biggest gap found: ${leadData.audit?.biggestGap || "Needs modern online presence"}

INSTRUCTIONS FOR THE OUTPUT PROMPT:
The prompt you generate MUST be written as a direct, highly prescriptive command to the AI website builder. Do not write a casual description; write a strict technical blueprint. Your generated prompt must include the following sections in exhaustive detail:

1. CORE IDENTITY & UNIQUE AESTHETICS:
   - Command a premium, Awwwards-winning aesthetic.
   - **Unique Color Palette:** You MUST invent a unique, bespoke 3-color palette (Background, Primary Text, Accent/Neon) that perfectly matches the psychology of their specific niche (${leadData.category}). Detail the exact hex codes or color names in your prompt. Do not use generic colors; make it uniquely tailored.
   - Specify typography pairs (e.g., 'Clash Display' for massive headers, 'Inter' for readable body text).
   - Command the use of smooth scroll animations, custom cursors, and magnetic button effects.

2. 3D & ANIMATION REQUIREMENTS:
   - Require specific 3D elements (using Three.js, React Three Fiber, or Spline embeds).
   - Detail exactly how the 3D elements should react to user input (e.g., parallax on scroll, particle fields reacting to mouse movement, 3D model tilting on hover).
   - Specify entry animations (fade-ins, slide-ups) and scroll-triggered reveals using Framer Motion or GSAP.

3. EXHAUSTIVE PAGE STRUCTURE (5 Sections):
   Provide a detailed structural blueprint for the following 5 sections. For each section, define the **Content**, **Layout**, and **Specific Animation/3D Effect**:
   - **1. Hero Section:** Describe an immersive 3D background. Instruct the AI to use huge typography introducing "${leadData.name}" as the ultimate "${leadData.category}" authority in "${leadData.city}". Include a massive call-to-action button to "Explore Work".
   - **2. About / Trust Section:** Detail scroll-triggered text reveals. Instruct the builder to weave in their ${leadData.rating ?? 4.5}★ rating (${leadData.reviewsCount ?? 0} reviews). Address their biggest gap: "${leadData.audit?.biggestGap || "Needs modern online presence"}" by positioning this site as the ultimate solution.
   - **3. Projects / Services Showcase:** Define a 3D horizontal scroll carousel or tilt-hover cards showing past work or services. Detail the exact hover physics.
   - **4. Tech Stack / Capabilities:** Describe floating 3D icons or a dynamic particle cloud representing their tools and skills.
   - **5. Footer / Contact:** Describe a massive, screen-filling footer with a magnetic "Let's Talk" button, email, and social links. Include an infinite text ticker.

4. TECHNICAL OUTPUT CONSTRAINTS:
   ${platform === "lovable" || platform === "bolt" 
     ? "- Enforce the output of a Single React + Tailwind page with NO backend.\\n   - Require the use of Framer Motion for all 2D animations and Lucide React for icons.\\n   - Code must be perfectly self-contained." 
     : "- Enforce the output of a Next.js App Router application.\\n   - Require Tailwind CSS, Framer Motion, and Three.js/R3F.\\n   - Must include proper Suspense boundaries and loading states."}

CRITICAL FORMATTING RULES:
- Output raw text only. No markdown code blocks around the text.
- Do not include conversational filler like "Here is the prompt...". Start immediately with "Build a..."
- The generated prompt must be at least 400 words long, leaving absolutely no design decision up to chance.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Invalid response format from Gemini API");
    }

    return NextResponse.json({ success: true, prompt: generatedText.trim() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
