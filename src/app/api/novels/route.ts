import { NextRequest, NextResponse } from "next/server";
import { getNovels, addNovel } from "@/lib/db";

export async function GET() {
  try {
    const novels = await getNovels();
    return NextResponse.json(novels);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch novels" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, novelName, youtubeUrl, thumbnailUrl, totalChapters, uploadedChapters, status } = body;
    const novel = await addNovel(title, novelName, youtubeUrl, thumbnailUrl, totalChapters, uploadedChapters, status || "ongoing");
    return NextResponse.json(novel, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add novel" }, { status: 500 });
  }
}
