"use server";

import otp from "otp-generator";
import { prisma } from "@/lib/prisma";

export async function genrateVerificationCode(email: string) {
    try {

        const existingToken = await prisma.token.findUnique({
            where: { email: email },
        });
        if (existingToken) {
            const currentTime = Date.now();
            if (existingToken.expiration.getTime() > currentTime) {
                return { code: existingToken.code, expirationTime: existingToken.expiration };
            } else {
                await prisma.token.delete({ where: { email: email } });
            }
        }

        const code = otp.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
        await prisma.token.create({
            data: {
                email: email,
                code: code,
                expiration: expirationTime,
            },
        });

        return { code, expirationTime };

    } catch (error) {
        console.error("Error generating verification code:", error);
        throw new Error("Failed to generate verification code");
    }

}
