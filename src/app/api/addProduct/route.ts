import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        
        // Create the product (without barcode at product level)
        const product = await prisma.products.create({
            data: {
                name: data.name,
                HSN: parseInt(data.HSN) || 0
            }
        });
        
        console.log("Product added successfully:", product);
        
        // If variants are provided, group by variant name and create with sizes as JSON
        let variantsCreated = 0;
        if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
            // Group flattened variants by variant name
            const groupedVariants = data.variants.reduce((acc: any, variant: {
                name: string;
                size: string;
                price: string;
                sellingPrice?: string;
                stock: string;
                suppId: string;
                barcode?: string;
            }) => {
                if (!acc[variant.name]) {
                    acc[variant.name] = {
                        name: variant.name,
                        suppId: variant.suppId,
                        barcode: variant.barcode,
                        sizes: []
                    };
                }
                acc[variant.name].sizes.push({
                    size: variant.size,
                    buyingPrice: parseFloat(variant.price) || 0,
                    sellingPrice: variant.sellingPrice ? parseFloat(variant.sellingPrice) : parseFloat(variant.price) || 0,
                    stock: parseInt(variant.stock) || 0
                });
                return acc;
            }, {});

            // Create one variant record per unique variant name
            const variantPromises = Object.values(groupedVariants).map((variant: any) => {
                return prisma.variants.create({
                    data: {
                        productId: product.id,
                        name: variant.name,
                        supplierId: variant.suppId || null,
                        barcode: variant.barcode || null,
                        barcodeType: variant.barcode ? "CODE128" : null,
                        sizes: variant.sizes // Store as JSON
                    }
                });
            });
            
            const createdVariants = await Promise.all(variantPromises);
            variantsCreated = createdVariants.length;
            console.log(`${variantsCreated} variants created for product ${product.name}`);
        }
        
        return NextResponse.json({ 
            success: true,
            product: product,
            variantsCreated: variantsCreated,
            message: `Product created successfully${variantsCreated > 0 ? ` with ${variantsCreated} variant(s)` : ''}`
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return NextResponse.json({ 
            success: false,
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}