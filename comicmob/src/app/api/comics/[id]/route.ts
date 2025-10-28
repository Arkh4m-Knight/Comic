import { NextResponse } from "next/server";
import { getComic } from "@/src/lib/mock";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const comic = getComic(params.id);
  if (!comic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(comic);
}




