import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { customerId, items, totalAmount } = await req.json();

  const order = await prisma.order.create({
    data: {
      customer: { connect: { customer_id: customerId } },
      total_amount: totalAmount,
      order_date: new Date(),
      status: 'Pending',
      items: {
        create: items.map((item: any) => ({
          variant: { connect: { id: item.variantId } },
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  return Response.json(order);
}
