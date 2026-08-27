import React, { useRef, useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, LayoutGrid, Zap, Hammer,
  PaintBucket, Droplet, Activity, Scissors, Sparkles,
  ShieldCheck, ChefHat, Refrigerator, Blinds, Key, Snowflake,
  Star, Dog, HardHat, Droplets, Utensils,
  WashingMachine, Briefcase, Plus, X, Layers, Smile,
  PartyPopper, Flame, HeartPulse, Cake, ArrowRight,
  Globe, Laptop, Music, Frame, Truck, DraftingCompass
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, string> = {
  "Eletricista": "Zap",
  "Ar Condicionado & Split": "Snowflake",
  "Pintor": "PaintBucket",
  "Marceneiro": "Hammer",
  "Encanador": "Droplet",
  "Diarista": "Sparkles",
  "Pedreiro & Reformas": "HardHat",
  "Costureira - Atelier": "Scissors",
  "Vidraceiro": "Frame",
  "Chaveiro 24h": "Key",
  "Personal Trainer": "Activity",
  "Geladeira - Manutenção": "Refrigerator",
  "Máquina de Lavar roupa - Manutenção": "WashingMachine",
  "Fogão -  Manutenção": "Flame",
  "Fogão - Gás - Manutenção": "Flame",
  "Cortinas e Persianas": "Blinds",
  "Pet Sitter": "Dog",
  "Pets - Banho, Tosa, Sitter": "Dog",
  "Música - Professor(a)": "Music",
  "Odontologia - Dentista": "Smile",
  "Redes de Proteção": "ShieldCheck",
  "Reboque de Veículos": "Truck",
  "Arquiteto": "DraftingCompass",
  "Limpeza de Estofados": "Sparkles",
  "Web & Marketing Digital": "Globe",
  "Tecnologia & Informática": "Laptop",
  "Eventos & Lazer": "PartyPopper",
  "Água Mineral": "Droplets",
  "Açaí": "Utensils",
};

interface CategoryNavBarProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  professionalsCount: number;
  getCategoryCount: (category: string) => number;
  onManageCategories?: () => void;
  onOpenAllCategories?: () => void;
  isAdmin?: boolean;
  onOpenSponsoredPage?: () => void;
  sponsoredCount?: number;
  isSponsoredPageActive?: boolean;
}

// Visual style definitions for each category type
export interface CategoryVisual {
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  tagColor: string;
}

