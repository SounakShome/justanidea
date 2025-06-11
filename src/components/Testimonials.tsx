"use client"

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  stars: number;
  imageUrl: string;
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const controls = useAnimation();
  const [ref, inView] = useInView();

  const testimonials: Testimonial[] = [
    {
      quote: "StockMaster has revolutionized our inventory management. We've reduced stockouts by 86% and our warehouse efficiency has improved dramatically.",
      author: "Sarah Johnson",
      role: "COO",
      company: "RetailPro Inc.",
      stars: 5,
      imageUrl: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      quote: "The reporting capabilities are incredible. I can now make data-driven decisions about purchasing and inventory planning that have increased our profit margins.",
      author: "Michael Chen",
      role: "Inventory Manager",
      company: "Global Supplies",
      stars: 5,
      imageUrl: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      quote: "As a small business owner, I needed something simple yet powerful. StockMaster delivered exactly that, and their customer support is exceptional.",
      author: "Emily Rodriguez",
      role: "Owner",
      company: "Boutique Treasures",
      stars: 4,
      imageUrl: "https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Businesses Worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            See what our customers have to say about their experience with our inventory management system.
          </p>
        </div>

        <motion.div 
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={variants}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            <Quote className="absolute text-indigo-100 dark:text-gray-800 h-24 w-24 -top-6 -left-6 opacity-30" />
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 md:p-10 shadow-lg relative z-10 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${
                      i < testimonials[activeIndex].stars
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              
              <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 italic">
              &quot;{testimonials[activeIndex].quote}&quot;
              </blockquote>
              
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    width={48}
                    height={48} 
                    src={testimonials[activeIndex].imageUrl} 
                    alt={testimonials[activeIndex].author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900 dark:text-white">
                    {testimonials[activeIndex].author}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {testimonials[activeIndex].role}, {testimonials[activeIndex].company}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                  activeIndex === idx
                    ? 'bg-indigo-600 dark:bg-indigo-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;