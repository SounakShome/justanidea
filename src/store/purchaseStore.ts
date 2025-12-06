import { create } from 'zustand'
import { Supplier, Variant, PurchaseFormValues, PurchaseItem, CompletedPurchase } from "@/types/addPurchases"

interface PurchaseState {
  // Data
  suppliers: Supplier[]
  variants: Variant[]
  selectedSupplier: Supplier | null
  purchases: CompletedPurchase[]
  filteredPurchases: CompletedPurchase[]
  
  // Form state
  purchaseForm: PurchaseFormValues
  
  // Loading states
  isLoadingSuppliers: boolean
  isLoadingVariants: boolean
  isLoadingPurchases: boolean
  isSaving: boolean
  
  // Search state
  variantSearchQuery: string
  purchaseSearchQuery: string
  
  // Actions
  setVariantSearchQuery: (query: string) => void
  setPurchaseSearchQuery: (query: string) => void
  filterPurchases: () => void
  
  // Form actions
  updateFormField: <K extends keyof PurchaseFormValues>(field: K, value: PurchaseFormValues[K]) => void
  resetForm: () => void
  
  // Item management
  addVariantToItems: (variant: Variant, selectedSize: string) => void
  updateItemQuantity: (variantId: string, size: string, quantity: number) => void
  updateItemDiscount: (variantId: string, size: string, discount: number) => void
  updateVariantDiscount: (variantId: string, discount: number) => void
  removeItem: (variantId: string, size: string) => void
  
  // Calculation functions
  calculateSubtotal: () => number
  calculateTaxableAmount: () => number
  calculateTaxAmount: () => number
  calculateRoundingOff: () => number
  calculateTotal: () => number
  updateCalculations: () => void
  
  // API operations
  fetchSuppliers: () => Promise<void>
  fetchVariants: (supplierId: string, query?: string) => Promise<void>
  fetchPurchases: () => Promise<void>
  savePurchase: () => Promise<{ success: boolean; id: string } | null>
  updatePurchaseStatus: (purchaseId: string, status: string) => Promise<void>
  deletePurchase: (purchaseId: string) => Promise<void>
}

