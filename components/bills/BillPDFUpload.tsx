'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExtractBillDataMutation } from '@/lib/queries/bills';
import type { BillOCRResult } from '@/lib/ocr-service';
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface BillPDFUploadProps {
  currentFileUrl?: string | null;
  onExtractionComplete?: (result: BillOCRResult) => void;
  onFileUploaded?: (fileUrl: string) => void;
}

export function BillPDFUpload({
  currentFileUrl,
  onExtractionComplete,
  onFileUploaded,
}: BillPDFUploadProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(currentFileUrl || null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<BillOCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractMutation = useExtractBillDataMutation();

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
      setFileUrl(secureUrl);
      setError(null);
      setExtractionResult(null);
      // Notify parent component about the file URL
      if (onFileUploaded) {
        onFileUploaded(secureUrl);
      }
    }
  };

  const handleExtractBill = async () => {
    if (!fileUrl) {
      setError('Please upload a bill PDF/image first');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const result = await extractMutation.mutateAsync({
        fileUrl,
      });

      if (result.success && result.data) {
        setExtractionResult(result.data);

        if (onExtractionComplete) {
          onExtractionComplete(result.data);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to extract bill information. Please try again.'
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
        <label className="text-sm font-medium">Bill PDF/Image</label>
        {fileUrl ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-4 border rounded-md bg-muted/50">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Bill uploaded</p>
                <p className="text-xs text-muted-foreground truncate">{fileUrl}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <Button type="button" variant="outline" onClick={() => open()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Change File
                  </Button>
                )}
              </CldUploadWidget>
              <Button type="button" onClick={handleExtractBill} disabled={isExtracting}>
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Extract Bill Data
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
                Upload Bill PDF/Image
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
              <span>Bill data extracted successfully</span>
              {extractionResult.confidence !== null && (
                <Badge variant={getConfidenceBadgeVariant(extractionResult.confidence)}>
                  {extractionResult.confidence}% confidence
                </Badge>
              )}
            </div>
            {extractionResult.confidence !== null && extractionResult.confidence < 70 && (
              <p className="mt-2 text-sm text-yellow-600">
                Low confidence detected. Please review and verify all extracted data manually.
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
