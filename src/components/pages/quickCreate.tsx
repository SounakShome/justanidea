"use client";

import { Button } from "@/components/ui/button";
import {
    PackageIcon,
    PlusCircleIcon,
    Layers3Icon,
    UsersIcon,
    TruckIcon,
    BarChartIcon
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
    return (
        <>
            <SiteHeader name="Quick Create" />
            <div>
                <div className="container p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Quick Stats Card */}
                        <div className="col-span-2 md:col-span-1 bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <BarChartIcon className="h-5 w-5" />
                                Quick Stats
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-background rounded-md">
                                    <p className="text-muted-foreground text-xs">Products</p>
                                    <p className="text-2xl font-bold">124</p>
                                </div>
                                <div className="p-3 bg-background rounded-md">
                                    <p className="text-muted-foreground text-xs">Customers</p>
                                    <p className="text-2xl font-bold">56</p>
                                </div>
                                <div className="p-3 bg-background rounded-md">
                                    <p className="text-muted-foreground text-xs">Suppliers</p>
                                    <p className="text-2xl font-bold">18</p>
                                </div>
                                <div className="p-3 bg-background rounded-md">
                                    <p className="text-muted-foreground text-xs">Orders</p>
                                    <p className="text-2xl font-bold">432</p>
                                </div>
                            </div>
                        </div>
                        {/* Customers Card */}
                        <div className="col-span-1 row-span-1 lg:col-span-1 bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <UsersIcon className="h-5 w-5" />
                                Customers
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">Add new customer to your database</p>
                            <Button variant="outline" className="cursor-pointer w-full">Add Customer</Button>
                        </div>

                        {/* Suppliers Card */}
                        <div className="col-span-2 lg:col-span-1 bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <TruckIcon className="h-5 w-5" />
                                Suppliers
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">Add new supplier to your network</p>
                            <Button variant="outline" className="cursor-pointer w-full">Add Supplier</Button>
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
                                    <Button variant="outline" className="cursor-pointer w-full">Add Product</Button>
                                </div>

                                {/* New Variant Option */}
                                <div className="bg-background hover:bg-accent/50 transition-colors rounded-lg p-4 border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium">New Variant</h3>
                                        <Layers3Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">Add a new variant for an existing product</p>
                                    <Button variant="outline" className="cursor-pointer w-full">Add Variant</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}