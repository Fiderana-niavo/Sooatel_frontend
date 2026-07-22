import { useState } from "react";

import { RoomsModal, RoomService, type Room } from "@/features/rooms";
import { RoomTypesModal, RoomTypeService, type RoomType } from "@/features/room-types";
import { EventsModal, EventService, type Event } from "@/features/events";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Snackbar, type SnackbarType } from "@/components/ui/Snackbar/snackbar";
import { HOTEL_MODULES } from "@/constants/app.constants";

import { useCrud } from "@/hooks/useCrud";

export function HotelConfigPage() {
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackbarType; isOpen: boolean }>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const rooms = useCrud<Room>(RoomService.getAll, RoomService.create, RoomService.update, RoomService.delete, "idRoom" as keyof Room);
  const roomTypes = useCrud<RoomType>(RoomTypeService.getAll, RoomTypeService.create, RoomTypeService.update, RoomTypeService.delete, "idRoomType" as keyof RoomType);
  const events = useCrud<Event>(EventService.getAll, EventService.create, EventService.update, EventService.delete, "idEvent" as keyof Event);

  const modalActions: Record<string, () => void> = {
    rooms: () => rooms.setIsOpen(true),
    roomTypes: () => roomTypes.setIsOpen(true),
    events: () => events.setIsOpen(true),
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {HOTEL_MODULES.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h2 className="text-xl font-bold text-secondary">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={modalActions[card.id]}
                  className="bg-card border border-border/50 rounded-[2rem] p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className={`p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-all duration-300 ${card.colorClass} ${card.hoverClass}`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm">{card.description}</p>
                </div>
              );
            })}
          </div>
          {idx < HOTEL_MODULES.length - 1 && <div className="h-px w-full bg-border/50 my-8"></div>}
        </div>
      ))}

      <RoomsModal
        isOpen={rooms.isOpen}
        onClose={() => rooms.setIsOpen(false)}
        data={rooms.data}
        roomTypes={roomTypes.data}
        onAdd={(data) => rooms.handleAdd(data, showSnackbar)}
        onEdit={(id, data) => rooms.handleEdit(id, data, showSnackbar)}
        onDelete={rooms.promptDelete}
      />
      <ConfirmDialog
        open={rooms.confirmOpen}
        onOpenChange={rooms.setConfirmOpen}
        title="Confirmation"
        description="Voulez-vous vraiment supprimer cette chambre ?"
        onConfirm={() => rooms.executeDelete(showSnackbar)}
        loading={rooms.isDeleting}
      />

      <RoomTypesModal
        isOpen={roomTypes.isOpen}
        onClose={() => roomTypes.setIsOpen(false)}
        data={roomTypes.data}
        onAdd={(data) => roomTypes.handleAdd(data, showSnackbar)}
        onEdit={(id, data) => roomTypes.handleEdit(id, data, showSnackbar)}
        onDelete={roomTypes.promptDelete}
      />
      <ConfirmDialog
        open={roomTypes.confirmOpen}
        onOpenChange={roomTypes.setConfirmOpen}
        title="Confirmation"
        description="Voulez-vous vraiment supprimer ce type de chambre ?"
        onConfirm={() => roomTypes.executeDelete(showSnackbar)}
        loading={roomTypes.isDeleting}
      />

      <EventsModal
        isOpen={events.isOpen}
        onClose={() => events.setIsOpen(false)}
        data={events.data}
        onAdd={(data) => events.handleAdd(data, showSnackbar)}
        onEdit={(id, data) => events.handleEdit(id, data, showSnackbar)}
        onDelete={events.promptDelete}
      />
      <ConfirmDialog
        open={events.confirmOpen}
        onOpenChange={events.setConfirmOpen}
        title="Confirmation"
        description="Voulez-vous vraiment supprimer cet évènement ?"
        onConfirm={() => events.executeDelete(showSnackbar)}
        loading={events.isDeleting}
      />

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}
    </div>
  );
}
