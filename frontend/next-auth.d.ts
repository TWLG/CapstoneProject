// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string | null;
      email?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string | null;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
    email?: string | null;
  }
}
