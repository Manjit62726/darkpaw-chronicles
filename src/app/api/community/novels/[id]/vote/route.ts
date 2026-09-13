import { NextRequest, NextResponse } from "next/server";
import { voteOnNovel, getCommunityUser } from "@/lib/community-db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.cookies.get("community_session");
    if (!session) {
      return NextResponse.json({ error: "Login required to vote" }, { status: 401 });
    }

    const { id: novelId } = await params;
    const { voteType } = await request.json();

    if (!["up", "down"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    const parsed = JSON.parse(session.value);
    const user = await getCommunityUser(parsed.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const result = await voteOnNovel(user.id, parseInt(novelId), voteType);
    return NextResponse.json({ success: true, vote: result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Vote failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
