export interface Event {
  idEvent: string;
  eventName: string;
  startDate: string;
  endDate?: string;
}

export interface CreateEventDto {
  eventName: string;
  startDate: string;
  endDate?: string;
}
