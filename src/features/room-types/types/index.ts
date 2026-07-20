export interface RoomType {
  idRoomType: string;
  label: string; Description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomTypeDto {
  label: string; Description?: string;
}
