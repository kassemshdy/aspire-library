import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateBookDescription } from "@/lib/ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { title, author, category, year } = await request.json();

    if (!title || !author) {
      return new NextResponse("Title and author are required", { status: 400 });
    }

    const description = await generateBookDescription(
      title,
      author,
      category,
      year
    );

    return NextResponse.json({ description });
  } catch (error) {
    console.error("AI generation error:", error);
    return new NextResponse("Failed to generate description", { status: 500 });
  }
}
