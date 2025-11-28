'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BillPDFUpload } from './BillPDFUpload';
import { useCreateElectricityBillWithChargesMutation } from '@/lib/queries/bills';
import {
  createBillWithChargesSchema,
  type CreateBillWithChargesInput,
} from '@/zod/bill-form-schemas';
import type { BillOCRResult } from '@/lib/ocr-service';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

interface ElectricityBillFormProps {
  propertyId: string;
  properties?: Array<{ id: string; name: string }>; // Optional list of properties for selection
  onSuccess?: () => void;
}

export function ElectricityBillForm({
  propertyId: initialPropertyId,
  properties,
  onSuccess,
}: ElectricityBillFormProps) {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<BillOCRResult | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createMutation = useCreateElectricityBillWithChargesMutation();

  const form = useForm<CreateBillWithChargesInput>({
    resolver: zodResolver(createBillWithChargesSchema),
    defaultValues: {
      propertyId: initialPropertyId,
      periodStart: undefined,
      periodEnd: undefined,
      totalKWh: 0,
      totalCost: 0,
      fileUrl: null,
      serviceCharges: {
        maintenanceAndReplacement: 0,
        fixedCharge: 0,
        compensatoryInterest: 0,
        publicLighting: 0,
        lawContribution: 0,
        lateFee: 0,
        previousMonthRounding: 0,
        currentMonthRounding: 0,
      },
    },
  });

  // Pre-fill form when OCR data is extracted
  useEffect(() => {
    if (extractedData) {
      const { electricityBill, serviceCharges } = extractedData;

      // Convert ISO date strings to Date objects
      form.setValue('periodStart', new Date(electricityBill.periodStart));
      form.setValue('periodEnd', new Date(electricityBill.periodEnd));
      form.setValue('totalKWh', electricityBill.totalKWh);
      form.setValue('totalCost', electricityBill.totalCost);
      form.setValue('fileUrl', fileUrl);

      // Set service charges
      form.setValue(
        'serviceCharges.maintenanceAndReplacement',
        serviceCharges.maintenanceAndReplacement
      );
      form.setValue('serviceCharges.fixedCharge', serviceCharges.fixedCharge);
      form.setValue('serviceCharges.compensatoryInterest', serviceCharges.compensatoryInterest);
      form.setValue('serviceCharges.publicLighting', serviceCharges.publicLighting);
      form.setValue('serviceCharges.lawContribution', serviceCharges.lawContribution);
      form.setValue('serviceCharges.lateFee', serviceCharges.lateFee);
      form.setValue('serviceCharges.previousMonthRounding', serviceCharges.previousMonthRounding);
      form.setValue('serviceCharges.currentMonthRounding', serviceCharges.currentMonthRounding);
    }
  }, [extractedData, fileUrl, form]);

  const handleExtractionComplete = (result: BillOCRResult) => {
    setExtractedData(result);
    // File URL is already set from the upload component
  };

  const onSubmit = async (values: CreateBillWithChargesInput) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Format dates as ISO strings
      const result = await createMutation.mutateAsync({
        propertyId: values.propertyId,
        periodStart: values.periodStart.toISOString(),
        periodEnd: values.periodEnd.toISOString(),
        totalKWh: values.totalKWh,
        totalCost: values.totalCost,
        fileUrl: values.fileUrl || null,
        serviceCharges: values.serviceCharges,
      });

      if (result) {
        setSubmitSuccess(true);
        if (onSuccess) {
          onSuccess();
        } else {
          // Default: redirect after 2 seconds
          setTimeout(() => {
            router.push('/admin/electricity-bills');
          }, 2000);
        }
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to create electricity bill. Please try again.'
      );
    }
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload and Extract Bill Data</CardTitle>
          <CardDescription>
            Upload a bill PDF/image and extract information automatically using OCR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillPDFUpload
            currentFileUrl={fileUrl}
            onExtractionComplete={handleExtractionComplete}
            onFileUploaded={(url) => {
              setFileUrl(url);
              form.setValue('fileUrl', url);
            }}
          />
          {extractedData && extractedData.confidence < 70 && (
            <Alert className="mt-4" variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Low confidence detected ({extractedData.confidence}%). Please review all extracted
                data carefully before submitting.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Electricity Bill Information</CardTitle>
              <CardDescription>Basic information about the electricity bill</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {properties && properties.length > 0 && (
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="periodStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Start</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={formatDateForInput(field.value)}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="periodEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period End</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={formatDateForInput(field.value)}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalKWh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total kWh</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Cost (S/)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Charges</CardTitle>
              <CardDescription>Additional service charges (before and after IGV)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Before IGV</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serviceCharges.maintenanceAndReplacement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance and Replacement</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceCharges.fixedCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed Charge</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceCharges.compensatoryInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compensatory Interest</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceCharges.publicLighting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Public Lighting</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">After IGV</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serviceCharges.lawContribution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Law Contribution (N° 28749)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceCharges.lateFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Late Fee</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceCharges.previousMonthRounding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Month Rounding</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Can be negative</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceCharges.currentMonthRounding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Month Rounding</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Can be negative</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Electricity bill and service charges created successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Bill'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
