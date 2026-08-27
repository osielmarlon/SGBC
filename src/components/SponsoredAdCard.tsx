import React, { useState } from "react";
import {
  MessageCircle, Pencil, Trash2, Copy, Check, Star, ShieldCheck,
  Files, ThumbsUp, Tag, Sparkles,
  Calendar, MapPin, Building2, PartyPopper, Ticket, Home
} from "lucide-react";
import { Professional } from "../types";
import { PlantTag } from "./PlantTag";

interface SponsoredAdCardProps {
  professional: Professional;
  isAdmin: boolean;
  onEdit: (p: Professional) => void;
  onDuplicate?: (p: Professional) => void;
  onDelete: (id: string) => void;
  onRate?: (p: Professional) => void;
}

export const SponsoredAdCard: React.FC<SponsoredAdCardProps> = ({
  professional: p,
  isAdmin,
  onEdit,
  onDuplicate,
  onDelete,
  onRate,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const adType = p?.adType || "professional";
  const safeName = p?.name || "Anúncio Patrocinado";
  const safeCategory = p?.category || (adType === "condo_event" || adType === "external_event" ? "Evento" : "Destaque");
  const safePhone = p?.phone ? String(p.phone) : "";
  const phoneDigits = safePhone.replace(/\D/g, "");

  const formatPhone = (numStr: string) => {
    const clean = (numStr || "").replace(/\D/g, "");
    if (clean.length === 13 && clean.startsWith("55")) {
      return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
    }
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    return numStr || "";
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (safePhone) {
      navigator.clipboard.writeText(safePhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Build specialized contextual WhatsApp message
  let defaultGreeting = `Olá ${safeName}! Vi seu anúncio no Catálogo do condomínio Sports Garden Batista Campos.`;
  if (adType === "company" || adType === "external_business" || adType === "resident_business") {
    defaultGreeting = `Olá ${safeName}! Vi o anúncio da sua empresa no Catálogo do condomínio Sports Garden. Gostaria de conhecer seus produtos/serviços e saber mais informações!`;
  } else if (adType === "event" || adType === "condo_event" || adType === "external_event") {
    defaultGreeting = `Olá! Vi o anúncio do evento "${safeName}" no Catálogo do Sports Garden e gostaria de mais informações / tirar dúvidas.`;
  } else {
    defaultGreeting = `Olá ${safeName}! Vi seu contato no Catálogo do condomínio Sports Garden Batista Campos. Gostaria de solicitar um orçamento/atendimento.`;
  }

  const waText = encodeURIComponent(defaultGreeting);
  const waUrl = `https://wa.me/${phoneDigits}?text=${waText}`;

  const ratingValue = typeof p?.rating === "number" && !isNaN(p.rating) ? p.rating : 5.0;
  const reviewCount = typeof p?.reviewCount === "number" && !isNaN(p.reviewCount)
    ? p.reviewCount
    : (Array.isArray(p?.reviews) ? p.reviews.length : 1);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5" title={`${rating.toFixed(1)} de 5 estrelas`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = rating >= starIndex;
          const half = !filled && rating >= starIndex - 0.5;
          return (
            <Star
              key={starIndex}
              size={13}
              className={`${
                filled
                  ? "fill-[#FBBC04] text-[#FBBC04]"
                  : half
                  ? "fill-[#FBBC04]/60 text-[#FBBC04]"
                  : "text-[#CFDCE9]"
              }`}
            />
          );
        })}
      </div>
    );
  };

  // Get specialized badge configuration for this adType
  const getBadgeConfig = () => {
    switch (adType) {
      case "company":
      case "external_business":
      case "resident_business":
        return {
          label: p.badgeText || "Empresa Parceira",
          icon: Building2,
          pillClass: "bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white border-amber-300/60",
          tagTheme: "gold" as const,
          borderColor: "border-[#F59E0B] ring-[#D97706]/30",
          subBadge: "Patrocinado",
        };
      case "event":
      case "condo_event":
      case "external_event":
        return {
          label: p.badgeText || "Evento",
          icon: PartyPopper,
          pillClass: "bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white border-amber-300/60",
          tagTheme: "gold" as const,
          borderColor: "border-[#F59E0B] ring-[#D97706]/30",
          subBadge: "Patrocinado",
        };
      default:
        return {
          label: p.badgeText || "Anúncio Patrocinado",
          icon: Star,
          pillClass: "bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white border-amber-300/60",
          tagTheme: "gold" as const,
          borderColor: "border-[#F59E0B] ring-[#D97706]/30",
          subBadge: "Patrocinado",
        };
    }
  };

  const badgeConfig = getBadgeConfig();
  const hasCustomImage = Boolean(p?.imageUrl && !imgError);
  const isEvent = adType === "event" || adType === "condo_event" || adType === "external_event";


  return (
    <article
      id={`sponsored-card-${p.id}`}
      className={`group relative flex flex-col justify-between bg-white rounded-2xl overflow-hidden border-2 ${badgeConfig.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 ring-1 h-full`}
    >
      {/* Top Banner / Image Area */}
      <div className="relative w-full h-44 sm:h-48 bg-gradient-to-br from-[#152A3E] via-[#1C5D9B] to-[#123F6B] overflow-hidden shrink-0">
        {hasCustomImage ? (
          <img
            src={p.imageUrl}
            alt={`Anúncio patrocinado: ${safeName}`}
            loading="lazy"
            decoding="async"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/90">
            <PlantTag category={safeCategory} size={56} tone={badgeConfig.tagTheme} />
            <span className="font-mono text-xs uppercase tracking-widest text-[#AECB3E] font-bold mt-2">
              {safeCategory}
            </span>
          </div>
        )}

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#152A3E]/95 via-[#152A3E]/40 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
          <div className={`${badgeConfig.pillClass} font-mono text-[10px] sm:text-[10.5px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs border`}>
            <badgeConfig.icon size={12} className="shrink-0" />
            <span className="truncate">{badgeConfig.label}</span>
          </div>

          <div className="bg-[#152A3E]/85 backdrop-blur-sm border border-white/20 text-[#AECB3E] font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-xs">
            {badgeConfig.subBadge}
          </div>
        </div>

        {/* Floating Category and Special Offer at bottom of image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-end justify-between gap-2 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm text-[#152A3E] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
            <PlantTag category={safeCategory} size={18} tone="colored" />
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#1C5D9B]">
              {safeCategory}
            </span>
          </div>

          {p.specialOffer && (
            <div className="bg-[#AECB3E] text-[#152A3E] font-semibold text-[10.5px] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 max-w-[65%]">
              <Tag size={11} className="shrink-0" />
              <span className="truncate">{p.specialOffer}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <div className="flex flex-col gap-1">
            <h3 className="font-['Fraunces',serif] text-[17px] sm:text-[18px] font-bold text-[#152A3E] leading-snug">
              {safeName}
            </h3>
            {Array.isArray(p?.categories) && p.categories.filter((c) => c && c !== safeCategory).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {p.categories
                  .filter((c) => c && c !== safeCategory)
                  .slice(0, 2)
                  .map((subCat) => (
                    <span
                      key={subCat}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-[#EEF3F9] text-[#4E6579] border border-[#CFDCE9]"
                    >
                      + {subCat}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Event Specific Badge Bar: Date & Location */}
          {isEvent && (p.eventDate || p.eventLocation) && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-[#F0F7E6] border border-[#AECB3E]/50 text-xs text-[#152A3E] space-y-1">
              {p.eventDate && (
                <div className="flex items-center gap-1.5 font-bold text-[#1C5D9B]">
                  <Calendar size={13} className="text-[#1C5D9B] shrink-0" />
                  <span>{p.eventDate}</span>
                </div>
              )}
              {p.eventLocation && (
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#4E6579]">
                  <MapPin size={13} className="text-[#C1432B] shrink-0" />
                  <span>{p.eventLocation}</span>
                </div>
              )}
            </div>
          )}

          {/* Resident Business Highlight: Apartment / Tower reference */}
          {adType === "resident_business" && (p.residentUnit || p.blockReference) && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11.5px] text-amber-950 flex items-center gap-2">
              <Home size={13} className="text-amber-700 shrink-0" />
              <span className="font-semibold">
                {p.residentUnit ? `Morador: ${p.residentUnit}` : p.blockReference}
              </span>
            </div>
          )}

          {/* Rating and Reviews Info Bar (for non-event cards or cards with ratings) */}
          {!isEvent && (
            <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap bg-[#F8FAFC] border border-[#EEF3F9] px-2.5 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#152A3E] font-mono">
                  {ratingValue.toFixed(1)}
                </span>
                {renderStars(ratingValue)}
                <span className="text-[10.5px] text-[#4E6579]">
                  ({reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"})
                </span>
              </div>

              {onRate && (
                <button
                  id={`rate-sponsored-btn-${p?.id}`}
                  onClick={() => onRate(p)}
                  className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#1C5D9B] hover:text-[#123F6B] hover:bg-[#EEF3F9] px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                  title="Avaliar este destaque patrocinado"
                >
                  <ThumbsUp size={11} className="text-[#AECB3E]" />
                  <span>Avaliar</span>
                </button>
              )}
            </div>
          )}

          {/* Special Condominium Perk Alert if present */}
          {p.specialOffer && !isEvent && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-[#AECB3E]/15 border border-[#AECB3E]/40 text-[#152A3E] text-xs flex items-start gap-2">
              <Sparkles size={13} className="text-[#88a526] shrink-0 mt-0.5" />
              <div className="text-[11.5px] leading-tight">
                <strong className="font-bold text-[#152A3E]">Condição especial:</strong> {p.specialOffer}
              </div>
            </div>
          )}

          {/* Partner / Recommendation Badge if present */}
          {p.blockReference && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EEF3F9] text-[#1C5D9B] text-[10.5px] font-medium">
              <ShieldCheck size={12} className="text-[#AECB3E]" />
              <span>{p.blockReference}</span>
            </div>
          )}

          {/* Description */}
          {p.description && (
            <p className="mt-2.5 text-[13px] text-[#4E6579] leading-relaxed line-clamp-3">
              {p.description}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-[#EEF3F9] flex flex-col gap-2">
          {safePhone && (
            <div className="grid grid-cols-2 gap-2 w-full">
              <a
                id={`wa-sponsored-btn-${p?.id}`}
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-2 rounded-xl text-xs sm:text-[13px] transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <MessageCircle size={15} className="shrink-0" />
                <span className="truncate">WhatsApp</span>
              </a>

              <button
                id={`copy-phone-sponsored-${p?.id}`}
                onClick={handleCopyPhone}
                title={`Copiar telefone (${formatPhone(safePhone)})`}
                aria-label="Copiar número"
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shadow-xs active:scale-98 ${
                  copied
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold"
                    : "border-[#CFDCE9] bg-white text-[#334D6E] hover:text-[#1C5D9B] hover:border-[#1C5D9B] hover:bg-[#EEF3F9]/70"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span className="truncate">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="shrink-0 text-[#4E6579]" />
                    <span className="truncate">Copiar número</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-dashed border-[#CFDCE9]/60">
              {onDuplicate && (
                <button
                  id={`dup-sponsored-btn-${p?.id}`}
                  onClick={() => onDuplicate(p)}
                  title="Duplicar este anúncio"
                  className="flex items-center gap-1 text-[11px] text-[#4E6579] hover:text-[#1C5D9B] px-2 py-1 rounded-lg bg-[#EEF3F9] hover:bg-[#CFDCE9] font-medium transition-colors cursor-pointer"
                >
                  <Files size={11} />
                  <span>Duplicar</span>
                </button>
              )}
              <button
                id={`edit-sponsored-btn-${p?.id}`}
                onClick={() => onEdit(p)}
                className="flex items-center gap-1 text-[11px] text-[#1C5D9B] hover:text-[#123F6B] px-2 py-1 rounded-lg bg-[#EEF3F9] hover:bg-[#CFDCE9] font-medium transition-colors cursor-pointer"
              >
                <Pencil size={11} />
                <span>Editar</span>
              </button>
              <button
                id={`delete-sponsored-btn-${p?.id}`}
                onClick={() => onDelete(p.id)}
                className="flex items-center gap-1 text-[11px] text-[#C1432B] hover:text-red-700 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 font-medium transition-colors cursor-pointer"
              >
                <Trash2 size={11} />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

