import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany();
        return NextResponse.json(suppliers);
    } catch (error) {
        return NextResponse.json({ message: error });
    }
}