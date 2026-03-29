/**
 * File Upload Component
 * Drag & drop file upload with progress tracking
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FileUploadProps {
  documentType: 'identity' | 'driver_license' | 'vehicle_registration' | 'insurance' | 'profile_photo' | 'other';
  onUploadComplete?: (url: string, fileId?: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // In MB
  acceptedTypes?: string[];
  multiple?: boolean;
}

export function FileUpload({
  documentType,
  onUploadComplete,
  onUploadError,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  multiple = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`File type ${file.type} not accepted`);
      toast.error(`File type not accepted: ${file.name}`);
      return false;
    }

    // Check file size
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB`);
      toast.error(`File too large: ${file.name} (${sizeMB.toFixed(2)}MB)`);
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const validFiles: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (validateFile(file)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length > 0) {
        setFiles(multiple ? [...files, ...validFiles] : [validFiles[0]]);
        setError(null);
      }
    },
    [files, multiple, maxSize, acceptedTypes]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles(files.filter((_, i) => i !== index));
    },
    [files]
  );

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    // Create abort controller for cancellation
    const abortController = new AbortController();

    try {
      const token = localStorage.getItem('supabase.auth.token');
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Convert file to base64
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to backend with timeout
        // Use a timeout ID to abort after 30 seconds
        const timeoutId = setTimeout(() => {
             const error = new Error('Upload Timeout');
             error.name = 'TimeoutError';
             abortController.abort(error);
        }, 30000); 
        
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/document-upload`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token || publicAnonKey}`,
              },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                documentType,
                base64Data,
              }),
              signal: abortController.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(errorData.error || 'Upload failed');
          }

          const data = await response.json();

          if (data.success) {
            setUploadedFiles((prev) => [
              ...prev,
              { name: file.name, url: data.document.url },
            ]);
            onUploadComplete?.(data.document.url, data.document.id);
            toast.success(`Uploaded: ${file.name}`);
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError' || fetchError.message?.includes('aborted')) {
            throw new Error('Upload timeout - file too large or slow connection');
          }
          throw fetchError;
        }

        // Update progress
        setProgress(((i + 1) / files.length) * 100);
      }

      setFiles([]);
      toast.success('All files uploaded successfully!');
    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>

              <div>
                <p className="text-lg font-medium mb-1">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  {acceptedTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')} up to{' '}
                  {maxSize}MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={acceptedTypes.join(',')}
                multiple={multiple}
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Files
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected files */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <FileIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {!uploading && (
              <Button
                onClick={uploadFiles}
                className="w-full mt-4"
                disabled={files.length === 0}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Uploaded Files</p>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}