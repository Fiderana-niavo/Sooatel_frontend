import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button/button";

export interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  className?: string; // e.g., text-red-500
  hidden?: boolean;
}

interface ActionDropdownProps {
  items: ActionItem[];
  icon?: ReactNode;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({ items, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 + window.scrollX // 192px = w-48
      });
    }
    setIsOpen(!isOpen);
  };

  const visibleItems = items.filter(item => !item.hidden);

  if (visibleItems.length === 0) return null;

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className="h-8 w-8 rounded-full p-0 hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {icon || <MoreVertical className="h-4 w-4 text-muted-foreground" />}
      </Button>
      
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="absolute z-[9999] w-48 rounded-xl shadow-lg p-1 bg-card border animate-in fade-in zoom-in-95 duration-100"
          style={{ top: coords.top, left: coords.left }}
        >
          <div className="flex flex-col" role="menu">
            {visibleItems.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted rounded-lg transition-colors ${item.className || 'text-foreground'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
