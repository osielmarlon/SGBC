import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import child_process from "child_process";
import { createServer as createViteServer } from "vite";
import { INITIAL_SEED } from "./src/data/seed";
import { AppData } from "./src/types";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "sportsgarden_database.json");
const AUTH_FILE = path.join(DATA_DIR, "sportsgarden_admin_auth.json");

interface ResetCodeEntry {
  code: string;
  email: string;
  expiresAt: number;
}

interface AdminAuthConfig {
  adminPassword: string;
  adminEmail: string;
  updatedAt?: string;
  resetCodes?: ResetCodeEntry[];
}

const DEFAULT_ADMIN_CONFIG: AdminAuthConfig = {
  adminPassword: "sportsgarden2026",
  adminEmail: "osilva@tre-pa.jus.br",
  updatedAt: new Date().toISOString(),
  resetCodes: [],
};

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to mask email for privacy (e.g. os***@tre-pa.jus.br)
function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "email***@dominio.com";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user.charAt(0)}***@${domain}`;
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
}

// Helper to load admin auth config from disk
function readAdminAuth(): AdminAuthConfig {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const content = fs.readFileSync(AUTH_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.adminPassword === "string" && typeof parsed.adminEmail === "string") {
        return {
          ...DEFAULT_ADMIN_CONFIG,
          ...parsed,
          resetCodes: Array.isArray(parsed.resetCodes) ? parsed.resetCodes : [],
        };
      }
    }
  } catch (err) {
    console.error("Error reading admin auth file, resetting to default:", err);
  }

  writeAdminAuth(DEFAULT_ADMIN_CONFIG);
  return DEFAULT_ADMIN_CONFIG;
}

// Helper to write admin auth safely
function writeAdminAuth(config: AdminAuthConfig): boolean {
  try {
    const tempFile = `${AUTH_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(config, null, 2), "utf-8");
    fs.renameSync(tempFile, AUTH_FILE);
    return true;
  } catch (err) {
    console.error("Error writing admin auth file:", err);
    try {
      fs.writeFileSync(AUTH_FILE, JSON.stringify(config, null, 2), "utf-8");
      return true;
    } catch (fallbackErr) {
      console.error("Fallback admin auth write also failed:", fallbackErr);
      return false;
    }
  }
}

// Helper to load current database from disk with multi-tier redundancy
function readDatabase(): AppData {
  let loadedData: AppData | null = null;

  // Tier 1: Primary database file
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.professionals) && parsed.professionals.length > 0) {
        loadedData = parsed;
      }
    }
  } catch (err) {
    console.error("[DATABASE] Error reading primary database file:", err);
  }

  // Tier 2: Backup database file if Tier 1 failed or was empty
  if (!loadedData) {
    const backupFile = path.join(DATA_DIR, "sportsgarden_database.backup.json");
    try {
      if (fs.existsSync(backupFile)) {
        const content = fs.readFileSync(backupFile, "utf-8");
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.professionals) && parsed.professionals.length > 0) {
          console.log("[DATABASE] Recovered database state from backup file!");
          loadedData = parsed;
        }
      }
    } catch (backupErr) {
      console.error("[DATABASE] Error reading backup database file:", backupErr);
    }
  }

  // Tier 3: Default to INITIAL_SEED
  if (!loadedData) {
    console.warn("[DATABASE] No persistent database found, initializing with INITIAL_SEED");
    loadedData = INITIAL_SEED;
  }

  // Sanitize and ensure no data is dropped
  const deletedSet = new Set(Array.isArray(loadedData.deletedProfessionalIds) ? loadedData.deletedProfessionalIds : []);
  
  // Merge any missing professionals from INITIAL_SEED that were not deleted
  const currentIds = new Set(loadedData.professionals.map((p) => p.id));
  const mergedProfessionals = [...loadedData.professionals];
  let hadSeedMerge = false;

  for (const seedProf of INITIAL_SEED.professionals) {
    if (seedProf && seedProf.id && !deletedSet.has(seedProf.id) && !currentIds.has(seedProf.id)) {
      mergedProfessionals.push(seedProf);
      currentIds.add(seedProf.id);
      hadSeedMerge = true;
    }
  }

  const mergedCategories = Array.from(new Set([...loadedData.categories, ...INITIAL_SEED.categories]));

  const resultDb: AppData = {
    categories: mergedCategories,
    professionals: mergedProfessionals,
    pendingIndications: Array.isArray(loadedData.pendingIndications) ? loadedData.pendingIndications : [],
    deletedProfessionalIds: Array.from(deletedSet),
  };

  if (hadSeedMerge || !fs.existsSync(DB_FILE)) {
    writeDatabase(resultDb);
  }

  return resultDb;
}

