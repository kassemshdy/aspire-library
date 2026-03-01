"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface LoanButtonProps {
  bookId: string;
  bookTitle: string;
  status: BookStatus;
}

export function LoanButton({ bookId, bookTitle, status }: LoanButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLoan = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/books/${bookId}/loan`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to check out book");
        return;
      }

      toast.success(`Successfully checked out "${bookTitle}"`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to check out book");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/books/${bookId}/loan`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to return book");
        return;
      }

      toast.success(`Successfully returned "${bookTitle}"`);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to return book");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "ARCHIVED") {
    return null;
  }

  if (status === "CHECKED_OUT") {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            Return
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return book?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to return "{bookTitle}"? This book will be
              marked as available for others to check out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleReturn();
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Returning..." : "Return Book"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      onClick={handleLoan}
      disabled={isLoading}
      size="sm"
      className="text-xs"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? "Checking out..." : "Check Out"}
    </Button>
  );
}
