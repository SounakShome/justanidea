declare module "next-auth" {
  /**
   * Extends the built-in Session types
   */
  export interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string  
      company?: string | null
    }
  }

  /**
   * Extends the built-in User types
   */
  interface User {
    role?: string  
  }
}