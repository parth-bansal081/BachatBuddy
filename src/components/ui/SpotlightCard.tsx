import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}

export const SpotlightCard = ({
    children,
    className = "",
    spotlightColor = "rgba(20, 184, 166, 0.25)", // Default Teal
    ...props
}: SpotlightCardProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Mouse tracking for Spotlight
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        x.set(mouseX);
        y.set(mouseY);
    };

    // Soft Tilt Effect
    const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
    const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

    const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const rX = (mouseY / height - 0.5) * 10 * -1; // Reverse sign for correct tilt
        const rY = (mouseX / width - 0.5) * 10;

        rotateX.set(rX);
        rotateY.set(rY);
    };

    const handleMouseLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={(e) => {
                handleMouseMove(e);
                handleTiltMove(e);
            }}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "relative rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden group transition-all duration-300",
                "hover:shadow-xl hover:border-primary/50",
                className
            )}
            {...props as any}
        >
            {/* Spotlight Overlay */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${x}px ${y}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
                }}
            />

            {/* Content */}
            <div className="relative h-full w-full">
                {children}
            </div>
        </motion.div>
    );
};
