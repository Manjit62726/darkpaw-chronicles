import { NextRequest, NextResponse } from "next/server";
import { registerCommunityUser, verifyCommunityUser, getCommunityUser } from "@/lib/community-db";

export async function POST(request: NextRequest) {
  try {
    const { action, username, password } = await request.json();

    if (action === "register") {
      const user = await registerCommunityUser(username, password);
      const response = NextResponse.json({ success: true, user });
      response.cookies.set("community_session", JSON.stringify({ id: user.id, username: user.username }), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return response;
    }

    if (action === "login") {
      const user = await verifyCommunityUser(username, password);
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const response = NextResponse.json({ success: true, user });
      response.cookies.set("community_session", JSON.stringify({ id: user.id, username: user.username }), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return response;
    }

    if (action === "me") {
      const session = request.cookies.get("community_session");
      if (!session) {
        return NextResponse.json({ user: null });
      }
      const parsed = JSON.parse(session.value);
      const user = await getCommunityUser(parsed.id);
      return NextResponse.json({ user: user || null });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Auth failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("community_session");
  return response;
}
