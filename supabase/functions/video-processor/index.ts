// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.218.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { getInfo } from 'https://deno.land/x/ytdl_core@v0.1.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

interface VideoSegment {
  start: number;
  end: number;
  title: string;
  type: 'intro' | 'main' | 'outro';
}

async function getVideoDetails(videoId: string) {
  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.warn('No YouTube API key found, using mock data');
      return null;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      console.warn('YouTube API request failed, using mock data');
      return null;
    }

    const data = await response.json();
    return data.items?.[0];
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

async function getVideoUrl(videoId: string): Promise<string> {
  try {
    console.log('🎥 Getting video URL for:', videoId);
    // Make a request to YouTube with proper headers
    const response = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch video page:', response.status, response.statusText);
      throw new Error('Failed to fetch video page');
    }

    console.log('📄 Got video page, extracting player response...');
    const html = await response.text();
    
    // Extract video URL from player response
    const playerResponse = html.match(/"playerResponse":({.+?})\s*,\s*"]/)?.[1];
    if (!playerResponse) {
      console.error('❌ Could not find player response in HTML');
      throw new Error('Could not find player response');
    }
    
    console.log('🎮 Parsing player response...');
    const data = JSON.parse(playerResponse);
    const formats = data?.streamingData?.formats || [];
    
    console.log('📺 Available formats:', formats.length);
    // Find the best quality MP4 format
    const format = formats.find((f: any) => f.mimeType?.includes('video/mp4') && f.qualityLabel);
    if (!format) {
      console.error('❌ No suitable video format found');
      throw new Error('No suitable video format found');
    }
    
    console.log('✅ Found video URL with quality:', format.qualityLabel);
    return format.url;
  } catch (error) {
    console.error('❌ Error getting video URL:', error);
    throw new Error(`Failed to get video URL: ${error.message}`);
  }
}

