import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recommendBooksToPurchase } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Only librarians and admins can get purchase recommendations
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "LIBRARIAN") {
    return new NextResponse(
      "Forbidden: Only librarians and admins can access purchase recommendations",
      { status: 403 }
    );
  }

  try {
    // Get loan statistics - find most borrowed books
    const loanStats = await prisma.loan.groupBy({
      by: ["bookId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 15, // Top 15 most borrowed books
    });

    // Get book details for the most borrowed books
    const bookIds = loanStats.map((stat) => stat.bookId);
    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
      select: {
        id: true,
        title: true,
        author: true,
        category: true,
      },
    });

    // Create a map of loan counts
    const loanCountMap = new Map(
      loanStats.map((stat) => [stat.bookId, stat._count.id])
    );

    // Combine book details with loan counts
    const popularBooks = books
      .map((book) => ({
        title: book.title,
        author: book.author,
        category: book.category || "General",
        loanCount: loanCountMap.get(book.id) || 0,
      }))
      .sort((a, b) => b.loanCount - a.loanCount);

    // Get all existing categories
    const categoriesResult = await prisma.book.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });

    const existingCategories = categoriesResult
      .map((b) => b.category)
      .filter((c): c is string => c !== null);

    // Get AI recommendations
    const recommendations = await recommendBooksToPurchase(
      popularBooks,
      existingCategories
    );

    return NextResponse.json({
      recommendations,
      basedOn: {
        totalLoans: await prisma.loan.count(),
        topBooks: popularBooks.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Purchase recommendations error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to generate purchase recommendations";
    return new NextResponse(errorMessage, { status: 500 });
  }
}
