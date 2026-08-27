import React, { useState } from "react";
import { Star, X, Check, MessageSquare, Sparkles, User, Home, ThumbsUp } from "lucide-react";
import { Professional, Review } from "../types";

interface RatingModalProps {
  isOpen: boolean;
  professional: Professional | null;
  onClose: () => void;
  onSubmitReview: (
    professionalId: string,
    review: { rating: number; residentName: string; unit: string; comment: string }
  ) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  professional,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [residentName, setResidentName] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isOpen || !professional) return null;

  const currentDisplayRating = hoverRating || rating;

  const ratingDescriptions: Record<number, { title: string; color: string }> = {
    1: { title: "Muito insatisfeito", color: "text-red-600" },
    2: { title: "Insatisfeito", color: "text-amber-600" },
    3: { title: "Razoável / Neutro", color: "text-yellow-600" },
    4: { title: "Bom / Satisfeito", color: "text-lime-600" },
    5: { title: "Excelente / Recomendo Muito!", color: "text-[#1C5D9B]" },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    onSubmitReview(professional.id, {
      rating,
      residentName: residentName.trim() || "Morador do Sports Garden",
      unit: unit.trim(),
      comment: comment.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setResidentName("");
      setUnit("");
      setComment("");
      setRating(5);
      onClose();
    }, 1400);
  };

  return (
    <div
      id="rating-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152A3E]/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="rating-modal-content"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-[#CFDCE9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F9] flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EEF3F9] text-[#1C5D9B]">
                Avaliação dos Moradores
              </span>
            </div>
            <h2 className="font-['Fraunces',serif] text-lg font-bold text-[#152A3E] mt-1">
              Avaliar {professional.name}
            </h2>
            <p className="text-xs text-[#4E6579]">
              Categoria: <strong className="text-[#1C5D9B]">{professional.category}</strong>
            </p>
          </div>
          <button
            id="close-rating-modal-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4E6579] hover:bg-[#EEF3F9] hover:text-[#152A3E] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <Check size={28} />
            </div>
            <h3 className="font-['Fraunces',serif] text-xl font-bold text-[#152A3E]">
              Obrigado pela sua avaliação!
            </h3>
            <p className="text-xs text-[#4E6579] max-w-xs">
              Sua nota foi computada com sucesso e ajudará outros moradores do condomínio na escolha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            {/* Google Style Interactive Rating Stars */}
            <div className="bg-[#F8FAFC] border border-[#CFDCE9] rounded-2xl p-5 text-center flex flex-col items-center">
              <span className="text-xs font-mono uppercase font-semibold text-[#4E6579] tracking-wider mb-2">
                Qual foi o seu grau de satisfação?
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2 my-2">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const isFilled = starIndex <= currentDisplayRating;
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      id={`star-btn-${starIndex}`}
                      onMouseEnter={() => setHoverRating(starIndex)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(starIndex);
                        setError("");
                      }}
                      className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none"
                      title={`${starIndex} estrela${starIndex > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={32}
                        className={`transition-colors duration-150 ${
                          isFilled
                            ? "fill-[#FBBC04] text-[#FBBC04] drop-shadow-xs"
                            : "text-[#CFDCE9] hover:text-[#FBBC04]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Description Label */}
              <div className="min-h-[22px] flex items-center justify-center">
                <span
                  className={`text-xs font-bold ${
                    ratingDescriptions[currentDisplayRating]?.color || "text-[#152A3E]"
                  }`}
                >
                  {currentDisplayRating} de 5 estrelas —{" "}
                  {ratingDescriptions[currentDisplayRating]?.title}
                </span>
              </div>
            </div>

            {/* Resident Identification (Optional / Friendly) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                  Seu Nome (Opcional)
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-[#4E6579]" />
                  <input
                    id="reviewer-name-input"
                    type="text"
                    value={residentName}
                    onChange={(e) => setResidentName(e.target.value)}
                    placeholder="Ex.: Mariana ou Morador"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                  Unidade / Apto (Opcional)
                </label>
                <div className="relative">
                  <Home size={15} className="absolute left-3 top-3 text-[#4E6579]" />
                  <input
                    id="reviewer-unit-input"
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ex.: Torre B, Apto 504"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E]"
                  />
                </div>
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#4E6579] mb-1">
                Comentário sobre o serviço (Opcional)
              </label>
              <textarea
                id="reviewer-comment-input"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte como foi o atendimento, pontualidade, qualidade e preço do serviço..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFDCE9] bg-[#F8FAFC] focus:bg-white text-sm text-[#152A3E] focus:outline-none focus:ring-2 focus:ring-[#AECB3E] resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="cancel-rating-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#4E6579] hover:text-[#152A3E] rounded-xl hover:bg-[#EEF3F9] transition-colors"
              >
                Cancelar
              </button>
              <button
                id="submit-rating-btn"
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1C5D9B] hover:bg-[#123F6B] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <ThumbsUp size={15} />
                <span>Confirmar Avaliação</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
