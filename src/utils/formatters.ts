export function formatCurrency(
  amount: number | string | null | undefined,
): string {
  if (amount === null || amount === undefined || amount === "") return "0 Ar";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(num)) return "0 Ar";

  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(num))} Ar`;
}

export function formatAmount(
  amount: number | string | null | undefined,
): string {
  if (amount === null || amount === undefined || amount === "") return "0";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(num)) return "0";

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(num));
}
