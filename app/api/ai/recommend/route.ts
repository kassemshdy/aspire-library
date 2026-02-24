import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recommendSimilarBooks } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { bookId } = await request.json();

    if (!bookId) {
      return new NextResponse("Book ID is required", { status: 400 });
    }

    // Get the book
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return new NextResponse("Book not found", { status: 404 });
    }

    // Get all available books
    const allBooks = await prisma.book.findMany({
      where: {
        id: { not: bookId },
        status: { in: ["AVAILABLE", "CHECKED_OUT"] },
      },
      select: { title: true, author: true, category: true },
      take: 50, // Limit for AI context
    });

    const recommendations = await recommendSimilarBooks(
      book.title,
      book.author,
      allBooks.map(b => ({
        title: b.title,
        author: b.author,
        category: b.category ?? undefined,
      }))
    );

    // Find the actual book IDs for the recommendations
    const recommendedBooks = await prisma.book.findMany({
      where: {
        title: { in: recommendations },
      },
      take: 3,
    });

    return NextResponse.json({ recommendations: recommendedBooks });
  } catch (error) {
    console.error("AI recommendation error:", error);
    return new NextResponse("Failed to generate recommendations", {
      status: 500,
    });
  }
}
