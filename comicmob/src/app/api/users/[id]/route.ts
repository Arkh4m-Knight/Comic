import { NextResponse } from "next/server";
import { getUser } from "@/src/lib/mock";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = getUser(params.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}




