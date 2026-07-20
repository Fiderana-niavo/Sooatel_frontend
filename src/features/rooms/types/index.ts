export interface Room {
  idRoom: string;
  roomNumber: string; idRoomType: string; description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomDto {
  roomNumber: string; idRoomType: string; description?: string;
}
