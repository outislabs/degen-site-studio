interface DonutChartProps {
  distribution: {
    lp: number;
    team: number;
    marketing: number;
    burn: number;
  };
}

const DonutChart = ({ distribution }: DonutChartProps) => {
  const total = distribution.lp + distribution.team + distribution.marketing + distribution.burn;
  const segments = [
    { label: 'Liquidity', value: distribution.lp, color: 'hsl(142, 76%, 46%)' },
    { label: 'Team', value: distribution.team, color: 'hsl(270, 80%, 60%)' },
    { label: 'Marketing', value: distribution.marketing, color: 'hsl(330, 85%, 60%)' },
    { label: 'Burn', value: distribution.burn, color: 'hsl(30, 90%, 55%)' },
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
        className="w-32 h-32 rounded-full flex-shrink-0"
        style={{
          background: `conic-gradient(${gradientParts.join(', ')})`,
          boxShadow: '0 0 30px hsl(142 76% 46% / 0.2)',
        }}
      >
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-background" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-semibold text-foreground">{total > 0 ? Math.round((seg.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
