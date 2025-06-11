"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();
        console.log("Email:", email, "OTP:", otp);
        const Token  = await prisma.token.findUnique({
            where: { email: email },
        });
        if (!Token) {
            return NextResponse.json({ error: "Server Error! Refresh the page and try again" }, { status: 404 });
        }
        if (parseInt(Token.code) !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }
        const currentTime = Date.now();
        if (Token.expiration.getTime() < currentTime) {
            await prisma.token.delete({ where: { email: email } });
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }
        await prisma.token.delete({ where: { email: email } });
        const user = await prisma.user.create({
            data: {
                email: email,
                verified: true,
                username: "",
                password: "",
                updatedAt: new Date(), // Set current timestamp
            },
        });
        if (!user) {
            return NextResponse.json({ error: "Server Error! Refresh the page and try again" }, { status: 404 });
        }
        return NextResponse.json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
    }
}