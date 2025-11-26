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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();

  try {
    // Validate variant exists
    const existingVariant = await prisma.variants.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      return Response.json({ error: 'Variant not found' }, { status: 404 });
    }

    // Validate sizes if provided
    if (data.sizes) {
      // Check if sizes is an array
      if (!Array.isArray(data.sizes)) {
        return Response.json({ error: 'Sizes must be an array' }, { status: 400 });
      }

      // Validate each size entry
      for (const size of data.sizes) {
        if (!size.size || typeof size.size !== 'string') {
          return Response.json({ error: 'Each size must have a valid size name' }, { status: 400 });
        }
        
        if (typeof size.buyingPrice !== 'number' || size.buyingPrice < 0) {
          return Response.json({ error: 'Buying price must be a non-negative number' }, { status: 400 });
        }
        
        if (typeof size.sellingPrice !== 'number' || size.sellingPrice < 0) {
          return Response.json({ error: 'Selling price must be a non-negative number' }, { status: 400 });
        }
        
        if (typeof size.stock !== 'number' || size.stock < 0 || !Number.isInteger(size.stock)) {
          return Response.json({ error: 'Stock must be a non-negative integer' }, { status: 400 });
        }
      }

      // Check for duplicate sizes
      const sizeNames = data.sizes.map((s: { size: string }) => s.size);
      const uniqueSizes = new Set(sizeNames);
      if (sizeNames.length !== uniqueSizes.size) {
        return Response.json({ error: 'Duplicate sizes are not allowed' }, { status: 400 });
      }

      // Convert to JSON string for Prisma
      data.sizes = JSON.stringify(data.sizes);
    }

    // Validate variant name if provided
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        return Response.json({ error: 'Variant name must be a non-empty string' }, { status: 400 });
      }
      data.name = data.name.trim();
    }

    // Validate barcode if provided
    if (data.barcode !== undefined && data.barcode !== null) {
      if (typeof data.barcode !== 'string' || data.barcode.trim().length === 0) {
        return Response.json({ error: 'Barcode must be a non-empty string or null' }, { status: 400 });
      }
      data.barcode = data.barcode.trim();

      // Check if barcode is unique (excluding current variant)
      const existingBarcode = await prisma.variants.findFirst({
        where: {
          barcode: data.barcode,
          id: { not: id }
        }
      });

      if (existingBarcode) {
        return Response.json({ error: 'Barcode already exists for another variant' }, { status: 409 });
      }
    }

    // Update the variant
    const updatedVariant = await prisma.variants.update({
      where: { id },
      data,
    });

    return Response.json(updatedVariant);
  } catch (error) {
    console.error('Error updating variant:', error);
    return Response.json({ 
      error: 'Failed to update variant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
