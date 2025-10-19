import PriceTable from '../PriceTable';

export default function PriceTableExample() {
  const commodityData = [
    { name: 'Gold', symbol: 'XAU', price: 2045.50, change: 23.40, changePercent: 1.16, currency: '$', unit: 'oz' },
    { name: 'Silver', symbol: 'XAG', price: 24.85, change: 0.32, changePercent: 1.30, currency: '$', unit: 'oz' },
    { name: 'Crude Oil (WTI)', symbol: 'CL', price: 78.25, change: -1.85, changePercent: -2.31, currency: '$', unit: 'barrel' },
    { name: 'Natural Gas', symbol: 'NG', price: 2.67, change: 0.05, changePercent: 1.91, currency: '$', unit: 'MMBtu' },
  ];

  const forexData = [
    { name: 'EUR/USD', price: 1.0875, change: 0.0042, changePercent: 0.39, currency: '' },
    { name: 'GBP/USD', price: 1.2634, change: -0.0018, changePercent: -0.14, currency: '' },
    { name: 'USD/JPY', price: 149.82, change: 0.45, changePercent: 0.30, currency: '' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold mb-3">Commodities</h3>
        <PriceTable data={commodityData} type="commodity" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Forex Pairs</h3>
        <PriceTable data={forexData} type="forex" />
      </div>
    </div>
  );
}
