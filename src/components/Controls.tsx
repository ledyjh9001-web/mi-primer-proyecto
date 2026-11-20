import React from 'react';
import { Search, X } from 'lucide-react';

interface SquareCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
}

export const SquareCheckbox: React.FC<SquareCheckboxProps> = ({
  checked,
  onChange,
  label,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel || label || 'Toggle selection'}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="inline-flex items-center gap-2.5 group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#dc2626] focus-visible:outline-offset-2"
    >
      <span
        className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-colors duration-100 ${
          checked
            ? 'bg-[#dc2626] border-[#dc2626]'
            : 'bg-[#050506] border-[#27272a] group-hover:border-[#dc2626]'
        }`}
      >
        {checked && <span className="w-1.5 h-1.5 bg-[#f4f4f5] block" />}
      </span>
      {label && (
        <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#f4f4f5] whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
};

interface SquareRadioProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  detail?: string;
}

export const SquareRadio: React.FC<SquareRadioProps> = ({
  selected,
  onSelect,
  label,
  detail,
}) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`w-full text-left p-3 border transition-colors duration-100 flex items-start gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#dc2626] ${
        selected
          ? 'bg-[#1a1b1f] border-[#dc2626]'
          : 'bg-[#0a0a0c] border-[#27272a] hover:border-[#52525b]'
      }`}
    >
      <span className="w-4 h-4 mt-0.5 shrink-0 border border-[#27272a] bg-[#050506] flex items-center justify-center">
        {selected && <span className="w-2 h-2 bg-[#dc2626] block" />}
      </span>
      <span className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#f4f4f5]">
          {label}
        </span>
        {detail && (
          <span className="text-[11px] text-[#a1a1aa]">{detail}</span>
        )}
      </span>
    </button>
  );
};

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  value,
  onChange,
  placeholder = 'SEARCH TRACKS, BPM, KEY, PRODUCER...',
  className = '',
}) => {
  return (
    <div
      className={`relative h-[44px] bg-[#0a0a0c] border border-[#27272a] focus-within:border-[#dc2626] flex items-center px-3 transition-colors duration-100 ${className}`}
    >
      <Search className="w-4 h-4 text-[#71717a] shrink-0 mr-2.5" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-full bg-transparent text-[13px] font-mono-tech text-[#f4f4f5] placeholder:text-[#71717a] focus:outline-none tracking-[0.02em]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="p-1 text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span
          aria-hidden="true"
          className="w-2 h-4 bg-[#dc2626] shrink-0 opacity-80"
        />
      )}
    </div>
  );
};
