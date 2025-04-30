import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  image: string;
  rating: number;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role, image, rating }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 relative">
      <div className="absolute -top-3 -right-3 bg-amber-400 text-indigo-900 font-bold text-xs rounded-full h-10 w-10 flex items-center justify-center">
        {rating}.0
      </div>
      <div className="flex mb-4">
        {Array.from({ length: rating }).map((_, index) => (
          <Star key={index} className="h-5 w-5 text-amber-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 mb-6">"{quote}"</p>
      <div className="flex items-center">
        <img 
          src={image} 
          alt={author} 
          className="h-12 w-12 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-900">{author}</h4>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Pasty has completely transformed my content creation workflow. I'm now able to produce twice the content in half the time.",
      author: "Alex Morgan",
      role: "YouTube Creator",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
      rating: 5
    },
    {
      quote: "The AI script generation is mind-blowing. It captures the essence of my videos and creates engaging scripts that resonate with my audience.",
      author: "Sophia Chen",
      role: "Content Strategist",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      rating: 5
    },
    {
      quote: "Our marketing team's productivity has increased by 300% since we started using Pasty. The ROI is incredible.",
      author: "Marcus Johnson",
      role: "Marketing Director",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of content creators who have transformed their workflow with our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-full shadow-md px-8 py-4">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-900 mr-2">4.9</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 text-amber-400 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-gray-600">from 500+ reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 