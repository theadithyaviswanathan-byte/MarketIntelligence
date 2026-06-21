export type Direction = "up" | "flat" | "down";
export type SignalStrength = 0 | 1 | 2 | 3 | 4 | 5;

export type Theme = {
  id: string;
  label: string;
  description: string;
  momentum: Direction;
  strength: SignalStrength;
  companies: number;
};

export type Company = {
  name: string;
  ticker: string;
  cik?: string;
  segment: string;
  filing: string;
  period: string;
  filingDate?: string;
  filingUrl?: string;
  pulse: string;
  risk: string;
  metric: string;
  signals: Record<string, SignalStrength>;
};

export type Evidence = {
  company: string;
  ticker: string;
  theme: string;
  source: "10-K" | "10-Q" | "News";
  date: string;
  excerpt: string;
  read: Direction;
  confidence: "High" | "Medium";
  url?: string;
};

export type SourceMixItem = {
  label: "SEC filings" | "News signals" | "Company metrics";
  value: number;
};

export type MarketPulseData = {
  generatedAt: string;
  sourceMix: SourceMixItem[];
  themes: Theme[];
  companies: Company[];
  evidence: Evidence[];
};
