import type {
  EarningsData,
  QuarterlyEps,
  AnnualEps,
  QuarterlyRevenue,
  AnnualRevenue,
  SearchResult,
} from '../types';
import { getCached, setCached } from './storage';

const BASE = import.meta.env.DEV ? '/api/fmp' : 'https://financialmodelingprep.com';
const ANNUAL_LIMIT = 30;
const QUARTERLY_LIMIT = 120;

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

interface FmpProfile {
  [key: string]: unknown;
}

function parseMarketCap(value: unknown): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num);
}

function parseIpoDate(value: unknown): string | null {
  const str = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  return str;
}

function getMarketCap(profileJson: unknown): number | null {
  if (Array.isArray(profileJson)) {
    const profile = (profileJson[0] ?? null) as FmpProfile | null;
    if (!profile) return null;
    return parseMarketCap(profile.marketCap ?? profile.mktCap);
  }
  if (profileJson && typeof profileJson === 'object') {
    const profile = profileJson as FmpProfile;
    return parseMarketCap(profile.marketCap ?? profile.mktCap);
  }
  return null;
}

function getIpoDate(profileJson: unknown): string | null {
  if (Array.isArray(profileJson)) {
    const profile = (profileJson[0] ?? null) as FmpProfile | null;
    if (!profile) return null;
    return parseIpoDate(profile.ipoDate);
  }
  if (profileJson && typeof profileJson === 'object') {
    const profile = profileJson as FmpProfile;
    return parseIpoDate(profile.ipoDate);
  }
  return null;
}

function getEps(row: FmpIncomeStatement): number {
  const v = row.epsdiluted ?? row.epsDiluted ?? row.eps ?? 0;
  return Math.round(Number(v) * 100) / 100;
}

function getRevenue(row: FmpIncomeStatement): number {
  const v = row.revenue ?? 0;
  const num = Number(v);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num);
}

function getPeriod(row: FmpIncomeStatement): string {
  return String(row.period ?? '');
}

function getYear(row: FmpIncomeStatement): number {
  const fy = row.fiscalYear ?? row.fiscal_year;
  if (fy) return parseInt(String(fy), 10);
  const cy = row.calendarYear ?? row.calendar_year;
  if (cy) return parseInt(String(cy), 10);
  const date = String(row.date ?? '');
  return parseInt(date.split('-')[0], 10) || 0;
}

export async function getEarnings(apiKey: string, symbol: string): Promise<EarningsData> {
  const cacheKey = `fmp_earnings_v5_${symbol}`;
  const cached = getCached<EarningsData>(cacheKey);
  if (cached) return cached;

  const [annualJson, quarterlyJson, profileJson] = await Promise.all([
    fetchJson(
      `${BASE}/stable/income-statement?symbol=${encodeURIComponent(symbol)}&period=annual&limit=${ANNUAL_LIMIT}&apikey=${encodeURIComponent(apiKey)}`,
    ),
    fetchJson(
      `${BASE}/stable/income-statement?symbol=${encodeURIComponent(symbol)}&period=quarter&limit=${QUARTERLY_LIMIT}&apikey=${encodeURIComponent(apiKey)}`,
    ),
    fetchJson(
      `${BASE}/stable/profile?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`,
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

  const annualRevenue: AnnualRevenue[] = annualData
    .filter((s) => getPeriod(s) === 'FY')
    .map((s) => ({
      fiscalYear: getYear(s),
      revenue: getRevenue(s),
    }))
    .filter((r) => r.fiscalYear > 0);

  const quarterlyRevenue: QuarterlyRevenue[] = quarterlyData
    .filter((s) => /^Q[1-4]$/.test(getPeriod(s)))
    .map((s) => ({
      fiscalYear: getYear(s),
      fiscalQuarter: parseInt(getPeriod(s).charAt(1), 10),
      revenue: getRevenue(s),
    }))
    .filter((r) => r.fiscalYear > 0);

  annualRevenue.sort((a, b) => b.fiscalYear - a.fiscalYear);

  const data: EarningsData = {
    symbol,
    marketCap: getMarketCap(profileJson),
    ipoDate: getIpoDate(profileJson),
    quarterly,
    annual,
    quarterlyRevenue,
    annualRevenue,
  };
  setCached(cacheKey, data);
  return data;
}
