"use server"
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose";
import Product from "@/models/products";

export async function POST(req: NextRequest) {
    try {
        connectDB();
        const data = await req.json();
        const p =new Product(data);
        await p.save();
        return NextResponse.json({ message: data });
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}