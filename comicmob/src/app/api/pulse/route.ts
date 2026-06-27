import { NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

// A session counts as "currently reading" if its last heartbeat was within
// this window. Client sends a heartbeat every 15s, so 30s gives a little
// slack for network delays before someone drops off the count.
const ACTIVE_WINDOW_SECONDS = 30;

export async function POST(req: Request) {
  const { comicId, episodeId, sessionId } = await req.json();

  if (!comicId || !episodeId || !sessionId) {
    return NextResponse.json({ error: "Missing comicId, episodeId, or sessionId" }, { status: 400 });
  }

  const supabase = createAdminClient();

  await supabase
    .from("reading_sessions")
    .upsert(
      { session_id: sessionId, comic_id: comicId, episode_id: episodeId, last_seen: new Date().toISOString() },
      { onConflict: "session_id" }
    );

  const cutoff = new Date(Date.now() - ACTIVE_WINDOW_SECONDS * 1000).toISOString();

  const { count, error } = await supabase
    .from("reading_sessions")
    .select("session_id", { count: "exact", head: true })
    .eq("episode_id", episodeId)
    .gte("last_seen", cutoff);

  if (error) {
    return NextResponse.json({ count: 1 });
  }

  return NextResponse.json({ count: count ?? 1 });
}
