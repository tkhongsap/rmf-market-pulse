interface WidgetContainerProps {
  children: React.ReactNode;
  title?: string;
  timestamp?: string;
}

export default function WidgetContainer({ 
  children, 
  title,
  timestamp 
}: WidgetContainerProps) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-background">
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground" data-testid="text-widget-title">
            {title}
          </h2>
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>

      {timestamp && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center" data-testid="text-widget-timestamp">
            Last updated: {new Date(timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
