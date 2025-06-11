import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/db/mongoose';
import Order from '@/models/order';
import Product from '@/models/products';

export async function POST(req: NextRequest) {
    try {
        connectDB();
        const data = await req.json();
        const order = new Order(data);
        await order.save();

        // Update product stock
        for (const item of data.products) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        return NextResponse.json({ message: 'Order placed successfully' });
    } catch (error) {
        console.error('Error placing order:', error);
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}