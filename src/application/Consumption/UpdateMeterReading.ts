import { IConsumptionRepository } from '@/src/domain/Consumption/IConsumptionRepository';
import { Consumption } from '@/src/domain/Consumption/Consumption';

export class UpdateMeterReading {
  constructor(private consumptionRepository: IConsumptionRepository) {}

  /**
   * Updates meter reading manually (when OCR has low confidence or admin wants to correct)
   * Clears OCR fields when manually edited
   * @param consumptionId - The consumption ID to update
   * @param energyReading - The new energy reading value
   * @param previousReading - Optional previous reading value
   * @returns Updated consumption entity
   * @throws Error if consumption not found or validation fails
   */
  async execute(
    consumptionId: string,
    energyReading: number,
    previousReading?: number | null
  ): Promise<Consumption> {
    // Find the consumption record
    const consumption = await this.consumptionRepository.findById(consumptionId);

    if (!consumption) {
      throw new Error(`Consumption with ID ${consumptionId} not found`);
    }

    // Validate energy reading is positive
    if (energyReading < 0) {
      throw new Error('Energy reading must be positive');
    }

    // Validate energy reading is reasonable (0 to 10 million kWh)
    if (energyReading > 10000000) {
      throw new Error('Energy reading value too high (max 10,000,000 kWh)');
    }

    // Validate previous reading if provided
    if (previousReading !== undefined && previousReading !== null) {
      if (previousReading < 0) {
        throw new Error('Previous reading must be non-negative');
      }

      // Validate that energy reading is greater than or equal to previous reading
      if (energyReading < previousReading) {
        throw new Error(
          `Energy reading (${energyReading}) cannot be less than previous reading (${previousReading})`
        );
      }

      // Warn if difference is very large (possible error)
      const difference = energyReading - previousReading;
      if (difference > 10000) {
        // More than 10,000 kWh difference - likely an error
        // We'll allow it but it's unusual
      }
    }

    // Create updated consumption entity
    // When manually edited, clear OCR fields (mark as not OCR extracted)
    const updatedConsumption = new Consumption(
      consumption.rentalId,
      consumption.month,
      consumption.year,
      energyReading,
      consumption.meterImageUrl, // Keep existing image URL
      null, // Clear extractedAt when manually edited
      consumption.createdAt,
      new Date(), // Update updatedAt
      consumption.id,
      previousReading ?? consumption.previousReading, // Use provided or keep existing
      false, // ocrExtracted = false (manually edited)
      null, // ocrConfidence = null (cleared)
      null // ocrRawText = null (cleared)
    );

    // Update in repository
    return await this.consumptionRepository.update(updatedConsumption);
  }
}
