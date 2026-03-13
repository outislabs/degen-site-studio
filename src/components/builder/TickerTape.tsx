interface TickerTapeProps {
  name: string;
  ticker: string;
}

const TickerTape = ({ name, ticker }: TickerTapeProps) => {
  const displayName = name || 'YOUR COIN';
  const displayTicker = ticker || '$TICKER';
  const items = Array(12).fill(`${displayName} • ${displayTicker} • 🚀 `);

  return (
    <div className="w-full overflow-hidden bg-primary/10 border-y border-primary/20 py-2">
      <div className="animate-ticker whitespace-nowrap flex">
        {items.map((item, i) => (
          <span key={i} className="font-display text-xs text-primary text-glow mx-2">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;
