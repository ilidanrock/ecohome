'use client';
import React, { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';

interface ImageCloudynaryProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  blurDataURL?: string;
  secure?: boolean;
}

function ImageCloudynary({
  src,
  alt,
  width,
  height,
  className,
  blurDataURL,
  secure = true,
}: ImageCloudynaryProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const signUrl = async () => {
      if (!secure || !src) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicId: src,
            options: {
              width,
              height,
              crop: 'fill',
              quality: 'auto',
              fetch_format: 'auto',
            },
          }),
        });

        if (!response.ok) {
          // If authentication is required (401), silently fall back to unsigned URL
          // This is expected behavior for public pages
          if (response.status === 401) {
            setError(null); // Clear error state, will use unsigned URL
            return;
          }
          throw new Error(`Failed to sign URL: ${response.status}`);
        }

        const data = await response.json();
        if (data.url) {
          setSignedUrl(data.url);
        }
      } catch (err) {
        // Only log non-authentication errors
        if (err instanceof Error && !err.message.includes('401')) {
          console.error('Error signing URL:', err);
        }
        // Set error state to trigger fallback to unsigned URL
        setError(err instanceof Error ? err : new Error('Error signing URL'));
      } finally {
        setIsLoading(false);
      }
    };

    signUrl();
  }, [src, width, height, secure]);

  // Si no es seguro o hay un error, usa la URL normal
  if (!secure || error || isLoading) {
    return (
      <CldImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        blurDataURL={blurDataURL || '/globe.svg'}
        priority={true}
      />
    );
  }

  // Usa la URL firmada si está disponible
  return (
    <CldImage
      src={signedUrl || src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      blurDataURL={blurDataURL || '/globe.svg'}
      priority={true}
    />
  );
}

export default ImageCloudynary;
