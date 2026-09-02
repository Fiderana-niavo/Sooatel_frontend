import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";
import type { Item } from "../../types/item.type";
import type { CreateItemUnitDto } from "../../types/item-unit.type";
import type { UnitOfMeasure } from "../../../unit-of-measures/types";
import { itemUnitService } from "../../services/item-unit.service";

interface ItemUnitFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  units: UnitOfMeasure[];
  onAdd: (data: CreateItemUnitDto) => void;
}

export function ItemUnitFormDialog({ isOpen, onClose, items, units, onAdd }: ItemUnitFormDialogProps) {
  const [idItem, setIdItem] = useState("");
  const [idUnit, setIdUnit] = useState("");
  const [ratio, setRatio] = useState("");

  const handleSubmit = () => {
    if (!idItem || !idUnit || !ratio) return;
    onAdd({
      idItem,
      alternativeUnitId: idUnit,
      toStockRatio: Number(ratio),
    });
    setIdItem("");
    setIdUnit("");
    setRatio("");
  };

  const { data: fetchedItemUnits = [] } = useQuery({
    queryKey: ["itemUnits", idItem],
    queryFn: () => itemUnitService.getAll({ idItem }),
    enabled: !!idItem,
  });

  const selectedItem = items.find((i) => i.idItem === idItem);
  const usedUnitIds = fetchedItemUnits.map((iu) => iu.alternativeUnitId);
  
  const defaultUnitId = selectedItem?.idUnit;
  
  const availableUnits = units.filter(
    (u) => u.idUnit !== defaultUnitId && !usedUnitIds.includes(u.idUnit)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Ajouter une Unité Alternative</DialogTitle>
          <DialogDescription>
            Définissez le ratio de conversion entre une unité d'achat et l'unité de stock.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Article</label>
            <SearchableSelect
              options={items.map((i) => ({ value: i.idItem, label: i.label + (i.unit?.symbol ? ` (${i.unit.symbol})` : "") }))}
              value={idItem}
              onChange={(val) => setIdItem(val.toString())}
              placeholder="Sélectionner un article..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Unité Alternative</label>
            <SearchableSelect
              options={availableUnits.map((u) => ({ value: u.idUnit, label: `${u.label} (${u.symbol})` }))}
              value={idUnit}
              onChange={(val) => setIdUnit(val.toString())}
              placeholder="Sélectionner une unité..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ratio (Vers l'unité de stock principale)</label>
            <Input
              type="number"
              placeholder="Ex: 1000 pour 1kg -> 1000g"
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!idItem || !idUnit || !ratio}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
