'use client';

import { useState, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SiteHeader } from "@/components/site-header";
import { Plus, Search, Calendar, Package, RefreshCw, Hash, X, Download } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { Session } from "next-auth";
import { generateOrderPDF } from "@/utils/pdfGenerator";
import { useCompanyStore } from "@/store/companyStore"

// Form schema for order editing
const orderFormSchema = z.object({
  items: z.array(z.object({
    product: z.string(),
    requestedQty: z.number().min(0),
    availableQty: z.number().min(0).optional(),
    rate: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    discountType: z.enum(['percentage', 'amount', 'none']).optional(),
    productId: z.string().optional(),
    variantId: z.string(), // This is required for API updates
    variantName: z.string().optional(),
    price: z.number().optional(),
  })),
  billDiscount: z.object({
    type: z.enum(['percentage', 'amount', 'none']),
    value: z.union([z.number().min(0), z.undefined()]),
  }),
  specialDiscount: z.object({
    type: z.enum(['percentage', 'amount', 'none']),
    value: z.union([z.number().min(0), z.undefined()]),
  }),
  taxConfig: z.object({
    type: z.enum(['igst', 'cgst_sgst']),
    igstRate: z.union([z.number().min(0), z.undefined()]),
    cgstRate: z.union([z.number().min(0), z.undefined()]),
    sgstRate: z.union([z.number().min(0), z.undefined()]),
  }),
  notes: z.string().optional(),
  remarks: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export default function OrdersPage({session}: {session: Session}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'discounts' | 'notes'>('items');
  const [isSaving, setIsSaving] = useState(false);

  const { company } = useCompanyStore();

  console.log("Company:", company);

  // Initialize React Hook Form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      items: [],
      billDiscount: { type: 'amount', value: undefined },
      specialDiscount: { type: 'none', value: undefined },
      taxConfig: { type: 'cgst_sgst', cgstRate: undefined, sgstRate: undefined },
      notes: '',
      remarks: '',
    },
  });

  // Watch form values to detect changes
  const formValues = form.watch();
  const hasUnsavedChanges = selectedOrder && selectedOrder.status === 'review' && form.formState.isDirty;

  // Fetch orders data
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace this with your actual API endpoint
      const response = await fetch('/api/orders');

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      // Use transformedOrders if available, otherwise use the data directly
      setOrders(data.transformedOrders || data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.includes(searchQuery)
  );

  const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
  const reviewOrders = filteredOrders.filter(order => order.status === 'review');
  const approvedOrders = filteredOrders.filter(order => order.status === 'approved');

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    
    // Reset form and populate with order data for review orders
    if (order.status === 'review') {
      const itemsWithDefaults = order.items.map(item => ({
        ...item,
        availableQty: item.availableQty || 0,
        rate: item.rate !== undefined ? item.rate : undefined,
        discount: item.discount !== undefined ? item.discount : undefined,
        discountType: item.discountType || 'percentage' as const,
        variantId: item.variantId || '', // Ensure we have the variantId
      }));
      
      form.reset({
        items: itemsWithDefaults,
        billDiscount: order.billDiscount || { type: 'amount', value: undefined },
        specialDiscount: order.specialDiscount || { type: 'none', value: undefined },
        taxConfig: order.taxConfig || { type: 'cgst_sgst', cgstRate: undefined, sgstRate: undefined },
        notes: order.notes || '',
        remarks: order.remarks || '',
      });
      setActiveTab('items');
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    form.reset();
  };

  const handleApproveOrder = async (data: OrderFormValues) => {
    if (selectedOrder && !isSaving) {
      setIsSaving(true);
      try {
        // Create updated order object with form data
        const updatedOrder: Order = {
          ...selectedOrder,
          items: data.items,
          billDiscount: data.billDiscount as { type: 'percentage' | 'amount'; value: number | undefined },
          specialDiscount: data.specialDiscount as { type: 'percentage' | 'amount' | 'none'; value: number | undefined },
          taxConfig: data.taxConfig as { type: 'igst' | 'cgst_sgst'; igstRate?: number; cgstRate?: number; sgstRate?: number },
          notes: data.notes || '',
          remarks: data.remarks || '',
          status: 'approved'
        };
        
        console.log('Saving updated order:', updatedOrder);
        
        await updateStatus(updatedOrder, 'approved');
        closeOrderDetails();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveChanges = async (data: OrderFormValues) => {
    if (selectedOrder && !isSaving) {
      setIsSaving(true);
      try {
        const updatedOrder: Order = {
          ...selectedOrder,
          items: data.items,
          billDiscount: data.billDiscount as { type: 'percentage' | 'amount'; value: number | undefined },
          specialDiscount: data.specialDiscount as { type: 'percentage' | 'amount' | 'none'; value: number | undefined },
          taxConfig: data.taxConfig as { type: 'igst' | 'cgst_sgst'; igstRate?: number; cgstRate?: number; sgstRate?: number },
          notes: data.notes || '',
          remarks: data.remarks || '',
          status: 'review' // Keep the same status
        };
        
        console.log('Saving changes to order:', updatedOrder);
        
        await updateStatus(updatedOrder, 'review');
        // Update the selected order with the new values so UI reflects the changes
        setSelectedOrder(updatedOrder);
        // Mark form as clean since we saved
        form.reset(data);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const updateStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...order,
          status: newStatus 
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update order status');
      }

      console.log('Successfully updated order:', order.id, 'to status:', newStatus);
      
      // Refresh the orders list to show updated data
      fetchOrders();
      
    } catch (error) {
      console.error('Error updating order:', error);
      // You could show a toast notification here
    }
  }

  const handleDownloadPDF = () => {
    if (!selectedOrder) return;
    
    try {
      // Transform order data to match PDF generator interface
      const pdfOrder = {
        id: selectedOrder.id,
        orderNumber: selectedOrder.id, // Using ID as order number for now
        date: new Date(selectedOrder.date),
        status: selectedOrder.status,
        customer: {
          name: selectedOrder.customerName,
          // Add more customer details when available
        },
        company: {
          name: 'Your Company', // Replace with actual company data
          // Add more company details when available
        },
        items: selectedOrder.items.map(item => ({
          id: item.variantId || '',
          name: item.product,
          sku: item.variantName || '',
          quantity: item.requestedQty,
          sellingPrice: item.rate || 0,
          description: item.product,
        })),
        billDiscounts: selectedOrder.billDiscount ? [{
          id: 'discount-1',
          name: 'Bill Discount',
          type: selectedOrder.billDiscount.type as 'percentage' | 'amount',
          value: selectedOrder.billDiscount.value || 0,
        }] : [],
        taxConfig: selectedOrder.taxConfig ? {
          isIGST: selectedOrder.taxConfig.type === 'igst',
          igstRate: selectedOrder.taxConfig.igstRate,
          cgstRate: selectedOrder.taxConfig.cgstRate,
          sgstRate: selectedOrder.taxConfig.sgstRate,
        } : undefined,
        subtotal: selectedOrder.amount, // Using amount as subtotal for now
        totalDiscount: 0, // Calculate from bill discount
        totalTax: 0, // Calculate from tax config
        finalAmount: selectedOrder.amount,
      };
      
      generateOrderPDF(pdfOrder);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You could show a toast notification here
    }
  };

  const renderOrderCard = (order: Order) => {
    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader
          className="px-4 sm:px-6"
          onClick={() => openOrderDetails(order)}
        >
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-base truncate flex-1 mr-2">{order.customerName}</CardTitle>
            </div>
            <CardDescription className="text-xs space-y-1 mb-3">
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3 shrink-0" />
                <span>Order {order.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{order.date}</span>
              </div>
              <div className="font-medium">
                ₹{order.amount.toFixed(2)}
              </div>
            </CardDescription>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{order.customerName}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1 text-sm">
                <span className="flex items-center gap-1">
                  <Hash className="h-4 w-4 shrink-0" />
                  <span>Order {order.id}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{order.date}</span>
                </span>
                <span className="font-medium">
                  ₹{order.amount.toFixed(2)}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader name="Orders" />
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Manage and track all your orders
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => window.location.href = '/orders/create'}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-red-800 text-sm">Error: {error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchOrders}
                  disabled={loading}
                  className="text-red-800 border-red-300 hover:bg-red-100 w-full sm:w-auto"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4 sm:py-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4 sm:w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-full sm:w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3 sm:w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="pending" className="cursor-pointer flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                  <span>Pending</span>
                  <Badge variant="secondary" className="text-xs">{pendingOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="review" className="cursor-pointer flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                  <span className="text-center">Under Review</span>
                  <Badge variant="secondary" className="text-xs">{reviewOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="approved" className="cursor-pointer flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
                  <span>Approved</span>
                  <Badge variant="secondary" className="text-xs">{approvedOrders.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3 sm:space-y-4">
                {pendingOrders.length > 0 ? (
                  pendingOrders.map(order => renderOrderCard(order))
                ) : (
                  <Card>
                    <CardContent className="py-6 sm:py-8 text-center">
                      <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                      <p className="text-muted-foreground text-sm sm:text-base">No pending orders found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="review" className="space-y-3 sm:space-y-4">
                {reviewOrders.length > 0 ? (
                  reviewOrders.map(order => renderOrderCard(order))
                ) : (
                  <Card>
                    <CardContent className="py-6 sm:py-8 text-center">
                      <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                      <p className="text-muted-foreground text-sm sm:text-base">No orders under review</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-3 sm:space-y-4">
                {approvedOrders.length > 0 ? (
                  approvedOrders.map(order => renderOrderCard(order))
                ) : (
                  <Card>
                    <CardContent className="py-6 sm:py-8 text-center">
                      <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                      <p className="text-muted-foreground text-sm sm:text-base">No approved orders found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeOrderDetails}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-screen overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold truncate">
                    Order Details - {selectedOrder.customerName}
                  </h2>
                  {hasUnsavedChanges && (
                    <Badge variant="secondary" className="text-xs">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">Order #{selectedOrder.id}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeOrderDetails}
                className="shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedOrder.status === 'review' ? (
                // Review Mode with Form
                <Form {...form}>
                  <div className="space-y-4 sm:space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex border-b">
                      <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'items'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('items')}
                      >
                        Items & Pricing
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'discounts'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('discounts')}
                      >
                        Discounts & Taxes
                      </button>
                    </div>

                    {activeTab === 'items' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-lg font-medium">Order Items ({formValues.items.length})</h3>
                        </div>
                        
                        {/* Items Table Header */}
                        <div className="hidden sm:grid sm:grid-cols-6 gap-4 p-3 bg-muted/30 rounded-lg text-sm font-medium text-muted-foreground">
                          <div>Product</div>
                          <div>Qty</div>
                          <div>Rate (₹)</div>
                          <div>Discount</div>
                          <div>Type</div>
                          <div>Amount (₹)</div>
                        </div>

                        <div className="space-y-3">
                          {formValues.items.map((item, index) => {
                            const itemAmount = (item.requestedQty * (item.rate || 0));
                            const discountAmount = item.discountType === 'none' ? 0 :
                              item.discountType === 'percentage' 
                              ? (itemAmount * (item.discount || 0)) / 100
                              : (item.discount || 0);
                            const finalAmount = itemAmount - discountAmount;

                            return (
                              <div key={index} className="border rounded-lg p-4">
                                {/* Mobile Layout */}
                                <div className="block sm:hidden space-y-3">
                                  <h4 className="font-medium text-base">{item.product}</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                      control={form.control}
                                      name={`items.${index}.requestedQty`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs text-muted-foreground">Quantity</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min="0"
                                              readOnly={session.user.role !== 'ADMIN'}
                                              {...field}
                                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                              className="h-9"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`items.${index}.rate`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs text-muted-foreground">Rate (₹)</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min="0"
                                              readOnly={session.user.role !== 'ADMIN'}
                                              step="0.01"
                                              {...field}
                                              value={field.value ?? ''}
                                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                              className="h-9"
                                              placeholder="Enter rate"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`items.${index}.discount`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs text-muted-foreground">Discount</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min="0"
                                              readOnly={session.user.role !== 'ADMIN'}
                                              {...field}
                                              value={field.value ?? ''}
                                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                              className="h-9"
                                              placeholder="Enter discount"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`items.${index}.discountType`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs text-muted-foreground">Type</FormLabel>
                                          <FormControl>
                                            <select
                                              {...field}
                                              disabled={session.user.role !== 'ADMIN'}
                                              className="w-full h-9 px-3 border border-input bg-background rounded-md text-sm"
                                            >
                                              <option value="none">None</option>
                                              <option value="percentage">%</option>
                                              <option value="amount">₹</option>
                                            </select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm text-muted-foreground">Amount: </span>
                                    <span className="font-medium">₹{finalAmount.toFixed(2)}</span>
                                  </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:grid sm:grid-cols-6 gap-4 items-center">
                                  <div className="font-medium">{item.product}</div>
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.requestedQty`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            readOnly={session.user.role !== 'ADMIN'}
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            className="h-9"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.rate`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            readOnly={session.user.role !== 'ADMIN'}
                                            step="0.01"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                            className="h-9"
                                            placeholder="Enter rate"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.discount`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            readOnly={session.user.role !== 'ADMIN'}
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                            className="h-9"
                                            placeholder="Enter discount"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.discountType`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <select
                                            {...field}
                                            disabled={session.user.role !== 'ADMIN'}
                                            className="w-full h-9 px-3 border border-input bg-background rounded-md text-sm"
                                          >
                                            <option value="none">None</option>
                                            <option value="percentage">%</option>
                                            <option value="amount">₹</option>
                                          </select>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="font-medium">₹{finalAmount.toFixed(2)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeTab === 'discounts' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Bill-Level Discounts & Taxes</h3>
                        
                        {/* Bill Discount Section */}
                        <div className="border rounded-lg p-4 space-y-4">
                          <h4 className="font-medium">Bill Discount</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="billDiscount.type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm text-muted-foreground">Discount Type</FormLabel>
                                  <FormControl>
                                    <select
                                      {...field}
                                      disabled={session.user.role !== 'ADMIN'}
                                      className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm mt-1"
                                    >
                                      <option value="amount">Amount (₹)</option>
                                      <option value="percentage">Percentage (%)</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billDiscount.value"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm text-muted-foreground">
                                    {formValues.billDiscount.type === 'percentage' ? 'Percentage' : 'Amount (₹)'}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      disabled={session.user.role !== 'ADMIN'}
                                      step="0.01"
                                      {...field}
                                      value={field.value ?? ''}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                      className="h-10 mt-1"
                                      placeholder="Enter discount amount"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Special Discount Section */}
                        <div className="border rounded-lg p-4 space-y-4 bg-blue-50/50">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">Special Discount</h4>
                            <Badge variant="secondary" className="text-xs">Applied after bill discount</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="specialDiscount.type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm text-muted-foreground">Discount Type</FormLabel>
                                  <FormControl>
                                    <select
                                      {...field}
                                      disabled={session.user.role !== 'ADMIN'}
                                      className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm mt-1"
                                    >
                                      <option value="none">No Discount</option>
                                      <option value="amount">Amount (₹)</option>
                                      <option value="percentage">Percentage (%)</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {formValues.specialDiscount.type !== 'none' && (
                              <FormField
                                control={form.control}
                                name="specialDiscount.value"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">
                                      {formValues.specialDiscount.type === 'percentage' ? 'Percentage' : 'Amount (₹)'}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        disabled={session.user.role !== 'ADMIN'}
                                        step="0.01"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                        className="h-10 mt-1"
                                        placeholder="Enter discount amount"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                          
                          {/* Remarks for Special Discount */}
                          <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm text-muted-foreground">Remarks / Reason for Special Discount</FormLabel>
                                <FormControl>
                                  <textarea
                                    {...field}
                                    readOnly={session.user.role !== 'ADMIN'}
                                    className="w-full h-24 p-3 border border-input bg-background rounded-md text-sm mt-1"
                                    placeholder="Enter reason for special discount or any remarks..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Tax Section */}
                        <div className="border rounded-lg p-4 space-y-4">
                          <h4 className="font-medium">Tax Configuration</h4>
                          
                          {/* Tax Type Selection */}
                          <FormField
                            control={form.control}
                            name="taxConfig.type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm text-muted-foreground">Tax Type</FormLabel>
                                <FormControl>
                                  <select
                                    {...field}
                                    disabled={session.user.role !== 'ADMIN'}
                                    onChange={(e) => {
                                      const newType = e.target.value as 'igst' | 'cgst_sgst';
                                      field.onChange(newType);
                                      if (newType === 'igst') {
                                        form.setValue('taxConfig.igstRate', 0);
                                        form.setValue('taxConfig.cgstRate', undefined);
                                        form.setValue('taxConfig.sgstRate', undefined);
                                      } else {
                                        form.setValue('taxConfig.cgstRate', 0);
                                        form.setValue('taxConfig.sgstRate', 0);
                                        form.setValue('taxConfig.igstRate', undefined);
                                      }
                                    }}
                                    className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm mt-1"
                                  >
                                    <option value="cgst_sgst">CGST + SGST (Intra-state)</option>
                                    <option value="igst">IGST (Inter-state)</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Tax Rate Inputs */}
                          {formValues.taxConfig.type === 'igst' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="taxConfig.igstRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">IGST Rate (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        disabled={session.user.role !== 'ADMIN'}
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                        className="h-10 mt-1"
                                        placeholder="e.g., 18"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="taxConfig.cgstRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">CGST Rate (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        disabled={session.user.role !== 'ADMIN'}
                                        step="0.01"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                        className="h-10 mt-1"
                                        placeholder="e.g., 9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="taxConfig.sgstRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-muted-foreground">SGST Rate (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        disabled={session.user.role !== 'ADMIN'}
                                        step="0.01"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                        className="h-10 mt-1"
                                        placeholder="e.g., 9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}

                          {/* Tax Information */}
                          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
                            {formValues.taxConfig.type === 'igst' ? (
                              <p><strong>IGST:</strong> Used for inter-state transactions. Total tax rate applies as IGST.</p>
                            ) : (
                              <p><strong>CGST + SGST:</strong> Used for intra-state transactions. CGST goes to Central Government, SGST goes to State Government.</p>
                            )}
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div className="border rounded-lg p-4 space-y-4">
                          <h4 className="font-medium">Order Notes</h4>
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm text-muted-foreground">Notes</FormLabel>
                                <FormControl>
                                  <textarea
                                    {...field}
                                    readOnly={session.user.role !== 'ADMIN'}
                                    className="w-full h-32 p-3 border border-input bg-background rounded-md text-sm mt-1"
                                    placeholder="Enter order notes..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Bill Summary */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <h4 className="font-medium mb-3">Bill Summary</h4>
                          {(() => {
                            const subtotal = formValues.items.reduce((sum, item) => {
                              const itemAmount = (item.requestedQty * (item.rate || 0));
                              const discountAmount = item.discountType === 'none' ? 0 :
                                item.discountType === 'percentage' 
                                ? (itemAmount * (item.discount || 0)) / 100
                                : (item.discount || 0);
                              return sum + (itemAmount - discountAmount);
                            }, 0);
                            
                            const billDiscountAmount = formValues.billDiscount.type === 'percentage'
                              ? (subtotal * (formValues.billDiscount.value || 0)) / 100
                              : (formValues.billDiscount.value || 0);
                            
                            const afterBillDiscount = subtotal - billDiscountAmount;
                            
                            // Calculate special discount (applied after bill discount)
                            const specialDiscountAmount = formValues.specialDiscount.type === 'none' ? 0 :
                              formValues.specialDiscount.type === 'percentage'
                              ? (afterBillDiscount * (formValues.specialDiscount.value || 0)) / 100
                              : (formValues.specialDiscount.value || 0);
                            
                            const afterAllDiscounts = afterBillDiscount - specialDiscountAmount;
                            
                            // Calculate tax based on configuration
                            let totalTaxAmount = 0;
                            let cgstAmount = 0;
                            let sgstAmount = 0;
                            let igstAmount = 0;
                            
                            if (formValues.taxConfig.type === 'igst') {
                              igstAmount = (afterAllDiscounts * (formValues.taxConfig.igstRate || 0)) / 100;
                              totalTaxAmount = igstAmount;
                            } else {
                              cgstAmount = (afterAllDiscounts * (formValues.taxConfig.cgstRate || 0)) / 100;
                              sgstAmount = (afterAllDiscounts * (formValues.taxConfig.sgstRate || 0)) / 100;
                              totalTaxAmount = cgstAmount + sgstAmount;
                            }
                            
                            const total = afterAllDiscounts + totalTaxAmount;

                            return (
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Bill Discount:</span>
                                  <span>-₹{billDiscountAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>After Bill Discount:</span>
                                  <span>₹{afterBillDiscount.toFixed(2)}</span>
                                </div>
                                {formValues.specialDiscount.type !== 'none' && (
                                  <>
                                    <div className="flex justify-between text-blue-600">
                                      <span>Special Discount:</span>
                                      <span>-₹{specialDiscountAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                      <span>After All Discounts:</span>
                                      <span>₹{afterAllDiscounts.toFixed(2)}</span>
                                    </div>
                                  </>
                                )}
                                
                                {/* Tax breakdown */}
                                {formValues.taxConfig.type === 'igst' ? (
                                  <div className="flex justify-between">
                                    <span>IGST ({formValues.taxConfig.igstRate}%):</span>
                                    <span>₹{igstAmount.toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <span>CGST ({formValues.taxConfig.cgstRate}%):</span>
                                      <span>₹{cgstAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>SGST ({formValues.taxConfig.sgstRate}%):</span>
                                      <span>₹{sgstAmount.toFixed(2)}</span>
                                    </div>
                                  </>
                                )}
                                
                                <div className="flex justify-between font-semibold text-base border-t pt-2">
                                  <span>Total:</span>
                                  <span>₹{total.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {session.user?.role === "ADMIN" && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        {activeTab === 'items' ? (
                          // Show Save Changes and Next button on Items tab
                          <>
                            <Button 
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={form.handleSubmit(handleSaveChanges)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                            <Button 
                              type="button"
                              className="flex-1"
                              onClick={() => setActiveTab('discounts')}
                            >
                              Next: Discounts & Taxes →
                            </Button>
                          </>
                        ) : (
                          // Show Save and Approve buttons on Discounts tab
                          <>
                            <Button 
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={form.handleSubmit(handleSaveChanges)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                            <Button 
                              type="button"
                              className="flex-1"
                              onClick={form.handleSubmit(handleApproveOrder)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                'Save & Approve Order'
                              )}
                            </Button>
                            <Button 
                              type="button"
                              variant="outline" 
                              className="flex-1"
                              onClick={closeOrderDetails}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Form>
              ) : (
                // Regular view for pending/approved orders
                <div className="space-y-4 sm:space-y-6">
                  {/* Order Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer</p>
                      <p className="text-base font-semibold">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date</p>
                      <p className="text-base">{selectedOrder.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                      <p className="text-base font-semibold">₹{selectedOrder.amount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Order Items ({selectedOrder.items.length})</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-base">{item.product}</h4>
                              <div className="flex flex-col sm:flex-row gap-2 mt-2 text-sm text-muted-foreground">
                                <span>Requested: <span className="font-medium">{item.requestedQty}</span> | Available: <span className="font-medium">{item.availableQty}</span></span>
                              </div>
                            </div>
                            {selectedOrder.status === 'pending' && (
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">Allocating:</span>
                                <Input
                                  type="number"
                                  min="0"
                                  defaultValue={item.requestedQty}
                                  className="w-20 h-9"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedOrder.status === 'pending' ? (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          updateStatus(selectedOrder, 'review');
                          closeOrderDetails();
                        }}
                      >
                        Update Available Quantities
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={closeOrderDetails}
                      >
                        Close
                      </Button>
                    </div>
                  ) : selectedOrder.status === 'approved' ? (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        className="flex-1"
                        onClick={handleDownloadPDF}
                        variant="default"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={closeOrderDetails}
                      >
                        Close
                      </Button>
                    </div>
                  ) : selectedOrder.status === 'review' ? (
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={closeOrderDetails}
                      >
                        Close
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}