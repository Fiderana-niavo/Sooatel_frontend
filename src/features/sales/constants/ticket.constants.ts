import ticketInfo from "./ticket-info.json";

export interface CompanyConfig {
  name: string;
  subtitle: string;
  address: string;
  city: string;
  phone: string;
  mail?: string;
}

export interface TicketTextConfig {
  receiptTitle: string;
  legalText: string;
  thankYou: string;
}

export interface EstablishmentConfig extends CompanyConfig, TicketTextConfig {}

export const TICKET_TEXTS: TicketTextConfig = ticketInfo as TicketTextConfig;
