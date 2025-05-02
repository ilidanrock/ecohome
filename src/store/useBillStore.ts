import { create } from 'zustand';

type BillState = {
  selectedBillId: string | null;
  setSelectedBillId: (id: string | null) => void;
};

export const useBillStore = create<BillState>((set) => ({
  selectedBillId: null,
  setSelectedBillId: (id) => set({ selectedBillId: id }),
}));