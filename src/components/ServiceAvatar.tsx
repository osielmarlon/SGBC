import React from "react";

interface ServiceAvatarProps {
  category: string;
  size?: number;
  className?: string;
}

export const ServiceAvatar: React.FC<ServiceAvatarProps> = ({
  category,
  size = 56,
  className = "",
}) => {
  // Normalize category name
  const cat = category.toLowerCase().trim();

  // Render colorful vector illustration with character and tools based on service
  const renderIllustration = () => {
    // 1. Açaí
    if (cat.includes("açaí") || cat.includes("acai")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Bowl */}
          <path d="M12 34 C12 50, 52 50, 52 34 Z" fill="#4A154B" stroke="#2D112E" strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="32" cy="34" rx="20" ry="7" fill="#6A1B9A" stroke="#2D112E" strokeWidth="2.5" />
          {/* Açaí cream layers */}
          <path d="M18 33 Q32 20 46 33 Q32 26 18 33" fill="#8E24AA" />
          <path d="M23 27 Q32 17 41 27" fill="#4A148C" />
          {/* Banana slices */}
          <ellipse cx="26" cy="28" rx="4.5" ry="3" fill="#FFF59D" stroke="#2D112E" strokeWidth="1.5" transform="rotate(-15 26 28)" />
          <circle cx="26" cy="28" r="0.8" fill="#BDBDBD" />
          <ellipse cx="38" cy="29" rx="4.5" ry="3" fill="#FFF59D" stroke="#2D112E" strokeWidth="1.5" transform="rotate(20 38 29)" />
          <circle cx="38" cy="29" r="0.8" fill="#BDBDBD" />
          {/* Strawberry */}
          <polygon points="32,20 28,26 36,26" fill="#E53935" stroke="#2D112E" strokeWidth="1.5" />
          <polygon points="32,19 30,17 34,17" fill="#43A047" />
          {/* Text/Sticker */}
          <rect x="23" y="38" width="18" height="8" rx="4" fill="#FFFFFF" stroke="#2D112E" strokeWidth="1.5" />
          <text x="32" y="44" fontSize="5.5" fontWeight="900" textAnchor="middle" fill="#4A148C" fontFamily="sans-serif">açaí</text>
        </svg>
      );
    }

    // 2. Costureira / Atelier
    if (cat.includes("costur") || cat.includes("atelier") || cat.includes("moda")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Hair back */}
          <path d="M22 28 C20 16, 44 16, 42 28 C42 36, 46 44, 46 44 C46 44, 38 40, 32 40 C26 40, 18 44, 18 44 C18 44, 22 36, 22 28 Z" fill="#2D3748" stroke="#1A202C" strokeWidth="2" />
          {/* Body/Dress */}
          <path d="M24 38 L40 38 L44 54 L20 54 Z" fill="#E53E3E" stroke="#1A202C" strokeWidth="2" />
          {/* Head & Neck */}
          <rect x="29" y="32" width="6" height="8" fill="#FDDCB5" stroke="#1A202C" strokeWidth="1.5" />
          <ellipse cx="32" cy="24" rx="9" ry="9.5" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
          {/* Hair front */}
          <path d="M23 23 C25 17, 39 17, 41 23 C39 20, 34 22, 32 20 C30 22, 25 20, 23 23" fill="#2D3748" stroke="#1A202C" strokeWidth="1.5" />
          {/* Face */}
          <circle cx="28.5" cy="24" r="1.2" fill="#1A202C" />
          <circle cx="35.5" cy="24" r="1.2" fill="#1A202C" />
          <path d="M30.5 27 Q32 29 33.5 27" fill="none" stroke="#E53E3E" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="26.5" cy="26" r="1.2" fill="#FEB2B2" />
          <circle cx="37.5" cy="26" r="1.2" fill="#FEB2B2" />
          {/* Sewing Machine in front */}
          <rect x="12" y="48" width="40" height="5" rx="2" fill="#4FD1C5" stroke="#1A202C" strokeWidth="2" />
          <path d="M16 48 L16 38 L30 38 L30 42 L26 42 L26 48" fill="#4FD1C5" stroke="#1A202C" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="16" cy="40" r="2" fill="#CBD5E0" stroke="#1A202C" strokeWidth="1.5" />
          {/* Needle & Thread */}
          <line x1="28" y1="42" x2="28" y2="47" stroke="#1A202C" strokeWidth="2" />
          {/* Fabric */}
          <path d="M22 47 Q32 44 42 47" stroke="#ED64A6" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    }

    // 3. Eletricista
    if (cat.includes("eletric")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Body/Uniform */}
          <path d="M20 40 L44 40 L47 56 L17 56 Z" fill="#DD6B20" stroke="#1A202C" strokeWidth="2" />
          {/* Collar/Shirt inner */}
          <polygon points="32,46 27,40 37,40" fill="#ED8936" stroke="#1A202C" strokeWidth="1.5" />
          {/* Head & Neck */}
          <rect x="29" y="33" width="6" height="8" fill="#FDDCB5" stroke="#1A202C" strokeWidth="1.5" />
          <ellipse cx="32" cy="26" rx="8.5" ry="9" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
          {/* Face */}
          <circle cx="28.5" cy="26.5" r="1.2" fill="#1A202C" />
          <circle cx="35.5" cy="26.5" r="1.2" fill="#1A202C" />
          <path d="M30 30 Q32 32 34 30" fill="none" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Hardhat / Helmet with Light */}
          <path d="M21 23 C21 14, 43 14, 43 23 Z" fill="#F6E05E" stroke="#1A202C" strokeWidth="2" />
          <rect x="19" y="21" width="26" height="4" rx="2" fill="#ECC94B" stroke="#1A202C" strokeWidth="2" />
          {/* Headlamp */}
          <rect x="29" y="18" width="6" height="5" rx="1.5" fill="#E2E8F0" stroke="#1A202C" strokeWidth="1.5" />
          <polygon points="27,15 32,11 37,15" fill="#FAF089" opacity="0.8" />
          {/* Lightbulb in hand / side */}
          <g transform="translate(8, 22)">
            <circle cx="6" cy="6" r="5" fill="#FAF089" stroke="#1A202C" strokeWidth="1.5" />
            <path d="M4 11 L8 11 L7 13 L5 13 Z" fill="#A0AEC0" stroke="#1A202C" strokeWidth="1.2" />
            {/* Glow rays */}
            <line x1="6" y1="-1" x2="6" y2="0.5" stroke="#D69E2E" strokeWidth="1.5" />
            <line x1="0" y1="2" x2="1.5" y2="3" stroke="#D69E2E" strokeWidth="1.5" />
          </g>
          {/* Screwdriver on right */}
          <g transform="translate(48, 24) rotate(15)">
            <line x1="2" y1="0" x2="2" y2="10" stroke="#718096" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="0" y="10" width="4" height="8" rx="1" fill="#3182CE" stroke="#1A202C" strokeWidth="1.5" />
          </g>
        </svg>
      );
    }

    // 4. Marceneiro
    if (cat.includes("marcen") || cat.includes("móve") || cat.includes("moveis")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Circular saw machine / Carpentry tool & wood table */}
          {/* Wood Beam / Bench */}
          <rect x="12" y="42" width="40" height="12" rx="2.5" fill="#9C4221" stroke="#1A202C" strokeWidth="2.5" />
          <line x1="20" y1="42" x2="20" y2="54" stroke="#7B341E" strokeWidth="2" />
          <line x1="32" y1="42" x2="32" y2="54" stroke="#7B341E" strokeWidth="2" />
          <line x1="44" y1="42" x2="44" y2="54" stroke="#7B341E" strokeWidth="2" />
          {/* Saw Machine base & handle */}
          <path d="M22 36 L42 36 L38 24 L26 24 Z" fill="#3182CE" stroke="#1A202C" strokeWidth="2" strokeLinejoin="round" />
          <rect x="24" y="20" width="16" height="5" rx="2" fill="#2B6CB0" stroke="#1A202C" strokeWidth="1.8" />
          <path d="M20 28 Q14 26 16 34" fill="none" stroke="#1A202C" strokeWidth="2.5" strokeLinecap="round" />
          {/* Circular blade */}
          <path d="M24 42 C24 33, 40 33, 40 42 Z" fill="#CBD5E0" stroke="#1A202C" strokeWidth="2" />
          <circle cx="32" cy="40" r="2.5" fill="#718096" stroke="#1A202C" strokeWidth="1.5" />
          {/* Saw teeth effect */}
          <line x1="26" y1="36" x2="27" y2="38" stroke="#1A202C" strokeWidth="1.5" />
          <line x1="32" y1="33" x2="32" y2="35" stroke="#1A202C" strokeWidth="1.5" />
          <line x1="38" y1="36" x2="37" y2="38" stroke="#1A202C" strokeWidth="1.5" />
          {/* Wood shavings */}
          <circle cx="45" cy="38" r="1.5" fill="#F6AD55" />
          <circle cx="48" cy="41" r="1.2" fill="#F6AD55" />
        </svg>
      );
    }

    // 5. Pedreiro & Reformas
    if (cat.includes("pedreir") || cat.includes("reforma") || cat.includes("constru")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Brick wall background */}
          <rect x="14" y="38" width="16" height="6" fill="#C53030" stroke="#1A202C" strokeWidth="1.8" />
          <rect x="30" y="38" width="18" height="6" fill="#E53E3E" stroke="#1A202C" strokeWidth="1.8" />
          <rect x="10" y="44" width="22" height="7" fill="#E53E3E" stroke="#1A202C" strokeWidth="1.8" />
          <rect x="32" y="44" width="22" height="7" fill="#C53030" stroke="#1A202C" strokeWidth="1.8" />
          {/* Mason / Builder Character */}
          {/* Body/Vest */}
          <path d="M23 35 L41 35 L44 54 L20 54 Z" fill="#3182CE" stroke="#1A202C" strokeWidth="2" />
          <path d="M26 35 L38 35 L40 54 L24 54 Z" fill="#ECC94B" stroke="#1A202C" strokeWidth="1.5" />
          {/* Head & Neck */}
          <rect x="29" y="27" width="6" height="8" fill="#FDDCB5" stroke="#1A202C" strokeWidth="1.5" />
          <ellipse cx="32" cy="21" rx="8" ry="8.5" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
          {/* Face */}
          <circle cx="29" cy="22" r="1.2" fill="#1A202C" />
          <circle cx="35" cy="22" r="1.2" fill="#1A202C" />
          <path d="M30 25 Q32 27 34 25" fill="none" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Hardhat / Helmet */}
          <path d="M22 17 C22 9, 42 9, 42 17 Z" fill="#DD6B20" stroke="#1A202C" strokeWidth="2" />
          <rect x="20" y="16" width="24" height="3.5" rx="1.5" fill="#C05621" stroke="#1A202C" strokeWidth="2" />
          {/* Trowel (colher de pedreiro) */}
          <g transform="translate(42, 30) rotate(20)">
            <polygon points="5,0 12,8 0,8" fill="#CBD5E0" stroke="#1A202C" strokeWidth="1.5" />
            <rect x="5" y="8" width="2.5" height="6" fill="#744210" stroke="#1A202C" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }

    // 6. Pintor
    if (cat.includes("pinto") || cat.includes("pintura")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Painter character */}
          {/* Body/Overalls */}
          <path d="M22 36 L42 36 L45 56 L19 56 Z" fill="#3182CE" stroke="#1A202C" strokeWidth="2" />
          <rect x="27" y="38" width="10" height="14" rx="2" fill="#FFFFFF" stroke="#1A202C" strokeWidth="1.5" />
          {/* Head & Neck */}
          <rect x="29" y="28" width="6" height="8" fill="#FDDCB5" stroke="#1A202C" strokeWidth="1.5" />
          <ellipse cx="32" cy="22" rx="8" ry="8.5" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
          {/* Painter Cap */}
          <path d="M22 19 C22 13, 42 13, 42 19 Z" fill="#3182CE" stroke="#1A202C" strokeWidth="2" />
          <rect x="20" y="18" width="24" height="3" rx="1.5" fill="#2B6CB0" stroke="#1A202C" strokeWidth="1.8" />
          {/* Face */}
          <circle cx="29" cy="22.5" r="1.2" fill="#1A202C" />
          <circle cx="35" cy="22.5" r="1.2" fill="#1A202C" />
          <path d="M30 25.5 Q32 27.5 34 25.5" fill="none" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Paint Roller Tool */}
          <g transform="translate(42, 18)">
            {/* Roller cylinder */}
            <rect x="0" y="4" width="14" height="6" rx="2" fill="#ED8936" stroke="#1A202C" strokeWidth="2" />
            <path d="M7 10 L7 16 L2 16 L2 22" fill="none" stroke="#718096" strokeWidth="2" strokeLinejoin="round" />
            <rect x="0.5" y="22" width="3" height="7" rx="1" fill="#744210" stroke="#1A202C" strokeWidth="1.5" />
          </g>
          {/* Paint Splatters on overalls */}
          <circle cx="30" cy="42" r="1.5" fill="#ED8936" />
          <circle cx="33" cy="46" r="1.2" fill="#4FD1C5" />
          <circle cx="35" cy="41" r="1" fill="#9F7AEA" />
        </svg>
      );
    }

    // 7. Redes de Proteção
    if (cat.includes("rede") || cat.includes("proteç") || cat.includes("protecao")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Net / Mesh Grid Pattern background */}
          <g stroke="#CBD5E0" strokeWidth="1.5" strokeDasharray="3 2">
            <line x1="12" y1="12" x2="52" y2="52" />
            <line x1="22" y1="8" x2="56" y2="42" />
            <line x1="8" y1="22" x2="42" y2="56" />
            <line x1="52" y1="12" x2="12" y2="52" />
            <line x1="42" y1="8" x2="8" y2="42" />
            <line x1="56" y1="22" x2="22" y2="56" />
          </g>
          {/* Happy Protected Child / Kid */}
          {/* Body/Shirt */}
          <path d="M22 42 L42 42 L45 56 L19 56 Z" fill="#38B2AC" stroke="#1A202C" strokeWidth="2" />
          {/* Head & Neck */}
          <rect x="29" y="32" width="6" height="8" fill="#FDDCB5" stroke="#1A202C" strokeWidth="1.5" />
          <ellipse cx="32" cy="24" rx="9" ry="9.5" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
          {/* Hair */}
          <path d="M22 23 C22 14, 42 14, 42 23 C40 19, 36 21, 32 18 C28 21, 24 19, 22 23 Z" fill="#9C4221" stroke="#1A202C" strokeWidth="2" />
          {/* Smiling Face */}
          <circle cx="28" cy="24" r="1.2" fill="#1A202C" />
          <circle cx="36" cy="24" r="1.2" fill="#1A202C" />
          <path d="M29 27 Q32 31 35 27" fill="#E53E3E" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="25" cy="26" r="1.5" fill="#FEB2B2" />
          <circle cx="39" cy="26" r="1.5" fill="#FEB2B2" />
          {/* Happy hands up */}
          <path d="M20 44 Q14 36 17 32" fill="none" stroke="#FDDCB5" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M44 44 Q50 36 47 32" fill="none" stroke="#FDDCB5" strokeWidth="3.5" strokeLinecap="round" />
          {/* Protection Shield Badge on bottom right */}
          <g transform="translate(38, 38)">
            <path d="M8 0 L16 3 C16 10, 8 16, 8 16 C8 16, 0 10, 0 3 Z" fill="#48BB78" stroke="#1A202C" strokeWidth="1.5" />
            <path d="M4 8 L7 11 L12 5" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      );
    }

    // 8. Técnico de Geladeira e Lavadora / Split / Ar-Condicionado
    if (cat.includes("geladeira") || cat.includes("lavadora") || cat.includes("técnico") || cat.includes("tecnico") || cat.includes("split") || cat.includes("ar")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Refrigerator body */}
          <rect x="28" y="14" width="22" height="38" rx="3" fill="#EDF2F7" stroke="#1A202C" strokeWidth="2.5" />
          <line x1="28" y1="28" x2="50" y2="28" stroke="#1A202C" strokeWidth="2" />
          {/* Handles */}
          <line x1="31" y1="20" x2="31" y2="25" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="31" y1="32" x2="31" y2="40" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round" />
          {/* Washing Machine in front left */}
          <rect x="14" y="26" width="22" height="26" rx="3" fill="#4299E1" stroke="#1A202C" strokeWidth="2.5" />
          {/* Washer glass porthole door */}
          <circle cx="25" cy="40" r="7" fill="#EBF8FF" stroke="#1A202C" strokeWidth="2" />
          <circle cx="25" cy="40" r="4.5" fill="#90CDF4" />
          {/* Washer buttons panel */}
          <circle cx="18" cy="30" r="1.5" fill="#FFFFFF" stroke="#1A202C" strokeWidth="1" />
          <line x1="23" y1="30" x2="31" y2="30" stroke="#2B6CB0" strokeWidth="2" strokeLinecap="round" />
          {/* Crossed Wrench / Maintenance Repair Tools badge */}
          <g transform="translate(18, 14)">
            <circle cx="8" cy="8" r="8" fill="#ECC94B" stroke="#1A202C" strokeWidth="2" />
            <line x1="3" y1="3" x2="13" y2="13" stroke="#1A202C" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="13" y1="3" x2="3" y2="13" stroke="#1A202C" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      );
    }

    // 9. Personal Trainer
    if (cat.includes("personal") || cat.includes("trainer") || cat.includes("educa") || cat.includes("fitness")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Character / Trainer */}
          {/* Body/Tank top */}
          <path d="M22 36 L42 36 L44 54 L20 54 Z" fill="#38A169" stroke="#1A202C" strokeWidth="2" />
          {/* Muscular arms */}
          <path d="M22 36 Q14 42 16 48" fill="none" stroke="#FDDCB5" strokeWidth="5" strokeLinecap="round" />
          <path d="M42 36 Q50 42 48 48" fill="none" stroke="#FDDCB5" strokeWidth="5" strokeLinecap="round" />
          {/* Head & Neck */}
          <rect x="29" y="27" width="6" height="8" fill="#FDDCB5" stroke="#1A202C" strokeWidth="1.5" />
          <ellipse cx="32" cy="20" rx="8" ry="8.5" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
          {/* Headband / Hair */}
          <path d="M23 16 C23 10, 41 10, 41 16 Z" fill="#2D3748" stroke="#1A202C" strokeWidth="2" />
          <rect x="22" y="16" width="20" height="3" fill="#E53E3E" stroke="#1A202C" strokeWidth="1.5" />
          {/* Face with confident smile */}
          <circle cx="29" cy="20.5" r="1.2" fill="#1A202C" />
          <circle cx="35" cy="20.5" r="1.2" fill="#1A202C" />
          <path d="M30 23.5 Q32 25.5 34 23.5" fill="none" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Dumbbell held up */}
          <g transform="translate(16, 44)">
            <rect x="0" y="2" width="32" height="3" rx="1" fill="#718096" stroke="#1A202C" strokeWidth="1.5" />
            <rect x="2" y="0" width="4" height="7" rx="1.5" fill="#2D3748" stroke="#1A202C" strokeWidth="1.5" />
            <rect x="26" y="0" width="4" height="7" rx="1.5" fill="#2D3748" stroke="#1A202C" strokeWidth="1.5" />
          </g>
        </svg>
      );
    }

    // 10. Arquiteto
    if (cat.includes("arquit") || cat.includes("design") || cat.includes("projeto")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Architect blueprint paper roll & compass */}
          {/* Blueprint */}
          <rect x="14" y="22" width="36" height="28" rx="2" fill="#3182CE" stroke="#1A202C" strokeWidth="2.5" />
          {/* Blueprint drawing lines */}
          <rect x="18" y="26" width="16" height="12" fill="none" stroke="#BEE3F8" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="18" y1="42" x2="34" y2="42" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="38" y1="26" x2="46" y2="26" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="38" y1="32" x2="46" y2="32" stroke="#BEE3F8" strokeWidth="1.5" />
          {/* Architect Drafting Compass in front */}
          <g transform="translate(30, 8)">
            <circle cx="10" cy="5" r="3" fill="#ECC94B" stroke="#1A202C" strokeWidth="1.8" />
            <line x1="10" y1="7" x2="2" y2="36" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
            <line x1="2" y1="36" x2="1" y2="39" stroke="#1A202C" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="7" x2="18" y2="36" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="36" x2="19" y2="39" stroke="#718096" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="20" x2="14" y2="20" stroke="#CBD5E0" strokeWidth="2" />
          </g>
        </svg>
      );
    }

    // 11. Diarista / Faxina
    if (cat.includes("diarista") || cat.includes("limpeza") || cat.includes("faxin")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Diarista with apron & spray bucket */}
          <path d="M22 36 L42 36 L45 56 L19 56 Z" fill="#9F7AEA" stroke="#1A202C" strokeWidth="2" />
          <rect x="26" y="38" width="12" height="14" rx="2" fill="#FFFFFF" stroke="#1A202C" strokeWidth="1.5" />
          {/* Head & Hair */}
          <ellipse cx="32" cy="24" rx="8.5" ry="9" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
          <path d="M22 24 C20 15, 44 15, 42 24 C42 32, 45 40, 45 40 C35 38, 29 38, 19 40 C19 40, 22 32, 22 24 Z" fill="#9C4221" stroke="#1A202C" strokeWidth="2" />
          {/* Face */}
          <circle cx="28.5" cy="24" r="1.2" fill="#1A202C" />
          <circle cx="35.5" cy="24" r="1.2" fill="#1A202C" />
          <path d="M30 27 Q32 29 34 27" fill="none" stroke="#E53E3E" strokeWidth="1.5" strokeLinecap="round" />
          {/* Cleaning Spray on side */}
          <g transform="translate(42, 32)">
            <rect x="2" y="6" width="6" height="12" rx="2" fill="#4FD1C5" stroke="#1A202C" strokeWidth="1.5" />
            <path d="M5 2 L5 6 L2 4 Z" fill="#ED8936" stroke="#1A202C" strokeWidth="1.2" />
          </g>
          {/* Sparkles */}
          <polygon points="16,22 17,25 20,26 17,27 16,30 15,27 12,26 15,25" fill="#FAF089" stroke="#D69E2E" strokeWidth="1" />
        </svg>
      );
    }

    // 12. Encanador
    if (cat.includes("encanad") || cat.includes("hidr")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Plumber with pipe wrench & pipes */}
          <path d="M22 36 L42 36 L44 56 L20 56 Z" fill="#DD6B20" stroke="#1A202C" strokeWidth="2" />
          {/* Head & Cap */}
          <ellipse cx="32" cy="24" rx="8" ry="8.5" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
          <path d="M22 20 C22 14, 42 14, 42 20 Z" fill="#3182CE" stroke="#1A202C" strokeWidth="2" />
          <rect x="20" y="19" width="24" height="3" rx="1.5" fill="#2B6CB0" stroke="#1A202C" strokeWidth="1.8" />
          {/* Face */}
          <circle cx="29" cy="24" r="1.2" fill="#1A202C" />
          <circle cx="35" cy="24" r="1.2" fill="#1A202C" />
          <path d="M30 27 Q32 29 34 27" fill="none" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Pipe Wrench in hand */}
          <g transform="translate(42, 28) rotate(20)">
            <rect x="0" y="0" width="5" height="18" rx="2" fill="#E53E3E" stroke="#1A202C" strokeWidth="1.5" />
            <rect x="-2" y="0" width="9" height="5" rx="1" fill="#718096" stroke="#1A202C" strokeWidth="1.5" />
          </g>
          {/* Water drop */}
          <path d="M16 32 C16 36, 12 36, 12 32 C12 28, 14 26, 14 26 C14 26, 16 28, 16 32 Z" fill="#63B3ED" stroke="#1A202C" strokeWidth="1.2" />
        </svg>
      );
    }

    // 13. Pet Sitter / Animais
    if (cat.includes("pet") || cat.includes("dog") || cat.includes("veterin") || cat.includes("anim")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Green heart badge background */}
          <path d="M32 48 C16 36, 14 22, 23 16 C28 12, 32 18, 32 18 C32 18, 36 12, 41 16 C50 22, 48 36, 32 48 Z" fill="#68D391" stroke="#1A202C" strokeWidth="2" />
          {/* Dog & Cat together */}
          {/* Dog head */}
          <ellipse cx="27" cy="30" rx="7" ry="8" fill="#ECC94B" stroke="#1A202C" strokeWidth="1.8" />
          <ellipse cx="21" cy="28" rx="2" ry="5" fill="#D69E2E" stroke="#1A202C" strokeWidth="1.5" transform="rotate(-15 21 28)" />
          <ellipse cx="33" cy="28" rx="2" ry="5" fill="#D69E2E" stroke="#1A202C" strokeWidth="1.5" transform="rotate(15 33 28)" />
          <circle cx="25" cy="29" r="1" fill="#1A202C" />
          <circle cx="29" cy="29" r="1" fill="#1A202C" />
          <ellipse cx="27" cy="33" rx="1.8" ry="1.2" fill="#1A202C" />
          {/* Cat beside */}
          <ellipse cx="38" cy="34" rx="5" ry="6" fill="#CBD5E0" stroke="#1A202C" strokeWidth="1.8" />
          <polygon points="34,28 36,31 33,31" fill="#A0AEC0" stroke="#1A202C" strokeWidth="1.2" />
          <polygon points="42,28 43,31 40,31" fill="#A0AEC0" stroke="#1A202C" strokeWidth="1.2" />
          <circle cx="36.5" cy="33.5" r="0.8" fill="#1A202C" />
          <circle cx="39.5" cy="33.5" r="0.8" fill="#1A202C" />
        </svg>
      );
    }

    // 14. Refeições / Marmitas
    if (cat.includes("refei") || cat.includes("marmit") || cat.includes("comida") || cat.includes("cozinha")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Plate / Dish */}
          <circle cx="32" cy="34" rx="20" ry="16" fill="#EDF2F7" stroke="#1A202C" strokeWidth="2.5" />
          <circle cx="32" cy="34" rx="15" ry="11" fill="#E2E8F0" stroke="#CBD5E0" strokeWidth="1.5" />
          {/* Roasted chicken leg */}
          <ellipse cx="28" cy="32" rx="7" ry="4.5" fill="#DD6B20" stroke="#1A202C" strokeWidth="1.8" transform="rotate(-20 28 32)" />
          <circle cx="21" cy="36" r="2" fill="#FDDCB5" stroke="#1A202C" strokeWidth="1.2" />
          {/* Rice / Salad sides */}
          <ellipse cx="38" cy="32" rx="4" ry="3" fill="#FFFFFF" stroke="#1A202C" strokeWidth="1.5" />
          <ellipse cx="34" cy="38" rx="3.5" ry="2.5" fill="#48BB78" stroke="#1A202C" strokeWidth="1.5" />
          <circle cx="38" cy="38" r="2" fill="#E53E3E" stroke="#1A202C" strokeWidth="1.2" />
        </svg>
      );
    }

    // 15. Água Mineral
    if (cat.includes("água") || cat.includes("agua") || cat.includes("mineral") || cat.includes("garrafão") || cat.includes("garrafao")) {
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Water Galon Container 20L */}
          <rect x="16" y="22" width="22" height="28" rx="4" fill="#63B3ED" stroke="#1A202C" strokeWidth="2.5" />
          <rect x="22" y="16" width="10" height="6" rx="1.5" fill="#3182CE" stroke="#1A202C" strokeWidth="2" />
          <line x1="16" y1="30" x2="38" y2="30" stroke="#2B6CB0" strokeWidth="1.5" />
          <line x1="16" y1="40" x2="38" y2="40" stroke="#2B6CB0" strokeWidth="1.5" />
          {/* Glass of water beside */}
          <path d="M42 32 L48 32 L46 50 L44 50 Z" fill="#EBF8FF" stroke="#1A202C" strokeWidth="2" />
          <line x1="43" y1="38" x2="47" y2="38" stroke="#63B3ED" strokeWidth="2" />
        </svg>
      );
    }

    // Default / All Services / Generic Professional Icon
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {/* Friendly Professional Character with Star & Tools */}
        <path d="M22 36 L42 36 L45 54 L19 54 Z" fill="#3182CE" stroke="#1A202C" strokeWidth="2" />
        <rect x="29" y="28" width="6" height="8" fill="#FDDCB5" stroke="#1A202C" strokeWidth="1.5" />
        <ellipse cx="32" cy="22" rx="8" ry="8.5" fill="#FDDCB5" stroke="#1A202C" strokeWidth="2" />
        <path d="M22 18 C22 12, 42 12, 42 18 Z" fill="#2D3748" stroke="#1A202C" strokeWidth="2" />
        <circle cx="29" cy="22.5" r="1.2" fill="#1A202C" />
        <circle cx="35" cy="22.5" r="1.2" fill="#1A202C" />
        <path d="M30 25.5 Q32 27.5 34 25.5" fill="none" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
        {/* Golden Star Badge */}
        <g transform="translate(38, 34)">
          <polygon points="6,0 8,4 12,5 9,8 10,12 6,10 2,12 3,8 0,5 4,4" fill="#ECC94B" stroke="#1A202C" strokeWidth="1.5" />
        </g>
      </svg>
    );
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full bg-[#EEF5FA] border-2 border-[#D3E2EE] flex items-center justify-center p-1.5 shadow-xs overflow-hidden shrink-0 transition-transform ${className}`}
    >
      {renderIllustration()}
    </div>
  );
};
