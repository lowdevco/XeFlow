import { useState, useEffect, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select Option",
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  optionClassName = "",
  align = "right",
  fullWidth = false,
  disabled = false,
  prefixIcon = null,
  triggerLabel = null,
  dropdownHeader = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = triggerLabel || (selectedOption ? selectedOption.label : placeholder);

  const btnClass = buttonClassName
    ? `flex items-center justify-between gap-2 cursor-pointer transition-all ${buttonClassName}`
    : `flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold shadow-sm hover:shadow-md hover:border-xeflow-brand transition-all cursor-pointer whitespace-nowrap bg-xeflow-surface border-xeflow-border text-xeflow-text ${fullWidth ? "w-full" : ""}`;

  const dropdownClass = dropdownClassName
    ? `absolute mt-2 z-50 max-h-[250px] overflow-y-auto custom-scrollbar rounded-xl bg-xeflow-surface border border-xeflow-border shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-3 duration-250 ${dropdownClassName}`
    : `absolute mt-2 ${align === "right" ? "right-0" : "left-0"} ${fullWidth ? "w-full" : "w-48"} rounded-xl bg-xeflow-surface border border-xeflow-border shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-3 duration-250 max-h-[250px] overflow-y-auto custom-scrollbar`;

  return (
    <div className={`relative ${fullWidth ? "w-full" : ""} ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`${btnClass} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span className="flex items-center gap-2 truncate">
          {prefixIcon && <span className="shrink-0 flex items-center">{prefixIcon}</span>}
          <span className="truncate">{displayLabel}</span>
        </span>
        <FiChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className={dropdownClass}>
          {dropdownHeader && (
            <p className="text-[10px] font-black uppercase text-xeflow-muted tracking-wider px-3 py-1.5 border-b border-xeflow-border/40 mb-1.5 select-none">
              {dropdownHeader}
            </p>
          )}
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`text-left text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer truncate ${value === opt.value ? "bg-xeflow-brand/10 text-xeflow-brand" : "text-xeflow-text hover:bg-xeflow-brand/10"} ${optionClassName}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


