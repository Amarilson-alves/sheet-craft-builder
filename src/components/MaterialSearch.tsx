import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";
import type { Material } from "@/types/material";

type Props = {
  items: Material[];
  onSelect: (m: Material) => void;
  placeholder?: string;
  maxResults?: number;
  loading?: boolean;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function MaterialSearch({
  items,
  onSelect,
  placeholder = "Digite para buscar materiais... (ex.: AS)",
  maxResults = 50,
  loading = false
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Interno' | 'Externo'>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showMore, setShowMore] = useState(false);
  
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];
    
    let filtered = items.filter(material => {
      const matchesText = 
        normalizeText(material.Descrição).startsWith(normalizedQuery) ||
        normalizeText(material.SKU).startsWith(normalizedQuery);
      
      const matchesCategory = categoryFilter === 'all' || material.Categoria === categoryFilter;
      const matchesAvailability = !availableOnly || material.Qtdd_Depósito > 0;
      
      return matchesText && matchesCategory && matchesAvailability;
    });
    
    return filtered;
  }, [query, items, categoryFilter, availableOnly]);

  const displayedResults = showMore ? results : results.slice(0, maxResults);

  useEffect(() => {
    setOpen(query.length > 0 && results.length > 0);
    setSelectedIndex(0);
    setShowMore(false);
  }, [query, results.length]);

  useEffect(() => {
    if (open && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, open]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, displayedResults.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        const selectedMaterial = displayedResults[selectedIndex];
        if (selectedMaterial) {
          onSelect(selectedMaterial);
          setQuery("");
          setOpen(false);
          inputRef.current?.blur();
        }
        break;
      case "Escape":
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  function handleSelect(material: Material) {
    onSelect(material);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (listRef.current && !listRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="material-search">Buscar Material</Label>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="flex gap-1">
            <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={categoryFilter === 'Interno' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('Interno')}
            >
              Interno
            </Button>
            <Button
              variant={categoryFilter === 'Externo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('Externo')}
            >
              Externo
            </Button>
          </div>
          <Button
            variant={availableOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvailableOnly(!availableOnly)}
          >
            Apenas disponíveis
          </Button>
        </div>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="material-search"
              ref={inputRef}
              className="pl-10 pr-10"
              placeholder={loading ? "Carregando materiais..." : placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(query.length > 0 && results.length > 0)}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={open}
              aria-controls="material-listbox"
              aria-activedescendant={open ? `material-option-${selectedIndex}` : undefined}
              autoComplete="off"
              disabled={loading}
            />
            {open && (
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
              {/* Results count */}
              <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                {results.length > maxResults && !showMore && ` (mostrando ${maxResults})`}
              </div>

              <ul
                id="material-listbox"
                role="listbox"
                ref={listRef}
                className="max-h-64 overflow-auto py-1"
              >
                {displayedResults.map((material, index) => (
                  <li
                    key={`${material.SKU}-${index}`}
                    id={`material-option-${index}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={`
                      cursor-pointer px-3 py-2 transition-colors
                      ${index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
                    `}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(material)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {material.Descrição}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {material.SKU}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {material.Unidade}
                          </span>
                          <Badge variant={material.Categoria === 'Interno' ? 'default' : 'outline'} className="text-xs">
                            {material.Categoria}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant={material.Qtdd_Depósito > 0 ? 'default' : 'destructive'} 
                        className="text-xs shrink-0"
                      >
                        {material.Qtdd_Depósito}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Show more button */}
              {results.length > maxResults && !showMore && (
                <div className="border-t p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowMore(true)}
                  >
                    Mostrar mais {results.length - maxResults} resultados
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {query && results.length === 0 && !loading && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg p-3">
              <div className="text-sm text-muted-foreground text-center">
                Nenhum material encontrado
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}