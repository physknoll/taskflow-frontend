/**
 * Site type for icon display and UI styling
 */
export type SiteType =
  | 'linkedin'
  | 'reddit'
  | 'youtube'
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'medium'
  | 'substack'
  | 'github'
  | 'hackernews'
  | 'producthunt'
  | 'wordpress'
  | 'shopify'
  | 'generic';

/**
 * Site type configuration for colors and labels
 */
export const SITE_TYPE_CONFIG: Record<SiteType, { color: string; label: string; bgColor: string }> = {
  linkedin: { color: '#0A66C2', label: 'LinkedIn', bgColor: 'rgba(10, 102, 194, 0.1)' },
  reddit: { color: '#FF4500', label: 'Reddit', bgColor: 'rgba(255, 69, 0, 0.1)' },
  youtube: { color: '#FF0000', label: 'YouTube', bgColor: 'rgba(255, 0, 0, 0.1)' },
  facebook: { color: '#1877F2', label: 'Facebook', bgColor: 'rgba(24, 119, 242, 0.1)' },
  twitter: { color: '#000000', label: 'X / Twitter', bgColor: 'rgba(0, 0, 0, 0.1)' },
  instagram: { color: '#E4405F', label: 'Instagram', bgColor: 'rgba(228, 64, 95, 0.1)' },
  tiktok: { color: '#000000', label: 'TikTok', bgColor: 'rgba(0, 0, 0, 0.1)' },
  medium: { color: '#000000', label: 'Medium', bgColor: 'rgba(0, 0, 0, 0.1)' },
  substack: { color: '#FF6719', label: 'Substack', bgColor: 'rgba(255, 103, 25, 0.1)' },
  github: { color: '#181717', label: 'GitHub', bgColor: 'rgba(24, 23, 23, 0.1)' },
  hackernews: { color: '#FF6600', label: 'Hacker News', bgColor: 'rgba(255, 102, 0, 0.1)' },
  producthunt: { color: '#DA552F', label: 'Product Hunt', bgColor: 'rgba(218, 85, 47, 0.1)' },
  wordpress: { color: '#21759B', label: 'WordPress', bgColor: 'rgba(33, 117, 155, 0.1)' },
  shopify: { color: '#7AB55C', label: 'Shopify', bgColor: 'rgba(122, 181, 92, 0.1)' },
  generic: { color: '#6B7280', label: 'Website', bgColor: 'rgba(107, 114, 128, 0.1)' },
};

/**
 * Detect site type from URL
 * This is a fallback for when siteType is not provided by the backend
 */
export function detectSiteType(url: string): SiteType {
  if (!url) return 'generic';
  
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('linkedin.com')) return 'linkedin';
  if (lowercaseUrl.includes('reddit.com') || lowercaseUrl.includes('old.reddit.com')) return 'reddit';
  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) return 'youtube';
  if (lowercaseUrl.includes('facebook.com') || lowercaseUrl.includes('fb.com')) return 'facebook';
  if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) return 'twitter';
  if (lowercaseUrl.includes('instagram.com')) return 'instagram';
  if (lowercaseUrl.includes('tiktok.com')) return 'tiktok';
  if (lowercaseUrl.includes('medium.com') || lowercaseUrl.includes('.medium.')) return 'medium';
  if (lowercaseUrl.includes('substack.com')) return 'substack';
  if (lowercaseUrl.includes('github.com')) return 'github';
  if (lowercaseUrl.includes('news.ycombinator.com') || lowercaseUrl.includes('hn.algolia.com')) return 'hackernews';
  if (lowercaseUrl.includes('producthunt.com')) return 'producthunt';
  if (lowercaseUrl.includes('wordpress.com') || lowercaseUrl.includes('wp.com')) return 'wordpress';
  if (lowercaseUrl.includes('shopify.com') || lowercaseUrl.includes('myshopify.com')) return 'shopify';
  
  return 'generic';
}
