import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.products.findUnique({
    where: { id: params.id },
    include: {
      variants: true,
    },
  });

  if (!product) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }

  return Response.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const product = await prisma.products.update({
    where: { id: params.id },
    data: {
      name: body.name,
      HSN: body.HSN,
    },
  });

  return Response.json(product);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.products.delete({
    where: { id: params.id },
  });

  return Response.json({ message: 'Product deleted successfully' });
}
