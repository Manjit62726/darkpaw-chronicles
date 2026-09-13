import { NextRequest, NextResponse } from "next/server";
import { updateProfileImage, getCommunityUser } from "@/lib/community-db";

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get("community_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image } = await request.json();
    if (!image || !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }

    const base64Size = Math.round((image.length * 3) / 4);
    if (base64Size > 500000) {
      return NextResponse.json({ error: "Image too large (max 500KB)" }, { status: 400 });
    }

    const parsed = JSON.parse(session.value);
    await updateProfileImage(parsed.id, image);
    const user = await getCommunityUser(parsed.id);

    return NextResponse.json({ success: true, user });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
