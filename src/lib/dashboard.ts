import { prisma } from "@/prisma";

export async function getDashboardData() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
    });
    return products;
}