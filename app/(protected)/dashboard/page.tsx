import { Navbar } from "@/components/shell/Navbar";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseRecommendations } from "@/components/books/PurchaseRecommendations";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const canManageBooks = role === "ADMIN" || role === "LIBRARIAN";

  const [totalBooks, availableBooks, checkedOutBooks, totalLoans, recentLoans] =
    await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: "AVAILABLE" } }),
      prisma.book.count({ where: { status: "CHECKED_OUT" } }),
      prisma.loan.count(),
      prisma.loan.findMany({
        take: 5,
        orderBy: { checkedOutAt: "desc" },
        include: {
          book: { select: { title: true, author: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here's what's happening in your library today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Books
              </CardTitle>
              <span className="text-2xl">📚</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBooks}</div>
              <p className="text-xs text-muted-foreground">
                In your library
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableBooks}</div>
              <p className="text-xs text-muted-foreground">
                Ready to borrow
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Checked Out
              </CardTitle>
              <span className="text-2xl">📖</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkedOutBooks}</div>
              <p className="text-xs text-muted-foreground">
                Currently borrowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <span className="text-2xl">🔄</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLoans}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Purchase Recommendations - Only for Librarians and Admins */}
        {canManageBooks && (
          <div className="mb-8">
            <PurchaseRecommendations />
          </div>
        )}

        {/* Recent Activity */}
        {recentLoans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest loan transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                        📖
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {loan.book.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          by {loan.book.author}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {loan.user.name || loan.user.email}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(loan.checkedOutAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
