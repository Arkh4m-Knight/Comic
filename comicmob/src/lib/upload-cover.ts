import { createClient } from "@/src/lib/supabase/client";

// Uploads a cover image to the user's own folder in Supabase Storage and
// returns its public URL. Storage policies enforce that a user can only
// upload into a path starting with their own user ID.
export async function uploadCoverImage(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("story-covers").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("story-covers").getPublicUrl(path);
  return data.publicUrl;
}
