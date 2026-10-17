/**
 * Smoke-test: verifies that jest-dom matchers are available (i.e. the
 * setupFiles in vitest.config.ts correctly loads src/__tests__/setup.ts)
 * and that a rendered component can be asserted with toBeInTheDocument.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceImpactBadge } from '../PriceImpactBadge';

describe('PriceImpactBadge (jest-dom setup verification)', () => {
  it('renders a low-impact badge in the document', () => {
    render(<PriceImpactBadge impact={0.5} />);
    const badge = screen.getByText('0.50%');
    expect(badge).toBeInTheDocument();
  });

  it('renders a medium-impact badge in the document', () => {
    render(<PriceImpactBadge impact={2} />);
    const badge = screen.getByText('2.00%');
    expect(badge).toBeInTheDocument();
  });

  it('renders a high-impact badge in the document', () => {
    render(<PriceImpactBadge impact={10} />);
    const badge = screen.getByText('10.00%');
    expect(badge).toBeInTheDocument();
  });
});
