import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const data = await req.json();

  const order = await prisma.order.create({
    data: {
      id: data.invoiceNo,
      customer: { connect: { id: data.customerId } },
      order_date: data.orderDate,
      subtotal: data.subTotal,
      total_amount: data.totalAmount,
      notes: data.notes,
      items: {
        create: data.items.map((item: { id: string; quantity: number; rate: number; total: number }) => ({
          variant: { connect: { id: item.id } },
          quantity: item.quantity,
          rate: item.rate,
          total: item.total,
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
        product: `${item.variant.product?.name || 'Unknown Product'} - ${item.variant.name}`,
        requestedQty: item.quantity,
        availableQty: item.variant.stock || 0,
        rate: parseFloat(item.rate.toString()),
        discount: parseFloat(item.discount?.toString() || '0'),
        discountType: (item.discountType as 'percentage' | 'amount' | 'none') || 'none',
        productId: item.variant.product?.id,
        variantId: item.variant.id,
      })),
      billDiscount: {
        type: (order.discountType as 'percentage' | 'amount') || 'amount',
        value: parseFloat(order.discount.toString()) || undefined,
      },
      taxConfig: {
        type: (order.igst > 0 ? 'igst' : 'cgst_sgst') as 'igst' | 'cgst_sgst',
        igstRate: parseFloat(order.igst.toString()) || undefined,
        cgstRate: parseFloat(order.csgt.toString()) || undefined,
        sgstRate: parseFloat(order.sgst.toString()) || undefined,
      },
      notes: order.notes,
      customerId: order.customer.id,
    }));

    return Response.json({transformedOrders});
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}