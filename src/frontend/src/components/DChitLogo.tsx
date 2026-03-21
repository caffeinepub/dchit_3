interface DChitLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

export default function DChitLogo({
  size = "md",
  variant = "dark",
}: DChitLogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="DChit Logo"
      >
        <rect width="48" height="48" rx="10" fill="#C8A14A" />
        <text
          x="50%"
          y="54%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
        >
          D
        </text>
      </svg>
      <span
        className={`font-bold ${textSizes[size]} tracking-tight ${
          variant === "light" ? "text-white" : "text-navy"
        }`}
      >
        DChit
      </span>
    </div>
  );
}
