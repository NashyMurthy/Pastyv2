import React from 'react';
import { Video, Twitter, Instagram, Youtube, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-5">
              <Video className="h-8 w-8 text-indigo-400 mr-2" />
              <span className="text-2xl font-bold text-white">Pasty</span>
            </div>
            <p className="text-gray-400 mb-5 max-w-md">
              Transform your content with our AI-powered platform. Create engaging scripts, smart clips, and fully edited videos in minutes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Product</h3>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Use Cases', 'Tutorials', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Blog', 'Press', 'Partners'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Support</h3>
            <ul className="space-y-3">
              {['Help Center', 'Contact Us', 'Community', 'Status', 'Terms of Service', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              © 2025 Pasty. All rights reserved.
            </p>
            <div className="flex items-center">
              <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5 mr-2" />
                <span>Subscribe to our newsletter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 