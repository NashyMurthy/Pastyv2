import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface PricingFeature {
  title: string;
  included: boolean[];
}

interface PricingPlan {
  name: string;
  description: string;
  price: { monthly: string; annually: string };
  priceDetail: string;
  featured: boolean;
  buttonText: string;
}

interface PricingSectionProps {
  onSelectPlan: (plan: { name: string; price: string; billingPeriod: string }) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [annual, setAnnual] = useState(true);

  const plans: PricingPlan[] = [
    {
      name: "Starter",
      description: "Perfect for occasional content creators",
      price: { monthly: "$19", annually: "$15" },
      priceDetail: "per month",
      featured: false,
      buttonText: "Get Started"
    },
    {
      name: "Professional",
      description: "Ideal for professional content creators",
      price: { monthly: "$49", annually: "$39" },
      priceDetail: "per month",
      featured: true,
      buttonText: "Get Started"
    },
    {
      name: "Business",
      description: "For teams and business needs",
      price: { monthly: "$99", annually: "$79" },
      priceDetail: "per month",
      featured: false,
      buttonText: "Contact Sales"
    }
  ];

  const features: PricingFeature[] = [
    { title: "Monthly video transformations", included: [true, true, true] },
    { title: "5 videos per month", included: [true, false, false] },
    { title: "25 videos per month", included: [false, true, false] },
    { title: "Unlimited videos", included: [false, false, true] },
    { title: "AI script generation", included: [true, true, true] },
    { title: "Smart clip library", included: [false, true, true] },
    { title: "Advanced editing tools", included: [false, true, true] },
    { title: "Custom export formats", included: [false, false, true] },
    { title: "Priority processing", included: [false, false, true] },
    { title: "API access", included: [false, false, true] },
    { title: "Priority support", included: [false, true, true] },
    { title: "Team collaboration", included: [false, false, true] }
  ];

  const handlePlanSelection = (plan: PricingPlan) => {
    onSelectPlan({
      name: plan.name,
      price: annual ? plan.price.annually : plan.price.monthly,
      billingPeriod: annual ? 'annually' : 'monthly'
    });
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your content creation needs.
          </p>

          <div className="mt-8 inline-flex items-center p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={`py-2 px-6 rounded-full text-sm font-medium transition-all ${
                !annual ? 'bg-white shadow-md text-indigo-700' : 'text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`py-2 px-6 rounded-full text-sm font-medium transition-all ${
                annual ? 'bg-white shadow-md text-indigo-700' : 'text-gray-700'
              }`}
            >
              Annually <span className="text-green-600 text-xs font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, planIndex) => (
            <div
              key={planIndex}
              className={`rounded-2xl overflow-hidden transition-all ${
                plan.featured
                  ? 'transform md:-translate-y-4 shadow-2xl ring-2 ring-amber-400'
                  : 'bg-white shadow-xl hover:shadow-2xl'
              }`}
            >
              <div
                className={`p-8 ${
                  plan.featured ? 'bg-gradient-to-br from-purple-900 to-blue-900' : 'bg-white'
                }`}
              >
                {plan.featured && (
                  <span className="inline-block text-xs font-semibold bg-amber-400 text-purple-900 rounded-full py-1 px-3 mb-4">
                    MOST POPULAR
                  </span>
                )}
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    plan.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mb-6 ${
                    plan.featured ? 'text-purple-100' : 'text-gray-600'
                  }`}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline">
                  <span
                    className={`text-4xl font-bold ${
                      plan.featured ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {annual ? plan.price.annually : plan.price.monthly}
                  </span>
                  <span
                    className={`ml-2 ${
                      plan.featured ? 'text-purple-100' : 'text-gray-600'
                    }`}
                  >
                    {plan.priceDetail}
                  </span>
                </div>
                <p
                  className={`text-sm mt-1 ${
                    plan.featured ? 'text-purple-100' : 'text-gray-500'
                  }`}
                >
                  {annual ? 'Billed annually' : 'Billed monthly'}
                </p>
              </div>
              
              <div className="bg-white p-8">
                <ul className="space-y-4 mb-8">
                  {features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-start ${
                        !feature.included[planIndex] ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {feature.included[planIndex] ? (
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                      )}
                      <span className="text-sm">{feature.title}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-br from-purple-900 to-blue-900 p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Enterprise Solution</h3>
              <p className="mb-6">
                Custom pricing for organizations with specific needs. Get a tailored solution for your team.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-amber-400 mr-3" />
                  <span>Unlimited transformations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-amber-400 mr-3" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-amber-400 mr-3" />
                  <span>Custom AI training</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-amber-400 mr-3" />
                  <span>SLA guarantees</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 p-8 flex items-center">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Contact our sales team
                </h4>
                <p className="text-gray-600 mb-6">
                  Get a custom quote for your organization's specific requirements.
                </p>
                <button className="bg-gradient-to-r from-purple-900 to-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 