import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import { getUserFromDb } from "@/utils/auth"

interface Session {
  user: {
    id?: string
    username?: string | null
    email?: string | null
    image?: string | null
    role?: string
    company?: string | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { type: "text", placeholder: "email" },
        password: { type: "password", placeholder: "password" },
      },
      authorize: async (credentials) => {

        const user = await getUserFromDb(credentials.email as string, credentials.password as string)

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          console.log("Invalid credentials.");
          return null;
        }

        // return user object with their profile data
        return user
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: { token: JWT, user: any }) {
      if (user) { // User is available during sign-in
        token.role = user.role
        token.username = user.username
        token.company = user.company || null
      }
      return token
    },
    session({ session, token }: { session: Session, token: JWT }) {
      session.user.role = token.role as string
      session.user.username = token.username as string
      session.user.company = token.company as string | null
      return session
    },
  },
})