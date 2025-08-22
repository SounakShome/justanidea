import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUserFromDb } from "@/utils/auth"

// @ts-ignore
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await getUserFromDb(credentials?.email as string, credentials?.password as string)

        if (!user) {
          console.log("Invalid credentials.");
          return null;
        }

        return user
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
  }
})