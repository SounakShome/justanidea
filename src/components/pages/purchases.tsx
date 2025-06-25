"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DatePicker from "@/components/ui/datePicker";
import { Package, Plus, Scroll, Search, Trash2 } from "lucide-react";
import { SiteHeader } from "../site-header";

// Types
type Supplier = {
    id: string;
    name: string;
    division: string;
    CIN: string;
    GSTIN: string;
    Supp_State: string;
    address: string;
    phone: string;
    PAN: string;
    Code: number;
};

type Variants = {
    id: string;
    name: string;
    size: string;
    price: number;
};

type Product = {
    id: string;
    name: string;
    HSN: number;
    variants: Variants[];
};

type PurchaseItem = {
    productId: string;
    quantity: number;
    costPrice: number;
    discount: number;
    total: number;
};

type PurchaseFormValues = {
    supplierId: string;
    referenceNumber: string;
    items: PurchaseItem[];
    taxRate: number;
    shippingCost: number;
    notes: string;
    paymentMethod: string;
    paymentStatus: string;
};

const getSuppliers = async (): Promise<Supplier[]> => {
    // Simulate API delay
    const res = await fetch("/api/getSuppliers");
    if (!res.ok) {
        throw new Error("Failed to fetch suppliers");
    }
    const data = await res.json();
    console.log("Fetched suppliers:", data);
    return data as Supplier[];
};

const getProducts = async (query: string = "", supplierId: string): Promise<Product[]> => {
    // Simulate API delay
    const allProducts: Product[] = await fetch(`/api/getItems/${supplierId}`);

    console.log("Fetched products:", allProducts);

    if (!query) return allProducts;

    const lowerCaseQuery = query.toLowerCase();
    return allProducts.filter(product =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.sku.toLowerCase().includes(lowerCaseQuery) ||
        product.category.toLowerCase().includes(lowerCaseQuery)
    );
};

const savePurchase = async (data: any): Promise<{ success: boolean; id: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful response
    return {
        success: true,
        id: "PO-" + Math.floor(10000 + Math.random() * 90000)
    };
};

