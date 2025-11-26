import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.products.findMany({
    include: {
      variants: true,
    },
  });

  // Parse the sizes JSON field for each variant
  const productsWithParsedSizes = products.map(product => ({
    ...product,
    variants: product.variants.map(variant => ({
      ...variant,
      sizes: typeof variant.sizes === 'string' 
        ? JSON.parse(variant.sizes) 
        : Array.isArray(variant.sizes) 
          ? variant.sizes 
          : []
    }))
  }));

  return Response.json(productsWithParsedSizes);
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.products.create({
    data: {
      name: body.name,
      HSN: body.HSN,
    },
  });

  return Response.json(product);
}
