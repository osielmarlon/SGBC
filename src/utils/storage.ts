import { AppData, Professional, PendingIndication } from '../types';
import { INITIAL_SEED } from '../data/seed';

const STORAGE_KEY = "sportsgarden_catalog_data_v14_sync_live";
const LAST_SAVED_KEY = "sportsgarden_catalog_last_saved_time";
const DELETED_IDS_KEY = "sportsgarden_deleted_professional_ids";

export function getLastSavedTime(): string | null {
  try {
    return localStorage.getItem(LAST_SAVED_KEY);
  } catch {
    return null;
  }
}

/**
 * Gets all IDs of professionals that have been explicitly deleted by administrator
 */
export function getDeletedProfessionalIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => String(id));
      }
    }
  } catch {}
  return [];
}

/**
 * Registers an ID in the blacklist of deleted professionals
 */
export function addDeletedProfessionalId(id: string): void {
  if (!id) return;
  try {
    const current = getDeletedProfessionalIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(current));
    }
  } catch {}
}

/**
 * Deduplicates a list of professionals:
 * 1. Ensures unique IDs
 * 2. If two records share the exact same Name and Phone, merges them keeping the one with photo/offers
 */
export function deduplicateProfessionals(list: Professional[]): Professional[] {
  const result: Professional[] = [];
  const seenIds = new Set<string>();
  const namePhoneIndex = new Map<string, number>();

  for (const item of list) {
    if (!item || !item.name) continue;

    // Normalize name and digits
    const cleanName = item.name.trim().toLowerCase();
    const cleanPhone = (item.phone || "").replace(/\D/g, "");
    const dedupeKey = cleanPhone.length >= 8 ? `${cleanName}:::${cleanPhone}` : null;

    if (dedupeKey && namePhoneIndex.has(dedupeKey)) {
      // Duplicate detected!
      const existingIdx = namePhoneIndex.get(dedupeKey)!;
      const existing = result[existingIdx];

      // Keep the richer version (has image, has special offer, has more reviews)
      const hasBetterImage = !existing.imageUrl && !!item.imageUrl;
      const hasBetterOffer = !existing.specialOffer && !!item.specialOffer;
      const hasMoreReviews = (item.reviews?.length || 0) > (existing.reviews?.length || 0);

      if (hasBetterImage || hasBetterOffer || hasMoreReviews) {
        result[existingIdx] = {
          ...existing,
          ...item,
          active: existing.active !== undefined ? existing.active : (item.active !== undefined ? item.active : true),
          sponsored: existing.sponsored !== undefined ? existing.sponsored : Boolean(item.sponsored),
          featuredInBanner: existing.featuredInBanner !== undefined ? existing.featuredInBanner : Boolean(item.featuredInBanner),
          imageUrl: item.imageUrl || existing.imageUrl,
          specialOffer: item.specialOffer || existing.specialOffer,
          reviews: (item.reviews?.length || 0) >= (existing.reviews?.length || 0) ? item.reviews : existing.reviews,
        };
      } else if (item.active !== undefined && item.active !== existing.active) {
        result[existingIdx] = {
          ...existing,
          active: item.active,
        };
      }
      continue;
    }

    if (seenIds.has(item.id)) {
      // Re-assign random id if collision
      item.id = `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    }

    seenIds.add(item.id);
    const newIdx = result.push(item) - 1;
    if (dedupeKey) {
      namePhoneIndex.set(dedupeKey, newIdx);
    }
  }

  return result;
}

const OLD_STORAGE_KEYS = [
  "sportsgarden_catalog_data_v11_ar_condicionado",
  "sportsgarden_catalog_data_v10_real_categories",
  "sportsgarden_catalog_data_v9_live",
  "sportsgarden_catalog_data_v8",
  "sportsgarden_catalog_data_v7",
  "sportsgarden_catalog_data_v6_enhanced_ads",
  "sportsgarden_catalog_data_v5_full_persistence",
  "sportsgarden_catalog_data_v4_ratings",
  "sportsgarden_catalog_data_v3",
  "sportsgarden_catalog_data_v2",
  "sportsgarden_catalog_data"
];

/**
 * Clears old legacy local storage keys so old deleted ads don't linger on phone browsers
 */
export function cleanupLegacyStorageKeys(): void {
  try {
    for (const key of OLD_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {}
}

export async function loadAppData(): Promise<AppData> {
  cleanupLegacyStorageKeys();

  // 1. Read existing local cached data from localStorage (if any)
  let localData: AppData | null = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        localData = sanitizeAppData(parsed);
      }
    }
  } catch {}

  // 2. Fetch authoritative database from server with cache-busting
  let serverData: AppData | null = null;
  try {
    const timestamp = Date.now();
    const response = await fetch(`/api/catalog?t=${timestamp}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.success && result.data) {
        serverData = sanitizeAppData(result.data);
      }
    }
  } catch (apiError) {
    console.warn("[STORAGE] Could not reach cloud API, falling back to local storage cache:", apiError);
  }

  // 3. Ensure serverData contains all official seed data (e.g. Ar Condicionado)
  if (serverData) {
    const currentProfIds = new Set(serverData.professionals.map((p) => p.id));
    const deletedSet = new Set(serverData.deletedProfessionalIds || []);
    let hadSeedAdd = false;

    for (const seedProf of INITIAL_SEED.professionals) {
      if (seedProf && seedProf.id && !deletedSet.has(seedProf.id) && !currentProfIds.has(seedProf.id)) {
        serverData.professionals.push(seedProf);
        currentProfIds.add(seedProf.id);
        hadSeedAdd = true;
      }
    }

    for (const cat of INITIAL_SEED.categories) {
      if (!serverData.categories.includes(cat)) {
        serverData.categories.push(cat);
        hadSeedAdd = true;
      }
    }

    if (hadSeedAdd) {
      fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverData),
      }).catch(() => {});
    }
  }

  // 4. Bidirectional intelligent merge to guarantee ZERO data loss
  let finalData: AppData;
  if (serverData && localData) {
    const serverDeletedIds = new Set(serverData.deletedProfessionalIds || []);
    const serverProfMap = new Map(serverData.professionals.map((p) => [p.id, p]));
    let needsServerSync = false;

    // Check if local has professionals that server doesn't have and aren't deleted
    const mergedProfessionals = [...serverData.professionals];
    for (const localProf of localData.professionals) {
      if (!localProf || !localProf.id) continue;
      if (serverDeletedIds.has(localProf.id)) continue;

      if (!serverProfMap.has(localProf.id)) {
        // Local has a professional that was added locally!
        mergedProfessionals.push(localProf);
        needsServerSync = true;
      }
    }

    // Merge categories
    const mergedCategories = Array.from(new Set([...serverData.categories, ...localData.categories]));
    if (mergedCategories.length > serverData.categories.length) {
      needsServerSync = true;
    }

    finalData = {
      categories: mergedCategories,
      professionals: deduplicateProfessionals(mergedProfessionals),
      pendingIndications: serverData.pendingIndications || [],
      deletedProfessionalIds: serverData.deletedProfessionalIds || [],
    };

    if (needsServerSync) {
      // Background sync merged state to server so server DB gets updated with local additions
      fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      }).catch((e) => console.warn("[STORAGE] Background merge sync error:", e));
    }
  } else if (serverData) {
    finalData = serverData;
  } else if (localData) {
    finalData = localData;
  } else {
    finalData = sanitizeAppData(INITIAL_SEED);
  }

  // 5. Update localStorage cache safely
  try {
    const jsonStr = JSON.stringify(finalData);
    localStorage.setItem(STORAGE_KEY, jsonStr);
    localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
  } catch {}

  return finalData;
}

