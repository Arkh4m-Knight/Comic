import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { storyId: string } }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ favorited: false });

  const { data } = await supabase
    .from("favorites")
    .select("story_id")
    .eq("user_id", userData.user.id)
    .eq("story_id", params.storyId)
    .maybeSingle();

  return NextResponse.json({ favorited: !!data });
}

export async function POST(req: Request, { params }: { params: { storyId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in to save stories." }, { status: 401 });
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userData.user.id, story_id: params.storyId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ favorited: true });
}

export async function DELETE(req: Request, { params }: { params: { storyId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("story_id", params.storyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ favorited: false });
}
