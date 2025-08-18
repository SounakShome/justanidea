import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variants = await prisma.variants.findMany({
    where: { productId: id },
  });

  return Response.json(variants);
}
