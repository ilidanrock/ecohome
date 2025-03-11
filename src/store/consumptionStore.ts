import { create } from "zustand";


type ConsumptionState = {
  waterConsumption: number;
  electricityConsumption: number;
  totalCost: number;
  setConsumption: (water: number, electricity: number) => void;
};

export const useConsumptionStore = create<ConsumptionState>((set) => ({
  waterConsumption: 0,
  electricityConsumption: 0,
  totalCost: 0,
  setConsumption: (water : number, electricity : number) =>
    set({
      waterConsumption: water,
      electricityConsumption: electricity,
      totalCost: water + electricity,
    }),
}));
