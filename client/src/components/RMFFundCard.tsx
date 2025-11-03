import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Building2, Shield } from "lucide-react";
import type { RMFFund } from "@shared/schema";

interface RMFFundCardProps {
  fund: RMFFund;
}

export default function RMFFundCard({ fund }: RMFFundCardProps) {
  const isPositive = fund.navChange >= 0;
  const formattedNav = fund.nav.toFixed(4);
  const formattedChange = Math.abs(fund.navChange).toFixed(4);
  const formattedPercent = Math.abs(fund.navChangePercent).toFixed(2);

  // Risk level color coding
  const getRiskColor = (level: number) => {
    if (level <= 2) return 'text-green-600 dark:text-green-400';
    if (level <= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="p-4 hover-elevate">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate">
              {fund.fundCode}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {fund.fundNameEn || fund.fundName}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              isPositive
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-error/10 text-error border-error/20'
            }`}
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
          <div className="text-2xl font-bold text-foreground">
            ฿{formattedNav}
            <span className="text-sm text-muted-foreground ml-1">NAV</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isPositive ? '+' : '-'}฿{formattedChange} today
          </p>
        </div>

        {/* Fund Details */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {fund.amcName.replace('Asset Management', 'AM').substring(0, 20)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Shield className={`w-3.5 h-3.5 ${getRiskColor(fund.riskLevel)}`} />
            <span className={`text-xs font-medium ${getRiskColor(fund.riskLevel)}`}>
              Risk {fund.riskLevel}/8
            </span>
          </div>
        </div>

        {/* Fund Type */}
        <div>
          <Badge variant="secondary" className="text-xs">
            {fund.fundType}
          </Badge>
        </div>

        {/* Performance Metrics (if available) */}
        {(fund.ytdReturn || fund.return1Y) && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1.5">Returns:</p>
            <div className="grid grid-cols-2 gap-2">
              {fund.ytdReturn !== undefined && (
                <div>
                  <span className="text-xs text-muted-foreground">YTD:</span>
                  <span className={`text-xs font-medium ml-1 ${
                    fund.ytdReturn >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {fund.ytdReturn >= 0 ? '+' : ''}{fund.ytdReturn.toFixed(2)}%
                  </span>
                </div>
              )}
              {fund.return1Y !== undefined && (
                <div>
                  <span className="text-xs text-muted-foreground">1Y:</span>
                  <span className={`text-xs font-medium ml-1 ${
                    fund.return1Y >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {fund.return1Y >= 0 ? '+' : ''}{fund.return1Y.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Update */}
        <p className="text-xs text-muted-foreground">
          Updated: {new Date(fund.navDate).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}