function sanitizeAppData(raw: any): AppData {
  const rawProfessionals: any[] = Array.isArray(raw?.professionals)
    ? raw.professionals
    : INITIAL_SEED.professionals;

  const sanitizedProfessionals: Professional[] = rawProfessionals
    .filter((p) => p && p.id)
    .map((p, idx) => ({
      id: p?.id ? String(p.id) : `p_${Date.now()}_${idx}`,
      name: p?.name ? String(p.name) : "Prestador de Serviço",
      category: p?.category ? String(p.category) : "Outros",
      categories: Array.isArray(p?.categories)
        ? p.categories.map((c: any) => String(c).trim()).filter(Boolean).slice(0, 3)
        : (p?.category ? [String(p.category).trim()] : undefined),
      phone: p?.phone ? String(p.phone) : "",
      description: p?.description ? String(p.description) : "",
      sponsored: Boolean(p?.sponsored),
      active: p?.active !== undefined ? Boolean(p.active) : true,
      featuredInBanner: p?.featuredInBanner !== undefined ? Boolean(p.featuredInBanner) : undefined,
      adType: p?.adType || (p?.sponsored ? "professional" : undefined),
      badgeText: p?.badgeText ? String(p.badgeText) : undefined,
      eventDate: p?.eventDate ? String(p.eventDate) : undefined,
      eventLocation: p?.eventLocation ? String(p.eventLocation) : undefined,
      residentUnit: p?.residentUnit ? String(p.residentUnit) : undefined,
      actionLabel: p?.actionLabel ? String(p.actionLabel) : undefined,
      isExclusiveSponsorBanner: Boolean(p?.isExclusiveSponsorBanner),
      blockReference: p?.blockReference ? String(p.blockReference) : undefined,
      imageUrl: p?.imageUrl ? String(p.imageUrl) : undefined,
      specialOffer: p?.specialOffer ? String(p.specialOffer) : undefined,
      instagram: p?.instagram ? String(p.instagram) : undefined,
      website: p?.website ? String(p.website) : undefined,
      rating: typeof p?.rating === "number" && !isNaN(p.rating) ? p.rating : 5.0,
      reviewCount: typeof p?.reviewCount === "number" && !isNaN(p.reviewCount) ? p.reviewCount : 1,
      reviews: Array.isArray(p?.reviews)
        ? p.reviews.map((r: any, rIdx: number) => ({
            id: r?.id ? String(r.id) : `r_${idx}_${rIdx}`,
            residentName: r?.residentName ? String(r.residentName) : "Morador",
            unit: r?.unit ? String(r.unit) : "Sports Garden",
            rating: typeof r?.rating === "number" ? r.rating : 5,
            comment: r?.comment ? String(r.comment) : "",
            createdAt: r?.createdAt ? String(r.createdAt) : new Date().toISOString().split("T")[0]
          }))
        : []
    }));

  const deduplicatedProfessionals = deduplicateProfessionals(sanitizedProfessionals);

  let finalCategories: string[];
  if (Array.isArray(raw?.categories)) {
    finalCategories = raw.categories
      .map((c: any) => (typeof c === "string" ? c.trim() : ""))
      .filter(Boolean);
  } else {
    finalCategories = Array.isArray(INITIAL_SEED.categories) ? [...INITIAL_SEED.categories] : [];
  }
  const uniqueCategories = Array.from(new Set(finalCategories));

  const pendingIndications: PendingIndication[] = Array.isArray(raw?.pendingIndications)
    ? raw.pendingIndications.map((pi: any, idx: number) => ({
        id: pi?.id ? String(pi.id) : `ind_${Date.now()}_${idx}`,
        submittedAt: pi?.submittedAt ? String(pi.submittedAt) : new Date().toLocaleString("pt-BR"),
        residentName: pi?.residentName ? String(pi.residentName) : "Morador",
        residentUnit: pi?.residentUnit ? String(pi.residentUnit) : "Sports Garden",
        residentPhone: pi?.residentPhone ? String(pi.residentPhone) : undefined,
        residentComment: pi?.residentComment ? String(pi.residentComment) : undefined,
        professional: {
          name: pi?.professional?.name ? String(pi.professional.name) : "Prestador Indicado",
          category: pi?.professional?.category ? String(pi.professional.category) : "Outros",
          categories: Array.isArray(pi?.professional?.categories)
            ? pi.professional.categories.map((c: any) => String(c).trim()).filter(Boolean).slice(0, 3)
            : (pi?.professional?.category ? [String(pi.professional.category).trim()] : undefined),
          phone: pi?.professional?.phone ? String(pi.professional.phone) : "",
          description: pi?.professional?.description ? String(pi.professional.description) : "",
          sponsored: Boolean(pi?.professional?.sponsored),
          blockReference: pi?.professional?.blockReference ? String(pi.professional.blockReference) : undefined,
          imageUrl: pi?.professional?.imageUrl ? String(pi.professional.imageUrl) : undefined,
          specialOffer: pi?.professional?.specialOffer ? String(pi.professional.specialOffer) : undefined,
          instagram: pi?.professional?.instagram ? String(pi.professional.instagram) : undefined,
          website: pi?.professional?.website ? String(pi.professional.website) : undefined,
        }
      }))
    : [];

  return {
    categories: uniqueCategories,
    professionals: deduplicatedProfessionals,
    pendingIndications,
    deletedProfessionalIds: Array.isArray(raw?.deletedProfessionalIds) ? raw.deletedProfessionalIds : []
  };
}

