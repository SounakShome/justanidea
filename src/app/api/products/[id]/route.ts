import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.products.findUnique({
    where: { id },
    include: {
      variants: true,
    },
  });

  if (!product) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }

  return Response.json(product);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const product = await prisma.products.update({
    where: { id },
    data: {
      name: body.name,
      HSN: body.HSN,
    },
  });

  return Response.json(product);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.products.delete({
    where: { id },
  });

  return Response.json({ message: 'Product deleted successfully' });
}
