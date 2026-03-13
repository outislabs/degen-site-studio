interface DonutChartProps {
  distribution: {
    lp: number;
    team: number;
    marketing: number;
    burn: number;
  };
  accentHex?: string;
}

const DonutChart = ({ distribution, accentHex = '#22c55e' }: DonutChartProps) => {
  const total = distribution.lp + distribution.team + distribution.marketing + distribution.burn;
  const segments = [
    { label: 'Liquidity', value: distribution.lp, color: accentHex },
    { label: 'Team', value: distribution.team, color: '#a855f7' },
    { label: 'Marketing', value: distribution.marketing, color: '#f472b6' },
    { label: 'Burn', value: distribution.burn, color: '#fb923c' },
  ];

  let cumulative = 0;
  const gradientParts = segments.map(seg => {
    const start = (cumulative / total) * 100;
    cumulative += seg.value;
    const end = (cumulative / total) * 100;
    return `${seg.color} ${start}% ${end}%`;
  });

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-28 h-28 rounded-full flex-shrink-0 relative"
        style={{
          background: `conic-gradient(${gradientParts.join(', ')})`,
          boxShadow: `0 0 40px ${accentHex}30`,
        }}
      >
        <div className="absolute inset-3 rounded-full bg-[#0a0a0f]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2.5 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}40` }} />
            <span className="text-white/50 text-xs">{seg.label}</span>
            <span className="font-bold text-white text-xs">{total > 0 ? Math.round((seg.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
