"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

interface LoanButtonProps {
  bookId: string;
  bookTitle: string;
  status: BookStatus;
}

export function LoanButton({ bookId, bookTitle, status }: LoanButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoan = async () => {
    if (!confirm(`Check out "${bookTitle}"?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/loan`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to check out book");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Failed to check out book");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!confirm(`Return "${bookTitle}"?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/loan`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to return book");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Failed to return book");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "ARCHIVED") {
    return null;
  }

  if (status === "CHECKED_OUT") {
    return (
      <Button
        onClick={handleReturn}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        {isLoading ? "Returning..." : "Return"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLoan}
      disabled={isLoading}
      size="sm"
      className="text-xs"
    >
      {isLoading ? "Checking out..." : "Check Out"}
    </Button>
  );
}
