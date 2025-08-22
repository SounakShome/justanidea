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
      username?: string
      role?: 'ADMIN' | 'SALESMAN'
      verified?: boolean
      onboarded?: boolean
      companyId?: string | null
      company?: {
        id: string
        Name: string
        Industry: string
        GSTIN: string
        CompanySize: string
        Address: string
        CompanyWebsite?: string | null
      } | null
    }
  }

  /**
   * Extends the built-in User types
   */
  interface User {
    id?: string
    username?: string
    email?: string
    role?: 'ADMIN' | 'SALESMAN'
    verified?: boolean
    onboarded?: boolean
    companyId?: string | null
    company?: {
      id: string
      Name: string
      Industry: string
      GSTIN: string
      CompanySize: string
      Address: string
      CompanyWebsite?: string | null
    } | null
  }
}