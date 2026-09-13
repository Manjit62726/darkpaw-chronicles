import { NextRequest, NextResponse } from "next/server";
import { createPost, getPosts } from "@/lib/community-db";

export async function GET(request: NextRequest) {
  try {
    let userId: number | undefined;
    const session = request.cookies.get("community_session");
    if (session) {
      const parsed = JSON.parse(session.value);
      userId = parsed.id;
    }
    const posts = await getPosts(userId);
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get("community_session");
    if (!session) {
      return NextResponse.json({ error: "Login required to post" }, { status: 401 });
    }

    const parsed = JSON.parse(session.value);
    const { title, content } = await request.json();
    const post = await createPost(parsed.id, title, content);
    return NextResponse.json(post, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
