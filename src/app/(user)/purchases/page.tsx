'use client';

import { useState, useEffect } from 'react';
// Format date using native JavaScript Date methods
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // returns YYYY-MM-DD format
}

type UserRole = "sales" | "admin";
const user: UserRole = "sales"; 

interface Bill {
    id: string;
    billNumber: string;
    billDate: string;
    products: Product[];
    total: number;
    verified: boolean;
}


interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    verified?: boolean;
}

function PurchasePage() {
    const [billNumber, setBillNumber] = useState('');
    const [billDate, setBillDate] = useState(formatDate(new Date()));
    const [products, setProducts] = useState<Product[]>([]);
    const [currentProduct, setCurrentProduct] = useState({
        id: '',
        name: '',
        price: 0,
        quantity: 1
    });
    const [showProductForm, setShowProductForm] = useState(false);
    const [billSubmitted, setBillSubmitted] = useState(false);

    const handleAddProduct = () => {
        if (currentProduct.name && currentProduct.price > 0 && currentProduct.quantity > 0) {
            setProducts([...products, {
                ...currentProduct,
                id: Date.now().toString()
            }]);
            setCurrentProduct({ id: '', name: '', price: 0, quantity: 1 });
        }
    };

    const handleRemoveProduct = (id: string) => {
        setProducts(products.filter(product => product.id !== id));
    };

    const handleSubmitBill = () => {
        if (billNumber && billDate && products.length > 0) {
            // Here you would normally send the data to your backend
            console.log({
                billNumber,
                billDate,
                products,
                total: products.reduce((sum, product) => sum + product.price * product.quantity, 0)
            });
            setBillSubmitted(true);
        }
    };

    const handleNewBill = () => {
        setBillNumber('');
        setBillDate(formatDate(new Date()));
        setProducts([]);
        setShowProductForm(false);
        setBillSubmitted(false);
    };

    const totalAmount = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Purchase Entry</h1>
            
            {billSubmitted ? (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg">
                    <p className="font-medium">Bill #{billNumber} has been recorded successfully!</p>
                    <button 
                        onClick={handleNewBill}
                        className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                        Create New Bill
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Bill Information Section */}
                    <div className="col-span-12 md:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Bill Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bill Number
                                </label>
                                <input
                                    type="text"
                                    value={billNumber}
                                    onChange={(e) => setBillNumber(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter bill number"
                                    disabled={showProductForm}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bill Date
                                </label>
                                <input
                                    type="date"
                                    value={billDate}
                                    onChange={(e) => setBillDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={showProductForm}
                                    required
                                />
                            </div>
                            
                            {!showProductForm && (
                                <button
                                    onClick={() => setShowProductForm(true)}
                                    disabled={!billNumber || !billDate}
                                    className="w-full mt-2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:bg-gray-300"
                                >
                                    Proceed to Add Products
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="col-span-12 md:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Products</h2>
                        
                        {showProductForm ? (
                            <>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            value={currentProduct.name}
                                            onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter product name"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Unit Price
                                            </label>
                                            <input
                                                type="number"
                                                value={currentProduct.price}
                                                onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={currentProduct.quantity}
                                                onChange={(e) => setCurrentProduct({...currentProduct, quantity: parseInt(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleAddProduct}
                                        disabled={!currentProduct.name || currentProduct.price <= 0 || currentProduct.quantity <= 0}
                                        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:bg-gray-300"
                                    >
                                        Add Product
                                    </button>
                                </div>
                                
                                {products.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium mb-3">Added Products</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Product
                                                        </th>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Price
                                                        </th>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Qty
                                                        </th>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Subtotal
                                                        </th>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {products.map((product) => (
                                                        <tr key={product.id}>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm">{product.name}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm">${product.price.toFixed(2)}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm">{product.quantity}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm">${(product.price * product.quantity).toFixed(2)}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                                <button
                                                                    onClick={() => handleRemoveProduct(product.id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-gray-50">
                                                        <td colSpan={3} className="px-3 py-2 text-right font-medium">Total:</td>
                                                        <td colSpan={2} className="px-3 py-2 font-bold">${totalAmount.toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                onClick={() => {
                                                    setShowProductForm(false);
                                                    setProducts([]);
                                                }}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSubmitBill}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                            >
                                                Submit Bill
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                Enter bill information and click &quot;Proceed&quot; to add products
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Admin verification page for purchase bills

function AdminVerificationPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

    useEffect(() => {
        // In a real application, fetch bills from API
        // This is mock data for demonstration
        const mockBills: Bill[] = [
            {
                id: '1',
                billNumber: 'B001',
                billDate: '2023-11-01',
                products: [
                    { id: '101', name: 'Product A', price: 50, quantity: 2, verified: false },
                    { id: '102', name: 'Product B', price: 75, quantity: 1, verified: false }
                ],
                total: 175,
                verified: false
            },
            {
                id: '2',
                billNumber: 'B002',
                billDate: '2023-11-02',
                products: [
                    { id: '201', name: 'Product C', price: 30, quantity: 3, verified: false },
                    { id: '202', name: 'Product D', price: 120, quantity: 1, verified: false }
                ],
                total: 210,
                verified: false
            }
        ];
        setBills(mockBills);
    }, []);

    const toggleBillExpansion = (billId: string) => {
        setExpandedBillId(expandedBillId === billId ? null : billId);
    };

    const handleProductVerification = (billId: string, productId: string, checked: boolean) => {
        setBills(bills.map(bill => {
            if (bill.id === billId) {
                const updatedProducts = bill.products.map(product => {
                    if (product.id === productId) {
                        return { ...product, verified: checked };
                    }
                    return product;
                });
                return { 
                    ...bill, 
                    products: updatedProducts,
                    verified: updatedProducts.every(p => p.verified)
                };
            }
            return bill;
        }));
    };

    const handleVerifyAllProducts = (billId: string, verified: boolean) => {
        setBills(bills.map(bill => {
            if (bill.id === billId) {
                const updatedProducts = bill.products.map(product => ({
                    ...product, 
                    verified
                }));
                return { 
                    ...bill, 
                    products: updatedProducts,
                    verified
                };
            }
            return bill;
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Admin Bill Verification</h1>
            
            {bills.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500">No bills available for verification</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bills.map(bill => (
                        <div 
                            key={bill.id} 
                            className={`bg-white p-4 rounded-xl shadow-sm border ${bill.verified ? 'border-green-300' : 'border-gray-200'}`}
                        >
                            <div className="flex flex-wrap justify-between items-center cursor-pointer" onClick={() => toggleBillExpansion(bill.id)}>
                                <div className="mb-2 md:mb-0">
                                    <span className="font-medium">Bill #{bill.billNumber}</span>
                                    <span className="text-sm text-gray-500 ml-2">({bill.billDate})</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-3 text-sm">
                                        {bill.verified ? 
                                            <span className="text-green-600 font-medium">Verified</span> : 
                                            <span className="text-orange-500 font-medium">Pending</span>
                                        }
                                    </span>
                                    <span className="text-blue-600">
                                        {expandedBillId === bill.id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>
                            
                            {expandedBillId === bill.id && (
                                <div className="mt-4">
                                    <div className="flex flex-wrap justify-between items-center mb-3">
                                        <h3 className="text-lg font-medium mb-2 md:mb-0">Products</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVerifyAllProducts(bill.id, !bill.verified);
                                            }}
                                            className={`px-3 py-1 text-sm rounded ${bill.verified ? 
                                                'bg-gray-200 hover:bg-gray-300 text-gray-700' : 
                                                'bg-green-500 hover:bg-green-600 text-white'}`}
                                        >
                                            {bill.verified ? 'Unverify All' : 'Verify All'}
                                        </button>
                                    </div>
                                    
                                    {/* Mobile view - cards instead of table */}
                                    <div className="md:hidden space-y-3">
                                        {bill.products.map((product) => (
                                            <div key={product.id} className="border rounded-lg p-3 bg-gray-50">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{product.name}</span>
                                                    <div>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={product.verified}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleProductVerification(bill.id, product.id, e.target.checked);
                                                            }}
                                                            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                                                    <div>Price: <span className="font-medium">${product.price.toFixed(2)}</span></div>
                                                    <div>Quantity: <span className="font-medium">{product.quantity}</span></div>
                                                    <div className="col-span-2">
                                                        Subtotal: <span className="font-medium">${(product.price * product.quantity).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <div className="flex justify-between font-bold">
                                                <span>Total:</span>
                                                <span>${bill.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop view - table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Product
                                                    </th>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Price
                                                    </th>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Qty
                                                    </th>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Subtotal
                                                    </th>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Verify
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {bill.products.map((product) => (
                                                    <tr key={product.id}>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">{product.name}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">${product.price.toFixed(2)}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">{product.quantity}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">${(product.price * product.quantity).toFixed(2)}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={product.verified}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleProductVerification(bill.id, product.id, e.target.checked);
                                                                }}
                                                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50">
                                                    <td colSpan={3} className="px-3 py-2 text-right font-medium">Total:</td>
                                                    <td colSpan={2} className="px-3 py-2 font-bold">${bill.total.toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Submit Button */}
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Here you would submit the verified bill to your backend
                                                console.log(`Submitting bill ${bill.billNumber} for processing`);
                                                alert(`Bill #${bill.billNumber} has been submitted successfully!`);
                                            }}
                                            disabled={!bill.verified}
                                            className={`px-4 py-2 rounded-md ${bill.verified 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {bill.verified ? 'Submit Bill' : 'Verify All Products First'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Export the appropriate component based on user role
let PageComponent = null;
if (user === "sales") PageComponent = PurchasePage;
else if (user === "admin") PageComponent = AdminVerificationPage;
export default PageComponent;