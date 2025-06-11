import Link from 'next/link';
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-indigo-400" />
              <span className="font-bold text-xl text-white">StockMaster</span>
            </div>
            <p className="mb-6 text-gray-400">
              Powerful inventory management for businesses of all sizes. Take control of your stock and streamline your operations.
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                <span>contact@stockmaster.com</span>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                <span>123 Inventory Lane, San Francisco, CA 94103</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-400 transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <p className="text-gray-400">
                &copy; {currentYear} StockMaster. All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Link 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;