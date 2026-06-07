
import { cn } from "@/lib/utils";

export const GeminiSparkle = ({ className }: { className?: string }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("animate-pulse", className)}
        >
            <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                className="fill-[#4285F4] animate-[spin_4s_linear_infinite]"
                style={{ transformOrigin: "center" }}
            />
            <circle cx="12" cy="12" r="4" className="fill-[#DB4437] opacity-60 blur-[1px]" />
            <path
                d="M18 6L19 9L22 10L19 11L18 14L17 11L14 10L17 9L18 6Z"
                className="fill-[#F4B400] animate-bounce"
                style={{ animationDuration: "2s" }}
            />
            <path
                d="M6 18L7 21L10 22L7 23L6 26L5 23L2 22L5 21L6 18Z"
                className="fill-[#0F9D58] animate-bounce"
                style={{ animationDuration: "3s" }}
            />
            <g style={{ mixBlendMode: 'plus-lighter' }}>
                <path
                    d="M12 4c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z"
                    fill="url(#gemini-gradient)"
                />
            </g>
            <defs>
                <linearGradient id="gemini-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4285F4" />
                    <stop offset="33%" stopColor="#DB4437" />
                    <stop offset="66%" stopColor="#F4B400" />
                    <stop offset="100%" stopColor="#0F9D58" />
                </linearGradient>
            </defs>
        </svg>
    );
};
