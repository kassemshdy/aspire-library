import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutBook, returnBook } from "@/lib/services/loanService";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const action = payload.action as "checkout" | "return" | undefined;

  try {
    if (action === "checkout") {
      const loan = await checkoutBook(params.id, (session.user as any).id);
      return NextResponse.json(loan);
    }

    if (action === "return") {
      const loan = await returnBook(params.id, (session.user as any).id);
      return NextResponse.json(loan);
    }

    return new NextResponse("Unsupported action", { status: 400 });
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Unknown error", { status: 500 });
  }
}

