'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExtractMeterReadingMutation } from '@/lib/queries/consumption';
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface MeterImageUploadProps {
  consumptionId: string;
  currentImageUrl?: string | null;
  onExtractionComplete?: (result: {
    reading: number;
    confidence: number | null;
    imageUrl: string;
  }) => void;
}

export function MeterImageUpload({
  consumptionId,
  currentImageUrl,
  onExtractionComplete,
}: MeterImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<{
    reading: number;
    confidence: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractMutation = useExtractMeterReadingMutation();

  const handleUploadSuccess = (result: unknown) => {
    // Handle different possible result formats from Cloudinary
    let secureUrl: string | undefined;

    if (result && typeof result === 'object') {
      const resultObj = result as { info?: unknown };
      if (resultObj.info) {
        if (typeof resultObj.info === 'string') {
          secureUrl = resultObj.info;
        } else if (resultObj.info && typeof resultObj.info === 'object') {
          const infoObj = resultObj.info as { secure_url?: string; url?: string };
          secureUrl = infoObj.secure_url || infoObj.url;
        }
      }
    }

    if (secureUrl) {
      setImageUrl(secureUrl);
      setError(null);
      setExtractionResult(null);
    }
  };

  const handleExtractReading = async () => {
    if (!imageUrl) {
      setError('Please upload an image first');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const result = await extractMutation.mutateAsync({
        consumptionId,
        imageUrl,
      });

      if (result.success && result.consumption) {
        setExtractionResult({
          reading: result.consumption.energyReading,
          confidence: result.consumption.ocrConfidence,
        });

        if (onExtractionComplete) {
          onExtractionComplete({
            reading: result.consumption.energyReading,
            confidence: result.consumption.ocrConfidence,
            imageUrl,
          });
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to extract meter reading. Please try again.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const getConfidenceBadgeVariant = (confidence: number | null) => {
    if (confidence === null) return 'outline';
    if (confidence >= 80) return 'default';
    if (confidence >= 50) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Meter Image</label>
        {imageUrl ? (
          <div className="space-y-2">
            <div className="relative w-full h-48 border rounded-md overflow-hidden">
              <Image src={imageUrl} alt="Meter reading" fill className="object-contain" />
            </div>
            <div className="flex gap-2">
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <Button type="button" variant="outline" onClick={() => open()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Change Image
                  </Button>
                )}
              </CldUploadWidget>
              <Button type="button" onClick={handleExtractReading} disabled={isExtracting}>
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Extract Reading
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={handleUploadSuccess}
          >
            {({ open }) => (
              <Button type="button" variant="outline" onClick={() => open()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Meter Image
              </Button>
            )}
          </CldUploadWidget>
        )}
      </div>

      {extractionResult && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2">
              <span>Reading extracted:</span>
              <strong>{extractionResult.reading.toFixed(3)} kWh</strong>
              {extractionResult.confidence !== null && (
                <Badge variant={getConfidenceBadgeVariant(extractionResult.confidence)}>
                  {extractionResult.confidence}% confidence
                </Badge>
              )}
            </div>
            {extractionResult.confidence !== null && extractionResult.confidence < 70 && (
              <p className="mt-2 text-sm text-yellow-600">
                Low confidence detected. Please verify the reading manually.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
