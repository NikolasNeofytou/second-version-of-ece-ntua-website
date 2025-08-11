import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// --- Lightweight in-memory rate limiter (ephemeral per runtime instance) ---
// For production use a durable store (Redis/Upstash). This is a best-effort guard.
const rateLimitConfig: Record<string, { limit: number; windowMs: number }> = {
  '/api/profile/username/availability': { limit: 30, windowMs: 60_000 }, // 30 / min
  '/api/profile/setup': { limit: 5, windowMs: 60_000 } // 5 / min
};

declare global {
  // Using var to attach to globalThis across module reloads in dev
  var __rlStore: Map<string, number[]> | undefined;
}
const rlStore: Map<string, number[]> = globalThis.__rlStore || new Map<string, number[]>();
if (!globalThis.__rlStore) globalThis.__rlStore = rlStore;

interface RateLimitResult {
  response?: NextResponse;
  headers?: Record<string, string>;
}

function rateLimit(req: NextRequest): RateLimitResult {
  const pathname = req.nextUrl.pathname;
  const cfg = rateLimitConfig[pathname];
  if (!cfg) return {};

  const ipHeader = req.headers.get('x-forwarded-for') || '';
  const ip = ipHeader.split(',')[0].trim() || 'unknown';
  const key = `${pathname}:${ip}`;

  const now = Date.now();
  const windowStart = now - cfg.windowMs;
  const arr = rlStore.get(key) || [];
  const recent = arr.filter(ts => ts > windowStart);

  if (recent.length >= cfg.limit) {
    const retryAfterSec = Math.ceil((recent[0] + cfg.windowMs - now) / 1000);
    return {
      response: new NextResponse(
        JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } }),
        {
          status: 429,
          headers: {
            'content-type': 'application/json',
            'retry-after': retryAfterSec.toString(),
            'x-rate-limit-limit': cfg.limit.toString(),
            'x-rate-limit-remaining': '0'
          }
        }
      )
    };
  }

  recent.push(now);
  rlStore.set(key, recent);
  const remaining = Math.max(cfg.limit - recent.length, 0);
  return {
    headers: {
      'x-rate-limit-limit': cfg.limit.toString(),
      'x-rate-limit-remaining': remaining.toString()
    }
  };
}

function applyRateHeaders(res: NextResponse, headers?: Record<string, string>) {
  if (!headers) return res;
  for (const [k, v] of Object.entries(headers)) {
    res.headers.set(k, v);
  }
  return res;
}

// Redirect users without onboarding completed to setup page (except allowed paths)
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Rate limiting for selected API endpoints
  const { response: rlBlocked, headers: rlHeaders } = rateLimit(req);
  if (rlBlocked) return rlBlocked;

  // Allow assets & public files
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname.startsWith('/public')) {
    return applyRateHeaders(NextResponse.next(), rlHeaders);
  }

  const token = await getToken({ req });
  if (!token) return applyRateHeaders(NextResponse.next(), rlHeaders);

  const { onboardingCompleted } = token as { onboardingCompleted?: boolean };

  // Allow authentication + onboarding endpoints regardless of completion state
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    pathname === '/profile/setup' ||
    pathname.startsWith('/api/profile/setup') ||
    pathname.startsWith('/api/profile/username/availability')
  ) {
    return applyRateHeaders(NextResponse.next(), rlHeaders);
  }

  if (onboardingCompleted) {
    return applyRateHeaders(NextResponse.next(), rlHeaders);
  }

  const url = req.nextUrl.clone();
  url.pathname = '/profile/setup';
  return applyRateHeaders(NextResponse.redirect(url), rlHeaders);
}

export const config = { matcher: ['/((?!_next|favicon.ico).*)'] };
