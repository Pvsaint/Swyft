/**
 * Pure helper that decides which token input should be single-sided
 * in the AddLiquidity UI based on the current pool price and tick range.
 *
 * Rules:
 *  - If currentPrice is not a positive finite number → both false (no lock).
 *  - If the range is inverted (lowerTick >= upperTick) → invalid, both false.
 *  - Price strictly below the lower bound → token0Only (only token0 needed).
 *  - Price strictly above the upper bound → token1Only (only token1 needed).
 *  - Price within range → both false (two-sided deposit).
 */

import { tickToPrice } from '@/hooks/useAddLiquidity';

export interface RangeSides {
  token0Only: boolean;
  token1Only: boolean;
  /** True when the range itself is invalid (lowerTick >= upperTick). */
  invalid: boolean;
}

export function getRangeSides({
  currentPrice,
  lowerTick,
  upperTick,
}: {
  currentPrice: number | undefined | null;
  lowerTick: number;
  upperTick: number;
}): RangeSides {
  // Guard: price must be a positive finite number.
  if (
    currentPrice == null ||
    !Number.isFinite(currentPrice) ||
    currentPrice <= 0
  ) {
    return { token0Only: false, token1Only: false, invalid: false };
  }

  // Guard: range must be valid (lower strictly less than upper).
  if (lowerTick >= upperTick) {
    return { token0Only: false, token1Only: false, invalid: true };
  }

  const lp = tickToPrice(lowerTick);
  const up = tickToPrice(upperTick);

  return {
    token0Only: currentPrice < lp,
    token1Only: currentPrice > up,
    invalid: false,
  };
}