// Form field component
const FormField = ({
    label,
    error,
    children
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="mb-3">
        <label className="block text-sm font-medium mb-1">{label}</label>
        {children}
        {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
);

export default function PurchaseEntryForm() {
    // State
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("products");

    // Form
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors }, reset } = useForm<PurchaseFormValues>({
        defaultValues: {
            supplierId: "",
            referenceNumber: `PO-${Math.floor(10000 + Math.random() * 90000)}`,
            items: [],
            taxRate: 0,
            shippingCost: 0,
            notes: "",
            paymentMethod: "bank_transfer",
            paymentStatus: "pending"
        }
    });

    const watchItems = watch("items", []);
    const watchSupplierId = watch("supplierId");
    const watchTaxRate = watch("taxRate", 0);
    const watchShippingCost = watch("shippingCost", 0);

    // Load suppliers on component mount
    useEffect(() => {
        const loadSuppliers = async () => {
            setIsLoadingSuppliers(true);
            try {
                const data = await getSuppliers();
                setSuppliers(data);
            } catch (error) {
                console.error("Error loading suppliers:", error);
                toast("Error",{
                    description: "Failed to load suppliers"
                });
            } finally {
                setIsLoadingSuppliers(false);
            }
        };

        loadSuppliers();
    }, []);

    // Search products when query changes
    useEffect(() => {
        const searchProductsDebounced = setTimeout(async () => {
            setIsLoadingProducts(true);
            try {
                const data = await getProducts(productSearchQuery, watchSupplierId);
                setProducts(data);
            } catch (error) {
                console.error("Error searching products:", error);
                toast("Error",{
                    description: "Failed to search products"
                });
            } finally {
                setIsLoadingProducts(false);
            }
        }, 300);

        return () => clearTimeout(searchProductsDebounced);
    }, [productSearchQuery, watchSupplierId]);

    // Update selected supplier when supplier ID changes
    useEffect(() => {
        if (watchSupplierId) {
            const supplier = suppliers.find(s => s.id === watchSupplierId);
            setSelectedSupplier(supplier || null);
        } else {
            setSelectedSupplier(null);
        }
    }, [watchSupplierId, suppliers]);

    // Helper functions
    const addProductToItems = (product: Product) => {
        const currentItems = getValues("items") || [];
        const existingItem = currentItems.find(item => item.productId === product.id);

        if (existingItem) {
            // Update quantity if already in cart
            const updatedItems = currentItems.map(item =>
                item.productId === product.id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        total: (item.quantity + 1) * item.costPrice * (1 - item.discount / 100)
                    }
                    : item
            );
            setValue("items", updatedItems);
        } else {
            // Add new item
            setValue("items", [
                ...currentItems,
                {
                    productId: product.id,
                    quantity: 1,
                    costPrice: product.costPrice,
                    discount: 0,
                    total: product.costPrice
                }
            ]);
        }
    };

    const updateItemQuantity = (productId: string, quantity: number) => {
        const currentItems = getValues("items");
        const updatedItems = currentItems.map(item =>
            item.productId === productId
                ? {
                    ...item,
                    quantity,
                    total: quantity * item.costPrice * (1 - item.discount / 100)
                }
                : item
        );
        setValue("items", updatedItems);
    };

    const updateItemDiscount = (productId: string, discount: number) => {
        const currentItems = getValues("items");
        const updatedItems = currentItems.map(item =>
            item.productId === productId
                ? {
                    ...item,
                    discount,
                    total: item.quantity * item.costPrice * (1 - discount / 100)
                }
                : item
        );
        setValue("items", updatedItems);
    };

    const removeItem = (productId: string) => {
        const currentItems = getValues("items");
        setValue("items", currentItems.filter(item => item.productId !== productId));
    };

    // Calculate subtotal, tax, and total
    const calculateSubtotal = () => {
        if (!watchItems?.length) return 0;

        return watchItems.reduce((total, item) => total + item.total, 0);
    };

    const calculateTaxAmount = () => {
        return calculateSubtotal() * (watchTaxRate / 100);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTaxAmount() + (parseFloat(watchShippingCost.toString()) || 0);
    };

    // Form submission
    const onSubmit = async (data: PurchaseFormValues) => {
        if (!data.items.length) {
            toast({
                title: "No items added",
                description: "Please add at least one item to the purchase order",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            const result = await savePurchase({
                ...data,
                purchaseDate,
                deliveryDate,
                totalAmount: calculateTotal()
            });

            if (result.success) {
                toast({
                    title: "Purchase order created",
                    description: `Purchase order ${result.id} has been created`,
                });

                reset();
                setPurchaseDate(new Date());
                setDeliveryDate(undefined);
                setProductSearchQuery("");
            }
        } catch (error) {
            console.error("Error saving purchase:", error);
            toast({
                title: "Error",
                description: "Failed to save purchase order",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto p-6 py-2">
            <SiteHeader name="Purchase Order" />

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* --- FIRST ROW --- */}

                    {/* Purchase Info - 8 columns */}
                    <Card className="lg:col-span-12">
                        <CardHeader className="pb-3">
                            <CardTitle>Purchase Information</CardTitle>
                            <CardDescription>Basic details for this purchase order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <FormField label="Supplier" error={errors.supplierId?.message}>
                                        <Select
                                            onValueChange={(value) => setValue("supplierId", value)}
                                            disabled={isLoadingSuppliers}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map(supplier => (
                                                    <SelectItem key={supplier.id} value={supplier.id}>
                                                        {`${supplier.name} (${supplier.division})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormField>

                                    <FormField label="Invoice Number" error={errors.referenceNumber?.message}>
                                        <Input
                                            placeholder="PO-12345"
                                            {...register("referenceNumber", { required: "Reference number is required" })}
                                        />
                                    </FormField>
                                </div>

                                <div className="space-y-4">
                                    <DatePicker
                                        setPurchase={setPurchaseDate}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Supplier Info Card - 8 columns */}
                    <Card className="lg:col-span-8">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Supplier Details</CardTitle>
                                {selectedSupplier && (
                                    <Badge variant="outline" className="hidden sm:inline-flex">
                                        {selectedSupplier.Supp_State}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {selectedSupplier ? (
                                <div>
                                    {/* Mobile layout - stacked */}
                                    <div className="space-y-3 sm:hidden">
                                        <div className="flex justify-between items-start pb-2 border-b">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Company</p>
                                                <p className="font-medium text-base">{selectedSupplier.name}</p>
                                            </div>
                                            <Badge>{selectedSupplier.Supp_State}</Badge>
                                        </div>

                                        <div className="pb-2 border-b">
                                            <p className="text-sm text-muted-foreground">Division</p>
                                            <p>{selectedSupplier.division}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 pb-2 border-b">
                                            <div>
                                                <p className="text-sm text-muted-foreground">CIN</p>
                                                <p className="overflow-x-auto whitespace-nowrap text-sm">{selectedSupplier.CIN}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">GSTIN</p>
                                                <p className="overflow-x-auto whitespace-nowrap text-sm">{selectedSupplier.GSTIN}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pb-2 border-b">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Code</p>
                                                <p>{selectedSupplier.Code}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">PAN</p>
                                                <p>{selectedSupplier.PAN}</p>
                                            </div>
                                        </div>

                                        <div className="pb-2 border-b">
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="text-sm">{selectedSupplier.phone}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="text-sm">{selectedSupplier.address}</p>
                                        </div>
                                    </div>

                                    {/* Desktop layout - using grid */}
                                    <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <p className="text-sm text-muted-foreground">Company</p>
                                            <p className="font-medium">{selectedSupplier.name}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Division</p>
                                            <p>{selectedSupplier.division}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Code</p>
                                            <p>{selectedSupplier.Code}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">CIN</p>
                                            <p>{selectedSupplier.CIN}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">GSTIN</p>
                                            <p>{selectedSupplier.GSTIN}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p>{selectedSupplier.phone}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">PAN</p>
                                            <p>{selectedSupplier.PAN}</p>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="text-sm">{selectedSupplier.address}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[120px] text-center p-4">
                                    <Package className="h-10 w-10 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground text-sm">Select a supplier to see details</p>
                                    <p className="text-xs text-muted-foreground mt-1">All supplier information will appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Summary Card - 4 columns */}
                    <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax ({watchTaxRate}%):</span>
                                    <span>${calculateTaxAmount().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping:</span>
                                    <span>${parseFloat(watchShippingCost.toString() || "0").toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-medium text-lg">
                                    <span>Total:</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    disabled={isSaving}
                                    type="submit"
                                >
                                    {isSaving ? "Processing..." : "Create Purchase Order"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>



                    {/* --- SECOND ROW --- */}

                    {/* Main Content Area with Tabs - 8 columns */}
                    <Card className="lg:col-span-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <CardTitle>Order Details</CardTitle>
                                    <TabsList className="w-full sm:w-auto">
                                        <TabsTrigger value="products">Products</TabsTrigger>
                                        <TabsTrigger value="payment">Payment</TabsTrigger>
                                        <TabsTrigger value="notes">Notes</TabsTrigger>
                                    </TabsList>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <TabsContent value="products" className="space-y-4">
                                    {/* Product Search */}
                                    <div className="flex items-center space-x-2">
                                        <div className="relative flex-grow">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search products..."
                                                value={productSearchQuery}
                                                onChange={(e) => setProductSearchQuery(e.target.value)}
                                                className="pl-8 h-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Product List */}
                                    <ScrollArea className="h-[250px] sm:h-[300px] border rounded-md p-2 sm:p-4">
                                        {isLoadingProducts ? (
                                            <div className="flex justify-center items-center h-full">
                                                <p>Loading products...</p>
                                            </div>
                                        ) : products.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                {products.map(product => (
                                                    <div
                                                        key={product.id}
                                                        className="border rounded-md p-3 flex justify-between items-center hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <div className="flex flex-wrap gap-2 items-center text-sm mt-1">
                                                                <span className="text-muted-foreground">{product.sku}</span>
                                                                <Badge variant="outline">{product.category}</Badge>
                                                            </div>
                                                            <p className="font-medium mt-2">${product.costPrice.toFixed(2)}</p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-9 px-3"
                                                            onClick={() => addProductToItems(product)}
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" /> Add
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex justify-center items-center h-full">
                                                <p className="text-muted-foreground">{productSearchQuery ? "No products match your search" : "No products available"}</p>
                                            </div>
                                        )}
                                    </ScrollArea>

                                    {/* Selected Items List */}
                                    <ScrollArea className="border rounded-md">
                                        <div className="bg-muted px-3 py-2 rounded-t-md flex items-center">
                                            <h3 className="font-medium">Selected Items</h3>
                                        </div>
                                        <div>
                                            {watchItems && watchItems.length > 0 ? (
                                                <div>
                                                    <div className="hidden sm:grid grid-cols-12 text-sm font-medium border-b p-3">
                                                        <div className="col-span-4">Product</div>
                                                        <div className="col-span-2">Unit Price</div>
                                                        <div className="col-span-2">Quantity</div>
                                                        <div className="col-span-2">Discount %</div>
                                                        <div className="col-span-2 text-right">Total</div>
                                                    </div>

                                                    <ScrollArea className="max-h-[250px]">
                                                        {watchItems.map((item) => {
                                                            const product = products.find(p => p.id === item.productId);
                                                            return product ? (
                                                                <div key={item.productId} className="p-3 border-b last:border-0">
                                                                    {/* Mobile view (stacked) */}
                                                                    <div className="sm:hidden">
                                                                        <div className="flex justify-between mb-2">
                                                                            <div>
                                                                                <p className="font-medium">{product.name}</p>
                                                                                <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                                            </div>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                                                onClick={() => removeItem(item.productId)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                                                            <div>
                                                                                <p className="text-xs text-muted-foreground">Price</p>
                                                                                <p>${item.costPrice.toFixed(2)}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs text-muted-foreground">Quantity</p>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={item.quantity}
                                                                                    onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                                                    className="h-8 w-full"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs text-muted-foreground">Discount</p>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    value={item.discount}
                                                                                    onChange={(e) => updateItemDiscount(item.productId, parseInt(e.target.value) || 0)}
                                                                                    className="h-8 w-full"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-end">
                                                                            <span className="font-medium">Total: ${item.total.toFixed(2)}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Desktop view (grid) */}
                                                                    <div className="hidden sm:grid sm:grid-cols-12 sm:items-center">
                                                                        <div className="col-span-4">
                                                                            <p className="font-medium">{product.name}</p>
                                                                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            ${item.costPrice.toFixed(2)}
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            <Input
                                                                                type="number"
                                                                                min="1"
                                                                                value={item.quantity}
                                                                                onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                                                className="w-16 h-8"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                max="100"
                                                                                value={item.discount}
                                                                                onChange={(e) => updateItemDiscount(item.productId, parseInt(e.target.value) || 0)}
                                                                                className="w-16 h-8"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 flex items-center justify-end space-x-2">
                                                                            <span className="font-medium">${item.total.toFixed(2)}</span>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                                                onClick={() => removeItem(item.productId)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </ScrollArea>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center">
                                                    <p className="text-muted-foreground">No items added yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="payment" className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <FormField label="Payment Method" error={errors.paymentMethod?.message}>
                                            <Select
                                                defaultValue={getValues("paymentMethod")}
                                                onValueChange={(value) => setValue("paymentMethod", value)}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="check">Check</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormField>

                                        <FormField label="Payment Status" error={errors.paymentStatus?.message}>
                                            <Select
                                                defaultValue={getValues("paymentStatus")}
                                                onValueChange={(value) => setValue("paymentStatus", value)}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select payment status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="paid">Paid</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="partial">Partial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormField>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField label="Tax Rate (%)" error={errors.taxRate?.message}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    placeholder="0"
                                                    className="h-10"
                                                    {...register("taxRate", { valueAsNumber: true })}
                                                />
                                            </FormField>

                                            <FormField label="Shipping Cost" error={errors.shippingCost?.message}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="h-10"
                                                    {...register("shippingCost", { valueAsNumber: true })}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="notes">
                                    <FormField label="Notes & Additional Information" error={errors.notes?.message}>
                                        <textarea
                                            className="w-full min-h-[150px] sm:min-h-[200px] p-3 border rounded-md"
                                            placeholder="Enter any notes or special instructions..."
                                            {...register("notes")}
                                        ></textarea>
                                    </FormField>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>


                </div>
            </form>
        </div>
    );
}