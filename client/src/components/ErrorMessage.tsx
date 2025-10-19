import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center p-8 text-center"
      data-testid="error-message"
    >
      <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-foreground font-medium mb-2">Unable to load data</p>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline"
          data-testid="button-retry"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
