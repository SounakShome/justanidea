import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PurchaseItemPayload {
    variantId: string;
    size: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
}

interface PurchasePayload {
    invoiceNo: string;
    Date: Date;
    supplierId: string;
    status: "PENDING" | "ORDERED" | "APPROVED" | "RECEIVED" | "CANCELLED";
    notes: string | null;
    subtotal: number;
    discount: number;
    taxableAmount: number;
    igst: number | null;
    cgst: number | null;
    sgst: number | null;
    totalAmount: number;
    items: PurchaseItemPayload[];
}

export async function GET(){
    try {
        const purchases = await prisma.purchaseOrder.findMany({
            include: {
                supplier: true,
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                Date: 'desc'
            }
        });
        
        return NextResponse.json(purchases);
    } catch (error) {
        console.error("Error fetching purchases:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Error fetching purchases.", 
            error: error instanceof Error ? error.message : error 
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data: PurchasePayload = await req.json();
        console.log("Received purchase data:", data);

        const result = await prisma.$transaction(async (tx) => {
            // Create purchase order with items
            const purchaseOrder = await tx.purchaseOrder.create({
                data: {
                    invoiceNo: data.invoiceNo,
                    Date: new Date(data.Date),
                    supplier: {
                        connect: { id: data.supplierId }
                    },
                    status: data.status,
                    notes: data.notes,
                    subtotal: data.subtotal,
                    discount: data.discount,
                    taxableAmount: data.taxableAmount,
                    igst: data.igst,
                    cgst: data.cgst,
                    sgst: data.sgst,
                    totalAmount: data.totalAmount,
                    items: {
                        create: data.items.map((item) => ({
                            variant: {
                                connect: { id: item.variantId }
                            },
                            size: item.size,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            discount: item.discount,
                            totalPrice: item.totalPrice,
                        }))
                    }
                }
            });

            // Update stock for each variant's specific size
            const updatedVariants = [];
            for (const item of data.items) {
                const variant = await tx.variants.findUnique({
                    where: { id: item.variantId }
                });

                if (!variant) {
                    throw new Error(`Variant with ID ${item.variantId} not found.`);
                }

                // Parse sizes JSON array
                const sizes = variant.sizes as any[];
                
                // Find and update the specific size's stock
                const updatedSizes = sizes.map(sizeData => {
                    if (sizeData.size === item.size) {
                        return {
                            ...sizeData,
                            stock: (sizeData.stock || 0) + item.quantity
                        };
                    }
                    return sizeData;
                });

                // Update variant with new sizes array
                const updatedVariant = await tx.variants.update({
                    where: { id: item.variantId },
                    data: {
                        sizes: updatedSizes
                    }
                });
                
                updatedVariants.push(updatedVariant);
            }

            return { purchaseOrder, updatedVariants };
        });

        console.log("Purchase recorded successfully:", result.purchaseOrder.id);
        return NextResponse.json({ 
            success: true, 
            message: "Purchase recorded successfully.",
            id: result.purchaseOrder.id
        }, { status: 201 });
    } catch (error) {
        console.error("Error recording purchase:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Error recording purchase.", 
            error: error instanceof Error ? error.message : error 
        }, { status: 500 });
    }
}

