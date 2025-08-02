'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { ChevronDown, ChevronUp, Plus, Search, Calendar, DollarSign, Package, User, RefreshCw } from "lucide-react";

interface OrderItem {
  product: string;
  requestedQty: number;
  availableQty?: number;
}

interface Order {
  id: string;
  customerName: string;
  date: string;
  amount: number;
  status: 'pending' | 'review' | 'approved';
  items: OrderItem[];
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      
      // Fallback to mock data in case of error
      setOrders([
        {
          id: '001',
          customerName: 'John Doe',
          date: '2023-11-15',
          amount: 125.99,
          status: 'pending',
          items: [
            { product: 'Product A', requestedQty: 3, availableQty: 5 },
            { product: 'Product B', requestedQty: 2, availableQty: 1 }
          ]
        },
        {
          id: '002',
          customerName: 'Jane Smith',
          date: '2023-11-14',
          amount: 75.50,
          status: 'pending',
          items: [
            { product: 'Product C', requestedQty: 1, availableQty: 7 }
          ]
        },
        {
          id: '003',
          customerName: 'Robert Johnson',
          date: '2023-11-13',
          amount: 249.99,
          status: 'review',
          items: [
            { product: 'Product D', requestedQty: 2, availableQty: 2 },
            { product: 'Product E', requestedQty: 1, availableQty: 1 },
            { product: 'Product F', requestedQty: 3, availableQty: 3 }
          ]
        },
        {
          id: '004',
          customerName: 'Emily Davis',
          date: '2023-11-12',
          amount: 199.99,
          status: 'review',
          items: [
            { product: 'Product G', requestedQty: 4, availableQty: 4 }
          ]
        },
        {
          id: '005',
          customerName: 'Michael Wilson',
          date: '2023-11-10',
          amount: 349.75,
          status: 'approved',
          items: [
            { product: 'Product H', requestedQty: 2, availableQty: 2 },
            { product: 'Product I', requestedQty: 1, availableQty: 1 }
          ]
        },
        {
          id: '006',
          customerName: 'Sarah Brown',
          date: '2023-11-09',
          amount: 89.99,
          status: 'approved',
          items: [
            { product: 'Product J', requestedQty: 1, availableQty: 1 }
          ]
        },
      ]);
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

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">Pending</Badge>;
      case 'review':
        return <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">Under Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">Approved</Badge>;
    }
  };

  const renderOrderCard = (order: Order) => {
    const isExpanded = expandedOrders.has(order.id);

    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardHeader 
          className="cursor-pointer pb-3"
          onClick={() => toggleOrderExpanded(order.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {order.customerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {order.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ₹{order.amount.toFixed(2)}
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              {isExpanded ? 
                <ChevronUp className="h-5 w-5 text-muted-foreground" /> : 
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              }
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Package className="h-4 w-4" />
                Order Items ({order.items.length})
              </div>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{item.product}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested: {item.requestedQty} | Available: {item.availableQty}
                      </p>
                    </div>
                    {order.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Available:</span>
                        <Input
                          type="number"
                          min="0"
                          defaultValue={item.availableQty}
                          className="w-20 h-8"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {order.status === 'pending' && (
                <div className="flex justify-end pt-2">
                  <Button size="sm">
                    Update Available Quantities
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="flex flex-col">
      <SiteHeader name="Orders" />
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your orders
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className='cursor-pointer' onClick={() => window.location.href = '/orders/create'}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-red-800">Error: {error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchOrders}
                  disabled={loading}
                  className="text-red-800 border-red-300 hover:bg-red-100"
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending
            <Badge variant="secondary" className="ml-1">{pendingOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            Under Review
            <Badge variant="secondary" className="ml-1">{reviewOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            Approved
            <Badge variant="secondary" className="ml-1">{approvedOrders.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length > 0 ? (
            pendingOrders.map(order => renderOrderCard(order))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending orders found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          {reviewOrders.length > 0 ? (
            reviewOrders.map(order => renderOrderCard(order))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No orders under review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedOrders.length > 0 ? (
            approvedOrders.map(order => renderOrderCard(order))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No approved orders found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
          </>
        )}
      </div>
    </div>
  );
}