import React, { useState, useEffect } from "react";
import {
  X,
  KeyRound,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from "lucide-react";
import {
  adminChangePasswordApi,
  adminUpdateEmailApi,
  adminGetAuthInfoApi,
} from "../utils/storage";

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [tab, setTab] = useState<"password" | "email">("password");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Email State
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [showEmailCurrentPass, setShowEmailCurrentPass] = useState(false);
  const [configuredEmailMasked, setConfiguredEmailMasked] = useState<string>("");

  // Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSuccessMessage("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEmailCurrentPassword("");
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword) {
      setErrorMessage("Informe a senha atual de administrador.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("A confirmação da nova senha não confere.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminChangePasswordApi(currentPassword, newPassword);
      if (result.success) {
        setSuccessMessage("Senha de administrador alterada com sucesso!");
        if (onSuccessToast) onSuccessToast("Senha de administrador atualizada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.error || "Não foi possível alterar a senha. Verifique a senha atual.");
      }
    } catch (err: any) {
      setErrorMessage("Erro ao conectar com o servidor para alterar a senha.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newEmail || !newEmail.includes("@") || !newEmail.includes(".")) {
      setErrorMessage("Por favor, digite um endereço de e-mail válido.");
      return;
    }

    if (!emailCurrentPassword) {
      setErrorMessage("Informe sua senha atual para autorizar a alteração de e-mail.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminUpdateEmailApi(emailCurrentPassword, newEmail);
      if (result.success) {
        setSuccessMessage("E-mail de recuperação atualizado com sucesso!");
        if (result.adminEmailMasked) {
          setConfiguredEmailMasked(result.adminEmailMasked);
        }
        if (onSuccessToast) onSuccessToast("E-mail de recuperação salvo com sucesso!");
        setNewEmail("");
        setEmailCurrentPassword("");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.error || "Não foi possível atualizar o e-mail.");
      }
    } catch {
      setErrorMessage("Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="admin-security-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152A3E]/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="admin-security-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#CFDCE9] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#152A3E] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#AECB3E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#AECB3E]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-['Fraunces',serif] text-base font-bold">Segurança do Administrador</h3>
              <p className="text-[11px] text-[#CFDCE9]">Gerenciamento de Senha & E-mail de Recuperação</p>
            </div>
          </div>
          <button
            id="close-admin-security-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#CFDCE9] hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#EEF3F9] bg-[#F8FAFC] px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setTab("password");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              tab === "password"
                ? "border-[#1C5D9B] text-[#1C5D9B]"
                : "border-transparent text-[#4E6579] hover:text-[#152A3E]"
            }`}
          >
            <KeyRound size={14} />
            <span>Alterar Senha</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("email");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              tab === "email"
                ? "border-[#1C5D9B] text-[#1C5D9B]"
                : "border-transparent text-[#4E6579] hover:text-[#152A3E]"
            }`}
          >
            <Mail size={14} />
            <span>E-mail de Recuperação</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <p className="text-xs text-[#4E6579]">
                Defina uma nova senha para a administração do catálogo do Sports Garden.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite a senha atual"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E6579] hover:text-[#152A3E]"
                    tabIndex={-1}
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                  Nova Senha (mínimo 6 dígitos)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Crie sua nova senha segura"
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E6579] hover:text-[#152A3E]"
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-[#4E6579] hover:text-[#152A3E] rounded-lg hover:bg-[#EEF3F9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Salvar Nova Senha</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {tab === "email" && (
            <form onSubmit={handleUpdateEmail} className="space-y-3.5">
              <div className="p-3 bg-[#EEF3F9] rounded-xl text-xs text-[#152A3E] space-y-1">
                <p className="font-semibold text-[#1C5D9B] flex items-center gap-1.5">
                  <Mail size={14} />
                  <span>E-mail Atual Cadastrado:</span>
                </p>
                <p className="font-mono text-sm font-bold text-[#152A3E]">
                  {configuredEmailMasked || "osilva@tre-pa.jus.br"}
                </p>
                <p className="text-[11px] text-[#4E6579]">
                  Este e-mail é utilizado para enviar o código de segurança de 6 dígitos caso você esqueça a senha.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                  Novo E-mail de Recuperação
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="exemplo@seuemail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                  Senha Atual de Administrador
                </label>
                <div className="relative">
                  <input
                    type={showEmailCurrentPass ? "text" : "password"}
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha para confirmar"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailCurrentPass(!showEmailCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4E6579] hover:text-[#152A3E]"
                    tabIndex={-1}
                  >
                    {showEmailCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-[#4E6579] hover:text-[#152A3E] rounded-lg hover:bg-[#EEF3F9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Atualizando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Atualizar E-mail</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