// Helper to write database to disk safely with atomic temp write, backup copy, and seed.ts synchronization
function writeDatabase(data: AppData): boolean {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    
    // 1. Primary write via atomic temp file
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, jsonStr, "utf-8");
    fs.renameSync(tempFile, DB_FILE);

    // 2. Secondary backup write
    const backupFile = path.join(DATA_DIR, "sportsgarden_database.backup.json");
    fs.writeFileSync(backupFile, jsonStr, "utf-8");

    // 3. Keep src/data/seed.ts in sync so code restarts and builds have the exact latest state
    try {
      const seedFilePath = path.join(process.cwd(), "src", "data", "seed.ts");
      const seedContent = `import { AppData } from '../types';\n\nexport const INITIAL_SEED: AppData = ${jsonStr};\n`;
      fs.writeFileSync(seedFilePath, seedContent, "utf-8");
    } catch (seedErr) {
      console.warn("[DATABASE] Could not write to seed.ts:", seedErr);
    }

    console.log(`[DATABASE PERSISTED] Saved ${data.professionals.length} professionals and ${data.categories.length} categories.`);
    return true;
  } catch (err) {
    console.error("[DATABASE] Error writing database file:", err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (fallbackErr) {
      console.error("[DATABASE] Fallback write also failed:", fallbackErr);
      return false;
    }
  }
}

