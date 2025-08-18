import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orderHistory: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    return Response.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return Response.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        Code: body.Code,
        GSTIN: body.GSTIN,
        State_Name: body.State_Name,
      },
    });
    return Response.json(updated);
  } catch (error) {
    console.error('Error updating customer:', error);
    return Response.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.customer.delete({
      where: { id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return Response.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}