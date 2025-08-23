'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Package, 
  Barcode, 
  CheckCircle, 
  AlertCircle, 
  ShoppingCart,
  Warehouse,
  Plus,
  Minus,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { BarcodeScanner, BarcodeResult } from './BarcodeScanner';

interface ProductVariant {
  id: string;
  name: string;
  size: string;
  price: number;
  sellingPrice: number;
  stock: number;
  supplier?: {
    id: string;
    name: string;
  } | null;
}

interface Product {
  id: string;
  name: string;
  HSN: number;
  barcode: string | null;
  barcodeType: string | null;
  variants: ProductVariant[];
}

interface ProductLookupResult {
  success: boolean;
  product?: Product;
  error?: string;
}

interface InventoryAction {
  type: 'sale' | 'purchase' | 'adjustment' | 'return';
  productId: string;
  variantId: string;
  quantity: number;
  reason?: string;
}

export interface InventoryBarcodeScannerProps {
  onInventoryAction?: (action: InventoryAction) => void;
  onProductSelect?: (product: Product, variant: ProductVariant) => void;
  allowInventoryActions?: boolean;
  title?: string;
  className?: string;
}

export const InventoryBarcodeScanner: React.FC<InventoryBarcodeScannerProps> = ({
  onInventoryAction,
  onProductSelect,
  allowInventoryActions = true,
  title = 'Inventory Scanner',
  className,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionQuantity, setActionQuantity] = useState(1);
  const [scanHistory, setScanHistory] = useState<Array<{ barcode: string; timestamp: Date; product?: Product }>>([]);

  const lookupProduct = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/barcode?action=lookup&barcode=${encodeURIComponent(barcode)}`);
      const result: ProductLookupResult = await response.json();

      if (result.success && result.product) {
        setCurrentProduct(result.product);
        setSelectedVariant(result.product.variants[0] || null);
        
        // Add to scan history
        setScanHistory(prev => [
          { barcode, timestamp: new Date(), product: result.product },
          ...prev.slice(0, 9) // Keep last 10 scans
        ]);

        toast.success(`Product found: ${result.product.name}`);
        
        // Auto-select first variant if there's only one
        if (result.product.variants.length === 1) {
          onProductSelect?.(result.product, result.product.variants[0]);
        }
      } else {
        setCurrentProduct(null);
        setSelectedVariant(null);
        setError(result.error || 'Product not found');
        toast.error(result.error || 'Product not found for this barcode');
        
        // Add failed scan to history
        setScanHistory(prev => [
          { barcode, timestamp: new Date() },
          ...prev.slice(0, 9)
        ]);
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('Failed to lookup product');
      toast.error('Failed to lookup product');
    } finally {
      setLoading(false);
    }
  }, [onProductSelect]);

  const handleScan = useCallback((result: BarcodeResult) => {
    console.log('Barcode scanned:', result);
    lookupProduct(result.text);
  }, [lookupProduct]);

  const handleManualLookup = useCallback(() => {
    if (manualBarcode.trim()) {
      lookupProduct(manualBarcode.trim());
    }
  }, [manualBarcode, lookupProduct]);

  const handleInventoryAction = useCallback((type: InventoryAction['type']) => {
    if (!currentProduct || !selectedVariant) return;

    const action: InventoryAction = {
      type,
      productId: currentProduct.id,
      variantId: selectedVariant.id,
      quantity: actionQuantity,
      reason: `Barcode scanner - ${type}`
    };

    onInventoryAction?.(action);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} action recorded: ${actionQuantity} units`);
  }, [currentProduct, selectedVariant, actionQuantity, onInventoryAction]);

  const clearSelection = useCallback(() => {
    setCurrentProduct(null);
    setSelectedVariant(null);
    setError(null);
    setManualBarcode('');
  }, []);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Barcode className="h-5 w-5" />
              {title}
            </CardTitle>
            <Badge variant={isScanning ? "default" : "secondary"}>
              {isScanning ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="scanner" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scanner">Camera Scanner</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="scanner" className="space-y-4">
              <BarcodeScanner
                onScanAction={handleScan}
                onErrorAction={(error: string) => {
                  setError(error);
                  toast.error(error);
                }}
                autoStart={false}
                continuous={true}
                scanDelay={1000}
              />
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="manual-barcode">Enter Barcode</Label>
                  <Input
                    id="manual-barcode"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Scan or type barcode here..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleManualLookup();
                      }
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleManualLookup}
                    disabled={!manualBarcode.trim() || loading}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Looking up...' : 'Lookup'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Product Display */}
          {currentProduct && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg text-green-800">
                      {currentProduct.name}
                    </CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
                <div className="text-sm text-green-600">
                  HSN: {currentProduct.HSN} | Barcode: {currentProduct.barcode}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Variant Selection */}
                {currentProduct.variants.length > 1 && (
                  <div>
                    <Label>Select Variant:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {currentProduct.variants.map((variant) => (
                        <Button
                          key={variant.id}
                          variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                          onClick={() => {
                            setSelectedVariant(variant);
                            onProductSelect?.(currentProduct, variant);
                          }}
                          className="justify-start h-auto p-3"
                        >
                          <div className="text-left">
                            <div className="font-medium">{variant.name}</div>
                            <div className="text-xs opacity-70">
                              Size: {variant.size} | Stock: {variant.stock} | Price: ₹{variant.sellingPrice}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Variant Details */}
                {selectedVariant && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {selectedVariant.name} ({selectedVariant.size})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs">Stock</Label>
                        <div className="flex items-center gap-1">
                          <Warehouse className="h-3 w-3" />
                          {selectedVariant.stock} units
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Price</Label>
                        <div>₹{selectedVariant.price}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Selling Price</Label>
                        <div>₹{selectedVariant.sellingPrice}</div>
                      </div>
                      <div>
                        <Label className="text-xs">Supplier</Label>
                        <div>{selectedVariant.supplier?.name || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Inventory Actions */}
                    {allowInventoryActions && (
                      <div className="mt-4 space-y-3">
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium">Quick Actions</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => setActionQuantity(Math.max(1, actionQuantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={actionQuantity}
                              onChange={(e) => setActionQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 text-center"
                              min="1"
                            />
                            <Button
                              size="sm"
                              onClick={() => setActionQuantity(actionQuantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInventoryAction('sale')}
                            className="flex items-center gap-1"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Sale
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInventoryAction('purchase')}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Purchase
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInventoryAction('adjustment')}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Adjust
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInventoryAction('return')}
                            className="flex items-center gap-1"
                          >
                            <Minus className="h-3 w-3" />
                            Return
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant={scan.product ? "default" : "destructive"} className="text-xs">
                          {scan.product ? "Found" : "Not Found"}
                        </Badge>
                        <span className="font-mono">{scan.barcode}</span>
                        {scan.product && (
                          <span className="text-gray-600">- {scan.product.name}</span>
                        )}
                      </div>
                      <span className="text-gray-500">
                        {scan.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryBarcodeScanner;
