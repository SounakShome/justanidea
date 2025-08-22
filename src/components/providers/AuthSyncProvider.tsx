'use client'

import { useEffect, ReactNode } from 'react'
import { useCompanyStore } from '@/store'
import { getCompaniesFromDb } from '@/utils/auth'
import { useInventoryStore } from '@/store'
import { Product } from '@/types/inventory'

interface AuthSyncProviderProps {
  children: ReactNode
  session: any // You can type this more specifically if needed
}

/**
 * Client-side component that syncs NextAuth session company data with Zustand company store
 */
export function AuthSyncProvider({ children, session }: AuthSyncProviderProps) {
  const { setCompany, clearCompany } = useCompanyStore()
  const { setProducts } = useInventoryStore();

  const fetchInventoryItems = async (): Promise<Product[]> => {
      try {
          const response = await fetch("/api/getItems");
          if (!response.ok) {
              throw new Error(`Failed to fetch inventory: ${response.status}`);
          }
          const data = await response.json();
          return data || [];
      } catch (error) {
          console.error("Error fetching inventory:", error);
          throw error; // Re-throw error to be handled by calling function
      }
  };

  //storing company data
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

  //storing inventory data
  useEffect(() => {
    async function syncInventoryData() {
      if (session?.user) {
        try {
          const inventoryData = await fetchInventoryItems();
          setProducts(inventoryData);
        } catch (error) {
          console.error('Error fetching inventory data:', error);
        }
      }
    }

    syncInventoryData()
  }, [session, setProducts])

  return <>{children}</>
}
