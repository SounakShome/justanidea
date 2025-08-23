"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PricingPlan = {
  name: string;
  price: {
    monthly: string;
    yearly: string;
  };
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  highlighted?: boolean;
  buttonText: string;
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PricingPlan[] = [
    {
      name: "Starter",
      price: {
        monthly: "$29",
        yearly: "$24",
      },
      description: "Perfect for small businesses just getting started",
      features: [
        { text: "Up to 1,000 inventory items", included: true },
        { text: "Basic reporting", included: true },
        { text: "Single location", included: true },
        { text: "2 user accounts", included: true },
        { text: "Email support", included: true },
        { text: "Product categorization", included: true },
        { text: "API access", included: false },
        { text: "Advanced analytics", included: false },
      ],
      buttonText: "Start Free Trial",
    },
    {
      name: "Professional",
      price: {
        monthly: "$79",
        yearly: "$69",
      },
      description: "Ideal for growing businesses with multiple needs",
      highlighted: true,
      features: [
        { text: "Up to 10,000 inventory items", included: true },
        { text: "Advanced reporting", included: true },
        { text: "Up to 3 locations", included: true },
        { text: "10 user accounts", included: true },
        { text: "Priority email & chat support", included: true },
        { text: "Advanced product management", included: true },
        { text: "API access", included: true },
        { text: "Advanced analytics", included: true },
      ],
      buttonText: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: {
        monthly: "$199",
        yearly: "$179",
      },
      description: "For large businesses with complex inventory needs",
      features: [
        { text: "Unlimited inventory items", included: true },
        { text: "Custom reporting", included: true },
        { text: "Unlimited locations", included: true },
        { text: "Unlimited user accounts", included: true },
        { text: "24/7 priority support", included: true },
        { text: "Enterprise product management", included: true },
        { text: "API access with higher rate limits", included: true },
        { text: "AI-powered insights & forecasting", included: true },
      ],
      buttonText: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Choose the plan that fits your business needs. All plans include a 14-day free trial.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              role="switch"
              aria-checked={billingCycle === 'yearly'}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium flex items-center ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Yearly
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-100">
                Save 15%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {plans.map((plan, index) => (
              <motion.div
                key={`${plan.name}-${billingCycle}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative rounded-2xl bg-white dark:bg-gray-900 shadow-lg overflow-hidden ${
                  plan.highlighted 
                    ? 'border-2 border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500 dark:ring-indigo-400 transform md:-translate-y-4 z-10' 
                    : 'border border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 inset-x-0 bg-indigo-600 text-white text-xs text-center py-1 font-medium">
                    MOST POPULAR
                  </div>
                )}
                
                <div className={`px-6 py-8 ${plan.highlighted ? 'pt-10' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 min-h-[50px]">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 ml-2 mb-1">
                        /month
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Billed annually
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <span 
                          className={`ml-3 ${
                            feature.included 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant={plan.highlighted ? "default" : "outline"} 
                    size="lg"
                    className="w-full font-medium"
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Pricing;