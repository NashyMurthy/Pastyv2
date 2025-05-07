import React from 'react';
import { Header } from './Header';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import Footer from './Footer';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const handleGetStarted = () => {
    onStart(); // ✅ trigger auth flow handled in App.tsx
  };

  const handleSelectPlan = (plan: { name: string; price: string; billingPeriod: string }) => {
    onStart(); // ✅ same here
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <Header onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={onStart} />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection onSelectPlan={handleSelectPlan} />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
