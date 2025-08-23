'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  InventoryBarcodeScanner, 
  BarcodeManagement 
} from '@/components/barcode';
import { 
  Package, 
  ShoppingCart, 
  Warehouse, 
  Settings,
  Info
} from 'lucide-react';

interface InventoryAction {
  type: 'sale' | 'purchase' | 'adjustment' | 'return';
  productId: string;
  variantId: string;
  quantity: number;
  reason?: string;
  timestamp: Date;
}

export default function BarcodeDemoPage() {
  const [actions, setActions] = useState<InventoryAction[]>([]);

  const handleInventoryAction = (action: Omit<InventoryAction, 'timestamp'>) => {
    const newAction: InventoryAction = {
      ...action,
      timestamp: new Date()
    };
    
    setActions(prev => [newAction, ...prev.slice(0, 9)]); // Keep last 10 actions
    
    // Here you would typically:
    // 1. Update your inventory state/store
    // 2. Make API calls to update the database
    // 3. Log the action for audit purposes
    console.log('Inventory action:', newAction);
  };

  const handleProductSelect = (product: any, variant: any) => {
    console.log('Product selected:', { product, variant });
    // Here you would typically:
    // 1. Add to cart/order
    // 2. Show product details
    // 3. Navigate to product page
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Barcode Scanner System</h1>
        <p className="text-gray-600">
          Robust and modular barcode scanning for inventory management
        </p>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Product Lookup</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-500" />
              <span className="text-sm">Inventory Actions</span>
            </div>
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Stock Management</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Barcode Assignment</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scanner">Inventory Scanner</TabsTrigger>
          <TabsTrigger value="management">Barcode Management</TabsTrigger>
          <TabsTrigger value="actions">Action Log</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Use the camera to scan barcodes or enter them manually. The system will look up products 
              and allow you to perform inventory actions like sales, purchases, and adjustments.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryBarcodeScanner
              onInventoryAction={handleInventoryAction}
              onProductSelect={handleProductSelect}
              allowInventoryActions={true}
              title="Inventory Scanner"
            />

            <Card>
              <CardHeader>
                <CardTitle>Integration Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Basic Scanner</h4>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {`<BarcodeScanner onScan={handleScan} />`}
                  </code>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Inventory Scanner</h4>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {`<InventoryBarcodeScanner
  onInventoryAction={handleAction}
  onProductSelect={handleSelect}
/>`}
                  </code>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. API Integration</h4>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {`// Lookup product
const result = await BarcodeService
  .lookupProductByBarcode(barcode);`}
                  </code>
                </div>

                <div>
                  <h4 className="font-medium mb-2">4. Manual Entry</h4>
                  <p className="text-sm text-gray-600">
                    Scanner supports both camera scanning and manual barcode entry for flexibility.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management">
          <Alert className="mb-6">
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Assign barcodes to your products. Each product can have one unique barcode that 
              identifies all its variants.
            </AlertDescription>
          </Alert>

          <BarcodeManagement />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This shows recent inventory actions performed through the barcode scanner. 
              In a real application, these would be saved to your database.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No actions yet. Scan some products and perform inventory actions to see them here.
                </p>
              ) : (
                <div className="space-y-3">
                  {actions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={
                            action.type === 'sale' ? 'destructive' :
                            action.type === 'purchase' ? 'default' :
                            action.type === 'return' ? 'secondary' : 'outline'
                          }
                        >
                          {action.type}
                        </Badge>
                        <div className="text-sm">
                          <div className="font-medium">
                            {action.quantity} units
                          </div>
                          <div className="text-gray-600">
                            Product: {action.productId.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {action.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
