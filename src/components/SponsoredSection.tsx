import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, ChevronLeft, ChevronRight, MessageCircle, Star,
  ShieldCheck, MapPin, Calendar, Home, Building2, Pencil, Trash2,
  Files, Check, Copy, Tag, Play, Pause, ExternalLink, Eye, Info, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Professional } from "../types";
import { formatPhone } from "../utils/storage";

interface SponsoredSectionProps {
  sponsoredList: Professional[];
  isAdmin: boolean;
  onEdit: (p: Professional) => void;
  onDuplicate?: (p: Professional) => void;
  onDelete: (id: string) => void;
  onRate?: (p: Professional) => void;
  onOpenAdvertiseInfo: () => void;
  onOpenNewAd: () => void;
  onViewAdDetails?: (p: Professional) => void;
  onViewAllSponsored?: () => void;
  activeCategory?: string | null;
}

const ROTATION_INTERVAL_MS = 5000;

export const SponsoredSection: React.FC<SponsoredSectionProps> = ({
  sponsoredList,
  isAdmin,
  onEdit,
  onDuplicate,
  onDelete,
  onOpenAdvertiseInfo,
  onOpenNewAd,
  onViewAdDetails,
  onViewAllSponsored,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Guarantee only active ads are shown in rotary banner
  const activeList = React.useMemo(() => {
    return (sponsoredList || []).filter((p) => p && p.active !== false);
  }, [sponsoredList]);

  // Touch gesture coordinates
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const total = activeList.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx % total);
    temporarilyPause();
  };

  // Temporarily pause on manual action and resume after 6s
  const temporarilyPause = () => {
    setIsUserPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsUserPaused(false);
    }, 6000);
  };

  // Robust Auto-rotation that works on mobile & desktop
  useEffect(() => {
    if (total <= 1 || isUserPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, ROTATION_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [total, isUserPaused, nextSlide, currentIndex]);

  // Restart rotation when tab becomes visible again on mobile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsUserPaused(true);
      } else {
        setIsUserPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  // Ensure index is valid when list changes
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      return;
    }

    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45; // 45px swipe threshold

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swiped Left -> Next Slide
        nextSlide();
      } else {
        // Swiped Right -> Previous Slide
        prevSlide();
      }
      temporarilyPause();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
  };

  if (total === 0) {
    return (
      <section className="mb-6">
        <div className="bg-gradient-to-r from-[#123F6B] to-[#1C5D9B] rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-300 text-xs font-semibold">
              <Sparkles size={13} />
              <span>Espaço para Destaques & Patrocinados</span>
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-['Fraunces',serif]">
              Divulgue seu serviço ou empresa para os moradores
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
              Anuncie seu comércio, prestação de serviços ou evento interno do condomínio Sports Garden.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={onOpenNewAd}
                className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={15} strokeWidth={2.6} />
                <span>+ Novo Anúncio</span>
              </button>
            )}
            <button
              onClick={onOpenAdvertiseInfo}
              className="px-5 py-2.5 rounded-xl bg-[#AECB3E] hover:bg-[#9db934] text-[#152A3E] font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              Como Anunciar
            </button>
          </div>
        </div>
      </section>
    );
  }

  const currentItem = activeList[currentIndex] || activeList[0];
  const safePhone = (currentItem.phone || "").replace(/\D/g, "");
  const waUrl = safePhone
    ? `https://api.whatsapp.com/send?phone=${safePhone}&text=${encodeURIComponent(
        `Olá! Encontrei seu anúncio no Guia de Serviços do Sports Garden e gostaria de mais informações.`
      )}`
    : "#";

  const isEvent =
    currentItem.adType === "event" ||
    currentItem.adType === "condo_event" ||
    currentItem.adType === "external_event";

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!safePhone) return;
    navigator.clipboard.writeText(safePhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="sponsored-rotary-banner-section"
      className="mb-5 sm:mb-6 relative group select-none"
      onMouseEnter={() => setIsUserPaused(true)}
      onMouseLeave={() => setIsUserPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        touchStartX.current = null;
        touchEndX.current = null;
      }}
    >
      {/* Main Single-Ad Full-Width Rotary Card (OLX-style Hero Banner with Compact Mobile Height) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0D2B4A] via-[#123F6B] to-[#1C5D9B] text-white shadow-lg border-2 border-[#F59E0B] ring-1 ring-[#D97706]/40">
        
        {/* Subtle background glow effect */}
        <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-[#F59E0B]/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-60 h-60 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

        {/* Animated Progress Bar (Top) */}
        {total > 1 && !isUserPaused && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: ROTATION_INTERVAL_MS / 1000, ease: "linear" }}
              className="h-full bg-[#F59E0B]"
            />
          </div>
        )}

        {/* Slide Content with AnimatePresence - Compact Mobile OLX Structure */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentItem.id || currentIndex}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={() => onViewAdDetails && onViewAdDetails(currentItem)}
            className="relative z-10 flex flex-row items-stretch min-h-[145px] sm:min-h-[175px] md:min-h-[200px] cursor-pointer"
          >
            {/* Content Column (Left Side) */}
            <div className="flex-1 p-3 sm:p-5 md:p-6 flex flex-col justify-between min-w-0 z-10">
              <div>
                {/* Badges Bar - Compact single row */}
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  {/* Primary High-Visibility Badge */}
                  {isEvent ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[9.5px] sm:text-[10.5px] uppercase tracking-wider shadow-xs">
                      <Calendar size={10} className="text-white shrink-0" />
                      <span>Evento</span>
                    </span>
                  ) : currentItem.sponsored ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-extrabold text-[9.5px] sm:text-[10.5px] uppercase tracking-wider shadow-xs">
                      <Star size={10} className="fill-white text-white shrink-0" />
                      <span>Patrocinado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#1C5D9B] to-[#123F6B] text-white font-extrabold text-[9.5px] sm:text-[10.5px] uppercase tracking-wider shadow-xs">
                      <Sparkles size={10} className="text-[#AECB3E] shrink-0" />
                      <span>Destaque</span>
                    </span>
                  )}

                  {currentItem.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 text-slate-100 font-medium text-[9.5px] sm:text-[10.5px] truncate max-w-[130px] sm:max-w-none">
                      <Tag size={9} className="text-emerald-300 shrink-0" />
                      <span className="truncate">{currentItem.category}</span>
                    </span>
                  )}

                  {currentItem.residentUnit && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-200 font-medium text-[10.5px]">
                      <Home size={10} />
                      <span>{currentItem.residentUnit}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-lg md:text-xl font-bold font-['Fraunces',serif] text-white leading-tight mb-1 group-hover:text-[#AECB3E] transition-colors line-clamp-1">
                  {currentItem.name}
                </h3>

                {/* Short Phrase / Offer or Description (1-2 lines on mobile) */}
                {currentItem.specialOffer ? (
                  <p className="text-[11px] sm:text-xs text-emerald-300 font-semibold line-clamp-1 mb-1">
                    ★ {currentItem.specialOffer}
                  </p>
                ) : currentItem.description ? (
                  <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-1 sm:line-clamp-2 leading-relaxed mb-1">
                    {currentItem.description}
                  </p>
                ) : null}

                {/* Rating (Compact) */}
                {!isEvent && (
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-300 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-0.5 text-amber-300 font-bold">
                      <Star size={11} fill="currentColor" />
                      <span>{(currentItem.rating || 5.0).toFixed(1)}</span>
                    </div>
                    {currentItem.blockReference && (
                      <span className="hidden sm:inline text-slate-300">
                        • {currentItem.blockReference}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Bar - Compact, visible without scrolling */}
              <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                {safePhone && (
                  <a
                    id={`wa-hero-btn-${currentItem.id}`}
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-1.5 sm:py-2 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                  >
                    <MessageCircle size={13} className="shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onViewAdDetails) onViewAdDetails(currentItem);
                  }}
                  className="inline-flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs transition-all border border-white/20 active:scale-95 cursor-pointer"
                >
                  <Info size={12} />
                  <span>Saiba mais</span>
                </button>

                {safePhone && (
                  <button
                    id={`copy-phone-hero-${currentItem.id}`}
                    onClick={handleCopyPhone}
                    title={`Copiar telefone (${formatPhone(safePhone)})`}
                    aria-label="Copiar número"
                    className="hidden sm:inline-flex px-2.5 py-2 items-center justify-center gap-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copiar número</span>
                      </>
                    )}
                  </button>
                )}

                {/* Admin Quick Action Controls */}
                {isAdmin && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-0.5 bg-black/40 p-1 rounded-lg border border-white/10 ml-auto"
                  >
                    <button
                      onClick={() => onEdit(currentItem)}
                      title="Editar anúncio"
                      className="p-1 rounded hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(currentItem.id)}
                      title="Excluir anúncio"
                      className="p-1 rounded hover:bg-red-500/40 text-red-300 hover:text-red-100 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Media / Image Column (Right Side - OLX Reference Style - Enlarged +20%) */}
            <div className="w-[126px] sm:w-[186px] md:w-[264px] lg:w-[312px] shrink-0 relative bg-black/25 overflow-hidden flex items-center justify-center">
              {currentItem.imageUrl && !failedImages[currentItem.id] ? (
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.name}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => setFailedImages((prev) => ({ ...prev, [currentItem.id]: true }))}
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-tr from-[#0F3254] to-[#1C5D9B]">
                  <Building2 size={28} className="text-[#AECB3E]/60 mb-1" />
                  <span className="text-[10px] text-slate-300 font-medium line-clamp-2">
                    {currentItem.category || "Destaque"}
                  </span>
                </div>
              )}

              {/* Subtle Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D2B4A]/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows (Left / Right like OLX reference) */}
        {total > 1 && (
          <>
            <button
              id="hero-banner-prev-btn"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
                temporarilyPause();
              }}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
              aria-label="Anúncio anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              id="hero-banner-next-btn"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
                temporarilyPause();
              }}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
              aria-label="Próximo anúncio"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}

        {/* Bottom Slide Indicators (Dots/Bars like OLX) + Play/Pause button */}
        {total > 1 && (
          <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsUserPaused(!isUserPaused);
              }}
              title={isUserPaused ? "Continuar rotação automática" : "Pausar rotação"}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              {isUserPaused ? <Play size={9} fill="currentColor" /> : <Pause size={9} fill="currentColor" />}
            </button>

            <div className="flex items-center gap-1">
              {activeList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  aria-label={`Ir para anúncio ${idx + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? "w-4 bg-[#AECB3E]"
                      : "w-1 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mini info bar below banner */}
      <div className="mt-1.5 px-1 flex items-center justify-between text-[10.5px] text-[#4E6579]">
        <span className="flex items-center gap-1">
          <Sparkles size={11} className="text-[#1C5D9B]" />
          <span>
            <strong>{currentIndex + 1}</strong> de <strong>{total}</strong> patrocinados
          </span>
        </span>
        <button
          type="button"
          onClick={onOpenAdvertiseInfo}
          className="text-[#1C5D9B] hover:text-[#123F6B] font-semibold hover:underline cursor-pointer"
        >
          Quer anunciar aqui?
        </button>
      </div>
    </section>
  );
};

