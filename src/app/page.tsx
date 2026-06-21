"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DatabaseZap,
  FileText,
  Filter,
  LineChart,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

type Direction = "up" | "flat" | "down";
type SignalStrength = 0 | 1 | 2 | 3 | 4 | 5;

type Theme = {
  id: string;
  label: string;
  description: string;
  momentum: Direction;
  strength: SignalStrength;
  companies: number;
};

type Company = {
  name: string;
  ticker: string;
  segment: string;
  filing: string;
  period: string;
  pulse: string;
  risk: string;
  metric: string;
  signals: Record<string, SignalStrength>;
};

type Evidence = {
  company: string;
  ticker: string;
  theme: string;
  source: "10-K" | "10-Q" | "News";
  date: string;
  excerpt: string;
  read: Direction;
  confidence: "High" | "Medium";
};

const themes: Theme[] = [
  {
    id: "ai-monetization",
    label: "AI monetization",
    description: "Commercial lift from AI products, agents, copilots, and infrastructure attach.",
    momentum: "up",
    strength: 5,
    companies: 7,
  },
  {
    id: "cloud-migration",
    label: "Cloud migration",
    description: "Demand for workloads moving from owned infrastructure to cloud platforms.",
    momentum: "up",
    strength: 4,
    companies: 6,
  },
  {
    id: "budget-scrutiny",
    label: "Budget scrutiny",
    description: "Enterprise optimization, slower approvals, and pressure on consumption.",
    momentum: "flat",
    strength: 3,
    companies: 5,
  },
  {
    id: "net-retention",
    label: "Net retention",
    description: "Expansion, churn, seat growth, and workload growth inside existing accounts.",
    momentum: "down",
    strength: 3,
    companies: 4,
  },
  {
    id: "margin-discipline",
    label: "Margin discipline",
    description: "Operating leverage, hiring restraint, infrastructure efficiency, and cost control.",
    momentum: "up",
    strength: 4,
    companies: 8,
  },
  {
    id: "pricing-competition",
    label: "Pricing pressure",
    description: "Competitive discounting, bundled AI features, and platform substitution risk.",
    momentum: "up",
    strength: 3,
    companies: 5,
  },
];

