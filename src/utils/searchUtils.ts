import { Professional } from "../types";

/**
 * Normalizes text for search by:
 * - Converting to lowercase
 * - Stripping all diacritics / accents (ex: "elétrica" -> "eletrica", "maçã" -> "maca")
 * - Replacing hyphens, underscores and slashes with spaces so "ar-condicionado" splits cleanly
 * - Trimming extra spaces
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[çÇ]/g, "c")
    .replace(/[-_/\\,;.:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts normalized alphanumeric search tokens from a query
 */
export function getSearchTokens(query: string): string[] {
  const clean = normalizeText(query);
  if (!clean) return [];
  return clean.split(" ").filter((t) => t.length > 0);
}

/**
 * Strips formatting from phone numbers leaving only digits
 */
export function cleanDigits(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/\D/g, "");
}

/**
 * Standard Levenshtein distance for fuzzy matching small typos
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Condominium synonym dictionary to power Google-style semantic associations
 */
const SYNONYM_GROUPS: string[][] = [
  // Climatização & Eletrodomésticos
  ["ar", "split", "condicionado", "climatizacao", "refrigeracao", "inverter", "geladeira", "freezer", "fogao", "maquina", "lavadora", "microondas", "eletrodomestico", "eletrodomesticos"],
  // Elétrica
  ["eletrica", "eletricista", "eletricidade", "luz", "quadro", "disjuntor", "tomada", "fiacao", "chuveiro", "ventilador", "luminaria", "lustre", "instalacao", "curto"],
  // Hidráulica
  ["hidraulica", "encanador", "encanamento", "vazamento", "cano", "torneira", "tubulacao", "bombeiro", "desentupimento", "desentupidora", "ralo", "esgoto", "infiltracao", "registro", "valvula"],
  // Pintura & Acabamento
  ["pintura", "pintor", "tinta", "massa", "corrida", "grafiato", "verniz", "parede", "acabamento", "lixamento", "gesso", "gesseiro", "drywall"],
  // Limpeza & Faxina
  ["limpeza", "diarista", "faxina", "faxineira", "passadeira", "domestica", "lavanderia", "organizer", "higienizacao", "sofa", "estofados", "tapete", "vidros"],
  // Marcenaria & Móveis
  ["marcenaria", "marceneiro", "moveis", "armario", "armarios", "madeira", "planejados", "montador", "montagem", "gaveta", "porta", "restauracao"],
  // Automotivo
  ["mecanica", "mecanico", "carro", "auto", "oficina", "veiculo", "guincho", "pneu", "bateria", "oleo", "freio", "lavagem", "estetica"],
  // Obras & Construção
  ["obra", "reforma", "pedreiro", "alvenaria", "piso", "revestimento", "azulejo", "porcelanato", "construcao", "cimento", "telhado", "impermeabilizacao"],
  // Vidraçaria & Esquadrias
  ["vidracaria", "vidraceiro", "vidro", "box", "espelho", "janela", "sacada", "fechamento", "temperado", "cortina", "persiana"],
  // Chaveiro & Segurança
  ["chaveiro", "chave", "fechadura", "fechaduras", "abertura", "cadeado", "copia", "digital", "biometria", "portao", "interfone", "camera", "cftv"],
  // Jardinagem & Paisagismo
  ["jardinagem", "jardineiro", "jardim", "planta", "plantas", "paisagismo", "grama", "poda", "adubo", "vasos", "irrigacao"],
  // Tecnologia & Informática
  ["informatica", "computador", "notebook", "pc", "tecnologia", "celular", "smartphone", "iphone", "impressora", "wifi", "internet", "formatacao", "suporte", "rede"],
  // Pet & Animais
  ["pet", "cachorro", "gato", "veterinario", "veterinaria", "adestrador", "adestramento", "banho", "tosa", "passeador", "dogwalker", "hotelzinho", "racao"],
  // Costura & Ajustes
  ["costura", "costureira", "ajuste", "ajustes", "bainha", "roupa", "roupas", "vestido", "barra", "conserto", "ziper"],
  // Saúde & Bem-estar
  ["saude", "medico", "medica", "fisioterapia", "fisioterapeuta", "psicologia", "psicologo", "dentista", "odontologia", "nutricionista", "nutricao", "massagem", "massoterapia", "pilates", "personal", "terapeuta", "fonoaudiologia"],
  // Gastronomia & Alimentação
  ["alimentacao", "comida", "restaurante", "lanche", "marmita", "marmitex", "bolo", "bolos", "doce", "doces", "salgado", "salgados", "confeitaria", "pizza", "pizzaria", "hamburguer", "churrasco", "gastronomia", "buffet", "cafe", "bebida"],
  // Aulas & Educação
  ["aula", "aulas", "professor", "professora", "reforco", "idiomas", "ingles", "musica", "violao", "piano", "natacao", "treino", "fitness", "yoga"],
  // Fretes & Mudanças
  ["frete", "fretes", "mudanca", "mudancas", "carreto", "transporte", "entrega", "caminhao"],
];

