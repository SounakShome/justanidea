"use client";

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import Cta from '@/components/CTA';
import Footer from '@/components/Footer';
import { useSession } from "next-auth/react"

export default function Home() {

  const { data: session } = useSession()

  console.log(session)

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Cta />
      <Footer />
    </main>
  );
}