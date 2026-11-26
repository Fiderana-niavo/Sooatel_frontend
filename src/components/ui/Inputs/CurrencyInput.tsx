import React, { useState, useEffect } from "react";
import { Input } from "./input";

export interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: number | null;
  onChange: (value: number | undefined) => void;
  currencySuffix?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  currencySuffix = "Ar",
  className = "",
  placeholder = "0",
  disabled,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>("");

  useEffect(() => {
    if (!isFocused) {
      if (
        value !== undefined &&
        value !== null &&
        !isNaN(value) &&
        value !== 0
      ) {
        setDisplayValue(
            new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
              Math.round(value),
            ),
          );
      } else {
        setDisplayValue("");
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const cleanDigits = rawInput.replace(/[^\d]/g, "");

    if (cleanDigits === "") {
      setDisplayValue("");
      onChange(undefined);
      return;
    }

    const num = parseInt(cleanDigits, 10);
    if (!isNaN(num)) {
      const formatted = new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0,
      }).format(num);
      setDisplayValue(formatted);
      onChange(num);
    } else {
      setDisplayValue(cleanDigits);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (value !== undefined && value !== null && !isNaN(value) && value !== 0) {
      setDisplayValue(
          new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
            Math.round(value),
          ),
        );
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (value !== undefined && value !== null && !isNaN(value) && value !== 0) {
      setDisplayValue(
          new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
            Math.round(value),
          ),
        );
    } else {
      setDisplayValue("");
      onChange(undefined);
    }
    props.onBlur?.(e);
  };

  return (
    <div className="relative flex items-center w-full">
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`${className} ${currencySuffix ? "pr-8" : ""}`}
      />
      {currencySuffix && (
        <span className="absolute right-2.5 text-xs text-muted-foreground font-medium pointer-events-none select-none">
          {currencySuffix}
        </span>
      )}
    </div>
  );
};
