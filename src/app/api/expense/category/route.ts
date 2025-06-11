"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/mongoose";
import ExpenseCategory from "@/models/expenseCategory";

export async function GET() {
    try {
        await dbConnect();
        const categories = await ExpenseCategory.find({}).sort({ createdAt: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { category } = await request.json();
        const newCategory = new ExpenseCategory({ category });
        await newCategory.save();
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}