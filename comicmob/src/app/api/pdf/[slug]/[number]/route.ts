import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { getStoryBySlug, getChapter } from "@/src/lib/stories-db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 595; // A4 in points
const PAGE_HEIGHT = 842;
const MARGIN = 60;
const BODY_SIZE = 12;
const LINE_HEIGHT = 18;

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string; number: string } }
) {
  const story = await getStoryBySlug(params.slug);
  if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

  const chapterNumber = parseInt(params.number, 10);
  const chapter = await getChapter(story.id, chapterNumber);
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const bodyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPageIfNeeded(neededHeight: number) {
    if (y - neededHeight < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  // Story title (small, muted)
  page.drawText(story.title, { x: MARGIN, y, size: 10, font: bodyFont, color: rgb(0.4, 0.4, 0.4) });
  y -= 28;

  // Chapter title
  const chapterTitle = `Chapter ${chapter.number}: ${chapter.title}`;
  const titleLines = wrapText(chapterTitle, titleFont, 18, maxWidth);
  for (const line of titleLines) {
    newPageIfNeeded(24);
    page.drawText(line, { x: MARGIN, y, size: 18, font: titleFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 24;
  }
  y -= 16;

  // Body paragraphs
  const paragraphs = chapter.content.split("\n\n").filter(Boolean);
  for (const para of paragraphs) {
    const lines = wrapText(para, bodyFont, BODY_SIZE, maxWidth);
    for (const line of lines) {
      newPageIfNeeded(LINE_HEIGHT);
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font: bodyFont, color: rgb(0.15, 0.15, 0.15) });
      y -= LINE_HEIGHT;
    }
    y -= 10; // paragraph spacing
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${story.title.replace(/[^a-z0-9]+/gi, "-")}-ch${chapter.number}.pdf"`,
    },
  });
}
