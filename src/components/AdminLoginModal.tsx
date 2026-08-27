import React, { useState, useEffect } from "react";
import {
  Lock,
  X,
  KeyRound,
  AlertCircle,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  adminLoginApi,
  adminRequestForgotPasswordApi,
  adminResetPasswordApi,
  adminGetAuthInfoApi,
} from "../utils/storage";

interface AdminLoginModalProps {
  isOpen: boolean;
  onLogin: (password: string) => Promise<boolean> | boolean;
  onClose: () => void;
}

type ModalView = "login" | "forgot_request" | "forgot_verify";

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onLogin,
  onClose,
}) => {
  const [view, setView] = useState<ModalView>("login");

  // Login inputs
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Recovery inputs
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [configuredEmailMasked, setConfiguredEmailMasked] = useState<string>("");
  const [recoveryCodeDebugHint, setRecoveryCodeDebugHint] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      setView("login");
      setPassword("");
      setShowPassword(false);
      setEmail("");
      setCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError("");
      setSuccess("");
      setRecoveryCodeDebugHint(null);
      loadAuthInfo();
    }
  }, [isOpen]);

  const loadAuthInfo = async () => {
    try {
      const info = await adminGetAuthInfoApi();
      if (info.adminEmailMasked) {
        setConfiguredEmailMasked(info.adminEmailMasked);
      }
    } catch {}
  };

  if (!isOpen) return null;

  // 1. Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) {
      setError("Por favor, digite a senha de administrador.");
      return;
    }

    setIsLoading(true);
    try {
      // First verify via API
      const result = await adminLoginApi(password);
      if (result.success) {
        const ok = await Promise.resolve(onLogin(password));
        if (ok) {
          setPassword("");
          setError("");
          onClose();
        } else {
          setError("Senha incorreta. Verifique e tente novamente.");
        }
      } else {
        setError(result.error || "Senha incorreta. Verifique e tente novamente.");
      }
    } catch {
      setError("Erro ao autenticar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Request Password Reset Code
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setRecoveryCodeDebugHint(null);

    if (!email || !email.includes("@")) {
      setError("Por favor, informe um endereço de e-mail válido.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminRequestForgotPasswordApi(email);
      if (res.success) {
        setSuccess(
          res.message ||
            `Código de verificação enviado para ${res.emailMasked || email}. Verifique sua caixa de entrada.`
        );
        if (res.debugCode) {
          setRecoveryCodeDebugHint(res.debugCode);
        }
        setTimeout(() => {
          setView("forgot_verify");
          setError("");
          setSuccess("");
        }, 1200);
      } else {
        setError(
          res.error ||
            "E-mail não localizado. Verifique se digitou o e-mail cadastrado pelo administrador."
        );
      }
    } catch {
      setError("Falha na comunicação com o servidor ao solicitar código.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Confirm Code & Set New Password
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code || code.trim().length < 4) {
      setError("Por favor, insira o código de verificação recebido por e-mail.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("A confirmação da nova senha não confere.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminResetPasswordApi(email, code, newPassword);
      if (res.success) {
        setSuccess("Senha redefinida com sucesso! Acessando painel...");
        // Auto-login after password reset
        setTimeout(async () => {
          await Promise.resolve(onLogin(newPassword));
          onClose();
        }, 1200);
      } else {
        setError(res.error || "Código de verificação inválido ou expirado.");
      }
    } catch {
      setError("Erro ao redefinir senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="admin-login-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152A3E]/65 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="admin-login-modal"
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#CFDCE9] p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-[#1C5D9B]">
            <div className="w-9 h-9 rounded-xl bg-[#EEF3F9] flex items-center justify-center text-[#1C5D9B]">
              {view === "login" ? <KeyRound size={20} /> : <Mail size={20} />}
            </div>
            <div>
              <h3 className="font-['Fraunces',serif] text-base font-bold text-[#152A3E]">
                {view === "login"
                  ? "Login Administrador"
                  : view === "forgot_request"
                  ? "Recuperação de Senha"
                  : "Nova Senha de Acesso"}
              </h3>
              <p className="text-[11px] text-[#4E6579]">Condomínio Sports Garden</p>
            </div>
          </div>
          <button
            id="close-login-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4E6579] hover:bg-[#EEF3F9] hover:text-[#152A3E] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* ===================== VIEW 1: NORMAL LOGIN ===================== */}
        {view === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <p className="text-xs text-[#4E6579] leading-relaxed">
              Insira a senha de administração para gerenciar prestadores, anúncios e categorias do condomínio.
            </p>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono uppercase font-semibold text-[#4E6579]">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setView("forgot_request");
                  }}
                  className="text-[11px] text-[#1C5D9B] hover:text-[#123F6B] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-pass-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha de administrador"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E6579] hover:text-[#152A3E] cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                id="cancel-login-btn"
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-[#4E6579] hover:text-[#152A3E] rounded-lg hover:bg-[#EEF3F9] cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                id="submit-login-btn"
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    <span>Acessar Painel</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ===================== VIEW 2: FORGOT - REQUEST CODE ===================== */}
        {view === "forgot_request" && (
          <form onSubmit={handleRequestResetCode} className="space-y-4">
            <p className="text-xs text-[#4E6579] leading-relaxed">
              Informe o e-mail do administrador cadastrado para receber um código de segurança de 6 dígitos para redefinir sua senha.
            </p>

            {configuredEmailMasked && (
              <div className="p-2.5 bg-[#EEF3F9] rounded-xl text-[11px] text-[#152A3E] flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#1C5D9B] shrink-0" />
                <span>
                  E-mail cadastrado: <strong>{configuredEmailMasked}</strong>
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                E-mail do Administrador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: seuemail@dominio.com"
                autoFocus
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setView("login");
                }}
                className="text-xs font-semibold text-[#4E6579] hover:text-[#152A3E] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Voltar ao login</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Mail size={14} />
                    <span>Enviar Código</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ===================== VIEW 3: FORGOT - VERIFY & SET NEW PASS ===================== */}
        {view === "forgot_verify" && (
          <form onSubmit={handleConfirmReset} className="space-y-3.5">
            <p className="text-xs text-[#4E6579] leading-relaxed">
              Digite o código de 6 dígitos enviado para <strong>{email}</strong> e escolha sua nova senha.
            </p>

            {recoveryCodeDebugHint && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <span>Código gerado:</span>
                <span className="font-mono font-bold text-sm tracking-widest bg-amber-200/70 px-2 py-0.5 rounded">
                  {recoveryCodeDebugHint}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                Código de 6 Dígitos
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                autoFocus
                required
                className="w-full text-center font-mono text-lg tracking-widest px-3 py-2 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                Nova Senha (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2 pr-10 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E6579] hover:text-[#152A3E] cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                minLength={6}
                className="w-full px-3.5 py-2 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setView("forgot_request");
                }}
                className="text-xs font-semibold text-[#4E6579] hover:text-[#152A3E] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Reenviar código</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Redefinir & Entrar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
