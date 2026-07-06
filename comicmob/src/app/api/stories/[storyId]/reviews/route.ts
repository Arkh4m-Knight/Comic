import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { storyId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in to leave a review." }, { status: 401 });
  }

  const { rating, content } = await req.json();

  if (!rating || rating < 1 || rating > 5 || !content || content.trim().length < 20) {
    return NextResponse.json(
      { error: "A rating (1-5) and at least 20 characters of review text are required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("story_reviews")
    .insert({ story_id: params.storyId, author_id: userData.user.id, rating, content: content.trim() })
    .select("id, story_id, author_id, rating, content, created_at")
    .single();

  if (error) {
    // Unique constraint violation = they've already reviewed this story.
    if (error.code === "23505") {
      return NextResponse.json({ error: "You've already reviewed this story." }, { status: 409 });
    }
    // RLS rejection = most likely trying to review their own story.
    if (error.code === "42501") {
      return NextResponse.json({ error: "You can't review your own story." }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ review: data });
}

export async function PATCH(req: Request, { params }: { params: { storyId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in to edit a review." }, { status: 401 });
  }

  const { rating, content } = await req.json();

  if (!rating || rating < 1 || rating > 5 || !content || content.trim().length < 20) {
    return NextResponse.json(
      { error: "A rating (1-5) and at least 20 characters of review text are required." },
      { status: 400 }
    );
  }

  // Scoped to story_id + author_id rather than a review id in the URL --
  // the unique(story_id, author_id) constraint means there's exactly one
  // row to match, and this can't be pointed at anyone else's review.
  const { data, error } = await supabase
    .from("story_reviews")
    .update({ rating, content: content.trim() })
    .eq("story_id", params.storyId)
    .eq("author_id", userData.user.id)
    .select("id, story_id, author_id, rating, content, created_at")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "You haven't reviewed this story yet." }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ review: data });
}
