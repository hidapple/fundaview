import { useEffect, useState } from 'react';
import type { EarningsData } from '../types';
import { getEarnings } from '../services/fmp';

export function useEarnings(apiKey: string | null, symbol: string | null): {
  data: EarningsData | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey || !symbol) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getEarnings(apiKey, symbol)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch earnings data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, symbol]);

  return { data, loading, error };
}
