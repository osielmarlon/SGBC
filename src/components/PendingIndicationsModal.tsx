import React, { useState } from "react";
import { X, Check, Trash2, Edit3, ShieldCheck, User, Phone, MessageSquare, Tag, Calendar, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { PendingIndication, Professional } from "../types";

interface PendingIndicationsModalProps {
  isOpen: boolean;
  pendingIndications: PendingIndication[];
  onClose: () => void;
  onApprove: (indication: PendingIndication) => void;
  onEditAndApprove: (indication: PendingIndication) => void;
  onReject: (id: string) => void;
}

export const PendingIndicationsModal: React.FC<PendingIndicationsModalProps> = ({
  isOpen,
  pendingIndications,
  onClose,
  onApprove,
  onEditAndApprove,
  onReject,
}) => {
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div
      id="pending-indications-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152A3E]/70 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="pending-indications-modal"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#CFDCE9] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F9] bg-[#152A3E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AECB3E] text-[#152A3E] flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-['Fraunces',serif] text-base sm:text-lg font-bold text-white">
                  Validação de Indicações de Moradores
                </h3>
                <span className="bg-[#1C5D9B] text-[#AECB3E] text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                  {pendingIndications.length} {pendingIndications.length === 1 ? "pendente" : "pendentes"}
                </span>
              </div>
              <p className="text-xs text-[#CFDCE9] mt-0.5">
                Revise as sugestões enviadas pelos moradores antes de disponibilizar no catálogo geral
              </p>
            </div>
          </div>
          <button
            id="close-pending-modal-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#CFDCE9] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {pendingIndications.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center bg-[#F8FAFC] rounded-2xl border-2 border-dashed border-[#CFDCE9]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck size={28} />
              </div>
              <h4 className="font-['Fraunces',serif] text-base font-bold text-[#152A3E]">
                Fila de Validação Vazia
              </h4>
              <p className="text-xs text-[#4E6579] mt-1 max-w-md">
                Todas as indicações de profissionais enviadas pelos moradores foram moderadas e publicadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingIndications.map((ind) => {
                const isConfirmingReject = rejectConfirmId === ind.id;
                const cleanPhone = (ind.professional.phone || "").replace(/\D/g, "");
                const waUrl = cleanPhone
                  ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                      `Olá ${ind.professional.name}, entramos em contato da Administração do Condomínio Sports Garden sobre sua indicação.`
                    )}`
                  : null;

                return (
                  <div
                    key={ind.id}
                    className="bg-[#F8FAFC] border-2 border-[#CFDCE9] hover:border-[#1C5D9B]/50 rounded-2xl p-5 transition-all shadow-xs"
                  >
                    {/* Morador Header Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#EEF3F9]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1C5D9B]/10 text-[#1C5D9B] flex items-center justify-center font-bold text-xs">
                          <User size={14} />
                        </div>
                        <div className="text-xs">
                          <span className="text-[#4E6579]">Indicado por: </span>
                          <strong className="text-[#152A3E]">{ind.residentName}</strong>
                          <span className="text-[#1C5D9B] font-semibold ml-1.5 bg-white px-2 py-0.5 rounded-md border border-[#CFDCE9]">
                            {ind.residentUnit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#4E6579] font-mono">
                        <Calendar size={12} className="text-[#1C5D9B]" />
                        <span>{ind.submittedAt}</span>
                      </div>
                    </div>

                    {/* Resident Comment / Recommendation */}
                    {ind.residentComment && (
                      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 mb-3.5 text-xs text-[#152A3E] flex items-start gap-2">
                        <MessageSquare size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-900 block text-[11px] uppercase tracking-wider font-mono">
                            Depoimento do Morador:
                          </strong>
                          <p className="italic text-[#4E6579] mt-0.5">"{ind.residentComment}"</p>
                        </div>
                      </div>
                    )}

                    {/* Professional Info Content */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {ind.professional.imageUrl && (
                        <img
                          src={ind.professional.imageUrl}
                          alt={ind.professional.name}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-xl object-cover border border-[#CFDCE9] shrink-0"
                        />
                      )}

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-['Fraunces',serif] text-base font-bold text-[#152A3E]">
                            {ind.professional.name}
                          </h4>
                          {Array.isArray(ind.professional.categories) && ind.professional.categories.length > 0 ? (
                            ind.professional.categories.map((cat, catIdx) => (
                              <span
                                key={cat}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                                  catIdx === 0
                                    ? "bg-[#1C5D9B]/10 text-[#1C5D9B]"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <Tag size={11} />
                                <span>{cat}</span>
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#1C5D9B]/10 text-[#1C5D9B] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                              <Tag size={11} />
                              <span>{ind.professional.category}</span>
                            </span>
                          )}
                          {ind.professional.blockReference && (
                            <span className="text-[11px] text-[#4E6579] bg-white border border-[#CFDCE9] px-2 py-0.5 rounded-md">
                              {ind.professional.blockReference}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#4E6579] leading-relaxed">
                          {ind.professional.description}
                        </p>

                        <div className="flex items-center gap-3 pt-1 flex-wrap text-xs">
                          <span className="font-mono font-bold text-[#152A3E] flex items-center gap-1">
                            <Phone size={13} className="text-emerald-600" />
                            <span>{ind.professional.phone}</span>
                          </span>

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                            >
                              <span>Testar WhatsApp</span>
                              <ExternalLink size={10} />
                            </a>
                          )}

                          {ind.professional.specialOffer && (
                            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                              🎁 {ind.professional.specialOffer}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-4 pt-3.5 border-t border-[#EEF3F9] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isConfirmingReject ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600 font-semibold">Tem certeza?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onReject(ind.id);
                                setRejectConfirmId(null);
                              }}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Sim, Descartar
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectConfirmId(null)}
                              className="px-2 py-1 text-xs text-[#4E6579] hover:text-[#152A3E] cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRejectConfirmId(ind.id)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Descartar</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditAndApprove(ind)}
                          className="flex items-center gap-1.5 text-xs text-[#1C5D9B] hover:text-[#123F6B] bg-white hover:bg-[#EEF3F9] border border-[#CFDCE9] font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit3 size={13} />
                          <span>Editar antes de Publicar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onApprove(ind)}
                          className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Check size={14} strokeWidth={2.5} />
                          <span>Aprovar & Publicar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#EEF3F9] bg-[#F8FAFC] flex items-center justify-between">
          <span className="text-xs text-[#4E6579]">
            Profissionais aprovados são automaticamente indexados no catálogo geral com a avaliação do morador.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#152A3E] hover:bg-[#1C5D9B] text-white rounded-xl transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
