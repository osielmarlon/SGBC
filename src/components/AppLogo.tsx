import React from "react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: "white" | "dark";
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = "md",
  showText = true,
  textColor = "white",
  className = "",
}) => {
  // Dimensions for icon
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Visual Logomark Icon */}
      <div
        className={`${iconDimensions} relative shrink-0 rounded-xl bg-gradient-to-br from-[#0D2B4A] via-[#123F6B] to-[#1C5D9B] p-1.5 shadow-md flex items-center justify-center border border-[#AECB3E]/30 ring-1 ring-white/10`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Subtle background glow */}
          <circle cx="50" cy="50" r="40" fill="#AECB3E" fillOpacity="0.12" />
          
          {/* Modern Botanical Leaf / Garden Crest interconnected */}
          {/* Main Leaf Stem */}
          <path
            d="M50 82C50 82 48 55 28 42C38 38 52 42 55 52C58 40 70 32 82 34C78 50 64 68 50 82Z"
            fill="url(#garden-gradient-primary)"
          />
          
          {/* Upper Leaf / Growth Curve */}
          <path
            d="M50 18C50 18 53 38 72 46C64 50 52 46 48 38C45 48 34 54 22 52C26 38 38 26 50 18Z"
            fill="url(#garden-gradient-secondary)"
          />

          {/* Connected Network Nodes (Conecta / Interconnected residents & services) */}
          <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="3.5" fill="#152A3E" />

          <circle cx="28" cy="42" r="4.5" fill="#AECB3E" />
          <circle cx="72" cy="46" r="4.5" fill="#38BDF8" />
          <circle cx="50" cy="18" r="4" fill="#AECB3E" />
          
          {/* Delicate connecting orbit lines */}
          <path
            d="M28 42L50 50L72 46"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="1 2"
          />

          {/* Gradients */}
          <defs>
            <linearGradient
              id="garden-gradient-primary"
              x1="28"
              y1="34"
              x2="82"
              y2="82"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#AECB3E" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <linearGradient
              id="garden-gradient-secondary"
              x1="22"
              y1="18"
              x2="72"
              y2="54"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#AECB3E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left leading-tight min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-nowrap">
            <span
              className={`font-['Fraunces',serif] font-extrabold tracking-tight whitespace-nowrap ${
                size === "sm"
                  ? "text-[13px]"
                  : size === "lg"
                  ? "text-xl sm:text-2xl"
                  : size === "xl"
                  ? "text-2xl sm:text-3xl"
                  : "text-[14px] sm:text-lg"
              } ${textColor === "white" ? "text-white" : "text-[#152A3E]"}`}
            >
              Guia Fácil
            </span>
            <span className="text-[#AECB3E] font-medium text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
              • Sports Garden
            </span>
          </div>
          <span
            className={`font-sans tracking-wide leading-tight mt-0.5 whitespace-nowrap hidden sm:block ${
              size === "sm" ? "text-[9px]" : "text-[9.5px] sm:text-[11px]"
            } ${textColor === "white" ? "text-slate-300/90" : "text-[#4E6579]"}`}
          >
            Seu Guia de Anúncios no Condomínio
          </span>
        </div>
      )}
    </div>
  );
};
