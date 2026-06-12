import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  height?: string;
  message?: string;
}

export function ThreeFallback({ height = "400px", message = "3D view unavailable" }: Props) {
  return (
    <div style={{ height }} className="w-full">
      <Card className="h-full border-border/50 bg-card/30">
        <CardContent className="h-full flex flex-col items-center justify-center gap-2 p-4">
          <AlertTriangle className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground/60 text-center">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}