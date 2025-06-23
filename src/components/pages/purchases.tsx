'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import {
    Plus,
    Trash2,
    Save,
    Send,
    CalendarIcon,
    Search,
    Building2,
    Package,
    Calculator,
    FileText,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

interface PurchaseItem {
    id: string;
    productName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    total: number;
}

interface Vendor {
    id: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
}

const mockVendors: Vendor[] = [
    {
        id: '1',
        name: 'ABC Suppliers Ltd.',
        code: 'ABC001',
        email: 'orders@abcsuppliers.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business St, City, State 12345'
    },
    {
        id: '2',
        name: 'XYZ Trading Co.',
        code: 'XYZ002',
        email: 'sales@xyztrading.com',
        phone: '+1 (555) 987-6543',
        address: '456 Commerce Ave, City, State 67890'
    },
    {
        id: '3',
        name: 'Global Parts Inc.',
        code: 'GPI003',
        email: 'info@globalparts.com',
        phone: '+1 (555) 456-7890',
        address: '789 Industrial Blvd, City, State 11111'
    }
];

export default function PurchaseEntryPage() {
    const [purchaseOrder, setPurchaseOrder] = useState({
        poNumber: `PO-${Date.now()}`,
        vendor: null as Vendor | null,
        orderDate: new Date(),
        expectedDeliveryDate: null as Date | null,
        paymentTerms: '',
        priority: 'medium',
        status: 'draft',
        notes: '',
        items: [] as PurchaseItem[],
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: 0
    });

    const [searchTerm, setSearchTerm] = useState('');

    const filteredVendors = mockVendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addItem = () => {
        const newItem: PurchaseItem = {
            id: Date.now().toString(),
            productName: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            taxRate: 18,
            total: 0
        };
        setPurchaseOrder(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    const removeItem = (id: string) => {
        setPurchaseOrder(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const updateItem = (id: string, field: keyof PurchaseItem, value: PurchaseItem[typeof field]) => {
        setPurchaseOrder(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    // Calculate total for this item
                    const subtotal = updatedItem.quantity * updatedItem.unitPrice;
                    const discountAmount = (subtotal * updatedItem.discount) / 100;
                    const taxableAmount = subtotal - discountAmount;
                    const taxAmount = (taxableAmount * updatedItem.taxRate) / 100;
                    updatedItem.total = taxableAmount + taxAmount;
                    return updatedItem;
                }
                return item;
            })
        }));
    };

    // Calculate totals whenever items change
    useEffect(() => {
        const subtotal = purchaseOrder.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0);

        const totalDiscount = purchaseOrder.items.reduce((sum, item) => {
            return sum + ((item.quantity * item.unitPrice * item.discount) / 100);
        }, 0);

        const totalTax = purchaseOrder.items.reduce((sum, item) => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const itemDiscount = (itemSubtotal * item.discount) / 100;
            const taxableAmount = itemSubtotal - itemDiscount;
            return sum + ((taxableAmount * item.taxRate) / 100);
        }, 0);

        const grandTotal = subtotal - totalDiscount + totalTax;

        setPurchaseOrder(prev => ({
            ...prev,
            subtotal,
            totalDiscount,
            totalTax,
            grandTotal
        }));
    }, [purchaseOrder.items]);

    const handleSave = () => {
        if (!purchaseOrder.vendor) {
            toast.error('Please select a vendor');
            return;
        }
        if (purchaseOrder.items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }
        toast.success('Purchase order saved successfully');
    };

    const handleSubmit = () => {
        if (!purchaseOrder.vendor) {
            toast.error('Please select a vendor');
            return;
        }
        if (purchaseOrder.items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }
        toast.success('Purchase order submitted for approval');
    };
    function formatDate(date: Date | undefined) {
        if (!date) {
            return ""
        }
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
    }
    function isValidDate(date: Date | undefined) {
        if (!date) {
            return false
        }
        return !isNaN(date.getTime())
    }

    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(
        new Date("2025-06-01")
    )
    const [month, setMonth] = useState<Date | undefined>(date)
    const [value, setValue] = useState(formatDate(date))

    return (
        <div className="min-h-screen pt-2 md:pt-2 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <SiteHeader name="Purchase Order Entry" />

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vendor Selection */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Supplier Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search suppliers by name or code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {searchTerm && (
                                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                                        {filteredVendors.map((vendor) => (
                                            <div
                                                key={vendor.id}
                                                className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                                                onClick={() => {
                                                    setPurchaseOrder(prev => ({ ...prev, vendor }));
                                                    setSearchTerm('');
                                                }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900">{vendor.name}</h4>
                                                        <p className="text-sm text-slate-600">{vendor.code}</p>
                                                        <p className="text-sm text-slate-500">{vendor.email}</p>
                                                    </div>
                                                    <Badge variant="outline">{vendor.code}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {purchaseOrder.vendor && (
                                    <Card className="bg-blue-50 border-blue-200">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-blue-900">{purchaseOrder.vendor.name}</h4>
                                                    <p className="text-sm text-blue-700">{purchaseOrder.vendor.email}</p>
                                                    <p className="text-sm text-blue-600">{purchaseOrder.vendor.phone}</p>
                                                    <p className="text-sm text-blue-600">{purchaseOrder.vendor.address}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPurchaseOrder(prev => ({ ...prev, vendor: null }))}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Change
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Details */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Order Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-3">
                                            <Label htmlFor="date" className="px-1">
                                                Subscription Date
                                            </Label>
                                            <div className="relative flex gap-2">
                                                <Input
                                                    id="date"
                                                    value={value}
                                                    placeholder="June 01, 2025"
                                                    className="bg-background pr-10"
                                                    onChange={(e) => {
                                                        const date = new Date(e.target.value)
                                                        setValue(e.target.value)
                                                        if (isValidDate(date)) {
                                                            setDate(date)
                                                            setMonth(date)
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "ArrowDown") {
                                                            e.preventDefault()
                                                            setOpen(true)
                                                        }
                                                    }}
                                                />
                                                <Popover open={open} onOpenChange={setOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id="date-picker"
                                                            variant="ghost"
                                                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                                        >
                                                            <CalendarIcon className="size-3.5" />
                                                            <span className="sr-only">Select date</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto overflow-hidden p-0"
                                                        align="end"
                                                        alignOffset={-8}
                                                        sideOffset={10}
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={date}
                                                            captionLayout="dropdown"
                                                            month={month}
                                                            onMonthChange={setMonth}
                                                            onSelect={(date) => {
                                                                setDate(date)
                                                                setValue(formatDate(date))
                                                                setOpen(false)
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <Label htmlFor="date" className="px-1">
                                                Subscription Date
                                            </Label>
                                            <div className="relative flex gap-2">
                                                <Input
                                                    id="date"
                                                    value={value}
                                                    placeholder="June 01, 2025"
                                                    className="bg-background pr-10"
                                                    onChange={(e) => {
                                                        const date = new Date(e.target.value)
                                                        setValue(e.target.value)
                                                        if (isValidDate(date)) {
                                                            setDate(date)
                                                            setMonth(date)
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "ArrowDown") {
                                                            e.preventDefault()
                                                            setOpen(true)
                                                        }
                                                    }}
                                                />
                                                <Popover open={open} onOpenChange={setOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id="date-picker"
                                                            variant="ghost"
                                                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                                        >
                                                            <CalendarIcon className="size-3.5" />
                                                            <span className="sr-only">Select date</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto overflow-hidden p-0"
                                                        align="end"
                                                        alignOffset={-8}
                                                        sideOffset={10}
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={date}
                                                            captionLayout="dropdown"
                                                            month={month}
                                                            onMonthChange={setMonth}
                                                            onSelect={(date) => {
                                                                setDate(date)
                                                                setValue(formatDate(date))
                                                                setOpen(false)
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="paymentTerms">Payment Terms</Label>
                                            <Select
                                                value={purchaseOrder.paymentTerms}
                                                onValueChange={(value) => setPurchaseOrder(prev => ({ ...prev, paymentTerms: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment terms" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="net-30">Net 30 Days</SelectItem>
                                                    <SelectItem value="net-60">Net 60 Days</SelectItem>
                                                    <SelectItem value="net-90">Net 90 Days</SelectItem>
                                                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                                                    <SelectItem value="advance">Advance Payment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select
                                                value={purchaseOrder.priority}
                                                onValueChange={(value) => setPurchaseOrder(prev => ({ ...prev, priority: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Add any additional notes or special instructions..."
                                            value={purchaseOrder.notes}
                                            onChange={(e) => setPurchaseOrder(prev => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-blue-600" />
                                        Items ({purchaseOrder.items.length})
                                    </div>
                                    <Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Item
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {purchaseOrder.items.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg font-medium mb-2">No items added yet</p>
                                        <p className="text-sm">Click &quot;Add Item&quot; to start building your purchase order</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {purchaseOrder.items.map((item, index) => (
                                            <Card key={item.id} className="border-slate-200">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="font-medium text-slate-900">Item #{index + 1}</h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`product-${item.id}`}>Product Name</Label>
                                                            <Input
                                                                id={`product-${item.id}`}
                                                                placeholder="Enter product name"
                                                                value={item.productName}
                                                                onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`description-${item.id}`}>Description</Label>
                                                            <Input
                                                                id={`description-${item.id}`}
                                                                placeholder="Product description"
                                                                value={item.description}
                                                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                                                            <Input
                                                                id={`quantity-${item.id}`}
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`unitPrice-${item.id}`}>Unit Price</Label>
                                                            <Input
                                                                id={`unitPrice-${item.id}`}
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unitPrice}
                                                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`discount-${item.id}`}>Discount (%)</Label>
                                                            <Input
                                                                id={`discount-${item.id}`}
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={item.discount}
                                                                onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`taxRate-${item.id}`}>Tax Rate (%)</Label>
                                                            <Input
                                                                id={`taxRate-${item.id}`}
                                                                type="number"
                                                                min="0"
                                                                value={item.taxRate}
                                                                onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Total</Label>
                                                            <div className="h-10 px-3 py-2 bg-slate-50 border rounded-md flex items-center font-medium text-slate-900">
                                                                ${item.total.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        <div className='sticky space-y-6 top-6'>
                            {/* Order Summary */}
                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Calculator className="h-5 w-5 text-blue-600" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Subtotal:</span>
                                            <span className="font-medium">${purchaseOrder.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Discount:</span>
                                            <span className="font-medium text-green-600">-${purchaseOrder.totalDiscount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Tax:</span>
                                            <span className="font-medium">${purchaseOrder.totalTax.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Grand Total:</span>
                                            <span className="text-blue-600">${purchaseOrder.grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Button
                                            onClick={handleSave}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Draft
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit for Approval
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">{purchaseOrder.items.length}</div>
                                            <div className="text-sm text-blue-800">Items</div>
                                        </div>
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                                            </div>
                                            <div className="text-sm text-green-800">Total Qty</div>
                                        </div>
                                    </div>

                                    {purchaseOrder.vendor && (
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <div className="text-sm font-medium text-slate-900 mb-1">Vendor</div>
                                            <div className="text-sm text-slate-600">{purchaseOrder.vendor.name}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}