import { create } from 'zustand'

interface Product {
  id: string
  name: string
  price: number
  // Add properties based on your Prisma Product model
}

interface InventoryState {
  products: Product[]
  selectedProduct: Product | null
  isLoading: boolean
  searchQuery: string
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  removeProduct: (id: string) => void
  setProducts: (products: Product[]) => void
  setSelectedProduct: (product: Product | null) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  searchQuery: '',
  addProduct: (product) => 
    set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
  removeProduct: (id) =>
    set((state) => ({ products: state.products.filter(p => p.id !== id) })),
  setProducts: (products) => set({ products }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
}))