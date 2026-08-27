import React, { useState } from "react";
import { MessageCircle, Pencil, Trash2, Copy, Check, Star, Sparkles, ShieldCheck, Files, ThumbsUp, MessageSquare, Eye, EyeOff } from "lucide-react";
import { Professional } from "../types";
import { PlantTag } from "./PlantTag";

interface ProfessionalCardProps {
  professional: Professional;
  isAdmin: boolean;
  onEdit: (p: Professional) => void;
  onDuplicate?: (p: Professional) => void;
  onDelete: (id: string) => void;
  onToggleActive?: (p: Professional) => void;
  onRate?: (p: Professional) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional: p,
  isAdmin,
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
    `Olá ${safeName}! Peguei seu contato no Catálogo de Serviços do condomínio Sports Garden Batista Campos. Gostaria de saber mais sobre seu trabalho.`
  );
  const waUrl = `https://wa.me/${phoneDigits}?text=${waText}`;

  const ratingValue = typeof p?.rating === "number" && !isNaN(p.rating) ? p.rating : 5.0;
  const reviewCount = typeof p?.reviewCount === "number" && !isNaN(p.reviewCount) 
    ? p.reviewCount 
    : (Array.isArray(p?.reviews) ? p.reviews.length : 1);

  // Helper to render Google-style stars
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

  return (
    <div
      id={`prof-${p?.id || Math.random()}`}
      className={`relative flex flex-col justify-between bg-white rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
        !isActive
          ? "border-2 border-dashed border-rose-300 bg-rose-50/20 opacity-80"
          : sponsored
          ? "border-2 border-[#AECB3E] ring-1 ring-[#AECB3E]/30"
          : "border border-[#CFDCE9] hover:border-[#1C5D9B]/50"
      }`}
    >
      {/* Disabled / Sponsored Ribbons */}
      <div className="absolute -top-1 right-3.5 flex items-center gap-1.5 z-10">
        {!isActive && (
          <div className="bg-rose-600 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-b-md shadow-sm flex items-center gap-1">
            <EyeOff size={10} />
            <span>Desabilitado</span>
          </div>
        )}
        {sponsored ? (
          <div className="bg-[#D97706] text-white font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-b-md shadow-sm flex items-center gap-1">
            <Star size={10} className="fill-white" />
            <span>Patrocinado</span>
          </div>
        ) : p?.featuredInBanner ? (
          <div className="bg-[#1C5D9B] text-white font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-b-md shadow-sm flex items-center gap-1">
            <Sparkles size={10} className="text-[#AECB3E]" />
            <span>Em Destaque</span>
          </div>
        ) : (
          p?.blockReference && (
            <div className="bg-[#15803D] text-white font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-b-md shadow-xs flex items-center gap-1">
              <ShieldCheck size={10} />
              <span>Indicado por Morador(a)</span>
            </div>
          )
        )}
      </div>

      {/* Header with Professional Tag Icon, Name and Category */}
      <div>
        <div className="flex items-start gap-3.5">
          <PlantTag category={safeCategory} size={46} tone={sponsored ? "gold" : "colored"} />
          <div className="min-w-0 flex-1 pr-14">
            <h3 className="font-['Fraunces',serif] text-[17px] font-semibold text-[#152A3E] leading-snug line-clamp-2">
              {safeName}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#1C5D9B] font-semibold truncate">
                {safeCategory}
              </span>
              {Array.isArray(p?.categories) &&
                p.categories
                  .filter((cat) => cat && cat !== safeCategory)
                  .slice(0, 2)
                  .map((subCat) => (
                    <span
                      key={subCat}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EEF3F9] text-[#4E6579] border border-[#CFDCE9]"
                      title={`Também atende em: ${subCat}`}
                    >
                      + {subCat}
                    </span>
                  ))}
            </div>
          </div>
        </div>

        {/* Google-style Star Rating Bar */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap bg-[#F8FAFC] border border-[#EEF3F9] px-2.5 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-[#152A3E] font-mono">
              {ratingValue.toFixed(1)}
            </span>
            {renderStars(ratingValue)}
            <span className="text-[11px] text-[#4E6579]">
              ({reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onRate && (
              <button
                id={`rate-btn-${p?.id}`}
                onClick={() => onRate(p)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1C5D9B] hover:text-[#123F6B] hover:bg-[#EEF3F9] px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                title="Registrar sua nota e grau de satisfação"
              >
                <ThumbsUp size={11} className="text-[#AECB3E]" />
                <span>Avaliar</span>
              </button>
            )}
          </div>
        </div>

        {/* Recommendation badge if present */}
        {p?.blockReference && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] font-medium shadow-xs">
            <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
            <span>{p.blockReference}</span>
          </div>
        )}

        {/* Special Offer / Diferencial Highlight */}
        {p?.specialOffer && (
          <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span className="line-clamp-2">{p.specialOffer}</span>
          </div>
        )}

        {/* Custom Banner / Flyer Image preview if available */}
        {p?.imageUrl && !imageError && (
          <div className="mt-3 overflow-hidden rounded-xl border border-[#EEF3F9] max-h-48 bg-slate-50 flex items-center justify-center">
            <img
              src={p.imageUrl}
              alt={safeName}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setImageError(true)}
              className="w-full h-auto object-cover max-h-48 hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Description */}
        {p?.description && (
          <p className="mt-3 text-[13.5px] text-[#4E6579] leading-relaxed line-clamp-3">
            {p.description}
          </p>
        )}

        {/* Recent Resident Comments Preview if any */}
        {Array.isArray(p?.reviews) && p.reviews.length > 0 && (
          <div className="mt-3">
            <button
              id={`toggle-reviews-${p.id}`}
              type="button"
              onClick={() => setShowReviewsDropdown(!showReviewsDropdown)}
              className="text-[11px] font-medium text-[#1C5D9B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare size={11} />
              <span>
                {showReviewsDropdown ? "Ocultar comentários" : `Ver comentários de moradores (${p.reviews.length})`}
              </span>
            </button>

            {showReviewsDropdown && (
              <div className="mt-2 space-y-2 max-h-36 overflow-y-auto p-2 bg-[#F8FAFC] rounded-xl border border-[#EEF3F9] text-xs">
                {p.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-[#EEF3F9] pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#152A3E]">
                        {rev.residentName || "Morador"} {rev.unit ? `(${rev.unit})` : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#FBBC04] font-bold">★ {rev.rating || 5}</span>
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-[#4E6579] text-[11px] mt-0.5 italic">"{rev.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-[#EEF3F9] flex flex-col gap-2">
        {safePhone && (
          <div className="grid grid-cols-2 gap-2 w-full">
            <a
              id={`wa-btn-${p?.id}`}
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-[13px] font-bold py-2.5 px-2 rounded-xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle size={15} className="shrink-0" />
              <span className="truncate">WhatsApp</span>
            </a>

            <button
              id={`copy-phone-${p?.id}`}
              onClick={handleCopyPhone}
              title={`Copiar telefone (${formatPhone(safePhone)})`}
              aria-label="Copiar número"
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
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
          <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1 border-t border-dashed border-[#CFDCE9]/60">
            {onToggleActive && (
              <button
                id={`toggle-active-btn-${p?.id}`}
                type="button"
                onClick={() => onToggleActive(p)}
                title={isActive ? "Desabilitar anúncio do público" : "Habilitar anúncio"}
                className={`flex items-center gap-1 text-[11.5px] px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "text-rose-700 bg-rose-50 hover:bg-rose-100"
                    : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold"
                }`}
              >
                {isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{isActive ? "Desabilitar" : "Habilitar"}</span>
              </button>
            )}
            {onDuplicate && (
              <button
                id={`dup-btn-${p?.id}`}
                onClick={() => onDuplicate(p)}
                title="Duplicar este anúncio"
                className="flex items-center gap-1 text-[11.5px] text-[#4E6579] hover:text-[#1C5D9B] px-2 py-1 rounded-lg bg-[#EEF3F9] hover:bg-[#CFDCE9] font-medium transition-colors cursor-pointer"
              >
                <Files size={12} />
                <span>Duplicar</span>
              </button>
            )}
            <button
              id={`edit-btn-${p?.id}`}
              onClick={() => onEdit(p)}
              className="flex items-center gap-1 text-[11.5px] text-[#1C5D9B] hover:text-[#123F6B] px-2 py-1 rounded-lg bg-[#EEF3F9] hover:bg-[#CFDCE9] font-medium transition-colors cursor-pointer"
            >
              <Pencil size={12} />
              <span>Editar</span>
            </button>
            <button
              id={`delete-btn-${p?.id}`}
              onClick={() => onDelete(p.id)}
              className="flex items-center gap-1 text-[11.5px] text-[#C1432B] hover:text-red-700 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 font-medium transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Excluir</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
