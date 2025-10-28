import { NextResponse } from "next/server";
import { addReview, listReviews } from "@/src/lib/mock";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json(listReviews(params.id));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { rating, content, type = "User", tags } = body ?? {};
  if (!rating || !content) {
    return NextResponse.json({ error: "rating and content are required" }, { status: 400 });
  }
  const review = addReview({
    comicId: params.id,
    authorId: "u3",
    rating: Math.max(1, Math.min(5, Number(rating))),
    type,
    tags: tags ?? { art: rating, story: rating, character: rating, worldbuilding: rating },
    content,
  });
  return NextResponse.json(review, { status: 201 });
}




