import { NextRequest, NextResponse } from "next/server";
import { fetchMappedPurchases, fetchFilteredPurchases } from "@/utils/purchase";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        
        // Check if there are any filter parameters
        const supplierId = searchParams.get('supplierId');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const minAmount = searchParams.get('minAmount');
        const maxAmount = searchParams.get('maxAmount');

        // If any filters are provided, use the filtered function
        if (supplierId || status || startDate || endDate || minAmount || maxAmount) {
            const filters: any = {};
            
            if (supplierId) filters.supplierId = supplierId;
            if (status) filters.status = status;
            if (startDate) filters.startDate = new Date(startDate);
            if (endDate) filters.endDate = new Date(endDate);
            if (minAmount) filters.minAmount = parseFloat(minAmount);
            if (maxAmount) filters.maxAmount = parseFloat(maxAmount);

            const result = await fetchFilteredPurchases(filters);
            return NextResponse.json(result);
        }

        // Otherwise, fetch all purchases
        const result = await fetchMappedPurchases();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching purchases:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Error fetching purchases.", 
            error: error instanceof Error ? error.message : error 
        }, { status: 500 });
    }
}
