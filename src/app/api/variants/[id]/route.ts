import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variants = await prisma.variants.findMany({
    where: { productId: id },
  });

  return Response.json(variants);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();

  const updatedVariant = await prisma.variants.update({
    where: { id },
    data,
  });

  return Response.json(updatedVariant);
}