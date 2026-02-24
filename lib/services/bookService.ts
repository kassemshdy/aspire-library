import { BookStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type BookInput = {
  title: string;
  author: string;
  isbn?: string | null;
  category?: string | null;
  language?: string | null;
  publishedYear?: number | null;
  description?: string | null;
};

export type BookFilters = {
  query?: string;
  status?: BookStatus | "ALL";
  category?: string;
};

export async function listBooks(filters: BookFilters, page = 1, pageSize = 20) {
  const where: Prisma.BookWhereInput = {
    status:
      !filters.status || filters.status === "ALL"
        ? { in: [BookStatus.AVAILABLE, BookStatus.CHECKED_OUT] }
        : filters.status,
  };

  if (filters.category) {
    where.category = { equals: filters.category, mode: "insensitive" };
  }

  if (filters.query) {
    const q = filters.query.trim();
    where.AND = [
      {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { author: { contains: q, mode: "insensitive" } },
          { isbn: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

export async function createBook(data: BookInput, userId: string) {
  const book = await prisma.book.create({
    data: {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      category: data.category || null,
      language: data.language || null,
      publishedYear: data.publishedYear ?? null,
      description: data.description || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "BOOK_CREATE",
      entityType: "Book",
      entityId: book.id,
      userId,
      metadata: book as unknown as Prisma.InputJsonValue,
    },
  });

  return book;
}

export async function updateBook(
  id: string,
  data: BookInput,
  userId: string
) {
  const book = await prisma.book.update({
    where: { id },
    data: {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      category: data.category || null,
      language: data.language || null,
      publishedYear: data.publishedYear ?? null,
      description: data.description || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "BOOK_UPDATE",
      entityType: "Book",
      entityId: book.id,
      userId,
      metadata: book as unknown as Prisma.InputJsonValue,
    },
  });

  return book;
}

export async function archiveBook(id: string, userId: string) {
  const book = await prisma.book.update({
    where: { id },
    data: {
      status: BookStatus.ARCHIVED,
      archivedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "BOOK_ARCHIVE",
      entityType: "Book",
      entityId: book.id,
      userId,
      metadata: book as unknown as Prisma.InputJsonValue,
    },
  });

  return book;
}

export async function unarchiveBook(id: string, userId: string) {
  const book = await prisma.book.update({
    where: { id },
    data: {
      status: BookStatus.AVAILABLE,
      archivedAt: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "BOOK_UNARCHIVE",
      entityType: "Book",
      entityId: book.id,
      userId,
      metadata: book as unknown as Prisma.InputJsonValue,
    },
  });

  return book;
}

export async function hardDeleteBook(id: string, userId: string) {
  await prisma.auditLog.create({
    data: {
      action: "BOOK_DELETE",
      entityType: "Book",
      entityId: id,
      userId,
    },
  });

  await prisma.book.delete({
    where: { id },
  });
}

export async function getBookById(id: string) {
  return prisma.book.findUnique({
    where: { id },
  });
}

