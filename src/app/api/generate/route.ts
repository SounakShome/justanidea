"use server";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { genrateVerificationCode } from "@/lib/verificationCode";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (user) {
            return NextResponse.redirect(new URL("/onboarding", request.url));
        }
        const { code, expirationTime } = await genrateVerificationCode(email);
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Verification Code",
            html: `<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Verification Code</title></head><body><h1>Your Verification Code</h1><p>Use the following code to verify your email address:</p><h2>${code}</h2><p>This code will expire by ${expirationTime}.</p></body></html>`,
        };
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ errors: "Failed to send email" }, { status: 500 });
    }
}