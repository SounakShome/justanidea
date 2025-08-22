import { create } from 'zustand'
import { Supplier, Variants, PurchaseFormValues, PurchaseItem } from "@/types/addPurchases"

interface PurchaseState {
  // Data
  suppliers: Supplier[]
  products: Variants[]
  selectedSupplier: Supplier | null
  
  // Form state
  purchaseForm: PurchaseFormValues
  
  // Loading states
  isLoadingSuppliers: boolean
  isLoadingProducts: boolean
  isSaving: boolean
  
  // Search state
  productSearchQuery: string
  
  // Actions
  setSuppliers: (suppliers: Supplier[]) => void
  setProducts: (products: Variants[]) => void
  setSelectedSupplier: (supplier: Supplier | null) => void
  setLoadingSuppliers: (loading: boolean) => void
  setLoadingProducts: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setProductSearchQuery: (query: string) => void
  
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
  
  // API operations
  fetchSuppliers: () => Promise<void>
  fetchProducts: (supplierId: string, query?: string) => Promise<void>
  savePurchase: () => Promise<{ success: boolean; id: string } | null>
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
  purchaseForm: initialFormState,
  isLoadingSuppliers: false,
  isLoadingProducts: false,
  isSaving: false,
  productSearchQuery: "",

  // Basic setters
  setSuppliers: (suppliers) => set({ suppliers }),
  setProducts: (products) => set({ products }),
  setSelectedSupplier: (selectedSupplier) => set({ selectedSupplier }),
  setLoadingSuppliers: (isLoadingSuppliers) => set({ isLoadingSuppliers }),
  setLoadingProducts: (isLoadingProducts) => set({ isLoadingProducts }),
  setSaving: (isSaving) => set({ isSaving }),
  setProductSearchQuery: (productSearchQuery) => set({ productSearchQuery }),

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
}))
