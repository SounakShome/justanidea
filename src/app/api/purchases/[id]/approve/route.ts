import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const purchaseId = (await params).id;

        // Validate that the purchase exists
        const existingPurchase = await prisma.purchaseOrder.findUnique({
            where: { id: purchaseId },
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
            }
        });

        if (!existingPurchase) {
            return NextResponse.json({
                success: false,
                message: "Purchase order not found"
            }, { status: 404 });
        }

        // Check if already approved (received)
        if (existingPurchase.status === 'RECEIVED') {
            return NextResponse.json({
                success: false,
                message: "Purchase order is already approved (received)"
            }, { status: 400 });
        }

        // Update purchase status to received (approved)
        const updatedPurchase = await prisma.purchaseOrder.update({
            where: { id: purchaseId },
            data: {
                status: 'RECEIVED',
                updatedAt: new Date()
            },
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
            }
        });

        return NextResponse.json({
            success: true,
            message: "Purchase order approved successfully",
            data: updatedPurchase
        }, { status: 200 });

    } catch (error) {
        console.error("Error approving purchase:", error);
        return NextResponse.json({
            success: false,
            message: "Error approving purchase order",
            error: error instanceof Error ? error.message : error
        }, { status: 500 });
    }
}
