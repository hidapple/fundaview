export interface QuarterlyEps {
  fiscalYear: number;
  fiscalQuarter: number;
  eps: number;
  epsEstimate: number;
}

export interface AnnualEps {
  fiscalYear: number;
  eps: number;
}

export interface QuarterlyRevenue {
  fiscalYear: number;
  fiscalQuarter: number;
  revenue: number;
}

export interface AnnualRevenue {
  fiscalYear: number;
  revenue: number;
}

export interface EarningsData {
  symbol: string;
  marketCap: number | null;
  ipoDate: string | null;
  quarterly: QuarterlyEps[];
  annual: AnnualEps[];
  quarterlyRevenue: QuarterlyRevenue[];
  annualRevenue: AnnualRevenue[];
}

export interface SearchResult {
  symbol: string;
  name: string;
}

export interface Bookmark {
  symbol: string;
  name: string;
  group: string;
}
