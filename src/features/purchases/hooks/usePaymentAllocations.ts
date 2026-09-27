import { useState, useEffect } from "react";
import {
  type DeliveryDestination,
  type AllocationDto,
} from "../types/supplier-payment.type";

interface UsePaymentAllocationsProps {
  initialAllocation?: AllocationDto;
  amount: string | number;
  destinations: any;
}

function buildAllocations(
  amount: number,
  deliveries: DeliveryDestination[],
  initialAllocation?: AllocationDto
): AllocationDto[] {
  if (amount <= 0) return [];

  let available = amount;
  const result: AllocationDto[] = [];

  // If we have a principal delivery, fill it first
  if (initialAllocation?.idDelivery) {
    const principal = deliveries.find((d) => d.idDelivery === initialAllocation.idDelivery);
    if (principal) {
      const alloc = Math.min(principal.balanceDue, available);
      if (alloc > 0) {
        result.push({ allocationType: "DELIVERY", idDelivery: principal.idDelivery, amount: alloc });
        available -= alloc;
      }
    }
  }

  // Fill other deliveries
  for (const d of deliveries) {
    if (available <= 0) break;
    if (result.some((a) => a.idDelivery === d.idDelivery)) continue;
    const alloc = Math.min(d.balanceDue, available);
    if (alloc > 0) {
      result.push({ allocationType: "DELIVERY", idDelivery: d.idDelivery, amount: alloc });
      available -= alloc;
    }
  }

  // Rest goes to credit
  if (available > 0.009) {
    result.push({ allocationType: "SUPPLIER_CREDIT", amount: Math.round(available * 100) / 100 });
  }

  return result;
}

export function usePaymentAllocations({
  initialAllocation,
  amount,
  destinations,
}: UsePaymentAllocationsProps) {
  const [allocations, setAllocations] = useState<AllocationDto[]>(
    initialAllocation ? [initialAllocation] : []
  );

  // Auto-dispatch whenever amount or deliveries change
  useEffect(() => {
    const numAmount = Number(amount);
    const deliveries: DeliveryDestination[] = destinations?.deliveries ?? [];
    const newAllocations = buildAllocations(numAmount, deliveries, initialAllocation);

    setAllocations((prev) => {
      const isIdentical =
        prev.length === newAllocations.length &&
        prev.every(
          (p, i) =>
            p.allocationType === newAllocations[i].allocationType &&
            p.idDelivery === newAllocations[i].idDelivery &&
            p.amount === newAllocations[i].amount
        );
      return isIdentical ? prev : newAllocations;
    });
  }, [amount, destinations]);

  const totalAllocated = allocations.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const remaining = Number(amount) - totalAllocated;

  const removeAllocation = (index: number) => {
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  };

  const addDeliveryAllocation = (d: DeliveryDestination) => {
    if (allocations.find((a) => a.idDelivery === d.idDelivery)) return;
    const available = Math.max(0, Number(amount) - totalAllocated);
    setAllocations((prev) => [
      ...prev,
      {
        allocationType: "DELIVERY" as const,
        idDelivery: d.idDelivery,
        amount: Math.min(d.balanceDue, available),
      },
    ]);
  };

  const addCreditAllocation = () => {
    if (allocations.find((a) => a.allocationType === "SUPPLIER_CREDIT")) return;
    const rem = Number(amount) - totalAllocated;
    if (rem <= 0) return;
    setAllocations((prev) => [...prev, { allocationType: "SUPPLIER_CREDIT", amount: rem }]);
  };

  const updateAllocationAmount = (index: number, value: number) => {
    setAllocations((prev) => prev.map((a, i) => (i === index ? { ...a, amount: value } : a)));
  };

  const autoDispatch = () => {
    const deliveries: DeliveryDestination[] = destinations?.deliveries ?? [];
    setAllocations(buildAllocations(Number(amount), deliveries, initialAllocation));
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
