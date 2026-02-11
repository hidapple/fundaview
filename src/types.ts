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

export interface EarningsData {
  symbol: string;
  quarterly: QuarterlyEps[];
  annual: AnnualEps[];
}

export interface SearchResult {
  symbol: string;
  name: string;
}

export interface Bookmark {
  symbol: string;
  name: string;
}
