import { create } from 'zustand'
import { Supplier, Variants, PurchaseFormValues, PurchaseItem, CompletedPurchase } from "@/types/addPurchases"

interface PurchaseState {
  // Data
  suppliers: Supplier[]
  products: Variants[]
  selectedSupplier: Supplier | null
  purchases: CompletedPurchase[]
  filteredPurchases: CompletedPurchase[]
  
  // Form state
  purchaseForm: PurchaseFormValues
  
  // Loading states
  isLoadingSuppliers: boolean
  isLoadingProducts: boolean
  isLoadingPurchases: boolean
  isSaving: boolean
  
  // Search & Filter state
  productSearchQuery: string
  purchaseSearchQuery: string
  selectedStatus: string
  selectedSupplierFilter: string
  dateRange: { from: Date | null; to: Date | null }
  sortBy: 'date' | 'amount' | 'invoice' | 'supplier'
  sortOrder: 'asc' | 'desc'
  
  // Actions
  setSuppliers: (suppliers: Supplier[]) => void
  setProducts: (products: Variants[]) => void
  setSelectedSupplier: (supplier: Supplier | null) => void
  setPurchases: (purchases: CompletedPurchase[]) => void
  setLoadingSuppliers: (loading: boolean) => void
  setLoadingProducts: (loading: boolean) => void
  setLoadingPurchases: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setProductSearchQuery: (query: string) => void
  setPurchaseSearchQuery: (query: string) => void
  setSelectedStatus: (status: string) => void
  setSelectedSupplierFilter: (supplierId: string) => void
  setDateRange: (range: { from: Date | null; to: Date | null }) => void
  setSortBy: (sortBy: 'date' | 'amount' | 'invoice' | 'supplier') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  clearPurchaseFilters: () => void
  
  // Form actions
  updateFormField: <K extends keyof PurchaseFormValues>(field: K, value: PurchaseFormValues[K]) => void
  resetForm: () => void
  
  // Item management
  addProductToItems: (product: Variants) => void
  updateItemQuantity: (productId: string, quantity: number) => void
  updateItemDiscount: (productId: string, discount: number) => void
  removeItem: (productId: string) => void
  
  // Calculation functions
  calculateSubtotal: () => number
  calculateTaxableAmount: () => number
  calculateTaxAmount: () => number
  calculateRoundingOff: () => number
  calculateTotal: () => number
  updateCalculations: () => void
  
  // Purchase filtering and sorting
  filterAndSortPurchases: () => void
  
  // API operations
  fetchSuppliers: () => Promise<void>
  fetchProducts: (supplierId: string, query?: string) => Promise<void>
  fetchPurchases: () => Promise<void>
  savePurchase: () => Promise<{ success: boolean; id: string } | null>
  updatePurchaseStatus: (purchaseId: string, status: CompletedPurchase['status']) => Promise<boolean>
  deletePurchase: (purchaseId: string) => Promise<boolean>
}

