import { NextResponse } from "next/server";
import { signUp, signIn, getCurrentUser, addToLibrary } from "@/src/lib/mock";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, username, password, action } = body ?? {};

  if (action === "signup") {
    if (!email || !username || !password) {
      return NextResponse.json({ error: "Email, username, and password are required" }, { status: 400 });
    }
    const user = signUp(email, username, password);
    if (!user) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } });
  }

  if (action === "signin") {
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const user = signIn(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } });
  }

  if (action === "addToLibrary") {
    const { comicId } = body;
    if (!comicId) {
      return NextResponse.json({ error: "Comic ID is required" }, { status: 400 });
    }
    const success = addToLibrary(comicId);
    if (!success) {
      return NextResponse.json({ error: "Not signed in or comic already in library" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } });
}
