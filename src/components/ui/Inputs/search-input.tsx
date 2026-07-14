import React from "react";
import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/utils/ui";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, placeholder = "Rechercher...", ...props }, ref) => {
    return (
      <div className={cn("relative flex-grow max-w-md w-full", wrapperClassName)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className={cn("pl-10 bg-background", className)}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
