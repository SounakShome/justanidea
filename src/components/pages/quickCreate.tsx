"use client";

import Loading from "@/app/(user)/loading";
import { useEffect, Suspense } from "react";
import { CustomerForm, SupplierForm, ProductForm, VariantForm } from "./forms";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    PackageIcon,
    PlusCircleIcon,
    Layers3Icon,
    UsersIcon,
    TruckIcon,
    BarChartIcon,
    X
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useInventoryStore } from "@/store";

export default function Page() {

    const [open, setOpen] = useState("");
    const { products, refreshProducts, isLoading } = useInventoryStore();
    const [customersCount, setCustomersCount] = useState(0);
    const [suppliersCount, setSuppliersCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [countsLoading, setCountsLoading] = useState(true);

    useEffect(() => {
        refreshProducts();
        
        // Fetch counts for other entities
        const fetchCounts = async () => {
            setCountsLoading(true);
            try {
                const [customersRes, suppliersRes, ordersRes] = await Promise.all([
                    fetch("/api/customers"),
                    fetch("/api/getSuppliers"),
                    fetch("/api/orders")
                ]);
                
                if (customersRes.ok) {
                    const customers = await customersRes.json();
                    setCustomersCount(Array.isArray(customers) ? customers.length : 0);
                }
                
                if (suppliersRes.ok) {
                    const suppliers = await suppliersRes.json();
                    setSuppliersCount(Array.isArray(suppliers) ? suppliers.length : 0);
                }
                
                if (ordersRes.ok) {
                    const orders = await ordersRes.json();
                    setOrdersCount(Array.isArray(orders) ? orders.length : 0);
                }
            } catch (error) {
                console.error("Error fetching counts:", error);
            } finally {
                setCountsLoading(false);
            }
        };
        
        fetchCounts();
    }, [refreshProducts]);

    return (
        <>
            <SiteHeader name="Quick Create" />
            <div>
                <div className="container p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Quick Stats Card */}
                        <Suspense fallback={<Loading />}>
                            <div className="col-span-2 md:col-span-1 bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <BarChartIcon className="h-5 w-5" />
                                    Quick Stats
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-background rounded-md">
                                        <p className="text-muted-foreground text-xs">Products</p>
                                        {isLoading ? (
                                            <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
                                        ) : (
                                            <p className="text-2xl font-bold">{products?.length || 0}</p>
                                        )}
                                    </div>
                                    <div className="p-3 bg-background rounded-md">
                                        <p className="text-muted-foreground text-xs">Customers</p>
                                        {countsLoading ? (
                                            <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
                                        ) : (
                                            <p className="text-2xl font-bold">{customersCount}</p>
                                        )}
                                    </div>
                                    <div className="p-3 bg-background rounded-md">
                                        <p className="text-muted-foreground text-xs">Suppliers</p>
                                        {countsLoading ? (
                                            <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
                                        ) : (
                                            <p className="text-2xl font-bold">{suppliersCount}</p>
                                        )}
                                    </div>
                                    <div className="p-3 bg-background rounded-md">
                                        <p className="text-muted-foreground text-xs">Orders</p>
                                        {countsLoading ? (
                                            <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
                                        ) : (
                                            <p className="text-2xl font-bold">{ordersCount}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Suspense>
                        {/* Customers Card */}
                        <div className="col-span-1 row-span-1 lg:col-span-1 bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <UsersIcon className="h-5 w-5" />
                                Customers
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">Add new customer to your database</p>
                            <Button variant="outline" onClick={() => setOpen("customers")} className="cursor-pointer w-full">Add Customer</Button>
                        </div>

                        {/* Suppliers Card */}
                        <div className="col-span-2 lg:col-span-1 bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <TruckIcon className="h-5 w-5" />
                                Suppliers
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">Add new supplier to your network</p>
                            <Button variant="outline" onClick={() => setOpen("suppliers")} className="cursor-pointer w-full">Add Supplier</Button>
                        </div>
                        {/* Products Card */}
                        <div className="col-span-2 lg:col-span-3 row-span-2 bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <PackageIcon className="h-5 w-5" />
                                Products
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {/* New Product Option */}
                                <div className="bg-background hover:bg-accent/50 transition-colors rounded-lg p-4 border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium">New Product</h3>
                                        <PlusCircleIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">Add a completely new product from scratch</p>
                                    <Button variant="outline" onClick={() => setOpen("products")} className="cursor-pointer w-full">Add Product</Button>
                                </div>

                                {/* New Variant Option */}
                                <div className="bg-background hover:bg-accent/50 transition-colors rounded-lg p-4 border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium">New Variant</h3>
                                        <Layers3Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">Add a new variant for an existing product</p>
                                    <Button variant="outline" onClick={() => setOpen("variants")} className="cursor-pointer w-full">Add Variant</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {open !== "" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-xl shadow-lg p-6 w-full mx-5 border border-border">
                        <div className="flex-wrap-reverse justify-between items-center mb-6">
                            <Button variant="ghost" size="sm" onClick={() => setOpen("")} className="cursor-pointer float-end rounded-full h-8 w-8 p-0">
                                <span className="sr-only">Close</span>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="max-h-[80vh] overflow-y-auto">
                            {open === "customers" && <CustomerForm onClose={() => setOpen("")} />}
                            {open === "suppliers" && <SupplierForm onClose={() => setOpen("")} />}
                            {open === "products" && <ProductForm onClose={() => setOpen("")} />}
                            {open === "variants" && <VariantForm onClose={() => setOpen("")} />}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}