import React, { useState, useMemo } from "react";
import {
  Star,
  Tag,
  Briefcase,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Calendar,
  Award,
} from "lucide-react";

export interface FilterOptions {
  minRating: number | null; // null = all, 5, 4.5, 4
  onlyWithComments: boolean;
  selectedCategory: string | null;
  adType: "all" | "professional" | "business" | "sponsored" | "event";
  onlySpecialOffer: boolean;
  onlyResidentIndicated: boolean;
  onlyWithImage: boolean;
}

interface HotmartFilterSidebarProps {
  categories: string[];
  activeCategory: string | null;
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onSelectCategory: (cat: string | null) => void;
  getCategoryCount: (cat: string) => number;
  totalResults: number;
}

export const HotmartFilterSidebar: React.FC<HotmartFilterSidebarProps> = ({
  categories,
  activeCategory,
  filters,
  onFilterChange,
  onSelectCategory,
  getCategoryCount,
  totalResults,
}) => {
  // Accordion open/close states
  const [openSections, setOpenSections] = useState({
    rating: true,
    categories: true,
    type: true,
    differentials: true,
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    filters.minRating !== null ||
    filters.onlyWithComments ||
    filters.adType !== "all" ||
    filters.onlySpecialOffer ||
    filters.onlyResidentIndicated ||
    filters.onlyWithImage;

  const handleResetFilters = () => {
    onFilterChange({
      minRating: null,
      onlyWithComments: false,
      selectedCategory: null,
      adType: "all",
      onlySpecialOffer: false,
      onlyResidentIndicated: false,
      onlyWithImage: false,
    });
  };

  // Filter categories list by mini-search
  const filteredCategoriesList = useMemo(() => {
    let list = categories.filter((c) => typeof c === "string" && c.trim().length > 0);
    if (categorySearch.trim()) {
      const q = categorySearch.toLowerCase();
      list = list.filter((c) => c.toLowerCase().includes(q));
    }
    return list;
  }, [categories, categorySearch]);

  const displayedCategories = showAllCategories
    ? filteredCategoriesList
    : filteredCategoriesList.slice(0, 7);

  return (
    <aside
      id="hotmart-filter-sidebar"
      aria-label="Filtros de busca"
      className="w-full bg-white rounded-2xl border border-[#CFDCE9] shadow-xs p-4 sm:p-5 flex flex-col gap-5 text-[#152A3E]"
    >
      {/* Sidebar Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F9]">
        <div>
          <h3 className="font-['Fraunces',serif] text-base font-semibold text-[#152A3E]">
            Filtros
          </h3>
          <span className="text-[11px] text-[#4E6579]">
            {totalResults} resultado(s)
          </span>
        </div>

        {hasActiveFilters && (
          <button
            id="reset-sidebar-filters-btn"
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-[#1C5D9B] hover:text-rose-600 transition-colors cursor-pointer bg-[#EEF3F9] hover:bg-rose-50 px-2 py-1 rounded-lg"
            title="Limpar todos os filtros selecionados"
          >
            <RotateCcw size={11} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* SECTION 1: Avaliações ★ */}
      <div className="border-b border-[#EEF3F9] pb-4">
        <button
          type="button"
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-[#152A3E] mb-2.5 cursor-pointer select-none"
        >
          <span className="flex items-center gap-1.5 text-[#1C5D9B]">
            <Star size={14} className="fill-[#FBBC04] text-[#FBBC04]" />
            <span>Avaliações</span>
          </span>
          {openSections.rating ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSections.rating && (
          <div className="space-y-1.5 text-xs">
            {[
              { label: "Todas as notas", value: null },
              { label: "★ 5.0 Estrelas (Excelente)", value: 5.0 },
              { label: "★ 4.5 ou mais", value: 4.5 },
              { label: "★ 4.0 ou mais", value: 4.0 },
            ].map((item) => (
              <label
                key={String(item.value)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filters.minRating === item.value
                    ? "bg-[#EEF3F9] text-[#1C5D9B] font-semibold border border-[#CFDCE9]"
                    : "hover:bg-[#F8FAFC] text-[#334D6E]"
                }`}
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === item.value}
                  onChange={() =>
                    onFilterChange({ ...filters, minRating: item.value })
                  }
                  className="accent-[#1C5D9B] w-3.5 h-3.5"
                />
                <span>{item.label}</span>
              </label>
            ))}

            <div className="pt-2 border-t border-[#EEF3F9]/70 mt-2">
              <label
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filters.onlyWithComments
                    ? "bg-[#EEF3F9] text-[#1C5D9B] font-semibold"
                    : "hover:bg-[#F8FAFC] text-[#334D6E]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.onlyWithComments}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      onlyWithComments: e.target.checked,
                    })
                  }
                  className="accent-[#1C5D9B] w-3.5 h-3.5 rounded"
                />
                <span>Com depoimentos de moradores</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Categorias (Com busca e contadores) */}
      <div className="border-b border-[#EEF3F9] pb-4">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-[#152A3E] mb-2.5 cursor-pointer select-none"
        >
          <span className="flex items-center gap-1.5 text-[#152A3E]">
            <Tag size={14} className="text-[#1C5D9B]" />
            <span>Categorias</span>
          </span>
          {openSections.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSections.categories && (
          <div className="space-y-2 text-xs">
            {/* Quick Category search filter */}
            {categories.length > 6 && (
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Filtrar categorias..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-[#CFDCE9] bg-[#F8FAFC] text-xs text-[#152A3E] focus:outline-none focus:border-[#1C5D9B]"
                />
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4E6579]" />
              </div>
            )}

            {/* "Todas as Categorias" option */}
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                !activeCategory
                  ? "bg-[#1C5D9B] text-white font-bold"
                  : "hover:bg-[#F8FAFC] text-[#334D6E]"
              }`}
            >
              <span>Todas as Categorias</span>
            </button>

            {/* List of categories */}
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {displayedCategories.map((cat) => {
                const isSelected = activeCategory === cat;
                const count = getCategoryCount(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onSelectCategory(isSelected ? null : cat)}
                    className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? "bg-[#1C5D9B] text-white font-bold shadow-xs"
                        : "hover:bg-[#F8FAFC] text-[#334D6E]"
                    }`}
                  >
                    <span className="truncate pr-1">{cat}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#EEF3F9] text-[#4E6579]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredCategoriesList.length > 7 && (
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-[11px] font-bold text-[#1C5D9B] hover:underline pt-1 block cursor-pointer"
              >
                {showAllCategories
                  ? "Mostrar menos categorias"
                  : `+ Ver mais (${filteredCategoriesList.length - 7}) categorias`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: Tipo de Prestador / Anúncio */}
      <div className="border-b border-[#EEF3F9] pb-4">
        <button
          type="button"
          onClick={() => toggleSection("type")}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-[#152A3E] mb-2.5 cursor-pointer select-none"
        >
          <span className="flex items-center gap-1.5 text-[#152A3E]">
            <Briefcase size={14} className="text-[#1C5D9B]" />
            <span>Tipo de Anúncio</span>
          </span>
          {openSections.type ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSections.type && (
          <div className="space-y-1.5 text-xs">
            {[
              { label: "Todos os tipos", value: "all" },
              { label: "Profissionais Autônomos", value: "professional" },
              { label: "Empresas & Negócios", value: "business" },
              { label: "Patrocinados Oficiais", value: "sponsored" },
              { label: "Eventos do Condomínio", value: "event" },
            ].map((item) => (
              <label
                key={item.value}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filters.adType === item.value
                    ? "bg-[#EEF3F9] text-[#1C5D9B] font-semibold border border-[#CFDCE9]"
                    : "hover:bg-[#F8FAFC] text-[#334D6E]"
                }`}
              >
                <input
                  type="radio"
                  name="adType"
                  checked={filters.adType === item.value}
                  onChange={() =>
                    onFilterChange({
                      ...filters,
                      adType: item.value as FilterOptions["adType"],
                    })
                  }
                  className="accent-[#1C5D9B] w-3.5 h-3.5"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: Diferenciais & Vantagens */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("differentials")}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-[#152A3E] mb-2.5 cursor-pointer select-none"
        >
          <span className="flex items-center gap-1.5 text-[#152A3E]">
            <Sparkles size={14} className="text-[#AECB3E]" />
            <span>Diferenciais</span>
          </span>
          {openSections.differentials ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {openSections.differentials && (
          <div className="space-y-1.5 text-xs">
            <label
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filters.onlySpecialOffer
                  ? "bg-amber-50 text-amber-950 font-semibold border border-amber-200"
                  : "hover:bg-[#F8FAFC] text-[#334D6E]"
              }`}
            >
              <input
                type="checkbox"
                checked={filters.onlySpecialOffer}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    onlySpecialOffer: e.target.checked,
                  })
                }
                className="accent-amber-600 w-3.5 h-3.5 rounded"
              />
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" />
                <span>Com Oferta/Desconto Morador</span>
              </span>
            </label>

            <label
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filters.onlyResidentIndicated
                  ? "bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200"
                  : "hover:bg-[#F8FAFC] text-[#334D6E]"
              }`}
            >
              <input
                type="checkbox"
                checked={filters.onlyResidentIndicated}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    onlyResidentIndicated: e.target.checked,
                  })
                }
                className="accent-emerald-600 w-3.5 h-3.5 rounded"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Indicado por Morador</span>
              </span>
            </label>

            <label
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filters.onlyWithImage
                  ? "bg-[#EEF3F9] text-[#1C5D9B] font-semibold border border-[#CFDCE9]"
                  : "hover:bg-[#F8FAFC] text-[#334D6E]"
              }`}
            >
              <input
                type="checkbox"
                checked={filters.onlyWithImage}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    onlyWithImage: e.target.checked,
                  })
                }
                className="accent-[#1C5D9B] w-3.5 h-3.5 rounded"
              />
              <span className="flex items-center gap-1">
                <ImageIcon size={12} className="text-[#1C5D9B]" />
                <span>Com Foto / Logo</span>
              </span>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
};
