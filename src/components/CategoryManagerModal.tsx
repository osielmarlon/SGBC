import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Tag,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Pencil,
  Cloud,
  Loader2,
} from "lucide-react";
import { PlantTag } from "./PlantTag";
import { Professional } from "../types";

interface CategoryManagerModalProps {
  categories: string[];
  professionals?: Professional[];
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (cat: string) => void;
  onRemoveCategory?: (cat: string) => void;
  onDeleteCategory?: (cat: string) => void;
  onUpdateCategory?: (oldName: string, newName: string) => void;
  onExportData?: () => void;
  onImportData?: (file: File) => void;
  onResetToDefault?: () => void;
  onRestoreSeed?: () => void;
  onSyncLocalHistory?: () => Promise<{
    success: boolean;
    message: string;
    count?: number;
    catCount?: number;
  }> | void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  categories,
  professionals = [],
  isOpen,
  onClose,
  onAddCategory,
  onRemoveCategory,
  onDeleteCategory,
  onUpdateCategory,
  onExportData,
  onImportData,
  onResetToDefault,
  onRestoreSeed,
  onSyncLocalHistory,
}) => {
  const [newCat, setNewCat] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [categoryToDelete, setCategoryToDelete] = useState<{ name: string; count: number } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Cloud Sync state & feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    timestamp: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTriggerSync = async () => {
    if (!onSyncLocalHistory || isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const result = await onSyncLocalHistory();
      const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      if (result && typeof result === "object") {
        if (result.success) {
          setSyncFeedback({
            type: "success",
            title: "Sincronização realizada com sucesso!",
            message: result.message || "Todos os dados foram recuperados e gravados com sucesso no banco de dados em nuvem.",
            timestamp: now,
          });
        } else {
          setSyncFeedback({
            type: "error",
            title: "Falha na sincronização",
            message: result.message || "Não foi possível conectar com o servidor em nuvem. Tente novamente.",
            timestamp: now,
          });
        }
      } else {
        setSyncFeedback({
          type: "success",
          title: "Sincronização realizada com sucesso!",
          message: "Os dados deste navegador foram mesclados e sincronizados com a nuvem.",
          timestamp: now,
        });
      }
    } catch (err: any) {
      const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setSyncFeedback({
        type: "error",
        title: "Erro ao sincronizar",
        message: err?.message || "Ocorreu um erro inesperado ao conectar com a nuvem.",
        timestamp: now,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const catName = categoryToDelete.name;
    setCategoryToDelete(null);
    if (onDeleteCategory) {
      onDeleteCategory(catName);
    } else if (onRemoveCategory) {
      onRemoveCategory(catName);
    }
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    if (onRestoreSeed) {
      onRestoreSeed();
    } else if (onResetToDefault) {
      onResetToDefault();
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    onAddCategory(newCat.trim());
    setNewCat("");
  };

  const handleStartEdit = (cat: string) => {
    setCategoryToDelete(null);
    setEditingCategory(cat);
    setEditValue(cat);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
    setEditError(null);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCategory) return;

    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditError("O nome da categoria não pode ficar vazio.");
      return;
    }

    if (
      trimmed.toLowerCase() !== editingCategory.toLowerCase() &&
      categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      setEditError(`A categoria "${trimmed}" já existe.`);
      return;
    }

    if (onUpdateCategory && trimmed !== editingCategory) {
      onUpdateCategory(editingCategory, trimmed);
    }

    setEditingCategory(null);
    setEditValue("");
    setEditError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportData) {
      onImportData(file);
      setFileInputKey(Date.now());
    }
  };

  return (
    <div
      id="category-manager-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152A3E]/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="category-manager-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-[#CFDCE9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F9] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[#1C5D9B]" />
            <h3 className="font-['Fraunces',serif] text-base font-bold text-[#152A3E]">
              Gerenciar Categorias & Backup
            </h3>
          </div>
          <button
            id="close-cat-modal-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4E6579] hover:bg-[#EEF3F9] hover:text-[#152A3E] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Inline Delete Category Confirmation Banner */}
          {categoryToDelete && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-950 flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={20} className="text-[#C1432B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#C1432B]">
                    Excluir categoria "{categoryToDelete.name}"?
                  </h4>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    {categoryToDelete.count > 0 ? (
                      <>
                        Esta categoria possui <strong>{categoryToDelete.count} prestador(es)</strong>. Eles serão transferidos automaticamente para a categoria <strong>"Outros"</strong>.
                      </>
                    ) : (
                      "Esta categoria não possui prestadores cadastrados e será removida do catálogo permanentemente."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-red-200">
                <button
                  id="cancel-del-category-btn"
                  type="button"
                  onClick={() => setCategoryToDelete(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4E6579] hover:bg-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="confirm-del-category-btn"
                  type="button"
                  onClick={handleConfirmDeleteCategory}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#C1432B] hover:bg-red-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Sim, Excluir</span>
                </button>
              </div>
            </div>
          )}

          {/* Inline Reset to Default Seed Confirmation Banner */}
          {showResetConfirm && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Restaurar catálogo para o padrão original da planilha?
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Todas as categorias e prestadores serão restaurados com a lista inicial da planilha do condomínio.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4E6579] hover:bg-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw size={13} />
                  <span>Confirmar Restauração</span>
                </button>
              </div>
            </div>
          )}

          {/* Add Category Form */}
          <div>
            <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-2">
              Adicionar Nova Categoria
            </label>
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                id="new-category-input"
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Ex.: Chaveiro 24h, Montador de Móveis..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
              />
              <button
                id="add-category-btn"
                type="submit"
                className="flex items-center gap-1 bg-[#1C5D9B] hover:bg-[#123F6B] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus size={15} />
                <span>Adicionar</span>
              </button>
            </form>
          </div>

          {/* List of existing categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579]">
                Categorias Cadastradas ({categories.length})
              </label>
              <span className="text-[11px] text-[#4E6579] font-mono">
                Clique no lápis para renomear ou na lixeira para excluir
              </span>
            </div>
            <div className="divide-y divide-[#EEF3F9] border border-[#CFDCE9] rounded-xl overflow-hidden max-h-64 overflow-y-auto bg-white shadow-2xs">
              {categories.map((cat) => {
                const count = professionals.filter((p) => p.category === cat).length;
                const isSelectedForDelete = categoryToDelete?.name === cat;
                const isEditing = editingCategory === cat;

                if (isEditing) {
                  return (
                    <div
                      key={cat}
                      className="p-3 bg-[#EEF3F9]/90 border-l-4 border-l-[#1C5D9B] space-y-2 animate-in fade-in duration-150"
                    >
                      <form onSubmit={handleSaveEdit} className="flex items-center gap-2">
                        <PlantTag category={cat} size={28} />
                        <input
                          id={`edit-cat-input-${cat}`}
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            if (editError) setEditError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[#1C5D9B] bg-white text-xs text-[#152A3E] font-medium focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                        />
                        <button
                          id={`save-cat-btn-${cat}`}
                          type="submit"
                          title="Salvar alteração"
                          aria-label="Salvar alteração"
                          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          id={`cancel-cat-btn-${cat}`}
                          type="button"
                          onClick={handleCancelEdit}
                          title="Cancelar"
                          aria-label="Cancelar"
                          className="p-2 rounded-lg bg-[#CFDCE9] hover:bg-[#B8CDE0] text-[#152A3E] transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </form>
                      {editError ? (
                        <p className="text-[11px] text-red-600 font-semibold pl-9">{editError}</p>
                      ) : (
                        <p className="text-[10px] text-[#4E6579] font-mono pl-9">
                          Pressione <strong>Enter</strong> para salvar ou <strong>Esc</strong> para cancelar. Os anúncios vinculados serão renomeados automaticamente.
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={cat}
                    className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${
                      isSelectedForDelete ? "bg-red-50/80" : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <PlantTag category={cat} size={30} />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-[#152A3E] truncate block">{cat}</span>
                        {count > 0 && (
                          <span className="text-[11px] text-[#4E6579] font-mono">
                            {count} {count === 1 ? "prestador vinculado" : "prestadores vinculados"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id={`edit-cat-btn-${cat}`}
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        title={`Editar/Corrigir nome da categoria "${cat}"`}
                        aria-label={`Editar categoria ${cat}`}
                        className="p-2 rounded-lg text-[#1C5D9B] hover:text-[#123F6B] hover:bg-[#EEF3F9] transition-colors cursor-pointer flex items-center justify-center"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        id={`del-cat-${cat}`}
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryToDelete({ name: cat, count });
                        }}
                        title={`Excluir categoria "${cat}"`}
                        aria-label={`Excluir categoria ${cat}`}
                        className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                          isSelectedForDelete
                            ? "bg-[#C1432B] text-white shadow-xs"
                            : "text-[#4E6579] hover:text-[#C1432B] hover:bg-red-50"
                        }`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-[#4E6579] mt-2">
              * Ao renomear uma categoria, todos os prestadores vinculados a ela serão atualizados automaticamente no catálogo.
            </p>
          </div>

          {/* Data Backup & Restore */}
          <div className="pt-4 border-t border-[#EEF3F9]">
            <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-2">
              Backup, Restauração e Sincronização em Nuvem
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onExportData && (
                <button
                  id="export-data-btn"
                  type="button"
                  onClick={onExportData}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] hover:bg-[#EEF3F9] text-[#152A3E] text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download size={15} className="text-[#1C5D9B]" />
                  <span>Baixar Backup (JSON)</span>
                </button>
              )}

              {onImportData && (
                <label
                  htmlFor="import-json-input"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] hover:bg-[#EEF3F9] text-[#152A3E] text-xs font-medium cursor-pointer transition-colors"
                >
                  <Upload size={15} className="text-[#5A7328]" />
                  <span>Importar Backup</span>
                  <input
                    id="import-json-input"
                    key={fileInputKey}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            {onSyncLocalHistory && (
              <div className="mt-2.5 flex flex-col gap-2">
                <button
                  id="sync-local-history-btn"
                  type="button"
                  disabled={isSyncing}
                  onClick={handleTriggerSync}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer w-full ${
                    isSyncing
                      ? "bg-emerald-100/70 border-emerald-300 text-emerald-800 opacity-80 cursor-wait"
                      : "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900 shadow-xs"
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 size={16} className="text-emerald-700 animate-spin" />
                      <span>Sincronizando dados com o servidor em nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={16} className="text-emerald-600" />
                      <span>Sincronizar Cadastros deste Navegador com a Nuvem</span>
                    </>
                  )}
                </button>

                {/* Inline Confirmation / Error Alert Box */}
                {syncFeedback && (
                  <div
                    id="sync-feedback-banner"
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200 ${
                      syncFeedback.type === "success"
                        ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                        : "bg-red-50/90 border-red-200 text-red-950"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {syncFeedback.type === "success" ? (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h5
                            className={`text-xs font-bold ${
                              syncFeedback.type === "success" ? "text-emerald-900" : "text-red-900"
                            }`}
                          >
                            {syncFeedback.title}
                          </h5>
                          <span
                            className={`text-[10px] font-mono ${
                              syncFeedback.type === "success" ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {syncFeedback.timestamp}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-0.5 leading-relaxed ${
                            syncFeedback.type === "success" ? "text-emerald-800" : "text-red-800"
                          }`}
                        >
                          {syncFeedback.message}
                        </p>
                      </div>
                    </div>

                    <button
                      id="close-sync-feedback-btn"
                      type="button"
                      onClick={() => setSyncFeedback(null)}
                      className={`p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0 ${
                        syncFeedback.type === "success" ? "text-emerald-700" : "text-red-700"
                      }`}
                      title="Fechar aviso"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset button */}
          {onRestoreSeed && (
            <div className="pt-3 border-t border-[#EEF3F9]">
              <button
                id="restore-defaults-btn"
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-[#C1432B] hover:text-[#a8321d] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Restaurar categorias e profissionais para o padrão original da planilha</span>
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-[#EEF3F9] bg-[#F8FAFC] flex justify-end">
          <button
            id="done-cat-modal-btn"
            onClick={onClose}
            className="px-4 py-2 bg-[#152A3E] text-white text-xs font-semibold rounded-xl hover:bg-[#1C5D9B] transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
