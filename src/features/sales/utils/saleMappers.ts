import type { SaleRecord, SalePayload } from "../types";

export const mapSaleRecordToFormData = (
  saleToEdit: SaleRecord,
  connectedUserId: string
): SalePayload => {
  return {
    saleDate: saleToEdit.saleDate
      ? new Date(saleToEdit.saleDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    idSaler: saleToEdit.saler?.idEmployee || connectedUserId || "",
    invoiceNumber: saleToEdit.invoiceNumber || "",
    tableNumber: saleToEdit.tableNumber || undefined,
    chargeToRoom: saleToEdit.chargeToRoom || false,
    idRoom: saleToEdit.idRoom || "",
    items: saleToEdit.saleItems?.map(item => ({
      idSaleItem: item.idSaleItem,
      idMenu: item.idMenu,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice)
    })) || [],
    payment: undefined
  };
};

export const calculateAlreadyPaid = (saleToEdit?: SaleRecord | null): number => {
  if (!saleToEdit || !saleToEdit.payments) return 0;
  return saleToEdit.payments.reduce((s, p) => 
    p.type === "REFUND" ? s - Number(p.amount) : s + Number(p.amount)
  , 0);
};

export const calcTotal = (sale: SaleRecord) =>
  sale.saleItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.menu?.salePrice ?? item.unitPrice),
    0
  );
