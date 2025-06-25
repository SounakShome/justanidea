import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const variant = await req.json();
        console.log('Received variant data:', variant);
        // Create a new variant
        const newVariant = await prisma.variants.create({
            data: {
                name: variant.name,
                size: variant.size,
                price: parseFloat(variant.price),
                stock: parseInt(variant.stock),
                productId: variant.parentProductId,
                supplierId: variant.suppId,
            }, 
            include: {
                product: true, // Include the parent product details
                supplier: true, // Include the supplier details
            },
        });

        return NextResponse.json(newVariant);
    } catch (error: unknown) {
        console.error('Error adding variant:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}