import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageBooks } from "@/lib/authz";
import {
  archiveBook,
  getBookById,
  hardDeleteBook,
  unarchiveBook,
  updateBook,
} from "@/lib/services/bookService";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const book = await getBookById(params.id);
  if (!book) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.json(book);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || !canManageBooks(role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const payload = await request.json();

  if (!payload.title || !payload.author) {
    return new NextResponse("Title and author are required", { status: 400 });
  }

  const book = await updateBook(
    params.id,
    {
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn,
      category: payload.category,
      language: payload.language,
      publishedYear: payload.publishedYear
        ? Number(payload.publishedYear)
        : undefined,
      description: payload.description,
    },
    (session.user as any).id
  );

  return NextResponse.json(book);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || !canManageBooks(role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await hardDeleteBook(params.id, (session.user as any).id);
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || !canManageBooks(role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const payload = await request.json();
  const userId = (session.user as any).id;

  if (payload.action === "archive") {
    const book = await archiveBook(params.id, userId);
    return NextResponse.json(book);
  }

  if (payload.action === "unarchive") {
    const book = await unarchiveBook(params.id, userId);
    return NextResponse.json(book);
  }

  return new NextResponse("Unsupported action", { status: 400 });
}

