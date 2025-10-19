import { Card } from "@/components/ui/card";

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'table';
}

export default function LoadingSkeleton({ count = 4, type = 'card' }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 px-4 border-b border-border">
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-3 bg-muted/60 rounded w-16"></div>
            </div>
            <div className="h-5 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded-full w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 animate-pulse" data-testid={`skeleton-card-${i}`}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-24 mb-2"></div>
                <div className="h-3 bg-muted/60 rounded w-16"></div>
              </div>
              <div className="h-6 bg-muted rounded-full w-16"></div>
            </div>
            <div>
              <div className="h-8 bg-muted rounded w-32 mb-2"></div>
              <div className="h-4 bg-muted/60 rounded w-24"></div>
            </div>
            <div className="h-3 bg-muted/40 rounded w-40"></div>
          </div>
        </Card>
      ))}
    </div>
  );
}
