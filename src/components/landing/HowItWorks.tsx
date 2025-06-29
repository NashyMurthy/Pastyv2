import React from 'react';
import { Link2, Wand, Video, Zap } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Link2 className="h-8 w-8 text-indigo-600" />,
      title: "Paste YouTube URL",
      description: "Simply paste a YouTube URL into our platform to begin the transformation process."
    },
    {
      icon: <Wand className="h-8 w-8 text-indigo-600" />,
      title: "AI Analyzes Content",
      description: "Our advanced AI analyzes the video content, extracting key information and insights."
    },
    {
      icon: <Video className="h-8 w-8 text-indigo-600" />,
      title: "Generate Assets",
      description: "Create scripts, clips, and edited videos tailored to your specific needs."
    },
    {
      icon: <Zap className="h-8 w-8 text-indigo-600" />,
      title: "Edit & Export",
      description: "Fine-tune your generated content and export in multiple formats for various platforms."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your content in four simple steps with our elegant and powerful platform.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute left-1/2 top-24 bottom-24 w-0.5 bg-indigo-200 -translate-x-1/2 z-0"></div>

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div key={index} className="relative z-10">
                <div className={`flex flex-col md:flex-row items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-1/2 flex justify-center mb-6 md:mb-0">
                    <div className={`bg-indigo-50 rounded-full p-8 relative ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                      <div className="absolute inset-0 bg-indigo-100 rounded-full transform scale-90"></div>
                      <div className="relative z-10 h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-md">
                        {step.icon}
                      </div>
                      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 h-12 w-12 bg-indigo-600 rounded-full items-center justify-center text-white font-bold text-xl right-0 transform translate-x-1/2">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 text-center md:text-left">
                    <div className="md:max-w-sm mx-auto">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold transition-transform hover:scale-105">
            Try It Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 