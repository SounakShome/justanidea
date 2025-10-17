import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompactBarcodeScanner } from "@/components/CompactBarcodeScanner";

// Define proper types
interface Variant {
  id: string;
  name: string;
  size: string;
  price: number;
  stock: number;
  productId: string;
}

interface Product {
  id: string;
  name: string;
  HSN: number;
  variants: Variant[];
}

interface NewOrderLineProps {
  products: Product[];
  onProductSelect: (product: Product, variant: Variant, quantity: number) => void;
}

export function NewOrderLine({ products, onProductSelect }: NewOrderLineProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState<number | "">("");
  const [showVariants, setShowVariants] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (!query) {
      setFilteredProducts([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = products.filter(product => 
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.variants.some((variant) => 
        variant.name.toLowerCase().includes(lowerCaseQuery)
      )
    );
    
    setFilteredProducts(results);
  }, [query, products]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowResults(false);
    setQuery(product.name);
    
    if (product.variants.length === 1) {
      setSelectedVariant(product.variants[0]);
    } else {
      setShowVariants(true);
    }
  };
  
  const handleSelectVariant = (variant: Variant) => {
    setSelectedVariant(variant);
    setShowVariants(false);
  };
  
  const handleAddProduct = () => {
    if (selectedProduct && selectedVariant && quantity && typeof quantity === 'number') {
      onProductSelect(selectedProduct, selectedVariant, quantity);
      setSelectedProduct(null);
      setSelectedVariant(null);
      setQuantity("");
      setQuery("");
      setShowVariants(false);
    }
  };

  const handleBarcodeScanned = (code: string) => {
    // Search for products with matching barcode
    const matchingProduct = products.find(product => 
      product.variants.some(variant => variant.id === code || variant.name.includes(code))
    );
    
    if (matchingProduct) {
      setQuery(matchingProduct.name);
      handleSelectProduct(matchingProduct);
    } else {
      // If no product found, set the barcode as search query
      setQuery(code);
      setShowResults(true);
    }
  };

  return (
    <div className="border border-dashed rounded-md p-4" ref={wrapperRef}>
      <h3 className="font-medium mb-4">Add Product</h3>
      
      {/* Product Search */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-primary">
              <Search className="h-4 w-4 mr-2 text-muted-foreground" />
              <Input
                className="border-0 p-0 shadow-none focus-visible:ring-0"
                placeholder="Search for a product..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
            </div>
          </div>
          <CompactBarcodeScanner 
            onScanSuccessAction={handleBarcodeScanned}
            buttonText="Scan"
            buttonVariant="outline"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && filteredProducts.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            <ScrollArea className="max-h-60">
              <div className="py-1">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="px-4 py-2 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      HSN: {product.HSN} • {product.variants.length} variants available
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
      
      {/* Variant Selection (if product is selected) */}
      {selectedProduct && (
        <div className="mb-4">
          <div 
            className="flex justify-between items-center border rounded-md px-3 py-2 cursor-pointer"
            onClick={() => setShowVariants(!showVariants)}
          >
            <span className="text-sm">
              {selectedVariant 
                ? `${selectedVariant.name} - ${selectedVariant.size} - ₹${selectedVariant.price.toFixed(2)}` 
                : "Select a variant"}
            </span>
            {showVariants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          
          {showVariants && (
            <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
              {selectedProduct.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="px-3 py-2 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSelectVariant(variant)}
                >
                  <div className="flex justify-between">
                    <span>{variant.name} - {variant.size}</span>
                    <span className="font-medium">₹{variant.price.toFixed(2)}</span>
                  </div>
                  <p className={`text-xs ${variant.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {variant.stock > 0 ? `In stock (${variant.stock})` : 'Out of stock'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Quantity and Add Button */}
      {selectedProduct && selectedVariant && (
        <div className="flex items-end gap-4">
          <div className="w-24">
            <label className="block text-sm mb-1">Quantity</label>
            <Input
              type="number"
              min="1"
              max={selectedVariant.stock > 0 ? selectedVariant.stock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === "" ? "" : parseInt(e.target.value))}
              placeholder="Enter quantity"
            />
          </div>
          <Button 
            onClick={handleAddProduct} 
            className="flex-1"
            disabled={!selectedVariant || selectedVariant.stock <= 0 || !quantity || typeof quantity !== 'number'}
          >
            <Plus className="h-4 w-4 mr-2" /> Add to Order
          </Button>
        </div>
      )}
    </div>
  );
}
