import { Schema, model, models } from "mongoose";

const SizeDetailSchema = new Schema(
  {
    size: { type: String, required: true },
    qty: { type: Number, required: true, default: 0 },
    buyingPrice: { type: Number, required: true },  
    sellingPrice: { type: Number, required: true }, 
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    sizes: [SizeDetailSchema],
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    productId: { type: String, required: true, unique: true },
    productName: { type: String },
    variants: [VariantSchema],
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);
export default Product;
