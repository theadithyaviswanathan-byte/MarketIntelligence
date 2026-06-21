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

import marketPulseData from "@/data/market-pulse.json";
import type {
  Direction,
  MarketPulseData,
  SignalStrength,
  SourceMixItem,
} from "@/lib/market-data";

const marketData = marketPulseData as MarketPulseData;
const { companies, evidence, themes } = marketData;

const sourceMixIcons = {
  "SEC filings": FileText,
  "News signals": Newspaper,
  "Company metrics": BarChart3,
} satisfies Record<SourceMixItem["label"], typeof FileText>;

const sourceMix = marketData.sourceMix.map((item) => ({
  ...item,
  icon: sourceMixIcons[item.label],
}));

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
  const generatedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(marketData.generatedAt));

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-700">
                <DatabaseZap className="h-4 w-4" />
                Cloud Software Market Pulse · EDGAR-backed snapshot
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
              <p className="mt-1 text-sm text-zinc-600">Latest SEC filing excerpts</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Refresh window</span>
                <Clock3 className="h-4 w-4 text-indigo-700" />
              </div>
              <p className="mt-3 text-2xl font-semibold">Quarterly</p>
              <p className="mt-1 text-sm text-zinc-600">Generated {generatedDate}</p>
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
                      {item.url ? (
                        <a
                          className="mt-3 inline-flex text-sm font-medium text-teal-700 hover:text-teal-900"
                          href={item.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open SEC filing
                        </a>
                      ) : null}
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
