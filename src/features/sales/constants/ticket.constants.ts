export interface EstablishmentConfig {
  name: string;
  subtitle: string;
  address: string;
  city: string;
  phone: string;
  receiptTitle: string;
  legalText: string;
  thankYou: string;
}

export const ESTABLISHMENT: EstablishmentConfig = {
  name: "UTOPIA",
  subtitle: "By Sooatel",
  address: "Ankasina",
  city: "Antananarivo",
  phone: "038 96 373 43",
  receiptTitle: "FACTURE",
  legalText: "Somme arrêtée à la présente liste de ............................................",
  thankYou: "Merci pour votre visite !",
};