const companies: Company[] = [
  {
    name: "Microsoft",
    ticker: "MSFT",
    segment: "Hyperscaler / productivity",
    filing: "Latest 10-Q",
    period: "FY26 Q3",
    pulse: "AI attach across Azure and Copilot is becoming the clearest cross-segment growth story.",
    risk: "Capacity expansion and competitive bundling could pressure near-term margins.",
    metric: "Azure + AI demand",
    signals: {
      "ai-monetization": 5,
      "cloud-migration": 5,
      "budget-scrutiny": 2,
      "net-retention": 4,
      "margin-discipline": 4,
      "pricing-competition": 3,
    },
  },
  {
    name: "Amazon",
    ticker: "AMZN",
    segment: "Hyperscaler / marketplace",
    filing: "Latest 10-Q",
    period: "FY26 Q1",
    pulse: "AWS demand is recovering as optimization pressure normalizes and AI workloads ramp.",
    risk: "Large AI infrastructure spend raises utilization and depreciation sensitivity.",
    metric: "AWS operating leverage",
    signals: {
      "ai-monetization": 4,
      "cloud-migration": 5,
      "budget-scrutiny": 3,
      "net-retention": 3,
      "margin-discipline": 5,
      "pricing-competition": 3,
    },
  },
  {
    name: "Alphabet",
    ticker: "GOOGL",
    segment: "Hyperscaler / ads",
    filing: "Latest 10-Q",
    period: "FY26 Q1",
    pulse: "Google Cloud is leaning on AI model access, data tooling, and security to win platform spend.",
    risk: "AI search costs and cloud capex remain central watch items.",
    metric: "Cloud AI adoption",
    signals: {
      "ai-monetization": 5,
      "cloud-migration": 4,
      "budget-scrutiny": 2,
      "net-retention": 3,
      "margin-discipline": 4,
      "pricing-competition": 4,
    },
  },
  {
    name: "Oracle",
    ticker: "ORCL",
    segment: "Database / cloud infrastructure",
    filing: "Latest 10-K",
    period: "FY26",
    pulse: "Cloud infrastructure and database modernization are driving stronger enterprise relevance.",
    risk: "Growth depends on continued execution in a market dominated by larger hyperscalers.",
    metric: "OCI backlog",
    signals: {
      "ai-monetization": 4,
      "cloud-migration": 4,
      "budget-scrutiny": 2,
      "net-retention": 4,
      "margin-discipline": 4,
      "pricing-competition": 3,
    },
  },
  {
    name: "Salesforce",
    ticker: "CRM",
    segment: "Enterprise applications",
    filing: "Latest 10-Q",
    period: "FY26 Q1",
    pulse: "AI agents are shifting the narrative from seat expansion to workflow automation.",
    risk: "Customer budget scrutiny still affects large transformation deals.",
    metric: "Agentic CRM pipeline",
    signals: {
      "ai-monetization": 4,
      "cloud-migration": 2,
      "budget-scrutiny": 4,
      "net-retention": 3,
      "margin-discipline": 5,
      "pricing-competition": 4,
    },
  },
  {
    name: "ServiceNow",
    ticker: "NOW",
    segment: "Workflow automation",
    filing: "Latest 10-Q",
    period: "FY26 Q1",
    pulse: "AI workflow automation remains a strong enterprise budget priority.",
    risk: "Premium valuation depends on sustained expansion and platform consolidation wins.",
    metric: "Workflow AI adoption",
    signals: {
      "ai-monetization": 5,
      "cloud-migration": 2,
      "budget-scrutiny": 2,
      "net-retention": 5,
      "margin-discipline": 4,
      "pricing-competition": 2,
    },
  },
  {
    name: "Snowflake",
    ticker: "SNOW",
    segment: "Data cloud",
    filing: "Latest 10-Q",
    period: "FY26 Q1",
    pulse: "AI-ready data platforms are becoming the core growth narrative.",
    risk: "Consumption volatility and optimization cycles remain the main signal to watch.",
    metric: "Product revenue growth",
    signals: {
      "ai-monetization": 4,
      "cloud-migration": 3,
      "budget-scrutiny": 4,
      "net-retention": 3,
      "margin-discipline": 3,
      "pricing-competition": 3,
    },
  },
  {
    name: "Datadog",
    ticker: "DDOG",
    segment: "Observability / security",
    filing: "Latest 10-Q",
    period: "FY26 Q1",
    pulse: "Observability demand is tied to cloud complexity, AI workloads, and security consolidation.",
    risk: "Usage-based revenue can soften quickly when customers optimize spend.",
    metric: "Usage expansion",
    signals: {
      "ai-monetization": 3,
      "cloud-migration": 4,
      "budget-scrutiny": 4,
      "net-retention": 3,
      "margin-discipline": 4,
      "pricing-competition": 3,
    },
  },
];

const evidence: Evidence[] = [
  {
    company: "Microsoft",
    ticker: "MSFT",
    theme: "ai-monetization",
    source: "10-Q",
    date: "2026-04-24",
    excerpt:
      "Management language emphasizes AI services as a contributor to cloud demand, with capacity expansion called out as a gating factor.",
    read: "up",
    confidence: "High",
  },
  {
    company: "Amazon",
    ticker: "AMZN",
    theme: "cloud-migration",
    source: "10-Q",
    date: "2026-04-30",
    excerpt:
      "AWS commentary points to customers moving past optimization and restarting new workload commitments.",
    read: "up",
    confidence: "High",
  },
  {
    company: "Salesforce",
    ticker: "CRM",
    theme: "budget-scrutiny",
    source: "10-Q",
    date: "2026-05-28",
    excerpt:
      "Enterprise sales language still references measured buying behavior and elongated approval cycles for larger deals.",
    read: "flat",
    confidence: "Medium",
  },
  {
    company: "Snowflake",
    ticker: "SNOW",
    theme: "budget-scrutiny",
    source: "10-Q",
    date: "2026-05-21",
    excerpt:
      "Consumption trends remain healthy but management continues to separate new workload growth from customer optimization.",
    read: "flat",
    confidence: "Medium",
  },
  {
    company: "ServiceNow",
    ticker: "NOW",
    theme: "net-retention",
    source: "10-Q",
    date: "2026-04-23",
    excerpt:
      "Expansion language is concentrated around platform consolidation, workflow automation, and AI-assisted service operations.",
    read: "up",
    confidence: "High",
  },
  {
    company: "Datadog",
    ticker: "DDOG",
    theme: "pricing-competition",
    source: "News",
    date: "2026-06-12",
    excerpt:
      "Recent coverage frames observability budgets as consolidating around vendors that combine monitoring, security, and AI workload visibility.",
    read: "up",
    confidence: "Medium",
  },
  {
    company: "Oracle",
    ticker: "ORCL",
    theme: "cloud-migration",
    source: "10-K",
    date: "2026-06-10",
    excerpt:
      "Cloud infrastructure demand is described alongside database modernization and multi-cloud deployment patterns.",
    read: "up",
    confidence: "High",
  },
  {
    company: "Alphabet",
    ticker: "GOOGL",
    theme: "margin-discipline",
    source: "10-Q",
    date: "2026-04-25",
    excerpt:
      "Cloud profitability is positioned as improving while AI investment and infrastructure costs remain a central tradeoff.",
    read: "up",
    confidence: "High",
  },
];

