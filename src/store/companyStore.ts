import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Company interface matching your Prisma schema
interface Company {
    id: string
    Name: string
    Industry: string
    GSTIN: string
    CompanySize: string
    Address: string
    CompanyWebsite?: string | null
    createdAt?: Date
    updatedAt?: Date
}

// Form data interface for company creation/updates
interface CompanyFormData {
    Name: string
    Industry: string
    GSTIN: string
    CompanySize: string
    Address: string
    CompanyWebsite?: string
}

interface CompanyState {
    // State
    company: Company | null
    isLoading: boolean
    error: string | null
    isEditing: boolean
    
    // Form state
    formData: CompanyFormData | null
    
    // Actions
    setCompany: (company: Company | null) => void
    updateCompany: (updates: Partial<Company>) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void
    clearCompany: () => void
    
    // Form actions
    setFormData: (data: CompanyFormData) => void
    updateFormData: (updates: Partial<CompanyFormData>) => void
    clearFormData: () => void
    setEditing: (editing: boolean) => void
    
    // API integration actions
    fetchCompany: (email: string) => Promise<void>
    saveCompany: (data: CompanyFormData) => Promise<boolean>
    deleteCompany: () => Promise<boolean>
    
    // Validation
    validateGSTIN: (gstin: string) => boolean
    isFormValid: () => boolean
}

export const useCompanyStore = create<CompanyState>()(
    persist(
        (set, get) => ({
            // Initial state
            company: null,
            isLoading: false,
            error: null,
            isEditing: false,
            formData: null,

            // Basic actions
            setCompany: (company) => {
                set({ company, error: null })
                // Auto-populate form data when company is set
                if (company) {
                    set({
                        formData: {
                            Name: company.Name,
                            Industry: company.Industry,
                            GSTIN: company.GSTIN,
                            CompanySize: company.CompanySize,
                            Address: company.Address,
                            CompanyWebsite: company.CompanyWebsite || '',
                        }
                    })
                }
            },

            updateCompany: (updates) => {
                set((state) => ({
                    company: state.company ? { ...state.company, ...updates } : null
                }))
            },

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            clearError: () => set({ error: null }),

            clearCompany: () => set({ 
                company: null, 
                error: null, 
                formData: null, 
                isEditing: false 
            }),

            // Form actions
            setFormData: (formData) => set({ formData }),

            updateFormData: (updates) => {
                set((state) => ({
                    formData: state.formData ? { ...state.formData, ...updates } : null
                }))
            },

            clearFormData: () => set({ formData: null }),

            setEditing: (isEditing) => set({ isEditing }),

            // API integration
            fetchCompany: async (email: string) => {
                const { setLoading, setError, setCompany } = get()
                
                setLoading(true)
                setError(null)
                
                try {
                    const response = await fetch(`/api/company?email=${encodeURIComponent(email)}`)
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch company data')
                    }
                    
                    const companyData = await response.json()
                    setCompany(companyData)
                    
                } catch (error) {
                    console.error('Error fetching company:', error)
                    setError(error instanceof Error ? error.message : 'Failed to fetch company')
                } finally {
                    setLoading(false)
                }
            },

            saveCompany: async (data: CompanyFormData) => {
                const { setLoading, setError, company, setCompany } = get()
                
                setLoading(true)
                setError(null)
                
                try {
                    const url = company ? `/api/company/${company.id}` : '/api/company'
                    const method = company ? 'PUT' : 'POST'
                    
                    const response = await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    })
                    
                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.message || 'Failed to save company')
                    }
                    
                    const savedCompany = await response.json()
                    setCompany(savedCompany)
                    
                    return true
                    
                } catch (error) {
                    console.error('Error saving company:', error)
                    setError(error instanceof Error ? error.message : 'Failed to save company')
                    return false
                } finally {
                    setLoading(false)
                }
            },

            deleteCompany: async () => {
                const { setLoading, setError, company, clearCompany } = get()
                
                if (!company) return false
                
                setLoading(true)
                setError(null)
                
                try {
                    const response = await fetch(`/api/company/${company.id}`, {
                        method: 'DELETE',
                    })
                    
                    if (!response.ok) {
                        throw new Error('Failed to delete company')
                    }
                    
                    clearCompany()
                    return true
                    
                } catch (error) {
                    console.error('Error deleting company:', error)
                    setError(error instanceof Error ? error.message : 'Failed to delete company')
                    return false
                } finally {
                    setLoading(false)
                }
            },

            // Validation methods
            validateGSTIN: (gstin: string) => {
                // Basic GSTIN validation (15 characters, specific pattern)
                const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
                return gstinRegex.test(gstin)
            },

            isFormValid: () => {
                const { formData, validateGSTIN } = get()
                
                if (!formData) return false
                
                return !!(
                    formData.Name?.trim() &&
                    formData.Industry?.trim() &&
                    formData.GSTIN?.trim() &&
                    validateGSTIN(formData.GSTIN) &&
                    formData.CompanySize?.trim() &&
                    formData.Address?.trim()
                )
            },
        }),
        {
            name: 'company-storage',
            partialize: (state) => ({
                company: state.company,
            }),
        }
    )
)

// Export helper functions
export const getCompanyState = () => useCompanyStore.getState()
export const getCurrentCompany = () => useCompanyStore.getState().company