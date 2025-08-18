import { prisma } from '@/lib/prisma';


export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            GSTIN: true,
            State_Name: true,
            Code: true,
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
                    HSN: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend interface
    const transformedOrder = {
      id: order.id,
      invoiceNo: order.id,
      customerId: order.customer.id,
      customer: order.customer,
      orderDate: order.order_date,
      status: order.status,
      notes: order.notes,
      subTotal: parseFloat(order.subtotal.toString()),
      totalAmount: parseFloat(order.total_amount.toString()),
      items: order.items.map(item => ({
        id: item.variant.id,
        quantity: item.quantity,
        rate: parseFloat(item.rate.toString()),
        total: parseFloat(item.rate.toString()) * item.quantity,
        variant: {
          id: item.variant.id,
          name: item.variant.name,
          size: item.variant.size,
          price: parseFloat(item.variant.price.toString()),
          stock: item.variant.stock,
        },
        product: {
          id: item.variant.product?.id,
          name: item.variant.product?.name,
          HSN: item.variant.product?.HSN,
        },
      })),
    };

    return Response.json(transformedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return Response.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const orderId = params.id;

    console.log('Updating order:', orderId, 'with data:', data);

    // Update the order with new data
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: data.status,
        notes: data.notes,
        // Update bill-level discount and tax information
        discountType: data.billDiscount?.type || 'none',
        discount: data.billDiscount?.value || 0,
        csgt: data.taxConfig?.cgstRate || 0,
        sgst: data.taxConfig?.sgstRate || 0,
        igst: data.taxConfig?.igstRate || 0,
      },
    });

    // Update order items if provided
    if (data.items && Array.isArray(data.items)) {
      // Delete existing items
      await prisma.order_items.deleteMany({
        where: { orderId: orderId },
      });

      // Create new items
      await prisma.order_items.createMany({
        data: data.items.map((item: {
          variantId?: string;
          id?: string;
          requestedQty?: number;
          quantity?: number;
          rate?: number;
          price?: number;
          discountType?: string;
          discount?: number;
        }) => ({
          orderId: orderId,
          variantId: item.variantId || item.id || '',
          quantity: item.requestedQty || item.quantity || 0,
          rate: item.rate || item.price || 0,
          discountType: item.discountType || 'none',
          discount: item.discount || 0,
          total: (item.requestedQty || item.quantity || 0) * (item.rate || item.price || 0) - (item.discount || 0),
        })),
      });
    }

    // Fetch the updated order with relations
    const finalOrder = await prisma.order.findUnique({
      where: { id: orderId },
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
    });

    return Response.json(finalOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return Response.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;

    // Delete order items first (due to foreign key constraints)
    await prisma.order_items.deleteMany({
      where: { orderId: orderId },
    });

    // Delete the order
    const deletedOrder = await prisma.order.delete({
      where: { id: orderId },
    });

    return Response.json({ message: 'Order deleted successfully', order: deletedOrder });
  } catch (error) {
    console.error('Error deleting order:', error);
    return Response.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
