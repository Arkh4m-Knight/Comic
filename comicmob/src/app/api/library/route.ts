import { NextResponse } from "next/server";
import { getUserLibrary, getCurrentUser } from "@/src/lib/mock";

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  
  const library = getUserLibrary();
  return NextResponse.json({ library });
}

export async function DELETE(req: Request) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  
  const body = await req.json();
  const { comicId } = body;
  
  if (!comicId) {
    return NextResponse.json({ error: "Comic ID is required" }, { status: 400 });
  }
  
  // Remove from user's library
  const index = user.library.indexOf(comicId);
  if (index > -1) {
    user.library.splice(index, 1);
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: "Comic not in library" }, { status: 404 });
}


