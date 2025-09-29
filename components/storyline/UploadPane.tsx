'use client';

import React, { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { UploadCloud, FileVideo, Loader2, Info, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrimaryButton } from './PrimaryButton';
import { LoadingBar } from './LoadingBar';
import { toast } from './Toast';
import { useStepper } from './Stepper';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { visualStyles } from '@/config/visual-styles';
import { VideoProcessor } from './VideoProcessor';
import { Progress } from '@/components/ui/progress';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface UploadPaneProps {
  onGenerate: (formData: FormData, goTo: (step: number) => void) => Promise<void>;
  isGenerating: boolean;
  errorMessage?: string | null;
}

export function UploadPane({ onGenerate, isGenerating, errorMessage = null }: UploadPaneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<string>('pixar');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { setStep: goTo } = useStepper();

  // Initialize video processor
  const { processVideo, isLoaded, isProcessing: isFFmpegProcessing } = VideoProcessor({
    onAudioReady: async (audioBlob, originalFile) => {
      try {
        // 1. Request a signed upload URL for the original video
        const signedRes = await fetch(`/api/upload-video?fileName=${encodeURIComponent(originalFile.name)}`);
        const signedJson = await signedRes.json();
        if (!signedJson.success) {
          throw new Error(signedJson.error || 'Failed to get signed upload URL.');
        }

        const { uploadUrl, token, publicUrl } = signedJson;

        // 2. Upload the original video directly to storage
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'x-upsert-token': token,
            'Content-Type': originalFile.type || 'video/mp4',
          },
          body: originalFile,
        });

        // 3. Build form data for the server action (small payload)
        const formData = new FormData();
        // Convert blob to File object
        const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' });
        formData.append('audioFile', audioFile);
        formData.append('originalVideoUrl', publicUrl);
        formData.append('style', style);
        formData.append('fileName', originalFile.name);

        setIsProcessing(false);
        setProcessingProgress(0);

        // Submit to server
        await onGenerate(formData, goTo);
      } catch (error: any) {
        setIsProcessing(false);
        setProcessingProgress(0);
        toast.error('Upload failed', error.message || 'An error occurred while uploading the video.');
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      setProcessingProgress(0);
      toast.error('Processing failed', error);
    },
    onProgress: (progress) => {
      setProcessingProgress(Math.round(progress * 100));
    }
  });

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
        toast.error('Invalid file type', 'Please upload an MP4, MOV, AVI, or MKV file.');
        return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        toast.error('File too large', `Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
        return;
    }

    setFile(selectedFile);
  };

  const handleGenerateClick = async () => {
    if (!file || isGenerating || isProcessing) return;

    if (!isLoaded) {
      toast.error('Not ready', 'Video processor is still loading. Please wait a moment.');
      return;
    }

    setIsProcessing(true);
    await processVideo(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white px-6 py-8">
      {errorMessage && (
        <div className="mb-6 w-full max-w-2xl bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      <form ref={formRef} className="w-full max-w-2xl space-y-8">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'w-full max-w-[540px] h-[300px] mx-auto bg-[#1E2424]/5 border-2 border-dashed border-[#1E2424]/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-[#1E2424]/40',
            isDragActive && 'border-[#C5F547] bg-[#C5F547]/5',
            file && 'border-[#C5F547] bg-[#C5F547]/5'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {file ? (
            <div className="flex flex-col items-center gap-4 text-center p-4">
              <FileVideo className="w-12 h-12 text-[#C5F547]" />
              <p className="text-lg font-medium text-[#1E2424] break-all">{file.name}</p>
              <p className="text-sm text-[#1E2424]/60">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <UploadCloud className="w-10 h-10 text-[#1E2424]/60" />
              <div className="text-center">
                <p className="text-lg font-medium text-[#1E2424]">
                  {isDragActive ? 'Drop your video here' : 'Drop MP4 or click to select'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className="text-sm text-[#1E2424]/60">
                    Supports MP4, MOV, AVI, MKV files up to {MAX_FILE_SIZE_MB}MB.
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-[#1E2424]/60 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-[#1E2424] text-white rounded-xl p-3">
                        <p className="text-sm">
                          For files larger than {MAX_FILE_SIZE_MB}MB, we recommend using the free tool{' '}
                          <a
                            href="https://handbrake.fr/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#C5F547] underline"
                          >
                            HandBrake
                          </a>{' '}
                          to compress your video before uploading.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Style Picker */}
        <div className="w-full max-w-[540px] mx-auto">
          <label className="block text-lg font-medium text-[#1E2424] mb-4">
            Select Visual Style
          </label>
          <Select name="style" value={style} onValueChange={setStyle} required>
            <SelectTrigger 
              className={cn(
                'w-full h-12 rounded-2xl border-2 border-[#1E2424]/20 hover:border-[#C5F547] transition-colors',
                style && 'ring-2 ring-[#C5F547]'
              )}
            >
              <SelectValue placeholder="Choose a style for your clips" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(visualStyles).map(([key, { name }]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="w-full max-w-[540px] mx-auto space-y-2">
            <div className="flex justify-between text-sm text-[#1E2424]/60">
              <span>Extracting audio...</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}

        {/* Next CTA */}
        <div className="fixed bottom-6 inset-x-0 mx-auto w-11/12 sm:static sm:w-full sm:max-w-[540px] sm:mx-auto">
          <PrimaryButton
            type="button"
            disabled={isGenerating || isProcessing || !file || !isLoaded}
            onClick={handleGenerateClick}
            className="w-full h-12 text-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Extracting Audio...
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : !isLoaded ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading Processor...
              </>
            ) : 'Generate Storyline'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
} 