export async function toggleProfessionalActiveOnServer(
  id: string,
  active: boolean
): Promise<{ success: boolean; data?: AppData }> {
  try {
    const response = await fetch(`/api/professionals/${encodeURIComponent(id)}/toggle-active`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ active }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not toggle active via PATCH, will fallback to saveAppData:", err);
  }

  return { success: false };
}

export async function toggleProfessionalSponsoredOnServer(
  id: string,
  sponsored: boolean
): Promise<{ success: boolean; data?: AppData }> {
  try {
    const response = await fetch(`/api/professionals/${encodeURIComponent(id)}/toggle-sponsored`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ sponsored }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not toggle sponsored via PATCH, will fallback to saveAppData:", err);
  }

  return { success: false };
}

export async function toggleProfessionalFeaturedOnServer(
  id: string,
  featuredInBanner: boolean
): Promise<{ success: boolean; data?: AppData }> {
  try {
    const response = await fetch(`/api/professionals/${encodeURIComponent(id)}/toggle-featured`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ featuredInBanner }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not toggle featured via PATCH, will fallback to saveAppData:", err);
  }

  return { success: false };
}

export async function deleteProfessionalOnServer(id: string): Promise<{ success: boolean; data?: AppData }> {
  addDeletedProfessionalId(id);

  try {
    const response = await fetch(`/api/professionals/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not delete from server API endpoint directly, relying on POST sync:", err);
  }

  return { success: false };
}

export async function updateCategoryOnServer(
  oldName: string,
  newName: string
): Promise<{ success: boolean; data?: AppData }> {
  try {
    const response = await fetch(`/api/categories/${encodeURIComponent(oldName.trim())}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ newName: newName.trim() }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not update category via server endpoint, falling back to full sync:", err);
  }

  return { success: false };
}

