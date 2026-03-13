interface TickerTapeProps {
  name: string;
  ticker: string;
  accentHex?: string;
}

const TickerTape = ({ name, ticker, accentHex = '#22c55e' }: TickerTapeProps) => {
  const displayName = name || 'YOUR COIN';
  const displayTicker = ticker || '$TICKER';
  const items = Array(12).fill(`${displayName} • ${displayTicker} • 🚀 `);

  return (
    <div className="w-full overflow-hidden py-2.5 border-b" style={{ backgroundColor: `${accentHex}10`, borderColor: `${accentHex}30` }}>
      <div className="animate-ticker whitespace-nowrap flex">
        {items.map((item, i) => (
          <span key={i} className="font-display text-[10px] mx-3 tracking-wider" style={{ color: accentHex }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;
