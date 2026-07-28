import type { SalePayload } from "../types";

export const validateSaleForm = (
  formData: SalePayload,
  locationType: "restaurant" | "room"
): string | null => {
  if (!formData.invoiceNumber) {
    return "Le numéro de facture est obligatoire.";
  }
  if (formData.items.length === 0) {
    return "Au moins un plat est requis.";
  }
  if (formData.items.some(i => !i.idMenu || i.quantity < 1 || i.unitPrice < 0)) {
    return "Vous devez sélectionner au moins un plat, avec une quantité d'au moins 1 et un prix unitaire positif.";
  }

  const selectedMenus = formData.items.map(i => i.idMenu).filter(Boolean);
  const uniqueMenus = new Set(selectedMenus);
  if (selectedMenus.length !== uniqueMenus.size) {
    return "Vous ne pouvez pas sélectionner le même plat plusieurs fois. Veuillez ajuster la quantité.";
  }

  if (!formData.idSaler) {
    return "Veuillez sélectionner un vendeur.";
  }

  if (formData.payment) {
    if (!formData.payment.idPaymentMethod || formData.payment.amount === undefined) {
      return "Les informations de paiement sont incomplètes.";
    }
    if (formData.payment.amount < 0) {
      return "Le montant du paiement ne peut pas être négatif.";
    }
  }
  if (formData.chargeToRoom && !formData.idRoom) {
    return "Veuillez sélectionner la chambre à imputer.";
  }
  if (locationType === "restaurant" && !formData.tableNumber) {
    return "Veuillez indiquer le numéro de table pour une consommation au restaurant.";
  }
  if (locationType === "room" && !formData.idRoom) {
    return "Veuillez sélectionner la chambre pour le Room Service.";
  }

  return null;
};
