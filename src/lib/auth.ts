import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        identifier: { label: 'ID/Roll Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        const identifier = credentials.identifier as string
        const password = credentials.password as string

        // First, check Students table
        const student = await prisma.student.findUnique({
          where: { rollNumber: identifier },
        })

        if (student) {
          const isValid = await bcrypt.compare(password, student.password)
          if (isValid) {
            return {
              id: student.rollNumber,
              name: student.name,
              email: student.email,
              type: 'student' as const,
            }
          }
        }

        // If not found in Students, check Admins table
        const admin = await prisma.admin.findUnique({
          where: { adminId: identifier },
        })

        if (admin) {
          const isValid = await bcrypt.compare(password, admin.password)
          if (isValid) {
            return {
              id: admin.adminId,
              name: admin.name,
              email: admin.email,
              type: 'admin' as const,
            }
          }
        }

        // Invalid credentials
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = user.type
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.type = token.type as 'student' | 'admin'
        session.user.id = token.id as string
      }
      return session
    },
  },
})
