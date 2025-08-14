import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { UserProfile } from "@/types" // Assuming your UserProfile type is here
import { JWT } from "next-auth/jwt"
import { Plan } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: UserProfile & {
      id: string;
      name: string;
      email: string;
      role: string;
      image: string;
      onboardingCompleted: boolean;
      organizationId: string;
      plan: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user?: UserProfile & { id: string };
  }
}


// This function is for REFRESHING the token. Your implementation is correct.
async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch("https://whatsyour.info/api/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.WYI_CLIENT_ID,
        client_secret: process.env.WYI_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Keep old RT if new one isn't sent
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: '/auth/login',
  },
  providers: [
    {
      id: "wyi",
      name: "WhatsYourInfo",
      type: "oauth",
      authorization: {
        url: "https://whatsyour.info/oauth/authorize",
        params: { scope: "profile:read email:read" },
      },
      // This is the user info endpoint, it's correct.
      userinfo: "https://whatsyour.info/api/v1/me",

      // --- START OF THE FIX ---
      // We are now defining a custom handler for the token endpoint communication.
      token: {
        url: "https://whatsyour.info/api/v1/oauth/token",
        async request(context) {
          const response = await fetch("https://whatsyour.info/api/v1/oauth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              grant_type: "authorization_code",
              code: context.params.code,
              redirect_uri: context.provider.callbackUrl,
              client_id: context.provider.clientId,
              client_secret: context.provider.clientSecret,
            }),
          });

          const tokens = await response.json();
          if (!response.ok) {
            throw new Error(tokens.error_description || "Token request failed");
          }
          return { tokens };
        },
      },
      // --- END OF THE FIX ---

      clientId: process.env.WYI_CLIENT_ID,
      clientSecret: process.env.WYI_CLIENT_SECRET,
      async profile(profile: UserProfile, tokens) {
        return {
          id: profile._id, // Map _id from API to id for the adapter
          name: `${profile.firstName} ${profile.lastName}`, // Combine first and last name
          email: profile.email,
          image: `https://whatsyour.info/api/v1/avatar/${profile.username}`, // Map avatar from API to image for the adapter
          emailVerified: profile.emailVerified,
          bio: profile.bio,
        };
      },
    },
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, find the user in the database to get their role
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
        include: {
          organization: true
        }
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      // This is the line that makes your middleware work!
      // It adds the user's role from the database to the JWT.
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role, // <-- THIS IS THE KEY
        onboardingCompleted: dbUser?.onboardingCompleted || false,
        plan: dbUser.organization?.plan,
        organizationId: dbUser.organizationId
      };
    },

    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string; // Also passing it to the client-side session
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.plan = token.plan as string;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };