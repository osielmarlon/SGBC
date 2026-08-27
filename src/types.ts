export interface Review {
  id: string;
  residentName?: string;
  author?: string;
  rating: number; // 1 to 5
  comment?: string;
  unit?: string; // e.g. "Torre A - 802"
  createdAt?: string;
  date?: string;
}

export type SponsoredAdType =
  | "professional"        // Prestador de Serviço
  | "company"             // Empresa (qualquer empresa, loja, comércio ou negócio)
  | "event"               // Evento (do condomínio ou externo)
  | "resident_business"   // Legado / compatibilidade
  | "external_business"   // Legado / compatibilidade
  | "condo_event"         // Legado / compatibilidade
  | "external_event";     // Legado / compatibilidade

export interface Professional {
  id: string;
  name: string;
  category: string; // Categoria principal
  categories?: string[]; // Lista de até 3 categorias associadas
  phone: string;
  description: string;
  sponsored: boolean;
  blockReference?: string;
  rating?: number; // average rating e.g. 4.9
  reviewCount?: number; // total number of reviews
  reviews?: Review[]; // detailed reviews
  imageUrl?: string; // custom image/banner or logo
  specialOffer?: string; // promotional highlight e.g. "10% de desconto para moradores"
  instagram?: string;
  website?: string;
  
  // Status & Visibility
  active?: boolean; // If false, the ad is disabled/hidden from regular public directory and carousel
  
  // Sponsored area enhancements
  adType?: SponsoredAdType;
  badgeText?: string;          // e.g. "Negócio de Morador", "Evento do Condomínio", "Empresa Parceira"
  eventDate?: string;          // e.g. "Sábado, 28/08 às 19h"
  eventLocation?: string;      // e.g. "Salão Gourmet - Torre B"
  residentUnit?: string;       // e.g. "Torre B - Apto 1402"
  actionLabel?: string;        // e.g. "Falar no WhatsApp", "Ver Cardápio", "Garantir Ingresso"
  featuredInBanner?: boolean;  // Permite destacar no banner rotativo mesmo se não for patrocinado pago
  isExclusiveSponsorBanner?: boolean; // If true, only appears in the sponsored rotation banner and not in regular directory
}

export interface PendingIndication {
  id: string;
  submittedAt: string;
  residentName: string;
  residentUnit: string;
  residentPhone?: string;
  residentComment?: string;
  professional: {
    name: string;
    category: string;
    categories?: string[];
    phone: string;
    description: string;
    sponsored?: boolean;
    featuredInBanner?: boolean;
    blockReference?: string;
    imageUrl?: string;
    specialOffer?: string;
    instagram?: string;
    website?: string;
    adType?: SponsoredAdType;
    badgeText?: string;
    eventDate?: string;
    eventLocation?: string;
    residentUnit?: string;
    actionLabel?: string;
    isExclusiveSponsorBanner?: boolean;
  };
}

export interface AppData {
  categories: string[];
  professionals: Professional[];
  pendingIndications?: PendingIndication[];
  deletedProfessionalIds?: string[];
}
