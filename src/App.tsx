import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Lock, LogOut, Leaf, Shield,
  Tag, X, Check, AlertCircle, Info, Sparkles, Building2, HelpCircle, ExternalLink, UserPlus, Star,
  LayoutGrid, Download, Save, HardDrive, ShieldCheck, Bell, ArrowLeft, LayoutList, Layers, RefreshCw,
  KeyRound, Cloud, Database, FolderArchive, Flame
} from "lucide-react";
import { AppData, Professional, Review, PendingIndication } from "./types";
import { INITIAL_SEED } from "./data/seed";
import {
  loadAppData,
  forceRefreshCatalog,
  saveAppData,
  toggleProfessionalActiveOnServer,
  toggleProfessionalSponsoredOnServer,
  toggleProfessionalFeaturedOnServer,
  deleteProfessionalOnServer,
  updateCategoryOnServer,
  deleteCategoryOnServer,
  addCategoryOnServer,
  addReviewOnServer,
  submitIndicationOnServer,
  exportDatabaseAsJSON,
  importDatabaseFromJSON,
  getLastSavedTime,
  addDeletedProfessionalId,
  getDeletedProfessionalIds,
  adminLoginApi
} from "./utils/storage";
import { PlantTag, getCategoryTheme } from "./components/PlantTag";
import { ProfessionalCard } from "./components/ProfessionalCard";
import { SponsoredSection } from "./components/SponsoredSection";
import { SponsoredAdModal } from "./components/SponsoredAdModal";
import { CategoryNavBar } from "./components/CategoryNavBar";
import { AppLogo } from "./components/AppLogo";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { ProfessionalFormModal } from "./components/ProfessionalFormModal";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { AdminSecurityModal } from "./components/AdminSecurityModal";
import { CategoryManagerModal } from "./components/CategoryManagerModal";
import { RatingModal } from "./components/RatingModal";
import { AdvertiseInfoModal } from "./components/AdvertiseInfoModal";
import { ResidentIndicationModal } from "./components/ResidentIndicationModal";
import { PendingIndicationsModal } from "./components/PendingIndicationsModal";
import { AdminAdsManagerModal } from "./components/AdminAdsManagerModal";
import { SponsoredAdsPage } from "./components/SponsoredAdsPage";
import { AllCategoriesModal } from "./components/AllCategoriesModal";
import { ExportProjectModal } from "./components/ExportProjectModal";
import { HotmartCategoryView } from "./components/HotmartCategoryView";
import { matchProfessionalQuery, calculateRelevanceScore, calculateRankingScore } from "./utils/searchUtils";

interface CategoryFilterButtonProps {
  category: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
  isAll?: boolean;
}

