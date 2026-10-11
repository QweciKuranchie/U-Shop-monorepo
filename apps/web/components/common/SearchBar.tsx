"use client";

import React, { useRef, useState, useEffect, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@repo/utils";
import { LiveSearchPopover, SearchResultProduct } from "./LiveSearchPopover";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const abortRef = useRef<AbortController | null>(null);

  // Debounced API search call. A newer keystroke aborts the in-flight request so a
  // slow, stale response can never overwrite newer results (and we save bandwidth).
  const fetchResults = useCallback(async (searchQuery: string) => {
    abortRef.current?.abort();
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setIsOpen(true);
    setActiveIndex(-1);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`,
        { signal: controller.signal }
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.products || []);
      }
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return;
      console.error("Live search fetch error:", error);
    } finally {
      if (abortRef.current === controller) setIsLoading(false);
    }
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchResults(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard support for the suggestion list (ARIA combobox pattern).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const active = activeIndex >= 0 ? results[activeIndex] : undefined;
    if (isOpen && active?.slug?.current) {
      setIsOpen(false);
      router.push(`/product/${active.slug.current}`);
      return;
    }
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsOpen(false);

    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/shop?query=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative flex-1 max-w-md mx-auto z-40", className)}
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-full overflow-hidden rounded-full border border-gray-300 bg-white transition-all focus-within:border-ushop-purple focus-within:ring-2 focus-within:ring-ushop-purple/20 shadow-xs"
      >
        <input
          type="search"
          role="combobox"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${listId}-listbox`}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Search for products, categories..."
          className="flex-1 px-5 py-2.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors mr-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="px-5 py-2.5 bg-ushop-pink text-white rounded-full mr-1 hover:bg-ushop-pink/90 transition-all flex items-center justify-center shrink-0 shadow-sm hover:scale-[1.02] active:scale-95"
          aria-label="Submit search"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>

      {/* Live search popover */}
      <LiveSearchPopover
        isOpen={isOpen}
        isLoading={isLoading}
        results={results}
        query={query}
        listId={`${listId}-listbox`}
        activeIndex={activeIndex}
        onSelect={() => setIsOpen(false)}
      />
    </div>
  );
}

export default SearchBar;
