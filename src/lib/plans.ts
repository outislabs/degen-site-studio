export type PlanId = 'free' | 'degen' | 'creator' | 'whale';

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceMonthly: number;
  maxSites: number; // -1 = unlimited
  maxMemeDownloads: number; // -1 = unlimited
  hasCustomDomain: boolean;
  hasNoWatermark: boolean;
  hasAllTemplates: boolean;
  hasFullContentStudio: boolean;
  hasStickerPackBuilder: boolean;
  hasBasicShillTemplates: boolean;
  hasAllShillTemplates: boolean;
  hasBrandKit: boolean;
  hasLaunchKit: boolean;
  hasAuditBadge: boolean;
  hasTelegramBot: boolean;
  hasWhaleAlerts: boolean;
  hasMultiPlatformBlast: boolean;
  hasAnalyticsDashboard: boolean;
  hasApiAccess: boolean;
  hasWhiteLabel: boolean;
  hasPrioritySupport: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    maxSites: 1,
    maxMemeDownloads: 5,
    hasCustomDomain: false,
    hasNoWatermark: false,
    hasAllTemplates: false,
    hasFullContentStudio: false,
    hasStickerPackBuilder: false,
    hasBasicShillTemplates: false,
    hasAllShillTemplates: false,
    hasBrandKit: false,
    hasLaunchKit: false,
    hasAuditBadge: false,
    hasTelegramBot: false,
    hasWhaleAlerts: false,
    hasMultiPlatformBlast: false,
    hasAnalyticsDashboard: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
    hasPrioritySupport: false,
  },
  degen: {
    id: 'degen',
    name: 'Degen',
    priceMonthly: 19,
    maxSites: 3,
    maxMemeDownloads: 50,
    hasCustomDomain: true,
    hasNoWatermark: true,
    hasAllTemplates: true,
    hasFullContentStudio: false,
    hasStickerPackBuilder: false,
    hasBasicShillTemplates: true,
    hasAllShillTemplates: false,
    hasBrandKit: false,
    hasLaunchKit: false,
    hasAuditBadge: false,
    hasTelegramBot: false,
    hasWhaleAlerts: false,
    hasMultiPlatformBlast: false,
    hasAnalyticsDashboard: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
    hasPrioritySupport: false,
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    priceMonthly: 49,
    maxSites: 10,
    maxMemeDownloads: -1,
    hasCustomDomain: true,
    hasNoWatermark: true,
    hasAllTemplates: true,
    hasFullContentStudio: true,
    hasStickerPackBuilder: true,
    hasBasicShillTemplates: true,
    hasAllShillTemplates: true,
    hasBrandKit: true,
    hasLaunchKit: true,
    hasAuditBadge: true,
    hasTelegramBot: true,
    hasWhaleAlerts: true,
    hasMultiPlatformBlast: true,
    hasAnalyticsDashboard: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
    hasPrioritySupport: true,
  },
  whale: {
    id: 'whale',
    name: 'Whale',
    priceMonthly: 99,
    maxSites: -1,
    maxMemeDownloads: -1,
    hasCustomDomain: true,
    hasNoWatermark: true,
    hasAllTemplates: true,
    hasFullContentStudio: true,
    hasStickerPackBuilder: true,
    hasBasicShillTemplates: true,
    hasAllShillTemplates: true,
    hasBrandKit: true,
    hasLaunchKit: true,
    hasAuditBadge: true,
    hasTelegramBot: true,
    hasWhaleAlerts: true,
    hasMultiPlatformBlast: true,
    hasAnalyticsDashboard: true,
    hasApiAccess: true,
    hasWhiteLabel: true,
    hasPrioritySupport: true,
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'degen', 'creator', 'whale'];
