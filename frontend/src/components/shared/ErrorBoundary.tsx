import { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex items-center justify-center min-h-[400px] p-6">
                    <Card className="max-w-md w-full border-destructive/50">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="p-3 rounded-full bg-destructive/10">
                                    <AlertTriangle className="h-8 w-8 text-destructive" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {this.state.error?.message || "An unexpected error occurred"}
                                </p>
                                <details className="text-xs text-muted-foreground mb-4 text-left">
                                    <summary className="cursor-pointer hover:text-foreground">
                                        Technical details
                                    </summary>
                                    <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                                        {this.state.error?.stack}
                                    </pre>
                                </details>
                                <Button
                                    onClick={this.handleReset}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reload Page
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
