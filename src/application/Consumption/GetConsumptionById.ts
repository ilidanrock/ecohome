import { IConsumptionRepository } from '@/src/domain/Consumption/IConsumptionRepository';
import { Consumption } from '@/src/domain/Consumption/Consumption';

export class GetConsumptionById {
  constructor(private consumptionRepository: IConsumptionRepository) {}

  /**
   * Gets a consumption record by ID
   * @param consumptionId - The consumption ID
   * @returns The consumption entity or null if not found
   */
  async execute(consumptionId: string): Promise<Consumption | null> {
    return await this.consumptionRepository.findById(consumptionId);
  }
}
