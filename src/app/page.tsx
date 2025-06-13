import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import Cta from '@/components/CTA';
import Footer from '@/components/Footer';
import { auth } from '@/auth';

export default async function Home() {

  // Check if the user is authenticated
  const session = await auth();

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header session={session} />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Cta />
      <Footer />
    </main>
  );
}