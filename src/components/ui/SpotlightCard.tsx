import { useRef } from "react";
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
    spotlightColor = "hsla(175, 100%, 35%, 0.15)",
    ...props
}: SpotlightCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
    const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX);
        y.set(mouseY);
        const rX = ((mouseY / rect.height - 0.5) * 8) * -1;
        const rY = (mouseX / rect.width - 0.5) * 8;
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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={cn(
                "relative rounded-2xl border border-border/50 bg-card/50 dark:bg-card/30 backdrop-blur-sm overflow-hidden group transition-all duration-200",
                "hover:shadow-elevation-3 hover:border-primary/30",
                className
            )}
            {...props as any}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useMotionTemplate`radial-gradient(650px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`,
                }}
            />
            <div className="relative h-full w-full">
                {children}
            </div>
        </motion.div>
    );
};