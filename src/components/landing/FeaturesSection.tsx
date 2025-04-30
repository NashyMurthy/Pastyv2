import React from 'react';
import { Sparkles, FileText, Library, Edit } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-indigo-600" />,
      title: "AI-Powered Scripts",
      description: "Generate engaging scripts tailored to your content using our advanced AI algorithms."
    },
    {
      icon: <FileText className="h-6 w-6 text-indigo-600" />,
      title: "Smart Clip Library",
      description: "Access relevant clips based on your content for seamless integration and editing."
    },
    {
      icon: <Library className="h-6 w-6 text-indigo-600" />,
      title: "Content Transformation",
      description: "Transform YouTube videos into various formats optimized for different platforms."
    },
    {
      icon: <Edit className="h-6 w-6 text-indigo-600" />,
      title: "Easy Editing",
      description: "Modify and customize your content effortlessly with our intuitive editing tools."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Content Creators
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform offers everything you need to transform your content with elegance and efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="mt-20">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Transform Your Content Workflow
                </h3>
                <p className="text-white/80 mb-6">
                  Our platform reduces content creation time by up to 80%, allowing you to focus on creativity instead of tedious editing tasks.
                </p>
                <button className="bg-white text-indigo-900 px-8 py-3 rounded-full font-semibold transition-transform hover:scale-105">
                  Learn More
                </button>
              </div>
              <div className="bg-indigo-800 h-full">
                <img 
                  src="https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg" 
                  alt="Content workflow" 
                  className="w-full h-full object-cover mix-blend-overlay opacity-75"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 