import PriceCard from '../PriceCard';

export default function PriceCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      <PriceCard
        name="Gold"
        symbol="XAU"
        price={2045.50}
        change={23.40}
        changePercent={1.16}
        currency="$"
        unit="oz"
        lastUpdate={new Date().toISOString()}
      />
      <PriceCard
        name="Crude Oil (WTI)"
        symbol="CL"
        price={78.25}
        change={-1.85}
        changePercent={-2.31}
        currency="$"
        unit="barrel"
        lastUpdate={new Date().toISOString()}
      />
    </div>
  );
}
