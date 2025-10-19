import ForexCard from '../ForexCard';

export default function ForexCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      <ForexCard
        pair="EUR/USD"
        name="Euro to US Dollar"
        rate={1.0875}
        change={0.0042}
        changePercent={0.39}
        lastUpdate={new Date().toISOString()}
      />
      <ForexCard
        pair="GBP/USD"
        name="British Pound to US Dollar"
        rate={1.2634}
        change={-0.0018}
        changePercent={-0.14}
        lastUpdate={new Date().toISOString()}
      />
    </div>
  );
}
