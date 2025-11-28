import { IConsumptionRepository } from '@/src/domain/Consumption/IConsumptionRepository';
import { extractMeterReading } from '@/lib/ocr-service';
import { Consumption } from '@/src/domain/Consumption/Consumption';

export class ExtractMeterReading {
  constructor(private consumptionRepository: IConsumptionRepository) {}

  /**
   * Extracts meter reading from an image using OCR and updates the consumption record
   * @param consumptionId - The consumption ID to update
   * @param imageUrl - URL of the meter image (Cloudinary URL)
   * @returns Updated consumption entity with OCR data
   * @throws Error if consumption not found or OCR extraction fails
   */
  async execute(consumptionId: string, imageUrl: string): Promise<Consumption> {
    // Find the consumption record
    const consumption = await this.consumptionRepository.findById(consumptionId);

    if (!consumption) {
      throw new Error(`Consumption with ID ${consumptionId} not found`);
    }

    // Extract reading using OCR
    const ocrResult = await extractMeterReading(imageUrl);

    // Create updated consumption entity with OCR data
    const updatedConsumption = new Consumption(
      consumption.rentalId,
      consumption.month,
      consumption.year,
      ocrResult.reading, // Update energy reading with OCR result
      imageUrl, // Update meter image URL
      new Date(), // Set extractedAt to now
      consumption.createdAt,
      new Date(), // Update updatedAt
      consumption.id,
      consumption.previousReading,
      true, // ocrExtracted = true
      ocrResult.confidence, // ocrConfidence
      ocrResult.rawText // ocrRawText
    );

    // Update in repository
    return await this.consumptionRepository.update(updatedConsumption);
  }
}
