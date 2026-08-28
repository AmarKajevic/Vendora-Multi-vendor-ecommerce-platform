const Logo = () => {
  return (
    <svg viewBox="0 0 260 80" className="w-[160px] h-auto">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <g transform="translate(10,15)">
        <rect x="0" y="10" width="40" height="25" rx="6" fill="url(#grad)" />
        <circle cx="12" cy="40" r="4" fill="#1F2937" />
        <circle cx="30" cy="40" r="4" fill="#1F2937" />
        <path
          d="M5 10 L10 0 H35"
          stroke="#1F2937"
          strokeWidth="2"
          fill="none"
        />
      </g>

      <text
        x="70"
        y="50"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="#ffffff"
      >
        E-COMMERCE
      </text>

      <text
        x="70"
        y="68"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="12"
        fill="#6B7280"
      >
        Smart Shopping Platform
      </text>
    </svg>
  );
};

export default Logo;