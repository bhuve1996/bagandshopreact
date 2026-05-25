import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

const DEMO_USERS = [
  {
    id: "demo-customer",
    email: "customer@test.com",
    name: "Demo Customer",
    password: "password123",
    role: "CUSTOMER",
  },
  {
    id: "demo-admin",
    email: "admin@test.com",
    name: "Admin User",
    password: "admin123",
    role: "SUPER_ADMIN",
  },
];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();

        if (await isDatabaseReady()) {
          const user = await getPrisma().user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;
          const valid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          if (!valid) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        const demo = DEMO_USERS.find((u) => u.email === email);
        if (!demo || demo.password !== credentials.password) return null;
        return {
          id: demo.id,
          email: demo.email,
          name: demo.name,
          role: demo.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "CUSTOMER";
      }
      return session;
    },
  },
};
