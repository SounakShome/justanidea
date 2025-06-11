'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [activeTab, setActiveTab] = useState<'pending' | 'review' | 'approved'>('pending');
  // Track which orders are open using their IDs
  const [openOrderIds, setOpenOrderIds] = useState<Set<string>>(new Set());
  // Store available quantities for pending orders
  const [availableQtys, setAvailableQtys] = useState<Record<string, Record<string, number>>>({});
  // State for dropdown menu on mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Ref for dropdown to handle click outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock data - replace with actual data fetching in a real app
  const [orders, setOrders] = useState<Order[]>([
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

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const reviewOrders = orders.filter(order => order.status === 'review');
  const approvedOrders = orders.filter(order => order.status === 'approved');

  // Toggle open/close state for a specific order
  const toggleOrderOpen = (orderId: string) => {
    const newOpenOrderIds = new Set(openOrderIds);
    if (newOpenOrderIds.has(orderId)) {
      newOpenOrderIds.delete(orderId);
    } else {
      newOpenOrderIds.add(orderId);
    }
    setOpenOrderIds(newOpenOrderIds);
  };

  // Check if a specific order is open
  const isOrderOpen = (orderId: string) => {
    return openOrderIds.has(orderId);
  };

  // Update available quantity for a pending order item
  const updateAvailableQty = (orderId: string, product: string, qty: number) => {
    setAvailableQtys(prev => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [product]: qty
      }
    }));
  };

  // Get available quantity for a pending order item
  const getAvailableQty = (orderId: string, product: string, defaultQty?: number) => {
    return availableQtys[orderId]?.[product] !== undefined 
      ? availableQtys[orderId][product] 
      : defaultQty;
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Set active tab and close dropdown for mobile
  const handleTabChange = (tab: 'pending' | 'review' | 'approved') => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
  };

  // Get tab label with count
  const getTabLabel = (tab: 'pending' | 'review' | 'approved') => {
    switch (tab) {
      case 'pending':
        return `Pending (${pendingOrders.length})`;
      case 'review':
        return `Under Review (${reviewOrders.length})`;
      case 'approved':
        return `Approved (${approvedOrders.length})`;
    }
  };

  // Render order status badge based on status
  const renderStatusBadge = (status: 'pending' | 'review' | 'approved') => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full whitespace-nowrap">Pending</span>;
      case 'review':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">Review</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap">Approved</span>;
      default:
        return null;
    }
  };

  // Render order items as cards on mobile and table on larger screens
  const renderOrderItems = (order: Order) => {
    return (
      <div className="mt-3">
        {/* Hide on mobile, show on larger screens */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Qty</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Qty</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <tr key={`${order.id}-${idx}-desktop`}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{item.product}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{item.requestedQty}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {order.status === 'pending' ? (
                      <input
                        type="number"
                        min="0"
                        className="w-16 text-xs border border-gray-300 rounded p-1"
                        value={getAvailableQty(order.id, item.product, item.availableQty) || ''}
                        onChange={(e) => updateAvailableQty(
                          order.id, 
                          item.product, 
                          e.target.value ? parseInt(e.target.value) : 0
                        )}
                      />
                    ) : (
                      item.availableQty
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show on mobile, hide on larger screens */}
        <div className="sm:hidden space-y-3">
          {order.items.map((item, idx) => (
            <div 
              key={`${order.id}-${idx}-mobile`} 
              className="bg-white p-3 rounded border border-gray-200"
            >
              <div className="font-medium mb-2">{item.product}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-600">Requested:</div>
                <div>{item.requestedQty}</div>
                
                <div className="text-gray-600">Available:</div>
                <div>
                  {order.status === 'pending' ? (
                    <input
                      type="number"
                      min="0"
                      className="w-full text-xs border border-gray-300 rounded p-1"
                      value={getAvailableQty(order.id, item.product, item.availableQty) || ''}
                      onChange={(e) => updateAvailableQty(
                        order.id, 
                        item.product, 
                        e.target.value ? parseInt(e.target.value) : 0
                      )}
                    />
                  ) : (
                    item.availableQty
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render an order based on the data
  const renderOrder = (order: Order) => {
    return (
      <div key={order.id} className="hover:bg-gray-50 transition">
        <div 
          className="p-3 sm:p-4 cursor-pointer" 
          onClick={() => toggleOrderOpen(order.id)}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div className="mb-2 sm:mb-0">
              <h3 className="font-medium">{order.customerName}</h3>
              <p className="text-xs sm:text-sm text-gray-500">Order #{order.id} • {order.date}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end sm:text-right mt-1 sm:mt-0">
              <span className="font-semibold text-sm sm:text-base">${order.amount.toFixed(2)}</span>
              <div className="mx-2">
                {renderStatusBadge(order.status)}
              </div>
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transition-transform ${isOrderOpen(order.id) ? 'transform rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        {isOrderOpen(order.id) && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 bg-gray-50">
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Order Details:</h4>
            {renderOrderItems(order)}
            <div className="mt-3">
              <p className="text-xs sm:text-sm"><span className="font-medium">Total Amount:</span> ${order.amount.toFixed(2)}</p>
              <p className="text-xs sm:text-sm"><span className="font-medium">Date:</span> {order.date}</p>
              <p className="text-xs sm:text-sm"><span className="font-medium">Status:</span> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            </div>
            {order.status === 'pending' && (
              <div className="mt-3 flex justify-end">
                <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md">
                  Submit Available Quantities
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

    // State for add order modal
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
    
    // State for new order form
    const [newOrder, setNewOrder] = useState<Omit<Order, 'id' | 'status' | 'date'>>({
        customerName: '',
        amount: 0,
        items: [{ product: '', requestedQty: 1 }]
    });
    
    // Add a new item to the order form
    const addItem = () => {
        setNewOrder(prev => ({
            ...prev,
            items: [...prev.items, { product: '', requestedQty: 1 }]
        }));
    };
    
    // Remove an item from the order form
    const removeItem = (index: number) => {
        setNewOrder(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };
    
    // Handle changes to order item fields
    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        setNewOrder(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };
    
    // Handle form submission
    const handleAddOrder = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Generate a new unique ID
        const newId = `00${orders.length + 1}`;
        
        // Create a new order with today's date
        const today = new Date().toISOString().split('T')[0];
        
        const createdOrder: Order = {
            ...newOrder,
            id: newId,
            date: today,
            status: 'pending',
            items: newOrder.items.map(item => ({
                ...item,
                availableQty: item.requestedQty // Default available to requested
            }))
        };
        
        // In a real app, you would send this to an API
        // For this example, we update the orders state here
        setOrders([...orders, createdOrder]);
        
        // Close the modal and reset the form
        setIsAddOrderModalOpen(false);
        setNewOrder({
            customerName: '',
            amount: 0,
            items: [{ product: '', requestedQty: 1 }]
        });
    };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Order Management</h1>

    {/* Add Order Button */}
    <div className="flex justify-end mb-4">
        <button 
            onClick={() => setIsAddOrderModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Order
        </button>
    </div>

    {/* Add Order Modal */}
    {isAddOrderModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Order</h2>
                    <button onClick={() => setIsAddOrderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleAddOrder}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                            type="text"
                            value={newOrder.customerName}
                            onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newOrder.amount}
                            onChange={(e) => setNewOrder({...newOrder, amount: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                        {newOrder.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Product"
                                    value={item.product}
                                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    min="1"
                                    value={item.requestedQty}
                                    onChange={(e) => handleItemChange(index, 'requestedQty', parseInt(e.target.value))}
                                    className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Item
                        </button>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsAddOrderModalOpen(false)}
                            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                        >
                            Create Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}
      
      {/* Mobile dropdown for tabs */}
      <div className="sm:hidden mb-4 relative" ref={dropdownRef}>
        <button 
          onClick={toggleDropdown}
          className="w-full flex items-center justify-between p-3 border rounded-md bg-white shadow-sm"
        >
          <span className="font-medium">{getTabLabel(activeTab)}</span>
          <svg 
            className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
            <button 
              className={`w-full text-left p-3 hover:bg-gray-100 ${activeTab === 'pending' ? 'bg-amber-50 text-amber-700' : ''}`}
              onClick={() => handleTabChange('pending')}
            >
              Pending ({pendingOrders.length})
            </button>
            <button 
              className={`w-full text-left p-3 hover:bg-gray-100 ${activeTab === 'review' ? 'bg-blue-50 text-blue-700' : ''}`}
              onClick={() => handleTabChange('review')}
            >
              Under Review ({reviewOrders.length})
            </button>
            <button 
              className={`w-full text-left p-3 hover:bg-gray-100 ${activeTab === 'approved' ? 'bg-green-50 text-green-700' : ''}`}
              onClick={() => handleTabChange('approved')}
            >
              Approved ({approvedOrders.length})
            </button>
          </div>
        )}
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block mb-6 overflow-x-auto">
        <div className="flex border-b min-w-max">
          <button 
            className={`py-2 px-4 text-base font-medium whitespace-nowrap ${
              activeTab === 'pending' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingOrders.length})
          </button>
          <button 
            className={`py-2 px-4 text-base font-medium whitespace-nowrap ${
              activeTab === 'review' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('review')}
          >
            Under Review ({reviewOrders.length})
          </button>
          <button 
            className={`py-2 px-4 text-base font-medium whitespace-nowrap ${
              activeTab === 'approved' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedOrders.length})
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        {activeTab === 'pending' && (
          <div className="divide-y">
            {pendingOrders.length > 0 ? (
              pendingOrders.map(order => renderOrder(order))
            ) : (
              <p className="text-center p-4 sm:p-8 text-gray-500 text-sm sm:text-base">No pending orders</p>
            )}
          </div>
        )}
        
        {activeTab === 'review' && (
          <div className="divide-y">
            {reviewOrders.length > 0 ? (
              reviewOrders.map(order => renderOrder(order))
            ) : (
              <p className="text-center p-4 sm:p-8 text-gray-500 text-sm sm:text-base">No orders under review</p>
            )}
          </div>
        )}
        
        {activeTab === 'approved' && (
          <div className="divide-y">
            {approvedOrders.length > 0 ? (
              approvedOrders.map(order => renderOrder(order))
            ) : (
              <p className="text-center p-4 sm:p-8 text-gray-500 text-sm sm:text-base">No approved orders</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}