import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const rawExpectedEmail = process.env.ADMIN_EMAIL;
    const rawExpectedPassword = process.env.ADMIN_PASSWORD;

    if (!rawExpectedEmail || !rawExpectedPassword) {
      return NextResponse.json({ error: "Server authentication not configured" }, { status: 500 });
    }

    const expectedEmail = rawExpectedEmail.replace(/^["']|["']$/g, '');
    const expectedPassword = rawExpectedPassword.replace(/^["']|["']$/g, '');

    if (email === expectedEmail && password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
