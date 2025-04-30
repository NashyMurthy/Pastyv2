import React from 'react';

const HeroSection: React.FC<{ onGetStarted?: () => void }> = ({ onGetStarted }) => {
  return (
    <section className="relative py-32 flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50 to-amber-50 z-[-1]"></div>

      <div className="container mx-auto px-4 text-center relative">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            Transform Your Content With{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-transparent bg-clip-text">
              Intelligence
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Let our AI transform your videos into engaging scripts, smart clips, and fully edited content in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={onGetStarted}
              className="bg-neutral-900 text-white px-8 py-4 text-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              Get Started
            </button>
            <button className="bg-white text-neutral-900 border border-neutral-200 px-8 py-4 text-lg font-medium hover:bg-neutral-50 transition-colors">
              View Demo
            </button>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
          {[
            { number: '10M+', label: 'Videos Processed' },
            { number: '98%', label: 'Satisfaction Rate' },
            { number: '5x', label: 'Content Creation Speed' },
            { number: '24/7', label: 'AI Availability' },
          ].map((stat, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-4 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-1">{stat.number}</h3>
              <p className="text-neutral-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 h-40 w-40 bg-amber-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 -right-20 h-40 w-40 bg-blue-600/20 rounded-full blur-2xl"></div>
      </div>
    </section>
  );
};

export default HeroSection; 