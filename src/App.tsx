import React, { useEffect, useState } from 'react';
import {
  Video,
  Wand2,
  FileVideo,
  ScrollText,
  LogOut,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { Auth } from './pages/Auth';
import { LandingPage } from './components/landing/LandingPage';
import type { User } from '@supabase/supabase-js';

interface VideoClip {
  id: string;
  video_id: string;
  title: string;
  start_time: number;
  end_time: number;
  scene_type: 'intro' | 'main' | 'outro';
  url: string;
}

interface VideoItem {
  id: string;
  youtube_url: string;
  title: string | null;
  script: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  clips?: VideoClip[];
  created_at: string;
}

interface AppProps {
  user: User;
}

function App({ user }: AppProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(
    localStorage.getItem('hasClickedGetStarted') === 'true'
  );

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('videos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    const processingInterval = setInterval(async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error('Failed to get session');
        if (!session?.access_token) throw new Error('No access token available');

        const response = await fetch('/api/youtube-video-script-processor', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.video) await fetchVideos();
      } catch (err: any) {
        console.error('Error processing videos:', err?.message || err);
        if (err?.message?.includes('Authentication failed')) {
          supabase.auth.signOut();
        }
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearInterval(processingInterval);
    };
  }, [user]);

  useEffect(() => {
    const progressIntervals: Record<string, NodeJS.Timeout> = {};
    videos.forEach(video => {
      if (video.status === 'pending' && !video.progress) {
        const intervalId = setInterval(() => {
          setVideos(prevVideos =>
            prevVideos.map(v => {
              if (v.id === video.id && v.status === 'pending') {
                const currentProgress = v.progress || 0;
                const newProgress = Math.min(95, currentProgress + 5);
                return { ...v, progress: newProgress };
              }
              return v;
            })
          );
        }, 2000);
        progressIntervals[video.id] = intervalId;
      }
    });
    return () => {
      Object.values(progressIntervals).forEach(clearInterval);
    };
  }, [videos]);

  const fetchVideos = async () => {
    try {
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (videosError) throw videosError;

      const videosWithClips = await Promise.all(
        (videos || []).map(async (video) => {
          const { data: clips } = await supabase
            .from('video_clips')
            .select('*')
            .eq('video_id', video.id)
            .order('start_time');
          return { ...video, clips: clips || [] };
        })
      );

      setVideos(videosWithClips);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const validateYouTubeUrl = (url: string) => {
    const shortsPattern = /^https?:\/\/(?:(?:www|m)\.)?(?:youtube\.com\/shorts\/|youtu\.be\/shorts\/)([a-zA-Z0-9_-]+)(?:[\/?].*)?$/i;
    return shortsPattern.test(url);
  };

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    if (!videoUrl.trim()) return setError('Please enter a YouTube Short URL');
    if (!validateYouTubeUrl(videoUrl)) return setError('Please enter a valid YouTube Short URL');
    setLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('videos')
        .insert([{ user_id: user?.id, youtube_url: videoUrl.trim(), status: 'pending' }])
        .select()
        .single();
      if (insertError) throw insertError;
      setSuccess('Video added successfully! Processing will begin shortly.');
      setVideoUrl('');
      await fetchVideos();
    } catch (err: any) {
      console.error('Error generating video:', err);
      setError(err.message || 'Failed to generate video. Please try again.');
      if (err.message.includes('row-level security')) {
        setError('Permission denied. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onStart = () => {
    localStorage.setItem('hasClickedGetStarted', 'true');
    setHasClickedGetStarted(true);
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}</h1>
      <p>This is your main app area.</p>
      <button
        onClick={handleSignOut}
        className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  );
}

export default App;
