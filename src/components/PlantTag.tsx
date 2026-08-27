import React from "react";
import {
  DraftingCompass, Scissors, Zap, Hammer, HardHat,
  Dumbbell, Paintbrush, ShieldCheck, Wrench, Sparkles,
  Utensils, Dog, Fan, Refrigerator, Leaf, BadgeCheck,
  Star, Key, Activity, HeartPulse, UserCheck, Layers,
  Droplet, Droplets, Snowflake, ChefHat, Truck, Shirt,
  Blinds, Wind, Flame, Monitor, WashingMachine, Music,
  Frame, Brush, Compass
} from "lucide-react";

export interface CategoryTheme {
  icon: React.ElementType;
  bgGradient: string; // Tailwind gradient or bg
  textColor: string;
  borderColor: string;
  lightBg: string;
  badgeColor: string;
}

// Dedicated colors and distinct symbols for each service professional
export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "Água Mineral": {
    icon: Droplets,
    bgGradient: "bg-gradient-to-br from-cyan-400 to-blue-600",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    lightBg: "bg-cyan-50",
    badgeColor: "bg-cyan-100 text-cyan-800",
  },
  "Entregador de Água": {
    icon: Droplets,
    bgGradient: "bg-gradient-to-br from-cyan-400 to-blue-600",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    lightBg: "bg-cyan-50",
    badgeColor: "bg-cyan-100 text-cyan-800",
  },
  "Açaí": {
    icon: Utensils,
    bgGradient: "bg-gradient-to-br from-purple-700 to-indigo-950",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    lightBg: "bg-purple-50",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  "Arquiteto": {
    icon: DraftingCompass,
    bgGradient: "bg-gradient-to-br from-violet-600 to-indigo-800",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    lightBg: "bg-violet-50",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  "Arquitetura": {
    icon: DraftingCompass,
    bgGradient: "bg-gradient-to-br from-violet-600 to-indigo-800",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    lightBg: "bg-violet-50",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  "Música": {
    icon: Music,
    bgGradient: "bg-gradient-to-br from-purple-600 to-fuchsia-700",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    lightBg: "bg-purple-50",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  "Música - Professor(a)": {
    icon: Music,
    bgGradient: "bg-gradient-to-br from-purple-600 to-fuchsia-700",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    lightBg: "bg-purple-50",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  "Vidraceiro": {
    icon: Frame,
    bgGradient: "bg-gradient-to-br from-sky-400 to-cyan-600",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
    lightBg: "bg-sky-50",
    badgeColor: "bg-sky-100 text-sky-800",
  },
  "Vidraçaria": {
    icon: Frame,
    bgGradient: "bg-gradient-to-br from-sky-400 to-cyan-600",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
    lightBg: "bg-sky-50",
    badgeColor: "bg-sky-100 text-sky-800",
  },
  "Reboque": {
    icon: Truck,
    bgGradient: "bg-gradient-to-br from-amber-500 to-orange-700",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-900",
  },
  "Reboque de Veículos": {
    icon: Truck,
    bgGradient: "bg-gradient-to-br from-amber-500 to-orange-700",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-900",
  },
  "Costureira - Atelier": {
    icon: Scissors,
    bgGradient: "bg-gradient-to-br from-pink-500 to-rose-600",
    textColor: "text-pink-600",
    borderColor: "border-pink-200",
    lightBg: "bg-pink-50",
    badgeColor: "bg-pink-100 text-pink-700",
  },
  "Cortinas e Persianas": {
    icon: Blinds,
    bgGradient: "bg-gradient-to-br from-amber-600 to-yellow-800",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  "Diarista": {
    icon: Sparkles,
    bgGradient: "bg-gradient-to-br from-teal-400 to-emerald-600",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    lightBg: "bg-teal-50",
    badgeColor: "bg-teal-100 text-teal-800",
  },
  "Limpeza de Estofados": {
    icon: Sparkles,
    bgGradient: "bg-gradient-to-br from-teal-400 to-emerald-600",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    lightBg: "bg-teal-50",
    badgeColor: "bg-teal-100 text-teal-800",
  },
  "Limpeza e Diarista": {
    icon: Sparkles,
    bgGradient: "bg-gradient-to-br from-teal-400 to-emerald-600",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    lightBg: "bg-teal-50",
    badgeColor: "bg-teal-100 text-teal-800",
  },
  "Limpeza & Diarista": {
    icon: Sparkles,
    bgGradient: "bg-gradient-to-br from-teal-400 to-emerald-600",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    lightBg: "bg-teal-50",
    badgeColor: "bg-teal-100 text-teal-800",
  },
  "Eletricista": {
    icon: Zap,
    bgGradient: "bg-gradient-to-br from-amber-400 to-amber-600",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  "Encanador": {
    icon: Droplet,
    bgGradient: "bg-gradient-to-br from-blue-500 to-cyan-700",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    lightBg: "bg-blue-50",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  "Marceneiro": {
    icon: Hammer,
    bgGradient: "bg-gradient-to-br from-amber-700 to-orange-800",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
    lightBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-900",
  },
  "Máquina de Lavar roupa - Manutenção": {
    icon: WashingMachine,
    bgGradient: "bg-gradient-to-br from-blue-500 to-indigo-700",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    lightBg: "bg-blue-50",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  "Máquina de Lavar": {
    icon: WashingMachine,
    bgGradient: "bg-gradient-to-br from-blue-500 to-indigo-700",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    lightBg: "bg-blue-50",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  "Pedreiro & Reformas": {
    icon: HardHat,
    bgGradient: "bg-gradient-to-br from-orange-500 to-amber-600",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    lightBg: "bg-orange-50",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  "Personal Trainer": {
    icon: Dumbbell,
    bgGradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    lightBg: "bg-emerald-50",
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  "Pet Sitter": {
    icon: Dog,
    bgGradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  "Pintor": {
    icon: Paintbrush,
    bgGradient: "bg-gradient-to-br from-violet-500 to-purple-600",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    lightBg: "bg-violet-50",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  "Redes de Proteção": {
    icon: ShieldCheck,
    bgGradient: "bg-gradient-to-br from-sky-500 to-blue-600",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
    lightBg: "bg-sky-50",
    badgeColor: "bg-sky-100 text-sky-800",
  },
  "Refeições / Marmitas": {
    icon: ChefHat,
    bgGradient: "bg-gradient-to-br from-rose-500 to-orange-600",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    lightBg: "bg-rose-50",
    badgeColor: "bg-rose-100 text-rose-800",
  },
  "Técnico de Geladeira e Lavadora": {
    icon: Refrigerator,
    bgGradient: "bg-gradient-to-br from-sky-500 to-blue-700",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
    lightBg: "bg-sky-50",
    badgeColor: "bg-sky-100 text-sky-800",
  },
  "Chaveiro": {
    icon: Key,
    bgGradient: "bg-gradient-to-br from-yellow-500 to-amber-700",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  "Chaveiro 24h": {
    icon: Key,
    bgGradient: "bg-gradient-to-br from-yellow-500 to-amber-700",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  "Ar Condicionado & Split": {
    icon: Snowflake,
    bgGradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    lightBg: "bg-cyan-50",
    badgeColor: "bg-cyan-100 text-cyan-800",
  },
  "Outros": {
    icon: Sparkles,
    bgGradient: "bg-gradient-to-br from-teal-500 to-emerald-600",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    lightBg: "bg-teal-50",
    badgeColor: "bg-teal-100 text-teal-800",
  }
};

export function getCategoryTheme(category?: string): CategoryTheme {
  const cat = (category || "Outros").trim();
  if (CATEGORY_THEMES[cat]) return CATEGORY_THEMES[cat];

  // Smart normalized fallback matching
  const normalized = cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    normalized.includes("lavar") ||
    normalized.includes("lavadora") ||
    normalized.includes("maquina") ||
    normalized.includes("lava e seca") ||
    normalized.includes("roupa") ||
    normalized.includes("eletrodomestico")
  ) {
    return CATEGORY_THEMES["Máquina de Lavar roupa - Manutenção"];
  }

  if (
    normalized.includes("persiana") ||
    normalized.includes("cortina") ||
    normalized.includes("toldos")
  ) {
    return CATEGORY_THEMES["Cortinas e Persianas"];
  }

  if (
    normalized.includes("ar condicionado") ||
    normalized.includes("split") ||
    normalized.includes("climatiz") ||
    normalized.includes("refriger")
  ) {
    return CATEGORY_THEMES["Ar Condicionado & Split"];
  }

  if (normalized.includes("agua") || normalized.includes("mineral") || normalized.includes("hidro") || normalized.includes("galpao")) {
    return CATEGORY_THEMES["Água Mineral"];
  }
  if (normalized.includes("acai")) {
    return CATEGORY_THEMES["Açaí"];
  }
  if (normalized.includes("arquiteto") || normalized.includes("arquitetura") || normalized.includes("planta") || normalized.includes("projeto")) {
    return CATEGORY_THEMES["Arquiteto"];
  }
  if (normalized.includes("costur") || normalized.includes("atelier") || normalized.includes("alfaiate")) {
    return CATEGORY_THEMES["Costureira - Atelier"];
  }
  if (normalized.includes("eletric")) {
    return CATEGORY_THEMES["Eletricista"];
  }
  if (normalized.includes("marcen") || normalized.includes("moveis") || normalized.includes("madeira")) {
    return CATEGORY_THEMES["Marceneiro"];
  }
  if (normalized.includes("pedreiro") || normalized.includes("reforma") || normalized.includes("alvenaria") || normalized.includes("obra")) {
    return CATEGORY_THEMES["Pedreiro & Reformas"];
  }
  if (normalized.includes("personal") || normalized.includes("treino") || normalized.includes("fitness") || normalized.includes("academia")) {
    return CATEGORY_THEMES["Personal Trainer"];
  }
  if (normalized.includes("pinto") || normalized.includes("tinta")) {
    return CATEGORY_THEMES["Pintor"];
  }
  if (normalized.includes("rede") || normalized.includes("tela") || normalized.includes("protecao")) {
    return CATEGORY_THEMES["Redes de Proteção"];
  }
  if (
    normalized.includes("geladeira") ||
    normalized.includes("fogao") ||
    normalized.includes("freezer")
  ) {
    return CATEGORY_THEMES["Técnico de Geladeira e Lavadora"];
  }
  if (normalized.includes("encanad") || normalized.includes("desentup") || normalized.includes("hidraul") || normalized.includes("vazamento")) {
    return CATEGORY_THEMES["Encanador"];
  }
  if (normalized.includes("musica") || normalized.includes("musical") || normalized.includes("violao") || normalized.includes("piano") || normalized.includes("canto") || normalized.includes("guitarra")) {
    return CATEGORY_THEMES["Música"];
  }
  if (normalized.includes("vidrac") || normalized.includes("vidro") || normalized.includes("espelho") || normalized.includes("box") || normalized.includes("blindex") || normalized.includes("esquadria")) {
    return CATEGORY_THEMES["Vidraceiro"];
  }
  if (normalized.includes("reboqu") || normalized.includes("guinch") || normalized.includes("socorro") || normalized.includes("auto socorro")) {
    return CATEGORY_THEMES["Reboque"];
  }
  if (normalized.includes("diarist") || normalized.includes("limpeza") || normalized.includes("faxin") || normalized.includes("passad")) {
    return CATEGORY_THEMES["Diarista"];
  }
  if (normalized.includes("pet") || normalized.includes("cao") || normalized.includes("cachorro") || normalized.includes("gato") || normalized.includes("veterin")) {
    return CATEGORY_THEMES["Pet Sitter"];
  }
  if (normalized.includes("chave")) {
    return CATEGORY_THEMES["Chaveiro"];
  }
  if (normalized.includes("marmita") || normalized.includes("refeic") || normalized.includes("comida") || normalized.includes("restaurante") || normalized.includes("culinaria")) {
    return CATEGORY_THEMES["Refeições / Marmitas"];
  }

  // Fallback themed by string hash to ensure stable, cheerful colors
  const themes = Object.values(CATEGORY_THEMES);
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash += cat.charCodeAt(i);
  }
  return themes[hash % themes.length] || CATEGORY_THEMES["Outros"];
}

interface PlantTagProps {
  category?: string;
  size?: number;
  tone?: "primary" | "gold" | "secondary" | "colored";
}

export const PlantTag: React.FC<PlantTagProps> = ({
  category = "Outros",
  size = 46,
  tone = "colored"
}) => {
  const theme = getCategoryTheme(category);
  const Icon = theme?.icon || Sparkles;

  const bgStyle =
    tone === "gold"
      ? "bg-gradient-to-br from-[#AECB3E] to-[#8fa82b] text-[#152A3E] shadow-sm"
      : tone === "primary"
      ? "bg-gradient-to-br from-[#1C5D9B] to-[#123F6B] text-white shadow-sm"
      : `${theme?.bgGradient || "bg-teal-600"} text-white shadow-md`;

  return (
    <div
      style={{
        width: size,
        height: size + 8,
        borderRadius: "14px 14px 6px 6px",
      }}
      className={`relative flex items-center justify-center shrink-0 transition-transform ${bgStyle}`}
    >
      {/* Condominium tag rivet hole style */}
      <div
        style={{
          width: Math.max(5, size * 0.16),
          height: Math.max(5, size * 0.16),
          top: Math.max(4, size * 0.12),
        }}
        className="absolute rounded-full bg-white/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] backdrop-blur-xs"
      />
      <div style={{ marginTop: Math.max(4, size * 0.14) }}>
        <Icon size={size * 0.46} strokeWidth={2.4} className="drop-shadow-xs" />
      </div>
    </div>
  );
};
