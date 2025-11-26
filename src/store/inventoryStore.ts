import { create } from 'zustand'
import { Product, ExtendedVariant } from "@/types/inventory"

interface InventoryState {
  // Data
  products: Product[]
  filteredProducts: Product[]
  isLoading: boolean
  
  // Search & Filter controls
  searchQuery: string
  selectedCategory: string
  sortBy: 'name' | 'price' | 'stock'
  sortOrder: 'asc' | 'desc'
  
  // Actions
  setProducts: (products: Product[]) => void
  setLoading: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  setSortBy: (sortBy: 'name' | 'price' | 'stock') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  clearFilters: () => void
  
  // CRUD operations
  updateVariant: (variantId: string, updates: Partial<ExtendedVariant>) => Promise<boolean>
  deleteVariant: (variantId: string) => Promise<boolean>
  updateVariantStock: (variantId: string, newStock: number) => Promise<boolean>
  refreshProducts: () => Promise<void>
  
  // Computed actions
  filterAndSortProducts: () => void
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  products: [],
  filteredProducts: [],
  isLoading: false,
  searchQuery: '',
  selectedCategory: 'all',
  sortBy: 'name',
  sortOrder: 'asc',

  // Basic actions
  setProducts: (products) => {
    set({ products })
    get().filterAndSortProducts() // Auto-filter when products change
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // Search & Filter actions
  setSearchQuery: (searchQuery) => {
    set({ searchQuery })
    get().filterAndSortProducts()
  },
  
  setSelectedCategory: (selectedCategory) => {
    set({ selectedCategory })
    get().filterAndSortProducts()
  },
  
  setSortBy: (sortBy) => {
    set({ sortBy })
    get().filterAndSortProducts()
  },
  
  setSortOrder: (sortOrder) => {
    set({ sortOrder })
    get().filterAndSortProducts()
  },
  
  clearFilters: () => {
    set({
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    })
    get().filterAndSortProducts()
  },
  
  // CRUD operations
  updateVariant: async (variantId: string, updates: Partial<ExtendedVariant>) => {
    try {
      const response = await fetch(`/api/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        // Refresh products to get updated data
        await get().refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating variant:', error);
      return false;
    }
  },

  deleteVariant: async (variantId: string) => {
    try {
      const response = await fetch(`/api/variants/${variantId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh products to get updated data
        await get().refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting variant:', error);
      return false;
    }
  },

  updateVariantStock: async (variantId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/variants/${variantId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      
      if (response.ok) {
        // Refresh products to get updated data
        await get().refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  },

  refreshProducts: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/products');
      const data = await response.json();
      set({ products: data || [] });
      get().filterAndSortProducts();
    } catch (error) {
      console.error('Error refreshing products:', error);
      set({ products: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Main filtering and sorting logic
  filterAndSortProducts: () => {
    const { products, searchQuery, selectedCategory, sortBy, sortOrder } = get()
    
    let filtered = [...products]
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.variants?.some(variant => 
          variant.name.toLowerCase().includes(query) ||
          variant.barcode?.toLowerCase().includes(query)
        )
      )
    }
    
    // Apply category filter (based on HSN or can be disabled)
    if (selectedCategory !== 'all') {
      // You can customize this based on your needs:
      // Option 1: Filter by HSN ranges (if HSN represents categories)
      // Option 2: Filter by product name patterns
      // Option 3: Add category field to your Product type later
      
      // For now, let's filter by HSN ranges as categories
      const categoryHSN = parseInt(selectedCategory)
      if (!isNaN(categoryHSN)) {
        filtered = filtered.filter(product => 
          Math.floor(product.HSN / 1000) === Math.floor(categoryHSN / 1000)
        )
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'price':
          // Get minimum price from all variant sizes
          const aPrices = a.variants?.flatMap(v => {
            const sizes = Array.isArray(v.sizes) ? v.sizes : [];
            return sizes.map(s => s.buyingPrice) || [];
          }) || [0];
          const bPrices = b.variants?.flatMap(v => {
            const sizes = Array.isArray(v.sizes) ? v.sizes : [];
            return sizes.map(s => s.buyingPrice) || [];
          }) || [0];
          aValue = Math.min(...aPrices)
          bValue = Math.min(...bPrices)
          break
        case 'stock':
          // Get total stock from all variant sizes
          aValue = a.variants?.reduce((sum, v) => {
            const sizes = Array.isArray(v.sizes) ? v.sizes : [];
            return sum + sizes.reduce((s, sz) => s + sz.stock, 0);
          }, 0) || 0;
          bValue = b.variants?.reduce((sum, v) => {
            const sizes = Array.isArray(v.sizes) ? v.sizes : [];
            return sum + sizes.reduce((s, sz) => s + sz.stock, 0);
          }, 0) || 0;
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
    
    set({ filteredProducts: filtered })
  },
}))