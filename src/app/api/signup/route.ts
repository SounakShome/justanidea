"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saltAndHashPassword } from "@/utils/auth";

export async function POST(request: Request) {
    try {
        const { email, password, fullName } = await request.json();

        const userExists = await prisma.user.findUnique({
            where: { email }
        });
        if (userExists?.onboarded) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const hashedPassword = await saltAndHashPassword(password);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                username: fullName,
                onboarded: true,
                updatedAt: new Date(),
            },
        });
        return NextResponse.json({ message: "Signup successful" }, { status: 200 });
    } catch (error) {
        console.error("Error during signup:", error);
        return NextResponse.json({ error: "An error occurred during signup" }, { status: 500 });
    }

}