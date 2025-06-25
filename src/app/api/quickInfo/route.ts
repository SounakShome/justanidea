import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch all products with their variants and suppliers
        const pLen = await prisma.products.count();
        const cLen = await prisma.customer.count();
        const sLen = await prisma.supplier.count();
        const oLen = await prisma.order.count();

        return NextResponse.json({pLen, cLen, sLen, oLen});
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
    }
}