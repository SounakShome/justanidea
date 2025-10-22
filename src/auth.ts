import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUserFromDb } from "@/utils/auth"

// @ts-ignore
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const user = await getUserFromDb(
            credentials.email as string, 
            credentials.password as string
          );

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (!user.verified) {
            throw new Error("Please verify your email before logging in");
          }

          return user;
        } catch (error) {
          console.error("Authorization error:", error);
          // Return null to trigger CredentialsSignin error
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // @ts-ignore
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.username = user.username
        token.companyId = user.companyId || null
        token.onboarded = user.onboarded || false
        token.verified = user.verified || false
      }
      return token;
    },
    // @ts-ignore
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.companyId = token.companyId as string | null
        session.user.onboarded = token.onboarded as boolean
        session.user.verified = token.verified as boolean
      }
      return session
    },
    // @ts-ignore
    redirect({ url, baseUrl }) {
      // Always redirect to the configured base URL (dev tunnel or localhost)
      const configuredUrl = process.env.NEXTAUTH_URL || baseUrl
      
      // If url is relative, make it absolute using the configured URL
      if (url.startsWith('/')) {
        return `${configuredUrl}${url}`
      }
      
      // If url is absolute and matches our domain, allow it
      if (url.startsWith(configuredUrl)) {
        return url
      }
      
      // Default to dashboard
      return `${configuredUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors back to login page
  },
  events: {
    // @ts-ignore
    async signIn({ user, account, profile }) {
      console.log("User signed in:", user.email);
    },
    // @ts-ignore
    async signOut({ token }) {
      console.log("User signed out:", token?.email);
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
})