import React, { useState, useMemo } from "react";
import {
  X, Search, Plus, Pencil, Trash2, Copy, Check, Eye, EyeOff,
  Star, Sparkles, Calendar, MapPin, Home, Building2, Tag, Phone,
  ShieldCheck, MessageCircle, Filter, LayoutList, Layers, ChevronRight,
  Info, ExternalLink, RefreshCw, Database, CheckCircle2, Save, LogOut,
  KeyRound, FolderArchive, Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Professional, SponsoredAdType } from "../types";
import { formatPhone } from "../utils/storage";
import { matchProfessionalQuery } from "../utils/searchUtils";

interface AdminAdsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionals: Professional[];
  categories: string[];
  lastSaved?: string;
  onSave?: () => Promise<boolean | void> | void;
  onEdit: (professional: Professional) => void;
  onDuplicate: (professional: Professional) => void;
  onDelete: (professional: Professional) => void;
  onToggleActive: (professional: Professional) => void;
  onToggleSponsored: (professional: Professional) => void;
  onToggleFeatured: (professional: Professional) => void;
  onAddNew: () => void;
  onOpenSecurity?: () => void;
  onOpenExport?: () => void;
}

type FilterStatus = "all" | "active" | "disabled" | "sponsored" | "featured" | "resident_indicated" | "company" | "event" | "professional";

