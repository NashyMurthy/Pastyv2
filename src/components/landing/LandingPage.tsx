import React, { useState } from 'react';
import { Header } from './Header';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import Footer from './Footer';
import { Auth } from '../Auth';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {

  const [showAuth, setShowAuth] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
    billingPeriod: string;
  } | null>(null);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleSelectPlan = (plan: { name: string; price: string; billingPeriod: string }) => {
    setSelectedPlan(plan);
    setShowAuth(true);
  };

  if (showAuth) {
    return <Auth />;
  }

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
