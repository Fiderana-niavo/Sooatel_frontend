import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog/dialog";
import { ItemUnitList } from "./ItemUnitList";
import type { Item } from "../../types/item.type";
import type { ItemUnit, CreateItemUnitDto, UpdateItemUnitDto } from "../../types/item-unit.type";
import type { UnitOfMeasure } from "../../../unit-of-measures/types";

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

export function ItemUnitsModal({ isOpen, onClose, data, items, units, onAdd, onEdit, onDelete }: ItemUnitsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unités Alternatives</DialogTitle>
          <DialogDescription>
            Gérez les ratios de conversion pour les articles.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ItemUnitList data={data} items={items} units={units} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
