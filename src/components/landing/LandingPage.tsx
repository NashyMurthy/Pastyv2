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
    onStart(); // Tell App to show Auth
  };

  const handleSelectPlan = (plan: { name: string; price: string; billingPeriod: string }) => {
    onStart(); // Also trigger auth if user clicks a plan
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <Header onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection onSelectPlan={handleSelectPlan} />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
