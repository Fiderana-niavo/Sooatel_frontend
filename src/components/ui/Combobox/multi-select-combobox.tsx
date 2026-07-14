import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/Badge/badge";
import { X } from "lucide-react";

interface MultiSelectComboboxProps<T> {
  options: T[];
  selectedItems: T[];
  onChange: (items: T[]) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  placeholder?: string;
  emptyMessage?: string;
}

export function MultiSelectCombobox<T>({
  options,
  selectedItems,
  onChange,
  getOptionLabel,
  getOptionValue,
  placeholder = "Sélectionner...",
  emptyMessage = "Aucun résultat.",
}: MultiSelectComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: T) => {
    const val = getOptionValue(option);
    if (!selectedItems.some((item) => getOptionValue(item) === val)) {
      onChange([...selectedItems, option]);
    }
    setSearchTerm("");
  };

  const handleRemove = (valueToRemove: string | number) => {
    onChange(selectedItems.filter((item) => getOptionValue(item) !== valueToRemove));
  };

  const filteredOptions = options.filter(
    (option) =>
      getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedItems.some((item) => getOptionValue(item) === getOptionValue(option))
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="min-h-10 border rounded-md p-2 flex flex-wrap gap-2 items-center bg-background cursor-text focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
        onClick={() => setIsOpen(true)}
      >
        {selectedItems.map((item) => {
          const val = getOptionValue(item);
          const label = getOptionLabel(item);
          return (
            <Badge key={val} variant="secondary" className="gap-1 px-2 py-1">
              {label}
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(val);
                }}
              >
                <X size={14} />
              </button>
            </Badge>
          );
        })}
        <input
          type="text"
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-1 placeholder:text-muted-foreground"
          placeholder={selectedItems.length === 0 ? placeholder : ""}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option) => {
            const val = getOptionValue(option);
            const label = getOptionLabel(option);
            return (
              <div
                key={val}
                className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                onClick={() => handleSelect(option)}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
      
      {isOpen && filteredOptions.length === 0 && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
