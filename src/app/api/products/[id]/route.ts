import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.products.update({
    where: { product_id: params.id },
    data: {
      name: body.name,
      description: body.description,
      brand: body.brand,
      categoryId: body.categoryId,
    },
  });
  return Response.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.products.delete({
    where: { product_id: params.id },
  });
  return new Response(null, { status: 204 });
}
