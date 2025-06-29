import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import ffmpeg from 'ffmpeg-static';
import { spawn, ChildProcess } from 'child_process';
import ytdl from 'ytdl-core';
import { createClient } from '@supabase/supabase-js';
import Queue from 'bull';
import path from 'path';
import { promises as fs } from 'fs';
import fs_sync from 'fs';  // we need this for createWriteStream
import os from 'os';

// Initialize clients
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,  // if these are null your app will crash and burn anyway
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  }
});

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Create processing queue
const videoQueue = new Queue('video-processing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
});

interface VideoSegment {
  start: number;
  end: number;
  title: string;
  type: 'intro' | 'main' | 'outro';
}

async function detectScenes(videoPath: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const timestamps: number[] = [];
    const ffmpegProcess = spawn(ffmpeg as string, [
      '-i', videoPath,
      '-vf', 'select=gt(scene\\,0.3)',  // detect scene changes
      '-f', 'null',
      '-'
    ]) as ChildProcess;  // typescript needs this spoon-fed to it

    if (!ffmpegProcess.stderr) {
      reject(new Error('No stderr stream available'));
      return;
    }

    ffmpegProcess.stderr.on('data', (data) => {
      const match = data.toString().match(/pts_time:(\\d+\\.?\\d*)/);
      if (match) {
        timestamps.push(parseFloat(match[1]));
      }
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve(timestamps);
      } else {
        reject(new Error('Scene detection failed'));
      }
    });
  });
}

async function extractClip(
  videoPath: string, 
  start: number, 
  duration: number, 
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpeg as string, [
      '-i', videoPath,
      '-ss', start.toString(),
      '-t', duration.toString(),
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-preset', 'veryfast',
      outputPath
    ]) as ChildProcess;

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Clip extraction failed'));
      }
    });
  });
}

async function uploadToS3(filePath: string, key: string): Promise<string> {
  const fileContent = await fs.readFile(filePath);
  
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: 'video/mp4'
  }));

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// Process video job
videoQueue.process(async (job) => {
  const { videoId, youtubeUrl, userId } = job.data;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-'));
  const videoPath = path.join(tempDir, 'video.mp4');

  try {
    // Update status to processing
    await supabase
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId);

    // Download video
    await new Promise<void>((resolve, reject) => {
      ytdl(youtubeUrl, { quality: 'highest' })
        .pipe(fs_sync.createWriteStream(videoPath))  // use the sync version for streams
        .on('finish', () => resolve())  // explicitly type the resolve callback
        .on('error', reject);
    });

    // Detect scenes
    const sceneChanges = await detectScenes(videoPath);
    
    // Create segments
    const videoInfo = await ytdl.getInfo(youtubeUrl);
    const duration = parseInt(videoInfo.videoDetails.lengthSeconds);
    
    const segments: VideoSegment[] = sceneChanges.map((start, i) => ({
      start,
      end: sceneChanges[i + 1] || duration,
      title: `Clip ${i + 1}`,
      type: i === 0 ? 'intro' : i === sceneChanges.length - 1 ? 'outro' : 'main'
    }));

    // Extract and upload clips
    const clipUrls = await Promise.all(
      segments.map(async (segment, i) => {
        const clipPath = path.join(tempDir, `clip_${i}.mp4`);
        await extractClip(videoPath, segment.start, segment.end - segment.start, clipPath);
        
        const s3Key = `clips/${videoId}/${path.basename(clipPath)}`;
        const url = await uploadToS3(clipPath, s3Key);
        
        // Save clip to database
        await supabase
          .from('video_clips')
          .insert({
            video_id: videoId,
            url,
            title: segment.title,
            start_time: segment.start,
            end_time: segment.end,
            scene_type: segment.type
          });

        return url;
      })
    );

    // Generate script template
    const script = `# ${videoInfo.videoDetails.title}\n\n${
      segments.map(segment => 
        `## ${segment.title} (${segment.start}s - ${segment.end}s)\n` +
        `[Add your script for this ${segment.type} section here]\n`
      ).join('\n')
    }`;

    // Update video status
    await supabase
      .from('videos')
      .update({ 
        status: 'completed',
        script,
        title: videoInfo.videoDetails.title
      })
      .eq('id', videoId);

    return { clipUrls, segments };

  } catch (error) {
    console.error('Video processing failed:', error);
    
    await supabase
      .from('videos')
      .update({ 
        status: 'error',
        error_message: error.message
      })
      .eq('id', videoId);

    throw error;
  } finally {
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

// Error handling
videoQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

export async function addToProcessingQueue(
  videoId: string,
  youtubeUrl: string,
  userId: string
) {
  return videoQueue.add({
    videoId,
    youtubeUrl,
    userId
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
} 