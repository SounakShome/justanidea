import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PurchaseItem {
    id: string | number;
    quantity: number;
    price: number;
    discount: number;
    total: number;
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log("Received purchase data:", data);

        const result = await prisma.$transaction(async (tx: any) => {
            const purchaseOrder = await tx.purchaseOrder.create({
                data: {
                    invoiceNo: data.invoiceNo,
                    Date: new Date(data.purchaseDate),
                    supplier: {
                        connect: { id: data.supplierId }
                    },
                    notes: data.notes,
                    subtotal: data.subTotal,
                    discount: data.discount,
                    taxableAmount: data.taxableAmount,
                    igst: data.igst,
                    cgst: data.cgst,
                    sgst: data.sgst,
                    totalAmount: data.totalAmount,
                    items: {
                        create: data.items.map((item: PurchaseItem) => ({
                            variant: {
                                connect: { id: item.id }
                            },
                            quantity: item.quantity,
                            unitPrice: item.price,
                            discount: item.discount,
                            totalPrice: item.total,
                        }))
                    }
                }
            });
            const updatedVariants = [];
            for (const item of data.items) {
                const variant = await tx.variants.findUnique({
                    where: { id: item.id }
                });

                if (!variant) {
                    throw new Error(`Variant with ID ${item.id} not found.`);
                }

                const updatedVariant = await tx.variants.update({
                    where: { id: item.id },
                    data: {
                        stock: variant.stock + item.quantity
                    }
                });
                updatedVariants.push(updatedVariant);

            }
            return { purchaseOrder, updatedVariants };
        });
        console.log("Purchase recorded successfully:", result?.purchaseOrder, result?.updatedVariants);
        return NextResponse.json({ success: true, message: "Purchase recorded successfully." }, { status: 201 });
    } catch (error) {
        console.error("Error recording purchase:", error);
        return NextResponse.json({ success: false, message: "Error recording purchase.", error: error instanceof Error ? error.message : error }, { status: 500 });
    }
}