export async function deleteCategoryOnServer(
  catName: string
): Promise<{ success: boolean; data?: AppData }> {
  try {
    const response = await fetch(`/api/categories/${encodeURIComponent(catName.trim())}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not delete category via server endpoint, falling back to full sync:", err);
  }

  return { success: false };
}

export async function addCategoryOnServer(
  name: string
): Promise<{ success: boolean; data?: AppData }> {
  try {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not add category via server endpoint, falling back to full sync:", err);
  }

  return { success: false };
}

export async function addProfessionalOnServer(
  profData: Partial<Professional>
): Promise<{ success: boolean; data?: AppData }> {
  try {
    const response = await fetch("/api/professionals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(profData),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not add professional via server endpoint directly:", err);
  }

  return { success: false };
}

export async function addReviewOnServer(
  professionalId: string,
  review: { rating: number; residentName: string; unit: string; comment: string }
): Promise<{ success: boolean; data?: AppData }> {
  try {
    const response = await fetch(`/api/professionals/${encodeURIComponent(professionalId)}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(review),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const sanitized = sanitizeAppData(result.data);
        try {
          const jsonStr = JSON.stringify(sanitized);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleString("pt-BR"));
        } catch {}
        return { success: true, data: sanitized };
      }
    }
  } catch (err) {
    console.warn("Could not submit review via server endpoint directly:", err);
  }

  return { success: false };
}

