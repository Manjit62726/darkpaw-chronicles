import { NextRequest, NextResponse } from "next/server";
import { createAdmin, verifyAdmin } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { action, username, password } = await request.json();

    if (action === "login") {
      const admin = await verifyAdmin(username, password);
      if (!admin) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const response = NextResponse.json({ success: true, username: admin.username });
      response.cookies.set("admin_session", JSON.stringify({ id: admin.id, username: admin.username }), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      return response;
    }

    if (action === "register") {
      const admin = await createAdmin(username, password);
      const response = NextResponse.json({ success: true, username: admin.username });
      response.cookies.set("admin_session", JSON.stringify({ id: admin.id, username: admin.username }), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
