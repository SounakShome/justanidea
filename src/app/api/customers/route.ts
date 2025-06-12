import { prisma } from '@/lib/prisma';

export async function GET() {
  const customers = await prisma.customer.findMany();
  return Response.json(customers);
}
