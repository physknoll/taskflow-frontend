'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import {
  Upload,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  Check,
  X,
} from 'lucide-react';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: Blob) => Promise<void>;
  onDelete?: () => Promise<void>;
  currentAvatar?: string | null;
  isUploading?: boolean;
  isDeleting?: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  rotation: number = 0,
  scale: number = 1
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Output size - keeping it reasonable for avatars (256x256)
  const outputSize = 256;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Calculate the scaled crop dimensions
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  // Enable smooth scaling
  ctx.imageSmoothingQuality = 'high';

  // Handle rotation
  const rotateRads = (rotation * Math.PI) / 180;
  const centerX = outputSize / 2;
  const centerY = outputSize / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputSize,
    outputSize
  );

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.95
    );
  });
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  onUpload,
  onDelete,
  currentAvatar,
  isUploading = false,
  isDeleting = false,
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile(reader.result as string);
      setScale(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
    setRotation(0);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleUpload = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        rotation,
        scale
      );
      await onUpload(croppedBlob);
      handleClose();
    } catch (error) {
      console.error('Failed to crop image:', error);
    }
  }, [completedCrop, rotation, scale, onUpload, handleClose]);

  const handleDelete = useCallback(async () => {
    if (onDelete) {
      await onDelete();
      handleClose();
    }
  }, [onDelete, handleClose]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Profile Photo"
      size="lg"
      disableContentScroll
    >
      <div className="space-y-6">
        {!selectedFile ? (
          <>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200',
                dragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 hover:bg-surface-50 dark:hover:bg-surface-800/50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center text-center">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors',
                  dragActive
                    ? 'bg-primary-100 dark:bg-primary-800'
                    : 'bg-surface-100 dark:bg-surface-800'
                )}>
                  <Upload className={cn(
                    'h-8 w-8 transition-colors',
                    dragActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-surface-400 dark:text-surface-500'
                  )} />
                </div>
                <p className="text-base font-medium text-surface-900 dark:text-white mb-1">
                  Drop your image here, or{' '}
                  <span className="text-primary-600 dark:text-primary-400">browse</span>
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  JPG, PNG, GIF or WebP. Max 2MB.
                </p>
              </div>
            </div>

            {/* Current avatar preview */}
            {currentAvatar && (
              <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <img
                    src={currentAvatar}
                    alt="Current avatar"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-surface-200 dark:ring-surface-700"
                  />
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">Current Photo</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      Upload a new photo to replace it
                    </p>
                  </div>
                </div>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Crop area */}
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md mx-auto bg-surface-900 rounded-xl overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  className="max-h-[400px]"
                >
                  <img
                    ref={imgRef}
                    src={selectedFile}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={{
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      transition: 'transform 0.2s ease-out',
                    }}
                    className="max-w-full max-h-[400px] object-contain mx-auto"
                  />
                </ReactCrop>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="px-3"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-lg">
                  <span className="text-sm font-medium text-surface-600 dark:text-surface-400 min-w-[3rem] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  className="px-3"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-2" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="px-3"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Hint text */}
              <p className="text-sm text-surface-500 dark:text-surface-400 text-center mt-3">
                Drag to reposition • Pinch or use buttons to zoom
              </p>
            </div>

            {/* Preview */}
            {completedCrop && imgRef.current && (
              <div className="flex items-center justify-center gap-6 py-4 border-t border-surface-200 dark:border-surface-700">
                <div className="text-center">
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">Preview</p>
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-100 dark:bg-surface-800 ring-2 ring-surface-200 dark:ring-surface-700">
                    <canvas
                      ref={(canvas) => {
                        if (canvas && imgRef.current && completedCrop) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            const image = imgRef.current;
                            const scaleX = image.naturalWidth / image.width;
                            const scaleY = image.naturalHeight / image.height;

                            canvas.width = 80;
                            canvas.height = 80;

                            ctx.imageSmoothingQuality = 'high';

                            const rotateRads = (rotation * Math.PI) / 180;
                            const centerX = 40;
                            const centerY = 40;

                            ctx.save();
                            ctx.translate(centerX, centerY);
                            ctx.rotate(rotateRads);
                            ctx.scale(scale, scale);
                            ctx.translate(-centerX, -centerY);

                            ctx.drawImage(
                              image,
                              completedCrop.x * scaleX,
                              completedCrop.y * scaleY,
                              completedCrop.width * scaleX,
                              completedCrop.height * scaleY,
                              0,
                              0,
                              80,
                              80
                            );

                            ctx.restore();
                          }
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-surface-200 dark:border-surface-700">
          <div>
            {selectedFile && (
              <Button variant="outline" onClick={clearSelection} size="sm">
                <X className="h-4 w-4 mr-2" />
                Choose Different Image
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {selectedFile && (
              <Button
                onClick={handleUpload}
                isLoading={isUploading}
                disabled={!completedCrop}
              >
                <Check className="h-4 w-4 mr-2" />
                Save Photo
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

