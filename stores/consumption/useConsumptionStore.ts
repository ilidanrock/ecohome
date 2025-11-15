/**
 * @deprecated This store should be migrated to TanStack Query.
 *
 * According to project rules, server data (like consumption data) should use TanStack Query
 * instead of Zustand. Zustand should only be used for client-side UI state.
 *
 * Migration plan:
 * 1. Create `lib/queries/consumption.ts` with `useConsumptionQuery` hook
 * 2. Create API route `app/api/consumption/route.ts`
 * 3. Replace `useConsumptionStore` usage with `useConsumptionQuery` in components
 * 4. Remove this store after migration is complete
 *
 * See: `.cursor/state-management-guide.md` for migration examples
 */
import { create } from 'zustand';
import type { QuickStat, ConsumptionData } from '../types';

interface ConsumptionState {
  quickStats: QuickStat[];
  consumptionData: ConsumptionData | null;
  isLoading: boolean;
  lastFetched: Date | null;
}

interface ConsumptionActions {
  setQuickStats: (stats: QuickStat[]) => void;
  updateQuickStat: (type: 'energy' | 'water', stat: Partial<QuickStat>) => void;
  setConsumptionData: (data: ConsumptionData) => void;
  setLoading: (loading: boolean) => void;
  fetchConsumptionData: () => Promise<void>;
  reset: () => void;
}

type ConsumptionStore = ConsumptionState & ConsumptionActions;

const initialState: ConsumptionState = {
  quickStats: [],
  consumptionData: null,
  isLoading: false,
  lastFetched: null,
};

export const useConsumptionStore = create<ConsumptionStore>((set, get) => ({
  ...initialState,

  setQuickStats: (stats) => {
    set({ quickStats: stats });
  },

  updateQuickStat: (type, stat) => {
    set((state) => ({
      quickStats: state.quickStats.map((s) => (s.type === type ? { ...s, ...stat } : s)),
    }));
  },

  setConsumptionData: (data) => {
    set({
      consumptionData: data,
      lastFetched: new Date(),
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  fetchConsumptionData: async () => {
    const { isLoading, lastFetched } = get();

    // Prevent multiple simultaneous fetches
    if (isLoading) return;

    // Optional: Add cache logic (e.g., don't fetch if data is less than 5 minutes old)
    if (lastFetched) {
      const now = new Date();
      const diff = now.getTime() - lastFetched.getTime();
      const minutes = diff / (1000 * 60);
      if (minutes < 5) return; // Cache for 5 minutes
    }

    set({ isLoading: true });

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/consumption');
      // const data = await response.json();

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: ConsumptionData = {
        energy: {
          value: 245,
          unit: 'kWh',
          trend: 'down',
        },
        water: {
          value: 1200,
          unit: 'L',
          trend: 'up',
        },
        lastUpdated: new Date(),
      };

      const mockQuickStats: QuickStat[] = [
        {
          type: 'energy',
          value: '245',
          unit: 'kWh',
          trend: 'down',
        },
        {
          type: 'water',
          value: '1.2k',
          unit: 'L',
          trend: 'up',
        },
      ];

      set({
        consumptionData: mockData,
        quickStats: mockQuickStats,
        isLoading: false,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error('Error fetching consumption data:', error);
      set({ isLoading: false });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
