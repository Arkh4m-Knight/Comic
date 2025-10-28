import { NextResponse } from "next/server";
import { listTrendingComics } from "@/src/lib/mock";

export async function GET() {
  return NextResponse.json({ trending: listTrendingComics() });
}




