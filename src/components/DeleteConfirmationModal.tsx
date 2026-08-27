import React from "react";
import { AlertTriangle, Trash2, X, ShieldAlert } from "lucide-react";
import { Professional } from "../types";
import { formatPhone } from "../utils/storage";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  professional: Professional | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  professional,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen || !professional) return null;

  return (
    <div
      id="delete-confirm-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        id="delete-confirm-dialog"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="delete-modal-close-btn"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute right-4 top-4 text-[#4E6579] hover:text-[#152A3E] p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#152A3E] leading-tight">
              Confirmar Exclusão
            </h3>
            <p className="text-xs text-[#4E6579] mt-0.5">
              Esta ação é permanente e removerá o cadastro do catálogo.
            </p>
          </div>
        </div>

        {/* Item Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1.5">
          <div className="font-bold text-sm text-[#152A3E]">
            {professional.name}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[#4E6579]">
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium text-[#1C5D9B]">
              {professional.category || "Sem categoria"}
            </span>
            {professional.phone && (
              <span>Tel: {formatPhone(professional.phone)}</span>
            )}
            {professional.sponsored && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10.5px]">
                Patrocinado
              </span>
            )}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
          <AlertTriangle size={15} className="shrink-0 text-amber-600" />
          <span>
            Os dados do prestador e suas avaliações serão excluídos e sincronizados na nuvem.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            id="cancel-delete-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-[#CFDCE9] text-xs font-semibold text-[#4E6579] hover:bg-slate-50 hover:text-[#152A3E] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Sim, Excluir Cadastro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
