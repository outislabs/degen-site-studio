import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Eye, Users, MousePointerClick, TrendingUp, ArrowLeft, Clock } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  siteId: string;
  siteName: string;
  onClose: () => void;
}

interface AnalyticsRow {
  id: string;
  site_id: string;
  event_type: string;
  visitor_id: string;
  referrer: string | null;
  source: string | null;
  created_at: string;
}

const SiteAnalyticsPanel = ({ siteId, siteName, onClose }: Props) => {
  const [events, setEvents] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data, error } = await (supabase.from('site_analytics' as any).select('*').eq('site_id', siteId).order('created_at', { ascending: false }) as any);
      if (!error && data) {
        setEvents(data as AnalyticsRow[]);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, [siteId]);

  const stats = useMemo(() => {
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const uniqueVisitors = events.filter(e => e.event_type === 'unique_visit').length;
    const buyClicks = events.filter(e => e.event_type === 'buy_click').length;
    const conversionRate = uniqueVisitors > 0 ? ((buyClicks / uniqueVisitors) * 100).toFixed(1) : '0.0';
    return { pageViews, uniqueVisitors, buyClicks, conversionRate };
  }, [events]);

  const dailyViews = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      days[d] = 0;
    }
    events
      .filter(e => e.event_type === 'page_view')
      .forEach(e => {
        const d = format(new Date(e.created_at), 'yyyy-MM-dd');
        if (d in days) days[d]++;
      });
    return Object.entries(days).map(([date, views]) => ({
      date: format(new Date(date), 'MMM d'),
      views,
    }));
  }, [events]);

  const trafficSources = useMemo(() => {
    const sources: Record<string, number> = {};
    events
      .filter(e => e.event_type === 'page_view')
      .forEach(e => {
        const src = e.source || e.referrer || 'Direct';
        sources[src] = (sources[src] || 0) + 1;
      });
    return Object.entries(sources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [events]);

  const recentActivity = useMemo(() => {
    return events.slice(0, 10).map(e => {
      const ago = getTimeAgo(new Date(e.created_at));
      const label =
        e.event_type === 'page_view'
          ? `Page view${e.referrer ? ` from ${e.referrer}` : ''}`
          : e.event_type === 'buy_click'
          ? 'Buy click'
          : 'Unique visit';
      return { label, ago, type: e.event_type };
    });
  }, [events]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const chartConfig = {
    views: { label: 'Page Views', color: 'hsl(var(--primary))' },
  };

  const barConfig = {
    count: { label: 'Visits', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{siteName} — Analytics</h2>
          <p className="text-xs text-muted-foreground">Last 30 days overview</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Page Views', value: stats.pageViews, icon: Eye, color: 'hsl(var(--primary))' },
          { label: 'Unique Visitors', value: stats.uniqueVisitors, icon: Users, color: 'hsl(var(--neon-pink))' },
          { label: 'Buy Clicks', value: stats.buyClicks, icon: MousePointerClick, color: 'hsl(var(--neon-purple))' },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'hsl(var(--neon-blue))' },
        ].map((stat, i) => (
          <Card key={i} className="gradient-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Views Over Time */}
      <Card className="gradient-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={dailyViews}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Top Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {trafficSources.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No traffic data yet</p>
            ) : (
              <ChartContainer config={barConfig} className="h-[200px] w-full">
                <BarChart data={trafficSources} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No activity yet</p>
            ) : (
              <div className="space-y-2.5">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.type === 'buy_click' ? 'bg-green-400' : item.type === 'unique_visit' ? 'bg-blue-400' : 'bg-primary'
                      }`} />
                      <span className="text-xs text-foreground">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.ago}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default SiteAnalyticsPanel;
