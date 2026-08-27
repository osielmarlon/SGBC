import React, { useState, useMemo } from "react";
import { X, Search, LayoutGrid, ChevronRight, Check } from "lucide-react";
import { getCategoryVisual } from "./CategoryNavBar";
import { matchCategoryQuery } from "../utils/searchUtils";

interface AllCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  getCategoryCount: (category: string) => number;
  totalProfessionalsCount: number;
}

export const AllCategoriesModal: React.FC<AllCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  getCategoryCount,
  totalProfessionalsCount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    return categories.filter((cat) => matchCategoryQuery(cat, searchTerm));
  }, [categories, searchTerm]);

  if (!isOpen) return null;

  const handleSelect = (category: string | null) => {
    onSelectCategory(category);
    onClose();
    // Smooth scroll down to listings
    setTimeout(() => {
      const target = document.getElementById("active-filter-bar") || document.getElementById("professionals-list-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div
      id="all-categories-modal-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="all-categories-modal-content"
        className="bg-white text-[#152A3E] w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#CFDCE9] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#152A3E] text-white flex items-center justify-between gap-3 border-b-2 border-[#AECB3E] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#AECB3E] text-[#152A3E] flex items-center justify-center font-bold shadow-xs shrink-0">
              <LayoutGrid size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Fraunces',serif] text-white leading-tight">
                Todas as Categorias
              </h2>
              <p className="text-xs text-slate-300">
                {categories.length} categorias cadastradas no Sports Garden
              </p>
            </div>
          </div>

          <button
            id="close-all-categories-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de categorias"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Filter Bar (Flexible Search: accents, incomplete words, typos) */}
        <div className="p-3 sm:p-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1C5D9B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoria (ex: ar, eletric, pint, faxina, marc...)"
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-[#152A3E] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1C5D9B] focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid (Optimized button width: ~15% more compact for better overview) */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 overscroll-contain">
          <div className="grid grid-cols-2 min-[390px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {/* Box 1: "Todos os Anúncios" option */}
            {!searchTerm && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`group flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-center relative min-h-[105px] sm:min-h-[118px] ${
                  activeCategory === null
                    ? "bg-[#152A3E] text-white border-[#152A3E] shadow-md ring-2 ring-[#AECB3E]"
                    : "bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-[#152A3E] hover:shadow-xs"
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 shadow-xs ${
                    activeCategory === null
                      ? "bg-[#AECB3E] text-[#152A3E]"
                      : "bg-gradient-to-tr from-[#123F6B] to-[#1C5D9B] text-white"
                  }`}
                >
                  <LayoutGrid size={18} strokeWidth={2.4} />
                </div>

                <div className="flex-1 flex flex-col justify-center min-h-[32px] sm:min-h-[36px] w-full px-0.5">
                  <span className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-2">
                    Todos os Serviços
                  </span>
                </div>

                <span
                  className={`mt-1.5 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    activeCategory === null
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {totalProfessionalsCount} opções
                </span>

                {activeCategory === null && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#AECB3E] text-[#152A3E] flex items-center justify-center">
                    <Check size={9} strokeWidth={3} />
                  </span>
                )}
              </button>
            )}

            {/* Category Boxes */}
            {filteredCategories.map((cat) => {
              const count = getCategoryCount(cat);
              const isSelected = activeCategory === cat;
              const visual = getCategoryVisual(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className={`group flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-center relative min-h-[105px] sm:min-h-[118px] ${
                    isSelected
                      ? "bg-[#152A3E] text-white border-[#152A3E] shadow-md ring-2 ring-[#1C5D9B]"
                      : `${visual.bgGradient} border ${visual.borderColor} text-[#152A3E] hover:shadow-xs hover:border-[#1C5D9B]/50`
                  }`}
                >
                  {/* Category Visual Icon */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 border shadow-xs ${
                      isSelected
                        ? "bg-white text-[#1C5D9B] border-white"
                        : visual.iconBg
                    }`}
                  >
                    {visual.icon}
                  </div>

                  {/* Category Name */}
                  <div className="flex-1 flex flex-col justify-center min-h-[32px] sm:min-h-[36px] w-full px-0.5">
                    <span
                      className={`text-[10.5px] sm:text-[11.5px] font-bold leading-snug line-clamp-2 ${
                        isSelected ? "text-white" : "text-[#152A3E]"
                      }`}
                      title={cat}
                    >
                      {cat}
                    </span>
                  </div>

                  {/* Count Tag */}
                  <span
                    className={`mt-1.5 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : `${visual.tagColor} border border-black/5`
                    }`}
                  >
                    {count} {count === 1 ? "opção" : "opções"}
                  </span>

                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#1C5D9B] text-white flex items-center justify-center">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">Nenhuma categoria encontrada com "{searchTerm}".</p>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="mt-3 text-xs text-[#1C5D9B] font-bold underline cursor-pointer"
              >
                Limpar busca e ver todas
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-[#4E6579] shrink-0">
          <span>Toque para filtrar o catálogo</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-[#152A3E] font-semibold transition-colors cursor-pointer text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
