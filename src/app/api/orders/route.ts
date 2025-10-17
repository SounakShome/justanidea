import { prisma } from '@/lib/prisma';

// Generate invoice number in format: INV-YYYYMMDD-XXXX
async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const datePrefix = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
  
  // Find the last order created today
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  
  const lastOrder = await prisma.order.findFirst({
    where: {
      order_date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let sequence = 1;
  if (lastOrder && lastOrder.id.startsWith(`INV-${datePrefix}-`)) {
    const lastSequence = parseInt(lastOrder.id.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `INV-${datePrefix}-${sequence.toString().padStart(4, '0')}`;
}

export async function POST(req: Request) {
  const data = await req.json();

  // Generate invoice number automatically
  const invoiceNo = await generateInvoiceNumber();
  
  // Use current date if orderDate is not provided
  const orderDate = data.orderDate ? new Date(data.orderDate) : new Date();

  const order = await prisma.order.create({
    data: {
      id: invoiceNo,
      customer: { connect: { id: data.customerId } },
      order_date: orderDate,
      subtotal: data.subTotal,
      total_amount: data.totalAmount,
      notes: data.notes || null,
      discountType: data.billDiscountType || 'none',
      discount: data.billDiscount || 0,
      remarks: data.remarks || null,
      // Special discount fields remain at default (none/0) - will be set during review
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
    const transformedOrders = orders.map((order: any) => ({
      id: order.id.toString(),
      customerName: order.customer.name,
      date: order.order_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      amount: parseFloat(order.total_amount.toString()),
      status: order.status as 'pending' | 'review' | 'approved',
      items: order.items.map((item: any) => ({
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
      specialDiscount: {
        type: (order.specialDiscountType as 'percentage' | 'amount' | 'none') || 'none',
        value: parseFloat(order.specialDiscount?.toString() || '0') || undefined,
      },
      taxConfig: {
        type: (order.igst > 0 ? 'igst' : 'cgst_sgst') as 'igst' | 'cgst_sgst',
        igstRate: parseFloat(order.igst.toString()) || undefined,
        cgstRate: parseFloat(order.csgt.toString()) || undefined,
        sgstRate: parseFloat(order.sgst.toString()) || undefined,
      },
      notes: order.notes,
      remarks: order.remarks,
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