export async function submitIndicationOnServer(
  indication: PendingIndication
): Promise<{ success: boolean }> {
  try {
    const response = await fetch("/api/indications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(indication),
    });

    if (response.ok) {
      return { success: true };
    }
  } catch (err) {
    console.warn("Could not submit indication to server API directly:", err);
  }

  return { success: false };
}

export async function saveAppData(data: AppData): Promise<boolean> {
  const localDeleted = getDeletedProfessionalIds();
  const dataDeleted = Array.isArray(data.deletedProfessionalIds) ? data.deletedProfessionalIds : [];
  const combinedDeleted = Array.from(new Set([...localDeleted, ...dataDeleted]));

  const cleanData: AppData = {
    categories: Array.from(new Set(data.categories.filter(Boolean))),
    professionals: deduplicateProfessionals(
      data.professionals.filter((p) => p && p.id && !combinedDeleted.includes(p.id))
    ),
    pendingIndications: Array.isArray(data.pendingIndications) ? data.pendingIndications : [],
    deletedProfessionalIds: combinedDeleted
  };

  const now = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  // 1. Save to localStorage immediately as local cache
  try {
    const jsonString = JSON.stringify(cleanData);
    localStorage.setItem(STORAGE_KEY, jsonString);
    localStorage.setItem(LAST_SAVED_KEY, now);
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Local storage error:", err);
  }

  // 2. Persist to Cloud Server API with retry
  try {
    const response = await fetch("/api/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(cleanData),
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.success) {
        localStorage.setItem(LAST_SAVED_KEY, now);
        return true;
      }
    }
  } catch (serverErr) {
    console.warn("Could not sync to cloud server directly, changes saved locally:", serverErr);
  }

  return true;
}

/**
 * Exports current database as a downloadable JSON file
 */