export const AdminAdsManagerModal: React.FC<AdminAdsManagerModalProps> = ({
  isOpen,
  onClose,
  professionals,
  categories,
  lastSaved,
  onSave,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  onToggleSponsored,
  onToggleFeatured,
  onAddNew,
  onOpenSecurity,
  onOpenExport,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Calculate high-level summary KPIs
  const stats = useMemo(() => {
    const total = professionals.length;
    const active = professionals.filter((p) => p.active !== false).length;
    const disabled = professionals.filter((p) => p.active === false).length;
    const sponsored = professionals.filter((p) => Boolean(p.sponsored)).length;
    const featured = professionals.filter((p) => Boolean(p.featuredInBanner && !p.sponsored)).length;
    const residentIndicated = professionals.filter((p) => Boolean(p.blockReference)).length;
    const companies = professionals.filter((p) => p.adType === "company").length;
    const events = professionals.filter(
      (p) => p.adType === "event" || p.adType === "condo_event" || p.adType === "external_event"
    ).length;
    const standardPros = professionals.filter(
      (p) => (!p.adType || p.adType === "professional") && !p.sponsored && !p.featuredInBanner
    ).length;

    return { total, active, disabled, sponsored, featured, residentIndicated, companies, events, standardPros };
  }, [professionals]);

  // Filter list based on search, status and category
  const filteredList = useMemo(() => {
    return professionals.filter((p) => {
      const isItemActive = p.active !== false;
      const isSponsored = Boolean(p.sponsored);
      const isFeatured = Boolean(p.featuredInBanner && !p.sponsored);

      // Status filter
      if (statusFilter === "active" && !isItemActive) return false;
      if (statusFilter === "disabled" && isItemActive) return false;
      if (statusFilter === "sponsored" && !isSponsored) return false;
      if (statusFilter === "featured" && !p.featuredInBanner) return false;
      if (statusFilter === "resident_indicated" && !p.blockReference) return false;
      if (statusFilter === "company" && p.adType !== "company") return false;
      if (
        statusFilter === "event" &&
        p.adType !== "event" &&
        p.adType !== "condo_event" &&
        p.adType !== "external_event"
      )
        return false;
      if (
        statusFilter === "professional" &&
        p.adType &&
        p.adType !== "professional"
      )
        return false;

      // Category filter
      if (selectedCategory !== "all") {
        const matchesSelectedCat =
          (Array.isArray(p.categories) && p.categories.length > 0
            ? p.categories.includes(selectedCategory)
            : p.category === selectedCategory);
        if (!matchesSelectedCat) return false;
      }

      // Text search (Google-style)
      if (search.trim()) {
        if (!matchProfessionalQuery(p, search)) {
          return false;
        }
      }

      return true;
    });
  }, [professionals, statusFilter, selectedCategory, search]);

  const handleCopyPhone = (id: string, phone: string) => {
    const digits = (phone || "").replace(/\D/g, "");
    if (!digits) return;
    navigator.clipboard.writeText(digits);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave();
      }
      setSaveFeedback("✓ Alterações salvas com sucesso no banco de dados!");
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch (err) {
      console.error("Erro ao salvar:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave();
      }
      onClose();
    } catch (err) {
      console.error("Erro ao salvar e fechar:", err);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/65 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-ads-title"
        >
          {/* Header Bar */}
          <div className="bg-[#152A3E] text-white p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 border-b-2 border-[#AECB3E]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1C5D9B] to-[#AECB3E] text-[#152A3E] flex items-center justify-center font-bold shadow-sm shrink-0">
                <LayoutList size={22} strokeWidth={2.4} />
              </div>
              <div>
                <h2 id="admin-ads-title" className="text-lg sm:text-xl font-bold font-['Fraunces',serif] text-white leading-tight">
                  Gerenciador de Anúncios & Catálogo
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Painel objetivo para editar, duplicar, habilitar, desabilitar e excluir anúncios
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              {onOpenExport && (
                <button
                  type="button"
                  onClick={onOpenExport}
                  title="Baixar projeto completo em ZIP e backup JSON para publicar sem restrições"
                  className="flex items-center gap-1.5 bg-[#AECB3E]/20 hover:bg-[#AECB3E]/30 text-[#AECB3E] text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all border border-[#AECB3E]/40 font-semibold cursor-pointer"
                >
                  <FolderArchive size={15} />
                  <span>Exportar ZIP</span>
                </button>
              )}

              {onOpenSecurity && (
                <button
                  type="button"
                  onClick={onOpenSecurity}
                  title="Alterar senha e e-mail de recuperação do administrador"
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all border border-white/15 cursor-pointer"
                >
                  <KeyRound size={15} className="text-[#AECB3E]" />
                  <span>Segurança / Senha</span>
                </button>
              )}

              <button
                type="button"
                onClick={onAddNew}
                className="flex items-center gap-1.5 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.6} />
                <span>+ Novo Anúncio</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar gerenciador"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-[#EEF3F9] px-4 sm:px-6 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5 shrink-0">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total</span>
                <span className="text-base sm:text-lg font-bold text-[#152A3E]">{stats.total}</span>
              </div>
              <Layers size={18} className="text-[#1C5D9B]" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Ativos</span>
                <span className="text-base sm:text-lg font-bold text-emerald-700">{stats.active}</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Desabilitados</span>
                <span className="text-base sm:text-lg font-bold text-rose-700">{stats.disabled}</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Patrocinados</span>
                <span className="text-base sm:text-lg font-bold text-amber-800">{stats.sponsored}</span>
              </div>
              <Star size={16} className="text-amber-500 fill-amber-500" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-sky-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Em Destaque</span>
                <span className="text-base sm:text-lg font-bold text-[#1C5D9B]">{stats.featured}</span>
              </div>
              <Sparkles size={16} className="text-[#1C5D9B]" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-xs hidden lg:flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Empresas</span>
                <span className="text-base sm:text-lg font-bold text-blue-800">{stats.companies}</span>
              </div>
              <Building2 size={16} className="text-blue-600" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-xs hidden lg:flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Eventos</span>
                <span className="text-base sm:text-lg font-bold text-purple-800">{stats.events}</span>
              </div>
              <Calendar size={16} className="text-purple-600" />
            </div>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-white space-y-3 shrink-0">
            <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, categoria, telefone, morador, torre..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#1C5D9B] focus:bg-white transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
                  Categoria:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[#152A3E] text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C5D9B] cursor-pointer"
                >
                  <option value="all">Todas as Categorias ({professionals.length})</option>
                  {categories.map((cat) => {
                    const count = professionals.filter((p) => p.category === cat).length;
                    return (
                      <option key={cat} value={cat}>
                        {cat} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-slate-400 font-semibold mr-1 shrink-0 flex items-center gap-1 text-[11px]">
                <Filter size={12} />
                Filtrar:
              </span>

              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                  statusFilter === "all"
                    ? "bg-[#152A3E] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todos ({stats.total})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                  statusFilter === "active"
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Ativos ({stats.active})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("disabled")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                  statusFilter === "disabled"
                    ? "bg-rose-700 text-white"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Desabilitados ({stats.disabled})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("sponsored")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                  statusFilter === "sponsored"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Star size={12} className={statusFilter === "sponsored" ? "fill-white" : "fill-amber-500"} />
                <span>Patrocinados ({stats.sponsored})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("featured")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                  statusFilter === "featured"
                    ? "bg-[#1C5D9B] text-white shadow-xs"
                    : "bg-sky-50 text-[#1C5D9B] hover:bg-sky-100 border border-sky-200"
                }`}
              >
                <Sparkles size={12} className={statusFilter === "featured" ? "text-amber-300" : "text-[#1C5D9B]"} />
                <span>Em Destaque ({stats.featured})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("resident_indicated")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
                  statusFilter === "resident_indicated"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <ShieldCheck size={12} className={statusFilter === "resident_indicated" ? "text-white" : "text-emerald-700"} />
                <span>Indicados ({stats.residentIndicated})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("company")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                  statusFilter === "company"
                    ? "bg-blue-700 text-white"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                Empresas ({stats.companies})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("event")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                  statusFilter === "event"
                    ? "bg-purple-700 text-white"
                    : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
                }`}
              >
                Eventos ({stats.events})
              </button>
            </div>
          </div>

          {/* Database Persistence & Safety Guarantee Notice */}
          <div className="bg-emerald-50/95 border-b border-emerald-200 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-emerald-950 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Database size={15} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-emerald-900 leading-snug">
                  <strong className="font-bold text-emerald-950">Aviso do Sistema:</strong> Todas as alterações (edição, ativação, desativação, exclusão e destaques) são <strong>salvas e persistidas no Banco de Dados</strong> em tempo real.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300/80">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                {saveFeedback ? (
                  <span className="text-emerald-950 font-extrabold">{saveFeedback}</span>
                ) : (
                  <span>Sincronizado • {lastSaved || "Agora"}</span>
                )}
              </span>
            </div>
          </div>

          {/* Main Table / Card List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-50 divide-y divide-slate-200">
            {filteredList.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 my-4 shadow-xs">
                <Layers size={40} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-[#152A3E]">Nenhum anúncio encontrado</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {search || statusFilter !== "all" || selectedCategory !== "all"
                    ? "Tente ajustar os termos de pesquisa ou remover os filtros aplicados."
                    : "Ainda não existem anúncios cadastrados nesta visualização."}
                </p>
                {(search || statusFilter !== "all" || selectedCategory !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setSelectedCategory("all");
                    }}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Limpar Filtros</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredList.map((item) => {
                  const isActive = item.active !== false;
                  const isSponsored = Boolean(item.sponsored);
                  const isEvent =
                    item.adType === "event" ||
                    item.adType === "condo_event" ||
                    item.adType === "external_event";
                  const isCompany = item.adType === "company";
                  const safePhone = (item.phone || "").replace(/\D/g, "");
                  const formattedPhone = formatPhone(item.phone || "");

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                        !isActive
                          ? "border-slate-300 bg-slate-100/70 opacity-80"
                          : isSponsored
                          ? "border-[#AECB3E] ring-1 ring-[#AECB3E]/30 bg-gradient-to-r from-white via-white to-[#F9FBEF]"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Left: Avatar & Main Info */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Image Thumbnail or Icon */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#152A3E]/10 flex items-center justify-center text-[#1C5D9B] font-bold text-lg">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Title, Category and Tags */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {/* Active Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              ></span>
                              {isActive ? "Ativo" : "Desabilitado"}
                            </span>

                            {/* Banner & Highlight Status Badge */}
                            {isEvent ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 shadow-xs">
                                <Calendar size={11} className="text-purple-600" />
                                <span>Evento no Banner</span>
                              </span>
                            ) : isSponsored ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#D97706] text-white shadow-xs">
                                <Star size={11} className="fill-white" />
                                <span>Patrocinado</span>
                              </span>
                            ) : item.featuredInBanner ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#1C5D9B] text-white shadow-xs">
                                <Sparkles size={11} className="text-[#AECB3E]" />
                                <span>Em Destaque</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <span>Padrão (Catálogo)</span>
                              </span>
                            )}

                            {/* Type Badge */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {isEvent ? (
                                <>
                                  <Calendar size={11} className="text-purple-600" />
                                  <span>Evento</span>
                                </>
                              ) : isCompany ? (
                                <>
                                  <Building2 size={11} className="text-blue-600" />
                                  <span>Empresa</span>
                                </>
                              ) : (
                                <span>Prestador</span>
                              )}
                            </span>

                            {/* Category Badges (Up to 3) */}
                            {Array.isArray(item.categories) && item.categories.length > 0 ? (
                              item.categories.map((cat, catIdx) => (
                                <span
                                  key={cat}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                    catIdx === 0
                                      ? "bg-[#EEF3F9] text-[#1C5D9B] border-[#CFDCE9]"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                                  }`}
                                  title={catIdx === 0 ? "Categoria Principal" : `Categoria Adicional ${catIdx + 1}`}
                                >
                                  <Tag size={10} />
                                  <span>{cat}</span>
                                </span>
                              ))
                            ) : (
                              item.category && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EEF3F9] text-[#1C5D9B] border border-[#CFDCE9]">
                                  <Tag size={10} />
                                  <span>{item.category}</span>
                                </span>
                              )
                            )}

                            {/* Resident Unit if exists */}
                            {item.residentUnit && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Home size={10} />
                                <span>Morador: {item.residentUnit}</span>
                              </span>
                            )}

                            {/* Resident Indication if exists */}
                            {item.blockReference && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                                <ShieldCheck size={11} className="text-emerald-700 shrink-0" />
                                <span>{item.blockReference}</span>
                              </span>
                            )}
                          </div>

                          {/* Professional/Ad Name */}
                          <h4 className="text-sm sm:text-base font-bold text-[#152A3E] leading-snug truncate">
                            {item.name}
                          </h4>

                          {/* Description Snippet */}
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-2xl">
                              {item.description}
                            </p>
                          )}

                          {/* Phone and Details */}
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600 font-mono">
                            {item.phone && (
                              <div className="flex items-center gap-1 text-[#152A3E]">
                                <Phone size={12} className="text-emerald-600" />
                                <span>{formattedPhone}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPhone(item.id, item.phone)}
                                  className="text-slate-400 hover:text-slate-700 p-0.5"
                                  title="Copiar telefone"
                                >
                                  {copiedPhoneId === item.id ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              </div>
                            )}

                            {item.rating && (
                              <div className="flex items-center gap-1 text-amber-600 font-sans font-bold">
                                <Star size={12} className="fill-amber-500 text-amber-500" />
                                <span>{item.rating.toFixed(1)}</span>
                                <span className="text-slate-400 font-normal">
                                  ({item.reviewCount || item.reviews?.length || 1})
                                </span>
                              </div>
                            )}

                            {item.specialOffer && (
                              <span className="text-[11px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                ★ {item.specialOffer}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Objective Action Buttons Group */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                        {/* 1. Toggle Habilitar / Desabilitar */}
                        <button
                          type="button"
                          onClick={() => onToggleActive(item)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                            isActive
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                          title={
                            isActive
                              ? "Clique para Desabilitar/Ocultar anúncio do público"
                              : "Clique para Habilitar e publicar novamente no catálogo"
                          }
                        >
                          {isActive ? (
                            <>
                              <EyeOff size={14} />
                              <span>Desabilitar</span>
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              <span>Habilitar</span>
                            </>
                          )}
                        </button>

                        {/* 2. Toggle Patrocinado (Anúncio Pago / Oficial) */}
                        <button
                          type="button"
                          onClick={() => onToggleSponsored(item)}
                          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isSponsored
                              ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200 hover:border-amber-300"
                          }`}
                          title={
                            isSponsored
                              ? "Remover status de patrocinado"
                              : "Tornar Anúncio Patrocinado Oficial (Cota comercial)"
                          }
                        >
                          <Star
                            size={14}
                            className={
                              isSponsored
                                ? "fill-white text-white"
                                : "text-amber-600"
                            }
                          />
                          <span className="hidden sm:inline">
                            {isSponsored ? "Patrocinado" : "+ Patrocinar"}
                          </span>
                        </button>

                        {/* 3. Toggle Em Destaque (Destaque Comunitário no Banner) */}
                        <button
                          type="button"
                          onClick={() => onToggleFeatured(item)}
                          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            item.featuredInBanner
                              ? "bg-[#1C5D9B] hover:bg-[#123F6B] text-white border-[#123F6B] shadow-xs"
                              : "bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#1C5D9B] border-slate-200 hover:border-sky-300"
                          }`}
                          title={
                            item.featuredInBanner
                              ? "Remover destaque do banner rotativo"
                              : "Destacar no carrossel de topo como recomendação"
                          }
                        >
                          <Sparkles
                            size={14}
                            className={
                              item.featuredInBanner
                                ? "text-[#AECB3E]"
                                : "text-[#1C5D9B]"
                            }
                          />
                          <span className="hidden sm:inline">
                            {item.featuredInBanner ? "Em Destaque" : "+ Destacar"}
                          </span>
                        </button>

                        {/* 3. Clonar / Duplicar */}
                        <button
                          type="button"
                          onClick={() => onDuplicate(item)}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer active:scale-95"
                          title="Duplicar anúncio como cópia"
                        >
                          <Copy size={14} />
                          <span className="hidden sm:inline">Clonar</span>
                        </button>

                        {/* 4. Editar */}
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="flex items-center gap-1 bg-[#1C5D9B] hover:bg-[#123F6B] text-white font-bold text-xs px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Editar informações do anúncio"
                        >
                          <Pencil size={14} />
                          <span>Editar</span>
                        </button>

                        {/* 5. Excluir */}
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl border border-rose-200 transition-colors cursor-pointer active:scale-95"
                          title="Excluir anúncio permanentemente"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions ("Sair", "Salvar", "Salvar e Fechar") */}
          <div className="bg-slate-100 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600 self-start sm:self-center">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Salvo e protegido no banco</span>
              </div>
              <span className="hidden md:inline text-slate-400">•</span>
              <span className="font-medium text-[#152A3E]">
                {filteredList.length} de {professionals.length} anúncios
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* 1. Botão Sair */}
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs active:scale-95 text-xs sm:text-[13px] disabled:opacity-50"
                title="Sair do painel"
              >
                <LogOut size={14} />
                <span>Sair</span>
              </button>

              {/* 2. Botão Salvar */}
              <button
                type="button"
                onClick={handleManualSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 bg-[#152A3E] hover:bg-[#0f1d2b] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 text-xs sm:text-[13px] disabled:opacity-50"
                title="Salvar todas as alterações agora no banco de dados"
              >
                {isSaving ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>{isSaving ? "Salvando..." : "Salvar"}</span>
              </button>

              {/* 3. Botão Salvar e Fechar */}
              <button
                type="button"
                onClick={handleSaveAndClose}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95 text-xs sm:text-[13px] disabled:opacity-50"
                title="Salvar todas as alterações no banco de dados e fechar este painel"
              >
                <Check size={15} strokeWidth={2.5} />
                <span>Salvar e Fechar</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
