import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onGetStarted: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="text-2xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Pasty
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#pricing" className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium">
            Pricing
          </a>
          <a href="#about" className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium">
            About
          </a>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={onGetStarted}
            className="bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Get Started
          </button>
        </div>

        <button
          className="md:hidden text-neutral-600 hover:text-neutral-900"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-neutral-100">
          <nav className="flex flex-col py-4">
            <a href="#features" className="px-8 py-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#pricing" className="px-8 py-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium">
              Pricing
            </a>
            <a href="#about" className="px-8 py-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium">
              About
            </a>
            <div className="px-8 py-4 border-t border-neutral-100 mt-2">
              <button 
                onClick={onGetStarted}
                className="w-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}; 