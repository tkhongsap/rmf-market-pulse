import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { RMFFund } from "@shared/schema";

interface RMFFundTableProps {
  funds: RMFFund[];
}

export default function RMFFundTable({ funds }: RMFFundTableProps) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Symbol</TableHead>
            <TableHead className="font-semibold">Fund Name</TableHead>
            <TableHead className="font-semibold text-right">NAV</TableHead>
            <TableHead className="font-semibold text-right">Change</TableHead>
            <TableHead className="font-semibold text-right">Change %</TableHead>
            <TableHead className="font-semibold text-right">P/NAV</TableHead>
            <TableHead className="font-semibold text-right">Volume</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funds.map((fund) => {
            const isPositive = fund.navChange >= 0;
            return (
              <TableRow key={fund.symbol} className="hover:bg-muted/30" data-testid={`row-fund-${fund.symbol}`}>
                <TableCell className="font-medium" data-testid={`cell-symbol-${fund.symbol}`}>
                  {fund.symbol}
                </TableCell>
                <TableCell className="max-w-xs" data-testid={`cell-name-${fund.symbol}`}>
                  <div className="truncate" title={fund.fundName}>
                    {fund.fundName}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium" data-testid={`cell-nav-${fund.symbol}`}>
                  ฿{fund.nav.toFixed(4)}
                </TableCell>
                <TableCell className={`text-right ${
                  isPositive ? 'text-success' : 'text-error'
                }`} data-testid={`cell-change-${fund.symbol}`}>
                  {isPositive ? '+' : '-'}฿{Math.abs(fund.navChange).toFixed(4)}
                </TableCell>
                <TableCell className="text-right" data-testid={`cell-percent-${fund.symbol}`}>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 justify-end ${
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
                      {isPositive ? '+' : '-'}{Math.abs(fund.navChangePercent).toFixed(2)}%
                    </span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground" data-testid={`cell-pnav-${fund.symbol}`}>
                  {fund.pnav ? fund.pnav.toFixed(2) : '—'}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground" data-testid={`cell-volume-${fund.symbol}`}>
                  {fund.totalVolume ? fund.totalVolume.toLocaleString() : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground" data-testid={`cell-date-${fund.symbol}`}>
                  {new Date(fund.navDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
