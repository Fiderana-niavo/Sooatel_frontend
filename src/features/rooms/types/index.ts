export interface Room {
  idRoom: string;
  roomNumber: string;
  idRoomType: string;
  description?: string;
}

export interface CreateRoomDto {
  roomNumber: string;
  idRoomType: string;
  description?: string;
}
