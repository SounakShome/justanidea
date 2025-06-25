import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        await prisma.supplier.create({
            data: {
                name: data.companyName,
                division: data.division,
                phone: data.phone,
                address: data.address,
                CIN: data.CIN || null,
                GSTIN: data.GSTIN || null,
                PAN: data.PAN || null,
                Supp_State: data.Supp_State || null,
                Code: parseInt(data.code) || 0
            }
        });
        return NextResponse.json({ message: data });
    } catch (error) {
        console.error("Error adding customer:", error);
        return NextResponse.json({ error: "Failed to add customer" }, { status: 500 });
    }
}