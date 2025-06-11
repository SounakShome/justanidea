// models/purchase.ts
import { Schema, models, model } from "mongoose";

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    size: { type: String, required: true },
    qty: { type: Number, required: true },
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    productId: { type: String, required: true },
    variants: { type: [VariantSchema], required: true },
  },
  { _id: false }
);

const PurchaseSchema = new Schema(
  {
    purchaseId: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    products: { type: [ProductSchema], required: true },
  },
  { timestamps: true }
);

const Purchase = models.Purchase || model("Purchase", PurchaseSchema);

export default Purchase;
