"use client";

import { useState, useEffect } from 'react';
import { Search, Package, PlusCircle, TrendingDown, Edit, Trash2, Eye, Plus, Filter, X, BarChart3, AlertTriangle, ChevronDown } from 'lucide-react';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ExtendedVariant, Product } from "@/types/inventory";
import { useInventoryStore } from '@/store';
import { CompactBarcodeScanner } from "@/components/CompactBarcodeScanner";

export default function InventoryPage() {
    const { 
        products, 
        filteredProducts, 
        isLoading, 
        searchQuery, 
        selectedCategory, 
        sortBy, 
        sortOrder, 
        setSearchQuery, 
        setSelectedCategory, 
        setSortBy, 
        setSortOrder, 
        clearFilters,
        updateVariant,
        deleteVariant,
        updateVariantStock,
        refreshProducts
    } = useInventoryStore();

    // Modal states
    const [editingVariant, setEditingVariant] = useState<ExtendedVariant | null>(null);
    const [viewingVariant, setViewingVariant] = useState<ExtendedVariant | null>(null);
    const [deletingVariant, setDeletingVariant] = useState<ExtendedVariant | null>(null);
    const [stockUpdateVariant, setStockUpdateVariant] = useState<ExtendedVariant | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // Edit form state - for editing variant details and sizes
    const [editForm, setEditForm] = useState({
        name: '',
        barcode: '',
        sizes: [] as Array<{ size: string; buyingPrice: string; sellingPrice: string; stock: string }>
    });
    
    // Stock update state - for updating specific size stock
    const [stockUpdate, setStockUpdate] = useState({
        selectedSize: '',
        newStock: 0,
        operation: 'set' as 'add' | 'subtract' | 'set'
    });
    
    // Confirmation modal for large stock changes
    const [showStockConfirmation, setShowStockConfirmation] = useState(false);
    const [pendingStockUpdate, setPendingStockUpdate] = useState<{
        variant: ExtendedVariant;
        size: string;
        oldStock: number;
        newStock: number;
        operation: string;
    } | null>(null);
    
    // Product edit state
    const [editingProduct, setEditingProduct] = useState<{
        id: string;
        name: string;
        HSN: number;
    } | null>(null);
    const [productEditForm, setProductEditForm] = useState({
        name: '',
        HSN: ''
    });

    // Action handlers
    const handleEdit = (variant: ExtendedVariant) => {
        setEditingVariant(variant);
        setEditForm({
            name: variant.name || '',
            barcode: variant.barcode || '',
            sizes: variant.sizes?.map(s => ({
                size: s.size,
                buyingPrice: String(s.buyingPrice),
                sellingPrice: String(s.sellingPrice),
                stock: String(s.stock)
            })) || []
        });
    };

    const handleView = (variant: ExtendedVariant) => {
        setViewingVariant(variant);
    };

    const handleDelete = (variant: ExtendedVariant) => {
        setDeletingVariant(variant);
    };

    const handleStockUpdate = (variant: ExtendedVariant) => {
        setStockUpdateVariant(variant);
        setStockUpdate({
            selectedSize: variant.sizes?.[0]?.size || '',
            newStock: 0,
            operation: 'set'
        });
    };

    const confirmEdit = async () => {
        if (!editingVariant) return;
        
        try {
            // Client-side validation
            if (!editForm.name || editForm.name.trim().length === 0) {
                toast.error("Variant code is required");
                return;
            }

            if (editForm.sizes.length === 0) {
                toast.error("At least one size is required");
                return;
            }

            // Validate each size
            for (const size of editForm.sizes) {
                if (!size.size || size.size.trim().length === 0) {
                    toast.error("All sizes must have a name");
                    return;
                }
                
                const buyingPrice = parseFloat(size.buyingPrice);
                const sellingPrice = parseFloat(size.sellingPrice);
                const stock = parseInt(size.stock);

                if (isNaN(buyingPrice) || buyingPrice < 0) {
                    toast.error(`Invalid buying price for size ${size.size}`);
                    return;
                }

                if (isNaN(sellingPrice) || sellingPrice < 0) {
                    toast.error(`Invalid selling price for size ${size.size}`);
                    return;
                }

                if (isNaN(stock) || stock < 0) {
                    toast.error(`Invalid stock for size ${size.size}`);
                    return;
                }
            }

            // Check for duplicate sizes
            const sizeNames = editForm.sizes.map(s => s.size.trim().toLowerCase());
            const uniqueSizes = new Set(sizeNames);
            if (sizeNames.length !== uniqueSizes.size) {
                toast.error("Duplicate sizes are not allowed");
                return;
            }

            // Convert sizes back to proper format
            const sizesData = editForm.sizes.map(s => ({
                size: s.size.trim(),
                buyingPrice: parseFloat(s.buyingPrice),
                sellingPrice: parseFloat(s.sellingPrice),
                stock: parseInt(s.stock)
            }));

            const response = await fetch(`/api/variants/${editingVariant.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editForm.name.trim(),
                    barcode: editForm.barcode?.trim() || null,
                    sizes: sizesData
                })
            });

            if (response.ok) {
                await refreshProducts();
                setEditingVariant(null);
                toast.success("Variant updated successfully");
            } else {
                const error = await response.json();
                toast.error(error.error || "Error updating variant");
            }
        } catch (error) {
            console.error('Error updating variant:', error);
            toast.error("Error updating variant");
        }
    };

    const confirmDelete = async () => {
        if (!deletingVariant) return;
        
        const success = await deleteVariant(deletingVariant.id);
        if (success) {
            setDeletingVariant(null);
            toast.success("Variant deleted successfully");
        } else {
            toast.error("Error deleting variant");
        }
    };

    const confirmStockUpdate = async () => {
        if (!stockUpdateVariant || !stockUpdate.selectedSize) {
            toast.error("Please select a size");
            return;
        }

        try {
            const currentSize = stockUpdateVariant.sizes?.find(s => s.size === stockUpdate.selectedSize);
            if (!currentSize) {
                toast.error("Size not found");
                return;
            }

            let newStockValue = stockUpdate.newStock;
            if (stockUpdate.operation === 'add') {
                newStockValue = currentSize.stock + stockUpdate.newStock;
            } else if (stockUpdate.operation === 'subtract') {
                newStockValue = Math.max(0, currentSize.stock - stockUpdate.newStock);
            }

            // Check for large stock changes (>100 units or >50% change)
            const stockDifference = Math.abs(newStockValue - currentSize.stock);
            const percentageChange = currentSize.stock > 0 
                ? (stockDifference / currentSize.stock) * 100 
                : 100;
            
            const isLargeChange = stockDifference > 100 || percentageChange > 50;

            if (isLargeChange && !showStockConfirmation) {
                // Show confirmation modal for large changes
                setPendingStockUpdate({
                    variant: stockUpdateVariant,
                    size: stockUpdate.selectedSize,
                    oldStock: currentSize.stock,
                    newStock: newStockValue,
                    operation: stockUpdate.operation
                });
                setShowStockConfirmation(true);
                return;
            }

            // Proceed with stock update
            await performStockUpdate(stockUpdateVariant, stockUpdate.selectedSize, newStockValue);
            
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error("Error updating stock");
        }
    };

    const performStockUpdate = async (variant: ExtendedVariant, size: string, newStockValue: number) => {
        try {
            // Update the specific size's stock
            const updatedSizes = variant.sizes?.map(s => 
                s.size === size 
                    ? { ...s, stock: newStockValue }
                    : s
            ) || [];

            const response = await fetch(`/api/variants/${variant.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sizes: updatedSizes
                })
            });

            if (response.ok) {
                await refreshProducts();
                setStockUpdateVariant(null);
                setShowStockConfirmation(false);
                setPendingStockUpdate(null);
                toast.success(`Stock updated for size ${size}`);
            } else {
                const error = await response.json();
                toast.error(error.error || "Error updating stock");
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error("Error updating stock");
        }
    };

    const confirmLargeStockChange = async () => {
        if (!pendingStockUpdate) return;
        
        await performStockUpdate(
            pendingStockUpdate.variant,
            pendingStockUpdate.size,
            pendingStockUpdate.newStock
        );
    };

    const handleEditProduct = (variant: ExtendedVariant) => {
        setEditingProduct({
            id: variant.productId,
            name: variant.productName || '',
            HSN: variant.HSN || 0
        });
        setProductEditForm({
            name: variant.productName || '',
            HSN: String(variant.HSN || '')
        });
    };

    const confirmProductEdit = async () => {
        if (!editingProduct) return;

        try {
            // Client-side validation
            if (!productEditForm.name || productEditForm.name.trim().length === 0) {
                toast.error("Product name is required");
                return;
            }

            const hsn = parseInt(productEditForm.HSN);
            if (isNaN(hsn) || hsn < 0) {
                toast.error("Valid HSN code is required");
                return;
            }

            const response = await fetch(`/api/products/${editingProduct.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: productEditForm.name.trim(),
                    HSN: hsn
                })
            });

            if (response.ok) {
                await refreshProducts();
                setEditingProduct(null);
                toast.success("Product updated successfully");
            } else {
                const error = await response.json();
                toast.error(error.error || "Error updating product");
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error("Error updating product");
        }
    };

    const handleBarcodeScanned = (code: string) => {
        // Use the barcode as search query to find matching products
        setSearchQuery(code);
    };

    // Fetch inventory items on component mount
    useEffect(() => {
        refreshProducts();
    }, [refreshProducts]);

    // Flatten filtered products and variants for display
    const allVariants = filteredProducts?.flatMap(product => 
        product.variants?.map(variant => {
            // Ensure sizes is always an array
            let sizes = variant.sizes;
            if (typeof sizes === 'string') {
                try {
                    sizes = JSON.parse(sizes);
                } catch (e) {
                    sizes = [];
                }
            }
            if (!Array.isArray(sizes)) {
                sizes = [];
            }
            return {
                ...variant,
                sizes,
                productName: product.name,
                productId: product.id,
                HSN: product.HSN,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };
        }) || []
    ) || [];

    // Calculate statistics
    const totalProducts = products?.length || 0;
    const allProductVariants = products?.flatMap(product => 
        product.variants?.map(variant => {
            // Ensure sizes is always an array
            let sizes = variant.sizes;
            if (typeof sizes === 'string') {
                try {
                    sizes = JSON.parse(sizes);
                } catch (e) {
                    sizes = [];
                }
            }
            if (!Array.isArray(sizes)) {
                sizes = [];
            }
            return { ...variant, HSN: product.HSN, sizes };
        }) || []
    ) || [];
    // Count low stock items across all variant sizes
    const lowStockItems = allProductVariants.reduce((count, variant) => {
        const lowSizes = Array.isArray(variant.sizes) 
            ? variant.sizes.filter(size => size.stock < 10).length 
            : 0;
        return count + lowSizes;
    }, 0);

    return (
        <>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                <div className="px-3 sm:px-6">
                    <SiteHeader name="Inventory" />
                </div>
            </div>

            <div className="min-h-screen bg-muted/30">
                <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4">
                    
                    {/* Stats Overview - Horizontal Scroll on Mobile */}
                    <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-2">
                        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-max sm:min-w-0">
                            <Card className="shrink-0 w-[280px] sm:w-auto bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Total Variants</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{allVariants.length}</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Items in stock</p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                                            <Package className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shrink-0 w-[280px] sm:w-auto bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Products</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{totalProducts}</p>
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Unique items</p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                                            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-300" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shrink-0 w-[280px] sm:w-auto sm:col-span-2 lg:col-span-1 bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">Low Stock Alert</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">{lowStockItems}</p>
                                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Below 10 units</p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center">
                                            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Search Bar with Integrated Filters */}
                    <Card className="shadow-sm">
                        <CardContent className="p-3 sm:p-4">
                            <div className="space-y-3">
                                {/* Search Input with Actions */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            placeholder="Search products, variants, or barcode..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-9 h-11 text-base"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="shrink-0">
                                        <CompactBarcodeScanner 
                                            onScanSuccessAction={handleBarcodeScanned}
                                            buttonText=""
                                            buttonVariant="outline"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button 
                                        variant={showFilters ? "default" : "outline"}
                                        className="flex-1 sm:flex-none h-11 relative"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        <span>Filters</span>
                                        {(selectedCategory !== 'all' || sortBy !== 'name') && (
                                            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                                {(selectedCategory !== 'all' ? 1 : 0) + (sortBy !== 'name' ? 1 : 0)}
                                            </Badge>
                                        )}
                                        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                    </Button>
                                    <Button className="flex-1 sm:flex-none h-11">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        <span>Add Item</span>
                                    </Button>
                                </div>

                                {/* Collapsible Filters */}
                                {showFilters && (
                                    <div className="pt-3 border-t space-y-3 animate-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs font-medium mb-2 block text-muted-foreground">Category</Label>
                                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                    <SelectTrigger className="h-10 w-full">
                                                        <SelectValue placeholder="All Categories" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Categories</SelectItem>
                                                        <SelectItem value="1000">Textiles (1000+)</SelectItem>
                                                        <SelectItem value="2000">Food Products (2000+)</SelectItem>
                                                        <SelectItem value="3000">Electronics (3000+)</SelectItem>
                                                        <SelectItem value="4000">Machinery (4000+)</SelectItem>
                                                        <SelectItem value="5000">Chemicals (5000+)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium mb-2 block text-muted-foreground">Sort By</Label>
                                                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                                                    const [field, order] = value.split('-') as ['name' | 'price' | 'stock', 'asc' | 'desc'];
                                                    setSortBy(field);
                                                    setSortOrder(order);
                                                }}>
                                                    <SelectTrigger className="h-10 w-full">
                                                        <SelectValue placeholder="Sort by" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                                                        <SelectItem value="name-desc">Name Z-A</SelectItem>
                                                        <SelectItem value="price-asc">Price Low-High</SelectItem>
                                                        <SelectItem value="price-desc">Price High-Low</SelectItem>
                                                        <SelectItem value="stock-asc">Stock Low-High</SelectItem>
                                                        <SelectItem value="stock-desc">Stock High-Low</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {(searchQuery || selectedCategory !== 'all' || sortBy !== 'name') && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={clearFilters}
                                                className="w-full h-9 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Clear All Filters
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results Summary */}
                    {!isLoading && (
                        <div className="flex items-center justify-between px-1">
                            <p className="text-sm text-muted-foreground font-medium">
                                {allVariants.length} variant{allVariants.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    )}

                    {/* Product List */}
                    {isLoading ? (
                        <Card className="shadow-sm">
                            <CardContent className="py-16">
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Package className="h-8 w-8 text-primary animate-pulse" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">Loading inventory...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : allVariants.length > 0 ? (
                        <div className="space-y-3">
                            {/* Mobile Card View */}
                            {allVariants.map((variant: ExtendedVariant) => {
                                const totalStock = variant.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
                                const hasLowStock = variant.sizes?.some(size => size.stock < 10) || false;
                                
                                return (
                                <Card key={variant.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <CardContent className="p-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base truncate mb-0.5">
                                                    {variant.productName || 'Unknown Product'}
                                                </h3>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {variant.name || 'Unknown Variant'}
                                                </p>
                                            </div>
                                            <div className="flex gap-1.5 shrink-0">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-9 w-9 p-0 hover:bg-primary/10"
                                                    onClick={() => handleView(variant)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-9 w-9 p-0 hover:bg-primary/10"
                                                    onClick={() => handleEdit(variant)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground font-medium">HSN Code</p>
                                                <p className="text-sm font-mono font-semibold">{variant.HSN || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground font-medium">Total Stock</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold">{totalStock}</p>
                                                    {hasLowStock && (
                                                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                                                            <TrendingDown className="h-2.5 w-2.5 mr-1" />
                                                            Low
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sizes List */}
                                        <div className="space-y-2 mb-3">
                                            <p className="text-xs text-muted-foreground font-medium">Sizes ({variant.sizes?.length || 0})</p>
                                            {variant.sizes && variant.sizes.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {variant.sizes.map((sizeData, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded-md text-xs">
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="outline" className="font-semibold">{sizeData.size}</Badge>
                                                                <span className="text-muted-foreground">Buy: ₹{sizeData.buyingPrice}</span>
                                                                <span className="text-muted-foreground">Sell: ₹{sizeData.sellingPrice}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">Qty: {sizeData.stock}</span>
                                                                {sizeData.stock < 10 && (
                                                                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No sizes available</p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 h-10 font-medium"
                                                onClick={() => handleStockUpdate(variant)}
                                            >
                                                <Plus className="h-4 w-4 mr-1.5" />
                                                Update Stock
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-10 px-4 text-destructive hover:bg-destructive hover:text-destructive-foreground font-medium"
                                                onClick={() => handleDelete(variant)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Footer */}
                                        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                                            Added {variant.createdAt ? new Date(variant.createdAt).toLocaleDateString('en-IN', { 
                                                day: 'numeric', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            }) : 'Unknown'}
                                        </p>
                                    </CardContent>
                                </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="shadow-sm">
                            <CardContent className="py-16">
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Search className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">No variants found</h3>
                                    <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filters</p>
                                    {(searchQuery || selectedCategory !== 'all') && (
                                        <Button 
                                            variant="outline" 
                                            onClick={clearFilters}
                                            className="mt-2"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Edit Modal - Redesigned */}
            <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-[1000px] max-h-[95vh] overflow-hidden flex flex-col p-0">
                    {/* Header */}
                    <div className="px-6 py-4 border-b bg-linear-to-r from-background to-muted/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl font-bold mb-1">Edit Variant</DialogTitle>
                                {editingVariant && (
                                    <p className="text-sm text-muted-foreground">
                                        {editingVariant.productName} • HSN: {editingVariant.HSN}
                                    </p>
                                )}
                            </div>
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                {editForm.sizes.length} Sizes
                            </Badge>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        {/* Variant Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-sm font-medium">
                                    Variant Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., BOYLEG, V-NECK"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-barcode" className="text-sm font-medium">
                                    Barcode
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="edit-barcode"
                                        value={editForm.barcode}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, barcode: e.target.value }))}
                                        placeholder="Scan or enter"
                                        className="h-10 flex-1"
                                    />
                                    <CompactBarcodeScanner 
                                        onScanSuccessAction={(code) => setEditForm(prev => ({ ...prev, barcode: code }))}
                                        buttonText=""
                                        buttonVariant="outline"
                                        buttonSize="default"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sizes Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Sizes & Stock</h3>
                                    <p className="text-sm text-muted-foreground">Manage pricing and inventory per size</p>
                                </div>
                                <Button 
                                    type="button"
                                    onClick={() => setEditForm(prev => ({
                                        ...prev,
                                        sizes: [...prev.sizes, { size: '', buyingPrice: '0', sellingPrice: '0', stock: '0' }]
                                    }))}
                                    size="sm"
                                    className="h-9"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Size
                                </Button>
                            </div>

                            {/* Desktop: Grid Layout */}
                            <div className="hidden sm:block space-y-3">
                                {editForm.sizes.length === 0 ? (
                                    <div className="border-2 border-dashed rounded-lg py-16 text-center">
                                        <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                        <p className="text-muted-foreground">No sizes added yet</p>
                                        <p className="text-sm text-muted-foreground">Click "Add Size" to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Header */}
                                        <div className="grid grid-cols-[1fr_275px__140px_140px_140px_50px] gap-3 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium">
                                            <div>Sizes</div>
                                            <div className='text-center'>Stock</div>
                                            <div className="text-right">Cost (₹)</div>
                                            <div className="text-right">Price (₹)</div>
                                            <div className="text-right">Margin</div>
                                            <div></div>
                                        </div>
                                        
                                        {/* Rows - Grouped by Price */}
                                        {(() => {
                                            // Group sizes by buying and selling price
                                            const priceGroups = new Map<string, typeof editForm.sizes>();
                                            editForm.sizes.forEach(size => {
                                                const key = `${size.buyingPrice}-${size.sellingPrice}`;
                                                if (!priceGroups.has(key)) {
                                                    priceGroups.set(key, []);
                                                }
                                                priceGroups.get(key)!.push(size);
                                            });

                                            return Array.from(priceGroups.entries()).map(([priceKey, groupSizes], groupIdx) => {
                                                const buyingPrice = parseFloat(groupSizes[0].buyingPrice) || 0;
                                                const sellingPrice = parseFloat(groupSizes[0].sellingPrice) || 0;
                                                const margin = buyingPrice > 0 
                                                    ? (((sellingPrice - buyingPrice) / buyingPrice) * 100).toFixed(0)
                                                    : '0';
                                                
                                                return (
                                                    <div 
                                                        key={groupIdx} 
                                                        className="grid grid-cols-[1fr_140px_140px_140px_50px] gap-3 px-4 py-3 border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-all items-center group"
                                                    >
                                                        {/* Sizes Column - Multiple sizes with same price */}
                                                        <div className="space-y-2 py-1">
                                                            {groupSizes.map((sizeData, idx) => {
                                                                const originalIdx = editForm.sizes.indexOf(sizeData);
                                                                
                                                                return (
                                                                    <div key={idx} className="flex items-center gap-2">
                                                                        <Input
                                                                            value={sizeData.size}
                                                                            onChange={(e) => {
                                                                                const newSizes = [...editForm.sizes];
                                                                                newSizes[originalIdx].size = e.target.value;
                                                                                setEditForm(prev => ({ ...prev, sizes: newSizes }));
                                                                            }}
                                                                            placeholder="XL"
                                                                            className="h-10 w-24 text-center font-semibold"
                                                                        />
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={sizeData.stock}
                                                                            onChange={(e) => {
                                                                                const newSizes = [...editForm.sizes];
                                                                                newSizes[originalIdx].stock = e.target.value;
                                                                                setEditForm(prev => ({ ...prev, sizes: newSizes }));
                                                                            }}
                                                                            className="h-10 flex-1 text-center font-semibold"
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Buying Price - Shared for all sizes in group */}
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={groupSizes[0].buyingPrice}
                                                            onChange={(e) => {
                                                                const newSizes = [...editForm.sizes];
                                                                groupSizes.forEach(sizeData => {
                                                                    const idx = newSizes.indexOf(sizeData);
                                                                    if (idx !== -1) {
                                                                        newSizes[idx].buyingPrice = e.target.value;
                                                                    }
                                                                });
                                                                setEditForm(prev => ({ ...prev, sizes: newSizes }));
                                                            }}
                                                            className="h-10 text-right"
                                                        />
                                                        
                                                        {/* Selling Price - Shared for all sizes in group */}
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={groupSizes[0].sellingPrice}
                                                            onChange={(e) => {
                                                                const newSizes = [...editForm.sizes];
                                                                groupSizes.forEach(sizeData => {
                                                                    const idx = newSizes.indexOf(sizeData);
                                                                    if (idx !== -1) {
                                                                        newSizes[idx].sellingPrice = e.target.value;
                                                                    }
                                                                });
                                                                setEditForm(prev => ({ ...prev, sizes: newSizes }));
                                                            }}
                                                            className="h-10 text-right"
                                                        />
                                                        
                                                        {/* Margin */}
                                                        <div className="flex items-center justify-end">
                                                            <Badge 
                                                                variant={parseFloat(margin) > 0 ? "default" : "secondary"}
                                                                className="font-mono"
                                                            >
                                                                {parseFloat(margin) > 0 ? '+' : ''}{margin}%
                                                            </Badge>
                                                        </div>
                                                        
                                                        {/* Delete Buttons Column */}
                                                        <div className="space-y-2 py-1">
                                                            {groupSizes.map((sizeData, idx) => {
                                                                const originalIdx = editForm.sizes.indexOf(sizeData);
                                                                
                                                                return (
                                                                    <div key={idx} className="flex items-center justify-center h-10">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => setEditForm(prev => ({
                                                                                ...prev,
                                                                                sizes: prev.sizes.filter((_, i) => i !== originalIdx)
                                                                            }))}
                                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Mobile: Card Layout */}
                            <div className="sm:hidden space-y-3">
                                {editForm.sizes.length === 0 ? (
                                    <div className="border-2 border-dashed rounded-lg py-12 text-center">
                                        <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                                        <p className="text-sm text-muted-foreground">No sizes added yet</p>
                                    </div>
                                ) : (
                                    (() => {
                                        // Group sizes by buying and selling price
                                        const priceGroups = new Map<string, typeof editForm.sizes>();
                                        editForm.sizes.forEach(size => {
                                            const key = `${size.buyingPrice}-${size.sellingPrice}`;
                                            if (!priceGroups.has(key)) {
                                                priceGroups.set(key, []);
                                            }
                                            priceGroups.get(key)!.push(size);
                                        });

                                        return Array.from(priceGroups.entries()).map(([priceKey, groupSizes], groupIdx) => {
                                            const buyingPrice = parseFloat(groupSizes[0].buyingPrice) || 0;
                                            const sellingPrice = parseFloat(groupSizes[0].sellingPrice) || 0;
                                            const margin = buyingPrice > 0 
                                                ? (((sellingPrice - buyingPrice) / buyingPrice) * 100).toFixed(0)
                                                : '0';
                                            
                                            return (
                                                <Card key={groupIdx} className="overflow-hidden">
                                                    {/* Pricing Header */}
                                                    <div className="px-4 py-3 bg-muted/30 border-b">
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs font-medium text-muted-foreground">Price Group</div>
                                                            <Badge 
                                                                variant={parseFloat(margin) > 0 ? "default" : "secondary"}
                                                                className="font-mono"
                                                            >
                                                                {parseFloat(margin) > 0 ? '+' : ''}{margin}%
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                                            <div>
                                                                <Label className="text-xs font-medium text-muted-foreground mb-1 block">Cost (₹)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={groupSizes[0].buyingPrice}
                                                                    onChange={(e) => {
                                                                        const newSizes = [...editForm.sizes];
                                                                        groupSizes.forEach(sizeData => {
                                                                            const idx = newSizes.indexOf(sizeData);
                                                                            if (idx !== -1) {
                                                                                newSizes[idx].buyingPrice = e.target.value;
                                                                            }
                                                                        });
                                                                        setEditForm(prev => ({ ...prev, sizes: newSizes }));
                                                                    }}
                                                                    className="h-9 text-right font-medium"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs font-medium text-muted-foreground mb-1 block">Price (₹)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={groupSizes[0].sellingPrice}
                                                                    onChange={(e) => {
                                                                        const newSizes = [...editForm.sizes];
                                                                        groupSizes.forEach(sizeData => {
                                                                            const idx = newSizes.indexOf(sizeData);
                                                                            if (idx !== -1) {
                                                                                newSizes[idx].sellingPrice = e.target.value;
                                                                            }
                                                                        });
                                                                        setEditForm(prev => ({ ...prev, sizes: newSizes }));
                                                                    }}
                                                                    className="h-9 text-right font-medium"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Sizes in this price group */}
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b">
                                                            <div>
                                                                <Label className="text-xs font-medium text-muted-foreground">Sizes & Stock</Label>
                                                            </div>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {groupSizes.length} size{groupSizes.length !== 1 ? 's' : ''}
                                                            </Badge>
                                                        </div>
                                                        {groupSizes.map((sizeData, idx) => {
                                                            const originalIdx = editForm.sizes.indexOf(sizeData);
                                                            
                                                            return (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <Input
                                                                        value={sizeData.size}
                                                                        onChange={(e) => {
                                                                            const newSizes = [...editForm.sizes];
                                                                            newSizes[originalIdx].size = e.target.value;
                                                                            setEditForm(prev => ({ ...prev, sizes: newSizes }));
                                                                        }}
                                                                        placeholder="XL"
                                                                        className="h-10 w-20 text-center font-semibold"
                                                                    />
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        value={sizeData.stock}
                                                                        onChange={(e) => {
                                                                            const newSizes = [...editForm.sizes];
                                                                            newSizes[originalIdx].stock = e.target.value;
                                                                            setEditForm(prev => ({ ...prev, sizes: newSizes }));
                                                                        }}
                                                                        placeholder="Stock"
                                                                        className="h-10 flex-1 text-center font-semibold"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => setEditForm(prev => ({
                                                                            ...prev,
                                                                            sizes: prev.sizes.filter((_, i) => i !== originalIdx)
                                                                        }))}
                                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </Card>
                                            );
                                        });
                                    })()
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t bg-muted/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Total Stock:</span>
                                    <span className="ml-2 font-bold">
                                        {editForm.sizes.reduce((sum, s) => sum + (parseInt(s.stock) || 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Avg Margin:</span>
                                    <span className="ml-2 font-bold">
                                        {editForm.sizes.length > 0
                                            ? ((editForm.sizes.reduce((sum, s) => {
                                                const bp = parseFloat(s.buyingPrice) || 0;
                                                const sp = parseFloat(s.sellingPrice) || 0;
                                                return sum + (bp > 0 ? ((sp - bp) / bp) * 100 : 0);
                                            }, 0) / editForm.sizes.length).toFixed(1))
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setEditingVariant(null)}
                                    className="flex-1 sm:flex-none sm:w-24"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={confirmEdit}
                                    disabled={editForm.sizes.length === 0 || !editForm.name.trim()}
                                    className="flex-1 sm:flex-none sm:w-32"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={!!viewingVariant} onOpenChange={() => setViewingVariant(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Variant Details</DialogTitle>
                    </DialogHeader>
                    {viewingVariant && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Product Name</Label>
                                    <p className="text-sm font-medium mt-1">{viewingVariant.productName}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Variant Name</Label>
                                    <p className="text-sm font-medium mt-1">{viewingVariant.name}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">HSN Code</Label>
                                    <p className="text-sm font-medium mt-1">{viewingVariant.HSN}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Barcode</Label>
                                    <p className="text-sm font-medium mt-1">{viewingVariant.barcode || 'N/A'}</p>
                                </div>
                                <div className="col-span-full">
                                    <Label className="text-xs text-muted-foreground">Created</Label>
                                    <p className="text-sm font-medium mt-1">{new Date(viewingVariant.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="col-span-full">
                                    <Label className="text-xs text-muted-foreground">Updated</Label>
                                    <p className="text-sm font-medium mt-1">{new Date(viewingVariant.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Sizes Table */}
                            <div className="border-t pt-4">
                                <Label className="text-xs text-muted-foreground mb-2 block">Sizes</Label>
                                <div className="space-y-2">
                                    {viewingVariant.sizes && viewingVariant.sizes.length > 0 ? (
                                        viewingVariant.sizes.map((sizeData, idx) => (
                                            <div key={idx} className="grid grid-cols-4 gap-2 p-2 bg-muted/30 rounded-md text-xs">
                                                <div>
                                                    <span className="text-muted-foreground block">Size</span>
                                                    <span className="font-semibold">{sizeData.size}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Buy</span>
                                                    <span className="font-semibold">₹{sizeData.buyingPrice}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Sell</span>
                                                    <span className="font-semibold">₹{sizeData.sellingPrice}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Stock</span>
                                                    <span className="font-semibold">{sizeData.stock}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No sizes available</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={() => setViewingVariant(null)} className="w-full sm:w-auto h-10">
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingVariant} onOpenChange={() => setDeletingVariant(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Delete Variant</DialogTitle>
                    </DialogHeader>
                    {deletingVariant && (
                        <div className="space-y-4">
                            <p className="text-sm">
                                Are you sure you want to delete the variant <strong>{deletingVariant.name}</strong> 
                                from product <strong>{deletingVariant.productName}</strong>?
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone.
                            </p>
                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                                <Button variant="outline" onClick={() => setDeletingVariant(null)} className="w-full sm:w-auto h-10">
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete} className="w-full sm:w-auto h-10">
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Stock Update Modal */}
            <Dialog open={!!stockUpdateVariant} onOpenChange={() => setStockUpdateVariant(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Update Stock</DialogTitle>
                    </DialogHeader>
                    {stockUpdateVariant && (
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Product</Label>
                                    <p className="text-sm font-medium mt-1">{stockUpdateVariant.productName}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Variant</Label>
                                    <p className="text-sm font-medium mt-1">{stockUpdateVariant.name}</p>
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div>
                                <Label htmlFor="size-select" className="text-sm">Select Size</Label>
                                <Select 
                                    value={stockUpdate.selectedSize} 
                                    onValueChange={(value) => setStockUpdate(prev => ({ ...prev, selectedSize: value }))}
                                >
                                    <SelectTrigger className="h-10 mt-1.5">
                                        <SelectValue placeholder="Choose a size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stockUpdateVariant.sizes?.map((sizeData) => (
                                            <SelectItem key={sizeData.size} value={sizeData.size}>
                                                {sizeData.size} (Current: {sizeData.stock})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Current Stock Display */}
                            {stockUpdate.selectedSize && (
                                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                    <Label className="text-xs text-blue-600 dark:text-blue-400">Current Stock for {stockUpdate.selectedSize}</Label>
                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
                                        {stockUpdateVariant.sizes?.find(s => s.size === stockUpdate.selectedSize)?.stock || 0} units
                                    </p>
                                </div>
                            )}

                            {/* Operation Selection */}
                            <div>
                                <Label htmlFor="stock-operation" className="text-sm">Operation</Label>
                                <Select 
                                    value={stockUpdate.operation} 
                                    onValueChange={(value) => setStockUpdate(prev => ({ ...prev, operation: value as 'set' | 'add' | 'subtract' }))}
                                >
                                    <SelectTrigger className="h-10 mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="set">Set to</SelectItem>
                                        <SelectItem value="add">Add</SelectItem>
                                        <SelectItem value="subtract">Subtract</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Value Input */}
                            <div>
                                <Label htmlFor="stock-value" className="text-sm">
                                    {stockUpdate.operation === 'set' ? 'New Stock Value' : 
                                     stockUpdate.operation === 'add' ? 'Amount to Add' : 'Amount to Subtract'}
                                </Label>
                                <Input
                                    id="stock-value"
                                    type="number"
                                    min="0"
                                    value={stockUpdate.newStock}
                                    onChange={(e) => setStockUpdate(prev => ({ ...prev, newStock: Number(e.target.value) }))}
                                    className="h-10 mt-1.5"
                                />
                            </div>

                            {/* Preview */}
                            {stockUpdate.selectedSize && stockUpdate.operation !== 'set' && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-sm">
                                        <strong>Preview:</strong> {stockUpdateVariant.sizes?.find(s => s.size === stockUpdate.selectedSize)?.stock || 0}
                                        {stockUpdate.operation === 'add' ? ' + ' : ' - '}
                                        {stockUpdate.newStock} = {
                                            stockUpdate.operation === 'add' 
                                                ? (stockUpdateVariant.sizes?.find(s => s.size === stockUpdate.selectedSize)?.stock || 0) + stockUpdate.newStock
                                                : Math.max(0, (stockUpdateVariant.sizes?.find(s => s.size === stockUpdate.selectedSize)?.stock || 0) - stockUpdate.newStock)
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                                <Button variant="outline" onClick={() => setStockUpdateVariant(null)} className="w-full sm:w-auto h-10">
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={confirmStockUpdate} 
                                    disabled={!stockUpdate.selectedSize}
                                    className="w-full sm:w-auto h-10"
                                >
                                    Update Stock
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Stock Update Confirmation Modal */}
            <Dialog open={showStockConfirmation} onOpenChange={setShowStockConfirmation}>
                <DialogContent className="max-w-[95vw] sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Confirm Stock Update
                        </DialogTitle>
                    </DialogHeader>
                    {pendingStockUpdate && (
                        <div className="space-y-5">
                            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-4 rounded-lg space-y-3">
                                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                    Please review the following stock update:
                                </p>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-1">
                                        <span className="text-muted-foreground">Product:</span>
                                        <span className="font-medium">{pendingStockUpdate.variant.productName}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-muted-foreground">Variant:</span>
                                        <span className="font-medium">{pendingStockUpdate.variant.name}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-muted-foreground">Size:</span>
                                        <span className="font-medium">{pendingStockUpdate.size}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                                        <span className="font-semibold">Stock Change:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-medium">
                                                {pendingStockUpdate.oldStock}
                                            </span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="text-lg font-bold text-orange-600">
                                                {pendingStockUpdate.newStock}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs text-orange-600 dark:text-orange-400">
                                            Change: {Math.abs(pendingStockUpdate.newStock - pendingStockUpdate.oldStock)} units
                                            {pendingStockUpdate.oldStock > 0 && (
                                                <> ({Math.round(Math.abs((pendingStockUpdate.newStock - pendingStockUpdate.oldStock) / pendingStockUpdate.oldStock) * 100)}% change)</>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                                Please verify this change is correct before proceeding.
                            </p>
                            
                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowStockConfirmation(false);
                                        setPendingStockUpdate(null);
                                    }} 
                                    className="w-full sm:w-auto h-10"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={confirmLargeStockChange}
                                    className="w-full sm:w-auto h-10 bg-orange-600 hover:bg-orange-700"
                                >
                                    Confirm Update
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Product Edit Modal */}
            <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Edit Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                This will update all variants of this product
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="product-name" className="text-sm">Product Name *</Label>
                            <Input
                                id="product-name"
                                value={productEditForm.name}
                                onChange={(e) => setProductEditForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Product Name"
                                className="h-10 mt-1.5"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="product-hsn" className="text-sm">HSN Code *</Label>
                            <Input
                                id="product-hsn"
                                type="number"
                                value={productEditForm.HSN}
                                onChange={(e) => setProductEditForm(prev => ({ ...prev, HSN: e.target.value }))}
                                placeholder="e.g., 61091000"
                                className="h-10 mt-1.5"
                                required
                            />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                            <Button variant="outline" onClick={() => setEditingProduct(null)} className="w-full sm:w-auto h-10">
                                Cancel
                            </Button>
                            <Button onClick={confirmProductEdit} className="w-full sm:w-auto h-10">
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};