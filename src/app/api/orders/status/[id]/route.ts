import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { order, newStatus} = await req.json();
    const { id } = await params;

    
    if (order.status === "review") {
      // If the status is "review", we can update the order with the new status
      await prisma.order.update({
        where: { id: id },
        data: {
          status: newStatus,
        }
      });
    } else {
      console.log('Updating order:', id, order);
    }

    return Response.json("updatedOrder");
  } catch (error) {
    console.error('Error updating order:', error);
    return Response.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}