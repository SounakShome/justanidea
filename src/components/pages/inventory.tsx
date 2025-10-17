"use client";

import { useState, useEffect } from 'react';
import { Search, Package, PlusCircle, TrendingDown, Edit, Trash2, Eye, Plus } from 'lucide-react';
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
        setEditingVariant(variant);
        setEditForm({
            name: variant.name,
            size: variant.size,
            price: variant.price
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
            newStock: variant.stock,
            operation: 'set'
        });
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
        if (!stockUpdateVariant) return;
        
        let finalStock = stockUpdate.newStock;
        if (stockUpdate.operation === 'add') {
            finalStock = stockUpdateVariant.stock + stockUpdate.newStock;
        } else if (stockUpdate.operation === 'subtract') {
            finalStock = Math.max(0, stockUpdateVariant.stock - stockUpdate.newStock);
        }
        
        const success = await updateVariantStock(stockUpdateVariant.id, finalStock);
        if (success) {
            setStockUpdateVariant(null);
            toast("Stock updated successfully");
        } else {
            toast("Error updating stock");
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
    const lowStockItems = allProductVariants.filter(variant => (variant.stock || 0) < 10).length;

    return (
        <>
            <div className="px-4 sm:px-6">
                <SiteHeader name="Inventory" />
            </div>
            <div className="flex-1 space-y-4 p-4 sm:p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{allVariants.length}</div>
                            <p className="text-xs text-muted-foreground">Items in inventory</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalProducts}</div>
                            <p className="text-xs text-muted-foreground">Unique products</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lowStockItems}</div>
                            <p className="text-xs text-muted-foreground">Items below 10 units</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Add Button */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Management</CardTitle>
                        <CardDescription>Search and manage your inventory items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by product name, variant, or barcode..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <CompactBarcodeScanner 
                                    onScanSuccessAction={handleBarcodeScanned}
                                    buttonText="Scan UPC"
                                    buttonVariant="outline"
                                />
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by category" />
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
                                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                                    const [field, order] = value.split('-') as ['name' | 'price' | 'stock', 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}>
                                    <SelectTrigger className="w-40">
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
                                {(searchQuery || selectedCategory !== 'all') && (
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                            <Button className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Variants</CardTitle>
                        <CardDescription>
                            {isLoading ? "Loading products..." : `${allVariants.length} variants found`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
                                </div>
                                <p className="text-muted-foreground">Loading products...</p>
                            </div>
                        ) : allVariants.length > 0 ? (
                            <div className="space-y-2">
                                {/* Header Row */}
                                <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 rounded-lg font-medium text-sm">
                                    <div className="col-span-4 sm:col-span-4">Product & Variant</div>
                                    <div className="col-span-2 sm:col-span-2">HSN Code</div>
                                    <div className="col-span-2 sm:col-span-2">Size</div>
                                    <div className="col-span-1 sm:col-span-1">Stock</div>
                                    <div className="col-span-2 sm:col-span-2">Price</div>
                                    <div className="col-span-1 sm:col-span-1">Actions</div>
                                </div>
                                
                                {/* Data Rows */}
                                {allVariants.map((variant: ExtendedVariant) => (
                                    <div key={variant.id} className="grid grid-cols-12 gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors items-center">
                                        <div className="col-span-4 sm:col-span-4 flex flex-col justify-center">
                                            <p className="font-medium text-sm">{variant.productName || 'Unknown Product'} {variant.name || 'Unknown Variant'}</p>
                                            <p className="text-xs text-muted-foreground"> Created: {variant.createdAt ? new Date(variant.createdAt).toLocaleDateString() : 'Unknown'}
                                            </p>
                                        </div>
                                        <div className="col-span-2 sm:col-span-2 flex items-center">
                                            <p className="text-sm font-mono">{variant.HSN || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2 sm:col-span-2 flex items-center">
                                            <Badge variant="outline" className="text-xs">
                                                {variant.size || 'N/A'}
                                            </Badge>
                                        </div>
                                        <div className="col-span-1 sm:col-span-1 flex items-center">
                                            <p className="text-sm font-medium">
                                                {variant.stock || 0}
                                                {(variant.stock || 0) < 10 && (
                                                    <span className="ml-1 text-red-500">
                                                        <TrendingDown className="h-3 w-3 inline" />
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="col-span-2 sm:col-span-2 flex items-center">
                                            <p className="text-sm font-medium">
                                                ₹{(variant.price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="col-span-1 sm:col-span-1 flex items-center">
                                            <div className="flex gap-1 flex-wrap">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-xs px-2 py-1 h-7"
                                                    onClick={() => handleEdit(variant)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-xs px-2 py-1 h-7"
                                                    onClick={() => handleView(variant)}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-xs px-2 py-1 h-7"
                                                    onClick={() => handleStockUpdate(variant)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-xs px-2 py-1 h-7 text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(variant)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-lg mb-2">No variants found</CardTitle>
                                <p className="text-muted-foreground">Try adjusting your search terms</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Variant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Variant Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-size">Size</Label>
                            <Input
                                id="edit-size"
                                value={editForm.size}
                                onChange={(e) => setEditForm(prev => ({ ...prev, size: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-price">Price</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                value={editForm.price}
                                onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setEditingVariant(null)}>
                                Cancel
                            </Button>
                            <Button onClick={confirmEdit}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={!!viewingVariant} onOpenChange={() => setViewingVariant(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Variant Details</DialogTitle>
                    </DialogHeader>
                    {viewingVariant && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Product Name</Label>
                                    <p className="text-sm font-medium">{viewingVariant.productName}</p>
                                </div>
                                <div>
                                    <Label>Variant Name</Label>
                                    <p className="text-sm font-medium">{viewingVariant.name}</p>
                                </div>
                                <div>
                                    <Label>Size</Label>
                                    <p className="text-sm font-medium">{viewingVariant.size}</p>
                                </div>
                                <div>
                                    <Label>HSN Code</Label>
                                    <p className="text-sm font-medium">{viewingVariant.HSN}</p>
                                </div>
                                <div>
                                    <Label>Stock</Label>
                                    <p className="text-sm font-medium">{viewingVariant.stock}</p>
                                </div>
                                <div>
                                    <Label>Price</Label>
                                    <p className="text-sm font-medium">₹{viewingVariant.price.toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label>Created</Label>
                                    <p className="text-sm font-medium">{new Date(viewingVariant.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label>Updated</Label>
                                    <p className="text-sm font-medium">{new Date(viewingVariant.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => setViewingVariant(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingVariant} onOpenChange={() => setDeletingVariant(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Variant</DialogTitle>
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
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setDeletingVariant(null)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Stock Update Modal */}
            <Dialog open={!!stockUpdateVariant} onOpenChange={() => setStockUpdateVariant(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Stock</DialogTitle>
                    </DialogHeader>
                    {stockUpdateVariant && (
                        <div className="space-y-4">
                            <div>
                                <Label>Product: {stockUpdateVariant.productName}</Label>
                                <p className="text-sm text-muted-foreground">Variant: {stockUpdateVariant.name}</p>
                                <p className="text-sm text-muted-foreground">Current Stock: {stockUpdateVariant.stock}</p>
                            </div>
                            <div>
                                <Label htmlFor="stock-operation">Operation</Label>
                                <Select 
                                    value={stockUpdate.operation} 
                                    onValueChange={(value) => setStockUpdate(prev => ({ ...prev, operation: value as 'set' | 'add' | 'subtract' }))}
                                >
                                    <SelectTrigger>
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
                                <Label htmlFor="stock-value">
                                    {stockUpdate.operation === 'set' ? 'New Stock Value' : 
                                     stockUpdate.operation === 'add' ? 'Amount to Add' : 'Amount to Subtract'}
                                </Label>
                                <Input
                                    id="stock-value"
                                    type="number"
                                    min="0"
                                    value={stockUpdate.newStock}
                                    onChange={(e) => setStockUpdate(prev => ({ ...prev, newStock: Number(e.target.value) }))}
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
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setStockUpdateVariant(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={confirmStockUpdate}>
                                    Update Stock
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};