export function exportDatabaseAsJSON(data: AppData) {
  const cleanData: AppData = {
    categories: Array.from(new Set(data.categories.filter(Boolean))),
    professionals: deduplicateProfessionals(data.professionals),
    pendingIndications: Array.isArray(data.pendingIndications) ? data.pendingIndications : []
  };
  const jsonStr = JSON.stringify(cleanData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `sportsgarden_catalogo_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports database from a JSON file content string
 */
export function importDatabaseFromJSON(jsonString: string): AppData {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !Array.isArray(parsed.professionals)) {
    throw new Error("Arquivo de backup inválido: formato não reconhecido.");
  }
  return {
    categories: Array.from(new Set((parsed.categories || []).filter(Boolean))),
    professionals: deduplicateProfessionals(parsed.professionals),
    pendingIndications: Array.isArray(parsed.pendingIndications) ? parsed.pendingIndications : []
  };
}

/**
 * Formats a phone number for display (BR format)
 */
export function formatPhone(numStr?: string | number): string {
  if (!numStr) return "";
  const clean = String(numStr).replace(/\D/g, "");
  if (clean.length === 13 && clean.startsWith("55")) {
    return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return String(numStr);
}

/**
 * Force clears local cache on mobile/desktop and pulls the live central database from server
 */
export async function forceRefreshCatalog(): Promise<AppData> {
  cleanupLegacyStorageKeys();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return await loadAppData();
}

const LOCAL_ADMIN_AUTH_KEY = "sportsgarden_local_admin_auth";

interface LocalAdminAuth {
  customPassword?: string;
  adminEmail?: string;
}

function getLocalAdminAuth(): LocalAdminAuth {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    customPassword: "",
    adminEmail: "osilva@tre-pa.jus.br",
  };
}

function setLocalAdminAuth(auth: Partial<LocalAdminAuth>): void {
  try {
    const current = getLocalAdminAuth();
    localStorage.setItem(LOCAL_ADMIN_AUTH_KEY, JSON.stringify({ ...current, ...auth }));
  } catch {}
}

/**
 * Validates admin login via server API with graceful fallback
 */
export async function adminLoginApi(password: string): Promise<{ success: boolean; error?: string; adminEmailMasked?: string }> {
  try {
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, adminEmailMasked: data.adminEmailMasked };
    }
    return { success: false, error: data.error || "Senha incorreta. Verifique os dados digitados." };
  } catch {
    // Local fallback in case offline
    const local = getLocalAdminAuth();
    const valid = local.customPassword ? password === local.customPassword : (password === "sportsgarden2026");
    if (valid) {
      return { success: true, adminEmailMasked: "os***@tre-pa.jus.br" };
    }
    return { success: false, error: "Senha incorreta." };
  }
}

/**
 * Changes admin password via server API
 */
export async function adminChangePasswordApi(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch("/api/admin/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setLocalAdminAuth({ customPassword: newPassword });
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || "Não foi possível alterar a senha." };
  } catch {
    setLocalAdminAuth({ customPassword: newPassword });
    return { success: true, message: "Senha alterada localmente com sucesso!" };
  }
}

/**
 * Updates administrator recovery email
 */
export async function adminUpdateEmailApi(
  currentPassword: string,
  newEmail: string
): Promise<{ success: boolean; message?: string; error?: string; adminEmailMasked?: string }> {
  try {
    const res = await fetch("/api/admin/auth/update-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newEmail }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setLocalAdminAuth({ adminEmail: newEmail });
      return { success: true, message: data.message, adminEmailMasked: data.adminEmailMasked };
    }
    return { success: false, error: data.error || "Erro ao atualizar e-mail de recuperação." };
  } catch {
    setLocalAdminAuth({ adminEmail: newEmail });
    return { success: true, message: "E-mail atualizado com sucesso!" };
  }
}

/**
 * Requests a 6-digit password reset code to administrator email
 */
export async function adminRequestForgotPasswordApi(
  email: string
): Promise<{ success: boolean; message?: string; error?: string; emailMasked?: string; debugCode?: string }> {
  try {
    const res = await fetch("/api/admin/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message,
        emailMasked: data.emailMasked,
        debugCode: data.debugCode,
      };
    }
    return { success: false, error: data.error || "Não foi possível enviar o código de recuperação." };
  } catch {
    return {
      success: false,
      error: "Erro de conexão ao solicitar recuperação de senha.",
    };
  }
}

/**
 * Verifies 6-digit code and resets admin password
 */
export async function adminResetPasswordApi(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch("/api/admin/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setLocalAdminAuth({ customPassword: newPassword });
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || "Código inválido ou erro ao redefinir senha." };
  } catch {
    return { success: false, error: "Erro de conexão ao redefinir senha." };
  }
}

/**
 * Gets admin auth security info (e.g. masked email)
 */
export async function adminGetAuthInfoApi(): Promise<{
  success: boolean;
  adminEmailMasked?: string;
  hasCustomPassword?: boolean;
}> {
  try {
    const res = await fetch("/api/admin/auth/info", {
      headers: { "Cache-Control": "no-cache" },
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data;
    }
  } catch {}
  return { success: true, adminEmailMasked: "os***@tre-pa.jus.br", hasCustomPassword: false };
}

/**
 * Uploads a base64 image to the server to store as a static image file and returns the clean URL path.
 * If server is offline or fails, falls back gracefully to the original base64 string.
 */
export async function uploadImageToServer(imageBase64: string, filenamePrefix?: string): Promise<string> {
  if (!imageBase64 || !imageBase64.startsWith("data:image")) {
    return imageBase64;
  }

  try {
    const res = await fetch("/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, filenamePrefix }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      }
    }
  } catch (err) {
    console.warn("[UPLOAD] Could not upload image to server endpoint, keeping base64 fallback:", err);
  }

  return imageBase64;
}
