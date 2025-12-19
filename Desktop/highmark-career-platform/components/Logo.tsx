export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 rounded-lg blur-sm opacity-50"></div>
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg p-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 4L4 10V22L16 28L28 22V10L16 4Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 16L10 13V19L16 22L22 19V13L16 16Z"
              fill="white"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>
      <span className={`logo-text ${sizeClasses[size]} text-white`}>
        HIGHMARK CAREER
      </span>
    </div>
  )
}

