import { NextRequest, NextResponse } from "next/server";
import { getPost, deletePost } from "@/lib/community-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let userId: number | undefined;
    const session = request.cookies.get("community_session");
    if (session) {
      const parsed = JSON.parse(session.value);
      userId = parsed.id;
    }
    const post = await getPost(parseInt(id), userId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.cookies.get("community_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = JSON.parse(session.value);
    const deleted = await deletePost(parseInt(id), parsed.id);
    if (!deleted) {
      return NextResponse.json({ error: "Post not found or not yours" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
