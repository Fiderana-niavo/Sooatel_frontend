export interface RoomType {
  idRoomType: string;
  label: string;
  description?: string;
}

export interface CreateRoomTypeDto {
  label: string;
  description?: string;
}
