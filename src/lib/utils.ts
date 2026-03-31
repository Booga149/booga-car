/**
 * Utility functions for Booga Car
 */

/**
 * Format currency to USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('SAR', 'ر.س');
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Truncate string to specified length
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Log a security event to the database
 */
export async function logSecurityEvent(supabase: any, { 
  type, 
  title, 
  account 
}: { 
  type: 'SECURITY_ALERT' | 'AUTH_SUCCESS' | 'AUTH_FAILURE', 
  title: string, 
  account: string 
}) {
  let ip = 'غير معروف';
  let location = 'غير معروف';
  
  try {
    // Primary: ipapi.co
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data.ip) {
      ip = data.ip;
      location = `${data.city || ''}, ${data.country_name || ''}`;
    } else {
      throw new Error('ipapi.co failed');
    }
  } catch (e) {
    try {
      // Fallback: freeipapi.com
      const res2 = await fetch('https://freeipapi.com/api/json');
      const data2 = await res2.json();
      ip = data2.ipAddress || 'غير معروف';
      location = `${data2.cityName || ''}, ${data2.countryName || ''}`;
    } catch (e2) {
      console.error('All IP lookups failed', e2);
    }
  }

  await supabase.from('admin_notifications').insert({
    type,
    title,
    message: `الحساب: ${account} | الـ IP: ${ip} | الموقع: ${location} | الجهاز: ${navigator.userAgent}`
  });
}
