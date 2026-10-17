import { describe, it, expect } from 'vitest';
import { getRangeSides } from '@/lib/range-sides';

// lowerTick=-1000 → price ≈ 0.9048, upperTick=1000 → price ≈ 1.1052
const LOWER_TICK = -1000;
const UPPER_TICK = 1000;

describe('getRangeSides', () => {
  it('returns token0Only=true when price is strictly below the range', () => {
    // tickToPrice(-1000) ≈ 0.9048 — use a price lower than that
    const { token0Only, token1Only, invalid } = getRangeSides({
      currentPrice: 0.5,
      lowerTick: LOWER_TICK,
      upperTick: UPPER_TICK,
    });
    expect(token0Only).toBe(true);
    expect(token1Only).toBe(false);
    expect(invalid).toBe(false);
  });

  it('returns token1Only=true when price is strictly above the range', () => {
    // tickToPrice(1000) ≈ 1.1052 — use a price higher than that
    const { token0Only, token1Only, invalid } = getRangeSides({
      currentPrice: 2.0,
      lowerTick: LOWER_TICK,
      upperTick: UPPER_TICK,
    });
    expect(token0Only).toBe(false);
    expect(token1Only).toBe(true);
    expect(invalid).toBe(false);
  });

  it('returns both false when price is inside the range', () => {
    const { token0Only, token1Only, invalid } = getRangeSides({
      currentPrice: 1.0,
      lowerTick: LOWER_TICK,
      upperTick: UPPER_TICK,
    });
    expect(token0Only).toBe(false);
    expect(token1Only).toBe(false);
    expect(invalid).toBe(false);
  });

  it('returns both false when currentPrice is 0', () => {
    const { token0Only, token1Only } = getRangeSides({
      currentPrice: 0,
      lowerTick: LOWER_TICK,
      upperTick: UPPER_TICK,
    });
    expect(token0Only).toBe(false);
    expect(token1Only).toBe(false);
  });

  it('returns both false when currentPrice is undefined', () => {
    const { token0Only, token1Only } = getRangeSides({
      currentPrice: undefined,
      lowerTick: LOWER_TICK,
      upperTick: UPPER_TICK,
    });
    expect(token0Only).toBe(false);
    expect(token1Only).toBe(false);
  });

  it('returns both false when currentPrice is NaN', () => {
    const { token0Only, token1Only } = getRangeSides({
      currentPrice: NaN,
      lowerTick: LOWER_TICK,
      upperTick: UPPER_TICK,
    });
    expect(token0Only).toBe(false);
    expect(token1Only).toBe(false);
  });

  it('returns both false when currentPrice is Infinity', () => {
    const { token0Only, token1Only } = getRangeSides({
      currentPrice: Infinity,
      lowerTick: LOWER_TICK,
      upperTick: UPPER_TICK,
    });
    expect(token0Only).toBe(false);
    expect(token1Only).toBe(false);
  });

  it('reports invalid=true and both false when lowerTick >= upperTick (inverted range)', () => {
    const { token0Only, token1Only, invalid } = getRangeSides({
      currentPrice: 1.0,
      lowerTick: 1000,
      upperTick: -1000,
    });
    expect(token0Only).toBe(false);
    expect(token1Only).toBe(false);
    expect(invalid).toBe(true);
  });

  it('reports invalid=true when lowerTick === upperTick', () => {
    const { invalid } = getRangeSides({
      currentPrice: 1.0,
      lowerTick: 0,
      upperTick: 0,
    });
    expect(invalid).toBe(true);
  });
});
