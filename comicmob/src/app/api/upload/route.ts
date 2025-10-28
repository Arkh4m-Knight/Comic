import { NextResponse } from "next/server";

export async function POST() {
  // Mock upload endpoint
  return NextResponse.json({ success: true, urls: ["https://picsum.photos/seed/upload/800/1200"] }, { status: 201 });
}




