import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      image: string;
      onboardingCompleted: boolean;
      organizationId: string;
      plan: string;
      organizations: Array<{
        id: string;
        name: string;
        role: string;
        plan: string;
      }>;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    onboardingCompleted?: boolean;
    organizationId?: string;
    plan?: string;
    membershipStatus?: string;
    organizations?: Array<{
      id: string;
      name: string;
      role: string;
      plan: string;
    }>;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Allows signing in with Google even when the email already exists
      // via a different provider (e.g. WYI). Google verifies the email,
      // so this is safe.
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      // Handle manual session update (e.g. org switch)
      if (trigger === "update" && sessionUpdate) {
        return { ...token, ...sessionUpdate };
      }

      const dbUser = await db.user.findFirst({
        where: { email: token.email! },
        include: {
          organization: { select: { plan: true } },
          userOrganizations: {
            where: { membershipStatus: "APPROVED" },
            include: {
              organization: {
                select: { id: true, name: true, plan: true },
              },
            },
          },
        },
      });

      if (!dbUser) {
        if (user) token.id = user.id;
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
        onboardingCompleted: dbUser.onboardingCompleted ?? false,
        membershipStatus: dbUser.membershipStatus,
        plan: dbUser.organization?.plan,
        organizationId: dbUser.organizationId,
        organizations: dbUser.userOrganizations.map((uo) => ({
          id: uo.organizationId,
          name: uo.organization.name,
          role: uo.role,
          plan: uo.organization.plan,
        })),
      };
    },

    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.plan = token.plan as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organizations = (token.organizations as any) ?? [];
      }
      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production" ? ".dishis.tech" : undefined,
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
