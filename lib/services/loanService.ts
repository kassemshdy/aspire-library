import { BookStatus, LoanStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_LOAN_DAYS = 14;

export async function checkoutBook(bookId: string, userId: string) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    throw new Error("Book not found");
  }
  if (book.status !== BookStatus.AVAILABLE) {
    throw new Error("Book is not available");
  }

  const now = new Date();
  const due = new Date(now.getTime() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000);

  const loan = await prisma.$transaction(async (tx) => {
    const createdLoan = await tx.loan.create({
      data: {
        bookId,
        userId,
        checkedOutAt: now,
        dueAt: due,
        status: LoanStatus.CHECKED_OUT,
      },
    });

    await tx.book.update({
      where: { id: bookId },
      data: { status: BookStatus.CHECKED_OUT },
    });

    await tx.auditLog.create({
      data: {
        action: "LOAN_CHECKOUT",
        entityType: "Loan",
        entityId: createdLoan.id,
        userId,
        metadata: createdLoan as unknown as Prisma.InputJsonValue,
      },
    });

    return createdLoan;
  });

  return loan;
}

export async function returnBook(bookId: string, userId: string, userRole?: string) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    throw new Error("Book not found");
  }
  if (book.status !== BookStatus.CHECKED_OUT) {
    throw new Error("Book is not currently checked out");
  }

  const openLoan = await prisma.loan.findFirst({
    where: {
      bookId,
      status: LoanStatus.CHECKED_OUT,
    },
    orderBy: { checkedOutAt: "desc" },
  });

  if (!openLoan) {
    throw new Error("No active loan found for this book");
  }

  // Authorization check: Only allow if user is admin/librarian OR the book's borrower
  const isAdminOrLibrarian = userRole === "ADMIN" || userRole === "LIBRARIAN";
  const isBookOwner = openLoan.userId === userId;

  if (!isAdminOrLibrarian && !isBookOwner) {
    throw new Error("Unauthorized: You can only return books you checked out");
  }

  const now = new Date();

  const updatedLoan = await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.update({
      where: { id: openLoan.id },
      data: {
        status: LoanStatus.RETURNED,
        returnedAt: now,
      },
    });

    await tx.book.update({
      where: { id: bookId },
      data: { status: BookStatus.AVAILABLE },
    });

    await tx.auditLog.create({
      data: {
        action: "LOAN_RETURN",
        entityType: "Loan",
        entityId: loan.id,
        userId,
        metadata: loan as unknown as Prisma.InputJsonValue,
      },
    });

    return loan;
  });

  return updatedLoan;
}

