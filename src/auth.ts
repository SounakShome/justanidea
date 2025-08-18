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
        token.company = user.company || null
      }
      return token;
    },
    // @ts-ignore
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.company = token.company as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  }
})