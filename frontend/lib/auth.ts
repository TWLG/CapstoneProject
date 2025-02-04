import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import prisma from "@/prisma/prisma";

export const {handlers, signIn, signOut, auth} = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "database", // Use database strategy
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        const userRoles = await prisma.userRole.findMany({
          where: {userId: user.id},
          include: {role: true},
        });

        token.roles = userRoles.map((userRole) => userRole.role.name);
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },
    async session({session, token}) {
      if (token) {
        session.user = {
          ...session.user,
          roles: token.roles || [],
          id: token.id,
          email: token.email,
        };
      }

      return session;
    },
  },
});
