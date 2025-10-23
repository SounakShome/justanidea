import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.products.findMany({
    include: {
      variants: true,
    },
  });

  // Return products with variants as-is, sizes will be in the JSON field
  return Response.json(products);
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
