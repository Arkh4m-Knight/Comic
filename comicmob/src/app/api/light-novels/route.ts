import { NextResponse } from "next/server";
import { addLightNovel, listLightNovels } from "@/src/lib/mock";

export async function GET() {
  return NextResponse.json(listLightNovels());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, author, coverUrl, synopsis } = body ?? {};
  if (!title || !author) return NextResponse.json({ error: "title and author are required" }, { status: 400 });
  const ln = addLightNovel({ title, author, coverUrl, synopsis });
  return NextResponse.json(ln, { status: 201 });
}




