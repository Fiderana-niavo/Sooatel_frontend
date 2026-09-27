import { useState } from "react";
import type { PaymentLineDto } from "../types/supplier-payment.type";

interface PaymentMethodRef {
  value: string;
  label: string;
}

interface UsePaymentLinesProps {
  totalAmount: number;
  paymentMethods: PaymentMethodRef[];
}

export function usePaymentLines({ totalAmount, paymentMethods }: UsePaymentLinesProps) {
  const [lines, setLines] = useState<PaymentLineDto[]>([]);

  const totalCovered = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const remaining = totalAmount - totalCovered;

  const addLine = () => {
    const usedMethodIds = new Set(lines.map((l) => l.idPaymentMethod));
    const nextMethod = paymentMethods.find((pm) => !usedMethodIds.has(pm.value));
    const amountForLine = Math.max(0, remaining);
    setLines((prev) => [
      ...prev,
      { idPaymentMethod: nextMethod?.value ?? "", amount: amountForLine },
    ]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, patch: Partial<PaymentLineDto>) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const autoFill = () => {
    if (paymentMethods.length === 0 || totalAmount <= 0) return;
    setLines([{ idPaymentMethod: paymentMethods[0].value, amount: totalAmount }]);
  };

  const reset = (initial?: PaymentLineDto[]) => {
    setLines(initial ?? []);
  };

  return { lines, setLines, totalCovered, remaining, addLine, removeLine, updateLine, autoFill, reset };
}
