import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error Boundary caught:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F4F8] text-[#152A3E] flex items-center justify-center p-6 font-['Public_Sans',sans-serif]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-[#CFDCE9] text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
              <AlertTriangle size={28} />
            </div>
            <h1 className="text-xl font-bold text-[#152A3E] mb-2 font-['Fraunces',serif]">
              Catálogo Sports Garden
            </h1>
            <p className="text-xs text-[#4E6579] mb-4 leading-relaxed">
              O catálogo foi redefinido para o padrão oficial da planilha. Clique no botão abaixo para entrar diretamente:
            </p>
            {this.state.error?.message && (
              <div className="mb-4 p-2.5 bg-red-50 text-red-700 text-[11px] rounded-lg text-left font-mono border border-red-100 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-[#1C5D9B] hover:bg-[#123F6B] text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-98"
            >
              <RefreshCw size={16} />
              <span>Entrar no Catálogo</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
