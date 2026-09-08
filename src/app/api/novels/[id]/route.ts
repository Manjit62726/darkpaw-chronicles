import { NextRequest, NextResponse } from "next/server";
import { updateNovel, deleteNovel } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, novelName, youtubeUrl, thumbnailUrl, totalChapters, uploadedChapters, status } = body;
    const novel = await updateNovel(
      parseInt(id),
      title,
      novelName,
      youtubeUrl,
      thumbnailUrl,
      totalChapters,
      uploadedChapters,
      status
    );
    return NextResponse.json(novel);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update novel" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteNovel(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete novel" }, { status: 500 });
  }
}