async function downloadAndUploadClip(
  supabaseClient: any,
  youtubeId: string, 
  userId: string,
  segment: VideoSegment
): Promise<string> {
  try {
    console.log('🎬 Processing clip:', { youtubeId, userId, segment });
    
    // Get video URL from YouTube
    const videoUrl = await getVideoUrl(youtubeId);
    console.log('🎯 Got video URL');

    // Download video with proper headers
    console.log('⬇️ Downloading video segment...');
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.5',
        'Range': `bytes=${segment.start * 1000000}-${segment.end * 1000000}`, // Rough estimate for video size
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to download video:', response.status, response.statusText);
      throw new Error('Failed to download video');
    }

    console.log('📦 Converting video to buffer...');
    const buffer = await response.arrayBuffer();
    const fileName = `${segment.start}-${segment.end}.mp4`;
    const filePath = `${userId}/${youtubeId}/${fileName}`;

    console.log('⬆️ Uploading to Supabase Storage:', filePath);
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('video-clips')
      .upload(filePath, buffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    console.log('🔗 Getting public URL...');
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('video-clips')
      .getPublicUrl(filePath);

    console.log('✅ Clip processed successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error processing clip:', error);
    throw error;
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 60; // default to 60 seconds for shorts
  
  const [_, minutes, seconds] = match;
  return (parseInt(minutes || '0') * 60) + parseInt(seconds || '0');
}

async function analyzeVideo(videoId: string, title: string): Promise<VideoSegment[]> {
  const videoDetails = await getVideoDetails(videoId);
  
  if (videoDetails) {
    const duration = parseDuration(videoDetails.contentDetails.duration);
    const description = videoDetails.snippet.description;
    
    // Try to find timestamps in description
    const timestamps = description
      .split('\n')
      .filter(line => /^\d{1,2}:\d{2}/.test(line))
      .map(line => {
        const [timestamp, ...titleParts] = line.split(' ');
        const [mins, secs] = timestamp.split(':').map(Number);
        return {
          start: mins * 60 + secs,
          title: titleParts.join(' ').trim()
        };
      });

    if (timestamps.length > 0) {
      return timestamps.map((timestamp, i, arr) => ({
        start: timestamp.start,
        end: arr[i + 1]?.start || duration,
        title: timestamp.title || `Part ${i + 1}`,
        type: i === 0 ? 'intro' : i === arr.length - 1 ? 'outro' : 'main'
      }));
    }

    // No timestamps found, create smart segments based on video length
    const segmentCount = Math.min(Math.ceil(duration / 15), 4); // max 4 segments
    const segmentLength = Math.ceil(duration / segmentCount);

    return Array.from({ length: segmentCount }, (_, i) => ({
      start: i * segmentLength,
      end: Math.min((i + 1) * segmentLength, duration),
      title: i === 0 ? 'Hook & Intro' : 
             i === segmentCount - 1 ? 'Conclusion' : 
             `Main Point ${i}`,
      type: i === 0 ? 'intro' : 
            i === segmentCount - 1 ? 'outro' : 'main'
    }));
  }

  // Fallback for when API fails - create 15-second segments
  return [
    { start: 0, end: 15, title: 'Opening Hook', type: 'intro' },
    { start: 15, end: 45, title: title.substring(0, 30), type: 'main' },
    { start: 45, end: 60, title: 'Call to Action', type: 'outro' }
  ];
}

serve(async (req) => {
  console.log('🚀 Video processor started');
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // handle your janky CORS
  if (req.method === 'OPTIONS') {
    console.log('👋 CORS preflight request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Starting video processing...');
    
    // check if user is actually allowed to be here
    const authHeader = req.headers.get('Authorization')
    console.log('🔑 Auth header present:', !!authHeader);
    if (!authHeader) throw new Error('Missing Authorization header')

    console.log('🔧 Creating Supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    console.log('👤 Getting user...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      throw new Error('Unauthorized')
    }
    console.log('✅ Got user:', user.id);

    console.log('📝 Parsing request body...');
    const { videoId } = await req.json()
    if (!videoId) throw new Error('Missing videoId')
    console.log('🎥 Processing video:', videoId);

    console.log('🔍 Fetching video details...');
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single()

    if (videoError) {
      console.error('❌ Video fetch error:', videoError);
      throw new Error('Video not found')
    }
    console.log('✅ Got video details');

    console.log('🔍 Extracting YouTube ID...');
    const youtubeId = video.youtube_url.match(/shorts\/([^/?]+)/)?.[1]
    if (!youtubeId) throw new Error('Invalid YouTube Shorts URL')
    console.log('✅ Got YouTube ID:', youtubeId);

    try {
      console.log('🔄 Updating status to processing...');
      await supabaseClient
        .from('videos')
        .update({ status: 'processing' })
        .eq('id', videoId);
      console.log('✅ Status updated');

      console.log('📊 Analyzing video...');
      const segments = await analyzeVideo(youtubeId, video.title || 'Untitled');
      console.log('✅ Generated segments:', segments);

      console.log('🎬 Processing clips...');
      const clipUrls = await Promise.all(
        segments.map(async segment => {
          console.log('🔄 Processing segment:', segment);
          const url = await downloadAndUploadClip(supabaseClient, youtubeId, user.id, segment);
          console.log('✅ Got clip URL:', url);
          return {
            ...segment,
            url
          };
        })
      );
      console.log('✅ All clips processed');

      console.log('💾 Saving clips to database...');
      const { error: clipsError } = await supabaseClient
        .from('video_clips')
        .insert(
          clipUrls.map(clip => ({
            video_id: videoId,
            url: clip.url,
            title: clip.title,
            start_time: clip.start,
            end_time: clip.end,
            scene_type: clip.type
          }))
        );

      if (clipsError) {
        console.error('❌ Error saving clips:', clipsError);
        throw clipsError;
      }
      console.log('✅ Clips saved to database');

      console.log('📝 Generating script...');
      const script = `# ${video.title || 'Untitled Video'}\n\n${
        segments.map(segment => 
          `## ${segment.title} (${segment.start}s - ${segment.end}s)\n` +
          `[Write your script for this ${segment.type} section here]\n`
        ).join('\n')
      }`;

      console.log('🔄 Updating video status...');
      const { error: updateError } = await supabaseClient
        .from('videos')
        .update({ 
          status: 'completed',
          script
        })
        .eq('id', videoId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      console.log('✅ Video status updated');

      return new Response(
        JSON.stringify({ 
          message: 'Video processed successfully',
          clips: clipUrls 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (processError) {
      console.error('❌ Processing error:', processError);
      
      console.log('🔄 Updating status to error...');
      await supabaseClient
        .from('videos')
        .update({ 
          status: 'error',
          error_message: processError.message
        })
        .eq('id', videoId)
        .eq('user_id', user.id);

      throw processError;
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/video-processor' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
