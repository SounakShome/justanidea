import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.customer.update({
    where: { customer_id: params.id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
    },
  });
  return Response.json(updated);
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.customer.delete({
    where: { customer_id: params.id },
  });
  return new Response(null, { status: 204 });
}