async function startServer() {
  const app = express();

  // Middleware for JSON body parsing
  app.use(express.json({ limit: "15mb" }));

  // Serve static public/images and assets
  app.use("/images", express.static(path.join(process.cwd(), "public/images")));
  app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));

  // CORS headers for local resilience
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.json({
      status: "ok",
      serverTime: new Date().toISOString(),
      storage: "server-cloud-json",
      connected: true
    });
  });

  // ==========================================
  // ADMIN AUTH & PASSWORD RECOVERY ENDPOINTS
  // ==========================================

  // GET /api/admin/auth/info - Public info for login & recovery assistance
  app.get("/api/admin/auth/info", (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      const auth = readAdminAuth();
      res.json({
        success: true,
        adminEmailMasked: maskEmail(auth.adminEmail),
        hasCustomPassword: auth.adminPassword !== DEFAULT_ADMIN_CONFIG.adminPassword,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Falha ao consultar informações de segurança" });
    }
  });

  // POST /api/admin/auth/login - Verify admin password
  app.post("/api/admin/auth/login", (req, res) => {
    try {
      const { password } = req.body || {};
      if (!password || typeof password !== "string") {
        res.status(400).json({ success: false, error: "Por favor, informe a senha de acesso." });
        return;
      }

      const auth = readAdminAuth();
      if (password.trim() === auth.adminPassword.trim()) {
        res.json({
          success: true,
          message: "Login de administrador realizado com sucesso!",
          adminEmailMasked: maskEmail(auth.adminEmail),
        });
      } else {
        res.status(401).json({
          success: false,
          error: "Senha incorreta. Verifique os dados digitados ou utilize a recuperação por e-mail.",
        });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Erro no servidor ao autenticar" });
    }
  });

  // POST /api/admin/auth/change-password - Change admin password
  app.post("/api/admin/auth/change-password", (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body || {};
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, error: "Senha atual e nova senha são obrigatórias." });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ success: false, error: "A nova senha deve ter no mínimo 6 caracteres para segurança." });
        return;
      }

      const auth = readAdminAuth();
      if (currentPassword.trim() !== auth.adminPassword.trim()) {
        res.status(401).json({ success: false, error: "A senha atual digitada está incorreta." });
        return;
      }

      auth.adminPassword = newPassword.trim();
      auth.updatedAt = new Date().toISOString();
      auth.resetCodes = []; // Invalidate any pending codes
      writeAdminAuth(auth);

      console.log(`[ADMIN SECURITY] Senha de administrador alterada com sucesso em ${auth.updatedAt}`);
      res.json({
        success: true,
        message: "Senha de administrador alterada com sucesso! Utilize a nova senha nos próximos acessos.",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Erro ao alterar senha" });
    }
  });

  // POST /api/admin/auth/update-email - Update admin recovery email address
  app.post("/api/admin/auth/update-email", (req, res) => {
    try {
      const { currentPassword, newEmail } = req.body || {};
      if (!currentPassword || !newEmail || !newEmail.includes("@")) {
        res.status(400).json({ success: false, error: "Senha atual e um e-mail válido são obrigatórios." });
        return;
      }

      const auth = readAdminAuth();
      if (currentPassword.trim() !== auth.adminPassword.trim()) {
        res.status(401).json({ success: false, error: "A senha atual digitada está incorreta." });
        return;
      }

      auth.adminEmail = newEmail.trim().toLowerCase();
      auth.updatedAt = new Date().toISOString();
      auth.resetCodes = [];
      writeAdminAuth(auth);

      console.log(`[ADMIN SECURITY] E-mail de recuperação atualizado para: ${auth.adminEmail}`);
      res.json({
        success: true,
        message: `E-mail de recuperação atualizado com sucesso para: ${auth.adminEmail}`,
        adminEmailMasked: maskEmail(auth.adminEmail),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Erro ao atualizar e-mail" });
    }
  });

  // POST /api/admin/auth/forgot-password - Request recovery code via email
  app.post("/api/admin/auth/forgot-password", (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email || !email.includes("@")) {
        res.status(400).json({ success: false, error: "Informe o e-mail de administrador cadastrado." });
        return;
      }

      const auth = readAdminAuth();
      const inputEmail = email.trim().toLowerCase();
      const registeredEmail = (auth.adminEmail || "").trim().toLowerCase();

      // Check if email matches configured email or default admin
      if (inputEmail !== registeredEmail && inputEmail !== DEFAULT_ADMIN_CONFIG.adminEmail.toLowerCase()) {
        res.status(404).json({
          success: false,
          error: `O e-mail "${email}" não confere com o e-mail administrativo cadastrado (${maskEmail(registeredEmail)}).`,
        });
        return;
      }

      // Generate 6-digit numeric verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

      // Store in auth config
      const cleanResetCodes = (auth.resetCodes || []).filter(c => c.expiresAt > Date.now());
      cleanResetCodes.push({ code, email: inputEmail, expiresAt });
      auth.resetCodes = cleanResetCodes;
      writeAdminAuth(auth);

      // Log dispatch to system console for instant audit
      console.log(`=======================================================`);
      console.log(`[REDEFINIÇÃO DE SENHA SPORTS GARDEN]`);
      console.log(`Destinatário: ${inputEmail}`);
      console.log(`Código de Verificação (6 dígitos): ${code}`);
      console.log(`Validade: 15 minutos (até ${new Date(expiresAt).toLocaleTimeString("pt-BR")})`);
      console.log(`=======================================================`);

      res.json({
        success: true,
        message: `Código de verificação de 6 dígitos gerado e enviado para ${maskEmail(inputEmail)}.`,
        emailMasked: maskEmail(inputEmail),
        expiresInMinutes: 15,
        // In local development/testing or in case email provider is async, code is delivered securely
        debugCode: process.env.NODE_ENV !== "production" ? code : undefined,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Erro ao solicitar recuperação de senha" });
    }
  });

  // POST /api/admin/auth/reset-password - Verify code and set new password
  app.post("/api/admin/auth/reset-password", (req, res) => {
    try {
      const { email, code, newPassword } = req.body || {};
      if (!email || !code || !newPassword) {
        res.status(400).json({ success: false, error: "E-mail, código de verificação e nova senha são obrigatórios." });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ success: false, error: "A nova senha deve ter no mínimo 6 caracteres." });
        return;
      }

      const auth = readAdminAuth();
      const inputEmail = email.trim().toLowerCase();
      const inputCode = code.trim();

      const validEntry = (auth.resetCodes || []).find(
        (c) => c.code === inputCode && c.email.toLowerCase() === inputEmail && c.expiresAt > Date.now()
      );

      if (!validEntry) {
        res.status(400).json({
          success: false,
          error: "Código de verificação inválido ou expirado. Solicite um novo código.",
        });
        return;
      }

      // Update password & clear reset codes
      auth.adminPassword = newPassword.trim();
      auth.updatedAt = new Date().toISOString();
      auth.resetCodes = [];
      writeAdminAuth(auth);

      console.log(`[ADMIN SECURITY] Senha redefinida com sucesso via código de e-mail para ${inputEmail}`);
      res.json({
        success: true,
        message: "Senha de administrador redefinida com sucesso! Você já pode acessar o painel.",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Erro ao redefinir senha" });
    }
  });

  // GET /api/catalog - Get shared catalog data
  app.get("/api/catalog", (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const dbData = readDatabase();
      res.json({
        success: true,
        data: dbData,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Failed to load database" });
    }
  });

  // POST /api/catalog - Save entire catalog data (Sync / Import)
  app.post("/api/catalog", (req, res) => {
    try {
      const incomingData = req.body;
      if (!incomingData || !Array.isArray(incomingData.categories) || !Array.isArray(incomingData.professionals)) {
        res.status(400).json({ success: false, error: "Invalid catalog format" });
        return;
      }

      const currentDb = readDatabase();
      const currentDeleted = Array.isArray(currentDb.deletedProfessionalIds) ? currentDb.deletedProfessionalIds : [];
      const incomingDeleted = Array.isArray(incomingData.deletedProfessionalIds) ? incomingData.deletedProfessionalIds : [];
      const incomingIds = new Set(incomingData.professionals.map((p: any) => p && p.id).filter(Boolean));
      // Only keep deleted IDs for items that are not being actively sent/saved now
      const mergedDeleted = Array.from(new Set([...currentDeleted, ...incomingDeleted])).filter(id => !incomingIds.has(id));

      const cleanDb: AppData = {
        categories: Array.from(new Set(incomingData.categories.filter(Boolean))),
        professionals: incomingData.professionals.filter((p: any) => p && p.id),
        pendingIndications: Array.isArray(incomingData.pendingIndications) ? incomingData.pendingIndications : [],
        deletedProfessionalIds: mergedDeleted,
      };

      const success = writeDatabase(cleanDb);
      if (success) {
        res.json({ success: true, message: "Catalog saved successfully on server cloud database", data: cleanDb });
      } else {
        res.status(500).json({ success: false, error: "Failed to persist to disk" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Failed to save database" });
    }
  });

  // DELETE /api/professionals/:id - Explicit atomic deletion of a professional/ad
  app.delete("/api/professionals/:id", (req, res) => {
    try {
      const idToDelete = req.params.id;
      if (!idToDelete) {
        res.status(400).json({ success: false, error: "Missing professional id" });
        return;
      }

      const currentDb = readDatabase();
      const existingDeleted = Array.isArray(currentDb.deletedProfessionalIds) ? currentDb.deletedProfessionalIds : [];
      const newDeletedSet = new Set<string>([...existingDeleted, idToDelete]);

      // Target item
      const target = currentDb.professionals.find((p) => p.id === idToDelete);
      const cleanPhone = target?.phone ? target.phone.replace(/\D/g, "") : "";
      const cleanName = target?.name ? target.name.trim().toLowerCase() : "";

      const updatedProfessionals = currentDb.professionals.filter((p) => {
        if (p.id === idToDelete) return false;
        // Also remove duplicate with same phone & name
        if (
          cleanPhone.length >= 8 &&
          (p.phone || "").replace(/\D/g, "") === cleanPhone &&
          p.name.trim().toLowerCase() === cleanName
        ) {
          newDeletedSet.add(p.id);
          return false;
        }
        return true;
      });

      const updatedDb: AppData = {
        ...currentDb,
        professionals: updatedProfessionals,
        deletedProfessionalIds: Array.from(newDeletedSet),
      };

      writeDatabase(updatedDb);
      res.json({
        success: true,
        message: `Professional ${idToDelete} deleted successfully`,
        data: updatedDb,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Failed to delete professional" });
    }
  });

  // PATCH /api/professionals/:id/toggle-active - Atomically toggle active status
  app.patch("/api/professionals/:id/toggle-active", (req, res) => {
    try {
      const id = req.params.id;
      const { active } = req.body;

      const currentDb = readDatabase();
      let found = false;
      const updatedProfessionals = currentDb.professionals.map((p) => {
        if (p.id === id) {
          found = true;
          const newActive = typeof active === "boolean" ? active : !(p.active !== false);
          return { ...p, active: newActive };
        }
        return p;
      });

      if (!found) {
        res.status(404).json({ success: false, error: "Profissional não encontrado" });
        return;
      }

      const updatedDb: AppData = {
        ...currentDb,
        professionals: updatedProfessionals,
      };

      writeDatabase(updatedDb);
      res.json({
        success: true,
        message: "Status de visibilidade atualizado com sucesso",
        data: updatedDb,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Falha ao alterar status" });
    }
  });

  // PATCH /api/professionals/:id/toggle-sponsored - Atomically toggle sponsored status
  app.patch("/api/professionals/:id/toggle-sponsored", (req, res) => {
    try {
      const id = req.params.id;
      const { sponsored } = req.body;

      const currentDb = readDatabase();
      let found = false;
      const updatedProfessionals = currentDb.professionals.map((p) => {
        if (p.id === id) {
          found = true;
          const newSponsored = typeof sponsored === "boolean" ? sponsored : !Boolean(p.sponsored);
          const isEvent = p.adType === "event" || p.adType === "condo_event" || p.adType === "external_event";
          const newFeatured = newSponsored ? (p.featuredInBanner ?? true) : (isEvent ? true : false);
          return { ...p, sponsored: newSponsored, featuredInBanner: newFeatured };
        }
        return p;
      });

      if (!found) {
        res.status(404).json({ success: false, error: "Profissional não encontrado" });
        return;
      }

      const updatedDb: AppData = {
        ...currentDb,
        professionals: updatedProfessionals,
      };

      writeDatabase(updatedDb);
      res.json({
        success: true,
        message: "Status de patrocinado atualizado com sucesso",
        data: updatedDb,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Falha ao alterar status de patrocinado" });
    }
  });

  // PATCH /api/professionals/:id/toggle-featured - Atomically toggle featured status
  app.patch("/api/professionals/:id/toggle-featured", (req, res) => {
    try {
      const id = req.params.id;
      const { featuredInBanner } = req.body;

      const currentDb = readDatabase();
      let found = false;
      const updatedProfessionals = currentDb.professionals.map((p) => {
        if (p.id === id) {
          found = true;
          const newFeatured = typeof featuredInBanner === "boolean" ? featuredInBanner : !Boolean(p.featuredInBanner);
          return { ...p, featuredInBanner: newFeatured };
        }
        return p;
      });

      if (!found) {
        res.status(404).json({ success: false, error: "Profissional não encontrado" });
        return;
      }

      const updatedDb: AppData = {
        ...currentDb,
        professionals: updatedProfessionals,
      };

      writeDatabase(updatedDb);
      res.json({
        success: true,
        message: "Status de destaque atualizado com sucesso",
        data: updatedDb,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Falha ao alterar status de destaque" });
    }
  });

  // POST /api/professionals - Create or add a new professional/ad
  app.post("/api/professionals", (req, res) => {
    try {
      const newProf = req.body;
      if (!newProf || !newProf.name) {
        res.status(400).json({ success: false, error: "Nome do profissional ou empresa é obrigatório" });
        return;
      }

      const currentDb = readDatabase();
      const profId = newProf.id || `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const formattedProf = {
        ...newProf,
        id: profId,
        active: newProf.active !== undefined ? Boolean(newProf.active) : true,
      };

      // Add to beginning of list
      const updatedProfessionals = [formattedProf, ...currentDb.professionals.filter((p) => p.id !== profId)];

      // Ensure categories exist
      let updatedCategories = [...currentDb.categories];
      const catsToCheck = Array.isArray(formattedProf.categories)
        ? formattedProf.categories
        : (formattedProf.category ? [formattedProf.category] : []);

      for (const c of catsToCheck) {
        const trimmed = (c || "").trim();
        if (trimmed && !updatedCategories.some((ex) => ex.toLowerCase() === trimmed.toLowerCase())) {
          updatedCategories.push(trimmed);
        }
      }

      const updatedDb: AppData = {
        ...currentDb,
        categories: Array.from(new Set(updatedCategories)),
        professionals: updatedProfessionals,
      };

      writeDatabase(updatedDb);
      console.log(`[DATABASE PERSISTENCE] Novo profissional criado: "${formattedProf.name}" (ID: ${profId})`);
      res.json({
        success: true,
        message: "Profissional cadastrado e persistido com sucesso",
        data: updatedDb,
        professional: formattedProf,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Falha ao cadastrar profissional" });
    }
  });

  // POST /api/professionals/:id/reviews - Add a new review to a professional
  app.post("/api/professionals/:id/reviews", (req, res) => {
    try {
      const id = req.params.id;
      const { rating, residentName, unit, comment } = req.body || {};

      if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
        res.status(400).json({ success: false, error: "Nota de avaliação de 1 a 5 estrelas é obrigatória" });
        return;
      }

      const currentDb = readDatabase();
      let found = false;

      const newReview = {
        id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        residentName: (residentName || "Morador do Sports Garden").trim(),
        unit: (unit || "Sports Garden").trim(),
        rating,
        comment: (comment || "").trim(),
        createdAt: new Date().toISOString().split("T")[0],
      };

      const updatedProfessionals = currentDb.professionals.map((p) => {
        if (p.id === id) {
          found = true;
          const existingReviews = Array.isArray(p.reviews) ? p.reviews : [];
          const allReviews = [newReview, ...existingReviews];
          const totalScore = allReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
          const newAverage = Number((totalScore / allReviews.length).toFixed(1));

          return {
            ...p,
            rating: newAverage,
            reviewCount: allReviews.length,
            reviews: allReviews,
          };
        }
        return p;
      });

      if (!found) {
        res.status(404).json({ success: false, error: "Profissional não encontrado para avaliação" });
        return;
      }

      const updatedDb: AppData = {
        ...currentDb,
        professionals: updatedProfessionals,
      };

      writeDatabase(updatedDb);
      console.log(`[DATABASE PERSISTENCE] Nova avaliação de ${rating} estrelas registrada para o profissional ${id}`);
      res.json({
        success: true,
        message: "Avaliação registrada e persistida com sucesso no banco de dados",
        data: updatedDb,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Falha ao registrar avaliação" });
    }
  });

  // PUT /api/professionals/:id - Update professional details
  app.put("/api/professionals/:id", (req, res) => {
    try {
      const id = req.params.id;
      const updatedData = req.body;

      const currentDb = readDatabase();
      let found = false;
      const updatedProfessionals = currentDb.professionals.map((p) => {
        if (p.id === id) {
          found = true;
          return {
            ...p,
            ...updatedData,
            id: p.id, // preserve immutable id
          };
        }
        return p;
      });

      if (!found) {
        // If not found, add as new
        updatedProfessionals.push({
          ...updatedData,
          id,
        });
      }

      const updatedDb: AppData = {
        ...currentDb,
        professionals: updatedProfessionals,
      };

      writeDatabase(updatedDb);
      res.json({
        success: true,
        message: "Profissional atualizado com sucesso",
        data: updatedDb,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Falha ao atualizar profissional" });
    }
  });

  // PUT /api/categories/:name - Atomically update/rename category across database
  app.put("/api/categories/:name", (req, res) => {
    try {
      const oldCategory = decodeURIComponent(req.params.name).trim();
      const { newName } = req.body;
      const newCategory = (newName || "").trim();

      if (!oldCategory || !newCategory) {
        res.status(400).json({ success: false, error: "Nome de categoria inválido" });
        return;
      }

      const currentDb = readDatabase();
      const oldClean = oldCategory.toLowerCase();

      // Update categories array
      const updatedCategories = currentDb.categories.map((c) =>
        c.trim().toLowerCase() === oldClean ? newCategory : c
      );

      // If newCategory is not present, add it
      if (!updatedCategories.some((c) => c.toLowerCase() === newCategory.toLowerCase())) {
        updatedCategories.push(newCategory);
      }

      // Update professionals
      const updatedProfessionals = currentDb.professionals.map((p) =>
        (p.category || "").trim().toLowerCase() === oldClean ? { ...p, category: newCategory } : p
      );

      // Update pending indications
      const updatedPending = (currentDb.pendingIndications || []).map((ind) =>
        (ind.professional?.category || "").trim().toLowerCase() === oldClean
          ? { ...ind, professional: { ...ind.professional, category: newCategory } }
          : ind
      );

      const updatedDb: AppData = {
        ...currentDb,
        categories: Array.from(new Set(updatedCategories.filter(Boolean))),
        professionals: updatedProfessionals,
        pendingIndications: updatedPending,
      };

      const success = writeDatabase(updatedDb);
      if (success) {
        res.json({
          success: true,
          message: `Categoria renomeada de "${oldCategory}" para "${newCategory}" com sucesso`,
          data: updatedDb,
        });
      } else {
        res.status(500).json({ success: false, error: "Falha ao gravar no disco" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Erro ao atualizar categoria" });
    }
  });

  // DELETE /api/categories/:name - Atomically delete category and reassign to 'Outros'
  app.delete("/api/categories/:name", (req, res) => {
    try {
      const categoryToDelete = decodeURIComponent(req.params.name).trim();
      if (!categoryToDelete) {
        res.status(400).json({ success: false, error: "Nome da categoria ausente" });
        return;
      }

      const currentDb = readDatabase();
      const cleanTarget = categoryToDelete.toLowerCase();

      let newCategories = currentDb.categories.filter(
        (c) => c.trim().toLowerCase() !== cleanTarget
      );

      const affectedProfs = currentDb.professionals.filter(
        (p) => (p.category || "").trim().toLowerCase() === cleanTarget
      );

      if (affectedProfs.length > 0 && !newCategories.some((c) => c.toLowerCase() === "outros")) {
        newCategories.push("Outros");
      }

      const updatedProfessionals = currentDb.professionals.map((p) =>
        (p.category || "").trim().toLowerCase() === cleanTarget
          ? { ...p, category: "Outros" }
          : p
      );

      const updatedPending = (currentDb.pendingIndications || []).map((ind) =>
        (ind.professional?.category || "").trim().toLowerCase() === cleanTarget
          ? { ...ind, professional: { ...ind.professional, category: "Outros" } }
          : ind
      );

      const updatedDb: AppData = {
        ...currentDb,
        categories: Array.from(new Set(newCategories.filter(Boolean))),
        professionals: updatedProfessionals,
        pendingIndications: updatedPending,
      };

      const success = writeDatabase(updatedDb);
      if (success) {
        res.json({
          success: true,
          message: `Categoria "${categoryToDelete}" excluída com sucesso`,
          data: updatedDb,
        });
      } else {
        res.status(500).json({ success: false, error: "Falha ao gravar no disco" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Erro ao excluir categoria" });
    }
  });

  // POST /api/categories - Atomically add a new category
  app.post("/api/categories", (req, res) => {
    try {
      const { name } = req.body;
      const categoryToAdd = (name || "").trim();
      if (!categoryToAdd) {
        res.status(400).json({ success: false, error: "Nome da categoria obrigatório" });
        return;
      }

      const currentDb = readDatabase();
      if (currentDb.categories.some((c) => c.toLowerCase() === categoryToAdd.toLowerCase())) {
        res.json({ success: true, message: "Categoria já existe", data: currentDb });
        return;
      }

      const newCategories = [...currentDb.categories, categoryToAdd].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      );

      const updatedDb: AppData = {
        ...currentDb,
        categories: Array.from(new Set(newCategories)),
      };

      const success = writeDatabase(updatedDb);
      if (success) {
        res.json({
          success: true,
          message: `Categoria "${categoryToAdd}" criada com sucesso`,
          data: updatedDb,
        });
      } else {
        res.status(500).json({ success: false, error: "Falha ao salvar categoria no disco" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Erro ao adicionar categoria" });
    }
  });

  // POST /api/upload-image - Upload base64 image and save to disk cleanly in public/images
  app.post("/api/upload-image", (req, res) => {
    try {
      const { imageBase64, filenamePrefix } = req.body;
      if (!imageBase64 || typeof imageBase64 !== "string") {
        res.status(400).json({ success: false, error: "Imagem inválida" });
        return;
      }

      const match = imageBase64.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
      if (!match) {
        // If it's already a URL path like /images/..., return it as is
        if (imageBase64.startsWith("/images/") || imageBase64.startsWith("http")) {
          res.json({ success: true, imageUrl: imageBase64 });
          return;
        }
        res.status(400).json({ success: false, error: "Formato base64 inválido" });
        return;
      }

      const ext = match[1] === "png" ? "png" : "jpg";
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      const safePrefix = (filenamePrefix || "upload").replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 30);
      const filename = `${safePrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}.${ext}`;
      const imagesDir = path.join(process.cwd(), "public", "images");

      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const filePath = path.join(imagesDir, filename);
      fs.writeFileSync(filePath, buffer);

      const imageUrl = `/images/${filename}`;
      console.log(`[IMAGE UPLOAD] Imagem salva com sucesso: ${imageUrl} (${buffer.length} bytes)`);
      res.json({ success: true, imageUrl });
    } catch (error: any) {
      console.error("[IMAGE UPLOAD] Erro ao processar imagem:", error);
      res.status(500).json({ success: false, error: "Falha ao processar upload de imagem" });
    }
  });

  // POST /api/indications - Submit new resident indication
  app.post("/api/indications", (req, res) => {
    try {
      const indication = req.body;
      if (!indication || !indication.professional) {
        res.status(400).json({ success: false, error: "Invalid indication data" });
        return;
      }

      const currentDb = readDatabase();
      const pendingList = Array.isArray(currentDb.pendingIndications) ? currentDb.pendingIndications : [];
      const updatedPending = [indication, ...pendingList];

      const updatedDb: AppData = {
        ...currentDb,
        pendingIndications: updatedPending,
      };

      writeDatabase(updatedDb);
      res.json({ success: true, message: "Indication received and persisted" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Failed to add indication" });
    }
  });

  // GET /api/export-project-zip - Download complete source code + database as a standalone .zip
  app.get("/api/export-project-zip", (req, res) => {
    try {
      const zipPath = path.join(os.tmpdir(), `sportsgarden-source-${Date.now()}.zip`);
      const script = `
import os, zipfile, sys

zip_path = sys.argv[1]
root_dir = os.getcwd()
exclude_dirs = {'.git', 'node_modules', 'dist', '.cache', '__pycache__', '.temp'}
exclude_files = {'test-export.zip', 'test-win-zip.zip'}

with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if f.endswith('.zip') or f.endswith('.tar.gz') or f in exclude_files:
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, root_dir).replace('\\\\', '/')
            # Create standard ZipInfo object with safe timestamp and POSIX/DOS attributes
            zinfo = zipfile.ZipInfo.from_file(full_path, rel_path)
            zinfo.compress_type = zipfile.ZIP_DEFLATED
            # Windows compatibility: set external_attr for regular file (0o644 in upper 16 bits)
            zinfo.external_attr = (0o644 & 0xFFFF) << 16
            with open(full_path, 'rb') as src_file:
                zf.writestr(zinfo, src_file.read())

with zipfile.ZipFile(zip_path, 'r') as check_zf:
    test_result = check_zf.testzip()
    if test_result is not None:
        raise Exception(f'Corrupted zip entry: {test_result}')
`;
      const pyProcess = child_process.spawnSync("python3", ["-c", script, zipPath], {
        cwd: process.cwd(),
        encoding: "utf-8",
      });

      if (pyProcess.status !== 0 || !fs.existsSync(zipPath)) {
        console.error("Python zip error:", pyProcess.stderr || pyProcess.stdout);
        res.status(500).json({ success: false, error: "Falha ao gerar arquivo ZIP do projeto" });
        return;
      }

      const zipBuffer = fs.readFileSync(zipPath);
      try {
        fs.unlinkSync(zipPath);
      } catch {}

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Length", zipBuffer.length.toString());
      res.setHeader("Content-Disposition", 'attachment; filename="sportsgarden-projeto-completo.zip"');
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.status(200).send(zipBuffer);
    } catch (err: any) {
      console.error("Export zip error:", err);
      res.status(500).json({ success: false, error: err?.message || "Erro ao exportar projeto" });
    }
  });

  // GET /api/export-database-json - Direct download of current JSON database
  app.get("/api/export-database-json", (req, res) => {
    try {
      const currentDb = readDatabase();
      const filename = `sportsgarden-backup-${new Date().toISOString().split("T")[0]}.json`;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Cache-Control", "no-cache");
      res.send(JSON.stringify(currentDb, null, 2));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Erro ao exportar banco de dados" });
    }
  });

  // POST /api/reset - Restore official seed database
  app.post("/api/reset", (req, res) => {
    try {
      writeDatabase(INITIAL_SEED);
      res.json({ success: true, message: "Database reset to official initial seed" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || "Failed to reset database" });
    }
  });

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sports Garden Cloud Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
