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
    
    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        size: '',
        price: 0
    });
    
    // Stock update state
    const [stockUpdate, setStockUpdate] = useState({
        newStock: 0,
        operation: 'set' as 'add' | 'subtract' | 'set'
    });

    // Action handlers
    const handleEdit = (variant: ExtendedVariant) => {
        // TODO: Update edit to handle multiple sizes
        toast.info("Edit functionality will be updated to handle multiple sizes");
    };

    const handleView = (variant: ExtendedVariant) => {
        setViewingVariant(variant);
    };

    const handleDelete = (variant: ExtendedVariant) => {
        setDeletingVariant(variant);
    };

    const handleStockUpdate = (variant: ExtendedVariant) => {
        // TODO: Update stock to handle multiple sizes
        toast.info("Stock update will be updated to handle specific sizes");
    };

    const confirmEdit = async () => {
        if (!editingVariant) return;
        
        const success = await updateVariant(editingVariant.id, editForm);
        if (success) {
            setEditingVariant(null);
            toast("Variant updated successfully");
        } else {
            toast("Error updating variant");
        }
    };

    const confirmDelete = async () => {
        if (!deletingVariant) return;
        
        const success = await deleteVariant(deletingVariant.id);
        if (success) {
            setDeletingVariant(null);
            toast("Variant deleted successfully");
        } else {
            toast("Error deleting variant");
        }
    };

    const confirmStockUpdate = async () => {
        // TODO: Update to handle specific size stock updates
        toast.info("Stock update functionality needs to be updated for multiple sizes");
        setStockUpdateVariant(null);
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
        product.variants?.map(variant => ({
            ...variant,
            productName: product.name,
            productId: product.id,
            HSN: product.HSN,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        })) || []
    ) || [];

    // Calculate statistics
    const totalProducts = products?.length || 0;
    const allProductVariants = products?.flatMap(product => 
        product.variants?.map(variant => ({ ...variant, HSN: product.HSN })) || []
    ) || [];
    // Count low stock items across all variant sizes
    const lowStockItems = allProductVariants.reduce((count, variant) => {
        const lowSizes = variant.sizes?.filter(size => size.stock < 10).length || 0;
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

            {/* Edit Modal */}
            <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Edit Variant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name" className="text-sm">Variant Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="h-10 mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-size" className="text-sm">Size</Label>
                            <Input
                                id="edit-size"
                                value={editForm.size}
                                onChange={(e) => setEditForm(prev => ({ ...prev, size: e.target.value }))}
                                className="h-10 mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-price" className="text-sm">Price</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                value={editForm.price}
                                onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="h-10 mt-1.5"
                            />
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                            <Button variant="outline" onClick={() => setEditingVariant(null)} className="w-full sm:w-auto h-10">
                                Cancel
                            </Button>
                            <Button onClick={confirmEdit} className="w-full sm:w-auto h-10">
                                Save Changes
                            </Button>
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

            {/* Stock Update Modal - TODO: Update for multiple sizes */}
            {/* <Dialog open={!!stockUpdateVariant} onOpenChange={() => setStockUpdateVariant(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Update Stock</DialogTitle>
                    </DialogHeader>
                    {stockUpdateVariant && (
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <Label className="text-xs text-muted-foreground">Product</Label>
                                <p className="text-sm font-medium mt-1">{stockUpdateVariant.productName}</p>
                                <Label className="text-xs text-muted-foreground mt-2 block">Variant</Label>
                                <p className="text-sm font-medium mt-1">{stockUpdateVariant.name}</p>
                                <Label className="text-xs text-muted-foreground mt-2 block">Current Stock</Label>
                                <p className="text-sm font-semibold mt-1">{stockUpdateVariant.stock}</p>
                            </div>
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
                            {stockUpdate.operation !== 'set' && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-sm">
                                        <strong>Preview:</strong> {stockUpdateVariant.stock} 
                                        {stockUpdate.operation === 'add' ? ' + ' : ' - '}
                                        {stockUpdate.newStock} = {
                                            stockUpdate.operation === 'add' 
                                                ? stockUpdateVariant.stock + stockUpdate.newStock
                                                : Math.max(0, stockUpdateVariant.stock - stockUpdate.newStock)
                                        }
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                                <Button variant="outline" onClick={() => setStockUpdateVariant(null)} className="w-full sm:w-auto h-10">
                                    Cancel
                                </Button>
                                <Button onClick={confirmStockUpdate} className="w-full sm:w-auto h-10">
                                    Update Stock
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog> */}
        </>
    );
};