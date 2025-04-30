import React from 'react';
import { Video, Wand2, FileVideo, ScrollText } from 'lucide-react';
import { Auth } from './Auth';

export function LandingPage() {
  const [showAuth, setShowAuth] = React.useState(false);

  if (showAuth) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="w-8 h-8" />
          <span className="text-2xl tracking-tight">Pasty</span>
        </div>
        <nav>
          <button 
            onClick={() => setShowAuth(true)}
            className="px-6 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
          >
            Get Started
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-8 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-6xl font-normal tracking-tight">
            Transform Your Content
          </h1>
          <p className="text-xl text-neutral-500">
            Create engaging videos in minutes with AI-powered tools
          </p>
          <div className="pt-6">
            <button
              onClick={() => setShowAuth(true)} 
              className="px-8 py-4 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
            >
              <Wand2 className="w-5 h-5" />
              Start Creating
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto mt-32">
          <div className="space-y-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-normal">AI-Powered Scripts</h3>
            <p className="text-neutral-500">Generate engaging scripts tailored to your content</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <FileVideo className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-normal">Smart Clip Library</h3>
            <p className="text-neutral-500">Access relevant clips based on your content</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <ScrollText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-normal">Easy Editing</h3>
            <p className="text-neutral-500">Modify and customize your content effortlessly</p>
          </div>
        </div>
      </main>
    </div>
  );
} 