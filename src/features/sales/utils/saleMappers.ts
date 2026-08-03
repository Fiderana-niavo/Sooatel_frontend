import type { SaleRecord, SalePayload } from "../types";

export const mapSaleRecordToFormData = (
  saleToEdit: SaleRecord,
  connectedUserId: string
): SalePayload => {
  return {
    saleDate: saleToEdit.saleDate
      ? new Date(saleToEdit.saleDate).toISOString().slice(0, 16)
      : new Date().toISOString().split("T")[0],
    idSaler: saleToEdit.saler?.idEmployee || connectedUserId || "",
    invoiceNumber: saleToEdit.invoice?.invoiceNumber || "",
    tableNumber: saleToEdit.tableNumber ?? (saleToEdit as any).table_number ?? undefined,
    chargeToRoom: saleToEdit.chargeToRoom || false,
    idRoom: saleToEdit.idRoom || "",
    items: saleToEdit.saleItems?.map(item => ({
      idSaleItem: item.idSaleItem,
      idMenu: item.idMenu,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice)
    })) || [],
    comment: saleToEdit.comment || "",
    deliveryDate: saleToEdit.deliveryDate ? new Date(saleToEdit.deliveryDate).toISOString().slice(0, 16) : "",
    payment: undefined
  };
};

export const calculateAlreadyPaid = (saleToEdit?: SaleRecord | null): number => {
  if (!saleToEdit || !saleToEdit.invoice || !saleToEdit.invoice.payments) return 0;
  return saleToEdit.invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
};

export const calcTotal = (sale: SaleRecord) =>
  sale.saleItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.menu?.salePrice ?? item.unitPrice),
    0
  );
