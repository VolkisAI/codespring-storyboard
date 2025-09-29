'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';

interface VideoProcessorProps {
  onAudioReady: (audioBlob: Blob, originalFile: File) => void;
  onError: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export function VideoProcessor({ onAudioReady, onError, onProgress }: VideoProcessorProps) {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (ffmpegRef.current) {
        console.log('[VideoProcessor] FFmpeg already loaded or loading.');
        return;
      }
      
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on('log', ({ message }) => {
          // You can filter or format logs here if needed
          // console.log('[FFmpeg]', message);
        });

        ffmpeg.on('progress', ({ progress }) => {
          if (onProgress) {
            onProgress(progress);
          }
        });

        const baseURL = '/ffmpeg';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setLoaded(true);
        console.log('[VideoProcessor] FFmpeg loaded successfully');
      } catch (error) {
        console.error('[VideoProcessor] Failed to load FFmpeg:', error);
        onError('Failed to load video processor. Please refresh and try again.');
      }
    };

    loadFFmpeg();

    return () => {
      // The terminate call should be handled carefully
      // For now, we leave it to ensure cleanup, but this might need adjustment
      // if we want to persist the loaded instance across navigations.
      if (ffmpegRef.current && !ffmpegRef.current.loaded) {
        // If it's loading, we might not want to terminate immediately.
        // This logic can be refined based on desired UX.
      }
    };
  }, []);

  const processVideo = async (file: File) => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg || !loaded) {
      onError('Video processor not ready. Please wait and try again.');
      return;
    }

    setProcessing(true);

    try {
      console.log(`[VideoProcessor] Processing ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);

      // Write the video file to FFmpeg's virtual filesystem
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      // Extract audio as MP3 with optimized settings for transcription
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vn', // No video
        '-acodec', 'mp3',
        '-ab', '64k', // 64k bitrate
        '-ar', '22050', // 22.05kHz sample rate
        '-ac', '1', // Mono
        'output.mp3'
      ]);

      // Read the output file
      const data = await ffmpeg.readFile('output.mp3');
      const audioBlob = new Blob([data], { type: 'audio/mp3' });

      console.log(`[VideoProcessor] Audio extracted: ${(audioBlob.size / (1024 * 1024)).toFixed(2)} MB`);

      // Clean up - it's better to clean up after each operation
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp3');

      onAudioReady(audioBlob, file);
    } catch (error) {
      console.error('[VideoProcessor] Processing error:', error);
      onError('Failed to process video. Please try a different file.');
    } finally {
      setProcessing(false);
    }
  };

  return { processVideo, isLoaded: loaded, isProcessing: processing };
} 