const initialFormState: PurchaseFormValues = {
  invoiceNo: "",
  purchaseDate: new Date(),
  supplierId: "",
  status: "pending",
  notes: "",
  items: [],
  subTotal: 0,
  discount: 0,
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
  products: [],
  selectedSupplier: null,
  purchases: [],
  filteredPurchases: [],
  purchaseForm: initialFormState,
  isLoadingSuppliers: false,
  isLoadingProducts: false,
  isLoadingPurchases: false,
  isSaving: false,
  productSearchQuery: "",
  purchaseSearchQuery: "",
  selectedStatus: "all",
  selectedSupplierFilter: "all",
  dateRange: { from: null, to: null },
  sortBy: "date",
  sortOrder: "desc",

  // Basic setters
  setSuppliers: (suppliers) => set({ suppliers }),
  setProducts: (products) => set({ products }),
  setSelectedSupplier: (selectedSupplier) => set({ selectedSupplier }),
  setPurchases: (purchases) => {
    set({ purchases })
    get().filterAndSortPurchases()
  },
  setLoadingSuppliers: (isLoadingSuppliers) => set({ isLoadingSuppliers }),
  setLoadingProducts: (isLoadingProducts) => set({ isLoadingProducts }),
  setLoadingPurchases: (isLoadingPurchases) => set({ isLoadingPurchases }),
  setSaving: (isSaving) => set({ isSaving }),
  setProductSearchQuery: (productSearchQuery) => set({ productSearchQuery }),
  setPurchaseSearchQuery: (purchaseSearchQuery) => {
    set({ purchaseSearchQuery })
    get().filterAndSortPurchases()
  },
  setSelectedStatus: (selectedStatus) => {
    set({ selectedStatus })
    get().filterAndSortPurchases()
  },
  setSelectedSupplierFilter: (selectedSupplierFilter) => {
    set({ selectedSupplierFilter })
    get().filterAndSortPurchases()
  },
  setDateRange: (dateRange) => {
    set({ dateRange })
    get().filterAndSortPurchases()
  },
  setSortBy: (sortBy) => {
    set({ sortBy })
    get().filterAndSortPurchases()
  },
  setSortOrder: (sortOrder) => {
    set({ sortOrder })
    get().filterAndSortPurchases()
  },
  clearPurchaseFilters: () => {
    set({
      purchaseSearchQuery: "",
      selectedStatus: "all",
      selectedSupplierFilter: "all",
      dateRange: { from: null, to: null },
      sortBy: "date",
      sortOrder: "desc"
    })
    get().filterAndSortPurchases()
  },

  // Form actions
  updateFormField: (field, value) => {
    set((state) => ({
      purchaseForm: {
        ...state.purchaseForm,
        [field]: value
      }
    }))
  },

  resetForm: () => {
    set({ 
      purchaseForm: { ...initialFormState, purchaseDate: new Date() },
      selectedSupplier: null,
      productSearchQuery: ""
    })
  },

  // Item management
  addProductToItems: (product: Variants) => {
    const { purchaseForm } = get()
    const existingItem = purchaseForm.items.find(item => item.id === product.id)

    if (existingItem) {
      // Update quantity if already in cart
      const updatedItems = purchaseForm.items.map(item =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * item.price * (1 - item.discount / 100)
            }
          : item
      )
      get().updateFormField('items', updatedItems)
    } else {
      // Add new item
      const newItem: PurchaseItem = {
        id: product.id,
        quantity: 1,
        price: product.price,
        discount: 0,
        total: product.price
      }
      get().updateFormField('items', [...purchaseForm.items, newItem])
    }
    // Update calculations after item changes
    get().updateCalculations()
  },

  updateItemQuantity: (productId: string, quantity: number) => {
    const { purchaseForm } = get()
    const updatedItems = purchaseForm.items.map(item =>
      item.id === productId
        ? {
            ...item,
            quantity,
            total: quantity * item.price * (1 - item.discount / 100)
          }
        : item
    )
    get().updateFormField('items', updatedItems)
    // Update calculations after item changes
    get().updateCalculations()
  },

  updateItemDiscount: (productId: string, discount: number) => {
    const { purchaseForm } = get()
    const updatedItems = purchaseForm.items.map(item =>
      item.id === productId
        ? {
            ...item,
            discount,
            total: item.quantity * item.price * (1 - (discount || 0) / 100)
          }
        : item
    )
    get().updateFormField('items', updatedItems)
    // Update calculations after item changes
    get().updateCalculations()
  },

  removeItem: (productId: string) => {
    const { purchaseForm } = get()
    const updatedItems = purchaseForm.items.filter(item => item.id !== productId)
    get().updateFormField('items', updatedItems)
    // Update calculations after item changes
    get().updateCalculations()
  },

  // Calculation functions - pure calculations without state updates
  calculateSubtotal: () => {
    const { purchaseForm } = get()
    return purchaseForm.items.reduce((total, item) => total + item.total, 0)
  },

  calculateTaxableAmount: () => {
    const subtotal = get().calculateSubtotal()
    const { purchaseForm } = get()
    return subtotal - purchaseForm.discount
  },

  calculateTaxAmount: () => {
    const taxableAmount = get().calculateTaxableAmount()
    const { purchaseForm } = get()
    
    if (purchaseForm.tax === "igst") {
      return taxableAmount * ((purchaseForm.igst || 0) / 100)
    } else {
      return taxableAmount * ((purchaseForm.cgst || 0) / 100) + 
             taxableAmount * ((purchaseForm.sgst || 0) / 100)
    }
  },

  calculateRoundingOff: () => {
    const taxableAmount = get().calculateTaxableAmount()
    const taxAmount = get().calculateTaxAmount()
    const total = taxableAmount + taxAmount
    return Math.ceil(total) - total
  },

  calculateTotal: () => {
    const taxableAmount = get().calculateTaxableAmount()
    const taxAmount = get().calculateTaxAmount()
    return Math.ceil(taxableAmount + taxAmount)
  },

  // Update calculations in store (separate from pure calculation functions)
  updateCalculations: () => {
    const state = get()
    const subTotal = state.calculateSubtotal()
    const taxableAmount = state.calculateTaxableAmount()
    const totalAmount = state.calculateTotal()
    
    set((currentState) => ({
      purchaseForm: {
        ...currentState.purchaseForm,
        subTotal,
        taxableAmount,
        totalAmount
      }
    }))
  },

  // Purchase filtering and sorting
  filterAndSortPurchases: () => {
    const { 
      purchases, 
      purchaseSearchQuery, 
      selectedStatus, 
      selectedSupplierFilter, 
      dateRange, 
      sortBy, 
      sortOrder 
    } = get()
    
    // Safety check: ensure purchases is an array
    if (!Array.isArray(purchases)) {
      console.warn('purchases is not an array:', purchases)
      set({ filteredPurchases: [] })
      return
    }
    
    let filtered = [...purchases]
    
    // Apply search filter
    if (purchaseSearchQuery.trim()) {
      const query = purchaseSearchQuery.toLowerCase()
      filtered = filtered.filter(purchase =>
        purchase.invoiceNo.toLowerCase().includes(query) ||
        purchase.supplier.name.toLowerCase().includes(query) ||
        purchase.items.some(item => 
          item.productName.toLowerCase().includes(query) ||
          item.variantName.toLowerCase().includes(query)
        )
      )
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(purchase => purchase.status === selectedStatus)
    }
    
    // Apply supplier filter
    if (selectedSupplierFilter !== 'all') {
      filtered = filtered.filter(purchase => purchase.supplier.id === selectedSupplierFilter)
    }
    
    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate)
        return purchaseDate >= dateRange.from! && purchaseDate <= dateRange.to!
      })
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.purchaseDate).getTime()
          bValue = new Date(b.purchaseDate).getTime()
          break
        case 'amount':
          aValue = a.totalAmount
          bValue = b.totalAmount
          break
        case 'invoice':
          aValue = a.invoiceNo.toLowerCase()
          bValue = b.invoiceNo.toLowerCase()
          break
        case 'supplier':
          aValue = a.supplier.name.toLowerCase()
          bValue = b.supplier.name.toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    set({ filteredPurchases: filtered })
  },

  // API operations
  fetchSuppliers: async () => {
    try {
      set({ isLoadingSuppliers: true })
      const response = await fetch("/api/getSuppliers")
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers")
      }
      const data = await response.json()
      set({ suppliers: data })
    } catch (error) {
      console.error("Error loading suppliers:", error)
      throw error
    } finally {
      set({ isLoadingSuppliers: false })
    }
  },

  fetchProducts: async (supplierId: string, query = "") => {
    try {
      set({ isLoadingProducts: true })
      const response = await fetch(`/api/getItems/${supplierId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const allProducts: Variants[] = await response.json()

      let filteredProducts = allProducts
      if (query) {
        const lowerCaseQuery = query.toLowerCase()
        filteredProducts = allProducts.filter(product =>
          product.name.toLowerCase().includes(lowerCaseQuery) ||
          product.size.toLowerCase().includes(lowerCaseQuery) ||
          product.product.name.toLowerCase().includes(lowerCaseQuery)
        )
      }

      set({ products: filteredProducts })
    } catch (error) {
      console.error("Error searching products:", error)
      throw error
    } finally {
      set({ isLoadingProducts: false })
    }
  },

  savePurchase: async () => {
    try {
      set({ isSaving: true })
      const { purchaseForm } = get()
      
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseForm),
      })

      if (!response.ok) {
        throw new Error("Failed to save purchase")
      }

      // Refresh purchases list after successful save
      await get().fetchPurchases()

      // Simulate successful response
      return {
        success: true,
        id: "PO-" + Math.floor(10000 + Math.random() * 90000)
      }
    } catch (error) {
      console.error("Error saving purchase:", error)
      throw error
    } finally {
      set({ isSaving: false })
    }
  },

  fetchPurchases: async () => {
    try {
      set({ isLoadingPurchases: true })
      const response = await fetch("/api/purchase")
      if (!response.ok) {
        throw new Error("Failed to fetch purchases")
      }
      const result = await response.json()
      // Handle the new utility function response format
      const purchases = result.success ? result.data : []
      set({ purchases: purchases || [] })
      get().filterAndSortPurchases()
    } catch (error) {
      console.error("Error loading purchases:", error)
      // Set empty array on error to prevent iteration issues
      set({ purchases: [] })
      throw error
    } finally {
      set({ isLoadingPurchases: false })
    }
  },

  updatePurchaseStatus: async (purchaseId: string, status: CompletedPurchase['status']) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Update local state
        const { purchases } = get()
        const updatedPurchases = purchases.map(purchase =>
          purchase.id === purchaseId
            ? { ...purchase, status, updatedAt: new Date() }
            : purchase
        )
        set({ purchases: updatedPurchases })
        get().filterAndSortPurchases()
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating purchase status:", error)
      return false
    }
  },

  deletePurchase: async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove from local state
        const { purchases } = get()
        const updatedPurchases = purchases.filter(purchase => purchase.id !== purchaseId)
        set({ purchases: updatedPurchases })
        get().filterAndSortPurchases()
        return true
      }
      return false
    } catch (error) {
      console.error("Error deleting purchase:", error)
      return false
    }
  },
}))