/**
 * Gets all related synonym words for a given word
 */
export function getSynonymsForToken(token: string): string[] {
  const normToken = normalizeText(token);
  if (!normToken || normToken.length < 2) return [];

  const matches = new Set<string>();
  for (const group of SYNONYM_GROUPS) {
    const hasMatch = group.some(
      (w) => w === normToken || w.startsWith(normToken) || normToken.startsWith(w)
    );
    if (hasMatch) {
      for (const w of group) {
        matches.add(w);
      }
    }
  }
  return Array.from(matches);
}

/**
 * Checks if a single search token matches against a target text corpus
 * Supports:
 * - Substring containment (e.g. "cond" matches "ar condicionado")
 * - Word prefix matching (e.g. "eletric" matches "eletricista")
 * - Clean digit matching for phone numbers
 * - Typo tolerance via Levenshtein distance (e.g. "eletricsta" matches "eletricista")
 * - Synonym expansion
 */
export function matchesSearchToken(
  token: string,
  targetFullText: string,
  targetWords: string[],
  targetDigits: string
): boolean {
  const normToken = normalizeText(token);
  if (!normToken) return true;

  // 1. Direct substring in full normalized corpus
  if (targetFullText.includes(normToken)) {
    return true;
  }

  // 2. Prefix matching on any individual word in target
  for (const word of targetWords) {
    if (word.startsWith(normToken) || (normToken.length >= 4 && word.includes(normToken))) {
      return true;
    }
  }

  // 3. Numeric / Phone digit matching (if token contains digits)
  const tokenDigits = cleanDigits(token);
  if (tokenDigits && tokenDigits.length >= 2 && targetDigits.includes(tokenDigits)) {
    return true;
  }

  // 4. Synonym match (Google-like semantic matching)
  const synonyms = getSynonymsForToken(normToken);
  for (const syn of synonyms) {
    if (targetFullText.includes(syn)) {
      return true;
    }
    for (const word of targetWords) {
      if (word.startsWith(syn)) {
        return true;
      }
    }
  }

  // 5. Typo tolerance (Levenshtein) for tokens with at least 4 chars
  if (normToken.length >= 4) {
    const maxDistance = normToken.length >= 7 ? 2 : 1;
    for (const word of targetWords) {
      if (Math.abs(word.length - normToken.length) <= maxDistance) {
        if (levenshteinDistance(normToken, word) <= maxDistance) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Builds a search index text bundle for a Professional item
 */
export function buildProfessionalSearchBundle(p: Professional): {
  fullText: string;
  words: string[];
  digits: string;
} {
  const parts: string[] = [];

  if (p.name) parts.push(p.name);
  if (p.category) parts.push(p.category);
  if (Array.isArray(p.categories)) parts.push(...p.categories);
  if (p.description) parts.push(p.description);
  if (p.specialOffer) parts.push(p.specialOffer);
  if (p.badgeText) parts.push(p.badgeText);
  if (p.blockReference) parts.push(p.blockReference);
  if (p.residentUnit) parts.push(p.residentUnit);
  if (p.eventDate) parts.push(p.eventDate);
  if (p.eventLocation) parts.push(p.eventLocation);
  if (p.phone) parts.push(p.phone);

  if (Array.isArray(p.reviews)) {
    for (const rev of p.reviews) {
      if (rev.comment) parts.push(rev.comment);
      if (rev.residentName) parts.push(rev.residentName);
      if (rev.author) parts.push(rev.author);
      if (rev.unit) parts.push(rev.unit);
    }
  }

  const rawCombined = parts.join(" ");
  const fullText = normalizeText(rawCombined);
  const words = fullText.split(" ").filter((w) => w.length > 0);
  const digits = cleanDigits(p.phone) + " " + cleanDigits(rawCombined);

  return { fullText, words, digits };
}

/**
 * Checks if a professional matches a Google-style search query.
 * ALL search tokens must match the professional (AND logic), but each token
 * allows accents/no-accents, incomplete/prefix words, typos, and synonyms.
 */
export function matchProfessionalQuery(
  professional: Professional,
  query: string
): boolean {
  if (!professional) return false;
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return true;

  const bundle = buildProfessionalSearchBundle(professional);

  // Every token must match somewhere in the professional's profile
  for (const token of tokens) {
    if (!matchesSearchToken(token, bundle.fullText, bundle.words, bundle.digits)) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates a search relevance score for ordering search results (Google-style ranking)
 */
export function calculateRelevanceScore(
  professional: Professional,
  query: string
): number {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return 0;

  const nameNorm = normalizeText(professional.name);
  const catNorm = normalizeText(
    (professional.category || "") + " " + (Array.isArray(professional.categories) ? professional.categories.join(" ") : "")
  );
  const descNorm = normalizeText(professional.description);

  let score = 0;
  const fullQuery = normalizeText(query);

  // Exact full-query matches
  if (nameNorm === fullQuery) score += 1000;
  else if (nameNorm.startsWith(fullQuery)) score += 600;
  else if (nameNorm.includes(fullQuery)) score += 400;

  if (catNorm.includes(fullQuery)) score += 300;

  // Token level scoring
  for (const token of tokens) {
    if (nameNorm.split(" ").some((w) => w.startsWith(token))) score += 80;
    else if (nameNorm.includes(token)) score += 50;

    if (catNorm.split(" ").some((w) => w.startsWith(token))) score += 60;
    else if (catNorm.includes(token)) score += 35;

    if (descNorm.includes(token)) score += 15;
  }

  // Boost verified/sponsored/rating
  if (professional.sponsored) score += 50;
  if (professional.featuredInBanner) score += 30;
  score += (professional.rating || 5.0) * 5;

  return score;
}

/**
 * Calculates overall Prioritization and Ranking Score for an advertisement
 * combining ratings, volume of reviews, resident testimonials, indication,
 * sponsored status, special offers, and search relevance.
 */
export function calculateRankingScore(
  professional: Professional,
  query?: string
): number {
  if (!professional) return 0;

  let score = 300; // Base score

  // 1. Rating factor (up to +400 points for 5.0 stars)
  const rating = typeof professional.rating === "number" && !isNaN(professional.rating)
    ? professional.rating
    : 5.0;
  score += Math.max(0, (rating - 3.0) * 200);

  // 2. Review volume factor (up to +250 points)
  const reviewCount = typeof professional.reviewCount === "number" && !isNaN(professional.reviewCount)
    ? professional.reviewCount
    : (Array.isArray(professional.reviews) ? professional.reviews.length : 1);
  score += Math.min(250, reviewCount * 50);

  // 3. Resident testimonials / comments factor (up to +300 points)
  if (Array.isArray(professional.reviews)) {
    const commentsCount = professional.reviews.filter((r) => r.comment && r.comment.trim().length > 3).length;
    score += Math.min(300, commentsCount * 80);
  }

  // 4. Resident indication (Torre / Apto reference) (+150 points)
  if (professional.blockReference || professional.residentUnit) {
    score += 150;
  }

  // 5. Sponsored official partner (+250 points)
  if (professional.sponsored) {
    score += 250;
  }

  // 6. Featured in rotary banner (+150 points)
  if (professional.featuredInBanner) {
    score += 150;
  }

  // 7. Special offer or discount for residents (+100 points)
  if (professional.specialOffer && professional.specialOffer.trim().length > 2) {
    score += 100;
  }

  // 8. Photo / logo asset present (+80 points)
  if (professional.imageUrl && professional.imageUrl.trim().length > 5) {
    score += 80;
  }

  // 9. Semantic search match relevance bonus
  if (query && query.trim()) {
    const searchScore = calculateRelevanceScore(professional, query);
    score += searchScore * 10;
  }

  // 10. Penalty for inactive ads
  if (professional.active === false) {
    score -= 10000;
  }

  return score;
}

// Backward compatibility alias for calculateRankingScore
export const calculateHotmartScore = calculateRankingScore;

/**
 * Checks if a category string matches a search query
 */
export function matchCategoryQuery(category: string, query: string): boolean {
  if (!category) return false;
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return true;

  const catNorm = normalizeText(category);
  const catWords = catNorm.split(" ").filter((w) => w.length > 0);

  for (const token of tokens) {
    if (!matchesSearchToken(token, catNorm, catWords, "")) {
      return false;
    }
  }
  return true;
}

/**
 * Highly resilient category matcher that handles accents, special chars (& vs e),
 * whitespace differences, and synonym variants (like "ar-condicionado" / "ar condicionado & split" / "split").
 */
export function isCategoryMatch(
  profCategory: string | null | undefined,
  profCategories: (string | null | undefined)[] | null | undefined,
  targetCategory: string | null | undefined
): boolean {
  if (!targetCategory) return true;
  const targetNorm = normalizeText(targetCategory);
  if (!targetNorm) return true;

  const candidateCategories: string[] = [];
  if (profCategory) candidateCategories.push(profCategory);
  if (Array.isArray(profCategories)) {
    for (const c of profCategories) {
      if (c) candidateCategories.push(c);
    }
  }

  for (const cat of candidateCategories) {
    const catNorm = normalizeText(cat);
    if (!catNorm) continue;
    if (catNorm === targetNorm) return true;
    
    // Handle "ar condicionado split" matching "ar condicionado & split" or "ar condicionado" or "split"
    if (targetNorm.includes("ar condicionado") || targetNorm.includes("split")) {
      if (catNorm.includes("ar condicionado") || catNorm.includes("split") || catNorm.includes("climatizacao")) {
        return true;
      }
    }
    
    // Handle substring containment for robust matching
    if (catNorm.includes(targetNorm) || targetNorm.includes(catNorm)) {
      return true;
    }
  }

  return false;
}

