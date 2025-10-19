import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ForexCardProps {
  pair: string;
  name: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdate?: string;
}

export default function ForexCard({
  pair,
  name,
  rate,
  change,
  changePercent,
  lastUpdate,
}: ForexCardProps) {
  const isPositive = change >= 0;
  const formattedRate = rate.toFixed(4);
  const formattedChange = Math.abs(change).toFixed(4);
  const formattedPercent = Math.abs(changePercent).toFixed(2);

  return (
    <Card 
      className="p-4 hover-elevate" 
      data-testid={`card-forex-${pair.toLowerCase().replace('/', '-')}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-base text-foreground"
              data-testid={`text-pair-${pair.toLowerCase().replace('/', '-')}`}
            >
              {pair}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {name}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              isPositive 
                ? 'bg-success/10 text-success border-success/20' 
                : 'bg-error/10 text-error border-error/20'
            }`}
            data-testid={`badge-change-${pair.toLowerCase().replace('/', '-')}`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : '-'}{formattedPercent}%
            </span>
          </Badge>
        </div>

        <div>
          <div 
            className="text-2xl font-bold text-foreground"
            data-testid={`text-rate-${pair.toLowerCase().replace('/', '-')}`}
          >
            {formattedRate}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isPositive ? '+' : '-'}{formattedChange} today
          </p>
        </div>

        {lastUpdate && (
          <p className="text-xs text-muted-foreground" data-testid="text-timestamp">
            Updated: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        )}
      </div>
    </Card>
  );
}
