import { NextRequest, NextResponse } from "next/server";
import customer from "@/models/customer";
import connectDB from "@/db/mongoose";

export async function POST(req: NextRequest) {
    try {
        connectDB();
        const data = await req.json();
        // Check if data is an array
        for(let i = 0; i < data.length; i++) {
            const c = new customer(data[i]);
            await c.save();
        }
        return NextResponse.json({ message: data });
    } catch (error) {
        console.error("Error adding customer:", error);
        return NextResponse.json({ error: "Failed to add customer" }, { status: 500 });
    }
}