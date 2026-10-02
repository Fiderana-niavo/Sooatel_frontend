import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/ui";

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onCreate?: (value: string) => void | Promise<void>;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  className,
  disabled = false,
  onCreate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Sync input value with selected option when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue(selectedOption ? selectedOption.label : "");
    } else {
      setInputValue(""); // Clear input when opening to easily see all options
    }
  }, [isOpen, selectedOption]);

  // Close dropdown on outside click and scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // We also need to check if the click was inside the portal
        const target = event.target as HTMLElement;
        if (!target.closest('.searchable-select-portal')) {
          setIsOpen(false);
        }
      }
    };

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.closest && target.closest('.searchable-select-portal')) {
        return; // Do not close if scrolling inside the dropdown
      }
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = options.find((opt) => opt.label.toLowerCase() === inputValue.trim().toLowerCase());

  const handleCreate = async () => {
    if (!onCreate || !inputValue.trim() || isCreating) return;
    setIsCreating(true);
    try {
      await onCreate(inputValue.trim());
      // we do not close the dropdown immediately in case the parent needs to update options,
      // but we let the parent handle the value change. The user will see the newly created option.
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          className={cn(
            "w-full h-10 px-3 pr-8 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          disabled={disabled}
        />
        <ChevronDown size={16} className="absolute right-3 text-muted-foreground opacity-50 pointer-events-none" />
      </div>

      {isOpen && createPortal(
        <div 
          className="searchable-select-portal absolute z-[9999] mt-1 bg-popover border border-border/50 rounded-md shadow-md animate-in fade-in slide-in-from-top-2"
          style={{ top: coords.top, left: coords.left, width: coords.width, pointerEvents: "auto" }}
          onPointerDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="max-h-[136px] overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                Aucun résultat.
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-left",
                    value === opt.value && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check size={16} />}
                </button>
              ))
            )}
            
            {onCreate && inputValue.trim() !== "" && !exactMatch && (
              <button
                type="button"
                className="w-full flex items-center justify-between px-2 py-2 mt-1 text-sm rounded-sm bg-primary/5 text-primary hover:bg-primary/10 font-medium text-left border-t"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? "Création en cours..." : `+ Créer "${inputValue.trim()}"`}
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
