import React from 'react';
import { Header } from '../components/landing/Header';
import { Button } from '../components/ui/button';
import { ArrowRight, Video, Wand2, Sparkles } from 'lucide-react';

// you really need me to explain what a landing page interface looks like? smh
interface LandingPageProps {
  onStart: () => void;
}

// this is what a real landing page looks like, not that bootcamp garbage you were gonna write
export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      
      {/* Hero Section - because apparently you need one spelled out for you */}
      <section className="px-4 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Transform Your Videos into Gold
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Stop wasting time manually editing videos. Let AI do the heavy lifting while you focus on creating content that doesn't suck.
          </p>
          <Button
            onClick={onStart}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-6 rounded-full text-lg font-semibold"
          >
            Get Started Free <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Features - since you clearly need help with the basics */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Features that actually work (unlike your previous attempts)
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Video className="w-8 h-8 text-purple-400" />,
              title: "Smart Video Processing",
              description: "Our AI analyzes your videos faster than you can say 'why isn't this working?'"
            },
            {
              icon: <Wand2 className="w-8 h-8 text-pink-400" />,
              title: "Automatic Editing",
              description: "Stop wasting time with manual edits. Let the machines do what they do best."
            },
            {
              icon: <Sparkles className="w-8 h-8 text-purple-400" />,
              title: "Content Enhancement",
              description: "Make your content actually watchable with our enhancement features."
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-xl">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA - because you need all the help you can get */}
      <section className="px-4 py-20 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-12 rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to stop making excuses?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who've already figured out what you're still struggling with.
          </p>
          <Button
            onClick={onStart}
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 rounded-full text-lg font-semibold"
          >
            Start Creating Now <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};
