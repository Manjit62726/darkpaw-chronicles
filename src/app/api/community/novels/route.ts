import { NextRequest, NextResponse } from "next/server";
import { getEligibleNovelsForVoting, getUserNovelVotes } from "@/lib/community-db";

export async function GET(request: NextRequest) {
  try {
    const novels = await getEligibleNovelsForVoting();

    let userVotes: { novel_id: number; vote_type: string }[] = [];
    const session = request.cookies.get("community_session");
    if (session) {
      const parsed = JSON.parse(session.value);
      userVotes = await getUserNovelVotes(parsed.id);
    }

    const votesMap = new Map(userVotes.map((v) => [v.novel_id, v.vote_type]));

    const enriched = novels.map((n: Record<string, unknown>) => ({
      ...n,
      user_vote: votesMap.get(n.id as number) || null,
    }));

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Failed to fetch novels" }, { status: 500 });
  }
}
