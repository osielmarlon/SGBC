import React from "react";
import {
  X, MessageCircle, Copy, Check, Star, ShieldCheck,
  Calendar, MapPin, Tag, Home, Sparkles, Building2, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Professional } from "../types";
import { formatPhone } from "../utils/storage";

interface SponsoredAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: Professional | null;
}

export const SponsoredAdModal: React.FC<SponsoredAdModalProps> = ({
  isOpen,
  onClose,
  ad,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  if (!isOpen || !ad) return null;

  const safePhone = (ad.phone || "").replace(/\D/g, "");
  const waUrl = safePhone
    ? `https://api.whatsapp.com/send?phone=${safePhone}&text=${encodeURIComponent(
        `Olá! Vi o seu anúncio "${ad.name}" no Guia Fácil do Sports Garden e gostaria de mais informações.`
      )}`
    : "#";

  const isEvent =
    ad.adType === "event" ||
    ad.adType === "condo_event" ||
    ad.adType === "external_event";

  const handleCopyPhone = () => {
    if (!safePhone) return;
    navigator.clipboard.writeText(safePhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ad-modal-title"
        >
          {/* Header with image or banner backdrop */}
          <div className="relative bg-gradient-to-r from-[#0D2B4A] via-[#123F6B] to-[#1C5D9B] text-white p-5 sm:p-6 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fechar anúncio"
            >
              <X size={18} />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-2 pr-8">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#AECB3E] text-[#152A3E] font-bold text-xs uppercase tracking-wide shadow-xs">
                <Sparkles size={13} />
                <span>{ad.badgeText || (isEvent ? "Evento" : "Anúncio Patrocinado")}</span>
              </span>

              {ad.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-xs text-white text-xs font-medium">
                  <Tag size={11} className="text-emerald-300" />
                  <span>{ad.category}</span>
                </span>
              )}

              {ad.residentUnit && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-200 text-xs font-medium">
                  <Home size={11} />
                  <span>Morador: {ad.residentUnit}</span>
                </span>
              )}
            </div>

            <h2 id="ad-modal-title" className="text-xl sm:text-2xl md:text-3xl font-bold font-['Fraunces',serif] text-white leading-tight">
              {ad.name}
            </h2>

            {/* Special perk highlight */}
            {ad.specialOffer && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 text-emerald-300 text-xs sm:text-sm font-semibold">
                <span className="text-[#AECB3E] font-bold">★ Condição Especial:</span>
                <span className="text-white">{ad.specialOffer}</span>
              </div>
            )}
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-[#152A3E]">
            {/* Full Image Display if Available */}
            {ad.imageUrl && !imgError && (
              <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 max-h-[320px] flex items-center justify-center">
                <img
                  src={ad.imageUrl}
                  alt={ad.name}
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                  onError={() => setImgError(true)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[320px]"
                />
              </div>
            )}

            {/* Event Specific Info */}
            {isEvent && (ad.eventDate || ad.eventLocation) && (
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {ad.eventDate && (
                  <span className="flex items-center gap-1.5 font-bold text-[#1C5D9B]">
                    <Calendar size={16} />
                    <span>Data: {ad.eventDate}</span>
                  </span>
                )}
                {ad.eventLocation && (
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <MapPin size={16} className="text-red-500" />
                    <span>Local: {ad.eventLocation}</span>
                  </span>
                )}
              </div>
            )}

            {/* Rating / Endorsement for Professionals */}
            {!isEvent && (
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={16} fill="currentColor" />
                  <span>{(ad.rating || 5.0).toFixed(1)}</span>
                  <span className="text-slate-500 font-normal">
                    ({ad.reviewCount || (ad.reviews?.length || 1)} avaliações)
                  </span>
                </div>
                {ad.blockReference && (
                  <span className="flex items-center gap-1 text-[#4E6579]">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <span>Indicado por: {ad.blockReference}</span>
                  </span>
                )}
              </div>
            )}

            {/* Full Description Section */}
            <div>
              <h4 className="text-xs font-bold text-[#8DA2B5] uppercase tracking-wider mb-2">
                Descrição Completa do Anúncio
              </h4>
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {ad.description || "Nenhuma descrição detalhada informada."}
              </div>
            </div>

            {/* Website & Instagram links if available */}
            {(ad.website || ad.instagram) && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {ad.instagram && (
                  <a
                    href={`https://instagram.com/${ad.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-semibold bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl border border-pink-200 transition-colors"
                  >
                    <span>Instagram: @{ad.instagram.replace(/^@/, "")}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {ad.website && (
                  <a
                    href={ad.website.startsWith("http") ? ad.website : `https://${ad.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
                  >
                    <span>Acessar Site Oficial</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-[#152A3E] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Fechar
            </button>

            <div className="flex items-center gap-2">
              {safePhone && (
                <>
                  <button
                    onClick={handleCopyPhone}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-[#152A3E] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={15} className="text-emerald-600" />
                        <span className="text-emerald-700">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        <span>Copiar Telefone</span>
                      </>
                    )}
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <MessageCircle size={17} />
                    <span>WhatsApp</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
