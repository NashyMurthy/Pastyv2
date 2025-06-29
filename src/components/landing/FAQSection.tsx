import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-indigo-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-indigo-600" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 text-gray-600 pr-8">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How does the content transformation process work?",
      answer: "Our platform uses advanced AI to analyze your YouTube content, extract key information, and transform it into various formats like scripts, clips, and edited videos. Simply paste a YouTube URL, and our system will handle the rest."
    },
    {
      question: "What types of content can I transform?",
      answer: "You can transform any YouTube content that doesn't violate our terms of service. This includes educational videos, tutorials, interviews, vlogs, product reviews, and more. The AI adapts to different content types to provide optimal results."
    },
    {
      question: "How long does the transformation process take?",
      answer: "The transformation time depends on the length and complexity of the original video. Most videos under 15 minutes are processed within 5-10 minutes. Longer videos may take more time, but our platform is designed to be 5x faster than manual methods."
    },
    {
      question: "Can I customize the generated content?",
      answer: "Absolutely! All generated content can be customized using our intuitive editing tools. You can adjust scripts, rearrange clips, add transitions, and make other modifications to ensure the final output matches your vision."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, we offer a 7-day free trial that includes 3 video transformations. This allows you to experience our platform's capabilities before committing to a subscription."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and for annual subscriptions, we also offer bank transfers. All payments are securely processed through our payment gateway."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our platform and services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Didn't find the answer you're looking for?
          </p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 