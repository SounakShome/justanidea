import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const data = await req.json();

  const { customerId, items, notes, total } = data;

  const order = await prisma.order.create({
    data: {
      customer: { connect: { id: customerId } },
      order_date: new Date(),
      total_amount: total,
      notes: notes,
      items: {
        create: items.map((item: { variantId: string; quantity: number; price: number }) => ({
          variant: { connect: { id: item.variantId } },
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  return Response.json(order);
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        order_date: 'desc',
      },
    });

    // Transform the data to match the frontend interface
    const transformedOrders = orders.map(order => ({
      id: order.id.toString(),
      customerName: order.customer.name,
      date: order.order_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      amount: parseFloat(order.total_amount.toString()),
      status: order.status as 'pending' | 'review' | 'approved',
      items: order.items.map(item => ({
        product: item.variant.product?.name || item.variant.name || 'Unknown Product',
        requestedQty: item.quantity,
        availableQty: item.variant.stock || 0,
        productId: item.variant.product?.id,
        variantId: item.variant.id,
        price: parseFloat(item.price.toString()),
      })),
      notes: order.notes,
      customerId: order.customer.id,
    }));

    return Response.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}