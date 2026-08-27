import React, { useState, useEffect, useRef } from "react";
import {
  X, Check, Copy, AlertCircle, Image, Upload, Sparkles, Star, Tag, Trash2,
  Calendar, MapPin, Building2, PartyPopper, Briefcase, ArrowLeft,
  ChevronRight, Phone, FileText, Gift, MapPinOff, Layers, ShieldCheck,
  User, MessageSquare, Home, CheckCircle2, ThumbsUp, Building, Plus, ArrowUp
} from "lucide-react";
import { Professional, SponsoredAdType } from "../types";
import { uploadImageToServer } from "../utils/storage";

interface ProfessionalFormModalProps {
  initial?: Professional | null;
  professional?: Professional | null;
  categories: string[];
  isOpen: boolean;
  onSave: (p: Omit<Professional, "id"> & { id?: string }) => void;
  onDuplicate?: (p: Omit<Professional, "id">) => void;
  onClose: () => void;
}

const PRESET_IMAGES: { label: string; url: string }[] = [
  {
    label: "Comércio & Loja",
    url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Clínica & Saúde",
    url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Doceria & Gastronomia",
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Evento no Condomínio",
    url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Evento Cultural / Feira",
    url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Marcenaria",
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Elétrica & Instalações",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Personal & Fitness",
    url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Arquitetura & Reforma",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Pintura & Acabamento",
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
  },
];

