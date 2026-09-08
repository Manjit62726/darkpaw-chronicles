import { NextRequest, NextResponse } from "next/server";
import { getNovels, addNovel } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const novels = await getNovels();
    return NextResponse.json(novels);
  } catch {
    return NextResponse.json({ error: "Failed to fetch novels" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get("admin_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, novelName, youtubeUrl, thumbnailUrl, totalChapters, uploadedChapters, status } = body;
    const novel = await addNovel(title, novelName, youtubeUrl, thumbnailUrl, totalChapters, uploadedChapters, status || "ongoing");
    return NextResponse.json(novel, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add novel" }, { status: 500 });
  }
}
