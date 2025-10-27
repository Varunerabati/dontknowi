import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    type: 'student' | 'admin'
    id: string
  }

  interface Session {
    user: {
      type: 'student' | 'admin'
      id: string
      name: string
      email: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    type?: 'student' | 'admin'
    id?: string
  }
}
