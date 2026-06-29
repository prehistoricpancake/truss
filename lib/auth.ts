import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const token = credentials?.token as string;
        if (!email || !token) return null;

        const { verifyMagicToken } = await import("@/lib/magic");
        const valid = await verifyMagicToken(email, token);
        if (!valid) return null;

        // Provision creator record on first login
        try {
          const { createCreator, getCreator } = await import("@/lib/db");
          const existing = await getCreator(email);
          if (!existing) {
            await createCreator(email, email);
          }
        } catch (e) {
          console.error("Failed to provision creator:", e);
        }

        return { id: email, email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
