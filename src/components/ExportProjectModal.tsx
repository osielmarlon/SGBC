import React, { useState } from "react";
import {
  Download,
  FolderArchive,
  Database,
  CheckCircle2,
  Copy,
  Globe,
  X,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppData } from "../types";
import { exportDatabaseAsJSON } from "../utils/storage";

interface ExportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
}

export const ExportProjectModal: React.FC<ExportProjectModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      setStatusMessage(null);

      const response = await fetch("/api/export-project-zip");
      if (!response.ok) {
        throw new Error(`Erro do servidor (${response.status}). Não foi possível compactar o projeto.`);
      }

      const blob = await response.blob();
      if (!blob || blob.size < 500) {
        const text = await blob.text();
        try {
          const json = JSON.parse(text);
          if (json.error) throw new Error(json.error);
        } catch {}
        throw new Error("Arquivo ZIP gerado com tamanho inválido.");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sportsgarden-projeto-completo-${new Date().toISOString().split("T")[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

      setStatusMessage({
        type: "success",
        text: `ZIP gerado e baixado com sucesso (${(blob.size / 1024 / 1024).toFixed(1)} MB)!`,
      });
    } catch (err: any) {
      console.error("Erro no download ZIP:", err);
      setStatusMessage({
        type: "error",
        text: err?.message || "Ocorreu um erro ao gerar o arquivo ZIP. Tente novamente.",
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadJson = () => {
    exportDatabaseAsJSON(data);
    setStatusMessage({
      type: "success",
      text: "Backup do banco de dados JSON baixado com sucesso!",
    });
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#152A3E] text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden shrink-0">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#AECB3E]/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#AECB3E] text-[#152A3E] flex items-center justify-center font-bold shadow-md shrink-0">
                <FolderArchive size={26} />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#AECB3E] uppercase block">
                  Exportação & Portabilidade Total
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  Baixar Sistema e Banco de Dados
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer relative z-10"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-sm">
            
            {/* Status Alert Notification */}
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle size={18} className="text-red-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </motion.div>
            )}

            {/* Direct Download Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: Full Project ZIP */}
              <div className="bg-gradient-to-br from-[#152A3E] to-[#1E3A56] text-white rounded-2xl p-5 border border-[#152A3E] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 bg-[#AECB3E] text-[#152A3E] rounded-xl font-bold">
                      <FolderArchive size={22} />
                    </span>
                    <span className="text-[11px] bg-white/20 text-[#AECB3E] font-bold px-2 py-0.5 rounded-md">
                      Recomendado
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">Código-Fonte Completo (.ZIP)</h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    Inclui todo o frontend React, backend Express, banco de dados JSON atualizado, fotos e scripts prontos para rodar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={downloadingZip}
                  className="mt-5 w-full bg-[#AECB3E] hover:bg-[#9cb635] text-[#152A3E] font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-75"
                >
                  {downloadingZip ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Compactando arquivos...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Baixar Projeto (.ZIP)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: Database JSON Backup */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 bg-[#1C5D9B] text-white rounded-xl font-bold">
                      <Database size={22} />
                    </span>
                    <span className="text-[11px] bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                      {data?.professionals?.length || 0} Registros
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#152A3E]">Banco de Dados (.JSON)</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Apenas os dados de prestadores, categorias cadastradas, avaliações e configurações atuais em formato JSON limpo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="mt-5 w-full bg-[#1C5D9B] hover:bg-[#123F6B] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Baixar Banco (.JSON)</span>
                </button>
              </div>

            </div>

            {/* How to deploy without access restrictions */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[#152A3E] text-sm">
                    Como publicar com link público (sem restrições de acesso institucional)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Para que qualquer morador ou visitante acesse livremente pelo celular ou WhatsApp sem restrição de conta Google institucional:
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 pt-3 border-t border-amber-200/80 text-xs">
                
                {/* Step 1: Render / Railway */}
                <div className="bg-white rounded-xl p-3 border border-amber-200/60 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#152A3E] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-[#152A3E]">Opção Grátis: Render.com ou Railway.app</p>
                    <p className="text-slate-500 mt-0.5">
                      Crie uma conta gratuita em <span className="font-semibold text-[#1C5D9B]">render.com</span> ou <span className="font-semibold text-[#1C5D9B]">railway.app</span>, envie os arquivos do ZIP para seu GitHub e crie um <em>Web Service</em>. O link gerado será 100% público e gratuito (ex: <code>sportsgarden.onrender.com</code>).
                    </p>
                  </div>
                </div>

                {/* Step 2: Personal Google AI Studio */}
                <div className="bg-white rounded-xl p-3 border border-amber-200/60 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#152A3E] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-[#152A3E]">Opção Conta Pessoal Google: AI Studio</p>
                    <p className="text-slate-500 mt-0.5">
                      Acesse <span className="font-semibold text-[#1C5D9B]">ai.studio/build</span> usando seu Gmail pessoal (@gmail.com), crie um novo aplicativo e suba os arquivos do ZIP baixado.
                    </p>
                  </div>
                </div>

                {/* Step 3: Run Locally */}
                <div className="bg-white rounded-xl p-3 border border-amber-200/60 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#152A3E] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-[#152A3E]">Opção Computador Local</p>
                    <p className="text-slate-500 mt-0.5">
                      Descompacte o arquivo ZIP no seu computador e execute no terminal:
                    </p>
                    <div className="mt-2 flex items-center justify-between bg-slate-900 text-slate-200 font-mono text-[11px] px-3 py-2 rounded-lg">
                      <span>npm install && npm run dev</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode("npm install && npm run dev", "cmd_run")}
                        className="text-[#AECB3E] hover:text-white flex items-center gap-1 cursor-pointer font-sans text-xs ml-2"
                      >
                        {copiedIndex === "cmd_run" ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                        <span>{copiedIndex === "cmd_run" ? "Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