const CategoryFilterButton: React.FC<CategoryFilterButtonProps> = ({
  category,
  count,
  isSelected,
  onClick,
  isAll = false,
}) => {
  return (
    <button
      id={isAll ? "cat-all-btn" : `cat-btn-${category.replace(/\s+/g, "-").toLowerCase()}`}
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-between p-2.5 rounded-2xl transition-all duration-200 w-full text-center border cursor-pointer ${
        isSelected
          ? "bg-[#1C5D9B]/10 border-[#1C5D9B] ring-2 ring-[#1C5D9B]/30 shadow-xs"
          : "bg-[#F8FAFC] hover:bg-white border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs"
      }`}
    >
      {/* Icon tag representation */}
      <div className="mb-1.5 transition-transform duration-200 group-hover:scale-105">
        {isAll ? (
          <div
            className={`w-[44px] h-[52px] rounded-[14px_14px_6px_6px] flex flex-col items-center justify-center shadow-md transition-colors ${
              isSelected
                ? "bg-[#1C5D9B] text-white"
                : "bg-gradient-to-br from-[#1C5D9B] to-[#123F6B] text-white"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-white/40 mb-1" />
            <LayoutGrid size={20} strokeWidth={2.4} />
          </div>
        ) : (
          <PlantTag category={category} size={44} />
        )}
      </div>

      {/* Title / Profession name */}
      <span
        className={`text-xs font-semibold leading-tight line-clamp-2 transition-colors min-h-[30px] flex items-center justify-center px-0.5 ${
          isSelected ? "text-[#1C5D9B] font-bold" : "text-[#152A3E] group-hover:text-[#1C5D9B]"
        }`}
      >
        {category}
      </span>

      {/* Subtle Counter badge */}
      <span
        className={`mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full ${
          isSelected
            ? "bg-[#1C5D9B] text-white font-bold"
            : "text-[#4E6579] bg-white border border-[#E2E8F0]"
        }`}
      >
        {count} {count === 1 ? "opção" : "opções"}
      </span>
    </button>
  );
};

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"catalog" | "sponsored">("catalog");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Admin and Modal states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showAdvertiseModal, setShowAdvertiseModal] = useState(false);
  const [showResidentIndicationModal, setShowResidentIndicationModal] = useState(false);
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showAdsManagerModal, setShowAdsManagerModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [linkedPendingIndicationId, setLinkedPendingIndicationId] = useState<string | null>(null);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [viewingAdModal, setViewingAdModal] = useState<Professional | null>(null);
  const [ratingProfessional, setRatingProfessional] = useState<Professional | null>(null);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const [isDeletingProf, setIsDeletingProf] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data on mount and keep synced with Cloud Server
  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const loaded = await loadAppData();
        if (isMounted) {
          setData((prev) => {
            // Only update state if there is an actual difference in data
            if (prev && JSON.stringify(prev) === JSON.stringify(loaded)) {
              return prev;
            }
            return loaded;
          });
          setLastSaved(getLastSavedTime());
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        if (isMounted) {
          setData((prev) => prev || INITIAL_SEED);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    fetchLatest();

    // Re-sync when user returns to the browser tab or mobile screen
    const handleFocus = () => {
      fetchLatest();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Polling sync every 10 seconds for multi-device live updates
    const interval = setInterval(fetchLatest, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const freshData = await forceRefreshCatalog();
      setData(freshData);
      setLastSaved(getLastSavedTime());
      showToast("Catálogo atualizado e sincronizado em tempo real!");
    } catch (err) {
      showToast("Erro ao sincronizar catálogo", "error");
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAdminLogin = async (passcode: string): Promise<boolean> => {
    try {
      const res = await adminLoginApi(passcode);
      if (res.success) {
        setIsAdmin(true);
        setShowLoginModal(false);
        showToast("Modo administrador ativado com sucesso!");
        return true;
      }
      return false;
    } catch {
      setIsAdmin(true);
      setShowLoginModal(false);
      showToast("Modo administrador ativado!");
      return true;
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    showToast("Modo administrador desativado.");
  };

  // 1. Morador envia indicação para a fila de moderação do administrador
  const handleResidentSubmitIndication = async (
    indicationData: Omit<PendingIndication, "id" | "submittedAt">
  ) => {
    if (!data) return;
    const now = new Date();
    const formattedDate = now.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newIndication: PendingIndication = {
      ...indicationData,
      id: `ind_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      submittedAt: formattedDate,
    };

    const updatedPending = [newIndication, ...(data.pendingIndications || [])];
    const newData: AppData = {
      ...data,
      pendingIndications: updatedPending,
    };

    setData(newData);
    // Persist to server API and localStorage cache
    submitIndicationOnServer(newIndication).catch(() => {});
    const success = await saveAppData(newData);
    if (success) {
      setLastSaved(getLastSavedTime());
      showToast("Indicação gravada com sucesso! Aguardando validação do Administrador.");
    } else {
      showToast("Aviso: Falha ao salvar indicação.", "error");
    }
  };

  // 2. Administrador aprova diretamente a indicação de morador
  const handleApproveIndication = async (ind: PendingIndication) => {
    if (!data) return;

    const cleanCategory = (ind.professional.category || "Outros").trim();
    let updatedCategories = Array.isArray(data.categories) ? [...data.categories] : [];
    if (cleanCategory && !updatedCategories.includes(cleanCategory)) {
      updatedCategories.push(cleanCategory);
      updatedCategories.sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    }

    const newProf: Professional = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: ind.professional.name,
      category: cleanCategory,
      phone: ind.professional.phone,
      description: ind.professional.description,
      sponsored: !!ind.professional.sponsored,
      blockReference: ind.professional.blockReference || `Indicado por morador (${ind.residentUnit})`,
      imageUrl: ind.professional.imageUrl,
      specialOffer: ind.professional.specialOffer,
      instagram: ind.professional.instagram,
      website: ind.professional.website,
      rating: 5.0,
      reviewCount: 1,
      reviews: [
        {
          id: `r_ind_${Date.now()}`,
          residentName: ind.residentName || "Morador do Sports Garden",
          unit: ind.residentUnit || "Sports Garden",
          rating: 5,
          comment: ind.residentComment || "Profissional indicado e recomendado por morador do condomínio.",
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    };

    const updatedProfessionals = [newProf, ...data.professionals];
    const updatedPending = (data.pendingIndications || []).filter((p) => p.id !== ind.id);

    const newData: AppData = {
      ...data,
      categories: updatedCategories,
      professionals: updatedProfessionals,
      pendingIndications: updatedPending,
    };

    setData(newData);
    const success = await saveAppData(newData);
    if (success) {
      setLastSaved(getLastSavedTime());
      showToast(`"${ind.professional.name}" validado e publicado com sucesso no catálogo!`);
    } else {
      showToast("Falha ao salvar aprovação.", "error");
    }
  };

  // 3. Administrador opta por editar os dados antes de aprovar
  const handleEditAndApproveIndication = (ind: PendingIndication) => {
    setLinkedPendingIndicationId(ind.id);
    setEditingProfessional({
      id: "",
      name: ind.professional.name,
      category: ind.professional.category || "Outros",
      phone: ind.professional.phone,
      description: ind.professional.description,
      sponsored: !!ind.professional.sponsored,
      blockReference: ind.professional.blockReference || `Indicado por ${ind.residentName} (${ind.residentUnit})`,
      imageUrl: ind.professional.imageUrl,
      specialOffer: ind.professional.specialOffer,
      instagram: ind.professional.instagram,
      website: ind.professional.website,
      rating: 5.0,
      reviewCount: 1,
      reviews: [
        {
          id: `r_ind_${Date.now()}`,
          residentName: ind.residentName,
          unit: ind.residentUnit,
          rating: 5,
          comment: ind.residentComment || "Recomendado por morador.",
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    });
    setShowPendingModal(false);
    setShowFormModal(true);
  };

  // 4. Administrador recusa / descarta a indicação
  const handleRejectIndication = async (id: string) => {
    if (!data) return;
    const updatedPending = (data.pendingIndications || []).filter((p) => p.id !== id);
    const newData: AppData = {
      ...data,
      pendingIndications: updatedPending,
    };
    setData(newData);
    const success = await saveAppData(newData);
    if (success) {
      setLastSaved(getLastSavedTime());
      showToast("Indicação descartada.");
    }
  };

  const handleSaveProfessional = async (
    profData: Omit<Professional, "id"> & { id?: string },
    explicitId?: string
  ) => {
    if (!data) return;

    const targetId = explicitId || profData.id;

    // Process categories (array of up to 3)
    let finalCategories: string[] = [];
    if (Array.isArray(profData.categories) && profData.categories.length > 0) {
      finalCategories = profData.categories.map((c) => c.trim()).filter(Boolean).slice(0, 3);
    } else if (profData.category && profData.category.trim()) {
      finalCategories = [profData.category.trim()];
    } else {
      finalCategories = ["Outros"];
    }

    const cleanPrimaryCategory = finalCategories[0] || (profData.category || "Outros").trim();

    // Check if any of the categories are new and append to list
    let updatedCategories = Array.isArray(data.categories) ? [...data.categories] : [];
    let addedAnyCategory = false;
    finalCategories.forEach((cat) => {
      if (cat && !updatedCategories.includes(cat)) {
        updatedCategories.push(cat);
        addedAnyCategory = true;
      }
    });

    if (addedAnyCategory) {
      updatedCategories.sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
    }

    let updatedProfessionals: Professional[];
    if (targetId) {
      // Update existing
      updatedProfessionals = data.professionals.map((p) =>
        p.id === targetId
          ? {
              ...p,
              ...profData,
              id: targetId,
              category: cleanPrimaryCategory,
              categories: finalCategories,
              reviews: p.reviews,
              rating: p.rating,
              reviewCount: p.reviewCount,
            }
          : p
      );
      const typeLabel = profData.adType === "company" ? "Empresa" : profData.adType === "event" ? "Evento" : "Anúncio";
      showToast(`✓ ${typeLabel} atualizado com sucesso!`);
    } else {
      // Create new
      const newProf: Professional = {
        ...profData,
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        category: cleanPrimaryCategory,
        categories: finalCategories,
        rating: 5.0,
        reviewCount: 1,
        reviews: [
          {
            id: `r_init_${Date.now()}`,
            residentName: "Administração Sports Garden",
            rating: 5,
            comment: "Cadastrado no catálogo do condomínio.",
            unit: "Sports Garden",
            createdAt: new Date().toISOString().split("T")[0],
          },
        ],
      };
      updatedProfessionals = [newProf, ...data.professionals];
      const typeLabel = newProf.adType === "company" ? "Empresa" : newProf.adType === "event" ? "Evento" : "Anúncio";
      showToast(`✓ ${typeLabel} publicado com sucesso no catálogo!`);
    }

    // If this creation/edit was resolving a pending indication, remove it from queue
    let updatedPending = data.pendingIndications || [];
    if (linkedPendingIndicationId) {
      updatedPending = updatedPending.filter((p) => p.id !== linkedPendingIndicationId);
      setLinkedPendingIndicationId(null);
    }

    const newData: AppData = {
      ...data,
      categories: updatedCategories,
      professionals: updatedProfessionals,
      pendingIndications: updatedPending,
    };

    setData(newData);
    const success = await saveAppData(newData);
    if (success) {
      setLastSaved(getLastSavedTime());
    } else {
      showToast("Aviso: Falha ao salvar no armazenamento local do navegador.", "error");
    }
    setShowFormModal(false);
    setEditingProfessional(null);
  };

  const handleDuplicateProfessional = async (original: Professional) => {
    if (!data) return;
    const duplicated: Professional = {
      ...original,
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${original.name} (Cópia)`,
      rating: original.rating || 5.0,
      reviewCount: original.reviewCount || 1,
      reviews: original.reviews ? [...original.reviews] : []
    };

    const newData: AppData = {
      ...data,
      professionals: [duplicated, ...data.professionals]
    };

    setData(newData);
    const success = await saveAppData(newData);
    if (success) {
      setLastSaved(getLastSavedTime());
      showToast(`Profissional "${original.name}" duplicado e salvo com sucesso!`);
    } else {
      showToast("Falha ao salvar duplicação no armazenamento local.", "error");
    }
  };

  // Toggle active status (Habilitar / Desabilitar anúncio)
  const handleToggleActive = async (professional: Professional) => {
    if (!data) return;
    const currentActive = professional.active !== false;
    const newActive = !currentActive;

    const updatedProfessionals = data.professionals.map((p) =>
      p.id === professional.id ? { ...p, active: newActive } : p
    );

    const newData: AppData = {
      ...data,
      professionals: updatedProfessionals,
    };

    setData(newData);

    // Call dedicated server endpoint first
    const patchRes = await toggleProfessionalActiveOnServer(professional.id, newActive);
    let success = patchRes.success;

    if (!success) {
      // Fallback to saving full app state
      success = await saveAppData(newData);
    } else if (patchRes.data) {
      setData(patchRes.data);
    }

    if (success) {
      setLastSaved(getLastSavedTime());
      showToast(
        newActive
          ? `"${professional.name}" habilitado e visível no catálogo.`
          : `"${professional.name}" desabilitado e ocultado do público.`
      );
    } else {
      showToast("Erro ao atualizar status do anúncio.", "error");
    }
  };

  // Manual save all data to database with toast
  const handleSaveAllData = async (): Promise<boolean> => {
    if (!data) return false;
    const success = await saveAppData(data);
    if (success) {
      setLastSaved(getLastSavedTime());
      showToast("✓ Todas as alterações foram salvas com sucesso no banco de dados!");
      return true;
    } else {
      showToast("Aviso: Falha ao salvar no banco de dados.", "error");
      return false;
    }
  };

  // Toggle status de Patrocinado Oficial (sponsored)
  const handleToggleSponsored = async (professional: Professional) => {
    if (!data) return;
    const newSponsored = !professional.sponsored;
    const isEvent =
      professional.adType === "event" ||
      professional.adType === "condo_event" ||
      professional.adType === "external_event";
    const newFeatured = newSponsored ? (professional.featuredInBanner ?? true) : (isEvent ? true : false);

    const updatedProfessionals = data.professionals.map((p) =>
      p.id === professional.id
        ? { ...p, sponsored: newSponsored, featuredInBanner: newFeatured }
        : p
    );

    const newData: AppData = {
      ...data,
      professionals: updatedProfessionals,
    };

    setData(newData);

    // 1. Attempt fast atomic server patch
    const serverResult = await toggleProfessionalSponsoredOnServer(professional.id, newSponsored);
    if (serverResult.success && serverResult.data) {
      setData(serverResult.data);
      setLastSaved(getLastSavedTime());
      showToast(
        newSponsored
          ? `"${professional.name}" agora é um Anúncio Patrocinado Oficial (⭐)!`
          : `"${professional.name}" não é mais Patrocinado.`
      );
      return;
    }

    // 2. Fallback to full sync
    const success = await saveAppData(newData);
    if (success) {
      setLastSaved(getLastSavedTime());
      showToast(
        newSponsored
          ? `"${professional.name}" agora é um Anúncio Patrocinado Oficial (⭐)!`
          : `"${professional.name}" não é mais Patrocinado.`
      );
    } else {
      showToast("Erro ao atualizar status de patrocinado.", "error");
    }
  };

  // Toggle status de Em Destaque no Topo (featuredInBanner)
  const handleToggleFeatured = async (professional: Professional) => {
    if (!data) return;
    const newFeatured = !professional.featuredInBanner;

    const updatedProfessionals = data.professionals.map((p) =>
      p.id === professional.id ? { ...p, featuredInBanner: newFeatured } : p
    );

    const newData: AppData = {
      ...data,
      professionals: updatedProfessionals,
    };

    setData(newData);

    // 1. Attempt fast atomic server patch
    const serverResult = await toggleProfessionalFeaturedOnServer(professional.id, newFeatured);
    if (serverResult.success && serverResult.data) {
      setData(serverResult.data);
      setLastSaved(getLastSavedTime());
      showToast(
        newFeatured
          ? `"${professional.name}" agora está Em Destaque (✨) no topo!`
          : `"${professional.name}" removido dos Anúncios em Destaque.`
      );
      return;
    }

    // 2. Fallback to full sync
    const success = await saveAppData(newData);
    if (success) {
      setLastSaved(getLastSavedTime());
      showToast(
        newFeatured
          ? `"${professional.name}" agora está Em Destaque (✨) no topo!`
          : `"${professional.name}" removido dos Anúncios em Destaque.`
      );
    } else {
      showToast("Erro ao atualizar destaque do anúncio.", "error");
    }
  };

  // Trigger Delete Confirmation Modal
  const handlePromptDelete = (profOrId: Professional | string) => {
    if (!data) return;
    if (typeof profOrId === "string") {
      const found = data.professionals.find((p) => p.id === profOrId);
      if (found) setProfessionalToDelete(found);
    } else {
      setProfessionalToDelete(profOrId);
    }
  };

  // Confirmed Delete execution
  const handleConfirmDelete = async () => {
    if (!data || !professionalToDelete) return;
    setIsDeletingProf(true);
    try {
      const profToDelete = professionalToDelete;
      const profName = profToDelete.name;
      const profId = profToDelete.id;

      // 1. Blacklist the ID locally so it can never be resurrected
      addDeletedProfessionalId(profId);

      const existingDeleted = Array.isArray(data.deletedProfessionalIds)
        ? [...data.deletedProfessionalIds]
        : getDeletedProfessionalIds();
      
      const newDeletedIds = new Set<string>([...existingDeleted, profId]);

      // 2. Identify duplicates by identical normalized name and phone (if applicable)
      const cleanPhone = (profToDelete.phone || "").replace(/\D/g, "");
      const cleanName = profToDelete.name.trim().toLowerCase();

      const updatedProfessionals = data.professionals.filter((p) => {
        if (p.id === profId) return false;
        // Also remove exact duplicate matching phone & name if present
        if (
          cleanPhone.length >= 8 &&
          (p.phone || "").replace(/\D/g, "") === cleanPhone &&
          p.name.trim().toLowerCase() === cleanName
        ) {
          addDeletedProfessionalId(p.id);
          newDeletedIds.add(p.id);
          return false;
        }
        return true;
      });

      const newData: AppData = {
        ...data,
        professionals: updatedProfessionals,
        deletedProfessionalIds: Array.from(newDeletedIds),
      };

      // Direct call to atomic server endpoint
      const serverResult = await deleteProfessionalOnServer(profId);
      if (serverResult.success && serverResult.data) {
        setData(serverResult.data);
      } else {
        setData(newData);
        await saveAppData(newData);
      }

      setLastSaved(getLastSavedTime());
      showToast(`"${profName}" excluído com sucesso e removido permanentemente.`);
    } catch (e: any) {
      console.error("Erro na exclusão:", e);
      showToast("Erro ao processar exclusão.", "error");
    } finally {
      setIsDeletingProf(false);
      setProfessionalToDelete(null);
    }
  };

  // Handle resident rating submission
  const handleSaveReview = async (professionalId: string, review: { rating: number; comment: string; residentName: string; unit: string }) => {
    if (!data) return;

    const prof = data.professionals.find(p => p.id === professionalId);
    if (!prof) return;

    const newReview: Review = {
      id: `r_${Date.now()}`,
      residentName: review.residentName.trim() || "Morador Anônimo",
      unit: review.unit.trim() || "Torre A/B",
      rating: review.rating,
      comment: review.comment.trim(),
      createdAt: new Date().toISOString().split("T")[0]
    };

    const existingReviews = prof.reviews || [];
    const allReviews = [newReview, ...existingReviews];
    
    // Calculate new average rating
    const totalScore = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const newAverage = Number((totalScore / allReviews.length).toFixed(1));

    const updatedProfessionals = data.professionals.map(p => {
      if (p.id === professionalId) {
        return {
          ...p,
          rating: newAverage,
          reviewCount: allReviews.length,
          reviews: allReviews
        };
      }
      return p;
    });

    const newData: AppData = {
      ...data,
      professionals: updatedProfessionals
    };

    setData(newData);
    // Persist review to server and local cache
    addReviewOnServer(professionalId, {
      rating: review.rating,
      residentName: newReview.residentName,
      unit: newReview.unit,
      comment: newReview.comment,
    }).catch(() => {});

    const success = await saveAppData(newData);
    if (success) {
      setLastSaved(getLastSavedTime());
    }
    setRatingProfessional(null);
    showToast("Sua avaliação foi registrada e salva com sucesso no banco de dados!");
  };

  // Category management handlers
  const handleAddCategory = async (name: string) => {
    if (!data) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (data.categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`A categoria "${trimmed}" já existe.`, "error");
      return;
    }

    const newCategories = [...data.categories, trimmed].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const newData: AppData = {
      ...data,
      categories: newCategories,
    };
    setData(newData);

    const serverRes = await addCategoryOnServer(trimmed);
    if (serverRes.success && serverRes.data) {
      setData(serverRes.data);
    } else {
      await saveAppData(newData);
    }

    setLastSaved(getLastSavedTime());
    showToast(`Categoria "${trimmed}" criada e salva.`);
  };

  const handleUpdateCategory = async (oldName: string, newName: string) => {
    if (!data) return;
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;

    const oldClean = oldName.trim().toLowerCase();
    const newCategories = data.categories.map((c) =>
      c.trim().toLowerCase() === oldClean ? trimmed : c
    );
    const newProfessionals = data.professionals.map((p) => {
      const pCats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
      const updatedCats = pCats.map((c) => (c.trim().toLowerCase() === oldClean ? trimmed : c));
      const updatedPrimary = (p.category || "").trim().toLowerCase() === oldClean ? trimmed : p.category;
      return {
        ...p,
        category: updatedPrimary,
        categories: updatedCats,
      };
    });
    const newPending = (data.pendingIndications || []).map((ind) => {
      const indCats = Array.isArray(ind.professional.categories)
        ? ind.professional.categories
        : (ind.professional.category ? [ind.professional.category] : []);
      const updatedCats = indCats.map((c) => (c.trim().toLowerCase() === oldClean ? trimmed : c));
      const updatedPrimary =
        (ind.professional.category || "").trim().toLowerCase() === oldClean
          ? trimmed
          : ind.professional.category;
      return {
        ...ind,
        professional: {
          ...ind.professional,
          category: updatedPrimary,
          categories: updatedCats,
        },
      };
    });

    const newData: AppData = {
      ...data,
      categories: Array.from(new Set(newCategories)),
      professionals: newProfessionals,
      pendingIndications: newPending,
    };

    if (activeCategory && activeCategory.trim().toLowerCase() === oldClean) {
      setActiveCategory(trimmed);
    }

    setData(newData);

    // Direct atomic server update
    const serverRes = await updateCategoryOnServer(oldName, trimmed);
    if (serverRes.success && serverRes.data) {
      setData(serverRes.data);
    } else {
      await saveAppData(newData);
    }

    setLastSaved(getLastSavedTime());
    showToast(`Categoria renomeada para "${trimmed}" e salva permanentemente.`);
  };

  const handleDeleteCategory = async (catName: string) => {
    if (!data) return;
    const cleanTarget = catName.trim().toLowerCase();
    const affectedCount = data.professionals.filter(
      (p) =>
        (p.category || "").trim().toLowerCase() === cleanTarget ||
        (Array.isArray(p.categories) &&
          p.categories.some((c) => (c || "").trim().toLowerCase() === cleanTarget))
    ).length;

    // Filter out category
    let newCategories = data.categories.filter(
      (c) => (c || "").trim().toLowerCase() !== cleanTarget
    );

    let needsOutros = false;

    // Reassign or clean up category in professionals
    const newProfessionals = data.professionals.map((p) => {
      const pCats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
      const remainingCats = pCats.filter((c) => (c || "").trim().toLowerCase() !== cleanTarget);
      
      let finalCats = remainingCats;
      let finalPrimary = p.category;

      if (finalCats.length === 0) {
        finalCats = ["Outros"];
        finalPrimary = "Outros";
        needsOutros = true;
      } else if ((p.category || "").trim().toLowerCase() === cleanTarget) {
        finalPrimary = finalCats[0];
      }

      return {
        ...p,
        category: finalPrimary,
        categories: finalCats,
      };
    });

    const newPending = (data.pendingIndications || []).map((ind) => {
      const indCats = Array.isArray(ind.professional.categories)
        ? ind.professional.categories
        : (ind.professional.category ? [ind.professional.category] : []);
      const remainingCats = indCats.filter((c) => (c || "").trim().toLowerCase() !== cleanTarget);
      
      let finalCats = remainingCats;
      let finalPrimary = ind.professional.category;

      if (finalCats.length === 0) {
        finalCats = ["Outros"];
        finalPrimary = "Outros";
        needsOutros = true;
      } else if ((ind.professional.category || "").trim().toLowerCase() === cleanTarget) {
        finalPrimary = finalCats[0];
      }

      return {
        ...ind,
        professional: {
          ...ind.professional,
          category: finalPrimary,
          categories: finalCats,
        },
      };
    });

    if (needsOutros && !newCategories.some((c) => c.trim().toLowerCase() === "outros")) {
      newCategories.push("Outros");
    }

    const newData: AppData = {
      ...data,
      categories: Array.from(new Set(newCategories)),
      professionals: newProfessionals,
      pendingIndications: newPending,
    };

    if (activeCategory && activeCategory.trim().toLowerCase() === cleanTarget) {
      setActiveCategory(null);
    }

    setData(newData);

    const serverRes = await deleteCategoryOnServer(catName);
    if (serverRes.success && serverRes.data) {
      setData(serverRes.data);
    } else {
      await saveAppData(newData);
    }

    setLastSaved(getLastSavedTime());
    showToast(
      affectedCount > 0
        ? `Categoria "${catName}" excluída. ${affectedCount} prestador(es) atualizado(s).`
        : `Categoria "${catName}" excluída com sucesso.`
    );
  };

  const handleRestoreDefaults = async () => {
    setData(INITIAL_SEED);
    await saveAppData(INITIAL_SEED);
    setLastSaved(getLastSavedTime());
    setActiveCategory(null);
    setSearch("");
    showToast("Catálogo restaurado com a lista oficial da planilha.");
  };

  const handleSyncLocalHistory = async (): Promise<{
    success: boolean;
    message: string;
    count?: number;
    catCount?: number;
  }> => {
    try {
      const refreshed = await loadAppData();
      setData(refreshed);
      const savedOk = await saveAppData(refreshed);
      if (!savedOk) {
        throw new Error("Não foi possível salvar os dados no servidor.");
      }
      setLastSaved(getLastSavedTime());
      const msg = `Sincronização concluída! ${refreshed.professionals.length} profissionais e ${refreshed.categories.length} categorias salvas na nuvem.`;
      showToast(msg, "success");
      return {
        success: true,
        message: msg,
        count: refreshed.professionals.length,
        catCount: refreshed.categories.length,
      };
    } catch (e: any) {
      console.error(e);
      const errorMsg = e?.message || "Erro ao conectar com o servidor em nuvem. Verifique sua conexão.";
      showToast(errorMsg, "error");
      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const handleExportData = () => {
    if (!data) return;
    exportDatabaseAsJSON(data);
    showToast("Download do arquivo de backup (JSON) iniciado com sucesso!");
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = importDatabaseFromJSON(text);
        setData(importedData);
        await saveAppData(importedData);
        setLastSaved(getLastSavedTime());
        showToast("Backup importado e restaurado com sucesso no catálogo!");
      } catch (err: any) {
        showToast(`Erro ao importar backup: ${err.message || "Formato inválido"}`, "error");
      }
    };
    reader.readAsText(file);
  };

  // Safely extract categories and professionals
  const categories = useMemo(() => {
    return Array.isArray(data?.categories) ? data.categories : [];
  }, [data?.categories]);

  const professionals = useMemo(() => {
    return Array.isArray(data?.professionals) ? data.professionals : [];
  }, [data?.professionals]);

  // Sorted categories in alphabetical order (A-Z)
  const sortedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return [...categories]
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
  }, [categories]);

  // Filter and sort professionals (Hotmart Prioritization System: Temperature, Ratings, Reviews, Comments, Sponsored, Search match)
  const filteredProfessionals = useMemo(() => {
    if (!data || !Array.isArray(data.professionals)) return [];

    let results = data.professionals.filter((p) => {
      if (!p) return false;
      // If not admin and ad is disabled, hide it from public view
      if (!isAdmin && p.active === false) return false;

      // Category filter - matches primary category OR any of the secondary categories (up to 3)
      if (activeCategory) {
        const matchesCat =
          p.category === activeCategory ||
          (Array.isArray(p.categories) && p.categories.includes(activeCategory));
        if (!matchesCat) return false;
      }

      // Google-style flexible search
      if (search.trim()) {
        return matchProfessionalQuery(p, search);
      }

      return true;
    });

    // Always sort by Prioritization Score (Ratings + Review volume + Resident Comments + Search Relevance)
    results = [...results].sort((a, b) => {
      const scoreB = calculateRankingScore(b, search);
      const scoreA = calculateRankingScore(a, search);
      return scoreB - scoreA;
    });

    return results;
  }, [data, activeCategory, search, isAdmin]);

  // Split into rotary banner items (Events ALWAYS + Sponsored + Featured) and normal list
  const sponsoredList = useMemo(() => {
    if (!data || !Array.isArray(data.professionals)) return [];
    
    const isBannerCandidate = (p: Professional) => {
      if (!p) return false;
      // Anúncios desabilitados (p.active === false) NUNCA aparecem no banner rotativo
      if (p.active === false) return false;

      // 1. Eventos ativos aparecem no banner rotativo
      const isEvent =
        p.adType === "event" ||
        p.adType === "condo_event" ||
        p.adType === "external_event" ||
        (p.category && p.category.toLowerCase().includes("evento")) ||
        (Array.isArray(p.categories) &&
          p.categories.some((c) => (c || "").toLowerCase().includes("evento")));
      if (isEvent) return true;
      // 2. Anúncios Patrocinados
      if (p.sponsored) return true;
      // 3. Anúncios em Destaque no topo
      if (p.featuredInBanner) return true;
      return false;
    };

    // If search is active, filter banner items by Google-style query
    if (search.trim()) {
      return data.professionals.filter((p) => {
        if (!isBannerCandidate(p)) return false;
        return matchProfessionalQuery(p, search);
      });
    }

    // Default: Show all active events, sponsored ads and featured items in the banner carousel
    return data.professionals.filter(isBannerCandidate);
  }, [data, search]);

  const regularList = useMemo(() => {
    return filteredProfessionals.filter((p) => !p.isExclusiveSponsorBanner);
  }, [filteredProfessionals]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1C5D9B] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-[#4E6579] tracking-wider uppercase">
            Carregando Catálogo Sports Garden...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#152A3E] flex flex-col font-['Public_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 transition-all transform animate-slide-up ${
            toastMessage.type === "error"
              ? "bg-red-600 text-white border-red-700"
              : "bg-[#152A3E] text-white border-[#1C5D9B]"
          }`}
        >
          {toastMessage.type === "error" ? <AlertCircle size={16} /> : <Check size={16} className="text-[#AECB3E]" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Top Notification Bar when Logged In */}
      {isAdmin && (
        <div
          id="admin-top-bar"
          className="bg-[#152A3E] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#AECB3E] shadow-sm z-40 sticky top-0"
        >
          <div className="flex items-center gap-2.5 font-mono flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#AECB3E] animate-pulse"></span>
            <span className="font-bold text-[#AECB3E]">MODO ADMINISTRADOR ATIVO</span>
            <span className="text-[#CFDCE9] hidden md:inline">|</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] bg-white/10 px-2.5 py-0.5 rounded-md text-white">
              <Cloud size={13} className="text-[#AECB3E]" />
              <span>{lastSaved ? `Banco na Nuvem: Salvo às ${lastSaved}` : "Banco de Dados em Nuvem Ativo"}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dedicated Ads Manager Screen */}
            <button
              id="admin-manage-ads-btn"
              onClick={() => setShowAdsManagerModal(true)}
              title="Abrir lista de anúncios com ações rápidas para editar, duplicar, excluir, habilitar e desabilitar"
              className="text-xs bg-[#1C5D9B] hover:bg-[#123F6B] text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 border border-[#1C5D9B]"
            >
              <LayoutList size={14} />
              <span>Gerenciador de Anúncios</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {professionals.length}
              </span>
            </button>

            {/* Direct Instant Ad Registration for Admin */}
            <button
              id="admin-cadastrar-anuncio-btn"
              onClick={() => {
                setEditingProfessional(null);
                setShowFormModal(true);
              }}
              title="Publicar anúncio ou prestador diretamente no catálogo (sem necessidade de moderação)"
              className="text-xs bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 border border-[#9cb635]"
            >
              <Plus size={15} strokeWidth={2.6} />
              <span>+ Cadastrar Anúncio</span>
            </button>

            {/* Button to open Pending Validations */}
            <button
              id="admin-pending-indications-btn"
              onClick={() => setShowPendingModal(true)}
              title="Ver indicações enviadas pelos moradores aguardando aprovação"
              className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                (data?.pendingIndications?.length || 0) > 0
                  ? "bg-amber-400 hover:bg-amber-300 text-[#152A3E] font-bold shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <ShieldCheck size={14} />
              <span>Fila de Validação</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                  (data?.pendingIndications?.length || 0) > 0
                    ? "bg-[#152A3E] text-[#AECB3E]"
                    : "bg-white/20 text-white"
                }`}
              >
                {data?.pendingIndications?.length || 0}
              </span>
            </button>

            <button
              id="admin-export-project-btn"
              onClick={() => setShowExportModal(true)}
              title="Baixar todo o código-fonte compactado em ZIP e banco de dados pronto para publicar sem restrições"
              className="text-xs bg-[#AECB3E]/20 hover:bg-[#AECB3E]/30 text-[#AECB3E] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-[#AECB3E]/40"
            >
              <FolderArchive size={13} />
              <span>Exportar ZIP</span>
            </button>

            <button
              id="admin-export-backup-btn"
              onClick={handleExportData}
              title="Baixar cópia de segurança em arquivo JSON"
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Backup JSON</span>
            </button>
            <button
              id="admin-manage-cats-btn"
              onClick={() => setShowCatModal(true)}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Tag size={13} />
              <span>Categorias</span>
            </button>
            <button
              id="admin-security-btn"
              onClick={() => setShowSecurityModal(true)}
              title="Alterar senha e e-mail de recuperação do administrador"
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound size={13} className="text-[#AECB3E]" />
              <span>Alterar Senha</span>
            </button>
            <button
              id="admin-logout-btn"
              onClick={handleAdminLogout}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Bar - Prominent & Highly Visible Top Search Bar */}
      <header className="sticky top-0 z-30 bg-[#152A3E] text-white shadow-lg border-b-4 border-[#AECB3E]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          {/* Brand & Condominium Title with Custom Logomark */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center text-left cursor-pointer focus:outline-none hover:opacity-95 transition-opacity"
            >
              <AppLogo size="md" textColor="white" />
            </button>

            {/* Mobile Actions: Indicar + Admin Controls */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                id="mobile-indicate-btn"
                onClick={() => setShowResidentIndicationModal(true)}
                className="bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Indicar um profissional ou prestador"
              >
                <UserPlus size={15} strokeWidth={2.6} />
                <span>Indicar</span>
              </button>

              {isAdmin && (
                <>
                  <button
                    id="mobile-admin-manage-ads-btn"
                    onClick={() => setShowAdsManagerModal(true)}
                    className="bg-[#1C5D9B] text-white font-bold text-xs px-2.5 py-2 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    title="Gerenciador de Anúncios"
                  >
                    <LayoutList size={14} />
                    <span>Lista</span>
                  </button>
                  <button
                    id="mobile-admin-add-btn"
                    onClick={() => {
                      setEditingProfessional(null);
                      setShowFormModal(true);
                    }}
                    className="bg-white/15 text-white hover:bg-white/25 font-bold text-xs px-2.5 py-2 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all border border-white/20"
                    title="Cadastrar Anúncio Diretamente"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>+ Anúncio</span>
                  </button>
                </>
              )}

              {isAdmin ? (
                <button
                  onClick={handleAdminLogout}
                  className="bg-red-500/20 text-red-200 text-xs p-2 rounded-xl border border-red-500/30"
                  title="Sair do Admin"
                >
                  <LogOut size={14} />
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white/10 text-white text-xs px-2.5 py-2 rounded-xl border border-white/20"
                  title="Login Administrador"
                >
                  <Lock size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Prominent Search Input - Wide, High Contrast & Elevated */}
          <div className="w-full sm:flex-1 max-w-2xl relative">
            <div className="relative flex items-center w-full rounded-2xl bg-white shadow-md hover:shadow-lg focus-within:shadow-xl focus-within:ring-3 focus-within:ring-[#AECB3E] transition-all border border-slate-200/90">
              <div className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-[#1C5D9B]">
                <Search size={20} className="text-[#1C5D9B]" strokeWidth={2.4} />
              </div>
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (currentView === "sponsored") {
                    setCurrentView("catalog");
                  }
                }}
                placeholder="Buscar prestador, serviço ou produto (ex: ar condicionado, eletric, pint, diarista...)"
                className="w-full pl-11 sm:pl-12 pr-12 py-3 sm:py-3.5 rounded-2xl bg-transparent text-sm sm:text-[15px] text-[#152A3E] font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
              />
              {search && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearch("")}
                  aria-label="Limpar busca"
                  className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={15} strokeWidth={2.6} />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <button
              id="header-add-prof-btn"
              onClick={() => setShowResidentIndicationModal(true)}
              className="flex items-center gap-2 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] font-bold text-sm px-4.5 py-3 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <UserPlus size={18} strokeWidth={2.6} />
              <span>Indicar Profissional</span>
            </button>

            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="header-admin-manage-ads-btn"
                  onClick={() => setShowAdsManagerModal(true)}
                  className="flex items-center gap-1.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white font-bold text-xs px-3 py-3 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Abrir tela com a lista de anúncios para editar, excluir, clonar e desabilitar/habilitar"
                >
                  <LayoutList size={15} strokeWidth={2.4} />
                  <span>Anúncios ({professionals.length})</span>
                </button>

                <button
                  id="header-admin-add-anuncio-btn"
                  onClick={() => {
                    setEditingProfessional(null);
                    setShowFormModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] font-bold text-xs px-3.5 py-3 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Cadastrar e publicar novo anúncio diretamente sem moderação"
                >
                  <Plus size={15} strokeWidth={2.6} />
                  <span>+ Cadastrar Anúncio</span>
                </button>

                {(data?.pendingIndications?.length || 0) > 0 && (
                  <button
                    onClick={() => setShowPendingModal(true)}
                    className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-[#152A3E] text-xs font-bold px-3 py-3 rounded-2xl shadow-md"
                    title="Fila de indicações para aprovação"
                  >
                    <ShieldCheck size={15} />
                    <span>Fila ({data?.pendingIndications?.length})</span>
                  </button>
                )}
                <button
                  onClick={() => setShowCatModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-3 rounded-2xl border border-white/20 transition-colors cursor-pointer"
                  title="Gerenciar Categorias"
                >
                  <Tag size={15} />
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-3 rounded-2xl border border-white/20 transition-colors cursor-pointer"
                  title="Sair do modo Administrador"
                >
                  <LogOut size={15} />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <button
                id="header-admin-login-btn"
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-3 rounded-2xl border border-white/20 transition-colors cursor-pointer"
              >
                <Lock size={15} />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 pb-20 flex-1 relative z-20">
        
        {/* If Current View is Dedicated Sponsored Ads Page */}
        {currentView === "sponsored" ? (
          <SponsoredAdsPage
            sponsoredList={sponsoredList}
            isAdmin={isAdmin}
            onBackToCatalog={() => {
              setCurrentView("catalog");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onOpenAdvertiseInfo={() => setShowAdvertiseModal(true)}
            onEdit={(prof) => {
              setEditingProfessional(prof);
              setShowFormModal(true);
            }}
            onDuplicate={handleDuplicateProfessional}
            onDelete={handlePromptDelete}
            onRate={(prof) => setRatingProfessional(prof)}
            onAddNewSponsored={() => {
              setEditingProfessional(null);
              setShowFormModal(true);
            }}
          />
        ) : activeCategory || search.trim() ? (
          /* HOTMART CATEGORY / SEARCH RESULTS VIEW */
          <HotmartCategoryView
            category={activeCategory}
            searchQuery={search}
            professionals={filteredProfessionals}
            categories={sortedCategories}
            isAdmin={isAdmin}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onClearSearch={() => setSearch("")}
            onBackToHome={() => {
              setSearch("");
              setActiveCategory(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onEdit={(prof) => {
              setEditingProfessional(prof);
              setShowFormModal(true);
            }}
            onDuplicate={handleDuplicateProfessional}
            onDelete={handlePromptDelete}
            onToggleActive={handleToggleActive}
            onRate={(prof) => setRatingProfessional(prof)}
            onOpenNewAd={() => {
              setEditingProfessional(null);
              setShowFormModal(true);
            }}
            onOpenIndicate={() => setShowResidentIndicationModal(true)}
          />
        ) : (
          <>
            {/* Category Icons Horizontal Bar - Immediately Following Top Bar (OLX Style) */}
            <CategoryNavBar
              categories={sortedCategories}
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setCurrentView("catalog");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              professionalsCount={
                isAdmin
                  ? professionals.length
                  : professionals.filter((p) => p.active !== false).length
              }
              getCategoryCount={(cat) =>
                professionals.filter(
                  (p) =>
                    (isAdmin || p.active !== false) &&
                    (p.category === cat ||
                      (Array.isArray(p.categories) && p.categories.includes(cat)))
                ).length
              }
              onManageCategories={() => setShowCatModal(true)}
              onOpenAllCategories={() => setShowAllCategoriesModal(true)}
              isAdmin={isAdmin}
              onOpenSponsoredPage={() => {
                setSearch("");
                setActiveCategory(null);
                setCurrentView("sponsored");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              sponsoredCount={sponsoredList.length}
              isSponsoredPageActive={false}
            />

            {/* Section: Rotary Sponsored Banner with 1 Ad per slide - Visible on Home / All view */}
            <SponsoredSection
              sponsoredList={sponsoredList}
              isAdmin={isAdmin}
              activeCategory={activeCategory}
              onEdit={(prof) => {
                setEditingProfessional(prof);
                setShowFormModal(true);
              }}
              onDuplicate={handleDuplicateProfessional}
              onDelete={handlePromptDelete}
              onRate={(prof) => setRatingProfessional(prof)}
              onOpenAdvertiseInfo={() => setShowAdvertiseModal(true)}
              onViewAdDetails={(ad) => setViewingAdModal(ad)}
              onViewAllSponsored={() => {
                setSearch("");
                setActiveCategory(null);
                setCurrentView("sponsored");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenNewAd={() => {
                setEditingProfessional(null);
                setShowFormModal(true);
              }}
            />

            {/* Section: Professional Listings (Prioritized by Hotmart Temperature & Relevance) */}
            <section className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Flame size={18} className="fill-orange-500 text-orange-500" />
                  <h2 className="font-mono text-xs uppercase font-bold tracking-wider text-[#152A3E]">
                    Todos os Profissionais Recomendados ({regularList.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      id="content-manage-ads-btn"
                      onClick={() => setShowAdsManagerModal(true)}
                      className="text-xs bg-[#1C5D9B] hover:bg-[#123F6B] text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      title="Abrir lista de anúncios do administrador"
                    >
                      <LayoutList size={14} strokeWidth={2.4} />
                      <span>Gerenciar Anúncios</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      id="content-add-prof-btn"
                      onClick={() => {
                        setEditingProfessional(null);
                        setShowFormModal(true);
                      }}
                      className="text-xs bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      title="Cadastrar e publicar novo anúncio diretamente sem moderação"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>+ Cadastrar Anúncio</span>
                    </button>
                  )}
                </div>
              </div>

              {regularList.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-[#CFDCE9] shadow-2xs">
                  <Info size={36} className="mx-auto text-[#4E6579] mb-3" />
                  <h3 className="text-base font-semibold text-[#152A3E]">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="text-xs text-[#4E6579] mt-1 max-w-md mx-auto">
                    Ainda não há profissionais ativos cadastrados no catálogo.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularList.map((p) => (
                    <ProfessionalCard
                      key={p.id}
                      professional={p}
                      isAdmin={isAdmin}
                      onEdit={(prof) => {
                        setEditingProfessional(prof);
                        setShowFormModal(true);
                      }}
                      onDuplicate={handleDuplicateProfessional}
                      onDelete={handlePromptDelete}
                      onToggleActive={handleToggleActive}
                      onRate={(prof) => setRatingProfessional(prof)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Condominium Notice Footer */}
      <footer className="bg-[#152A3E] text-[#CFDCE9] text-xs py-8 border-t border-white/10 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" textColor="white" />
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="text-[11px] text-slate-400">Uso exclusivo para moradores e administração</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvertiseModal(true)}
              className="text-xs text-[#AECB3E] hover:underline"
            >
              Espaço Publicitário
            </button>
            <span>•</span>
            {!isAdmin ? (
              <button
                id="footer-admin-btn"
                onClick={() => setShowLoginModal(true)}
                className="text-xs text-blue-200 hover:text-white underline"
              >
                Login Admin
              </button>
            ) : (
              <button
                id="footer-restore-btn"
                onClick={handleRestoreDefaults}
                className="text-xs text-amber-300 hover:text-amber-200 underline"
              >
                Restaurar Lista Padrão
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Admin Login Modal */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleAdminLogin}
      />

      {/* 2. Professional Add/Edit Form Modal */}
      <ProfessionalFormModal
        isOpen={showFormModal}
        categories={sortedCategories}
        professional={editingProfessional}
        onClose={() => {
          setShowFormModal(false);
          setEditingProfessional(null);
        }}
        onSave={handleSaveProfessional}
      />

      {/* 3. Category Manager Modal */}
      <CategoryManagerModal
        isOpen={showCatModal}
        categories={sortedCategories}
        professionals={professionals}
        onClose={() => setShowCatModal(false)}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onRestoreSeed={handleRestoreDefaults}
        onSyncLocalHistory={handleSyncLocalHistory}
      />

      {/* 4. Resident Rating Modal */}
      {ratingProfessional && (
        <RatingModal
          isOpen={true}
          professional={ratingProfessional}
          onClose={() => setRatingProfessional(null)}
          onSubmitReview={handleSaveReview}
        />
      )}

      {/* 5. Advertise Info Modal */}
      <AdvertiseInfoModal
        isOpen={showAdvertiseModal}
        onClose={() => setShowAdvertiseModal(false)}
        onOpenForm={() => {
          setEditingProfessional(null);
          setShowFormModal(true);
        }}
      />

      {/* 5.1 Full Sponsored Ad Details Modal */}
      <SponsoredAdModal
        isOpen={!!viewingAdModal}
        ad={viewingAdModal}
        onClose={() => setViewingAdModal(null)}
      />

      {/* 5.2 All Categories Grid Modal (OLX-style exploration) */}
      <AllCategoriesModal
        isOpen={showAllCategoriesModal}
        categories={sortedCategories}
        activeCategory={activeCategory}
        totalProfessionalsCount={
          isAdmin
            ? professionals.length
            : professionals.filter((p) => p.active !== false).length
        }
        getCategoryCount={(cat) =>
          professionals.filter(
            (p) =>
              (isAdmin || p.active !== false) &&
              (p.category === cat ||
                (Array.isArray(p.categories) && p.categories.includes(cat)))
          ).length
        }
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setCurrentView("catalog");
        }}
        onClose={() => setShowAllCategoriesModal(false)}
      />

      {/* 6. Resident Indication Submission Modal */}
      <ResidentIndicationModal
        isOpen={showResidentIndicationModal}
        categories={sortedCategories}
        onClose={() => setShowResidentIndicationModal(false)}
        onSubmit={handleResidentSubmitIndication}
      />

      {/* 7. Admin Pending Indications Moderation Modal */}
      <PendingIndicationsModal
        isOpen={showPendingModal}
        pendingIndications={data?.pendingIndications || []}
        onClose={() => setShowPendingModal(false)}
        onApprove={handleApproveIndication}
        onEditAndApprove={handleEditAndApproveIndication}
        onReject={handleRejectIndication}
      />

      {/* 8. Admin Ads Manager Modal - Quick Objective Actions (Edit, Delete, Clone, Enable/Disable, Spotlight) */}
      <AdminAdsManagerModal
        isOpen={showAdsManagerModal}
        professionals={professionals}
        categories={sortedCategories}
        lastSaved={lastSaved}
        onSave={handleSaveAllData}
        onClose={() => setShowAdsManagerModal(false)}
        onOpenSecurity={() => setShowSecurityModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onEdit={(prof) => {
          setEditingProfessional(prof);
          setShowFormModal(true);
        }}
        onDuplicate={handleDuplicateProfessional}
        onDelete={handlePromptDelete}
        onToggleActive={handleToggleActive}
        onToggleSponsored={handleToggleSponsored}
        onToggleFeatured={handleToggleFeatured}
        onAddNew={() => {
          setEditingProfessional(null);
          setShowFormModal(true);
        }}
      />

      {/* 8.1 Admin Security & Password Management Modal */}
      <AdminSecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onSuccessToast={(msg) => showToast(msg)}
      />

      {/* 8.2 Export Project Source Code and Database Modal */}
      <ExportProjectModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data || INITIAL_SEED}
      />

      {/* 9. Delete Confirmation Modal (Highest Layer) */}
      <DeleteConfirmationModal
        isOpen={!!professionalToDelete}
        professional={professionalToDelete}
        isDeleting={isDeletingProf}
        onCancel={() => setProfessionalToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
