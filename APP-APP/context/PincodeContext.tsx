import { createContext, useContext, useMemo, useState } from 'react';

export type DeliverySlot = {
  id: string;
  label: string; // e.g., "1 PM – 3 PM"
};

export type PincodeContextState = {
  pincode: string | null;
  slots: DeliverySlot[];
  selectedSlot: DeliverySlot | null;
  setPincode: (value: string) => void;
  setSelectedSlot: (slot: DeliverySlot | null) => void;
  refreshSlots: (pin: string) => void;
};

const PincodeContext = createContext<PincodeContextState | undefined>(undefined);

export function PincodeProvider({ children }: { children: React.ReactNode }) {
  const [pincode, setPincode] = useState<string | null>(null);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);

  const refreshSlots = (pin: string) => {
    // Mock: pincode-based slots (would come from API in real app)
    const base = [
      { id: 'slot1', label: '9 AM – 11 AM' },
      { id: 'slot2', label: '1 PM – 3 PM' },
      { id: 'slot3', label: '6 PM – 8 PM' },
    ];
    setSlots(base);
    setSelectedSlot(base[1]);
  };

  const value = useMemo(() => ({
    pincode,
    slots,
    selectedSlot,
    setPincode,
    setSelectedSlot,
    refreshSlots,
  }), [pincode, slots, selectedSlot]);

  return (
    <PincodeContext.Provider value={value}>{children}</PincodeContext.Provider>
  );
}

export function usePincode() {
  const ctx = useContext(PincodeContext);
  if (!ctx) throw new Error('usePincode must be used within PincodeProvider');
  return ctx;
}