export const ProfessionalFormModal: React.FC<ProfessionalFormModalProps> = ({
  initial,
  professional,
  categories,
  isOpen,
  onSave,
  onDuplicate,
  onClose,
}) => {
  const activeProfessional = professional || initial;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef(false);
  const activeProfIdRef = useRef<string | undefined>(undefined);

  // Steps: "select_type" (Menu Inicial) or "fill_form" (Formulário)
  const [step, setStep] = useState<"select_type" | "fill_form">("select_type");

  const [adType, setAdType] = useState<"company" | "event" | "professional">("company");
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [sponsored, setSponsored] = useState(false);
  const [featuredInBanner, setFeaturedInBanner] = useState(false);
  const [isResidentIndicated, setIsResidentIndicated] = useState(false);
  const [blockReference, setBlockReference] = useState("");
  const [residentComment, setResidentComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [specialOffer, setSpecialOffer] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [residentUnit, setResidentUnit] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [error, setError] = useState("");

  // Build category options
  const allCategoryOptions = React.useMemo(() => {
    const list = Array.isArray(categories) ? [...categories] : [];
    if (activeProfessional?.categories && Array.isArray(activeProfessional.categories)) {
      activeProfessional.categories.forEach((cat) => {
        if (cat && !list.includes(cat)) list.unshift(cat);
      });
    }
    if (activeProfessional?.category && !list.includes(activeProfessional.category)) {
      list.unshift(activeProfessional.category);
    }
    return Array.from(new Set(list.filter(Boolean)));
  }, [categories, activeProfessional?.category, activeProfessional?.categories]);

  // Normalize legacy types into the 3 clean types
  const normalizeAdType = (type?: string): "company" | "event" | "professional" => {
    if (type === "event" || type === "condo_event" || type === "external_event") return "event";
    if (type === "company" || type === "external_business" || type === "resident_business") return "company";
    return "professional";
  };

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }

    const justOpened = !wasOpenRef.current;
    const profChanged = activeProfessional?.id !== activeProfIdRef.current;

    // ONLY initialize/reset form fields when modal transitions from closed -> open or active professional changes
    if (justOpened || profChanged) {
      if (activeProfessional) {
        const normalized = normalizeAdType(activeProfessional.adType);
        setAdType(normalized);
        setStep("fill_form"); // If editing, go straight to form

        setName(activeProfessional.name || "");
        
        let initialCats: string[] = [];
        if (Array.isArray(activeProfessional.categories) && activeProfessional.categories.length > 0) {
          initialCats = activeProfessional.categories.filter(Boolean).slice(0, 3);
        } else if (activeProfessional.category) {
          initialCats = [activeProfessional.category];
        } else if (normalized === "professional") {
          initialCats = [categories[0] || "Geral"];
        }
        setSelectedCategories(initialCats);
        setCustomCategoryInput("");
        setShowCustomInput(false);
        setPhone(activeProfessional.phone || "");
        setDescription(activeProfessional.description || "");
        setSponsored(Boolean(activeProfessional.sponsored));
        setFeaturedInBanner(Boolean(activeProfessional.featuredInBanner));
        const hasIndication = Boolean(activeProfessional.blockReference);
        setIsResidentIndicated(hasIndication);
        setBlockReference(activeProfessional.blockReference || "");
        setResidentComment("");
        setImageUrl(activeProfessional.imageUrl || "");
        setSpecialOffer(activeProfessional.specialOffer || "");
        setBadgeText(activeProfessional.badgeText || (normalized === "company" ? "Empresa" : normalized === "event" ? "Evento" : ""));
        setEventDate(activeProfessional.eventDate || "");
        setEventLocation(activeProfessional.eventLocation || "");
        setResidentUnit(activeProfessional.residentUnit || "");
        setActionLabel(activeProfessional.actionLabel || "");
      } else {
        // New item: Start in step 1 (Menu Inicial)
        setStep("select_type");
        setAdType("professional");
        setName("");
        setSelectedCategories([categories[0] || "Geral"]);
        setCustomCategoryInput("");
        setShowCustomInput(false);
        setPhone("");
        setDescription("");
        setSponsored(false);
        setFeaturedInBanner(false);
        setIsResidentIndicated(true);
        setBlockReference("Indicado por Morador(a)");
        setResidentComment("");
        setImageUrl("");
        setSpecialOffer("");
        setBadgeText("");
        setEventDate("");
        setEventLocation("");
        setResidentUnit("");
        setActionLabel("");
        setStep("fill_form"); // Start directly in the form for fast, direct entry
      }
      setError("");
    }

    wasOpenRef.current = true;
    activeProfIdRef.current = activeProfessional?.id;
  }, [isOpen, activeProfessional]);

  if (!isOpen) return null;

  // Handles choosing the ad type from the initial menu
  const handleSelectAdType = (type: "company" | "event" | "professional") => {
    setAdType(type);
    if (type === "company") {
      setBadgeText("Empresa");
      setSelectedCategories(["Empresas & Negócios"]);
      setSponsored(false);
      setFeaturedInBanner(false);
    } else if (type === "event") {
      setBadgeText("Evento");
      setSelectedCategories(["Eventos & Lazer"]);
      setSponsored(false);
      setFeaturedInBanner(true);
    } else {
      setBadgeText("");
      setSelectedCategories([categories[0] || "Eletricista"]);
      setSponsored(false);
      setFeaturedInBanner(false);
    }
    setError("");
    setStep("fill_form");
  };

  const handleAddCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (!trimmed) return;
    if (selectedCategories.includes(trimmed)) {
      setError("Esta categoria já está selecionada.");
      return;
    }
    if (selectedCategories.length >= 3) {
      setError("Você pode selecionar no máximo 3 categorias.");
      return;
    }
    setSelectedCategories([...selectedCategories, trimmed]);
    setError("");
  };

  const handleRemoveCategory = (catName: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== catName));
    setError("");
  };

  const handleSetPrimaryCategory = (catName: string) => {
    const remaining = selectedCategories.filter((c) => c !== catName);
    setSelectedCategories([catName, ...remaining]);
    setError("");
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) {
      setError("Digite o nome da nova categoria.");
      return;
    }
    if (selectedCategories.includes(trimmed)) {
      setError("Esta categoria já está selecionada.");
      return;
    }
    if (selectedCategories.length >= 3) {
      setError("Você pode selecionar no máximo 3 categorias.");
      return;
    }
    setSelectedCategories([...selectedCategories, trimmed]);
    setCustomCategoryInput("");
    setShowCustomInput(false);
    setError("");
  };

  const handleToggleResidentIndicated = (enabled: boolean) => {
    setIsResidentIndicated(enabled);
    if (enabled && !blockReference.trim()) {
      setBlockReference("Indicado por morador do condomínio");
    }
  };

  const handleApplyResidentShortcut = (shortcut: string) => {
    setIsResidentIndicated(true);
    if (shortcut.startsWith("Torre")) {
      setBlockReference(`Indicado por morador da ${shortcut}`);
    } else if (shortcut === "Vários Moradores") {
      setBlockReference("Recomendado por vários moradores");
    } else if (shortcut === "Moradores das Torres A e B") {
      setBlockReference("Recomendado por moradores das Torres A e B");
    } else {
      setBlockReference(`Indicado por ${shortcut}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("A imagem deve ter até 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDimension = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
          setImageUrl(compressedDataUrl);
          setError("");
        } else if (typeof event.target?.result === "string") {
          setImageUrl(event.target.result);
          setError("");
        }
      };
      img.onerror = () => {
        if (typeof event.target?.result === "string") {
          setImageUrl(event.target.result);
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const validateAndFormat = () => {
    // 1. Name validation
    if (!name.trim()) {
      if (adType === "event") setError("Informe o nome do evento.");
      else if (adType === "company") setError("Informe o nome da empresa.");
      else setError("Informe o nome do profissional.");
      return null;
    }

    // 2. Category determination (Up to 3 categories)
    let finalCategories: string[] = selectedCategories.map((c) => c.trim()).filter(Boolean).slice(0, 3);
    
    if (adType === "professional") {
      if (finalCategories.length === 0) {
        setError("Selecione pelo menos 1 categoria / especialidade para o prestador (até 3).");
        return null;
      }
    } else if (adType === "company") {
      if (finalCategories.length === 0) {
        finalCategories = ["Empresas & Negócios"];
      }
    } else if (adType === "event") {
      if (finalCategories.length === 0) {
        finalCategories = ["Eventos & Lazer"];
      }
    }

    const finalCategory = finalCategories[0] || (adType === "company" ? "Empresas & Negócios" : adType === "event" ? "Eventos & Lazer" : "Geral");

    // 3. Event specific validation
    if (adType === "event") {
      if (!eventDate.trim()) {
        setError("Informe a data e horário do evento.");
        return null;
      }
      if (!eventLocation.trim()) {
        setError("Informe o local do evento.");
        return null;
      }
    }

    // 4. Phone validation
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      setError("Informe o WhatsApp para contato com DDD.");
      return null;
    }

    let formattedPhone = cleanPhone;
    if (formattedPhone.length === 10 || formattedPhone.length === 11) {
      formattedPhone = "55" + formattedPhone;
    }

    const isEvent = adType === "event";
    const finalFeaturedInBanner = isEvent ? true : Boolean(featuredInBanner);
    const finalSponsored = Boolean(sponsored);
    const finalBlockReference = isResidentIndicated
      ? blockReference.trim() || "Indicado por morador do condomínio"
      : undefined;

    let finalReviews = activeProfessional?.reviews ? [...activeProfessional.reviews] : [];
    if (isResidentIndicated && residentComment.trim()) {
      const newReview = {
        id: `r_ind_${Date.now()}`,
        residentName: finalBlockReference?.replace(/^Indicado por /i, "").replace(/^Recomendado por /i, "") || "Morador(a)",
        unit: finalBlockReference || "Condomínio Sports Garden",
        rating: 5,
        comment: residentComment.trim(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      finalReviews = [newReview, ...finalReviews];
    }

    return {
      name: name.trim(),
      category: finalCategory,
      categories: finalCategories,
      phone: formattedPhone,
      description: description.trim(),
      sponsored: finalSponsored,
      featuredInBanner: finalFeaturedInBanner,
      adType,
      badgeText: badgeText.trim() || (adType === "company" ? "Empresa" : adType === "event" ? "Evento" : ""),
      eventDate: eventDate.trim() || undefined,
      eventLocation: eventLocation.trim() || undefined,
      residentUnit: residentUnit.trim() || undefined,
      actionLabel: actionLabel.trim() || undefined,
      blockReference: finalBlockReference,
      imageUrl: imageUrl.trim() || undefined,
      specialOffer: specialOffer.trim() || undefined,
      active: activeProfessional?.active !== undefined ? activeProfessional.active : true,
      isExclusiveSponsorBanner: adType === "event" ? true : undefined,
      ...(finalReviews.length > 0
        ? {
            reviews: finalReviews,
            reviewCount: finalReviews.length,
            rating: 5.0,
          }
        : {}),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = validateAndFormat();
    if (!data) return;

    let finalImageUrl = data.imageUrl;
    if (finalImageUrl && finalImageUrl.startsWith("data:image")) {
      try {
        finalImageUrl = await uploadImageToServer(finalImageUrl, data.name || "item");
      } catch {}
    }

    onSave({
      ...(activeProfessional?.id ? { id: activeProfessional.id } : {}),
      ...data,
      imageUrl: finalImageUrl,
    });
  };

  const handleDuplicateClick = async () => {
    const data = validateAndFormat();
    if (!data) return;

    let finalImageUrl = data.imageUrl;
    if (finalImageUrl && finalImageUrl.startsWith("data:image")) {
      try {
        finalImageUrl = await uploadImageToServer(finalImageUrl, data.name || "item");
      } catch {}
    }

    if (onDuplicate) {
      onDuplicate({
        ...data,
        imageUrl: finalImageUrl,
        name: data.name.includes("(Cópia)") ? data.name : `${data.name} (Cópia)`,
      });
    }
  };

  return (
    <div
      id="prof-form-overlay"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#152A3E]/70 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="prof-form-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#CFDCE9] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F9] flex items-center justify-between bg-[#152A3E] text-white">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-['Fraunces',serif] text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[#AECB3E]" />
                <span>
                  {activeProfessional
                    ? `Editar ${adType === "company" ? "Empresa" : adType === "event" ? "Evento" : "Anúncio / Prestador"}`
                    : `Cadastrar Anúncio — ${adType === "company" ? "Empresa / Comércio" : adType === "event" ? "Evento / Aviso" : "Prestador de Serviço"}`}
                </span>
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                {activeProfessional
                  ? "Atualize as informações do anúncio e salve para sincronizar no catálogo"
                  : "Preencha os dados e publique imediatamente no catálogo do condomínio"}
              </p>
            </div>
          </div>
          <button
            id="close-prof-form-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORMULÁRIO DIRETO E SIMPLES */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Admin Direct Publishing Notice */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-950">
            <Sparkles size={18} className="text-emerald-700 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <span>Cadastro Direto do Administrador</span>
                <span className="text-[10px] bg-emerald-600 text-white font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Publicação Imediata
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                O anúncio entra no catálogo na mesma hora, ativo e visível para todos os moradores sem precisar de aprovação posterior.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-[#152A3E] mb-1.5">
              Tipo de Anúncio / Publicação
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EEF3F9] rounded-xl border border-[#CFDCE9]">
              <button
                type="button"
                id="select-type-professional-tab"
                onClick={() => handleSelectAdType("professional")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  adType === "professional"
                    ? "bg-[#152A3E] text-white shadow-xs"
                    : "text-[#4E6579] hover:text-[#152A3E] hover:bg-white/60"
                }`}
              >
                <Briefcase size={14} />
                <span className="truncate">Prestador / Serviço</span>
              </button>

              <button
                type="button"
                id="select-type-company-tab"
                onClick={() => handleSelectAdType("company")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  adType === "company"
                    ? "bg-[#1C5D9B] text-white shadow-xs"
                    : "text-[#4E6579] hover:text-[#152A3E] hover:bg-white/60"
                }`}
              >
                <Building2 size={14} />
                <span className="truncate">Empresa / Negócio</span>
              </button>

              <button
                type="button"
                id="select-type-event-tab"
                onClick={() => handleSelectAdType("event")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  adType === "event"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-[#4E6579] hover:text-[#152A3E] hover:bg-white/60"
                }`}
              >
                <PartyPopper size={14} />
                <span className="truncate">Evento / Aviso</span>
              </button>
            </div>
          </div>

            {/* 1. NOME */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-[#152A3E] mb-1">
                {adType === "company"
                  ? "Nome da Empresa / Negócio *"
                  : adType === "event"
                  ? "Nome do Evento *"
                  : "Nome do Profissional / Empresa de Serviço *"}
              </label>
              <input
                id="prof-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  adType === "company"
                    ? "Ex.: Atelier Gourmet, Doceria da Moradora, Clínica Batista Campos..."
                    : adType === "event"
                    ? "Ex.: Feira Gastronômica dos Moradores, Bazar de Primavera..."
                    : "Ex.: Teddy Santana - Eletricista ou Junior - Marceneiro"
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] focus:border-transparent transition-all"
              />
            </div>

            {/* 2. CAMPOS ESPECÍFICOS PARA EVENTOS */}
            {adType === "event" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-300/80">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-emerald-950 mb-1 flex items-center gap-1">
                    <Calendar size={14} className="text-emerald-700" />
                    <span>Data e Horário do Evento *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Ex.: Sábado, 28/08 • 17h às 22h"
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-emerald-950 mb-1 flex items-center gap-1">
                    <MapPin size={14} className="text-[#C1432B]" />
                    <span>Local do Evento *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Ex.: Salão Gourmet & Praça Central (Torre B)"
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* 3. CATEGORIAS (Permite associar até 3 categorias/especialidades) */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CFDCE9]/80 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-mono uppercase font-bold text-[#152A3E] flex items-center gap-1.5">
                  <Tag size={14} className="text-[#1C5D9B]" />
                  <span>
                    {adType === "professional"
                      ? "Categorias / Especialidades (Até 3) *"
                      : "Categorias / Temas (Até 3)"}
                  </span>
                </label>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    selectedCategories.length === 3
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : selectedCategories.length > 0
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {selectedCategories.length}/3 selecionadas
                </span>
              </div>

              {/* Categorias Atualmente Selecionadas */}
              <div className="space-y-1.5">
                {selectedCategories.length === 0 ? (
                  <div className="p-3 rounded-lg bg-white border border-dashed border-amber-300 text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                    <span>Nenhuma categoria selecionada. Adicione pelo menos uma abaixo.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {selectedCategories.map((cat, idx) => {
                      const isPrimary = idx === 0;
                      return (
                        <div
                          key={cat}
                          className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg border transition-all ${
                            isPrimary
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium"
                              : "bg-white border-[#CFDCE9] text-[#152A3E]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                isPrimary
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#EEF3F9] text-[#1C5D9B]"
                              }`}
                            >
                              {isPrimary ? "1ª Principal" : `${idx + 1}ª`}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold truncate">
                              {cat}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryCategory(cat)}
                                className="px-2 py-1 text-[10.5px] font-medium text-[#1C5D9B] hover:bg-[#EEF3F9] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                title="Definir como Categoria Principal"
                              >
                                <ArrowUp size={12} />
                                <span className="hidden sm:inline">Definir como Principal</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(cat)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Remover categoria"
                              aria-label={`Remover categoria ${cat}`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Seletor para Adicionar Categoria (disponível se < 3) */}
              {selectedCategories.length < 3 ? (
                <div className="space-y-2 pt-1 border-t border-[#EEF3F9]">
                  <div className="flex items-center gap-2">
                    <select
                      id="add-category-select"
                      value=""
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setShowCustomInput(true);
                        } else if (e.target.value) {
                          handleAddCategory(e.target.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-[#CFDCE9] bg-white text-xs sm:text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                    >
                      <option value="">
                        + Adicionar {selectedCategories.length === 0 ? "1ª Categoria" : selectedCategories.length === 1 ? "2ª Categoria" : "3ª Categoria"}...
                      </option>
                      {allCategoryOptions
                        .filter((cat) => !selectedCategories.includes(cat))
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      <option value="__custom__">+ Digitar outra especialidade personalizada...</option>
                    </select>

                    {!showCustomInput && (
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(true)}
                        className="px-2.5 py-2 rounded-lg border border-[#CFDCE9] bg-white hover:bg-slate-50 text-xs text-[#1C5D9B] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Plus size={13} />
                        <span>Criar Nova</span>
                      </button>
                    )}
                  </div>

                  {/* Input para categoria personalizada */}
                  {showCustomInput && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#AECB3E]">
                      <input
                        type="text"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomCategory();
                          }
                        }}
                        placeholder="Digite o nome da nova especialidade..."
                        className="flex-1 px-2 py-1 text-xs text-[#152A3E] focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCategory}
                        className="px-2.5 py-1 rounded-md bg-[#1C5D9B] text-white text-xs font-bold hover:bg-[#154675] transition-colors cursor-pointer"
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomCategoryInput("");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Atalhos Rápidos de Categorias Disponíveis */}
                  <div className="pt-1">
                    <p className="text-[10.5px] font-mono uppercase text-[#4E6579] font-semibold mb-1.5">
                      Sugestões Rápidas:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                      {allCategoryOptions
                        .filter((cat) => !selectedCategories.includes(cat))
                        .slice(0, 12)
                        .map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleAddCategory(cat)}
                            className="px-2 py-0.5 rounded-md text-[11px] bg-[#EEF3F9] text-[#1C5D9B] hover:bg-[#1C5D9B] hover:text-white border border-[#CFDCE9] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Plus size={10} />
                            <span>{cat}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-100 text-xs text-slate-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Limite de 3 categorias preenchido. Para trocar, remova uma categoria acima.</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic">
                * O anúncio aparecerá nas buscas e filtros de todas as categorias selecionadas. A 1ª categoria é a principal e aparecerá com maior destaque.
              </p>
            </div>

            {/* 4. WHATSAPP */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-[#152A3E] mb-1 flex items-center gap-1">
                <Phone size={13} className="text-[#25D366]" />
                <span>
                  {adType === "event"
                    ? "WhatsApp para Informações / Inscrições *"
                    : "WhatsApp para Contato *"}
                </span>
              </label>
              <input
                id="prof-phone-input"
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex.: (91) 99189-1712"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] focus:border-transparent transition-all"
              />
            </div>

            {/* 5. DESCRIÇÃO */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-[#152A3E] mb-1 flex items-center gap-1">
                <FileText size={13} className="text-[#1C5D9B]" />
                <span>
                  {adType === "event"
                    ? "Descrição da Programação do Evento"
                    : adType === "company"
                    ? "Descrição dos Produtos / Serviços da Empresa"
                    : "Descrição dos Serviços do Profissional"}
                </span>
              </label>
              <textarea
                id="prof-desc-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  adType === "event"
                    ? "Descreva as atrações, horários, expositores e programação do evento..."
                    : adType === "company"
                    ? "Apresente sua empresa, produtos disponíveis, formas de atendimento e diferenciais..."
                    : "Descreva a experiência, serviços realizados, garantia e detalhes do atendimento..."
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] focus:border-transparent transition-all resize-y"
              />
            </div>

            {/* 6. BENEFÍCIO / DESCONTO PARA MORADORES */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-[#152A3E] mb-1 flex items-center gap-1">
                <Gift size={13} className="text-[#88a526]" />
                <span>
                  {adType === "event"
                    ? "Entrada / Condição Especial (Opcional)"
                    : "Condição, Desconto ou Benefício para Moradores (Opcional)"}
                </span>
              </label>
              <div className="relative">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4E6579]" />
                <input
                  id="prof-offer-input"
                  type="text"
                  value={specialOffer}
                  onChange={(e) => setSpecialOffer(e.target.value)}
                  placeholder={
                    adType === "event"
                      ? "Ex.: Entrada Franca para todos os moradores • Espaço Kids gratuito"
                      : "Ex.: 15% de desconto para moradores • Entrega grátis no apartamento • Orçamento sem taxa"
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* 7. UNIDADE DO MORADOR / ENDEREÇO (OPCIONAL) */}
            {adType === "company" && (
              <div>
                <label className="block text-xs font-mono uppercase font-medium text-[#4E6579] mb-1">
                  Torre / Apartamento (Se for morador) ou Endereço da Loja
                </label>
                <input
                  type="text"
                  value={residentUnit}
                  onChange={(e) => setResidentUnit(e.target.value)}
                  placeholder="Ex.: Torre B • Apto 1402 ou Rua dos Mundurucus, 1500"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                />
              </div>
            )}

            {/* 8. INDICAÇÃO DE MORADOR(A) - SIMPLES, DIRETA E COM ATALHOS */}
            <div
              className={`p-4 rounded-xl border-2 transition-all ${
                isResidentIndicated
                  ? "bg-emerald-50/90 border-emerald-400 shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div
                className="flex items-start justify-between gap-3 cursor-pointer"
                onClick={() => handleToggleResidentIndicated(!isResidentIndicated)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ShieldCheck
                      size={18}
                      className={isResidentIndicated ? "text-emerald-700" : "text-slate-400"}
                    />
                    <span className="text-xs font-mono uppercase font-bold text-[#152A3E]">
                      Indicado / Recomendado por Morador(a)
                    </span>
                    {isResidentIndicated && (
                      <span className="text-[10px] bg-emerald-600 text-white font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-xs">
                        Selo Ativo no Anúncio
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Marque para ativar o selo verificado de <strong>"Indicado por Morador(a)"</strong> no anúncio e aumentar a confiança dos condôminos.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="prof-resident-indicated-toggle"
                  checked={isResidentIndicated}
                  onChange={(e) => handleToggleResidentIndicated(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer shrink-0 mt-0.5"
                />
              </div>

              {isResidentIndicated && (
                <div className="mt-3.5 pt-3 border-t border-emerald-200/90 space-y-3 animate-in fade-in duration-150">
                  {/* Atalhos Rápidos com 1 Toque */}
                  <div>
                    <span className="block text-[11px] font-mono uppercase font-bold text-emerald-950 mb-1.5">
                      Atalhos Rápidos de 1 Clique:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Torre A",
                        "Torre B",
                        "Torre C",
                        "Torre D",
                        "Moradores das Torres A e B",
                        "Vários Moradores",
                        "Morador do Condomínio",
                      ].map((shortcut) => (
                        <button
                          key={shortcut}
                          type="button"
                          onClick={() => handleApplyResidentShortcut(shortcut)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 font-medium transition-colors cursor-pointer shadow-xs"
                        >
                          + {shortcut}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campo de Identificação do Morador ou Bloco */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-emerald-950 mb-1 flex items-center gap-1">
                      <User size={13} className="text-emerald-700" />
                      <span>Quem indicou (Morador / Torre / Apto) *</span>
                    </label>
                    <input
                      id="prof-resident-unit-input"
                      type="text"
                      value={blockReference}
                      onChange={(e) => setBlockReference(e.target.value)}
                      placeholder="Ex.: Indicado por morador da Torre B (Apto 1402) ou Moradores da Torre A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                    />
                    <p className="text-[10.5px] text-emerald-800 mt-1">
                      Este texto será exibido na tag oficial com escudo verde no cartão do anúncio.
                    </p>
                  </div>

                  {/* Campo Opcional: Depoimento / Comentário do Morador */}
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-emerald-950 mb-1 flex items-center gap-1">
                      <MessageSquare size={13} className="text-emerald-700" />
                      <span>Depoimento / Comentário do Morador (Opcional)</span>
                    </label>
                    <textarea
                      id="prof-resident-comment-input"
                      rows={2}
                      value={residentComment}
                      onChange={(e) => setResidentComment(e.target.value)}
                      placeholder="Ex.: Recomendo com certeza! Fez serviço no meu apartamento com muito capricho, pontualidade e preço justo."
                      className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <p className="text-[10.5px] text-emerald-800 mt-0.5">
                      Ficará registrado automaticamente nas avaliações do anúncio como recomendação de 5 estrelas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 9. TEXTO DO BOTÃO DE WHATSAPP */}
            <div>
              <label className="block text-xs font-mono uppercase font-medium text-[#4E6579] mb-1">
                Texto do Botão de WhatsApp (Opcional)
              </label>
              <input
                type="text"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder={
                  adType === "event"
                    ? "Ex.: Ver Programação / Confirmar Presença"
                    : adType === "company"
                    ? "Ex.: Fazer Pedido / Falar com a Loja"
                    : "Ex.: Solicitar Orçamento no WhatsApp"
                }
                className="w-full px-3.5 py-2 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
              />
            </div>

            {/* 10. FOTO / BANNER / LOGOTIPO */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CFDCE9] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase font-bold text-[#152A3E] flex items-center gap-1.5">
                  <Image size={15} className="text-[#1C5D9B]" />
                  <span>Foto, Logotipo ou Imagem de Capa (Opcional)</span>
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Remover foto</span>
                  </button>
                )}
              </div>

              {/* Preview */}
              {imageUrl && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#AECB3E] bg-[#152A3E] shadow-inner">
                  <img
                    src={imageUrl}
                    alt="Pré-visualização do anúncio"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
                    Foto ativa no anúncio
                  </span>
                </div>
              )}

              {/* Upload & Link Input */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  id="prof-image-url-input"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Cole o link da foto (URL)..."
                  className="w-full px-3 py-2 rounded-xl border border-[#CFDCE9] bg-white text-xs text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#EEF3F9] hover:bg-[#CFDCE9] text-[#1C5D9B] text-xs font-semibold rounded-xl border border-[#CFDCE9] transition-colors cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Upload Foto</span>
                </button>
              </div>

              {/* Presets */}
              <div>
                <span className="text-[11px] text-[#4E6579] font-medium block mb-1.5">
                  Ou escolha uma imagem predefinida:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        imageUrl === preset.url
                          ? "bg-[#1C5D9B] text-white border-[#1C5D9B] font-bold shadow-xs"
                          : "bg-white text-[#4E6579] border-[#CFDCE9] hover:bg-[#EEF3F9] hover:text-[#152A3E]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 11. OPÇÕES DE DESTAQUE E PATROCÍNIO */}
            <div className="space-y-2.5 pt-1">
              <span className="block text-xs font-mono uppercase font-bold text-[#152A3E]">
                Configuração de Visibilidade & Destaque
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 11.1 TOGGLE PATROCINADO (PAGO) */}
                <div
                  className={`p-3.5 rounded-xl border-2 transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    sponsored
                      ? "bg-amber-50/80 border-amber-400 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setSponsored(!sponsored)}
                >
                  <div className="space-y-1">
                    <label
                      htmlFor="sponsored-toggle"
                      className="text-xs font-bold text-amber-950 flex items-center gap-1.5 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Star
                        size={14}
                        className={sponsored ? "fill-amber-500 text-amber-500" : "text-slate-400"}
                      />
                      <span>⭐ Anúncio Patrocinado</span>
                    </label>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Anúncio pago ou parceiro oficial. Recebe a tag dourada <strong>PATROCINADO</strong> no catálogo e no banner.
                    </p>
                  </div>
                  <input
                    id="sponsored-toggle"
                    type="checkbox"
                    checked={sponsored}
                    onChange={(e) => setSponsored(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer shrink-0 mt-0.5"
                  />
                </div>

                {/* 11.2 TOGGLE DESTAQUE NO BANNER */}
                <div
                  className={`p-3.5 rounded-xl border-2 transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    featuredInBanner || sponsored || adType === "event"
                      ? "bg-[#EEF3F9] border-[#1C5D9B] shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => {
                    if (adType !== "event") {
                      setFeaturedInBanner(!featuredInBanner);
                    }
                  }}
                >
                  <div className="space-y-1">
                    <label
                      htmlFor="featured-banner-toggle"
                      className="text-xs font-bold text-[#152A3E] flex items-center gap-1.5 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Sparkles
                        size={14}
                        className={
                          featuredInBanner || sponsored || adType === "event"
                            ? "text-[#1C5D9B]"
                            : "text-slate-400"
                        }
                      />
                      <span>✨ Em Destaque no Topo</span>
                    </label>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {adType === "event"
                        ? "Eventos são exibidos automaticamente no carrossel de topo."
                        : "Exibe no banner rotativo de topo como recomendação ou destaque comunitário."}
                    </p>
                  </div>
                  <input
                    id="featured-banner-toggle"
                    type="checkbox"
                    disabled={adType === "event"}
                    checked={featuredInBanner || sponsored || adType === "event"}
                    onChange={(e) => setFeaturedInBanner(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 accent-[#1C5D9B] rounded cursor-pointer shrink-0 mt-0.5 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EEF3F9]">
              <div>
                {activeProfessional && onDuplicate && (
                  <button
                    id="duplicate-prof-btn"
                    type="button"
                    onClick={handleDuplicateClick}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#EEF3F9] hover:bg-[#CFDCE9] text-[#1C5D9B] hover:text-[#123F6B] text-xs font-semibold rounded-xl transition-colors border border-[#CFDCE9] cursor-pointer"
                    title="Gera uma cópia deste anúncio"
                  >
                    <Copy size={15} />
                    <span>Duplicar Anúncio</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="cancel-prof-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-[#4E6579] hover:text-[#152A3E] rounded-xl hover:bg-[#EEF3F9] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="save-prof-btn"
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <Check size={16} />
                  <span>{activeProfessional ? "Salvar Alterações" : "✓ Publicar Anúncio Agora"}</span>
                </button>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
};
