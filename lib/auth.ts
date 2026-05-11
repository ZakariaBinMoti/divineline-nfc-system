import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: '1',
            name: 'DivineLine Admin',
            email: adminEmail,
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = 'admin'
      return token
    },
    async session({ session, token }) {
      if (token.role) (session as any).role = token.role
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
