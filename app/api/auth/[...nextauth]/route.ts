import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  // Explicitly set strategy as a literal to fix the 'SessionStrategy' error
  session: {
    strategy: "jwt" as const, 
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) return null;

        // FIX: Cast numeric ID to string to match NextAuth's User type
        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        };
      }
    })
  ],
  callbacks: {
    // FIX: Explicitly type 'session' and 'token' to resolve the 'any' error
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
