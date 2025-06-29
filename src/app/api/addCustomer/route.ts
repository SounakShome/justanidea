import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        // Check if data is an array
        await prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address,
                GSTIN: data.GSTIN || null,
                State_Name: data.state || null,
                Code: parseInt(data.code) || 0,
                updatedAt: new Date(Date.now()),
            }
        });
        return NextResponse.json({ message: data });
    } catch (error) {
        console.error("Error adding customer:", error);
        return NextResponse.json({ error: "Failed to add customer" }, { status: 500 });
    }
}