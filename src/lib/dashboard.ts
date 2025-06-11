import Product from "@/models/products";

export async function getDashboardData() {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(10).lean();
    return products;
}