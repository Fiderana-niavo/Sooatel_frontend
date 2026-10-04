import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog/dialog";
import { ItemUnitList } from "./ItemUnitList";
import type { Item } from "../../types/item.type";
import type {
  ItemUnit,
  CreateItemUnitDto,
  UpdateItemUnitDto,
} from "../../types/item-unit.type";
import type { UnitOfMeasure } from "../../../unit-of-measures/types";

import { ArrowRightLeft } from "lucide-react";

interface ItemUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ItemUnit[];
  items: Item[];
  units: UnitOfMeasure[];
  onAdd: (data: CreateItemUnitDto) => void;
  onEdit: (id: string, data: UpdateItemUnitDto) => void;
  onDelete: (id: string) => void;
}

export function ItemUnitsModal({
  isOpen,
  onClose,
  data,
  items,
  units,
  onAdd,
  onEdit,
  onDelete,
}: ItemUnitsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-4xl rounded-[2rem] p-0 overflow-hidden bg-card border shadow-2xl"
      >
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                <ArrowRightLeft className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-secondary">
                  Unités Alternatives
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 text-sm">
                  Gérez les ratios de conversion pour les articles.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        <div
          className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar"
          style={{ maxHeight: "calc(90vh - 150px)" }}
        >
          <ItemUnitList
            data={data}
            items={items}
            units={units}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
