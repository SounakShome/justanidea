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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();

  try {
    // Validate product exists
    const existingProduct = await prisma.products.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // Validate product name if provided
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        return Response.json({ error: 'Product name must be a non-empty string' }, { status: 400 });
      }
      data.name = data.name.trim();

      // Check if name is unique (excluding current product)
      const existingName = await prisma.products.findFirst({
        where: {
          name: data.name,
          id: { not: id }
        }
      });

      if (existingName) {
        return Response.json({ error: 'Product name already exists' }, { status: 409 });
      }
    }

    // Validate HSN if provided
    if (data.HSN !== undefined) {
      if (typeof data.HSN !== 'number' || data.HSN < 0 || !Number.isInteger(data.HSN)) {
        return Response.json({ error: 'HSN must be a non-negative integer' }, { status: 400 });
      }
    }

    // Update the product
    const updatedProduct = await prisma.products.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.HSN !== undefined && { HSN: data.HSN }),
      },
    });

    return Response.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return Response.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
