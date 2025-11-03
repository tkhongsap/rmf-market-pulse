import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import type { RMFFund } from "@shared/schema";

interface RMFFundCardProps {
  fund: RMFFund;
}

export default function RMFFundCard({ fund }: RMFFundCardProps) {
  const isPositive = fund.navChange >= 0;
  const formattedNav = fund.nav.toFixed(4);
  const formattedChange = Math.abs(fund.navChange).toFixed(4);
  const formattedPercent = Math.abs(fund.navChangePercent).toFixed(2);

  return (
    <Card className="p-4 hover-elevate" data-testid={`card-fund-${fund.symbol}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate" data-testid={`text-symbol-${fund.symbol}`}>
              {fund.symbol}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2" data-testid={`text-name-${fund.symbol}`}>
              {fund.fundName}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              isPositive
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-error/10 text-error border-error/20'
            }`}
            data-testid={`badge-change-${fund.symbol}`}
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

        {/* NAV */}
        <div>
          <div className="text-2xl font-bold text-foreground" data-testid={`text-nav-${fund.symbol}`}>
            ฿{formattedNav}
            <span className="text-sm text-muted-foreground ml-1">NAV</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-nav-change-${fund.symbol}`}>
            {isPositive ? '+' : '-'}฿{formattedChange} today
          </p>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          {fund.pnav && (
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <span className="text-xs text-muted-foreground">P/NAV: </span>
                <span className="text-xs font-medium" data-testid={`text-pnav-${fund.symbol}`}>
                  {fund.pnav.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          {fund.dividendYield && (
            <div className="flex items-center gap-1.5 justify-end">
              <div>
                <span className="text-xs text-muted-foreground">Yield: </span>
                <span className="text-xs font-medium" data-testid={`text-dividend-${fund.symbol}`}>
                  {fund.dividendYield.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Trading Volume */}
        {fund.totalVolume && fund.totalVolume > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-medium" data-testid={`text-volume-${fund.symbol}`}>
                {fund.totalVolume.toLocaleString()}
              </span>
            </div>
            {fund.totalValue && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground">Value:</span>
                <span className="font-medium" data-testid={`text-value-${fund.symbol}`}>
                  ฿{(fund.totalValue / 1000000).toFixed(2)}M
                </span>
              </div>
            )}
          </div>
        )}

        {/* Last Update */}
        <p className="text-xs text-muted-foreground" data-testid={`text-date-${fund.symbol}`}>
          Updated: {new Date(fund.navDate).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}
