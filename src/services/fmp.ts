import type { EarningsData, QuarterlyEps, AnnualEps, SearchResult } from '../types';
import { getCached, setCached } from './storage';

const BASE = '/api/fmp';

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `API error: ${response.status}`);
  }
  return JSON.parse(text);
}

export async function searchSymbol(apiKey: string, query: string): Promise<SearchResult[]> {
  const json = await fetchJson(
    `${BASE}/stable/search-symbol?query=${encodeURIComponent(query)}&apikey=${encodeURIComponent(apiKey)}`,
  );

  const data = json as Record<string, unknown>[];
  if (!Array.isArray(data)) return [];

  return data
    .filter((d) => {
      const exchange = String(d.exchangeShortName ?? d.exchange ?? '');
      return exchange === 'NASDAQ' || exchange === 'NYSE' || exchange === 'AMEX';
    })
    .slice(0, 10)
    .map((d) => ({
      symbol: String(d.symbol ?? ''),
      name: String(d.name ?? d.companyName ?? ''),
    }));
}

interface FmpIncomeStatement {
  [key: string]: unknown;
}

function getEps(row: FmpIncomeStatement): number {
  const v = row.epsdiluted ?? row.epsDiluted ?? row.eps ?? 0;
  return Math.round(Number(v) * 100) / 100;
}

function getPeriod(row: FmpIncomeStatement): string {
  return String(row.period ?? '');
}

function getYear(row: FmpIncomeStatement): number {
  const cy = row.calendarYear ?? row.calendar_year;
  if (cy) return parseInt(String(cy), 10);
  const date = String(row.date ?? '');
  return parseInt(date.split('-')[0], 10) || 0;
}

export async function getEarnings(apiKey: string, symbol: string): Promise<EarningsData> {
  const cacheKey = `fmp_earnings_v1_${symbol}`;
  const cached = getCached<EarningsData>(cacheKey);
  if (cached) return cached;

  const [annualJson, quarterlyJson] = await Promise.all([
    fetchJson(
      `${BASE}/stable/income-statement?symbol=${encodeURIComponent(symbol)}&period=annual&apikey=${encodeURIComponent(apiKey)}`,
    ),
    fetchJson(
      `${BASE}/stable/income-statement?symbol=${encodeURIComponent(symbol)}&period=quarter&apikey=${encodeURIComponent(apiKey)}`,
    ),
  ]);

  const annualData = annualJson as FmpIncomeStatement[];
  const quarterlyData = quarterlyJson as FmpIncomeStatement[];

  if (!Array.isArray(annualData) || !Array.isArray(quarterlyData)) {
    throw new Error('データが見つかりませんでした');
  }

  const annual: AnnualEps[] = annualData
    .filter((s) => getPeriod(s) === 'FY')
    .map((s) => ({
      fiscalYear: getYear(s),
      eps: getEps(s),
    }))
    .filter((a) => a.fiscalYear > 0);

  const quarterly: QuarterlyEps[] = quarterlyData
    .filter((s) => /^Q[1-4]$/.test(getPeriod(s)))
    .map((s) => ({
      fiscalYear: getYear(s),
      fiscalQuarter: parseInt(getPeriod(s).charAt(1), 10),
      eps: getEps(s),
      epsEstimate: 0,
    }))
    .filter((q) => q.fiscalYear > 0);

  annual.sort((a, b) => b.fiscalYear - a.fiscalYear);

  const data: EarningsData = { symbol, quarterly, annual };
  setCached(cacheKey, data);
  return data;
}
