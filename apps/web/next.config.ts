import type { NextConfig } from 'next';
import path from 'path';

/**
 * Content-Security-Policy for the Swyft web app.
 *
 * Policy rationale:
 *  - default-src 'self'        — deny everything not explicitly permitted
 *  - script-src  'self' 'unsafe-inline'
 *                              — Next.js inline scripts (hydration, font loader)
 *                                require 'unsafe-inline'; nonce-based CSP is not
 *                                yet wired to the Next.js runtime here.
 *  - style-src   'self' 'unsafe-inline'
 *                              — Tailwind CSS and Radix UI inject inline styles.
 *  - img-src     'self' data: blob: https:
 *                              — Token logos are fetched from third-party CDNs;
 *                                blob: is needed for canvas toDataURL exports.
 *  - font-src    'self' https://fonts.gstatic.com
 *                              — Geist font served via Google Fonts CDN.
 *  - connect-src 'self' <configured origins>
 *                              — Soroban RPC, Horizon, the API, and the
 *                                Swyft WebSocket feed only.
 *  - frame-ancestors 'none'   — Prevents the app from being iframed (clickjacking).
 *  - object-src  'none'       — Disallow Flash and similar plugins.
 *  - base-uri    'self'       — Prevent base-tag injection.
 */

/**
 * Returns the origin for http/https URLs using the WHATWG URL standard.
 * For ws/wss URLs, `.origin` returns the string `'null'` in Node/browsers
 * because ws: and wss: are not "special" schemes — so we rebuild the origin
 * manually from protocol + hostname + port.
 */
export function originOf(value: string | undefined, fallback: string): string {
  const raw = value || fallback;
  try {
    const url = new URL(raw);
    // ws: and wss: are not special schemes, so url.origin === 'null'.
    // Rebuild the origin explicitly for WebSocket URLs.
    if (url.protocol === 'ws:' || url.protocol === 'wss:') {
      const port = url.port ? `:${url.port}` : '';
      return `${url.protocol}//${url.hostname}${port}`;
    }
    return url.origin;
  } catch {
    try {
      const url = new URL(fallback);
      if (url.protocol === 'ws:' || url.protocol === 'wss:') {
        const port = url.port ? `:${url.port}` : '';
        return `${url.protocol}//${url.hostname}${port}`;
      }
      return url.origin;
    } catch {
      return fallback;
    }
  }
}

export function buildConnectSrc(env: {
  NEXT_PUBLIC_SOROBAN_RPC_URL?: string;
  NEXT_PUBLIC_HORIZON_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_WS_URL?: string;
  NEXT_PUBLIC_API_URL_TESTNET?: string;
  NEXT_PUBLIC_API_URL_PUBLIC?: string;
}): string[] {
  return [
    "'self'",
    originOf(env.NEXT_PUBLIC_SOROBAN_RPC_URL, 'https://soroban-testnet.stellar.org'),
    originOf(env.NEXT_PUBLIC_HORIZON_URL, 'https://horizon-testnet.stellar.org'),
    originOf(env.NEXT_PUBLIC_API_URL, 'http://localhost:3001'),
    originOf(env.NEXT_PUBLIC_WS_URL, 'ws://localhost:3001'),
    ...[env.NEXT_PUBLIC_API_URL_TESTNET, env.NEXT_PUBLIC_API_URL_PUBLIC]
      .filter(Boolean)
      .map((value) => originOf(value, 'http://localhost:3001')),
  ].filter((value, index, values) => values.indexOf(value) === index);
}

const connectSrc = buildConnectSrc({
  NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
  NEXT_PUBLIC_HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NEXT_PUBLIC_API_URL_TESTNET: process.env.NEXT_PUBLIC_API_URL_TESTNET,
  NEXT_PUBLIC_API_URL_PUBLIC: process.env.NEXT_PUBLIC_API_URL_PUBLIC,
});

export const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src ${connectSrc.join(' ')}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
]
  .join('; ')
  .trim();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '../..'),
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
