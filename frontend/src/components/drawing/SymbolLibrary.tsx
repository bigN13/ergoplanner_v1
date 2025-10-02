"use client";

import {
  Search,
  ChevronDown,
  ChevronRight,
  // Star,
  Clock,
  Grid,
  List,
  Filter,
  X,
  // Tag,
  Heart,
} from "lucide-react";
import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { List as VirtualList } from "react-window";
import Fuse from "fuse.js";

import { useDragPreview } from "@/hooks/useDragPreview";

export interface Symbol {
  id: string;
  type: string;
  label: string;
  category: string;
  icon?: React.ReactNode;
  defaultData: Record<string, unknown>;
  tags?: string[];
  description?: string;
  standard?: "ISA-5.1" | "ISO-14617" | "UK-Water";
  searchKeywords?: string[];
}

const symbolCategories = [
  {
    name: "Pumps & Compressors",
    symbols: [
      {
        id: "pump-centrifugal",
        type: "pump",
        label: "Centrifugal Pump",
        category: "Pumps & Compressors",
        defaultData: {
          label: "P-101",
          type: "centrifugal",
          flowRate: "100 m³/h",
          head: "50 m",
        },
        tags: ["pump", "centrifugal", "rotating", "equipment"],
        description: "Centrifugal pump for fluid transfer",
        standard: "ISA-5.1" as const,
        searchKeywords: ["pump", "centrifugal", "fluid", "transfer", "rotating"],
      },
      {
        id: "compressor",
        type: "compressor",
        label: "Compressor",
        category: "Pumps & Compressors",
        defaultData: {
          label: "C-101",
          type: "centrifugal",
          pressure: "10 bar",
        },
        tags: ["compressor", "centrifugal", "rotating", "equipment"],
        description: "Centrifugal compressor for gas compression",
        standard: "ISA-5.1" as const,
        searchKeywords: ["compressor", "centrifugal", "gas", "pressure", "rotating"],
      },
    ],
  },
  {
    name: "Valves",
    symbols: [
      {
        id: "valve-gate",
        type: "valve",
        label: "Gate Valve",
        category: "Valves",
        defaultData: {
          label: "V-101",
          type: "gate",
          state: "open",
          size: "DN100",
        },
        tags: ["valve", "gate", "isolation", "manual"],
        description: "Gate valve for flow isolation",
        standard: "ISA-5.1" as const,
        searchKeywords: ["valve", "gate", "isolation", "shutoff", "manual"],
      },
      {
        id: "valve-control",
        type: "controlValve",
        label: "Control Valve",
        category: "Valves",
        defaultData: {
          label: "CV-101",
          controlType: "pneumatic",
          position: 50,
        },
        tags: ["valve", "control", "automated", "pneumatic"],
        description: "Control valve for flow regulation",
        standard: "ISA-5.1" as const,
        searchKeywords: ["valve", "control", "pneumatic", "automated", "regulation"],
      },
      {
        id: "valve-check",
        type: "checkValve",
        label: "Check Valve",
        category: "Valves",
        defaultData: {
          label: "CHK-101",
          type: "swing",
          flowDirection: "left-to-right",
        },
        tags: ["valve", "check", "non-return", "swing"],
        description: "Check valve to prevent backflow",
        standard: "ISA-5.1" as const,
        searchKeywords: ["valve", "check", "non-return", "backflow", "swing"],
      },
    ],
  },
  {
    name: "Tanks & Vessels",
    symbols: [
      {
        id: "tank-storage",
        type: "tank",
        label: "Storage Tank",
        category: "Tanks & Vessels",
        defaultData: {
          label: "T-101",
          type: "storage",
          capacity: "1000 m³",
          level: 50,
        },
        tags: ["tank", "storage", "vessel", "atmospheric"],
        description: "Storage tank for liquid storage",
        standard: "ISA-5.1" as const,
        searchKeywords: ["tank", "storage", "vessel", "liquid", "atmospheric"],
      },
      {
        id: "tank-pressure",
        type: "tank",
        label: "Pressure Vessel",
        category: "Tanks & Vessels",
        defaultData: {
          label: "V-101",
          type: "pressure",
          capacity: "500 m³",
          level: 30,
        },
        tags: ["tank", "pressure", "vessel"],
        description: "Pressure vessel for high pressure storage",
        standard: "ISA-5.1" as const,
        searchKeywords: ["tank", "pressure", "vessel", "high", "storage"],
      },
    ],
  },
  {
    name: "Piping",
    symbols: [
      {
        id: "pipe-horizontal",
        type: "pipe",
        label: "Horizontal Pipe",
        category: "Piping",
        defaultData: {
          label: "",
          diameter: "DN100",
          material: "Steel",
          orientation: "horizontal",
        },
        tags: ["pipe", "horizontal", "piping"],
        description: "Horizontal pipe section",
        standard: "ISA-5.1" as const,
        searchKeywords: ["pipe", "horizontal", "piping", "section"],
      },
      {
        id: "pipe-vertical",
        type: "pipe",
        label: "Vertical Pipe",
        category: "Piping",
        defaultData: {
          label: "",
          diameter: "DN100",
          material: "Steel",
          orientation: "vertical",
        },
        tags: ["pipe", "vertical", "piping"],
        description: "Vertical pipe section",
        standard: "ISA-5.1" as const,
        searchKeywords: ["pipe", "vertical", "piping", "section"],
      },
      {
        id: "pipe-elbow",
        type: "pipe",
        label: "Elbow",
        category: "Piping",
        defaultData: {
          label: "",
          diameter: "DN100",
          material: "Steel",
          orientation: "elbow",
        },
        tags: ["pipe", "elbow", "fitting", "bend"],
        description: "90-degree pipe elbow",
        standard: "ISA-5.1" as const,
        searchKeywords: ["pipe", "elbow", "fitting", "bend", "90", "degree"],
      },
      {
        id: "pipe-tee",
        type: "pipe",
        label: "Tee",
        category: "Piping",
        defaultData: {
          label: "",
          diameter: "DN100",
          material: "Steel",
          orientation: "tee",
        },
        tags: ["pipe", "tee", "fitting", "branch"],
        description: "Pipe tee junction",
        standard: "ISA-5.1" as const,
        searchKeywords: ["pipe", "tee", "fitting", "branch", "junction"],
      },
      {
        id: "pipe-cross",
        type: "pipe",
        label: "Cross",
        category: "Piping",
        defaultData: {
          label: "",
          diameter: "DN100",
          material: "Steel",
          orientation: "cross",
        },
        tags: ["pipe", "cross", "fitting", "intersection"],
        description: "Pipe cross junction",
        standard: "ISA-5.1" as const,
        searchKeywords: ["pipe", "cross", "fitting", "intersection", "junction"],
      },
    ],
  },
  {
    name: "Instruments",
    symbols: [
      {
        id: "flow-meter",
        type: "flowMeter",
        label: "Flow Meter",
        category: "Instruments",
        defaultData: {
          label: "FI-101",
          type: "electromagnetic",
          unit: "m³/h",
          value: "0.0",
        },
        tags: ["instrument", "flow", "meter", "measurement"],
        description: "Flow measurement instrument",
        standard: "ISA-5.1" as const,
        searchKeywords: ["instrument", "flow", "meter", "measurement", "electromagnetic"],
      },
      {
        id: "pressure-gauge",
        type: "pressureGauge",
        label: "Pressure Gauge",
        category: "Instruments",
        defaultData: {
          label: "PI-101",
          unit: "bar",
          value: "0.0",
          maxPressure: "10 bar",
        },
        tags: ["instrument", "pressure", "gauge", "measurement"],
        description: "Pressure measurement instrument",
        standard: "ISA-5.1" as const,
        searchKeywords: ["instrument", "pressure", "gauge", "measurement", "bar"],
      },
    ],
  },
  {
    name: "Heat Transfer",
    symbols: [
      {
        id: "heat-exchanger",
        type: "heatExchanger",
        label: "Heat Exchanger",
        category: "Heat Transfer",
        defaultData: {
          label: "HX-101",
          type: "shell-tube",
          duty: "1000 kW",
        },
        tags: ["heat", "exchanger", "transfer", "shell", "tube"],
        description: "Heat exchanger for thermal transfer",
        standard: "ISA-5.1" as const,
        searchKeywords: ["heat", "exchanger", "transfer", "thermal", "shell", "tube"],
      },
    ],
  },
];

