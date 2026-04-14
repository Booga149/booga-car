import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role or anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // max requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  
  entry.count++;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

// Parse User-Agent to extract device, browser, OS
function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  const uaLower = ua.toLowerCase();
  
  // Device type
  let device = 'كمبيوتر';
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    device = 'موبايل';
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    device = 'تابلت';
  }

  // Browser
  let browser = 'غير معروف';
  if (uaLower.includes('edg/')) browser = 'Edge';
  else if (uaLower.includes('opr/') || uaLower.includes('opera')) browser = 'Opera';
  else if (uaLower.includes('chrome') && !uaLower.includes('edg')) browser = 'Chrome';
  else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'Safari';
  else if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('msie') || uaLower.includes('trident')) browser = 'IE';

  // OS
  let os = 'غير معروف';
  if (uaLower.includes('windows nt 10')) os = 'Windows 10/11';
  else if (uaLower.includes('windows')) os = 'Windows';
  else if (uaLower.includes('mac os x') || uaLower.includes('macintosh')) os = 'macOS';
  else if (uaLower.includes('android')) {
    const match = ua.match(/Android\s([\d.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  }
  else if (uaLower.includes('iphone') || uaLower.includes('ipad')) {
    const match = ua.match(/OS\s([\d_]+)/i);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  }
  else if (uaLower.includes('linux')) os = 'Linux';

  return { device, browser, os };
}

// Get real IP from Vercel headers
function getClientIP(request: NextRequest): string {
  // Vercel-specific headers (most reliable)
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for');
  if (vercelForwarded) return vercelForwarded.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}

// Geolocation via ip-api.com (free, 45 req/min)
async function getGeoLocation(ip: string): Promise<{ country: string; city: string }> {
  // Skip geolocation for local/private IPs
  if (ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'محلي (تطوير)', city: 'localhost' };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city&lang=ar`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    
    if (data.status === 'success') {
      return {
        country: data.country || 'غير معروف',
        city: data.city || 'غير معروف',
      };
    }
  } catch {
    // Geolocation failed - non-critical
  }
  
  return { country: 'غير معروف', city: 'غير معروف' };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    // Check if IP is blocked
    const { data: blockedCheck } = await supabase
      .from('blocked_ips')
      .select('id')
      .eq('ip_address', ip)
      .maybeSingle();

    if (blockedCheck) {
      return NextResponse.json({ blocked: true }, { status: 403 });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { page, referrer, userId, userEmail } = body as {
      page?: string;
      referrer?: string;
      userId?: string;
      userEmail?: string;
    };

    // Parse User-Agent
    const userAgent = request.headers.get('user-agent') || '';
    const { device, browser, os } = parseUserAgent(userAgent);

    // Get geolocation
    const { country, city } = await getGeoLocation(ip);

    // Insert visitor log
    const { error } = await supabase.from('visitor_logs').insert({
      ip_address: ip,
      country,
      city,
      device_type: device,
      browser,
      os,
      user_agent: userAgent.substring(0, 500), // limit length
      user_id: userId || null,
      user_email: userEmail || null,
      page_visited: page || '/',
      referrer: referrer || null,
      is_blocked: false,
    });

    if (error) {
      console.error('Track visit error:', error.message);
      return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ip, country, city, device });
  } catch (err) {
    console.error('Track visit error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
