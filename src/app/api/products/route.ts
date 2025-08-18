import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.products.findMany({
    include: {
      variants: true,
    },
  });
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