export const getCategoryVisual = (categoryName: string): CategoryVisual => {
  const iconName = CATEGORY_ICON_MAP[categoryName] || "Star";
  const nameLower = categoryName.toLowerCase();

  if (nameLower.includes("eletric") || iconName === "Zap") {
    return {
      icon: <Zap size={22} className="text-amber-500 fill-amber-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-amber-50/90 hover:bg-amber-100/90",
      borderColor: "border-amber-300 hover:border-amber-400",
      iconBg: "bg-amber-100 border-amber-200",
      iconColor: "text-amber-700",
      tagColor: "bg-amber-200/80 text-amber-900",
    };
  }

  if (nameLower.includes("ar condicionado") || nameLower.includes("split") || iconName === "Snowflake") {
    return {
      icon: <Snowflake size={22} className="text-cyan-600 fill-cyan-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-cyan-50/90 hover:bg-cyan-100/90",
      borderColor: "border-cyan-300 hover:border-cyan-400",
      iconBg: "bg-cyan-100 border-cyan-200",
      iconColor: "text-cyan-700",
      tagColor: "bg-cyan-200/80 text-cyan-900",
    };
  }

  if (nameLower.includes("pintor") || nameLower.includes("pintura") || iconName === "PaintBucket") {
    return {
      icon: <PaintBucket size={22} className="text-indigo-600 fill-indigo-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-indigo-50/90 hover:bg-indigo-100/90",
      borderColor: "border-indigo-300 hover:border-indigo-400",
      iconBg: "bg-indigo-100 border-indigo-200",
      iconColor: "text-indigo-700",
      tagColor: "bg-indigo-200/80 text-indigo-900",
    };
  }

  if (nameLower.includes("marceneiro") || nameLower.includes("marcenaria") || iconName === "Hammer") {
    return {
      icon: <Hammer size={22} className="text-orange-600 fill-orange-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-orange-50/90 hover:bg-orange-100/90",
      borderColor: "border-orange-300 hover:border-orange-400",
      iconBg: "bg-orange-100 border-orange-200",
      iconColor: "text-orange-700",
      tagColor: "bg-orange-200/80 text-orange-900",
    };
  }

  if (nameLower.includes("encanador") || nameLower.includes("hidr") || iconName === "Droplet" || iconName === "Droplets") {
    return {
      icon: <Droplet size={22} className="text-blue-600 fill-blue-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-blue-50/90 hover:bg-blue-100/90",
      borderColor: "border-blue-300 hover:border-blue-400",
      iconBg: "bg-blue-100 border-blue-200",
      iconColor: "text-blue-700",
      tagColor: "bg-blue-200/80 text-blue-900",
    };
  }

  if (nameLower.includes("diarista") || nameLower.includes("limpeza") || nameLower.includes("faxina") || iconName === "Sparkles") {
    return {
      icon: <Sparkles size={22} className="text-emerald-600 fill-emerald-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-emerald-50/90 hover:bg-emerald-100/90",
      borderColor: "border-emerald-300 hover:border-emerald-400",
      iconBg: "bg-emerald-100 border-emerald-200",
      iconColor: "text-emerald-700",
      tagColor: "bg-emerald-200/80 text-emerald-900",
    };
  }

  if (nameLower.includes("pedreiro") || nameLower.includes("reforma") || iconName === "HardHat") {
    return {
      icon: <HardHat size={22} className="text-amber-600 fill-amber-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-amber-50/90 hover:bg-amber-100/90",
      borderColor: "border-amber-300 hover:border-amber-400",
      iconBg: "bg-amber-100 border-amber-200",
      iconColor: "text-amber-700",
      tagColor: "bg-amber-200/80 text-amber-900",
    };
  }

  if (nameLower.includes("costura") || nameLower.includes("atelier") || nameLower.includes("costureira") || iconName === "Scissors") {
    return {
      icon: <Scissors size={22} className="text-pink-600 fill-pink-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-pink-50/90 hover:bg-pink-100/90",
      borderColor: "border-pink-300 hover:border-pink-400",
      iconBg: "bg-pink-100 border-pink-200",
      iconColor: "text-pink-700",
      tagColor: "bg-pink-200/80 text-pink-900",
    };
  }

  if (nameLower.includes("geladeira") || nameLower.includes("refrigera") || iconName === "Refrigerator") {
    return {
      icon: <Refrigerator size={22} className="text-teal-600 fill-teal-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-teal-50/90 hover:bg-teal-100/90",
      borderColor: "border-teal-300 hover:border-teal-400",
      iconBg: "bg-teal-100 border-teal-200",
      iconColor: "text-teal-700",
      tagColor: "bg-teal-200/80 text-teal-900",
    };
  }

  if (nameLower.includes("lavar") || nameLower.includes("lavadora") || iconName === "WashingMachine") {
    return {
      icon: <WashingMachine size={22} className="text-cyan-600 fill-cyan-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-cyan-50/90 hover:bg-cyan-100/90",
      borderColor: "border-cyan-300 hover:border-cyan-400",
      iconBg: "bg-cyan-100 border-cyan-200",
      iconColor: "text-cyan-700",
      tagColor: "bg-cyan-200/80 text-cyan-900",
    };
  }

  if (nameLower.includes("chaveiro") || nameLower.includes("fechadura") || iconName === "Key") {
    return {
      icon: <Key size={22} className="text-yellow-600 fill-yellow-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-yellow-50/90 hover:bg-yellow-100/90",
      borderColor: "border-yellow-300 hover:border-yellow-400",
      iconBg: "bg-yellow-100 border-yellow-200",
      iconColor: "text-yellow-800",
      tagColor: "bg-yellow-200/80 text-yellow-950",
    };
  }

  if (nameLower.includes("persiana") || nameLower.includes("cortina") || iconName === "Blinds") {
    return {
      icon: <Blinds size={22} className="text-purple-600 fill-purple-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-purple-50/90 hover:bg-purple-100/90",
      borderColor: "border-purple-300 hover:border-purple-400",
      iconBg: "bg-purple-100 border-purple-200",
      iconColor: "text-purple-700",
      tagColor: "bg-purple-200/80 text-purple-900",
    };
  }

  if (nameLower.includes("proteção") || nameLower.includes("segurança") || iconName === "ShieldCheck") {
    return {
      icon: <ShieldCheck size={22} className="text-emerald-700 fill-emerald-500/20" strokeWidth={2.4} />,
      bgGradient: "bg-emerald-50/90 hover:bg-emerald-100/90",
      borderColor: "border-emerald-300 hover:border-emerald-400",
      iconBg: "bg-emerald-100 border-emerald-200",
      iconColor: "text-emerald-800",
      tagColor: "bg-emerald-200/80 text-emerald-950",
    };
  }

  if (nameLower.includes("arquiteto") || nameLower.includes("arquitetura") || nameLower.includes("projeto") || iconName === "DraftingCompass" || iconName === "Compass") {
    return {
      icon: <DraftingCompass size={22} className="text-violet-600 fill-violet-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-violet-50/90 hover:bg-violet-100/90",
      borderColor: "border-violet-300 hover:border-violet-400",
      iconBg: "bg-violet-100 border-violet-200",
      iconColor: "text-violet-700",
      tagColor: "bg-violet-200/80 text-violet-900",
    };
  }

  if (nameLower.includes("música") || nameLower.includes("musica") || nameLower.includes("musical") || nameLower.includes("violão") || nameLower.includes("violao") || nameLower.includes("piano") || nameLower.includes("canto") || iconName === "Music") {
    return {
      icon: <Music size={22} className="text-purple-600 fill-purple-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-purple-50/90 hover:bg-purple-100/90",
      borderColor: "border-purple-300 hover:border-purple-400",
      iconBg: "bg-purple-100 border-purple-200",
      iconColor: "text-purple-700",
      tagColor: "bg-purple-200/80 text-purple-900",
    };
  }

  if (nameLower.includes("vidraceiro") || nameLower.includes("vidraçaria") || nameLower.includes("vidracaria") || nameLower.includes("vidro") || nameLower.includes("espelho") || nameLower.includes("box") || nameLower.includes("blindex") || iconName === "Frame") {
    return {
      icon: <Frame size={22} className="text-sky-600 fill-sky-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-sky-50/90 hover:bg-sky-100/90",
      borderColor: "border-sky-300 hover:border-sky-400",
      iconBg: "bg-sky-100 border-sky-200",
      iconColor: "text-sky-700",
      tagColor: "bg-sky-200/80 text-sky-900",
    };
  }

  if (nameLower.includes("reboque") || nameLower.includes("guincho") || nameLower.includes("socorro") || nameLower.includes("auto socorro") || iconName === "Truck") {
    return {
      icon: <Truck size={22} className="text-amber-600 fill-amber-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-amber-50/90 hover:bg-amber-100/90",
      borderColor: "border-amber-300 hover:border-amber-400",
      iconBg: "bg-amber-100 border-amber-200",
      iconColor: "text-amber-700",
      tagColor: "bg-amber-200/80 text-amber-900",
    };
  }

  if (nameLower.includes("trainer") || nameLower.includes("personal") || iconName === "Activity") {
    return {
      icon: <Activity size={22} className="text-green-600 fill-green-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-green-50/90 hover:bg-green-100/90",
      borderColor: "border-green-300 hover:border-green-400",
      iconBg: "bg-green-100 border-green-200",
      iconColor: "text-green-700",
      tagColor: "bg-green-200/80 text-green-900",
    };
  }

  if (nameLower.includes("pet") || nameLower.includes("animal") || iconName === "Dog") {
    return {
      icon: <Dog size={22} className="text-amber-700 fill-amber-500/20" strokeWidth={2.4} />,
      bgGradient: "bg-amber-50/90 hover:bg-amber-100/90",
      borderColor: "border-amber-300 hover:border-amber-400",
      iconBg: "bg-amber-100 border-amber-200",
      iconColor: "text-amber-800",
      tagColor: "bg-amber-200/80 text-amber-950",
    };
  }

  if (nameLower.includes("açaí") || nameLower.includes("acai")) {
    return {
      icon: <Utensils size={22} className="text-purple-700 fill-purple-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-purple-50/90 hover:bg-purple-100/90",
      borderColor: "border-purple-300 hover:border-purple-400",
      iconBg: "bg-purple-100 border-purple-200",
      iconColor: "text-purple-800",
      tagColor: "bg-purple-200/80 text-purple-950",
    };
  }

  if (nameLower.includes("marmita") || nameLower.includes("refeição") || nameLower.includes("alimento") || nameLower.includes("confeitaria") || iconName === "ChefHat" || iconName === "Utensils" || iconName === "Cake") {
    return {
      icon: <ChefHat size={22} className="text-rose-600 fill-rose-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-rose-50/90 hover:bg-rose-100/90",
      borderColor: "border-rose-300 hover:border-rose-400",
      iconBg: "bg-rose-100 border-rose-200",
      iconColor: "text-rose-700",
      tagColor: "bg-rose-200/80 text-rose-900",
    };
  }

  if (nameLower.includes("odonto") || nameLower.includes("dentis") || iconName === "Smile") {
    return {
      icon: <Smile size={22} className="text-sky-600 fill-sky-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-sky-50/90 hover:bg-sky-100/90",
      borderColor: "border-sky-300 hover:border-sky-400",
      iconBg: "bg-sky-100 border-sky-200",
      iconColor: "text-sky-700",
      tagColor: "bg-sky-200/80 text-sky-900",
    };
  }

  if (nameLower.includes("evento") || nameLower.includes("lazer") || nameLower.includes("festa") || iconName === "PartyPopper") {
    return {
      icon: <PartyPopper size={22} className="text-fuchsia-600 fill-fuchsia-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-fuchsia-50/90 hover:bg-fuchsia-100/90",
      borderColor: "border-fuchsia-300 hover:border-fuchsia-400",
      iconBg: "bg-fuchsia-100 border-fuchsia-200",
      iconColor: "text-fuchsia-700",
      tagColor: "bg-fuchsia-200/80 text-fuchsia-900",
    };
  }

  if (nameLower.includes("fogão") || nameLower.includes("fogao") || iconName === "Flame") {
    return {
      icon: <Flame size={22} className="text-red-600 fill-red-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-red-50/90 hover:bg-red-100/90",
      borderColor: "border-red-300 hover:border-red-400",
      iconBg: "bg-red-100 border-red-200",
      iconColor: "text-red-700",
      tagColor: "bg-red-200/80 text-red-900",
    };
  }

  if (nameLower.includes("água") || nameLower.includes("agua") || nameLower.includes("mineral") || iconName === "Droplets") {
    return {
      icon: <Droplets size={22} className="text-cyan-600 fill-cyan-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-cyan-50/90 hover:bg-cyan-100/90",
      borderColor: "border-cyan-300 hover:border-cyan-400",
      iconBg: "bg-cyan-100 border-cyan-200",
      iconColor: "text-cyan-700",
      tagColor: "bg-cyan-200/80 text-cyan-900",
    };
  }

  if (nameLower.includes("saúde") || nameLower.includes("saude") || nameLower.includes("médic") || iconName === "HeartPulse") {
    return {
      icon: <HeartPulse size={22} className="text-rose-600 fill-rose-400/20" strokeWidth={2.4} />,
      bgGradient: "bg-rose-50/90 hover:bg-rose-100/90",
      borderColor: "border-rose-300 hover:border-rose-400",
      iconBg: "bg-rose-100 border-rose-200",
      iconColor: "text-rose-700",
      tagColor: "bg-rose-200/80 text-rose-900",
    };
  }

  if (nameLower.includes("web") || nameLower.includes("site") || nameLower.includes("marketing") || nameLower.includes("tecnologia") || nameLower.includes("informática") || nameLower.includes("informatic") || nameLower.includes("celular") || iconName === "Globe" || iconName === "Laptop") {
    return {
      icon: iconName === "Laptop" ? (
        <Laptop size={22} className="text-cyan-600 fill-cyan-400/20" strokeWidth={2.4} />
      ) : (
        <Globe size={22} className="text-blue-600 fill-blue-400/20" strokeWidth={2.4} />
      ),
      bgGradient: "bg-cyan-50/90 hover:bg-cyan-100/90",
      borderColor: "border-cyan-300 hover:border-cyan-400",
      iconBg: "bg-cyan-100 border-cyan-200",
      iconColor: "text-cyan-700",
      tagColor: "bg-cyan-200/80 text-cyan-950",
    };
  }

  // Default Fallback Visual
  return {
    icon: <Briefcase size={22} className="text-[#1C5D9B] fill-[#1C5D9B]/20" strokeWidth={2.4} />,
    bgGradient: "bg-blue-50/90 hover:bg-blue-100/90",
    borderColor: "border-blue-300 hover:border-blue-400",
    iconBg: "bg-blue-100 border-blue-200",
    iconColor: "text-[#152A3E]",
    tagColor: "bg-blue-200/80 text-blue-900",
  };
};

