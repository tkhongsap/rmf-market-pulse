import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceCardProps {
  name: string;
  symbol?: string;
  price: number | string;
  change: number;
  changePercent: number;
  currency: string;
  unit?: string;
  lastUpdate?: string;
  compact?: boolean;
}

export default function PriceCard({
  name,
  symbol,
  price,
  change,
  changePercent,
  currency,
  unit,
  lastUpdate,
  compact = false,
}: PriceCardProps) {
  const isPositive = change >= 0;
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price;
  const formattedChange = Math.abs(change).toFixed(2);
  const formattedPercent = Math.abs(changePercent).toFixed(2);

  return (
    <Card 
      className="p-4 hover-elevate" 
      data-testid={`card-price-${symbol || name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-base text-foreground truncate"
              data-testid={`text-name-${symbol || name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {name}
            </h3>
            {symbol && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {symbol}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              isPositive 
                ? 'bg-success/10 text-success border-success/20' 
                : 'bg-error/10 text-error border-error/20'
            }`}
            data-testid={`badge-change-${symbol || name.toLowerCase().replace(/\s+/g, '-')}`}
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
            data-testid={`text-price-${symbol || name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {currency}{formattedPrice}
            {unit && <span className="text-sm text-muted-foreground ml-1">/ {unit}</span>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isPositive ? '+' : '-'}{currency}{formattedChange} today
          </p>
        </div>

        {lastUpdate && !compact && (
          <p className="text-xs text-muted-foreground" data-testid="text-timestamp">
            Updated: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        )}
      </div>
    </Card>
  );
}
