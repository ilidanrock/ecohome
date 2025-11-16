import { IConsumptionRepository } from '@/src/domain/Consumption/IConsumptionRepository';
import type { ConsumptionData, QuickStat } from '@/types';

export class GetConsumptionData {
  constructor(private consumptionRepository: IConsumptionRepository) {}

  async execute(
    userId: string
  ): Promise<{ consumptionData: ConsumptionData; quickStats: QuickStat[] }> {
    const consumptions = await this.consumptionRepository.findByUserId(userId);

    // If no consumptions exist, return default/empty data
    if (consumptions.length === 0) {
      return {
        consumptionData: {
          energy: {
            value: 0,
            unit: 'kWh',
            trend: 'stable',
          },
          water: {
            value: 0,
            unit: 'L',
            trend: 'stable',
          },
          lastUpdated: new Date(),
        },
        quickStats: [],
      };
    }

    // Calculate energy consumption from the most recent readings
    const sortedConsumptions = consumptions.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

    const latestConsumption = sortedConsumptions[0];
    const previousConsumption = sortedConsumptions[1];

    // Calculate energy value and trend
    const energyValue = latestConsumption.getEnergyReading();
    let energyTrend: 'up' | 'down' | 'stable' = 'stable';
    if (previousConsumption) {
      const diff = energyValue - previousConsumption.getEnergyReading();
      if (diff > 0) energyTrend = 'up';
      else if (diff < 0) energyTrend = 'down';
    }

    // For water, we'll use a placeholder since it's not in the Consumption model
    // In a real implementation, you would have a separate WaterConsumption model
    // or extend the Consumption model to include water readings
    const waterValue = 0; // Placeholder - would need water consumption data
    const waterTrend: 'up' | 'down' | 'stable' = 'stable';

    const consumptionData: ConsumptionData = {
      energy: {
        value: energyValue,
        unit: 'kWh',
        trend: energyTrend,
      },
      water: {
        value: waterValue,
        unit: 'L',
        trend: waterTrend,
      },
      lastUpdated: latestConsumption.updatedAt,
    };

    // Generate quick stats
    const quickStats: QuickStat[] = [
      {
        type: 'energy',
        value: energyValue.toFixed(0),
        unit: 'kWh',
        trend: energyTrend,
      },
      // Water stat would be added here when water consumption data is available
      // {
      //   type: 'water',
      //   value: formatWaterValue(waterValue),
      //   unit: 'L',
      //   trend: waterTrend,
      // },
    ];

    return {
      consumptionData,
      quickStats,
    };
  }
}
