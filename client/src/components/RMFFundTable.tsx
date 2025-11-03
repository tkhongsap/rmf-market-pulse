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
  const getRiskColor = (level: number) => {
    if (level <= 2) return 'text-green-600 dark:text-green-400';
    if (level <= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Fund Code</TableHead>
            <TableHead className="font-semibold">Fund Name</TableHead>
            <TableHead className="font-semibold">AMC</TableHead>
            <TableHead className="font-semibold text-right">NAV</TableHead>
            <TableHead className="font-semibold text-right">Change</TableHead>
            <TableHead className="font-semibold text-right">Change %</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold text-center">Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funds.map((fund) => {
            const isPositive = fund.navChange >= 0;
            return (
              <TableRow key={fund.fundCode} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  {fund.fundCode}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={fund.fundNameEn || fund.fundName}>
                    {fund.fundNameEn || fund.fundName}
                  </div>
                </TableCell>
                <TableCell className="max-w-[150px]">
                  <div className="truncate text-sm text-muted-foreground">
                    {fund.amcName.replace('Asset Management', 'AM')}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ฿{fund.nav.toFixed(4)}
                </TableCell>
                <TableCell className={`text-right ${
                  isPositive ? 'text-success' : 'text-error'
                }`}>
                  {isPositive ? '+' : '-'}฿{Math.abs(fund.navChange).toFixed(4)}
                </TableCell>
                <TableCell className="text-right">
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
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {fund.fundType}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-medium ${getRiskColor(fund.riskLevel)}`}>
                    {fund.riskLevel}/8
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
