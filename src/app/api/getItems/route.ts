"use server"
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest){
    try{
        const data = await req.json();
        console.log(data);
        return NextResponse.json({message: data});
    } catch (error) {
        return NextResponse.json({message: error});
    }
}

export async function GET() {
    try {
        const items = await prisma.products.findMany();
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}