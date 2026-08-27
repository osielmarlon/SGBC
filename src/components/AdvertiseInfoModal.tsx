import React from "react";
import {
  X, Sparkles, MessageCircle, Star, Zap, Building2, PartyPopper, Briefcase
} from "lucide-react";

interface AdvertiseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenForm: () => void;
}

export const AdvertiseInfoModal: React.FC<AdvertiseInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenForm,
}) => {
  if (!isOpen) return null;

  const adminWaText = encodeURIComponent(
    "Olá Administração do Sports Garden! Gostaria de informações sobre como anunciar minha empresa / evento / serviço no carrossel de Anúncios Patrocinados do Condomínio."
  );
  const adminWaUrl = `https://wa.me/5591991891712?text=${adminWaText}`;

  return (
    <div
      id="advertise-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152A3E]/65 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="advertise-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#AECB3E]/60 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#152A3E] to-[#1C5D9B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#AECB3E] text-[#152A3E] flex items-center justify-center font-bold shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-['Fraunces',serif] text-lg font-bold">
                Anúncios Patrocinados Sports Garden
              </h2>
              <p className="text-xs text-blue-200">
                Divulgue sua empresa, evento ou serviço para toda a comunidade
              </p>
            </div>
          </div>
          <button
            id="close-advertise-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#4E6579]">
          <div className="p-4 rounded-xl bg-[#F0F7E6] border border-[#AECB3E]/40 text-[#152A3E]">
            <h3 className="font-bold text-sm text-[#152A3E] flex items-center gap-1.5 mb-1">
              <Star size={16} className="text-[#88a526] fill-[#88a526]" />
              Banner Rotativo de Alta Visibilidade
            </h3>
            <p className="text-xs leading-relaxed text-[#4E6579]">
              Os anúncios patrocinados intercalam de forma inteligente no topo do catálogo, garantindo visibilidade imediata para todas as famílias do Sports Garden.
            </p>
          </div>

          {/* Categorias de Anunciantes */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-mono uppercase font-bold text-[#152A3E] block">
              Quem pode anunciar nesta área:
            </span>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
              <div className="w-7 h-7 rounded-lg bg-[#EEF3F9] text-[#1C5D9B] flex items-center justify-center shrink-0 mt-0.5">
                <Building2 size={15} />
              </div>
              <div>
                <strong className="text-[#152A3E] block font-semibold">Empresas & Negócios</strong>
                <span>Empresas de moradores ou comércios, lojas, clínicas, consultorias e marcas em geral que desejam divulgar seus produtos e serviços.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <PartyPopper size={15} />
              </div>
              <div>
                <strong className="text-emerald-950 block font-semibold">Eventos</strong>
                <span>Feiras gastronômicas, bazares, eventos culturais, festas ou programações do condomínio e da cidade.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F0F7E6] border border-[#AECB3E]/50">
              <div className="w-7 h-7 rounded-lg bg-[#1C5D9B] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase size={15} />
              </div>
              <div>
                <strong className="text-[#152A3E] block font-semibold">Prestadores de Serviços em Destaque</strong>
                <span>Profissionais liberais e técnicos recomendados com banner personalizado e botão direto para WhatsApp.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF3F9]">
              <div className="w-7 h-7 rounded-lg bg-[#EEF3F9] text-[#1C5D9B] flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={15} />
              </div>
              <div>
                <strong className="text-[#152A3E] block font-semibold">Botão de WhatsApp Direto & Foto de Alta Resolução</strong>
                <span>O morador clica no botão e já inicia contato imediato. Banners com visual limpo e moderno.</span>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <p className="text-center text-[11px] text-[#4E6579]">
              Para contratar ou renovar um espaço patrocinado, entre em contato direto com a administração pelo WhatsApp: <strong>(91) 99189-1712</strong>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#EEF3F9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            id="admin-sponsor-wa-btn"
            href={adminWaUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#CFDCE9] hover:bg-[#EEF3F9] text-[#152A3E] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <MessageCircle size={15} className="text-[#25D366]" />
            <span>Falar com o Administrador</span>
          </a>

          <button
            id="start-sponsor-ad-btn"
            onClick={() => {
              onClose();
              onOpenForm();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] font-bold text-xs rounded-xl shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Cadastrar Novo Anúncio</span>
          </button>
        </div>
      </div>
    </div>
  );
};


