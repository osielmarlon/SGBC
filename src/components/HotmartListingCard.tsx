import React, { useState } from "react";
import {
  MessageCircle,
  Pencil,
  Trash2,
  Copy,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  Files,
  ThumbsUp,
  MessageSquare,
  Eye,
  EyeOff,
  Tag,
  Award,
} from "lucide-react";
import { Professional } from "../types";
import { PlantTag } from "./PlantTag";

interface HotmartListingCardProps {
  professional: Professional;
  isAdmin: boolean;
  viewMode?: "list" | "grid";
  onEdit: (p: Professional) => void;
  onDuplicate?: (p: Professional) => void;
  onDelete: (id: string) => void;
  onToggleActive?: (p: Professional) => void;
  onRate?: (p: Professional) => void;
}

export const HotmartListingCard: React.FC<HotmartListingCardProps> = ({
  professional: p,
  isAdmin,
  viewMode = "list",
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  onRate,
}) => {
  const [copied, setCopied] = useState(false);
  const [showReviewsDropdown, setShowReviewsDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isActive = p?.active !== false;
  const sponsored = Boolean(p?.sponsored);
  const safeName = p?.name || "Profissional";
  const safeCategory = p?.category || "Outros";
  const safePhone = p?.phone ? String(p.phone) : "";

  // Format phone for display
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

  const phoneDigits = safePhone.replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Olá ${safeName}! Encontrei seu anúncio no Catálogo de Serviços do condomínio Sports Garden Batista Campos. Gostaria de um orçamento/informações.`
  );
  const waUrl = `https://wa.me/${phoneDigits}?text=${waText}`;

  const ratingValue = typeof p?.rating === "number" && !isNaN(p.rating) ? p.rating : 5.0;
  const reviewCount =
    typeof p?.reviewCount === "number" && !isNaN(p.reviewCount)
      ? p.reviewCount
      : Array.isArray(p?.reviews)
      ? p.reviews.length
      : 1;

  // Star rendering
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

  // -------------------------------------------------------------
  // LIST VIEW MODE (HOTMART STYLE HORIZONTAL CARD)
  // -------------------------------------------------------------
  if (viewMode === "list") {
    return (
      <article
        id={`hotmart-prof-${p?.id || Math.random()}`}
        className={`relative flex flex-col md:flex-row items-stretch justify-between bg-white rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md border ${
          !isActive
            ? "border-dashed border-rose-300 bg-rose-50/20 opacity-80"
            : sponsored
            ? "border-[#AECB3E] ring-1 ring-[#AECB3E]/30 bg-gradient-to-r from-amber-50/20 via-white to-white"
            : "border-[#CFDCE9] hover:border-[#1C5D9B]/50"
        } gap-4 sm:gap-6`}
      >
        {/* Left Column: Visual Icon / Thumbnail */}
        <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center gap-3 shrink-0 md:w-28">
          <div className="relative">
            {p?.imageUrl && !imageError ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#EEF3F9] bg-slate-50 shadow-2xs">
                <img
                  src={p.imageUrl}
                  alt={safeName}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <PlantTag category={safeCategory} size={64} tone={sponsored ? "gold" : "colored"} />
            )}

            {!isActive && (
              <span className="absolute -top-2 -left-2 bg-rose-600 text-white text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                <EyeOff size={9} /> Desabilitado
              </span>
            )}
          </div>
        </div>

        {/* Center Column: Professional Info, Ratings, Description & Badges */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {sponsored && (
                <span className="inline-flex items-center gap-1 bg-[#D97706] text-white text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded shadow-2xs">
                  <Star size={10} className="fill-white" />
                  <span>Patrocinado Oficial</span>
                </span>
              )}
              {p?.featuredInBanner && !sponsored && (
                <span className="inline-flex items-center gap-1 bg-[#1C5D9B] text-white text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded shadow-2xs">
                  <Sparkles size={10} className="text-[#AECB3E]" />
                  <span>Em Destaque</span>
                </span>
              )}
              {p?.blockReference && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10.5px] font-semibold px-2 py-0.5 rounded">
                  <ShieldCheck size={11} className="text-emerald-700" />
                  <span>{p.blockReference}</span>
                </span>
              )}
            </div>

            {/* Title / Name */}
            <h3 className="font-['Fraunces',serif] text-lg sm:text-xl font-semibold text-[#152A3E] leading-snug">
              {safeName}
            </h3>

            {/* Category and Subcategories */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#1C5D9B] font-bold">
                <Tag size={12} />
                <span>{safeCategory}</span>
              </span>

              {Array.isArray(p?.categories) &&
                p.categories
                  .filter((cat) => cat && cat !== safeCategory)
                  .map((subCat) => (
                    <span
                      key={subCat}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#EEF3F9] text-[#4E6579] border border-[#CFDCE9]"
                    >
                      + {subCat}
                    </span>
                  ))}
            </div>

            {/* Rating Bar */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#EEF3F9] px-2 py-0.5 rounded-lg">
                <span className="font-bold text-xs text-[#152A3E] font-mono">
                  {ratingValue.toFixed(1)}
                </span>
                {renderStars(ratingValue)}
                <span className="text-[11px] text-[#4E6579]">
                  ({reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"})
                </span>
              </div>

              {onRate && (
                <button
                  type="button"
                  onClick={() => onRate(p)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1C5D9B] hover:text-[#123F6B] hover:bg-[#EEF3F9] px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  <ThumbsUp size={11} className="text-[#AECB3E]" />
                  <span>Avaliar</span>
                </button>
              )}
            </div>

            {/* Special Offer Banner */}
            {p?.specialOffer && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                <Sparkles size={13} className="text-amber-600 shrink-0" />
                <span>{p.specialOffer}</span>
              </div>
            )}

            {/* Description */}
            {p?.description && (
              <p className="mt-2 text-xs sm:text-[13px] text-[#4E6579] leading-relaxed line-clamp-2">
                {p.description}
              </p>
            )}

            {/* Reviews Collapsible */}
            {Array.isArray(p?.reviews) && p.reviews.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewsDropdown(!showReviewsDropdown)}
                  className="text-[11px] font-medium text-[#1C5D9B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare size={11} />
                  <span>
                    {showReviewsDropdown
                      ? "Ocultar comentários"
                      : `Ver depoimentos de moradores (${p.reviews.length})`}
                  </span>
                </button>

                {showReviewsDropdown && (
                  <div className="mt-1.5 space-y-1.5 max-h-32 overflow-y-auto p-2.5 bg-[#F8FAFC] rounded-xl border border-[#EEF3F9] text-xs">
                    {p.reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-[#EEF3F9] pb-1 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#152A3E]">
                            {rev.residentName || "Morador"} {rev.unit ? `(${rev.unit})` : ""}
                          </span>
                          <span className="text-[#FBBC04] font-bold">★ {rev.rating || 5}</span>
                        </div>
                        {rev.comment && (
                          <p className="text-[#4E6579] text-[11px] italic">"{rev.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions (WhatsApp, Copy Number, Admin Controls) */}
        <div className="flex flex-col justify-between items-end shrink-0 md:w-48 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[#EEF3F9] md:pl-5 gap-3">
          <div className="w-full space-y-2">
            {safePhone && (
              <>
                <a
                  id={`hotmart-wa-${p.id}`}
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-[13px] font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>Chamar no WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className={`flex items-center justify-center gap-1.5 w-full py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    copied
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold"
                      : "border-[#CFDCE9] bg-[#F8FAFC] text-[#334D6E] hover:bg-[#EEF3F9]"
                  }`}
                  title={formatPhone(safePhone)}
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-[#4E6579]" />
                      <span className="truncate">{formatPhone(safePhone)}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex flex-wrap items-center justify-end gap-1 pt-2 w-full border-t border-dashed border-[#CFDCE9]/60">
              {onToggleActive && (
                <button
                  type="button"
                  onClick={() => onToggleActive(p)}
                  title={isActive ? "Desabilitar anúncio" : "Habilitar anúncio"}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "text-rose-700 bg-rose-50 hover:bg-rose-100"
                      : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  {isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              )}
              {onDuplicate && (
                <button
                  type="button"
                  onClick={() => onDuplicate(p)}
                  title="Duplicar este anúncio"
                  className="p-1.5 text-[#4E6579] hover:text-[#1C5D9B] rounded-lg bg-[#EEF3F9] hover:bg-[#CFDCE9] transition-colors cursor-pointer"
                >
                  <Files size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onEdit(p)}
                title="Editar dados do anúncio"
                className="p-1.5 text-[#1C5D9B] hover:text-[#123F6B] rounded-lg bg-[#EEF3F9] hover:bg-[#CFDCE9] transition-colors cursor-pointer"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                title="Excluir anúncio"
                className="p-1.5 text-[#C1432B] hover:text-red-700 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }

  // -------------------------------------------------------------
  // GRID VIEW MODE (HOTMART STYLE VERTICAL CARD)
  // -------------------------------------------------------------
  return (
    <article
      id={`hotmart-grid-prof-${p?.id || Math.random()}`}
      className={`relative flex flex-col justify-between bg-white rounded-2xl p-5 transition-all duration-200 shadow-xs hover:shadow-md border ${
        !isActive
          ? "border-2 border-dashed border-rose-300 bg-rose-50/20 opacity-80"
          : sponsored
          ? "border-2 border-[#AECB3E] ring-1 ring-[#AECB3E]/30"
          : "border-[#CFDCE9] hover:border-[#1C5D9B]/50"
      }`}
    >
      {/* Top badges bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#1C5D9B] font-bold block truncate">
          {safeCategory}
        </span>

        <div className="flex items-center gap-1">
          {!isActive && (
            <span className="bg-rose-600 text-white font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <EyeOff size={9} /> Desabilitado
            </span>
          )}
          {sponsored ? (
            <span className="bg-[#D97706] text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs">
              <Star size={10} className="fill-white" />
              <span>Patrocinado</span>
            </span>
          ) : p?.featuredInBanner ? (
            <span className="bg-[#1C5D9B] text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs">
              <Sparkles size={10} className="text-[#AECB3E]" />
              <span>Destaque</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Header with PlantTag and Name */}
      <div>
        <div className="flex items-start gap-3">
          <PlantTag category={safeCategory} size={44} tone={sponsored ? "gold" : "colored"} />
          <div className="min-w-0 flex-1">
            <h3 className="font-['Fraunces',serif] text-base font-semibold text-[#152A3E] leading-snug line-clamp-2">
              {safeName}
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#1C5D9B] font-bold block mt-0.5 truncate">
              {safeCategory}
            </span>
          </div>
        </div>

        {/* Rating Bar */}
        <div className="mt-3 flex items-center justify-between gap-1.5 bg-[#F8FAFC] border border-[#EEF3F9] px-2.5 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-[#152A3E] font-mono">
              {ratingValue.toFixed(1)}
            </span>
            {renderStars(ratingValue)}
            <span className="text-[10.5px] text-[#4E6579]">
              ({reviewCount})
            </span>
          </div>

          {onRate && (
            <button
              type="button"
              onClick={() => onRate(p)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1C5D9B] hover:text-[#123F6B] hover:bg-[#EEF3F9] px-1.5 py-0.5 rounded cursor-pointer"
            >
              <ThumbsUp size={11} className="text-[#AECB3E]" />
              <span>Avaliar</span>
            </button>
          )}
        </div>

        {/* Morador indication */}
        {p?.blockReference && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
            <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
            <span className="truncate">{p.blockReference}</span>
          </div>
        )}

        {/* Special Offer */}
        {p?.specialOffer && (
          <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11.5px] font-semibold">
            <Sparkles size={12} className="text-amber-600 shrink-0" />
            <span className="line-clamp-1">{p.specialOffer}</span>
          </div>
        )}

        {/* Description */}
        {p?.description && (
          <p className="mt-2.5 text-xs text-[#4E6579] leading-relaxed line-clamp-3">
            {p.description}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-[#EEF3F9] flex flex-col gap-2">
        {safePhone && (
          <div className="grid grid-cols-2 gap-2 w-full">
            <a
              id={`hotmart-grid-wa-${p.id}`}
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2 px-2 rounded-xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleCopyPhone}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                copied
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold"
                  : "border-[#CFDCE9] bg-white text-[#334D6E] hover:bg-[#EEF3F9]"
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copiado" : "Número"}</span>
            </button>
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex flex-wrap items-center justify-end gap-1 pt-1.5 border-t border-dashed border-[#CFDCE9]/60">
            {onToggleActive && (
              <button
                type="button"
                onClick={() => onToggleActive(p)}
                className={`p-1.5 rounded-lg text-xs ${
                  isActive ? "text-rose-700 bg-rose-50" : "text-emerald-700 bg-emerald-50"
                }`}
              >
                {isActive ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            )}
            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(p)}
                className="p-1.5 text-[#4E6579] rounded-lg bg-[#EEF3F9]"
              >
                <Files size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(p)}
              className="p-1.5 text-[#1C5D9B] rounded-lg bg-[#EEF3F9]"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              className="p-1.5 text-[#C1432B] rounded-lg bg-red-50"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
