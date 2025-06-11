"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/mongoose";
import Purchase from "@/models/purchase";
import Product from "@/models/products"; // make sure correct model name!
import { PurchaseProduct } from "@/types/purchase";
import { SizeDetail, ProductVariant } from "@/types/product";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        for (const item of body.products) {
            const productInDB = await Product.findOne({ productId: item.productId, });
            if (productInDB) {
                for (const variant of item.variants) {
                    const exists = productInDB.variants.find((v: ProductVariant) => v.name === variant.name);
                    if (exists) {
                        const size = exists.sizes.find((s: SizeDetail) => s.size === variant.size);
                        if (!size) {
                            // Size doesn't exist, push new size
                            exists.sizes.push({
                                size: variant.size,
                                qty: variant.qty,
                                buyingPrice: variant.buyingPrice,
                                sellingPrice: variant.sellingPrice,
                            });
                            console.log("exists", exists);
                        } else {
                            console.log("size", size);
                            size.qty += variant.qty; // Increment quantity
                            console.log("updatesSize", size);
                        }
                    }
                    await productInDB.save(); // Save the updated product
                }
            }
        }

        // 📦 Save the purchase record
        const newPurchase = new Purchase({
            purchaseId: body.purchaseId,
            date: body.date,
            products: body.products.map((item: PurchaseProduct) => ({
                productId: item.productId,
                variants: item.variants.map((variant) => ({
                    name: variant.name,
                    size: variant.size,
                    qty: variant.qty,
                    buyingPrice: variant.buyingPrice,
                    sellingPrice: variant.sellingPrice
                }))
            }))
        });

        await newPurchase.save();

        return NextResponse.json({ success: true, message: "Purchase recorded successfully." }, { status: 201 });

    } catch (error) {
        console.error("Error recording purchase:", error);
        return NextResponse.json({ success: false, message: "Error recording purchase.", error: error instanceof Error ? error.message : error }, { status: 500 });
    }
}