export const CategoryNavBar: React.FC<CategoryNavBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  professionalsCount,
  getCategoryCount,
  onManageCategories,
  onOpenAllCategories,
  isAdmin = false,
  onOpenSponsoredPage,
  sponsoredCount,
  isSponsoredPageActive = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  };

  useEffect(() => {
    checkScrollState();
    const ref = scrollContainerRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScrollState);
      window.addEventListener("resize", checkScrollState);
    }
    return () => {
      if (ref) ref.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollState, 280);
    }
  };

  return (
    <section
      id="category-navigation-section"
      aria-label="Menu de Categorias e Especialidades"
      className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-[#CFDCE9] mb-6 relative"
    >
      {/* Top Header of Category Section */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#1C5D9B]/10 text-[#1C5D9B] flex items-center justify-center font-bold shrink-0">
            <Layers size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-[#152A3E] font-['Fraunces',serif] tracking-tight">
                Categorias & Especialidades
              </h2>
              <span className="text-[10px] font-mono text-[#8DA2B5] hidden sm:inline">
                ({categories.length} opções)
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#4E6579] line-clamp-1">
              Toque em uma categoria para filtrar profissionais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Interactive "Ver Todas / Categorias" Button (OLX reference style) */}
          {onOpenAllCategories && (
            <button
              id="open-all-categories-btn"
              type="button"
              onClick={onOpenAllCategories}
              className="flex items-center gap-1 text-[11px] sm:text-xs text-[#1C5D9B] hover:text-[#123F6B] font-bold bg-[#1C5D9B]/10 hover:bg-[#1C5D9B]/20 active:bg-[#1C5D9B]/30 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Abrir grade com todas as categorias"
            >
              <LayoutGrid size={13} strokeWidth={2.4} />
              <span>Ver todas ({categories.length})</span>
              <ChevronRight size={13} />
            </button>
          )}

          {/* Quick Mobile Scroll Mini Buttons */}
          <div className="flex sm:hidden items-center gap-0.5">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-6 h-6 rounded-md flex items-center justify-center border text-xs transition-colors ${
                canScrollLeft
                  ? "bg-slate-100 text-[#152A3E] border-slate-300 active:bg-slate-200"
                  : "bg-slate-50 text-slate-300 border-slate-200 opacity-40 cursor-not-allowed"
              }`}
              aria-label="Rolar categorias para a esquerda"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-6 h-6 rounded-md flex items-center justify-center border text-xs transition-colors ${
                canScrollRight
                  ? "bg-[#1C5D9B] text-white border-[#1C5D9B] active:bg-[#123F6B]"
                  : "bg-slate-50 text-slate-300 border-slate-200 opacity-40 cursor-not-allowed"
              }`}
              aria-label="Rolar categorias para a direita"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {activeCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#152A3E] text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer"
            >
              <X size={12} />
              <span>Ver Tudo</span>
            </button>
          )}

          {isAdmin && onManageCategories && (
            <button
              onClick={onManageCategories}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF3F9] hover:bg-[#CFDCE9] text-[#1C5D9B] text-xs font-bold transition-colors cursor-pointer"
              title="Gerenciar lista de categorias"
            >
              <Plus size={13} />
              <span>Gerenciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Category Scroll Container with Edge Fades */}
      <div className="relative flex items-center">
        
        {/* Left Arrow button (Desktop) */}
        <button
          onClick={() => scroll("left")}
          className={`hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-300 items-center justify-center text-[#152A3E] hover:bg-[#152A3E] hover:text-white hover:border-[#152A3E] transition-all cursor-pointer ${
            !canScrollLeft ? "opacity-30 pointer-events-none" : ""
          }`}
          title="Rolar categorias para a esquerda"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Left Fade Gradient on Mobile */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10 sm:hidden" />
        )}

        {/* Horizontal Scrollable Row (Optimized compact cards so multiple fit nicely without clipping) */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-2 sm:gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-none scroll-smooth w-full no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Option: "Tudo" / Todos os Serviços */}
          <button
            id="cat-item-all"
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`group flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl sm:rounded-2xl w-[76px] min-w-[76px] max-w-[86px] sm:w-[86px] sm:min-w-[86px] sm:max-w-[98px] md:w-[94px] md:min-w-[94px] md:max-w-[106px] min-h-[105px] sm:min-h-[118px] transition-all duration-200 shrink-0 cursor-pointer text-center relative ${
              activeCategory === null
                ? "bg-[#152A3E] text-white shadow-md ring-2 ring-[#AECB3E] scale-[1.02]"
                : "bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-[#152A3E] hover:shadow-xs"
            }`}
          >
            {/* Icon Bubble */}
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 mb-1 ${
                activeCategory === null
                  ? "bg-[#AECB3E] text-[#152A3E]"
                  : "bg-gradient-to-tr from-[#123F6B] to-[#1C5D9B] text-white shadow-xs"
              }`}
            >
              <LayoutGrid size={18} strokeWidth={2.4} />
            </div>

            {/* Label */}
            <div className="min-h-[34px] sm:min-h-[38px] flex items-center justify-center px-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2">
                Todos
              </span>
            </div>

            {/* Count Badge */}
            <span
              className={`mt-auto text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                activeCategory === null
                  ? "bg-white/20 text-slate-100"
                  : "bg-slate-200 text-slate-800"
              }`}
            >
              {professionalsCount} {professionalsCount === 1 ? "opção" : "opções"}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            const isSelected = activeCategory === cat;
            const visual = getCategoryVisual(cat);

            return (
              <button
                key={cat}
                id={`cat-item-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                type="button"
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                className={`group flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl sm:rounded-2xl w-[76px] min-w-[76px] max-w-[86px] sm:w-[86px] sm:min-w-[86px] sm:max-w-[98px] md:w-[94px] md:min-w-[94px] md:max-w-[106px] min-h-[105px] sm:min-h-[118px] transition-all duration-200 shrink-0 cursor-pointer text-center relative ${
                  isSelected
                    ? "bg-[#152A3E] text-white shadow-md ring-2 ring-[#1C5D9B] scale-[1.02]"
                    : `${visual.bgGradient} border ${visual.borderColor} text-[#152A3E] hover:shadow-xs`
                }`}
              >
                {/* Colorful Icon Bubble */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 mb-1 border ${
                    isSelected
                      ? "bg-white text-[#1C5D9B] border-white shadow-xs"
                      : `${visual.iconBg}`
                  }`}
                >
                  {visual.icon}
                </div>

                {/* Category Name Label with Full Vertical Clearance */}
                <div className="min-h-[34px] sm:min-h-[38px] flex items-center justify-center px-0.5 w-full">
                  <span
                    className={`text-[9.5px] sm:text-[10.5px] font-bold leading-snug line-clamp-3 text-center break-words ${
                      isSelected ? "text-white" : "text-[#152A3E]"
                    }`}
                    title={cat}
                  >
                    {cat}
                  </span>
                </div>

                {/* Count Badge */}
                <span
                  className={`mt-auto text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                    isSelected
                      ? "bg-white/20 text-slate-100"
                      : `${visual.tagColor} border border-black/5`
                  }`}
                >
                  {count} {count === 1 ? "opção" : "opções"}
                </span>
              </button>
            );
          })}

          {/* Final Action Card: "Ver Todas as Categorias" (OLX reference style) */}
          {onOpenAllCategories && (
            <button
              id="cat-item-view-all-modal"
              type="button"
              onClick={onOpenAllCategories}
              className="group flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl sm:rounded-2xl w-[76px] min-w-[76px] max-w-[86px] sm:w-[86px] sm:min-w-[86px] sm:max-w-[98px] md:w-[94px] md:min-w-[94px] md:max-w-[106px] min-h-[105px] sm:min-h-[118px] bg-[#EEF3F9] hover:bg-[#CFDCE9]/80 border-2 border-dashed border-[#1C5D9B]/40 hover:border-[#1C5D9B] text-[#1C5D9B] transition-all duration-200 shrink-0 cursor-pointer text-center relative shadow-2xs hover:scale-[1.02]"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 mb-1 bg-[#1C5D9B] text-white">
                <LayoutGrid size={18} strokeWidth={2.4} />
              </div>

              <div className="min-h-[34px] sm:min-h-[38px] flex items-center justify-center px-0.5 w-full">
                <span className="text-[10px] sm:text-[11px] font-bold leading-tight text-[#152A3E]">
                  Ver Todas
                </span>
              </div>

              <span className="mt-auto text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap bg-[#1C5D9B]/10 text-[#1C5D9B]">
                +{categories.length}
              </span>
            </button>
          )}
        </div>

        {/* Right Fade Gradient on Mobile */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 sm:hidden" />
        )}

        {/* Right Arrow button (Desktop) */}
        <button
          onClick={() => scroll("right")}
          className={`hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-300 items-center justify-center text-[#152A3E] hover:bg-[#152A3E] hover:text-white hover:border-[#152A3E] transition-all cursor-pointer ${
            !canScrollRight ? "opacity-30 pointer-events-none" : ""
          }`}
          title="Rolar categorias para a direita"
          aria-label="Rolar para direita"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
};
