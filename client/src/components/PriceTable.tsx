import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceTableRow {
  name: string;
  symbol?: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  unit?: string;
}

interface PriceTableProps {
  data: PriceTableRow[];
  type: 'commodity' | 'forex';
}

export default function PriceTable({ data, type }: PriceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" data-testid={`table-${type}`}>
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-foreground">
              {type === 'commodity' ? 'Asset' : 'Pair'}
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-foreground">
              {type === 'commodity' ? 'Price' : 'Rate'}
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-foreground">
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const isPositive = row.change >= 0;
            const formattedPrice = row.price.toFixed(type === 'forex' ? 4 : 2);
            const formattedPercent = Math.abs(row.changePercent).toFixed(2);

            return (
              <tr
                key={row.symbol || row.name}
                className="border-b border-border last:border-0 hover-elevate"
                data-testid={`row-${type}-${index}`}
              >
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {row.name}
                    </div>
                    {row.symbol && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {row.symbol}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="font-semibold text-foreground">
                    {row.currency}{formattedPrice}
                    {row.unit && (
                      <span className="text-xs text-muted-foreground ml-1">
                        / {row.unit}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 justify-end w-fit ml-auto ${
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
                    <span className="font-medium text-xs">
                      {isPositive ? '+' : '-'}{formattedPercent}%
                    </span>
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
