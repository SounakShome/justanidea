"use client"

import { SiteHeader } from "@/components/site-header"

export default function CustomersPage() {
    return (
        <>
            <div className="px-6">
                <SiteHeader name="Customer" />
            </div>
            <div className="flex h-full w-full items-center justify-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Customers Page
                </h1>
            </div>
        </>
    );
}