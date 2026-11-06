"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export function SelectDropdown({ id, value, options, onChange, placeholder = "Select an option", disabled = false, searchable = false, describedBy, ariaLabel, className, invalid = false, size = "md" }: {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  describedBy?: string;
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md";
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find(option => option.value === value);
  const filtered = options.filter(option => `${option.label} ${option.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const expanded = open && !disabled;

  useEffect(() => {
    if (!expanded) return;
    function position() {
      const anchor = trigger.current;
      const menu = popup.current;
      if (!anchor || !menu) return;
      const rect = anchor.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const viewportTop = window.visualViewport?.offsetTop ?? 0;
      const below = viewportTop + viewportHeight - rect.bottom - 12;
      const above = rect.top - viewportTop - 12;
      const upwards = below < 220 && above > below;
      const available = Math.max(0, upwards ? above : below);
      const height = Math.min(menu.scrollHeight, searchable ? 330 : 260, available);
      const width = Math.min(Math.max(rect.width, 180), window.innerWidth - 24);
      Object.assign(menu.style, {
        width: `${width}px`, maxHeight: `${available}px`,
        left: `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`,
        top: `${upwards ? rect.top - height - 8 : rect.bottom + 8}px`,
        visibility: "visible",
      });
    }
    position();
    search.current?.focus();
    function dismiss(event: PointerEvent) {
      const target = event.target as Node;
      if (!container.current?.contains(target) && !popup.current?.contains(target)) setOpen(false);
    }
    function reposition(event: Event) {
      // Scrolling inside the options should not move the anchored popup.
      if (event.target instanceof Node && popup.current?.contains(event.target)) return;
      position();
    }
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", reposition, true);
    window.visualViewport?.addEventListener("resize", position);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", reposition, true);
      window.visualViewport?.removeEventListener("resize", position);
    };
  }, [expanded, searchable, query]);

  useEffect(() => {
    if (expanded) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, expanded, listId]);

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
    trigger.current?.focus();
  }

  return <div ref={container} className={cn("relative min-w-0", className)} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !popup.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
  }} onKeyDown={event => {
    if (disabled) return;
    if (event.key === "Escape" && expanded) {
      event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!expanded) { setQuery(""); setOpen(true); setActive(Math.max(0, options.findIndex(option => option.value === value))); }
      else setActive(index => filtered.length ? (index + (event.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length : 0);
    } else if ((event.key === "Home" || event.key === "End") && expanded && event.target === trigger.current) {
      event.preventDefault(); setActive(event.key === "Home" ? 0 : Math.max(0, filtered.length - 1));
    } else if ((event.key === "Enter" || (event.key === " " && event.target === trigger.current)) && expanded) {
      event.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    }
  }}>
    <button ref={trigger} id={id} type="button" role="combobox" disabled={disabled}
      aria-invalid={invalid || undefined} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={expanded} aria-controls={listId}
      aria-describedby={describedBy} aria-activedescendant={expanded && filtered[active] ? `${listId}-${active}` : undefined}
      onClick={() => {
        setOpen(!expanded); setQuery(""); setActive(Math.max(0, options.findIndex(option => option.value === value)));
      }}
      className={cn("flex w-full items-center justify-between gap-3 rounded-xl border bg-white text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3A8F3D]/10 disabled:cursor-not-allowed disabled:bg-[#F4F7F3] sm:text-sm", size === "sm" ? "min-h-10 px-3 py-2" : "min-h-12 px-4 py-3", expanded ? "border-[#3A8F3D] ring-4 ring-[#3A8F3D]/10" : "border-[#DDE8DF] hover:border-[#AAC4AE]", selected ? "text-[#17231D]" : "text-[#6B756E]", invalid && "border-[#D9534F]")}>
      <span className="min-w-0 truncate">{selected?.label ?? placeholder}</span>
      <ChevronDown aria-hidden="true" className={cn("h-4 w-4 shrink-0 text-[#6B756E] transition-transform", expanded && "rotate-180")} />
    </button>
    {expanded && typeof document !== "undefined" && createPortal(<div ref={popup} style={{ position: "fixed", visibility: "hidden", zIndex: 100 }} className="flex flex-col overflow-hidden rounded-2xl border border-[#DDE8DF] bg-white shadow-[0_12px_32px_rgba(11,93,59,0.16)]">
      {searchable && <div className="shrink-0 border-b border-[#E6EDE7] bg-white p-3"><div className="relative"><Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-[#6B756E]" /><input ref={search} type="text" role="combobox" aria-label={ariaLabel ? `Search ${ariaLabel.toLowerCase()}` : "Search options"} aria-controls={listId} aria-expanded={expanded} aria-autocomplete="list" aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} placeholder="Search options..." className="min-h-10 w-full rounded-lg border border-[#DDE8DF] bg-[#F7FAF5] py-2 pl-9 pr-3 text-base text-[#17231D] outline-none focus:border-[#3A8F3D] sm:text-sm" /></div></div>}
      <div id={listId} role="listbox" aria-labelledby={id} className="min-h-0 max-h-60 overflow-y-auto overscroll-contain bg-white p-1.5">
        {filtered.length ? filtered.map((option, index) => <button key={option.value} id={`${listId}-${index}`} type="button" role="option" aria-selected={value === option.value} tabIndex={-1}
          onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}
          className={cn("flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors", value === option.value ? "bg-[#EAF3E6] text-[#0B5D3B]" : index === active ? "bg-[#F2F6EE] text-[#17231D]" : "bg-white text-[#17231D] hover:bg-[#F2F6EE]")}>
          <span className="min-w-0"><span className="block break-words font-semibold">{option.label}</span>{option.description && <span className="mt-0.5 block break-words text-xs font-normal text-[#6B756E]">{option.description}</span>}</span>
          {value === option.value && <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#0B5D3B]" />}
        </button>) : <p className="px-3 py-5 text-center text-sm text-[#6B756E]">No matching options found.</p>}
      </div>
    </div>, document.body)}
  </div>;
}
