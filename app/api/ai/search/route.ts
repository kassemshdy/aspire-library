import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchBooksWithAI } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { query } = await request.json();

    if (!query) {
      return new NextResponse("Query is required", { status: 400 });
    }

    // Get available categories from the database
    const categories = await prisma.book
      .findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ["category"],
      })
      .then((books) =>
        books.map((b) => b.category).filter((c): c is string => c !== null)
      );

    const searchParams = await searchBooksWithAI(query, categories);

    return NextResponse.json(searchParams);
  } catch (error) {
    console.error("AI search error:", error);
    return new NextResponse("Failed to process AI search", { status: 500 });
  }
}