const sourceMix = [
  { label: "SEC filings", value: 72, icon: FileText },
  { label: "News signals", value: 18, icon: Newspaper },
  { label: "Company metrics", value: 10, icon: BarChart3 },
];

const themeById = new Map(themes.map((theme) => [theme.id, theme]));

function directionIcon(direction: Direction) {
  if (direction === "up") return <ArrowUpRight className="h-4 w-4" />;
  if (direction === "down") return <ArrowDownRight className="h-4 w-4" />;
  return <ChevronRight className="h-4 w-4" />;
}

function directionClass(direction: Direction) {
  if (direction === "up") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (direction === "down") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function heatClass(value: SignalStrength) {
  const classes = {
    0: "bg-zinc-100 text-zinc-400",
    1: "bg-sky-50 text-sky-700",
    2: "bg-cyan-100 text-cyan-800",
    3: "bg-teal-200 text-teal-950",
    4: "bg-emerald-300 text-emerald-950",
    5: "bg-lime-300 text-lime-950",
  };

  return classes[value];
}

function SignalBadge({
  direction,
  label,
}: {
  direction: Direction;
  label: string;
}) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-sm font-medium ${directionClass(
        direction,
      )}`}
    >
      {directionIcon(direction)}
      {label}
    </span>
  );
}

export default function Home() {
  const [activeCompany, setActiveCompany] = useState("All");
  const [activeTheme, setActiveTheme] = useState("All");

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const companyMatch = activeCompany === "All" || item.ticker === activeCompany;
      const themeMatch = activeTheme === "All" || item.theme === activeTheme;
      return companyMatch && themeMatch;
    });
  }, [activeCompany, activeTheme]);

  const visibleCompanies = useMemo(() => {
    if (activeCompany === "All") return companies;
    return companies.filter((company) => company.ticker === activeCompany);
  }, [activeCompany]);

  const strongestTheme = themes.reduce((top, theme) =>
    theme.strength > top.strength ? theme : top,
  );

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-700">
                <DatabaseZap className="h-4 w-4" />
                Cloud Software Market Pulse
              </div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
                Public-company trend monitor for cloud and software markets
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
                type="button"
              >
                <Search className="h-4 w-4" />
                Query
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
                type="button"
              >
                <FileText className="h-4 w-4" />
                Export brief
              </button>
            </div>
          </div>

          <section className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Peer set</span>
                <Building2 className="h-4 w-4 text-teal-700" />
              </div>
              <p className="mt-3 text-2xl font-semibold">{companies.length}</p>
              <p className="mt-1 text-sm text-zinc-600">Hyperscaler, SaaS, data, observability</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Top signal</span>
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold">{strongestTheme.label}</p>
              <p className="mt-1 text-sm text-zinc-600">{strongestTheme.companies} companies flagged</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Confidence</span>
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-3 text-2xl font-semibold">Source-backed</p>
              <p className="mt-1 text-sm text-zinc-600">SEC first, news as confirmation</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Refresh window</span>
                <Clock3 className="h-4 w-4 text-indigo-700" />
              </div>
              <p className="mt-3 text-2xl font-semibold">Quarterly</p>
              <p className="mt-1 text-sm text-zinc-600">Latest 10-K / 10-Q snapshot</p>
            </div>
          </section>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="min-w-0 space-y-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-800">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            <label className="text-xs font-semibold uppercase tracking-normal text-zinc-500">
              Company
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1">
              <button
                className={`rounded-md border px-3 py-2 text-left text-sm font-medium ${
                  activeCompany === "All"
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
                onClick={() => setActiveCompany("All")}
                type="button"
              >
                All companies
              </button>
              {companies.map((company) => (
                <button
                  className={`rounded-md border px-3 py-2 text-left text-sm font-medium ${
                    activeCompany === company.ticker
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                  key={company.ticker}
                  onClick={() => setActiveCompany(company.ticker)}
                  type="button"
                >
                  {company.ticker}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-normal text-zinc-500">
              Theme
            </label>
            <div className="mt-2 space-y-2">
              <button
                className={`w-full rounded-md border px-3 py-2 text-left text-sm font-medium ${
                  activeTheme === "All"
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
                onClick={() => setActiveTheme("All")}
                type="button"
              >
                All themes
              </button>
              {themes.map((theme) => (
                <button
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm font-medium ${
                    activeTheme === theme.id
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  type="button"
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              Source Mix
            </div>
            <div className="space-y-4">
              {sourceMix.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-zinc-700">
                        <Icon className="h-4 w-4 text-zinc-500" />
                        {item.label}
                      </span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div
                        className="h-2 rounded-full bg-teal-600"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="grid gap-4 xl:grid-cols-3">
            {themes.slice(0, 3).map((theme) => (
              <article
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                key={theme.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Industry pulse</p>
                    <h2 className="mt-1 text-xl font-semibold">{theme.label}</h2>
                  </div>
                  <SignalBadge
                    direction={theme.momentum}
                    label={theme.momentum === "up" ? "Rising" : theme.momentum === "down" ? "Cooling" : "Mixed"}
                  />
                </div>
                <p className="mt-4 min-h-16 text-sm leading-6 text-zinc-600">{theme.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <span className="text-sm text-zinc-500">Signal strength</span>
                  <span className="text-lg font-semibold">{theme.strength}/5</span>
                </div>
              </article>
            ))}
          </section>

          <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
                  <LineChart className="h-4 w-4" />
                  Trend Heatmap
                </div>
                <h2 className="mt-1 text-2xl font-semibold">Company signals by theme</h2>
              </div>
              <SignalBadge direction="up" label="AI led" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-normal text-zinc-500">
                    <th className="w-56 px-5 py-3">Company</th>
                    {themes.map((theme) => (
                      <th className="px-3 py-3" key={theme.id}>
                        {theme.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleCompanies.map((company) => (
                    <tr className="border-b border-zinc-100 last:border-b-0" key={company.ticker}>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-zinc-950">{company.name}</div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {company.ticker} · {company.segment}
                        </div>
                      </td>
                      {themes.map((theme) => {
                        const value = company.signals[theme.id] ?? 0;
                        return (
                          <td className="px-3 py-4" key={theme.id}>
                            <button
                              className={`flex h-10 w-14 items-center justify-center rounded-md text-sm font-semibold ${heatClass(
                                value,
                              )}`}
                              onClick={() => {
                                setActiveCompany(company.ticker);
                                setActiveTheme(theme.id);
                              }}
                              title={`${company.name}: ${theme.label}`}
                              type="button"
                            >
                              {value}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {visibleCompanies.slice(0, 4).map((company) => (
              <article
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                key={company.ticker}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      {company.ticker} · {company.filing} · {company.period}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">{company.name}</h2>
                  </div>
                  <span className="inline-flex h-8 items-center rounded-md bg-cyan-50 px-2.5 text-sm font-medium text-cyan-800">
                    {company.metric}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-700">{company.pulse}</p>
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  {company.risk}
                </div>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
                  <TrendingUp className="h-4 w-4" />
                  Evidence Feed
                </div>
                <h2 className="mt-1 text-2xl font-semibold">Signals behind the readout</h2>
              </div>
              <span className="text-sm font-medium text-zinc-500">
                {filteredEvidence.length} matching items
              </span>
            </div>
            <div className="divide-y divide-zinc-100">
              {filteredEvidence.map((item) => {
                const theme = themeById.get(item.theme);
                return (
                  <article className="grid gap-3 p-5 lg:grid-cols-[180px_1fr_110px]" key={`${item.ticker}-${item.theme}-${item.date}`}>
                    <div>
                      <p className="font-semibold text-zinc-950">{item.company}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {item.source} · {item.date}
                      </p>
                    </div>
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                          {theme?.label ?? item.theme}
                        </span>
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          {item.confidence}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-zinc-700">{item.excerpt}</p>
                    </div>
                    <div className="lg:text-right">
                      <SignalBadge
                        direction={item.read}
                        label={item.read === "up" ? "Up" : item.read === "down" ? "Down" : "Mixed"}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
