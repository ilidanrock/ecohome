/**
 * OCR Service using OpenAI Vision API
 * Extracts meter readings from images using GPT-4o-mini
 * Extracts bill information from electricity bill PDFs/images
 */

interface OCRResult {
  reading: number;
  confidence: number; // 0-100
  rawText?: string;
}

export interface BillOCRResult {
  electricityBill: {
    periodStart: string; // ISO date string
    periodEnd: string; // ISO date string
    totalKWh: number;
    totalCost: number;
  };
  serviceCharges: {
    maintenanceAndReplacement: number;
    fixedCharge: number;
    compensatoryInterest: number;
    publicLighting: number;
    lawContribution: number;
    lateFee: number;
    previousMonthRounding: number;
    currentMonthRounding: number;
  };
  confidence: number; // 0-100
  rawText?: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Custom error types for OCR operations
 */
export class OCRApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'OCRApiError';
  }
}

export class OCRParsingError extends Error {
  constructor(
    message: string,
    public readonly rawContent?: string
  ) {
    super(message);
    this.name = 'OCRParsingError';
  }
}

export class OCRValidationError extends Error {
  constructor(
    message: string,
    public readonly invalidValue?: unknown
  ) {
    super(message);
    this.name = 'OCRValidationError';
  }
}

const { OPENAI_API_KEY } = process.env;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini'; // More economical, sufficient for OCR
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Extracts meter reading from an image URL using OpenAI Vision
 * @param imageUrl - URL of the meter image (Cloudinary URL)
 * @returns OCR result with reading, confidence, and raw text
 * @throws Error if extraction fails after retries
 */
export async function extractMeterReading(imageUrl: string): Promise<OCRResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const prompt = `You are an expert at reading electricity meter displays. Analyze this image and extract the current meter reading in kWh (kilowatt-hours).

The meter reading should be:
- A positive number
- Typically between 0 and 999999 (but can be higher)
- May have decimal places (usually 1-3 decimal places)
- The main number displayed on the meter

Respond ONLY with a JSON object in this exact format:
{
  "reading": <number>,
  "confidence": <number 0-100>,
  "rawText": "<any text you see on the meter>"
}

If you cannot clearly read the meter, set confidence to a low value (below 50) and still provide your best guess for the reading.`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 200,
          temperature: 0.1, // Low temperature for more consistent results
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new OCRApiError(
          `OpenAI API error: ${response.status} - ${errorText}`,
          response.status
        );
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new OCRParsingError('No content in OpenAI response');
      }

      // Parse JSON from response (may be wrapped in markdown code blocks)
      let jsonContent = content.trim();
      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      } else {
        // Try to extract JSON object directly
        const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonContent = jsonObjectMatch[0];
        }
      }

      let result: OCRResult;
      try {
        result = JSON.parse(jsonContent) as OCRResult;
      } catch (parseError) {
        throw new OCRParsingError(
          `Failed to parse JSON from OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          content
        );
      }

      // Validate result
      if (typeof result.reading !== 'number' || result.reading < 0) {
        throw new OCRValidationError(
          `Invalid reading value: expected positive number, got ${result.reading}`,
          result.reading
        );
      }

      if (
        typeof result.confidence !== 'number' ||
        result.confidence < 0 ||
        result.confidence > 100
      ) {
        throw new OCRValidationError(
          `Invalid confidence value: expected number between 0-100, got ${result.confidence}`,
          result.confidence
        );
      }

      // Validate reading is reasonable for kWh (0 to 10 million)
      if (result.reading > 10000000) {
        throw new OCRValidationError(
          `Reading value too high: expected value <= 10,000,000 kWh, got ${result.reading}`,
          result.reading
        );
      }

      return {
        reading: Number(result.reading.toFixed(3)), // Round to 3 decimal places
        confidence: Math.round(result.confidence),
        rawText: result.rawText,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed to extract meter reading after ${MAX_RETRIES} attempts: ${lastError.message}`
        );
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError || new Error('Unknown error during OCR extraction');
}

