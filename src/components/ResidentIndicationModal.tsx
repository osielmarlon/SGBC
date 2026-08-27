import React, { useState, useEffect, useRef } from "react";
import { X, UserPlus, Send, CheckCircle2, ShieldAlert, Sparkles, Building, Phone, User, MessageSquare, Image, Tag, Plus, Clock, Hourglass, AlertCircle, RotateCcw } from "lucide-react";
import { PendingIndication } from "../types";

interface ResidentIndicationModalProps {
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
  onSubmit: (indication: Omit<PendingIndication, "id" | "submittedAt">) => void;
}

const PRESET_IMAGES = [
  { label: "Manutenção & Reparos", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80" },
  { label: "Marcenaria & Móveis", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" },
  { label: "Elétrica & Instalações", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80" },
  { label: "Pintura & Acabamentos", url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80" },
  { label: "Diarista & Limpeza", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" },
  { label: "Limpeza de Estofados", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" },
  { label: "Redes de Proteção", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" },
  { label: "Arquitetura & Reforma", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
  { label: "Personal Trainer", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
];

const DRAFT_KEY = "sportsgarden_resident_indication_draft_v1";

export const ResidentIndicationModal: React.FC<ResidentIndicationModalProps> = ({
  isOpen,
  categories,
  onClose,
  onSubmit,
}) => {
  // Morador fields
  const [residentName, setResidentName] = useState("");
  const [residentUnit, setResidentUnit] = useState("");
  const [residentPhone, setResidentPhone] = useState("");
  const [residentComment, setResidentComment] = useState("");

  // Professional fields
  const [profName, setProfName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [description, setDescription] = useState("");
  const [blockReference, setBlockReference] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [specialOffer, setSpecialOffer] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // States
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const wasOpenRef = useRef(false);

  // Restore draft when modal opens
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setError("");
      setIsSuccess(false);

      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          if (draft && (draft.residentName || draft.profName || draft.description || draft.profPhone)) {
            setResidentName(draft.residentName || "");
            setResidentUnit(draft.residentUnit || "");
            setResidentPhone(draft.residentPhone || "");
            setResidentComment(draft.residentComment || "");
            setProfName(draft.profName || "");
            setCategory(draft.category || categories[0] || "Outros");
            setCustomCategory(draft.customCategory || "");
            setProfPhone(draft.profPhone || "");
            setDescription(draft.description || "");
            setBlockReference(draft.blockReference || "");
            setImageUrl(draft.imageUrl || "");
            setSpecialOffer(draft.specialOffer || "");
            setShowAdvanced(!!draft.showAdvanced);
            setHasRestoredDraft(true);
            wasOpenRef.current = true;
            return;
          }
        }
      } catch (e) {
        console.warn("Could not load indication draft", e);
      }

      // Default category if none set
      setCategory((prev) => prev || categories[0] || "Outros");
    }

    if (!isOpen) {
      wasOpenRef.current = false;
      setHasRestoredDraft(false);
    } else {
      wasOpenRef.current = true;
    }
  }, [isOpen, categories]);

  // Auto-save draft on changes (only while modal is open and not submitted)
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const draftData = {
      residentName,
      residentUnit,
      residentPhone,
      residentComment,
      profName,
      category,
      customCategory,
      profPhone,
      description,
      blockReference,
      imageUrl,
      specialOffer,
      showAdvanced,
    };

    const isDirty = Boolean(
      residentName.trim() ||
      residentUnit.trim() ||
      profName.trim() ||
      profPhone.trim() ||
      description.trim() ||
      residentComment.trim()
    );

    if (isDirty) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      } catch (e) {
        // ignore quota issues
      }
    }
  }, [
    isOpen,
    isSuccess,
    residentName,
    residentUnit,
    residentPhone,
    residentComment,
    profName,
    category,
    customCategory,
    profPhone,
    description,
    blockReference,
    imageUrl,
    specialOffer,
    showAdvanced,
  ]);

  if (!isOpen) return null;

  const usingCustomCategory = category === "__custom__";

  const isFormDirty = Boolean(
    residentName.trim() ||
    residentUnit.trim() ||
    profName.trim() ||
    profPhone.trim() ||
    description.trim() ||
    residentComment.trim()
  );

  // Format phone number
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    setter(formatPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!residentName.trim()) {
      setError("Por favor, informe seu nome como morador recomendante.");
      return;
    }

    if (!residentUnit.trim()) {
      setError("Por favor, informe seu apartamento / bloco.");
      return;
    }

    if (!profName.trim()) {
      setError("Por favor, informe o nome do profissional ou empresa.");
      return;
    }

    const finalCategory = usingCustomCategory ? customCategory.trim() : category || categories[0] || "Outros";
    if (!finalCategory) {
      setError("Por favor, selecione ou digite a especialidade/categoria.");
      return;
    }

    const cleanPhone = profPhone.replace(/\D/g, "");
    if (cleanPhone.length < 8) {
      setError("Por favor, informe um telefone de contato válido com DDD para o profissional.");
      return;
    }

    if (!description.trim()) {
      setError("Por favor, descreva brevemente os serviços que o profissional realiza.");
      return;
    }

    onSubmit({
      residentName: residentName.trim(),
      residentUnit: residentUnit.trim(),
      residentPhone: residentPhone.trim() || undefined,
      residentComment: residentComment.trim() || undefined,
      professional: {
        name: profName.trim(),
        category: finalCategory,
        phone: profPhone.trim(),
        description: description.trim(),
        blockReference: blockReference.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        specialOffer: specialOffer.trim() || undefined,
      }
    });

    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      // ignore
    }

    setIsSuccess(true);
  };

  const handleClearForm = () => {
    setResidentName("");
    setResidentUnit("");
    setResidentPhone("");
    setResidentComment("");
    setProfName("");
    setCategory(categories[0] || "Outros");
    setCustomCategory("");
    setProfPhone("");
    setDescription("");
    setBlockReference("");
    setImageUrl("");
    setSpecialOffer("");
    setError("");
    setIsSuccess(false);
    setHasRestoredDraft(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      // ignore
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      handleClearForm();
      onClose();
      return;
    }

    // If dirty, allow closing but keep draft in localStorage so nothing is lost!
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicked directly on the overlay backdrop
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      id="resident-indication-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152A3E]/70 backdrop-blur-xs"
      onClick={handleOverlayClick}
    >
      <div
        id="resident-indication-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#CFDCE9] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F9] bg-[#152A3E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AECB3E] text-[#152A3E] flex items-center justify-center font-bold shadow-sm">
              <UserPlus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Fraunces',serif] text-base sm:text-lg font-bold text-white">
                  Indicar Profissional ou Empresa
                </h3>
              </div>
              <p className="text-xs text-[#CFDCE9] mt-0.5">
                Recomende um bom prestador de serviços para o Sports Garden
              </p>
            </div>
          </div>
          <button
            id="close-indication-modal-btn"
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#CFDCE9] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-in zoom-in">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="font-['Fraunces',serif] text-xl font-bold text-[#152A3E]">
              Indicação Enviada com Sucesso!
            </h4>
            <p className="text-sm text-[#4E6579] max-w-md leading-relaxed">
              Muito obrigado pela recomendação! A indicação de <strong>{profName}</strong> foi registrada e enviada para o <strong>Painel Administrativo</strong>.
            </p>
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 max-w-md text-left flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-300">
                <Clock size={18} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-amber-950 uppercase tracking-wide text-[11px] font-mono">
                    Status: Pendente de Aprovação
                  </span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Aguardando Validação
                  </span>
                </div>
                <p className="text-amber-900/90 leading-relaxed text-xs">
                  Para garantir a segurança dos moradores, nossa administração avaliará as informações no Painel Administrativo antes de disponibilizar o anúncio no catálogo público.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-[#152A3E] hover:bg-[#1C5D9B] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Concluir & Fechar
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="px-4 py-2.5 text-[#1C5D9B] hover:bg-[#EEF3F9] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Indicar Outro Profissional
              </button>
            </div>
          </div>
        ) : (
          /* Indication Form */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#152A3E]">
              {/* Draft Recovered Notice */}
              {hasRestoredDraft && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#1C5D9B] shrink-0" />
                    <span>Rascunho recuperado automaticamente de onde você parou.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    Limpar campos
                  </button>
                </div>
              )}

              {/* Security & Pending Approval Banner Notice */}
              <div
                id="pending-approval-banner"
                className="bg-amber-50/95 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-amber-950 shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 border border-amber-300 shadow-2xs">
                  <Clock size={20} className="text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-amber-950 uppercase tracking-wide text-xs font-mono">
                      Aviso de Validação Administrativa
                    </span>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/80 flex items-center gap-1">
                      <Hourglass size={10} />
                      <span>Ficará Pendente de Aprovação</span>
                    </span>
                  </div>
                  <p className="text-amber-900 leading-relaxed text-xs">
                    Esta indicação <strong>não será publicada imediatamente</strong>. Ela será enviada para o <strong>Painel Administrativo</strong> para validação e aprovação do Administrador antes de ficar disponível na lista geral de anúncios do condomínio.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* SEÇÃO 1: Seus Dados (Morador) */}
              <div className="bg-[#F8FAFC] border border-[#CFDCE9] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EEF3F9]">
                  <User size={15} className="text-[#1C5D9B]" />
                  <h4 className="text-xs font-mono uppercase font-bold text-[#152A3E] tracking-wider">
                    1. Seus Dados (Morador Recomendante)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      id="resident-name-input"
                      type="text"
                      value={residentName}
                      onChange={(e) => setResidentName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                      Seu Apto / Bloco *
                    </label>
                    <input
                      id="resident-unit-input"
                      type="text"
                      value={residentUnit}
                      onChange={(e) => setResidentUnit(e.target.value)}
                      placeholder="Ex: Apto 1204 - Torre Sports"
                      className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                    Seu Telefone / WhatsApp (Opcional)
                  </label>
                  <input
                    id="resident-phone-input"
                    type="text"
                    value={residentPhone}
                    onChange={(e) => handlePhoneChange(e, setResidentPhone)}
                    placeholder="(91) 98888-7777"
                    className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                  />
                  <span className="text-[10.5px] text-[#4E6579] mt-0.5 block">
                    Usado apenas caso a administração precise confirmar algum detalhe.
                  </span>
                </div>
              </div>

              {/* SEÇÃO 2: Dados do Profissional / Empresa */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EEF3F9]">
                  <Building size={15} className="text-[#1C5D9B]" />
                  <h4 className="text-xs font-mono uppercase font-bold text-[#152A3E] tracking-wider">
                    2. Dados do Prestador de Serviços ou Empresa
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                      Nome do Profissional ou Empresa *
                    </label>
                    <input
                      id="prof-name-input"
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      placeholder="Ex: Denilson - Refrigeração / Climatiza"
                      className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-[#F8FAFC] text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                      Telefone / WhatsApp de Contato *
                    </label>
                    <input
                      id="prof-phone-input"
                      type="text"
                      value={profPhone}
                      onChange={(e) => handlePhoneChange(e, setProfPhone)}
                      placeholder="(91) 98123-4567"
                      className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-[#F8FAFC] text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                      required
                    />
                  </div>
                </div>

                {/* Especialidade / Categoria */}
                <div>
                  <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                    Especialidade / Ramo de Atuação *
                  </label>
                  <select
                    id="prof-category-select"
                    value={category || categories[0] || "Outros"}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-[#F8FAFC] text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Outra Especialidade (Digitar Nova)</option>
                  </select>

                  {usingCustomCategory && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Digite o nome da nova especialidade..."
                        className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Descrição dos Serviços */}
                <div>
                  <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                    Descrição dos Serviços Prestados *
                  </label>
                  <textarea
                    id="prof-description-input"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Instalação e manutenção preventiva de ar-condicionado Split, recarga de gás e higienização completa."
                    className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-[#F8FAFC] text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                    required
                  />
                </div>

                {/* Depoimento / Por que recomenda */}
                <div>
                  <label className="block text-xs font-semibold text-[#4E6579] mb-1 flex items-center justify-between">
                    <span>Sua Recomendação / Depoimento (Opcional)</span>
                    <span className="text-[10.5px] text-[#1C5D9B] font-mono">Aparecerá como 1ª avaliação</span>
                  </label>
                  <textarea
                    id="prof-comment-input"
                    rows={2}
                    value={residentComment}
                    onChange={(e) => setResidentComment(e.target.value)}
                    placeholder="Ex: Excelente profissional, muito cuidadoso com o piso e paredes, preço justo e cumpriu o horário combinado."
                    className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-[#F8FAFC] text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                  />
                </div>

                {/* Bloco / Torre que já atendeu */}
                <div>
                  <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                    Andar ou Bloco que já realizou serviços (Opcional)
                  </label>
                  <input
                    type="text"
                    value={blockReference}
                    onChange={(e) => setBlockReference(e.target.value)}
                    placeholder="Ex: Já realizou serviços no 8º e 14º andar"
                    className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-[#F8FAFC] text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                  />
                </div>

                {/* Informações adicionais toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-[#1C5D9B] hover:text-[#123F6B] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} className={`transform transition-transform ${showAdvanced ? "rotate-45" : ""}`} />
                    <span>{showAdvanced ? "Ocultar dados complementares (Foto, Descontos)" : "Adicionar Foto ou Desconto Especial para Moradores"}</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 p-3.5 bg-[#F8FAFC] border border-[#CFDCE9] rounded-xl space-y-3 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                          Condição / Desconto Especial para Moradores
                        </label>
                        <input
                          type="text"
                          value={specialOffer}
                          onChange={(e) => setSpecialOffer(e.target.value)}
                          placeholder="Ex: 10% de desconto para moradores do Sports Garden"
                          className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#4E6579] mb-1">
                          Foto ou Imagem do Serviço
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {PRESET_IMAGES.map((img) => (
                            <button
                              key={img.label}
                              type="button"
                              onClick={() => setImageUrl(img.url)}
                              className={`text-[10px] px-2 py-1 rounded-md border transition-all cursor-pointer ${
                                imageUrl === img.url
                                  ? "bg-[#1C5D9B] text-white border-[#1C5D9B]"
                                  : "bg-white text-[#4E6579] border-[#CFDCE9] hover:bg-[#EEF3F9]"
                              }`}
                            >
                              {img.label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Ou cole o link de uma imagem (https://...)"
                          className="w-full px-3 py-2 rounded-lg border border-[#CFDCE9] bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#EEF3F9] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-[#4E6579] hover:text-[#152A3E] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                {isFormDirty && (
                  <button
                    type="button"
                    onClick={handleClearForm}
                    title="Limpar todos os campos preenchidos"
                    className="px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              <button
                id="submit-indication-btn"
                type="submit"
                className="flex items-center gap-2 bg-[#1C5D9B] hover:bg-[#123F6B] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Send size={14} />
                <span>Enviar Indicação para Validação</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

