import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const res = await prisma.products.create({
            data: {
                name: data.name,
                HSN : parseInt(data.HSN) || 0
            }
        });
        console.log("Product added successfully:", res);
        return NextResponse.json({ message: data });
    } catch (error) {
        console.error("Error adding product:", error);
        return NextResponse.json({ message: error });
    }
}