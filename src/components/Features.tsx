"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  Smartphone, 
  Tag, 
  AlertCircle, 
  Users, 
  ShoppingCart, 
  Zap 
} from 'lucide-react';

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const Features = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features: Feature[] = [
    {
      icon: <Package className="h-12 w-12 text-indigo-600" />,
      title: 'Complete Inventory Tracking',
      description: 'Track products, variants, and stock levels across multiple locations in real-time with detailed history logs.'
    },
    {
      icon: <Tag className="h-12 w-12 text-indigo-600" />,
      title: 'Smart Barcode System',
      description: 'Generate and scan barcodes for lightning-fast inventory checks, receiving, and order fulfillment.'
    },
    {
      icon: <AlertCircle className="h-12 w-12 text-indigo-600" />,
      title: 'Low Stock Alerts',
      description: 'Never run out of inventory with customizable alerts and automated purchase order creation.'
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-indigo-600" />,
      title: 'Powerful Analytics',
      description: 'Gain insights with 30+ reports on sales, inventory turnover, costs, and more to optimize your business.'
    },
    {
      icon: <Users className="h-12 w-12 text-indigo-600" />,
      title: 'Team Management',
      description: 'Manage user roles and permissions to control access to sensitive inventory data and operations.'
    },
    {
      icon: <Smartphone className="h-12 w-12 text-indigo-600" />,
      title: 'Mobile Accessibility',
      description: 'Access your inventory on the go with our responsive web app and dedicated mobile application.'
    },
    {
      icon: <ShoppingCart className="h-12 w-12 text-indigo-600" />,
      title: 'Seamless Integrations',
      description: 'Connect with your e-commerce platforms, POS systems, and accounting software for a unified workflow.'
    },
    {
      icon: <Zap className="h-12 w-12 text-indigo-600" />,
      title: 'Lightning-Fast Performance',
      description: 'Experience rapid search and filtering across thousands of inventory items without delays.'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Complete Control
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Our inventory management system is packed with features to help you streamline operations, reduce costs, and grow your business.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative bg-gray-50 dark:bg-gray-800 rounded-xl p-6 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700"
              variants={item}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
              {hoveredIndex === index && (
                <motion.div 
                  className="absolute inset-0 border-2 border-indigo-500 rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                ></motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;