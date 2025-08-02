import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";

// Define proper types for better type safety
interface Product {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  name: string;
  size: string;
}

interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variant: Variant;
  quantity: number;
  price: number;
  total: number;
}

interface ProductCardProps {
  products: Product[];
  value: OrderItem;
  onChange: (value: OrderItem) => void;
  onRemove: () => void;
}

export default function ProductCard({ value, onChange, onRemove }: ProductCardProps) {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 1;
    const total = value.price * quantity;
    
    onChange({
      ...value,
      quantity,
      total
    });
  };

  return (
    <div className="border rounded-md p-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Product Details - Mobile & Desktop */}
        <div className="col-span-1 md:col-span-5">
          <div>
            <p className="font-medium">{value.product?.name || "Unknown Product"}</p>
            <p className="text-sm text-muted-foreground">
              {value.variant?.name || ""} {value.variant?.size ? `- ${value.variant.size}` : ""}
            </p>
          </div>
        </div>

        {/* Price - Mobile & Desktop */}
        <div className="col-span-1 md:col-span-2">
          <div className="md:hidden text-sm text-muted-foreground mb-1">Price</div>
          <p className="font-medium">₹{(value.price || 0).toFixed(2)}</p>
        </div>

        {/* Quantity - Mobile & Desktop */}
        <div className="col-span-1 md:col-span-2">
          <div className="md:hidden text-sm text-muted-foreground mb-1">Quantity</div>
          <div className="flex items-center">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                const newQty = Math.max(1, value.quantity - 1);
                const newTotal = value.price * newQty;
                onChange({ ...value, quantity: newQty, total: newTotal });
              }}
            >
              -
            </Button>
            <Input
              type="number"
              min="1"
              value={value.quantity}
              onChange={handleQuantityChange}
              className="h-8 w-14 mx-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                const newQty = value.quantity + 1;
                const newTotal = value.price * newQty;
                onChange({ ...value, quantity: newQty, total: newTotal });
              }}
            >
              +
            </Button>
          </div>
        </div>

        {/* Total - Mobile & Desktop */}
        <div className="col-span-1 md:col-span-2">
          <div className="md:hidden text-sm text-muted-foreground mb-1">Total</div>
          <p className="font-medium">₹{((value.price || 0) * (value.quantity || 0)).toFixed(2)}</p>
        </div>

        {/* Actions - Mobile & Desktop */}
        <div className="col-span-1 md:text-right">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
