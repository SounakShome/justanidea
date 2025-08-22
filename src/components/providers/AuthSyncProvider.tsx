'use client'

import { useEffect, ReactNode } from 'react'
import { useCompanyStore } from '@/store/companyStore'
import { getCompaniesFromDb } from '@/utils/auth'

interface AuthSyncProviderProps {
  children: ReactNode
  session: any // You can type this more specifically if needed
}

/**
 * Client-side component that syncs NextAuth session company data with Zustand company store
 */
export function AuthSyncProvider({ children, session }: AuthSyncProviderProps) {
  const { setCompany, clearCompany } = useCompanyStore()
  
  useEffect(() => {
    async function syncCompanyData() {
      if (session?.user) {
        // If company data exists in session, use it
        if ((session.user as any).company) {
          setCompany((session.user as any).company)
        } else if (session.user.email) {
          // Otherwise, fetch company data from database
          try {
            const companyData = await getCompaniesFromDb(session.user.email)
            // Check if companyData is a valid company object (not an empty array)
            if (companyData && typeof companyData === 'object' && !Array.isArray(companyData)) {
              setCompany(companyData)
            }
          } catch (error) {
            console.error('Error fetching company data:', error)
          }
        }
      } else {
        // Clear company data when no session
        clearCompany()
      }
    }

    syncCompanyData()
  }, [session, setCompany, clearCompany])

  return <>{children}</>
}
