import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, changeAdminPassword } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { action, username, password, newPassword } = await request.json();

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
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    if (action === "change-password") {
      const session = request.cookies.get("admin_session");
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const user = JSON.parse(session.value);
      const admin = await verifyAdmin(user.username, password);
      if (!admin) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ error: "New password must be at least 4 characters" }, { status: 400 });
      }
      await changeAdminPassword(admin.id, newPassword);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
