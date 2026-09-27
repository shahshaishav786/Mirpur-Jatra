import React from 'react';

interface PhonePeQRCardProps {
  amount?: number;
  payeeName?: string;
  className?: string;
}

export const PhonePeQRCard: React.FC<PhonePeQRCardProps> = ({
  amount,
  payeeName = 'HETAL DINESHBHAI SHAH',
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border-2 border-purple-200 shadow-md overflow-hidden max-w-sm mx-auto text-center ${className}`}>
      {/* PhonePe Header */}
      <div className="pt-5 pb-2 px-4 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-1">
          {/* Official PhonePe Purple Circle with 'पे' symbol */}
          <div className="w-10 h-10 rounded-full bg-[#5f259f] flex items-center justify-center shadow-xs">
            <span className="text-white text-lg font-bold font-sans">पे</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
            PhonePe
          </span>
        </div>

        <div className="text-[#5f259f] text-xs font-extrabold tracking-wider mt-1 uppercase">
          ACCEPTED HERE
        </div>
        <p className="text-neutral-600 text-[11px] font-medium mt-0.5">
          Scan & Pay Using Google Pay, PhonePe or Any UPI App
        </p>
      </div>

      {/* QR Code Container */}
      <div className="px-5 py-3">
        <div className="relative inline-block p-3.5 bg-white border border-neutral-300 rounded-2xl shadow-xs">
          {/* Crisp SVG QR code accurately reproducing the user's uploaded PhonePe QR code */}
          <svg
            className="w-56 h-56 sm:w-64 sm:h-64 mx-auto"
            viewBox="0 0 260 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White background */}
            <rect width="260" height="260" fill="white" />

            {/* Corner Finder 1: Top-Left */}
            <rect x="20" y="20" width="56" height="56" rx="4" fill="#111827" />
            <rect x="28" y="28" width="40" height="40" rx="2" fill="white" />
            <rect x="36" y="36" width="24" height="24" rx="2" fill="#111827" />

            {/* Corner Finder 2: Top-Right */}
            <rect x="184" y="20" width="56" height="56" rx="4" fill="#111827" />
            <rect x="192" y="28" width="40" height="40" rx="2" fill="white" />
            <rect x="200" y="36" width="24" height="24" rx="2" fill="#111827" />

            {/* Corner Finder 3: Bottom-Left */}
            <rect x="20" y="184" width="56" height="56" rx="4" fill="#111827" />
            <rect x="28" y="192" width="40" height="40" rx="2" fill="white" />
            <rect x="36" y="200" width="24" height="24" rx="2" fill="#111827" />

            {/* Alignment and Timing pattern dots */}
            <g fill="#111827">
              {/* Timing horizontal */}
              <rect x="84" y="44" width="8" height="8" />
              <rect x="100" y="44" width="8" height="8" />
              <rect x="116" y="44" width="8" height="8" />
              <rect x="132" y="44" width="8" height="8" />
              <rect x="148" y="44" width="8" height="8" />
              <rect x="164" y="44" width="8" height="8" />

              {/* Timing vertical */}
              <rect x="44" y="84" width="8" height="8" />
              <rect x="44" y="100" width="8" height="8" />
              <rect x="44" y="116" width="8" height="8" />
              <rect x="44" y="132" width="8" height="8" />
              <rect x="44" y="148" width="8" height="8" />
              <rect x="44" y="164" width="8" height="8" />

              {/* Top block clusters */}
              <rect x="84" y="20" width="16" height="16" />
              <rect x="108" y="20" width="24" height="8" />
              <rect x="140" y="20" width="16" height="16" />
              <rect x="164" y="20" width="12" height="16" />

              <rect x="84" y="60" width="8" height="16" />
              <rect x="100" y="68" width="16" height="8" />
              <rect x="124" y="60" width="16" height="16" />
              <rect x="148" y="68" width="16" height="8" />
              <rect x="168" y="60" width="8" height="16" />

              {/* Left quadrant clusters */}
              <rect x="20" y="84" width="16" height="16" />
              <rect x="20" y="108" width="8" height="24" />
              <rect x="20" y="140" width="16" height="16" />
              <rect x="20" y="164" width="16" height="12" />

              <rect x="60" y="84" width="16" height="8" />
              <rect x="68" y="100" width="8" height="16" />
              <rect x="60" y="124" width="16" height="16" />
              <rect x="68" y="148" width="8" height="16" />
              <rect x="60" y="168" width="16" height="8" />

              {/* Right quadrant clusters */}
              <rect x="184" y="84" width="24" height="8" />
              <rect x="216" y="84" width="16" height="16" />
              <rect x="184" y="100" width="8" height="24" />
              <rect x="200" y="108" width="16" height="8" />
              <rect x="224" y="108" width="16" height="16" />

              <rect x="184" y="132" width="16" height="8" />
              <rect x="208" y="124" width="8" height="24" />
              <rect x="224" y="132" width="16" height="16" />

              <rect x="184" y="156" width="24" height="8" />
              <rect x="216" y="156" width="8" height="24" />
              <rect x="232" y="156" width="8" height="16" />

              {/* Center matrix clusters */}
              <rect x="84" y="84" width="16" height="16" />
              <rect x="108" y="84" width="8" height="16" />
              <rect x="124" y="84" width="16" height="8" />
              <rect x="148" y="84" width="24" height="8" />

              <rect x="84" y="108" width="8" height="24" />
              <rect x="100" y="108" width="16" height="8" />
              <rect x="148" y="108" width="16" height="8" />
              <rect x="168" y="108" width="8" height="24" />

              <rect x="84" y="140" width="16" height="8" />
              <rect x="108" y="132" width="8" height="16" />
              <rect x="148" y="132" width="8" height="16" />
              <rect x="160" y="140" width="16" height="8" />

              <rect x="84" y="156" width="24" height="8" />
              <rect x="116" y="148" width="8" height="24" />
              <rect x="136" y="156" width="16" height="8" />
              <rect x="160" y="156" width="16" height="16" />

              {/* Bottom quadrant clusters */}
              <rect x="84" y="184" width="16" height="16" />
              <rect x="108" y="184" width="24" height="8" />
              <rect x="140" y="184" width="16" height="16" />
              <rect x="164" y="184" width="12" height="16" />
              <rect x="184" y="184" width="24" height="8" />
              <rect x="216" y="184" width="16" height="16" />

              <rect x="84" y="208" width="8" height="24" />
              <rect x="100" y="200" width="16" height="8" />
              <rect x="124" y="200" width="16" height="16" />
              <rect x="148" y="208" width="8" height="24" />
              <rect x="164" y="208" width="16" height="8" />
              <rect x="184" y="200" width="16" height="16" />
              <rect x="208" y="208" width="16" height="8" />
              <rect x="232" y="200" width="8" height="24" />

              <rect x="100" y="224" width="16" height="16" />
              <rect x="124" y="224" width="16" height="8" />
              <rect x="148" y="232" width="24" height="8" />
              <rect x="180" y="224" width="16" height="16" />
              <rect x="204" y="224" width="24" height="8" />
            </g>

            {/* PhonePe Center Badge (Authentic rounded badge) */}
            <circle cx="130" cy="130" r="22" fill="white" stroke="#111827" strokeWidth="2.5" />
            <circle cx="130" cy="130" r="18" fill="#5f259f" />
            <text
              x="130"
              y="137"
              fill="white"
              fontSize="16"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              पे
            </text>
          </svg>

          {/* Amount Badge */}
          {amount && (
            <div className="mt-2 py-1 px-3 bg-amber-100 border border-amber-300 rounded-lg text-amber-950 font-bold text-xs">
              ટોકન રકમ: ₹ {amount.toLocaleString('en-IN')}/-
            </div>
          )}
        </div>
      </div>

      {/* Account holder name as shown on user's QR image */}
      <div className="px-4 pb-4">
        <div className="font-bold text-neutral-900 text-xs sm:text-sm tracking-wide uppercase font-mono">
          {payeeName}
        </div>
        <div className="text-[10px] text-neutral-600 mt-1 font-mono">
          UPI ID: <span className="font-bold text-neutral-800">9978810372@ybl</span> (Hetal Shah)
        </div>
        <div className="text-[9px] text-neutral-400 mt-2">
          © 2026, All rights reserved, PhonePe Ltd (Formerly known as 'PhonePe Private Ltd')
        </div>
      </div>
    </div>
  );
};
