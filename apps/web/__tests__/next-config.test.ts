import nextConfig from '../next.config';
import { buildConnectSrc, originOf } from '../next.config';

describe('web security headers', () => {
  it('allows only the configured Horizon, RPC, API, and WebSocket origins', async () => {
    const [route] = await nextConfig.headers!();
    const csp = route.headers.find(
      ({ key }) => key === 'Content-Security-Policy',
    )?.value;

    expect(csp).toContain(
      "connect-src 'self' https://soroban-testnet.stellar.org https://horizon-testnet.stellar.org http://localhost:3001 ws://localhost:3001",
    );
    expect(csp).not.toContain("connect-src 'self' https: wss:");
  });
});

describe('originOf', () => {
  it('returns the correct origin for https URLs', () => {
    expect(originOf('https://api.example.com', 'https://fallback.example.com')).toBe(
      'https://api.example.com',
    );
  });

  it('returns ws origin correctly for ws:// URLs instead of the string "null"', () => {
    const result = originOf('ws://localhost:3001', 'ws://localhost:3001');
    expect(result).toBe('ws://localhost:3001');
    expect(result).not.toBe('null');
  });

  it('returns wss origin correctly for wss:// URLs instead of the string "null"', () => {
    const result = originOf('wss://api.swyft.example', 'ws://localhost:3001');
    expect(result).toBe('wss://api.swyft.example');
    expect(result).not.toBe('null');
  });

  it('uses the fallback ws origin when value is undefined', () => {
    const result = originOf(undefined, 'ws://localhost:3001');
    expect(result).toBe('ws://localhost:3001');
    expect(result).not.toBe('null');
  });
});

describe('buildConnectSrc', () => {
  it('contains wss origin and not "null" when NEXT_PUBLIC_WS_URL is a wss:// URL', () => {
    const src = buildConnectSrc({
      NEXT_PUBLIC_WS_URL: 'wss://api.swyft.example',
    });
    expect(src).toContain('wss://api.swyft.example');
    expect(src).not.toContain('null');
  });

  it('contains the ws fallback origin and not "null" when NEXT_PUBLIC_WS_URL is unset', () => {
    const src = buildConnectSrc({});
    expect(src).toContain('ws://localhost:3001');
    expect(src).not.toContain('null');
  });

  it('deduplicates origins', () => {
    const src = buildConnectSrc({
      NEXT_PUBLIC_API_URL: 'http://localhost:3001',
    });
    const count = src.filter((v) => v === 'http://localhost:3001').length;
    expect(count).toBe(1);
  });
});
