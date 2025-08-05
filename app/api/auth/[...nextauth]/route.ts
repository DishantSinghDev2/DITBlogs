import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import TwitterProvider from "next-auth/providers/twitter"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcrypt"

import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
        CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing email or password");
          }
    
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });
    
          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }
    
          if (!user.emailVerified) {
            try {
              if (user.email) {
                await sendVerificationEmail(user.email)
              } else {
                throw new Error("User email is null")
              }
            } catch (e) {
              console.error("Failed to send verification email:", e)
            }
            throw new Error("Please verify your email before logging in")
          }
          
    
          const isPasswordValid = await compare(credentials.password, user.password);
    
          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }
    
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role as string
        session.user.image = token.picture
      }
      return session
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        picture: dbUser.image,
      }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
