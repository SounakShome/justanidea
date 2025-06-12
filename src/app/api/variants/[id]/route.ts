import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const variants = await prisma.variants.findMany({
    where: { productId: params.id },
  });

  return Response.json(variants);
}
