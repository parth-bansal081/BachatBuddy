import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ThreeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ThreeErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-border bg-card/50 text-muted-foreground text-sm p-4 gap-2">
            <span className="font-semibold text-destructive">3D view error:</span>
            <code className="text-xs bg-black/30 p-2 rounded max-w-full overflow-auto block text-red-400 font-mono">
              {this.state.error?.message || "Unknown error"}
            </code>
            <span className="text-[10px] text-muted-foreground">Showing simplified fallback view</span>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
