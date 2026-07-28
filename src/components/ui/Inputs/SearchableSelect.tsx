import React, { useState, useRef, useEffect } from "react";
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
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

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
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        <ChevronDown size={16} className="absolute right-3 text-muted-foreground opacity-50 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border/50 rounded-md shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="max-h-60 overflow-y-auto p-1">
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
          </div>
        </div>
      )}
    </div>
  );
};
