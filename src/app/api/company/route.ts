"use server";

import { NextResponse } from "next/server";
import { getCompaniesFromDb } from "@/utils/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    console.log("email", email);

    const session = await auth();
    if (!session?.user) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    const companies = await getCompaniesFromDb();
    return NextResponse.json(companies);
}

export async function POST(req: Request) {
    
    const data = await req.json();
    console.log("data", data);
    const session = await auth();
    if (!session?.user) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    await prisma.company.create({ 
        data: {
            Name: data.companyName,
            Industry: data.industry,
            GSTIN: data.gstin,
            CompanySize: data.companySize,
            Address: data.address,
            CompanyWebsite: data.website || null,
            updatedAt: new Date(),
            users: {
                connect: {
                    email: session.user.email
                }
            },
        },
    });
    const cid = await prisma.company.findFirst({
        where: { Name: data.companyName },
        select: { id: true }
    });
    if (!cid) {
            return NextResponse.json({ error: "Server Error! Refresh the page and try again" }, { status: 404 });
        }
    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            companyId: cid.id || null,
            updatedAt: new Date(),
        },
    });
    return NextResponse.json({ message: "Company created successfully" });
}