'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, RefreshCw, Calendar } from 'lucide-react';

interface MeterReadingDisplayProps {
  energyReading: number;
  previousReading?: number | null;
  ocrExtracted: boolean;
  ocrConfidence?: number | null;
  ocrRawText?: string | null;
  extractedAt?: Date | null;
  meterImageUrl?: string | null;
  onEdit?: () => void;
  onReExtract?: () => void;
  showActions?: boolean;
}

export function MeterReadingDisplay({
  energyReading,
  previousReading,
  ocrExtracted,
  ocrConfidence,
  ocrRawText,
  extractedAt,
  meterImageUrl,
  onEdit,
  onReExtract,
  showActions = true,
}: MeterReadingDisplayProps) {
  const getConfidenceBadgeVariant = (confidence: number | null | undefined) => {
    if (confidence === null || confidence === undefined) return 'outline';
    if (confidence >= 80) return 'default';
    if (confidence >= 50) return 'secondary';
    return 'destructive';
  };

  const consumptionForPeriod = previousReading
    ? Math.max(energyReading - previousReading, 0)
    : energyReading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Meter Reading</CardTitle>
            <CardDescription>
              {ocrExtracted ? 'Extracted via OCR' : 'Entered manually'}
            </CardDescription>
          </div>
          {ocrExtracted && ocrConfidence !== null && ocrConfidence !== undefined && (
            <Badge variant={getConfidenceBadgeVariant(ocrConfidence ?? null)}>
              {ocrConfidence}% confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Reading</p>
            <p className="text-2xl font-bold">{energyReading.toFixed(3)} kWh</p>
          </div>
          {previousReading !== null && previousReading !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Previous Reading</p>
              <p className="text-2xl font-bold">{previousReading.toFixed(3)} kWh</p>
            </div>
          )}
        </div>

        {previousReading !== null && previousReading !== undefined && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Consumption for Period</p>
            <p className="text-xl font-semibold">{consumptionForPeriod.toFixed(3)} kWh</p>
          </div>
        )}

        {ocrExtracted && extractedAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Extracted on {new Date(extractedAt).toLocaleString()}</span>
          </div>
        )}

        {ocrRawText && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-1">Raw OCR Text</p>
            <p className="text-sm font-mono bg-muted p-2 rounded">{ocrRawText}</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 border-t pt-4">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Manually
              </Button>
            )}
            {onReExtract && ocrExtracted && meterImageUrl && (
              <Button variant="outline" onClick={onReExtract}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-extract
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
