"use server"
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose";

export async function POST(req: NextRequest){
    try{
        connectDB();
        const data = await req.json();
        console.log(data);
        return NextResponse.json({message: data});
    } catch (error) {
        return NextResponse.json({message: error});
    }
}