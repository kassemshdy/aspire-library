import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { discoverNewBooks } from "@/lib/ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Only librarians and admins can discover new books
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "LIBRARIAN") {
    return new NextResponse("Forbidden: Only librarians and admins can discover new books", {
      status: 403,
    });
  }

  try {
    const { query } = await request.json();

    if (!query) {
      return new NextResponse("Query is required", { status: 400 });
    }

    const suggestions = await discoverNewBooks(query);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI discovery error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to discover books";
    return new NextResponse(errorMessage, { status: 500 });
  }
}
