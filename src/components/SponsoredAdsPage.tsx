import React, { useState, useMemo } from "react";
import {
  Sparkles, Star, Building2, Calendar, Home, Search, X, ArrowLeft,
  MessageCircle, ExternalLink, ShieldCheck, Check, Copy, Tag, Info,
  Plus, Eye, Filter, Award, ChevronRight, HelpCircle, Phone
} from "lucide-react";
import { Professional, SponsoredAdType } from "../types";
import { SponsoredAdCard } from "./SponsoredAdCard";
import { formatPhone } from "../utils/storage";
import { matchProfessionalQuery } from "../utils/searchUtils";

interface SponsoredAdsPageProps {
  sponsoredList: Professional[];
  isAdmin: boolean;
  onBackToCatalog: () => void;
  onOpenAdvertiseInfo: () => void;
  onEdit: (p: Professional) => void;
  onDuplicate?: (p: Professional) => void;
  onDelete: (id: string) => void;
  onRate?: (p: Professional) => void;
  onAddNewSponsored?: () => void;
}

type SponsorFilterType = "all" | "company" | "event" | "resident_business" | "professional";

export const SponsoredAdsPage: React.FC<SponsoredAdsPageProps> = ({
  sponsoredList,
  isAdmin,
  onBackToCatalog,
  onOpenAdvertiseInfo,
  onEdit,
  onDuplicate,
  onDelete,
  onRate,
  onAddNewSponsored,
}) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<SponsorFilterType>("all");
  const [showExplanation, setShowExplanation] = useState(false);

  // Categorize counts
  const counts = useMemo(() => {
    const total = sponsoredList.length;
    const companies = sponsoredList.filter((p) => p.adType === "company" || p.adType === "external_business").length;
    const events = sponsoredList.filter(
      (p) => p.adType === "event" || p.adType === "condo_event" || p.adType === "external_event"
    ).length;
    const residentBusinesses = sponsoredList.filter((p) => p.adType === "resident_business").length;
    const pros = sponsoredList.filter((p) => !p.adType || p.adType === "professional").length;

    return { total, companies, events, residentBusinesses, pros };
  }, [sponsoredList]);

  // Filtered sponsored items
  const filteredSponsored = useMemo(() => {
    return sponsoredList.filter((p) => {
      // Type filter
      if (selectedType === "company") {
        if (p.adType !== "company" && p.adType !== "external_business") return false;
      } else if (selectedType === "event") {
        if (p.adType !== "event" && p.adType !== "condo_event" && p.adType !== "external_event") return false;
      } else if (selectedType === "resident_business") {
        if (p.adType !== "resident_business") return false;
      } else if (selectedType === "professional") {
        if (p.adType && p.adType !== "professional") return false;
      }

      // Search filter (Google-style)
      if (search.trim()) {
        if (!matchProfessionalQuery(p, search)) {
          return false;
        }
      }

      return true;
    });
  }, [sponsoredList, selectedType, search]);

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button
          id="sponsored-page-back-btn"
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-[#152A3E] shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={15} className="text-[#1C5D9B]" />
          <span>Voltar ao Catálogo Geral</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="how-sponsored-works-btn"
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#EEF3F9] hover:bg-[#CFDCE9] text-[#1C5D9B] rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#CFDCE9]"
          >
            <HelpCircle size={14} />
            <span>{showExplanation ? "Ocultar explicação" : "Como funcionam os Patrocinados?"}</span>
          </button>

          <button
            id="open-advertise-modal-btn"
            type="button"
            onClick={onOpenAdvertiseInfo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={14} strokeWidth={2.4} />
            <span>Quero Anunciar</span>
          </button>

          {isAdmin && onAddNewSponsored && (
            <button
              id="admin-add-sponsored-btn"
              type="button"
              onClick={onAddNewSponsored}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1C5D9B] hover:bg-[#123F6B] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>+ Novo Patrocinado</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header / Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#152A3E] via-[#1A3854] to-[#123F6B] rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-[#AECB3E]/30 mb-8">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#AECB3E]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#1C5D9B]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AECB3E]/20 text-[#AECB3E] border border-[#AECB3E]/40 text-xs font-bold uppercase tracking-wider mb-3">
            <Award size={14} />
            <span>Espaço Oficial de Parceiros & Patrocinadores</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Fraunces',serif] text-white leading-tight">
            Anúncios Patrocinados & Empresas Parceiras
          </h1>

          <p className="text-sm sm:text-base text-slate-200 mt-2 leading-relaxed font-['Public_Sans',sans-serif]">
            Conheça as marcas, empresas, comércios locais, negócios de moradores e eventos que apoiam o condomínio 
            e oferecem benefícios, descontos e atendimento prioritário para a nossa comunidade.
          </p>

          {/* Quick Metrics Pills */}
          <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10 text-xs">
            <span className="bg-white/10 px-3 py-1.5 rounded-lg font-mono font-medium text-slate-200">
              Total de Patrocinadores: <strong className="text-white">{counts.total}</strong>
            </span>
            {counts.companies > 0 && (
              <span className="bg-white/10 px-3 py-1.5 rounded-lg font-mono font-medium text-slate-200 flex items-center gap-1.5">
                <Building2 size={13} className="text-[#AECB3E]" />
                <span>Empresas: <strong className="text-white">{counts.companies}</strong></span>
              </span>
            )}
            {counts.events > 0 && (
              <span className="bg-white/10 px-3 py-1.5 rounded-lg font-mono font-medium text-slate-200 flex items-center gap-1.5">
                <Calendar size={13} className="text-amber-300" />
                <span>Eventos: <strong className="text-white">{counts.events}</strong></span>
              </span>
            )}
            {counts.residentBusinesses > 0 && (
              <span className="bg-white/10 px-3 py-1.5 rounded-lg font-mono font-medium text-slate-200 flex items-center gap-1.5">
                <Home size={13} className="text-blue-300" />
                <span>Moradores: <strong className="text-white">{counts.residentBusinesses}</strong></span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Explanatory Distinction Box (Patrocinados vs Anúncios Padrão em Destaque) */}
      {(showExplanation || true) && (
        <div
          id="sponsored-vs-standard-card"
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-8 relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-[#152A3E]">
              <Info size={20} className="text-[#1C5D9B]" />
              <h2 className="text-sm sm:text-base font-bold font-['Fraunces',serif]">
                Entenda a diferença: Anúncios Patrocinados vs. Anúncios Padrão (Indicações)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-slate-400 hover:text-slate-600 sm:hidden p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs leading-relaxed">
            {/* Sponsored Column */}
            <div className="bg-[#FEF9E7] border border-[#FDE68A] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#D97706] text-white px-2.5 py-0.5 rounded-md font-mono font-bold text-[10.5px] uppercase flex items-center gap-1">
                    <Star size={11} className="fill-white" />
                    <span>Anúncio Patrocinado</span>
                  </span>
                </div>
                <h3 className="font-bold text-[#92400E] text-sm mb-1">
                  Espaço Comercial, Parceiros & Divulgações Oficiais
                </h3>
                <p className="text-[#78350F]">
                  São inserções comerciais contratadas ou autorizadas pela administração para empresas, lojas,
                  negócios de moradores e eventos. Recebem banner rotativo com imagem destacada, 
                  condições especiais de desconto e posicionamento prioritário.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#FDE68A] text-[11px] text-[#92400E] font-medium flex items-center gap-1.5">
                <Check size={14} className="text-[#D97706]" />
                <span>Identificados pelo selo dourado/verde de Patrocínio.</span>
              </div>
            </div>

            {/* Standard / Organic Column */}
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#15803D] text-white px-2.5 py-0.5 rounded-md font-mono font-bold text-[10.5px] uppercase flex items-center gap-1">
                    <ShieldCheck size={11} />
                    <span>Anúncio Padrão / Recomendação</span>
                  </span>
                </div>
                <h3 className="font-bold text-[#166534] text-sm mb-1">
                  Catálogo Orgânico Indicado por Moradores
                </h3>
                <p className="text-[#14532D]">
                  São os prestadores de serviços do dia a dia (eletricistas, encanadores, diaristas, etc.) 
                  indicados voluntariamente pelos próprios moradores do condomínio. Quando um prestador tem muitas 
                  avaliações positivas (5 estrelas), ele ganha destaque orgânico da comunidade.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#BBF7D0] text-[11px] text-[#166534] font-medium flex items-center gap-1.5">
                <Check size={14} className="text-[#15803D]" />
                <span>Recomendação genuína da comunidade sem custo de patrocínio.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedType === "all"
                ? "bg-[#152A3E] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Todos ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("company")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedType === "company"
                ? "bg-[#1C5D9B] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Building2 size={13} />
            <span>Empresas ({counts.companies})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("event")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedType === "event"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Calendar size={13} />
            <span>Eventos ({counts.events})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("resident_business")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedType === "resident_business"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Home size={13} />
            <span>Negócios de Moradores ({counts.residentBusinesses})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("professional")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedType === "professional"
                ? "bg-[#AECB3E] text-[#152A3E] shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Star size={13} />
            <span>Prestadores Patrocinados ({counts.pros})</span>
          </button>
        </div>

        {/* Search inside sponsored ads */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar entre os patrocinados..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Sponsored Ads */}
      {filteredSponsored.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 shadow-2xs">
          <Award size={44} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-[#152A3E]">Nenhum anúncio patrocinado encontrado</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
            {search
              ? `Não encontramos patrocinadores com o termo "${search}". Experimente buscar por outro nome.`
              : "Ainda não há anúncios ativos nesta categoria de patrocínio."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Limpar busca
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAdvertiseInfo}
              className="px-4 py-2 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Seja o primeiro a anunciar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSponsored.map((p) => (
            <SponsoredAdCard
              key={p.id}
              professional={p}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onRate={onRate}
            />
          ))}
        </div>
      )}

      {/* Bottom Floating CTA banner */}
      <div className="mt-12 bg-gradient-to-r from-[#EEF3F9] to-white border border-[#CFDCE9] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1C5D9B] to-[#AECB3E] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Sparkles size={28} className="text-white" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#152A3E] font-['Fraunces',serif]">
              Quer divulgar sua empresa ou serviço para os moradores?
            </h4>
            <p className="text-xs text-[#4E6579] mt-1 max-w-xl">
              Anuncie no Guia do Condomínio Sports Garden Batista Campos e alcance centenas de famílias diretamente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onOpenAdvertiseInfo}
            className="w-full sm:w-auto text-center px-5 py-3 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            Conhecer Planos & Benefícios
          </button>
          <button
            type="button"
            onClick={onBackToCatalog}
            className="w-full sm:w-auto text-center px-4 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-[#152A3E] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Ver Catálogo Geral
          </button>
        </div>
      </div>
    </div>
  );
};