interface SymbolLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: Record<string, unknown>) => void;
}

export default function SymbolLibrary({ onDragStart }: SymbolLibraryProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(symbolCategories.map((cat) => cat.name))
  );
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [recentlyUsed, setRecentlyUsed] = useState<Symbol[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<string>("all");

  // Enhanced drag preview integration
  const { startStencilDrag } = useDragPreview();

  // Load favorites and recently used from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("ergoplanner-favorites");
    const savedRecent = localStorage.getItem("ergoplanner-recent-symbols");

    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    if (savedRecent) {
      setRecentlyUsed(JSON.parse(savedRecent));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("ergoplanner-favorites", JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Save recently used to localStorage
  useEffect(() => {
    localStorage.setItem("ergoplanner-recent-symbols", JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  const toggleCategory = (categoryName: string): void => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Get all available tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    symbolCategories.forEach((category) => {
      category.symbols.forEach((symbol) => {
        symbol.tags?.forEach((tag: string) => tagSet.add(tag));
      });
    });
    return Array.from(tagSet).sort();
  }, []);

  // Filter symbols based on search, tags, and standard
  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    // Flatten all symbols from all categories
    const allSymbols = symbolCategories.flatMap((category) => category.symbols);

    return new Fuse(allSymbols, {
      keys: [
        { name: "label", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "searchKeywords", weight: 0.2 },
        { name: "tags", weight: 0.1 },
      ],
      threshold: 0.4, // 0 = exact match, 1 = match anything
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true, // Search entire string, not just beginning
    });
  }, []);

  const filteredCategories = useMemo(() => {
    return symbolCategories
      .map((category) => ({
        ...category,
        symbols: category.symbols.filter((symbol) => {
          // Fuzzy text search using Fuse.js
          let matchesSearch = true;
          if (searchTerm !== "") {
            const searchResults = fuse.search(searchTerm);
            matchesSearch = searchResults.some((result) => result.item.id === symbol.id);
          }

          // Tag filter
          const matchesTags =
            selectedTags.size === 0 ||
            (symbol.tags?.some((tag: string) => selectedTags.has(tag)) ?? false);

          // Standard filter
          const matchesStandard =
            selectedStandard === "all" || symbol.standard === selectedStandard;

          return matchesSearch && matchesTags && matchesStandard;
        }),
      }))
      .filter((category) => category.symbols.length > 0);
  }, [searchTerm, selectedTags, selectedStandard, fuse]);

  // Add recently used category if there are recent symbols
  const categoriesWithRecent = useMemo(() => {
    if (recentlyUsed.length === 0) return filteredCategories;

    return [
      {
        name: "Recently Used",
        symbols: recentlyUsed.slice(0, 8), // Show max 8 recent items
      },
      ...filteredCategories,
    ];
  }, [filteredCategories, recentlyUsed]);

  const toggleFavorite = (symbolId: string): void => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(symbolId)) {
      newFavorites.delete(symbolId);
    } else {
      newFavorites.add(symbolId);
    }
    setFavorites(newFavorites);
  };

  const addToRecentlyUsed = useCallback(
    (symbol: Symbol): void => {
      const filtered = recentlyUsed.filter((s) => s.id !== symbol.id);
      const newRecent = [symbol, ...filtered].slice(0, 10); // Keep max 10 recent items
      setRecentlyUsed(newRecent);
    },
    [recentlyUsed]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent, symbol: Symbol): void => {
      addToRecentlyUsed(symbol);

      // Set up traditional drag data for backward compatibility
      onDragStart(event, symbol.type, symbol.defaultData);

      // Start enhanced drag preview
      const symbolElement = event.currentTarget as HTMLElement;
      const mousePosition = { x: event.clientX, y: event.clientY };
      startStencilDrag(symbolElement, mousePosition);
    },
    [addToRecentlyUsed, onDragStart, startStencilDrag]
  );

  const toggleTag = (tag: string): void => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const clearFilters = (): void => {
    setSearchTerm("");
    setSelectedTags(new Set());
    setSelectedStandard("all");
  };

  const renderSymbolIcon = (type: string): React.ReactNode => {
    // Simplified icon representations for the library
    const iconMap: { [key: string]: React.ReactNode } = {
      pump: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="15" cy="15" r="12" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <path d="M 10 15 L 20 10 L 20 20 Z" fill="currentColor" />
        </svg>
      ),
      valve: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 8 15 L 15 8 L 15 22 Z M 22 15 L 15 8 L 15 22 Z"
            fill="currentColor"
            stroke="currentColor"
          />
        </svg>
      ),
      controlValve: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 8 15 L 15 8 L 15 22 Z M 22 15 L 15 8 L 15 22 Z"
            fill="currentColor"
            stroke="currentColor"
          />
          <rect x="10" y="3" width="10" height="5" stroke="currentColor" fill="white" />
        </svg>
      ),
      checkValve: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="15" cy="15" r="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <path
            d="M 10 15 L 18 15 M 18 15 L 15 12 M 18 15 L 15 18"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
      tank: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="8"
            y="8"
            width="14"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />
          <rect x="9" y="18" width="12" height="7" fill="#E0E7FF" opacity="0.5" />
        </svg>
      ),
      pipe: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="5" y1="15" x2="25" y2="15" stroke="currentColor" strokeWidth="3" />
        </svg>
      ),
      flowMeter: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="15" cy="15" r="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <text x="15" y="19" textAnchor="middle" fontSize="8" fontWeight="bold">
            FI
          </text>
        </svg>
      ),
      pressureGauge: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="15" cy="13" r="8" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <text x="15" y="16" textAnchor="middle" fontSize="8" fontWeight="bold">
            PI
          </text>
          <line x1="15" y1="21" x2="15" y2="25" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      heatExchanger: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="5"
            y="10"
            width="20"
            height="10"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="white"
          />
          <line x1="8" y1="13" x2="22" y2="13" stroke="#EF4444" strokeWidth="1" />
          <line x1="8" y1="17" x2="22" y2="17" stroke="#3B82F6" strokeWidth="1" />
        </svg>
      ),
      compressor: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="15" cy="15" r="10" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <path
            d="M 15 10 L 12 15 L 15 20 M 15 10 L 18 15 L 15 20"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    };

    return iconMap[type] || iconMap.pipe;
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Symbol Library</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="rounded p-1 hover:bg-gray-200"
              title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
            >
              {viewMode === "grid" ? <List className="h-3 w-3" /> : <Grid className="h-3 w-3" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded p-1 hover:bg-gray-200 ${
                showFilters || selectedTags.size > 0 || selectedStandard !== "all"
                  ? "bg-blue-100 text-blue-600"
                  : ""
              }`}
              title="Toggle filters"
            >
              <Filter className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-1.5 pr-3 pl-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-3 space-y-3">
            {/* Standard Filter */}
            <div>
              <label className="mb-1 block text-xs text-gray-500">Standard</label>
              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Standards</option>
                <option value="ISA-5.1">ISA-5.1</option>
                <option value="ISO-14617">ISO-14617</option>
                <option value="UK-Water">UK Water</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="mb-1 block text-xs text-gray-500">Tags</label>
              <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-2 py-1 text-xs ${
                      selectedTags.has(tag)
                        ? "border-blue-300 bg-blue-100 text-blue-700"
                        : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedTags.size > 0 || selectedStandard !== "all" || searchTerm) && (
              <button
                onClick={clearFilters}
                className="w-full py-1 text-xs text-red-600 hover:text-red-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {categoriesWithRecent.map((category) => (
          <div key={category.name} className="mb-2">
            <button
              onClick={() => toggleCategory(category.name)}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <span>{category.name}</span>
                {category.name === "Recently Used" && <Clock className="h-3 w-3 text-gray-400" />}
                <span className="text-xs text-gray-500">({category.symbols.length})</span>
              </div>
              {expandedCategories.has(category.name) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedCategories.has(category.name) && (
              <div className="mt-1">
                <VirtualList
                  style={{ height: Math.min(category.symbols.length * (viewMode === "grid" ? 60 : 80), 400) }}
                  rowCount={viewMode === "grid" ? Math.ceil(category.symbols.length / 2) : category.symbols.length}
                  rowHeight={viewMode === "grid" ? 60 : 80}
                  rowComponent={({ index, style }) => {
                    if (viewMode === "grid") {
                      // Grid mode: 2 items per row
                      const startIdx = index * 2;
                      const symbols = category.symbols.slice(startIdx, startIdx + 2);

                      return (
                        <div style={style} className="flex gap-1.5 px-2">
                          {symbols.map((symbol) => {
                            const symbolData = symbol;
                            return (
                              <div
                                key={symbolData.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, symbolData)}
                                className="group relative flex flex-1 cursor-move flex-col items-center rounded border border-gray-200 bg-white p-2 hover:border-blue-400 hover:bg-blue-50"
                                title={symbolData.description || symbolData.label}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(symbolData.id);
                                  }}
                                  className={`absolute right-1 top-1 rounded p-0.5 opacity-0 group-hover:opacity-100 ${
                                    favorites.has(symbolData.id)
                                      ? "text-yellow-500 opacity-100"
                                      : "text-gray-400 hover:text-yellow-500"
                                  }`}
                                >
                                  <Heart
                                    className={`h-3 w-3 ${favorites.has(symbolData.id) ? "fill-current" : ""}`}
                                  />
                                </button>
                                <div className="mb-1 text-gray-700">
                                  {renderSymbolIcon(symbolData.type)}
                                </div>
                                <div className="text-center">
                                  <span className="text-xs text-gray-600">{symbolData.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      // List mode: 1 item per row
                      const symbolData = category.symbols[index];

                      return (
                        <div style={style} className="px-2">
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, symbolData)}
                            className="group relative flex cursor-move items-center gap-2 rounded border border-gray-200 bg-white p-2 hover:border-blue-400 hover:bg-blue-50"
                            title={symbolData.description || symbolData.label}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(symbolData.id);
                              }}
                              className={`absolute right-1 top-1 rounded p-0.5 opacity-0 group-hover:opacity-100 ${
                                favorites.has(symbolData.id)
                                  ? "text-yellow-500 opacity-100"
                                  : "text-gray-400 hover:text-yellow-500"
                              }`}
                            >
                              <Heart
                                className={`h-3 w-3 ${favorites.has(symbolData.id) ? "fill-current" : ""}`}
                              />
                            </button>
                            <div className="flex-shrink-0 text-gray-700">
                              {renderSymbolIcon(symbolData.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-medium text-gray-600">{symbolData.label}</span>
                              {symbolData.description && (
                                <p className="truncate text-xs text-gray-400">{symbolData.description}</p>
                              )}
                              {symbolData.tags && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {symbolData.tags.slice(0, 2).map((tag) => (
                                    <span key={tag} className="rounded bg-gray-100 px-1 text-xs text-gray-600">
                                      {tag}
                                    </span>
                                  ))}
                                  {symbolData.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{symbolData.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {symbolData.standard && (
                              <div className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                                {symbolData.standard}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  }}
                  rowProps={{}}
                />
              </div>
            )}
          </div>
        ))}

        {categoriesWithRecent.length === 0 && (
          <div className="py-8 text-center">
            <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No symbols found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3">
        <p className="text-xs text-gray-500">
          Drag symbols to the canvas to add them to your P&ID diagram
        </p>
      </div>
    </div>
  );
}
