"use client";

import React, { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { HiBars3BottomLeft } from "react-icons/hi2";
import { LuChartBar, LuClipboardCopy, LuClipboardPaste, LuFileBox, LuUsers, LuSettings2, LuIndianRupee } from 'react-icons/lu';
import { usePathname } from 'next/navigation';

interface SideBarProps {
    username?: string;
    userRole?: string;
}

const SideBar: React.FC<SideBarProps> = ({ username = 'User', userRole = 'Admin' }) => {
    const [collapsed, setCollapsed] = useState(true);
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', icon: <LuChartBar />, path: '/' },
        { name: 'Inventory', icon: <LuFileBox />, path: '/inventory' },
        { name: 'Purchases', icon: <LuClipboardCopy />, path: '/purchases' },
        { name: 'Orders', icon: <LuClipboardPaste />, path: '/orders' },
        { name: 'Users', icon: <LuUsers />, path: '/users' },
        { name: 'Expenses', icon: <LuIndianRupee />, path: '/expenses' },
        { name: 'Settings', icon: <LuSettings2 />, path: '/settings' },
    ];

    return (
        <div className={`h-screen ${collapsed ? 'relative' : 'absolute'} md:relative bg-white text-gray-800 transition-all duration-300 shadow-md ${collapsed ? 'w-20' : 'w-64'} z-50 `}>
            <div className="p-4 flex justify-between items-center border-b border-gray-200">
                {!collapsed && <h1 className="text-xl font-bold text-blue-600">Inventory MS</h1>}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                >
                    <HiBars3BottomLeft />
                </button>
            </div>

            <div className="p-4 border-b border-gray-200">
                <a href="/signup">
                {!collapsed ? (
                    <div>
                        <p className="font-semibold text-gray-800">{username}</p>
                        <p className="text-sm text-gray-500">{userRole}</p>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                            {username.charAt(0)}
                        </div>
                    </div>
                )}</a>
            </div>

            <nav className="mt-4">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name} className="mb-1 px-3">
                            <a
                                href={item.path}
                                className={`flex items-center py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors ${
                                    pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {!collapsed && <span className="ml-3 font-medium">{item.name}</span>}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    className={`flex items-center ${collapsed ? 'justify-center' : ''} w-full p-2 rounded-md cursor-pointer hover:bg-red-50 text-red-600 transition-colors`}
                >
                    <FaSignOutAlt />
                    {!collapsed && <span className="ml-2 font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default SideBar;