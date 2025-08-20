import { create } from 'zustand';

interface Company {
    id: string
    name: string
    email: string
    gstin: string
}

interface CompanyState {
    company: Company | null
    isLoading: boolean
    error: string | null
    setCompany: (company: Company | null) => void
    updateCompany: (update: Partial<Company>) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearCompany: () => void
}

export const useCompanyStore = create<CompanyState>((set) => ({
    company: null,
    isLoading: false,
    error: null,
    setCompany: (company) => set({ company, error: null }),
    updateCompany: (updates) => set((state) => ({
        company: state.company ? { ...state.company, ...updates } : null
    })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearCompany: () => set({ company: null, error: null }),
}));