import React, { useEffect, useState } from 'react';
import { Video, Wand2, FileVideo, ScrollText, LogOut, Loader2, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
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

function App() {
const [user, setUser] = useState<User | null>(null);
const [videoUrl, setVideoUrl] = useState('');
const [activeTab, setActiveTab] = useState('create');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [videos, setVideos] = useState<VideoItem[]>([]);
const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
const [hasClickedGetStarted, setHasClickedGetStarted] = useState(
  localStorage.getItem('hasClickedGetStarted') === 'true' // Initialize from localStorage
);
const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
supabase.auth.getUser().then(({ data: { user } }) => {
setUser(user);
setAuthChecked(true);
});

const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
setUser(session?.user ?? null);
setAuthChecked(true); // ✅ This is the fix
});

```
return () => subscription.unsubscribe();

```

}, []);

useEffect(() => {
if (user) {
fetchVideos();
const subscription = supabase
.channel('videos')
.on('postgres_changes', {
event: '*',
schema: 'public',
table: 'videos',
filter: `user_id=eq.${user.id}`
}, () => {
fetchVideos();
})
.subscribe();

```
  const processingInterval = setInterval(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error('Failed to get session');
      }

      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      // Updated URL to match the deployed Edge Function name (yes, really)
      const response = await fetch('/api/youtube-video-script-processor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

     const data = await response.json();

```

if (data.video) {
await fetchVideos();
}

```
    } catch (err: any) {
      console.error('Error processing videos:', err.message);
      if (err.message.includes('Authentication failed')) {
        supabase.auth.signOut();
      }
    }
  }, 10000);

  return () => {
    subscription.unsubscribe();
    clearInterval(processingInterval);
  };
}

```

}, [user]);

useEffect(() => {
const progressIntervals: { [key: string]: ReturnType<typeof setInterval> } = {};

```
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
  Object.values(progressIntervals).forEach(intervalId => clearInterval(intervalId));
};

```

}, [videos]);

const fetchVideos = async () => {
try {
// first get videos
const { data: videos, error: videosError } = await supabase
.from('videos')
.select('*')
.order('created_at', { ascending: false });

```
  if (videosError) throw videosError;

  // then get clips for each video
  const videosWithClips = await Promise.all(
    (videos || []).map(async (video) => {
      const { data: clips } = await supabase
        .from('video_clips')
        .select('*')
        .eq('video_id', video.id)
        .order('start_time');

      return {
        ...video,
        clips: clips || []
      };
    })
  );

  setVideos(videosWithClips);
} catch (err) {
  console.error('Error fetching videos:', err);
}

```

};

const validateYouTubeUrl = (url: string) => {
// proper regex that handles all youtube short formats including mobile
const shortsPattern = /^https?:\/\/(?:(?:www|m)\.)?(?:youtube\.com\/shorts\/|youtu\.be\/shorts\/)([a-zA-Z0-9_-]+)(?:[/?].*)?$/i;
return shortsPattern.test(url);
};

const handleGenerate = async () => {
setError('');
setSuccess('');

```
if (!videoUrl.trim()) {
  setError('Please enter a YouTube Short URL');
  return;
}

if (!validateYouTubeUrl(videoUrl)) {
  setError('Please enter a valid YouTube Short URL');
  return;
}

setLoading(true);

try {
  const { data, error: insertError } = await supabase
    .from('videos')
    .insert([
      {
        user_id: user?.id,
        youtube_url: videoUrl.trim(),
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (insertError) throw insertError;

  setSuccess('Video added successfully! Processing will begin shortly.');
  setVideoUrl('');
  await fetchVideos();

} catch (err: any) {
  console.error('Error generating video:', err);
  setError(err.message || 'Failed to generate video. Please try again.');
  // Reset the video status if insertion failed
  if (err.message.includes('row-level security')) {
    setError('Permission denied. Please try again or contact support.');
  }
} finally {
  setLoading(false);
}

```

};

const handleSignOut = () => {
supabase.auth.signOut();
};


const onStart = () => {
localStorage.setItem('hasClickedGetStarted', 'true'); // Save to localStorage
setHasClickedGetStarted(true); // Update state
};

  
const getStatusIcon = (status: VideoItem['status']) => {
switch (status) {
case 'completed':
return <CheckCircle2 className="w-5 h-5 text-green-500" />;
case 'processing':
return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
case 'error':
return <XCircle className="w-5 h-5 text-red-500" />;
default:
return <Clock className="w-5 h-5 text-neutral-500" />;
}
};

const getStatusText = (video: VideoItem) => {
switch (video.status) {
case 'completed':
return 'Ready';
case 'processing':
return 'Processing...';
case 'error':
return 'Failed';
default:
return video.progress ? `Pending (${Math.round(video.progress)}%)` : 'Pending';
}
};

const toggleVideoExpansion = (videoId: string) => {
setExpandedVideo(expandedVideo === videoId ? null : videoId);
};

if (!authChecked) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}

if (!user && !hasClickedGetStarted) {
  return <LandingPage onStart={onStart} />; // Use the new function
}

if (!user && hasClickedGetStarted) {
  return <Auth />;
}

return (
<div className="min-h-screen bg-white text-neutral-900">
<header className="container mx-auto px-8 py-6 border-b border-neutral-100">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<Video className="w-8 h-8" />
<span className="text-2xl tracking-tight">Pasty</span>
</div>
<nav className="flex items-center gap-8">
<ul className="flex gap-6">
<li>
<button
onClick={() => setActiveTab('create')}
className={`px-4 py-2 transition-colors ${                     activeTab === 'create'                        ? 'text-neutral-900 border-b-2 border-neutral-900'                        : 'text-neutral-500 hover:text-neutral-900'                   }`}
>
Create Video
</button>
</li>
<li>
<button
onClick={() => setActiveTab('scripts')}
className={`px-4 py-2 transition-colors ${                     activeTab === 'scripts'                        ? 'text-neutral-900 border-b-2 border-neutral-900'                        : 'text-neutral-500 hover:text-neutral-900'                   }`}
>
Generate Scripts
</button>
</li>
</ul>
<button
onClick={handleSignOut}
className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
title="Sign out"
>
<LogOut className="w-5 h-5" />
</button>
</nav>
</div>
</header>

```
  <main className="container mx-auto px-8 py-12">
    {activeTab === 'create' ? (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-normal tracking-tight text-center mb-6">
          Transform Your Content
        </h1>
        <p className="text-neutral-500 text-center mb-12">
          Paste a YouTube Short URL and let us handle the rest
        </p>

        <div className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setError('');
                setSuccess('');
              }}
              placeholder="Paste YouTube Short URL here..."
              className="flex-1 px-4 py-3 border border-neutral-200 rounded-none text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors rounded-none flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}
          {success && (
            <p className="mt-2 text-green-600 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </p>
          )}
        </div>

        {videos.length > 0 && (
          <div className="border border-neutral-200 rounded-none overflow-hidden mb-16">
            <h2 className="text-lg font-medium p-4 bg-neutral-50 border-b border-neutral-200">
              Your Videos
            </h2>
            <div className="divide-y divide-neutral-200">
              {videos.map((video) => (
                <div key={video.id} className="flex flex-col">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
                    onClick={() => toggleVideoExpansion(video.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(video.status)}
                      <div className="space-y-1">
                        <span className="text-sm text-neutral-600">{video.youtube_url}</span>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-neutral-500">{getStatusText(video)}</p>
                          {video.status === 'pending' && video.progress !== undefined && (
                            <div className="w-32 h-1 bg-neutral-100">
                              <div
                                className="h-full bg-neutral-500 transition-all duration-300"
                                style={{ width: `${video.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500">
                        {new Date(video.created_at).toLocaleDateString()}
                      </span>
                      {expandedVideo === video.id ? (
                        <ChevronUp className="w-4 h-4 text-neutral-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>
                  </div>
                  {expandedVideo === video.id && (
                    <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                      {video.clips && video.clips.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-sm font-medium mb-4">Video Clips</h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {video.clips.map((clip) => (
                              <div key={clip.id} className="space-y-2">
                                <div className="relative pt-[56.25%] bg-neutral-100">
                                  <video
                                    src={clip.url}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    controls
                                    preload="metadata"
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="font-medium">{clip.title}</p>
                                  <p className="text-sm text-neutral-500">
                                    {clip.scene_type} • {clip.end_time - clip.start_time}s
                                  </p>
                                  <p className="text-xs text-neutral-400">
                                    {clip.start_time}s - {clip.end_time}s
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {video.script && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Generated Script</h3>
                          <pre className="text-sm text-neutral-600 whitespace-pre-wrap font-mono bg-white p-4 border border-neutral-200 rounded-none">
                            {video.script}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-12">
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
      </div>
    ) : (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-normal tracking-tight text-center mb-6">
          Script Generator
        </h1>
        <p className="text-neutral-500 text-center mb-12">
          Create engaging scripts for your next viral video
        </p>

        <div className="space-y-4">
          <textarea
            placeholder="Describe what kind of script you want..."
            className="w-full px-4 py-3 border border-neutral-200 rounded-none text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 min-h-[200px]"
          />
          <button className="px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors rounded-none flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generate Script
          </button>
        </div>
      </div>
    )}
  </main>
</div>

```

);
}

export default App;
