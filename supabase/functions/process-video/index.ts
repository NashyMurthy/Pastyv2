import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import ytdl from 'https://esm.sh/ytdl-core@4.11.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get videos in 'pending' status for the authenticated user
    const { data: videos, error: fetchError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('status', 'pending')
      .eq('user_id', user.id)
      .limit(1)

    if (fetchError) throw fetchError
    if (!videos || videos.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending videos found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const video = videos[0]

    // Update status to processing
    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', video.id)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    try {
      // Get video info
      const videoInfo = await ytdl.getInfo(video.youtube_url)
      
      // Generate script using video title and description
      const script = `Title: ${videoInfo.videoDetails.title}\n\nDescription: ${videoInfo.videoDetails.description}`

      // Update video with script and completed status
      const { error: completeError } = await supabaseClient
        .from('videos')
        .update({
          script,
          status: 'completed'
        })
        .eq('id', video.id)
        .eq('user_id', user.id)

      if (completeError) throw completeError

      return new Response(
        JSON.stringify({ 
          message: 'Video processed successfully',
          video: { ...video, script, status: 'completed' }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (processError) {
      // Update status to error if processing fails
      await supabaseClient
        .from('videos')
        .update({ 
          status: 'error',
          script: `Error: ${processError.message}`
        })
        .eq('id', video.id)
        .eq('user_id', user.id)

      throw processError
    }

  } catch (error) {
    const status = error.message === 'Unauthorized' ? 401 : 500
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})