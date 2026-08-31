import { useState, useEffect } from "react";
import {
  type DeliveryDestination,
  type AllocationDto,
} from "../types/supplier-payment.type";

interface UsePaymentAllocationsProps {
  initialAllocation?: AllocationDto;
  amount: string | number;
  setAmount: (amount: string | number) => void;
  destinations: any;
}

export function usePaymentAllocations({
  initialAllocation,
  amount,
  setAmount,
  destinations,
}: UsePaymentAllocationsProps) {
  const [allocations, setAllocations] = useState<AllocationDto[]>(
    initialAllocation ? [initialAllocation] : []
  );

  // Adjust initial deposit if it exceeds what's available
    
  useEffect(() => {
    // No initial deposit adjustment needed anymore
  }, [destinations, amount, allocations, initialAllocation, setAmount]);

  // Adjust supplier credit dynamically when 'amount' changes
  useEffect(() => {
    setAllocations((prev) => {
      const creditIndex = prev.findIndex((a) => a.allocationType === "SUPPLIER_CREDIT");
      if (creditIndex === -1) return prev;

      const others = prev.filter((a) => a.allocationType !== "SUPPLIER_CREDIT");
      const sumOther = others.reduce((s, a) => s + (Number(a.amount) || 0), 0);
      const newCreditAmount = Math.max(0, Number(amount) - sumOther);

      if (newCreditAmount <= 0) return others; // Remove credit if 0
      if (prev[creditIndex].amount === newCreditAmount) return prev;

      const next = [...prev];
      next[creditIndex] = { ...next[creditIndex], amount: newCreditAmount };
      return next;
    });
  }, [amount]);

  const totalAllocated = allocations.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const remaining = Number(amount) - totalAllocated;

  const updateAllocationAmount = (index: number, value: number) => {
    setAllocations((prev) => {
      const next = prev.map((a, i) => (i === index ? { ...a, amount: value } : a));
      
      const creditIndex = next.findIndex((a) => a.allocationType === "SUPPLIER_CREDIT");
      if (creditIndex >= 0 && index !== creditIndex) {
        const others = next.filter((a) => a.allocationType !== "SUPPLIER_CREDIT");
        const sumOther = others.reduce((s, a) => s + (Number(a.amount) || 0), 0);
        const newCreditAmount = Math.max(0, Number(amount) - sumOther);
        
        if (newCreditAmount <= 0) return others; // Remove credit if 0
        
        next[creditIndex] = { ...next[creditIndex], amount: newCreditAmount };
      }
      
      return next;
    });
  };

  const removeAllocation = (index: number) => {
    setAllocations((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const creditIndex = next.findIndex((a) => a.allocationType === "SUPPLIER_CREDIT");
      if (creditIndex >= 0) {
        const others = next.filter((a) => a.allocationType !== "SUPPLIER_CREDIT");
        const sumOther = others.reduce((s, a) => s + (Number(a.amount) || 0), 0);
        const newCreditAmount = Math.max(0, Number(amount) - sumOther);
        if (newCreditAmount <= 0) return others;
        next[creditIndex] = { ...next[creditIndex], amount: newCreditAmount };
      }
      return next;
    });
  };

  const addDeliveryAllocation = (d: DeliveryDestination) => {
    if (allocations.find((a) => a.idDelivery === d.idDelivery)) return;
    
    setAllocations((prev) => {
      const available = Math.max(0, Number(amount) - prev.reduce((s, a) => s + (Number(a.amount) || 0), 0));
      const next = [
        ...prev,
        {
          allocationType: "DELIVERY" as const,
          idDelivery: d.idDelivery,
          amount: Math.min(d.balanceDue, available),
        },
      ];
      
      const creditIndex = next.findIndex((a) => a.allocationType === "SUPPLIER_CREDIT");
      if (creditIndex >= 0) {
        const others = next.filter((a) => a.allocationType !== "SUPPLIER_CREDIT");
        const sumOther = others.reduce((s, a) => s + (Number(a.amount) || 0), 0);
        const newCreditAmount = Math.max(0, Number(amount) - sumOther);
        if (newCreditAmount <= 0) return others;
        next[creditIndex] = { ...next[creditIndex], amount: newCreditAmount };
      }
      return next;
    });
  };



  const addCreditAllocation = () => {
    if (allocations.find((a) => a.allocationType === "SUPPLIER_CREDIT")) return;
    const rem = Number(amount) - allocations.reduce((s, a) => s + a.amount, 0);
    setAllocations((prev) => [
      ...prev,
      { allocationType: "SUPPLIER_CREDIT", amount: Math.max(0, rem) },
    ]);
  };

  const autoDispatch = () => {
    let availableAmount = Number(amount);
    if (availableAmount <= 0) return;

    const newAllocations: AllocationDto[] = [];
    
    // 1. Prioritize deliveries
    if (destinations?.deliveries) {
      for (const d of destinations.deliveries) {
        if (availableAmount <= 0) break;
        const allocAmount = Math.min(d.balanceDue, availableAmount);
        if (allocAmount > 0) {
          newAllocations.push({
            allocationType: "DELIVERY",
            idDelivery: d.idDelivery,
            amount: allocAmount,
          });
          availableAmount -= allocAmount;
        }
      }
    }
    

    // 3. Supplier credit if remaining
    if (availableAmount > 0) {
       newAllocations.push({
         allocationType: "SUPPLIER_CREDIT",
         amount: availableAmount,
       });
    }

    setAllocations(newAllocations);
  };

  return {
    allocations,
    setAllocations,
    totalAllocated,
    remaining,
    updateAllocationAmount,
    removeAllocation,
    addDeliveryAllocation,
    addCreditAllocation,
    autoDispatch,
  };
}
