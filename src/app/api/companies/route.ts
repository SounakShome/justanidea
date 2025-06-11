"use server";

import { NextResponse } from "next/server";
// import { getCompaniesFromDb } from "@/utils/auth";
import { auth } from "@/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    console.log("email", email);

    const session = await auth();
    if (!session?.user) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.json({ message: "Hello, world!" });
    // const companies = await getCompaniesFromDb();
    // return NextResponse.json(companies);
}

export async function POST(req: Request) {
    
    const data = await req.json();
    console.log("data", data);

    const session = await auth();
    if (!session?.user) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.json({ message: "Hello, world!" });
}