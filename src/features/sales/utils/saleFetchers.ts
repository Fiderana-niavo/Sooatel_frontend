import { SaleService } from "../services/sale.service";
import { RoomService } from "../../rooms/services";
import type { MenuItemRef, PaymentMethodRef } from "../types";
import type { SelectOptionDto } from "@/types/api.type";

export interface SalesDependencies {
  rooms: SelectOptionDto[];
  salers: SelectOptionDto[];
  menuItems: MenuItemRef[];
  paymentMethods: PaymentMethodRef[];
}

export const fetchSalesDependencies = async (): Promise<SalesDependencies> => {
  try {
    const [menusRes, roomsOptions, pmRes, salersRes] = await Promise.all([
      SaleService.getMenuItems().catch(() => ({ payload: [] })),
      RoomService.getSelectOptions().catch(() => []),
      SaleService.getPaymentMethods().catch(() => ({ payload: [] })),
      SaleService.getSalers().catch(() => ({ payload: [] }))
    ]);

    let salers: SelectOptionDto[] = [];
    if (salersRes.payload) {
      salers = salersRes.payload.map((s: { id?: string; value?: string; label: string }) => ({
        value: s.value || s.id || "",
        label: s.label
      }));
    }

    let menuItems: MenuItemRef[] = [];
    if (menusRes.payload) {
      menuItems = menusRes.payload.map((m: any) => ({
        idMenu: m.value,
        name: m.label || "Plat",
        salePrice: Number(m.salePrice)
      }));
    }

    let paymentMethods: PaymentMethodRef[] = [];
    if (pmRes.payload) {
      paymentMethods = pmRes.payload.map((pm: any) => ({
        idPaymentMethod: pm.value,
        methodName: pm.label
      }));
    }

    return {
      rooms: roomsOptions,
      salers,
      menuItems,
      paymentMethods
    };
  } catch (err) {
    console.error("Failed to fetch dependencies", err);
    return { rooms: [], salers: [], menuItems: [], paymentMethods: [] };
  }
};

export interface SalesListDependencies {
  paymentMethods: PaymentMethodRef[];
  menuOptions: { value: string; label: string }[];
}

export const fetchSalesListDependencies = async (): Promise<SalesListDependencies> => {
  try {
    const [pmRes, menuRes] = await Promise.all([
      SaleService.getPaymentMethods().catch(() => ({ payload: [] })),
      SaleService.getMenuItems().catch(() => ({ payload: [] }))
    ]);

    let paymentMethods: PaymentMethodRef[] = [];
    if (pmRes.payload) {
      paymentMethods = pmRes.payload.map((m: any) => ({
        idPaymentMethod: m.value,
        methodName: m.label
      }));
    }

    let menuOptions = [{ value: "", label: "Tous les produits" }];
    if (menuRes.payload) {
      menuOptions = [
        ...menuOptions,
        ...menuRes.payload.map((m: any) => ({
          value: m.value,
          label: m.label
        }))
      ];
    }

    return { paymentMethods, menuOptions };
  } catch (err) {
    console.error("Failed to fetch list dependencies", err);
    return { paymentMethods: [], menuOptions: [{ value: "", label: "Tous les produits" }] };
  }
};
