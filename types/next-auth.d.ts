import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "LIBRARIAN" | "MEMBER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "LIBRARIAN" | "MEMBER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "LIBRARIAN" | "MEMBER";
  }
}
