import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
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
        className="!flex !flex-col !gap-0 !p-0 w-[96vw] max-w-[96vw] h-[94vh] max-h-[94vh] rounded-[1.5rem] overflow-hidden bg-card border shadow-2xl"
      >
        <div className="shrink-0 bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 border-b">
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
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 md:p-8 space-y-6">
          <ItemUnitList
            data={data}
            items={items}
            units={units}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
        <DialogFooter className="shrink-0 p-4 bg-muted/10 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto rounded-xl"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
