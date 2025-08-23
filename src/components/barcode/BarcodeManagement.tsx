'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Barcode, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Package,
  AlertCircle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  HSN: number;
  barcode: string | null;
  barcodeType: string | null;
  variantCount: number;
}

const BARCODE_TYPES = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'CODE39', label: 'Code 39' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPC_A', label: 'UPC-A' },
  { value: 'UPC_E', label: 'UPC-E' },
  { value: 'QR_CODE', label: 'QR Code' },
];

export const BarcodeManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newBarcode, setNewBarcode] = useState('');
  const [newBarcodeType, setNewBarcodeType] = useState('CODE128');
  const [saving, setSaving] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            HSN: p.HSN,
            barcode: p.barcode,
            barcodeType: p.barcodeType,
            variantCount: p.variants?.length || 0
          })));
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBarcode = async () => {
    if (!editingProduct || !newBarcode) return;

    setSaving(true);
    try {
      const response = await fetch('/api/barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          productId: editingProduct.id,
          barcode: newBarcode,
          barcodeType: newBarcodeType,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Barcode assigned successfully');
        setProducts(prev => 
          prev.map(p => 
            p.id === editingProduct.id 
              ? { ...p, barcode: newBarcode, barcodeType: newBarcodeType }
              : p
          )
        );
        setShowAssignDialog(false);
        setEditingProduct(null);
        setNewBarcode('');
      } else {
        toast.error(result.error || 'Failed to assign barcode');
      }
    } catch (error) {
      console.error('Error assigning barcode:', error);
      toast.error('Failed to assign barcode');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBarcode = async (product: Product) => {
    if (!confirm('Are you sure you want to remove this barcode?')) return;

    try {
      const response = await fetch('/api/barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove',
          productId: product.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Barcode removed successfully');
        setProducts(prev => 
          prev.map(p => 
            p.id === product.id 
              ? { ...p, barcode: null, barcodeType: null }
              : p
          )
        );
      } else {
        toast.error(result.error || 'Failed to remove barcode');
      }
    } catch (error) {
      console.error('Error removing barcode:', error);
      toast.error('Failed to remove barcode');
    }
  };

  const openAssignDialog = (product: Product) => {
    setEditingProduct(product);
    setNewBarcode(product.barcode || '');
    setNewBarcodeType(product.barcodeType || 'CODE128');
    setShowAssignDialog(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const productsWithBarcodes = products.filter(p => p.barcode);
  const productsWithoutBarcodes = products.filter(p => !p.barcode);

  const exportBarcodes = () => {
    const csvContent = [
      ['Product Name', 'HSN', 'Barcode', 'Barcode Type', 'Variants'],
      ...productsWithBarcodes.map(p => [
        p.name,
        p.HSN.toString(),
        p.barcode || '',
        p.barcodeType || '',
        p.variantCount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barcodes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Barcode data exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Barcode className="h-6 w-6" />
            Barcode Management
          </h1>
          <p className="text-gray-600">Assign and manage barcodes for your products</p>
        </div>
        <Button onClick={exportBarcodes} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Barcodes
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Barcodes</p>
                <p className="text-2xl font-bold text-green-600">{productsWithBarcodes.length}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Without Barcodes</p>
                <p className="text-2xl font-bold text-orange-600">{productsWithoutBarcodes.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by product name or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>HSN</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.HSN}</TableCell>
                    <TableCell>{product.variantCount}</TableCell>
                    <TableCell>
                      {product.barcode ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {product.barcode}
                        </code>
                      ) : (
                        <span className="text-gray-400">No barcode</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.barcodeType && (
                        <Badge variant="outline">{product.barcodeType}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.barcode ? "default" : "secondary"}
                        className={product.barcode ? "bg-green-100 text-green-800" : ""}
                      >
                        {product.barcode ? "Assigned" : "Unassigned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignDialog(product)}
                        >
                          {product.barcode ? <Edit className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </Button>
                        {product.barcode && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveBarcode(product)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Barcode Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.barcode ? 'Edit Barcode' : 'Assign Barcode'}
            </DialogTitle>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Product</Label>
                <p className="font-medium">{editingProduct.name}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  placeholder="Enter barcode value"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode-type">Barcode Type</Label>
                <Select value={newBarcodeType} onValueChange={setNewBarcodeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BARCODE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAssignBarcode}
                  disabled={!newBarcode || saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarcodeManagement;
