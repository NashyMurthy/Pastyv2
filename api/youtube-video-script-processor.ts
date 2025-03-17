import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

interface VideoInfo {
  title: string;
  author: string;
  thumbnailUrl: string;
  duration?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

async function getVideoInfo(url: string): Promise<VideoInfo> {
  try {
    const videoId = url.match(/shorts\/([^/?]+)/)?.[1];
    if (!videoId) throw new Error('Invalid YouTube Shorts URL');

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error('YouTube API key not configured');

    // Get detailed video info from YouTube API
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YouTube API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    if (!data.items?.[0]) throw new Error('Video not found');

    const video = data.items[0];
    return {
      title: video.snippet.title,
      author: video.snippet.channelTitle,
      thumbnailUrl: video.snippet.thumbnails?.maxres?.url || 
                   video.snippet.thumbnails?.standard?.url ||
                   video.snippet.thumbnails?.high?.url ||
                   video.snippet.thumbnails?.default?.url,
      duration: video.contentDetails.duration
    };
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    throw new Error(`Failed to fetch video information: ${error.message}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 Script processor started');
  console.log('Request headers:', req.headers);

  if (req.method === 'OPTIONS') {
    console.log('👋 CORS preflight request');
    return res.status(200).set(corsHeaders).send('ok');
  }

  try {
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth header present:', !!authHeader);
    if (!authHeader) throw new Error('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '');
    console.log('🎟️ Token extracted');
    if (!token) throw new Error('Invalid authorization header format');

    console.log('🔧 Creating Supabase client...');
    const supabaseClient = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      { 
        global: { 
          headers: { Authorization: authHeader } 
        },
        auth: {
          persistSession: false
        }
      }
    );

    console.log('👤 Getting user...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) {
      console.error('❌ User error:', userError);
      throw new Error('Unauthorized');
    }
    console.log('✅ Got user:', user?.id);

    console.log('🎥 Fetching pending videos...');
    const { data: videos, error: fetchError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('status', 'pending')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return res.status(200).json({ message: 'No pending videos found' });
      }
      throw fetchError;
    }
    console.log('✅ Found video:', videos);

    console.log('🔄 Updating status to processing...');
    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videos.id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      throw updateError;
    }
    console.log('✅ Status updated');

    try {
      console.log('🎬 Getting video info...');
      const videoInfo = await getVideoInfo(videos.youtube_url);
      console.log('✅ Got video info:', videoInfo);

      console.log('📝 Updating video with info...');
      const { error: infoUpdateError } = await supabaseClient
        .from('videos')
        .update({
          title: videoInfo.title,
          thumbnail_url: videoInfo.thumbnailUrl,
          status: 'processing'
        })
        .eq('id', videos.id)
        .eq('user_id', user.id);

      if (infoUpdateError) {
        console.error('❌ Info update error:', infoUpdateError);
        throw infoUpdateError;
      }
      console.log('✅ Video info updated');

      console.log('🎯 Calling video processor...');
      const processorResponse = await fetch(
        `${process.env.VERCEL_URL}/api/video-processor`,
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            videoId: videos.id,
            duration: videoInfo.duration 
          })
        }
      );

      if (!processorResponse.ok) {
        const error = await processorResponse.json();
        console.error('❌ Processor error:', error);
        throw new Error(error.message || 'Failed to process video');
      }
      console.log('✅ Video processor called successfully');

      return res.status(200).json({ 
        message: 'Video analysis started',
        video: { 
          ...videos,
          status: 'processing',
          title: videoInfo.title,
          thumbnail_url: videoInfo.thumbnailUrl
        }
      });

    } catch (processError: any) {
      console.error('❌ Process error:', processError);
      
      console.log('🔄 Updating status to error...');
      await supabaseClient
        .from('videos')
        .update({ 
          status: 'error',
          error_message: processError.message
        })
        .eq('id', videos.id)
        .eq('user_id', user.id);

      throw processError;
    }

  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    return res.status(error.message === 'Unauthorized' ? 401 : 500).json({ 
      error: error.message || 'An unexpected error occurred'
    });
  }
} 