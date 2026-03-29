import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const VISITOR_ID_KEY = 'degen_visitor_id';
const VISITED_SITES_KEY = 'degen_visited_sites';

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function getUtmSource(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_source');
  } catch {
    return null;
  }
}

function getReferrerDomain(): string | null {
  try {
    if (!document.referrer) return null;
    return new URL(document.referrer).hostname;
  } catch {
    return null;
  }
}

async function trackEvent(siteId: string, eventType: string) {
  const visitorId = getVisitorId();
  await supabase.from('site_analytics' as any).insert({
    site_id: siteId,
    event_type: eventType,
    visitor_id: visitorId,
    referrer: getReferrerDomain(),
    source: getUtmSource(),
  });
}

export function usePageTracking(siteId: string | undefined) {
  useEffect(() => {
    if (!siteId) return;

    // Track page view
    trackEvent(siteId, 'page_view');

    // Track unique visit
    const visitorId = getVisitorId();
    const visitedRaw = localStorage.getItem(VISITED_SITES_KEY);
    const visited: string[] = visitedRaw ? JSON.parse(visitedRaw) : [];
    const key = `${siteId}:${visitorId}`;
    if (!visited.includes(key)) {
      trackEvent(siteId, 'unique_visit');
      visited.push(key);
      localStorage.setItem(VISITED_SITES_KEY, JSON.stringify(visited));
    }
  }, [siteId]);
}

export function trackBuyClick(siteId: string) {
  trackEvent(siteId, 'buy_click');
}
