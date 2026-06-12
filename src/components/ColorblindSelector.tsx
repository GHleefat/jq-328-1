import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Eye, AlertCircle } from "lucide-react";
import { ColorblindType, ColorblindOption } from "@/types";
import { COLORBLIND_OPTIONS } from "@/utils/colorMatrix";

interface ColorblindSelectorProps {
  value: ColorblindType;
  onChange: (value: ColorblindType) => void;
  disabled?: boolean;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export const ColorblindSelector: React.FC<ColorblindSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
    }
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideContainer = containerRef.current?.contains(target) ?? false;
      const isInsideDropdown = dropdownRef.current?.contains(target) ?? false;

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = COLORBLIND_OPTIONS.find((opt) => opt.value === value);

  const handleSelect = useCallback(
    (option: ColorblindOption) => {
      onChange(option.value);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [disabled],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full animate-fade-in"
      style={{ animationDelay: "0.1s" }}
    >
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full flex items-center justify-between p-4 rounded-2xl
          border transition-all duration-300 text-left
          ${
            disabled
              ? "opacity-50 cursor-not-allowed border-dark-600 bg-dark-700/50"
              : "border-dark-500/50 bg-dark-700/50 hover:border-accent-500/50 hover:bg-dark-600/50 cursor-pointer"
          }
          ${isOpen ? "border-accent-500 ring-2 ring-accent-500/20" : ""}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-accent-500" />
          </div>
          <div>
            <p className="font-medium text-dark-100">{currentOption?.label}</p>
            <p className="text-sm text-dark-400">
              {currentOption?.description}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-dark-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            className="fixed z-[9999] py-2 rounded-2xl bg-dark-700/95 backdrop-blur-xl border border-dark-500/50 shadow-2xl animate-fade-in overflow-hidden max-h-96 overflow-y-auto scrollbar-thin"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
          >
            {COLORBLIND_OPTIONS.map((option, index) => (
              <button
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => handleSelect(option)}
                style={{ animationDelay: `${index * 30}ms` }}
                className={`
                w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-200
                hover:bg-accent-500/10 animate-slide-up
                ${value === option.value ? "bg-accent-500/15 border-l-2 border-accent-500" : "border-l-2 border-transparent"}
              `}
              >
                <div
                  className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                ${value === option.value ? "bg-accent-500/20" : "bg-dark-600/50"}
              `}
                >
                  {value === option.value ? (
                    <div className="w-3 h-3 rounded-full bg-accent-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-dark-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${value === option.value ? "text-accent-500" : "text-dark-100"}`}
                  >
                    {option.label}
                  </p>
                  <p className="text-sm text-dark-400 mt-0.5">
                    {option.description}
                  </p>
                  <p className="text-xs text-dark-500 font-mono mt-1">
                    患病率: {option.prevalence}
                  </p>
                </div>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};