/**
 * Extracts complete bill information from an electricity bill PDF/image using OpenAI Vision
 * Designed for Pluz Energía Perú bills but should work with other formats
 * @param fileUrl - URL of the bill PDF/image (Cloudinary URL)
 * @returns Bill OCR result with ElectricityBill and ServiceCharges data
 * @throws Error if extraction fails after retries
 */
export async function extractBillInformation(fileUrl: string): Promise<BillOCRResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const prompt = `You are an expert at reading electricity bills from Peru (specifically Pluz Energía Perú format). Analyze this bill image/PDF and extract all the information needed.

Extract the following information:

**ElectricityBill:**
- periodStart: Start date of the billing period (format: YYYY-MM-DD)
- periodEnd: End date of the billing period (format: YYYY-MM-DD)
- totalKWh: Total consumption in kWh for the period
- totalCost: Total amount to pay (TOTAL A PAGAR or TOTAL Mes Actual)

**ServiceCharges:**
- maintenanceAndReplacement: "Reposic. y Mant. de Conex" or "Cargo por Reposición y Mantenimiento de la Conexión" (default: 0 if not found)
- fixedCharge: "Cargo Fijo" (default: 0 if not found)
- compensatoryInterest: "Interés Compensatorio" (default: 0 if not found)
- publicLighting: "Alumbrado Público" (default: 0 if not found)
- lawContribution: "Aporte Ley N° 28749" (default: 0 if not found)
- lateFee: "Recargo por Mora" (default: 0 if not found)
- previousMonthRounding: "Redondeo Mes Anterior" (can be negative, default: 0 if not found)
- currentMonthRounding: "Redondeo Mes Actual" (can be negative, default: 0 if not found)

Important notes:
- Dates should be in format YYYY-MM-DD. If you see dates like "05/09/2025" or "06/10/2025", convert them properly.
- All monetary values should be numbers (remove currency symbols like S/).
- If a field is not found, use 0 as default (except for dates which are required).
- Rounding values can be negative.
- The totalCost should be the final amount to pay (usually includes IGV).

Respond ONLY with a JSON object in this exact format:
{
  "electricityBill": {
    "periodStart": "YYYY-MM-DD",
    "periodEnd": "YYYY-MM-DD",
    "totalKWh": <number>,
    "totalCost": <number>
  },
  "serviceCharges": {
    "maintenanceAndReplacement": <number>,
    "fixedCharge": <number>,
    "compensatoryInterest": <number>,
    "publicLighting": <number>,
    "lawContribution": <number>,
    "lateFee": <number>,
    "previousMonthRounding": <number>,
    "currentMonthRounding": <number>
  },
  "confidence": <number 0-100>,
  "rawText": "<summary of what you see in the bill>"
}

If you cannot clearly read the bill, set confidence to a low value (below 50) and still provide your best guess for all fields.`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: fileUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000, // More tokens needed for structured bill data
          temperature: 0.1, // Low temperature for more consistent results
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new OCRApiError(
          `OpenAI API error: ${response.status} - ${errorText}`,
          response.status
        );
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new OCRParsingError('No content in OpenAI response');
      }

      // Parse JSON from response (may be wrapped in markdown code blocks)
      let jsonContent = content.trim();
      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      } else {
        // Try to extract JSON object directly
        const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonContent = jsonObjectMatch[0];
        }
      }

      let result: BillOCRResult;
      try {
        result = JSON.parse(jsonContent) as BillOCRResult;
      } catch (parseError) {
        throw new OCRParsingError(
          `Failed to parse JSON from OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          content
        );
      }

      // Validate electricityBill
      if (!result.electricityBill) {
        throw new OCRValidationError('Missing electricityBill in OCR result');
      }

      const { periodStart, periodEnd, totalKWh, totalCost } = result.electricityBill;

      // Validate dates
      if (!periodStart || !periodEnd) {
        throw new OCRValidationError('Missing periodStart or periodEnd in electricityBill');
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(periodStart) || !dateRegex.test(periodEnd)) {
        throw new OCRValidationError(
          `Invalid date format: expected YYYY-MM-DD, got periodStart=${periodStart}, periodEnd=${periodEnd}`
        );
      }

      // Validate dates are valid
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new OCRValidationError(
          `Invalid dates: periodStart=${periodStart}, periodEnd=${periodEnd}`
        );
      }

      if (startDate >= endDate) {
        throw new OCRValidationError(
          `periodStart must be before periodEnd: ${periodStart} >= ${periodEnd}`
        );
      }

      // Validate totalKWh
      if (typeof totalKWh !== 'number' || totalKWh <= 0) {
        throw new OCRValidationError(
          `Invalid totalKWh: expected positive number, got ${totalKWh}`,
          totalKWh
        );
      }

      // Validate totalCost
      if (typeof totalCost !== 'number' || totalCost <= 0) {
        throw new OCRValidationError(
          `Invalid totalCost: expected positive number, got ${totalCost}`,
          totalCost
        );
      }

      // Validate serviceCharges
      if (!result.serviceCharges) {
        throw new OCRValidationError('Missing serviceCharges in OCR result');
      }

      const { serviceCharges } = result;
      const serviceChargeFields = [
        'maintenanceAndReplacement',
        'fixedCharge',
        'compensatoryInterest',
        'publicLighting',
        'lawContribution',
        'lateFee',
        'previousMonthRounding',
        'currentMonthRounding',
      ] as const;

      for (const field of serviceChargeFields) {
        if (typeof serviceCharges[field] !== 'number') {
          throw new OCRValidationError(
            `Invalid ${field}: expected number, got ${serviceCharges[field]}`,
            serviceCharges[field]
          );
        }
        // Most fields should be non-negative, except rounding which can be negative
        if (
          field !== 'previousMonthRounding' &&
          field !== 'currentMonthRounding' &&
          serviceCharges[field] < 0
        ) {
          throw new OCRValidationError(
            `Invalid ${field}: expected non-negative number, got ${serviceCharges[field]}`,
            serviceCharges[field]
          );
        }
      }

      // Validate confidence
      if (
        typeof result.confidence !== 'number' ||
        result.confidence < 0 ||
        result.confidence > 100
      ) {
        throw new OCRValidationError(
          `Invalid confidence: expected number between 0-100, got ${result.confidence}`,
          result.confidence
        );
      }

      // Validate totalKWh is reasonable (0 to 10 million)
      if (totalKWh > 10000000) {
        throw new OCRValidationError(
          `totalKWh too high: expected value <= 10,000,000 kWh, got ${totalKWh}`,
          totalKWh
        );
      }

      return {
        electricityBill: {
          periodStart,
          periodEnd,
          totalKWh: Number(totalKWh.toFixed(3)),
          totalCost: Number(totalCost.toFixed(2)),
        },
        serviceCharges: {
          maintenanceAndReplacement: Number(serviceCharges.maintenanceAndReplacement.toFixed(2)),
          fixedCharge: Number(serviceCharges.fixedCharge.toFixed(2)),
          compensatoryInterest: Number(serviceCharges.compensatoryInterest.toFixed(2)),
          publicLighting: Number(serviceCharges.publicLighting.toFixed(2)),
          lawContribution: Number(serviceCharges.lawContribution.toFixed(2)),
          lateFee: Number(serviceCharges.lateFee.toFixed(2)),
          previousMonthRounding: Number(serviceCharges.previousMonthRounding.toFixed(2)),
          currentMonthRounding: Number(serviceCharges.currentMonthRounding.toFixed(2)),
        },
        confidence: Math.round(result.confidence),
        rawText: result.rawText,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed to extract bill information after ${MAX_RETRIES} attempts: ${lastError.message}`
        );
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError || new Error('Unknown error during bill OCR extraction');
}
