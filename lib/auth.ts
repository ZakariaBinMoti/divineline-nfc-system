import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/db'
import { AdminUser } from '@/lib/models/AdminUser'
import { ensureDefaultAdmin } from '@/lib/seed-admin'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()

        // Ensure at least one admin exists (first-run migration)
        await ensureDefaultAdmin()

        const admin = await AdminUser.findOne({ email: credentials.email.toLowerCase() })
        if (!admin) return null

        const isValid = await admin.comparePassword(credentials.password)
        if (!isValid) return null

        return {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
        }
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
      if (user) {
        token.role = 'admin'
        token.adminId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.role) (session as any).role = token.role
      if (token.adminId) (session as any).adminId = token.adminId
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
