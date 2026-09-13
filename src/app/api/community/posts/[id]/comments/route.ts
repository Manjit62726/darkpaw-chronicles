import { NextRequest, NextResponse } from "next/server";
import { getPostComments, createComment } from "@/lib/community-db";

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
    const comments = await getPostComments(parseInt(id), userId);
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.cookies.get("community_session");
    if (!session) {
      return NextResponse.json({ error: "Login required to comment" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = JSON.parse(session.value);
    const { content, parentCommentId } = await request.json();
    const comment = await createComment(parseInt(id), parsed.id, content, parentCommentId);
    return NextResponse.json(comment, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to add comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
