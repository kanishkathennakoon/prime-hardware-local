'use client';

import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  buttonText?: string;
  folder?: string;
}

export default function FileUploader({
  onUploadComplete,
  buttonText = 'Upload Image',
  folder,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      toast({
        description: 'File uploaded successfully',
      });

      onUploadComplete(data.url);
    } catch (error) {
      toast({
        variant: 'destructive',
        description:
          error instanceof Error ? error.message : 'Failed to upload image',
      });
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className='relative inline-block'>
      <Button
        type='button'
        variant='outline'
        disabled={isUploading}
        className='cursor-pointer flex items-center gap-2'
        asChild
      >
        <label>
          {isUploading ? (
            <Loader className='w-4 h-4 animate-spin' />
          ) : (
            <UploadCloud className='w-4 h-4' />
          )}
          {isUploading ? 'Uploading...' : buttonText}
          <input
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </Button>
    </div>
  );
}
