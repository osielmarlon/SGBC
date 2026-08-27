import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Star,
  Sparkles,
  ShieldCheck,
  Tag,
  X,
  Plus,
  UserPlus,
  Info,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Professional } from "../types";
import { HotmartFilterSidebar, FilterOptions } from "./HotmartFilterSidebar";
import { HotmartListingCard } from "./HotmartListingCard";
import { calculateRankingScore } from "../utils/searchUtils";

export type SortOption = "relevance" | "rating" | "reviews" | "recent" | "alpha";

interface HotmartCategoryViewProps {
  category: string | null;
  searchQuery: string;
  professionals: Professional[];
  categories: string[];
  isAdmin: boolean;
  onSelectCategory: (cat: string | null) => void;
  onClearSearch: () => void;
  onBackToHome: () => void;
  onEdit: (p: Professional) => void;
  onDuplicate: (p: Professional) => void;
  onDelete: (id: string) => void;
  onToggleActive: (p: Professional) => void;
  onRate: (p: Professional) => void;
  onOpenNewAd: () => void;
  onOpenIndicate: () => void;
}

export const HotmartCategoryView: React.FC<HotmartCategoryViewProps> = ({
  category,
  searchQuery,
  professionals,
  categories,
  isAdmin,
  onSelectCategory,
  onClearSearch,
  onBackToHome,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  onRate,
  onOpenNewAd,
  onOpenIndicate,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    minRating: null,
    onlyWithComments: false,
    selectedCategory: null,
    adType: "all",
    onlySpecialOffer: false,
    onlyResidentIndicated: false,
    onlyWithImage: false,
  });

  // Fast filter pills
  const [activeQuickPill, setActiveQuickPill] = useState<
    "all" | "five_star" | "reviews" | "sponsored" | "special_offer" | "resident_indicated"
  >("all");

  const handleQuickPillClick = (
    pill: "all" | "five_star" | "reviews" | "sponsored" | "special_offer" | "resident_indicated"
  ) => {
    setActiveQuickPill(pill);
    if (pill === "all") {
      setFilters({
        minRating: null,
        onlyWithComments: false,
        selectedCategory: null,
        adType: "all",
        onlySpecialOffer: false,
        onlyResidentIndicated: false,
        onlyWithImage: false,
      });
      setSortBy("relevance");
    } else if (pill === "five_star") {
      setFilters((prev) => ({ ...prev, minRating: 5.0 }));
      setSortBy("rating");
    } else if (pill === "reviews") {
      setFilters((prev) => ({ ...prev, onlyWithComments: true }));
      setSortBy("reviews");
    } else if (pill === "sponsored") {
      setFilters((prev) => ({ ...prev, adType: "sponsored" }));
    } else if (pill === "special_offer") {
      setFilters((prev) => ({ ...prev, onlySpecialOffer: true }));
    } else if (pill === "resident_indicated") {
      setFilters((prev) => ({ ...prev, onlyResidentIndicated: true }));
    }
  };

  // Helper to count active professionals by category
  const getCategoryCount = (catName: string) => {
    return professionals.filter(
      (p) =>
        (isAdmin || p.active !== false) &&
        (p.category === catName ||
          (Array.isArray(p.categories) && p.categories.includes(catName)))
    ).length;
  };

  // Filter and Sort Pipeline
  const filteredAndSortedList = useMemo(() => {
    // 1. Initial Filtering
    let list = professionals.filter((p) => {
      if (!p) return false;
      if (!isAdmin && p.active === false) return false;

      // Rating filter
      if (filters.minRating !== null) {
        const rating = typeof p.rating === "number" && !isNaN(p.rating) ? p.rating : 5.0;
        if (rating < filters.minRating) return false;
      }

      // Comments filter
      if (filters.onlyWithComments) {
        const hasComments =
          Array.isArray(p.reviews) &&
          p.reviews.some((r) => r.comment && r.comment.trim().length > 3);
        if (!hasComments) return false;
      }

      // Ad type filter
      if (filters.adType === "sponsored" && !p.sponsored) return false;
      if (
        filters.adType === "event" &&
        !(
          p.adType === "event" ||
          p.adType === "condo_event" ||
          p.adType === "external_event" ||
          (p.category && p.category.toLowerCase().includes("evento"))
        )
      ) {
        return false;
      }
      if (filters.adType === "business") {
        // Only businesses, companies or stores
        const isBiz =
          p.adType === "company" ||
          p.adType === "resident_business" ||
          p.adType === "external_business" ||
          (p.description &&
            (p.description.toLowerCase().includes("loja") ||
             p.description.toLowerCase().includes("empresa")));
        if (!isBiz && !p.sponsored) return false;
      }

      // Special Offer filter
      if (filters.onlySpecialOffer && !p.specialOffer) return false;

      // Resident Indication filter
      if (filters.onlyResidentIndicated && !p.blockReference) return false;

      // Image presence filter
      if (filters.onlyWithImage && (!p.imageUrl || p.imageUrl.trim().length < 5))
        return false;

      return true;
    });

    // 2. Sorting based on selected sortBy
    list = [...list].sort((a, b) => {
      if (sortBy === "relevance") {
        // Primary: Prioritization Score (combines ratings + comments + indication + search matching)
        const scoreB = calculateRankingScore(b, searchQuery);
        const scoreA = calculateRankingScore(a, searchQuery);
        return scoreB - scoreA;
      }

      if (sortBy === "rating") {
        const ratingB = typeof b.rating === "number" ? b.rating : 5.0;
        const ratingA = typeof a.rating === "number" ? a.rating : 5.0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }

      if (sortBy === "reviews") {
        const countB =
          typeof b.reviewCount === "number"
            ? b.reviewCount
            : Array.isArray(b.reviews)
            ? b.reviews.length
            : 0;
        const countA =
          typeof a.reviewCount === "number"
            ? a.reviewCount
            : Array.isArray(a.reviews)
            ? a.reviews.length
            : 0;
        return countB - countA;
      }

      if (sortBy === "recent") {
        // Sort by ID or number if numeric
        const idNumB = parseInt(b.id, 10) || 0;
        const idNumA = parseInt(a.id, 10) || 0;
        return idNumB - idNumA;
      }

      if (sortBy === "alpha") {
        return (a.name || "").localeCompare(b.name || "", "pt-BR", {
          sensitivity: "base",
        });
      }

      return 0;
    });

    return list;
  }, [professionals, filters, sortBy, searchQuery, isAdmin]);

  const activeFilterCount =
    (filters.minRating !== null ? 1 : 0) +
    (filters.onlyWithComments ? 1 : 0) +
    (filters.adType !== "all" ? 1 : 0) +
    (filters.onlySpecialOffer ? 1 : 0) +
    (filters.onlyResidentIndicated ? 1 : 0) +
    (filters.onlyWithImage ? 1 : 0);

  return (
    <div id="hotmart-category-view" className="w-full flex flex-col gap-5">
      {/* 1. Breadcrumb & Back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[#4E6579] font-medium">
          <button
            type="button"
            onClick={onBackToHome}
            className="hover:text-[#1C5D9B] font-semibold transition-colors cursor-pointer"
          >
            Página Inicial
          </button>
          <ChevronRight size={13} />
          <span className="text-[#152A3E] font-bold">
            {category ? category : searchQuery ? `Busca: "${searchQuery}"` : "Todos os Anúncios"}
          </span>
        </nav>

        <button
          id="hotmart-back-home-top-btn"
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CFDCE9] bg-white hover:bg-[#F8FAFC] text-[#1C5D9B] font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Voltar à Página Inicial</span>
        </button>
      </div>

      {/* 2. Page Header Bar */}
      <div className="bg-white rounded-2xl border border-[#CFDCE9] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1C5D9B] font-bold mb-1">
              <Sparkles size={14} className="text-[#AECB3E]" />
              <span>Catálogo Oficial • Condomínio Sports Garden</span>
            </div>
            <h1 className="font-['Fraunces',serif] text-2xl sm:text-3xl font-bold text-[#152A3E] leading-tight">
              {category ? (
                <>
                  Profissionais de <span className="text-[#1C5D9B]">"{category}"</span>
                </>
              ) : searchQuery ? (
                <>
                  Resultados para <span className="text-[#1C5D9B]">"{searchQuery}"</span>
                </>
              ) : (
                "Catálogo Completo de Profissionais & Serviços"
              )}
            </h1>
            <p className="text-xs sm:text-[13px] text-[#4E6579] mt-1">
              Exibindo{" "}
              <strong className="text-[#152A3E]">
                {filteredAndSortedList.length} anúncio(s)
              </strong>{" "}
              ordenados por avaliações, recomendações e relevância.
            </p>
          </div>

          {/* Action Buttons for Resident / Admin */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              id="hotmart-indicate-prof-btn"
              type="button"
              onClick={onOpenIndicate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Indicar novo prestador de serviço"
            >
              <UserPlus size={15} strokeWidth={2.4} />
              <span>Indicar Prestador</span>
            </button>

            {isAdmin && (
              <button
                id="hotmart-admin-create-ad-btn"
                type="button"
                onClick={onOpenNewAd}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.4} />
                <span>+ Criar Anúncio</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Fast Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-[#EEF3F9] no-scrollbar">
          {[
            { id: "all", label: "Todos", icon: null },
            {
              id: "five_star",
              label: "★ 5.0 Estrelas",
              icon: <Star size={12} className="fill-[#FBBC04] text-[#FBBC04]" />,
            },
            {
              id: "reviews",
              label: "💬 Com Depoimentos",
              icon: null,
            },
            {
              id: "resident_indicated",
              label: "🛡️ Indicado por Morador",
              icon: <ShieldCheck size={12} className="text-emerald-600" />,
            },
            {
              id: "sponsored",
              label: "💎 Patrocinados Oficiais",
              icon: null,
            },
            {
              id: "special_offer",
              label: "🏷️ Desconto Morador",
              icon: <Sparkles size={12} className="text-amber-500" />,
            },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => handleQuickPillClick(pill.id as any)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeQuickPill === pill.id
                  ? "bg-[#1C5D9B] text-white shadow-xs"
                  : "bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#334D6E]"
              }`}
            >
              {pill.icon}
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Controls Bar: View Mode Switcher + Sort Selector + Mobile Filter Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-[#CFDCE9] shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          {/* Mobile Filter Drawer Button */}
          <button
            id="open-mobile-filter-drawer-btn"
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF3F9] text-[#1C5D9B] font-bold border border-[#CFDCE9] cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#1C5D9B] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-[#4E6579] font-medium hidden sm:inline">
            Classificação:
          </span>

          {/* Sort Dropdown */}
          <select
            id="hotmart-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-[#F8FAFC] border border-[#CFDCE9] rounded-xl px-3 py-1.5 text-xs font-bold text-[#152A3E] focus:outline-none focus:border-[#1C5D9B] cursor-pointer"
          >
            <option value="relevance">⭐ Mais Recomendados (Avaliações & Relevância)</option>
            <option value="rating">★ Mais Bem Avaliados (Nota 5.0)</option>
            <option value="reviews">💬 Mais Comentários e Indicações</option>
            <option value="recent">🕒 Mais Recentes</option>
            <option value="alpha">🔤 Ordem Alfabética (A-Z)</option>
          </select>
        </div>

        {/* View Mode Toggle: Lista vs Grid */}
        <div className="flex items-center gap-1 bg-[#EEF3F9] p-1 rounded-xl border border-[#CFDCE9]">
          <button
            id="view-mode-list-btn"
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-white text-[#1C5D9B] shadow-2xs"
                : "text-[#4E6579] hover:text-[#152A3E]"
            }`}
            title="Visualização em Lista Detalhada"
          >
            <List size={14} />
            <span className="hidden sm:inline">Lista Detalhada</span>
          </button>
          <button
            id="view-mode-grid-btn"
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-[#1C5D9B] shadow-2xs"
                : "text-[#4E6579] hover:text-[#152A3E]"
            }`}
            title="Visualização em Grade de Cards"
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Grade</span>
          </button>
        </div>
      </div>

      {/* 5. Main 2-Column Section (Desktop Sidebar + Results Feed) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Sidebar on Desktop */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-24">
          <HotmartFilterSidebar
            categories={categories}
            activeCategory={category}
            filters={filters}
            onFilterChange={setFilters}
            onSelectCategory={onSelectCategory}
            getCategoryCount={getCategoryCount}
            totalResults={filteredAndSortedList.length}
          />
        </div>

        {/* Right Column: Listing Results */}
        <div className="flex-1 w-full min-w-0">
          {filteredAndSortedList.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-[#CFDCE9] shadow-2xs">
              <Info size={40} className="mx-auto text-[#4E6579] mb-3" />
              <h3 className="text-base font-bold text-[#152A3E]">
                Nenhum anúncio encontrado com os filtros atuais
              </h3>
              <p className="text-xs text-[#4E6579] mt-1 max-w-md mx-auto">
                Não encontramos prestadores correspondentes aos filtros selecionados.
                Tente redefinir os filtros ou buscar por outro termo.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      minRating: null,
                      onlyWithComments: false,
                      selectedCategory: null,
                      adType: "all",
                      onlySpecialOffer: false,
                      onlyResidentIndicated: false,
                      onlyWithImage: false,
                    })
                  }
                  className="px-4 py-2 bg-[#1C5D9B] text-white text-xs font-bold rounded-xl hover:bg-[#123F6B] transition-colors cursor-pointer"
                >
                  Limpar Todos os Filtros
                </button>
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="px-4 py-2 bg-[#EEF3F9] text-[#1C5D9B] text-xs font-bold rounded-xl hover:bg-[#CFDCE9] transition-colors cursor-pointer"
                >
                  Voltar à Página Inicial
                </button>
              </div>
            </div>
          ) : (
            /* Results Cards List */
            <div
              className={
                viewMode === "list"
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              }
            >
              {filteredAndSortedList.map((p) => (
                <HotmartListingCard
                  key={p.id}
                  professional={p}
                  isAdmin={isAdmin}
                  viewMode={viewMode}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onToggleActive={onToggleActive}
                  onRate={onRate}
                />
              ))}
            </div>
          )}

          {/* Back to Home Button at bottom of results */}
          <div className="mt-8 flex justify-center">
            <button
              id="hotmart-bottom-back-btn"
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#CFDCE9] text-[#1C5D9B] text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Voltar à página inicial (Ver todas as categorias)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Mobile Filter Drawer / Modal */}
      {showMobileFilters && (
        <div
          id="mobile-filter-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end lg:hidden animate-fade-in"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            id="mobile-filter-modal-content"
            className="w-full max-w-sm bg-white h-full overflow-y-auto p-4 flex flex-col gap-4 animate-slide-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F9]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#1C5D9B]" />
                <h3 className="font-['Fraunces',serif] text-lg font-semibold text-[#152A3E]">
                  Filtros de Busca
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 rounded-lg bg-[#EEF3F9] text-[#4E6579] hover:text-[#152A3E]"
              >
                <X size={18} />
              </button>
            </div>

            <HotmartFilterSidebar
              categories={categories}
              activeCategory={category}
              filters={filters}
              onFilterChange={setFilters}
              onSelectCategory={(cat) => {
                onSelectCategory(cat);
                setShowMobileFilters(false);
              }}
              getCategoryCount={getCategoryCount}
              totalResults={filteredAndSortedList.length}
            />

            <div className="sticky bottom-0 bg-white pt-3 border-t border-[#EEF3F9]">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#1C5D9B] hover:bg-[#123F6B] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Ver {filteredAndSortedList.length} Resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