const initialFormState: PurchaseFormValues = {
  invoiceNo: "",
  purchaseDate: new Date(),
  supplierId: "",
  status: "PENDING",
  notes: "",
  items: [],
  subtotal: 0,
  discount: 0,
  discountType: "percentage",
  taxableAmount: 0,
  tax: "igst",
  igst: 0,
  cgst: 0,
  sgst: 0,
  totalAmount: 0,
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  // Initial state
  suppliers: [],
  variants: [],
  selectedSupplier: null,
  purchases: [],
  filteredPurchases: [],
  purchaseForm: initialFormState,
  isLoadingSuppliers: false,
  isLoadingVariants: false,
  isLoadingPurchases: false,
  isSaving: false,
  variantSearchQuery: "",
  purchaseSearchQuery: "",

  // Search
  setVariantSearchQuery: (query: string) => set({ variantSearchQuery: query }),
  setPurchaseSearchQuery: (query: string) => {
    set({ purchaseSearchQuery: query })
    get().filterPurchases()
  },

  // Filter purchases helper
  filterPurchases: () => {
    const { purchases, purchaseSearchQuery } = get()
    if (!purchaseSearchQuery.trim()) {
      set({ filteredPurchases: purchases })
      return
    }
    
    const query = purchaseSearchQuery.toLowerCase()
    const filtered = purchases.filter(purchase =>
      purchase.supplier?.name?.toLowerCase().includes(query) ||
      purchase.invoiceNo?.toLowerCase().includes(query)
    )
    set({ filteredPurchases: filtered })
  },

  // Form actions
  updateFormField: (field, value) => {
    set((state) => ({
      purchaseForm: {
        ...state.purchaseForm,
        [field]: value,
      },
    }))
    
    // Update selected supplier when supplierId changes
    if (field === 'supplierId') {
      const supplier = get().suppliers.find(s => s.id === value) || null
      set({ selectedSupplier: supplier })
    }
    
    // Recalculate amounts when discount or discount type changes
    if (field === 'discount' || field === 'discountType' || field === 'igst' || field === 'cgst' || field === 'sgst') {
      get().updateCalculations()
    }
  },

  resetForm: () => {
    set({
      purchaseForm: initialFormState,
      variants: [],
      variantSearchQuery: "",
      selectedSupplier: null,
    })
  },

  // Item management
  addVariantToItems: (variant: Variant, selectedSize: string) => {
    const { purchaseForm } = get()
    
    // Find the size data
    const sizeData = variant.sizes.find(s => s.size === selectedSize)
    if (!sizeData) {
      console.error('Size not found')
      return
    }

    // Check if this variant + size combo already exists
    const existingItemIndex = purchaseForm.items.findIndex(
      item => item.variantId === variant.id && item.size === selectedSize
    )

    if (existingItemIndex >= 0) {
      // Increment quantity
      const updatedItems = [...purchaseForm.items]
      const item = updatedItems[existingItemIndex]
      item.quantity += 1
      item.totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100)
      
      set((state) => ({
        purchaseForm: {
          ...state.purchaseForm,
          items: updatedItems,
        },
      }))
    } else {
      // Add new item
      const newItem: PurchaseItem = {
        variantId: variant.id,
        size: selectedSize,
        quantity: 1,
        unitPrice: sizeData.buyingPrice,
        discount: 0,
        totalPrice: sizeData.buyingPrice,
      }
      
      set((state) => ({
        purchaseForm: {
          ...state.purchaseForm,
          items: [...state.purchaseForm.items, newItem],
        },
      }))
    }
    
    get().updateCalculations()
  },

  updateItemQuantity: (variantId: string, size: string, quantity: number) => {
    const { purchaseForm } = get()
    const updatedItems = purchaseForm.items.map(item =>
      item.variantId === variantId && item.size === size
        ? {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice * (1 - item.discount / 100)
          }
        : item
    )
    
    set((state) => ({
      purchaseForm: {
        ...state.purchaseForm,
        items: updatedItems,
      },
    }))
    
    get().updateCalculations()
  },

  updateItemDiscount: (variantId: string, size: string, discount: number) => {
    const { purchaseForm } = get()
    const updatedItems = purchaseForm.items.map(item =>
      item.variantId === variantId && item.size === size
        ? {
            ...item,
            discount,
            totalPrice: item.quantity * item.unitPrice * (1 - (discount || 0) / 100)
          }
        : item
    )
    
    set((state) => ({
      purchaseForm: {
        ...state.purchaseForm,
        items: updatedItems,
      },
    }))
    
    get().updateCalculations()
  },

  updateVariantDiscount: (variantId: string, discount: number) => {
    const { purchaseForm } = get()
    const updatedItems = purchaseForm.items.map(item =>
      item.variantId === variantId
        ? {
            ...item,
            discount,
            totalPrice: item.quantity * item.unitPrice * (1 - (discount || 0) / 100)
          }
        : item
    )
    
    set((state) => ({
      purchaseForm: {
        ...state.purchaseForm,
        items: updatedItems,
      },
    }))
    
    get().updateCalculations()
  },

  removeItem: (variantId: string, size: string) => {
    const { purchaseForm } = get()
    const updatedItems = purchaseForm.items.filter(
      item => !(item.variantId === variantId && item.size === size)
    )
    
    set((state) => ({
      purchaseForm: {
        ...state.purchaseForm,
        items: updatedItems,
      },
    }))
    
    get().updateCalculations()
  },

  // Calculations
  calculateSubtotal: () => {
    const { purchaseForm } = get()
    return purchaseForm.items.reduce((sum, item) => sum + item.totalPrice, 0)
  },

  calculateTaxableAmount: () => {
    const subtotal = get().calculateSubtotal()
    const { discount, discountType } = get().purchaseForm
    if (discountType === 'percentage') {
      return subtotal - (subtotal * (discount || 0) / 100)
    } else {
      return subtotal - (discount || 0)
    }
  },

  calculateTaxAmount: () => {
    const taxableAmount = get().calculateTaxableAmount()
    const { purchaseForm } = get()
    
    if (purchaseForm.tax === 'igst') {
      return taxableAmount * (purchaseForm.igst || 0) / 100
    } else {
      const cgst = taxableAmount * (purchaseForm.cgst || 0) / 100
      const sgst = taxableAmount * (purchaseForm.sgst || 0) / 100
      return cgst + sgst
    }
  },

  calculateRoundingOff: () => {
    const taxableAmount = get().calculateTaxableAmount()
    const taxAmount = get().calculateTaxAmount()
    const total = taxableAmount + taxAmount
    const rounded = Math.round(total)
    return rounded - total
  },

  calculateTotal: () => {
    const taxableAmount = get().calculateTaxableAmount()
    const taxAmount = get().calculateTaxAmount()
    const roundingOff = get().calculateRoundingOff()
    return taxableAmount + taxAmount + roundingOff
  },

  updateCalculations: () => {
    const subtotal = get().calculateSubtotal()
    const taxableAmount = get().calculateTaxableAmount()
    const totalAmount = get().calculateTotal()
    
    set((state) => ({
      purchaseForm: {
        ...state.purchaseForm,
        subtotal,
        taxableAmount,
        totalAmount,
      },
    }))
  },

  // API operations
  fetchSuppliers: async () => {
    set({ isLoadingSuppliers: true })
    try {
      const response = await fetch('/api/getSuppliers')
      if (!response.ok) throw new Error('Failed to fetch suppliers')
      
      const data: Supplier[] = await response.json()
      set({ suppliers: data })
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      throw error
    } finally {
      set({ isLoadingSuppliers: false })
    }
  },

  fetchVariants: async (supplierId: string, query?: string) => {
    set({ isLoadingVariants: true })
    try {
      const response = await fetch(`/api/getItems/${supplierId}`)
      if (!response.ok) throw new Error('Failed to fetch variants')
      
      const allVariants: Variant[] = await response.json()
      
      // Parse sizes JSON if it's a string
      const parsedVariants = allVariants.map(variant => ({
        ...variant,
        sizes: Array.isArray(variant.sizes) 
          ? variant.sizes 
          : typeof variant.sizes === 'string' 
            ? JSON.parse(variant.sizes) 
            : []
      }))
      
      // Filter and rank by query if provided
      let resultVariants = parsedVariants
      if (query && query.trim()) {
        // Remove special characters from query
        const lowerQuery = query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '')
        
        // Calculate match score for each variant using inventory-style scoring
        const scoredVariants = parsedVariants.map(variant => {
          let score = 0
          
          // Remove special characters from all search fields
          const variantName = (variant.name?.toLowerCase() || '').replace(/[^a-z0-9\s]/g, '')
          const productName = (variant.product?.name?.toLowerCase() || '').replace(/[^a-z0-9\s]/g, '')
          const barcode = (variant.barcode?.toLowerCase() || '').replace(/[^a-z0-9\s]/g, '')
          const combinedName = `${productName} ${variantName}`.trim()
          
          // Priority 1: Barcode exact match (highest priority)
          if (barcode && barcode === lowerQuery) {
            score = 100
          }
          // Priority 2: Barcode partial match
          else if (barcode && barcode.includes(lowerQuery)) {
            score = 90
          }
          // Priority 3: Multi-word query support
          else {
            // Split query into words for multi-word search
            const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0)
            
            // Check if all query words are present in combined name
            const allWordsPresent = queryWords.every(word => 
              combinedName.includes(word)
            )
            
            if (allWordsPresent) {
              let matchQuality = 0
              
              // Exact match with combined name
              if (combinedName === lowerQuery) {
                matchQuality = 100
              }
              // Exact match with variant name
              else if (variantName === lowerQuery) {
                matchQuality = 90
              }
              // Exact match with product name
              else if (productName === lowerQuery) {
                matchQuality = 85
              }
              // Combined name starts with query
              else if (combinedName.startsWith(lowerQuery)) {
                matchQuality = 80
              }
              // Variant name starts with query
              else if (variantName.startsWith(lowerQuery)) {
                matchQuality = 75
              }
              // Product name starts with query
              else if (productName.startsWith(lowerQuery)) {
                matchQuality = 70
              }
              // All words present, calculate score based on word count
              else {
                // More words matched = higher base score
                const wordMatchBonus = Math.min(queryWords.length * 10, 40)
                matchQuality = 50 + wordMatchBonus
              }
              
              score = matchQuality
            }
          }
          
          return { variant, score }
        })
        
        // Filter out non-matches and sort by score
        resultVariants = scoredVariants
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(item => item.variant)
      }
      
      set({ variants: resultVariants })
    } catch (error) {
      console.error('Error fetching variants:', error)
      throw error
    } finally {
      set({ isLoadingVariants: false })
    }
  },

  fetchPurchases: async () => {
    set({ isLoadingPurchases: true })
    try {
      const response = await fetch('/api/purchases')
      if (!response.ok) throw new Error('Failed to fetch purchases')
      
      const data: CompletedPurchase[] = await response.json()
      set({ purchases: data, filteredPurchases: data })
    } catch (error) {
      console.error('Error fetching purchases:', error)
      throw error
    } finally {
      set({ isLoadingPurchases: false })
    }
  },

  savePurchase: async () => {
    const { purchaseForm } = get()
    
    if (!purchaseForm.items.length) {
      throw new Error('No items in purchase')
    }
    
    if (!purchaseForm.supplierId) {
      throw new Error('No supplier selected')
    }
    
    set({ isSaving: true })
    try {
      const payload = {
        invoiceNo: purchaseForm.invoiceNo,
        Date: purchaseForm.purchaseDate,
        supplierId: purchaseForm.supplierId,
        status: purchaseForm.status,
        notes: purchaseForm.notes || null,
        subtotal: purchaseForm.subtotal,
        discount: purchaseForm.discount,
        taxableAmount: purchaseForm.taxableAmount,
        igst: purchaseForm.tax === 'igst' ? purchaseForm.igst : null,
        cgst: purchaseForm.tax === 'sgst_cgst' ? purchaseForm.cgst : null,
        sgst: purchaseForm.tax === 'sgst_cgst' ? purchaseForm.sgst : null,
        totalAmount: purchaseForm.totalAmount,
        items: purchaseForm.items,
      }
      
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save purchase')
      }
      
      const result = await response.json()
      return { success: true, id: result.id }
    } catch (error) {
      console.error('Error saving purchase:', error)
      throw error
    } finally {
      set({ isSaving: false })
    }
  },

  updatePurchaseStatus: async (purchaseId: string, status: string) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) throw new Error('Failed to update purchase status')
      
      // Refresh purchases after update
      await get().fetchPurchases()
    } catch (error) {
      console.error('Error updating purchase status:', error)
      throw error
    }
  },

  deletePurchase: async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete purchase')
      
      // Refresh purchases after deletion
      await get().fetchPurchases()
    } catch (error) {
      console.error('Error deleting purchase:', error)
      throw error
    }
  },
}))

