import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden group",
      className
    )}
    style={style}
    {...props}
  >
    {/* Animated Border Pseudo-element */}
    <div className="absolute inset-0 p-[1px] rounded-xl overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,_#4285F4_0deg,_#DB4437_90deg,_#F4B400_180deg,_#0F9D58_270deg,_#4285F4_360deg)] animate-[border-rotate_4s_linear_infinite]" />
    </div>

    {/* Content Background (to cover the center) */}
    <div
      className="absolute inset-[1px] rounded-[11px] -z-10"
      style={{
        backgroundColor: 'rgba(1, 3, 4, 0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)'
      }}
    />
    <div className="relative z-10 h-full">
      {props.children}
    </div>
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
