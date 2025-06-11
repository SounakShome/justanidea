
import React from 'react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="py-4 w-full">
      <div className="container px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-invenly-purple"
          >
            <path 
              d="M3 10H21M6 14H18M12 18H12.01M5 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8C3 6.89543 3.89543 6 5 6Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xl font-bold">Invenly</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <a href="#features" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-invenly-purple transition-colors">
            Features
          </a>
          <a href="#pricing" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-invenly-purple transition-colors">
            Pricing
          </a>
          <a href="#contact" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-invenly-purple transition-colors">
            Contact
          </a>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="hidden md:inline-flex">
            Login
          </Button>
          <Button className="bg-invenly-purple hover:bg-invenly-indigo transition-colors">
            Create Account
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
