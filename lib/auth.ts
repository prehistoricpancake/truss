import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "cognito" && user.id) {
        // First login: create creator record in DynamoDB
        // This is handled by the post-confirmation trigger or here
        try {
          const { createCreator, getCreator } = await import("@/lib/db");
          const existing = await getCreator(user.id);
          if (!existing) {
            await createCreator(user.id, user.email || "", user.name || undefined);
          }
        } catch (e) {
          console.error("Failed to create creator record:", e);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
