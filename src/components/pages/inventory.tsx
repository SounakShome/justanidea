"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Search, Package, Calendar, PlusCircle } from 'lucide-react';
import { SiteHeader } from "@/components/site-header"

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    purchaseDate: string;
    category: string;
    image?: string;
}

export default function InventoryPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const inventoryItems: InventoryItem[] = [
        { id: '1', name: 'Laptop', quantity: 5, purchaseDate: new Date('2023-10-15').toLocaleDateString(), category: 'Electronics', image: 'https://placehold.co/200x150' },
        { id: '2', name: 'Office Chair', quantity: 12, purchaseDate: new Date('2023-09-22').toLocaleDateString(), category: 'Furniture', image: 'https://placehold.co/200x150' },
        { id: '3', name: 'Notebooks', quantity: 100, purchaseDate: new Date('2023-11-05').toLocaleDateString(), category: 'Stationery', image: 'https://placehold.co/200x150' },
        { id: '4', name: 'Wireless Mouse', quantity: 20, purchaseDate: new Date('2023-11-05').toLocaleDateString(), category: 'Electronics', image: 'https://placehold.co/200x150' },
        { id: '5', name: 'Headphones', quantity: 15, purchaseDate: new Date('2023-11-05').toLocaleDateString(), category: 'Electronics', image: 'https://placehold.co/200x150' },
        { id: '6', name: 'Desk Lamp', quantity: 8, purchaseDate: new Date('2023-11-05').toLocaleDateString(), category: 'Furniture', image: 'https://placehold.co/200x150' },
    ];

    const filteredItems = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="px-6">
                <SiteHeader name="Inventory" />
            </div>
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Total Items</p>
                                <p className="font-bold text-xl">{inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Categories</p>
                                <p className="font-bold text-xl">{new Set(inventoryItems.map(item => item.category)).size}</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
                            <div className="bg-emerald-100 p-3 rounded-lg">
                                <Package className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Low Stock Items</p>
                                <p className="font-bold text-xl">{inventoryItems.filter(item => item.quantity < 10).length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-4 mb-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-0">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search items by name or category..."
                                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                                <PlusCircle size={18} />
                                <span>Add Item</span>
                            </button>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-36 bg-gray-100 overflow-hidden">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={200}
                                                height={150}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{item.category}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Quantity</p>
                                                <p className="font-medium text-gray-700">{item.quantity}</p>
                                            </div>
                                            <div className="border-r border-gray-200 h-8"></div>
                                            <div>
                                                <p className="text-xs text-gray-500">Purchase Date</p>
                                                <p className="font-medium text-gray-700">{new Date(item.purchaseDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors">
                                                Edit
                                            </button>
                                            <button className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors">
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 bg-white rounded-xl shadow-md p-8 text-center">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-800">No items found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};