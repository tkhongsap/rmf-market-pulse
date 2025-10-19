import WidgetContainer from '../WidgetContainer';
import PriceCard from '../PriceCard';

export default function WidgetContainerExample() {
  return (
    <WidgetContainer 
      title="Commodity Prices" 
      timestamp={new Date().toISOString()}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PriceCard
          name="Gold"
          symbol="XAU"
          price={2045.50}
          change={23.40}
          changePercent={1.16}
          currency="$"
          unit="oz"
        />
        <PriceCard
          name="Silver"
          symbol="XAG"
          price={24.85}
          change={0.32}
          changePercent={1.30}
          currency="$"
          unit="oz"
        />
      </div>
    </WidgetContainer>
  );
}
