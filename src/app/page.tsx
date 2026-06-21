"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  DatabaseZap,
  Download,
  ExternalLink,
  FileText,
  Layers3,
  LineChart,
  Newspaper,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import marketPulseData from "@/data/market-pulse.json";
import type {
  Company,
  Direction,
  Evidence,
  MarketPulseData,
  SignalStrength,
  SourceMixItem,
  Theme,
} from "@/lib/market-data";

type ViewMode = "overview" | "companies" | "evidence";

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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function evidenceKey(item: Evidence) {
  return `${item.ticker}-${item.theme}-${item.date}-${item.excerpt.slice(0, 24)}`;
}

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

function heatClass(value: SignalStrength, selected: boolean) {
  if (selected) return "bg-zinc-950 text-white ring-2 ring-zinc-950 ring-offset-2";

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

function scoreLabel(value: number) {
  if (value >= 5) return "Very strong";
  if (value >= 4) return "Strong";
  if (value >= 3) return "Moderate";
  if (value >= 2) return "Emerging";
  return "Light";
}

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewMode>("overview");
  const [activeCompany, setActiveCompany] = useState("All");
  const [activeTheme, setActiveTheme] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedEvidenceKey, setSelectedEvidenceKey] = useState("");

  const generatedDate = formatDate(marketData.generatedAt);
  const strongestTheme = themes.reduce((top, theme) =>
    theme.strength > top.strength ? theme : top,
  );

  const selectedTheme = activeTheme === "All" ? strongestTheme : themeById.get(activeTheme) ?? strongestTheme;
  const selectedCompany =
    activeCompany === "All"
      ? companies.reduce((top, company) =>
          (company.signals[selectedTheme.id] ?? 0) > (top.signals[selectedTheme.id] ?? 0)
            ? company
            : top,
        )
      : companies.find((company) => company.ticker === activeCompany) ?? companies[0];

  const filteredCompanies = useMemo(() => {
    if (!query.trim()) return companies;
    return companies.filter((company) =>
      matchesQuery(`${company.name} ${company.ticker} ${company.segment} ${company.pulse}`, query),
    );
  }, [query]);

  const rankedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      return (b.signals[selectedTheme.id] ?? 0) - (a.signals[selectedTheme.id] ?? 0);
    });
  }, [filteredCompanies, selectedTheme.id]);

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const companyMatch = activeCompany === "All" || item.ticker === activeCompany;
      const themeMatch = activeTheme === "All" || item.theme === activeTheme;
      const theme = themeById.get(item.theme);
      const queryMatch =
        !query.trim() ||
        matchesQuery(
          `${item.company} ${item.ticker} ${theme?.label ?? item.theme} ${item.source} ${item.excerpt}`,
          query,
        );

      return companyMatch && themeMatch && queryMatch;
    });
  }, [activeCompany, activeTheme, query]);

  const selectedEvidence =
    filteredEvidence.find((item) => evidenceKey(item) === selectedEvidenceKey) ?? filteredEvidence[0];

  const selectedCompanyEvidence = evidence.filter((item) => item.ticker === selectedCompany.ticker);
  const selectedThemeEvidence = evidence.filter((item) => item.theme === selectedTheme.id);
  const activeScore = selectedCompany.signals[selectedTheme.id] ?? 0;

  function selectCell(company: Company, theme: Theme) {
    setActiveCompany(company.ticker);
    setActiveTheme(theme.id);
    setActiveView("evidence");
    const matchingEvidence = evidence.find(
      (item) => item.ticker === company.ticker && item.theme === theme.id,
    );
    if (matchingEvidence) setSelectedEvidenceKey(evidenceKey(matchingEvidence));
  }

  function clearFilters() {
    setActiveCompany("All");
    setActiveTheme("All");
    setQuery("");
    setSelectedEvidenceKey("");
  }

  function downloadBrief() {
    const lines = [
      "Cloud Software Market Pulse",
      `Generated: ${generatedDate}`,
      `Focus company: ${activeCompany === "All" ? "All companies" : selectedCompany.name}`,
      `Focus theme: ${activeTheme === "All" ? "All themes" : selectedTheme.label}`,
      "",
      `Top industry signal: ${strongestTheme.label} (${strongestTheme.strength}/5)`,
      `Selected score: ${selectedCompany.ticker} / ${selectedTheme.label} = ${activeScore}/5`,
      "",
      "Evidence:",
      ...filteredEvidence.slice(0, 8).map((item) => {
        const theme = themeById.get(item.theme);
        return `- ${item.company} ${item.source} ${item.date} / ${theme?.label ?? item.theme}: ${item.excerpt}`;
      }),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cloud-software-market-pulse-brief.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const views: Array<{ id: ViewMode; label: string; icon: typeof LineChart }> = [
    { id: "overview", label: "Overview", icon: LineChart },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "evidence", label: "Evidence", icon: FileText },
  ];

  return (
    <main className="min-h-screen bg-[#f4f5f1] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-700">
                <DatabaseZap className="h-4 w-4" />
                Cloud Software Market Pulse · EDGAR-backed snapshot
              </div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
                Interactive trend intelligence for cloud and software markets
              </h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  className="h-10 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-9 text-sm text-zinc-900 shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search companies, themes, excerpts"
                  type="search"
                  value={query}
                />
                {query ? (
                  <button
                    className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
                    onClick={() => setQuery("")}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
                onClick={downloadBrief}
                type="button"
              >
                <Download className="h-4 w-4" />
                Export brief
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
              {views.map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium sm:flex-none ${
                      activeView === view.id
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-600 hover:bg-white/70"
                    }`}
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {view.label}
                  </button>
                );
              })}
            </nav>
            <div className="flex flex-wrap gap-2 text-sm">
              <SignalBadge
                direction={strongestTheme.momentum}
                label={`${strongestTheme.label} ${strongestTheme.strength}/5`}
              />
              <span className="inline-flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 font-medium text-zinc-600">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Generated {generatedDate}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
        <aside className="min-w-0 space-y-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                <SlidersHorizontal className="h-4 w-4" />
                Controls
              </div>
              <button
                className="text-sm font-medium text-teal-700 hover:text-teal-900"
                onClick={clearFilters}
                type="button"
              >
                Reset
              </button>
            </div>

            <label className="text-xs font-semibold uppercase tracking-normal text-zinc-500">
              Company
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                className={`rounded-md border px-3 py-2 text-left text-sm font-medium ${
                  activeCompany === "All"
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
                onClick={() => setActiveCompany("All")}
                type="button"
              >
                All
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
                  className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm font-medium ${
                    activeTheme === theme.id
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  type="button"
                >
                  <span>{theme.label}</span>
                  <span>{theme.strength}/5</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800">
              <Target className="h-4 w-4 text-indigo-700" />
              Active Focus
            </div>
            <p className="text-xl font-semibold">{selectedCompany.name}</p>
            <p className="mt-1 text-sm text-zinc-500">{selectedCompany.segment}</p>
            <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-600">{selectedTheme.label}</span>
                <span className="font-semibold">{activeScore}/5</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-zinc-200">
                <div
                  className="h-2 rounded-full bg-teal-600"
                  style={{ width: `${activeScore * 20}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-zinc-600">{scoreLabel(activeScore)}</p>
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
          <section className="grid gap-3 md:grid-cols-4">
            <MetricTile icon={Building2} label="Peer set" value={companies.length} detail="Cloud/software names" />
            <MetricTile icon={Sparkles} label="Top signal" value={strongestTheme.label} detail={`${strongestTheme.companies} companies flagged`} />
            <MetricTile icon={FileText} label="Evidence" value={filteredEvidence.length} detail="Matching excerpts" />
            <MetricTile icon={Layers3} label="Filing mode" value="10-K / 10-Q" detail="Latest EDGAR snapshot" />
          </section>

          {activeView === "overview" ? (
            <>
              <section className="grid gap-4 xl:grid-cols-3">
                {themes.slice(0, 3).map((theme) => (
                  <button
                    className={`rounded-lg border bg-white p-5 text-left shadow-sm hover:border-teal-300 ${
                      activeTheme === theme.id ? "border-zinc-950" : "border-zinc-200"
                    }`}
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Industry pulse</p>
                        <h2 className="mt-1 text-xl font-semibold">{theme.label}</h2>
                      </div>
                      <SignalBadge
                        direction={theme.momentum}
                        label={
                          theme.momentum === "up"
                            ? "Rising"
                            : theme.momentum === "down"
                              ? "Cooling"
                              : "Mixed"
                        }
                      />
                    </div>
                    <p className="mt-4 min-h-16 text-sm leading-6 text-zinc-600">
                      {theme.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                      <span className="text-sm text-zinc-500">Signal strength</span>
                      <span className="text-lg font-semibold">{theme.strength}/5</span>
                    </div>
                  </button>
                ))}
              </section>

              <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
                <Heatmap
                  activeCompany={activeCompany}
                  activeTheme={activeTheme}
                  companies={filteredCompanies}
                  onCellClick={selectCell}
                  themes={themes}
                />
                <FocusPanel
                  activeScore={activeScore}
                  company={selectedCompany}
                  companyEvidence={selectedCompanyEvidence}
                  theme={selectedTheme}
                  themeEvidence={selectedThemeEvidence}
                />
              </section>
            </>
          ) : null}

          {activeView === "companies" ? (
            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-200 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
                    <Table2 className="h-4 w-4" />
                    Company Rank
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold">{selectedTheme.label}</h2>
                </div>
                <div className="divide-y divide-zinc-100">
                  {rankedCompanies.map((company, index) => {
                    const score = company.signals[selectedTheme.id] ?? 0;
                    return (
                      <button
                        className={`grid w-full grid-cols-[36px_1fr_64px] items-center gap-3 p-4 text-left hover:bg-zinc-50 ${
                          activeCompany === company.ticker ? "bg-teal-50" : ""
                        }`}
                        key={company.ticker}
                        onClick={() => setActiveCompany(company.ticker)}
                        type="button"
                      >
                        <span className="text-sm font-semibold text-zinc-500">#{index + 1}</span>
                        <span>
                          <span className="block font-semibold">{company.name}</span>
                          <span className="block text-sm text-zinc-500">{company.ticker}</span>
                        </span>
                        <span className="text-right text-lg font-semibold">{score}/5</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <CompanyWorkspace company={selectedCompany} themes={themes} />
            </section>
          ) : null}

          {activeView === "evidence" ? (
            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.65fr)]">
              <EvidenceList
                activeKey={selectedEvidence ? evidenceKey(selectedEvidence) : ""}
                evidenceItems={filteredEvidence}
                onSelect={(item) => setSelectedEvidenceKey(evidenceKey(item))}
              />
              <EvidenceDetail item={selectedEvidence} />
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function MetricTile({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: typeof Building2;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-teal-700" />
      </div>
      <p className="mt-3 truncate text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-zinc-600">{detail}</p>
    </div>
  );
}

function Heatmap({
  activeCompany,
  activeTheme,
  companies,
  onCellClick,
  themes,
}: {
  activeCompany: string;
  activeTheme: string;
  companies: Company[];
  onCellClick: (company: Company, theme: Theme) => void;
  themes: Theme[];
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
            <LineChart className="h-4 w-4" />
            Trend Heatmap
          </div>
          <h2 className="mt-1 text-2xl font-semibold">Click any cell to inspect evidence</h2>
        </div>
        <SignalBadge direction="up" label="Interactive" />
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
            {companies.map((company) => (
              <tr className="border-b border-zinc-100 last:border-b-0" key={company.ticker}>
                <td className="px-5 py-4">
                  <div className="font-semibold text-zinc-950">{company.name}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {company.ticker} · {company.segment}
                  </div>
                </td>
                {themes.map((theme) => {
                  const value = company.signals[theme.id] ?? 0;
                  const selected = activeCompany === company.ticker && activeTheme === theme.id;
                  return (
                    <td className="px-3 py-4" key={theme.id}>
                      <button
                        className={`flex h-10 w-14 items-center justify-center rounded-md text-sm font-semibold transition ${heatClass(
                          value,
                          selected,
                        )}`}
                        onClick={() => onCellClick(company, theme)}
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
  );
}

function FocusPanel({
  activeScore,
  company,
  companyEvidence,
  theme,
  themeEvidence,
}: {
  activeScore: number;
  company: Company;
  companyEvidence: Evidence[];
  theme: Theme;
  themeEvidence: Evidence[];
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
        <Activity className="h-4 w-4" />
        Analyst Focus
      </div>
      <h2 className="mt-1 text-2xl font-semibold">{company.ticker} / {theme.label}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{company.pulse}</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <MiniStat label="Score" value={`${activeScore}/5`} />
        <MiniStat label="Company refs" value={companyEvidence.length} />
        <MiniStat label="Theme refs" value={themeEvidence.length} />
      </div>
      <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
        {company.risk}
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function CompanyWorkspace({ company, themes }: { company: Company; themes: Theme[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {company.ticker} · {company.filing} · {company.period}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{company.name}</h2>
        </div>
        {company.filingUrl ? (
          <a
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            href={company.filingUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
            SEC filing
          </a>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-700">{company.pulse}</p>
      <div className="mt-5 space-y-3">
        {themes.map((theme) => {
          const score = company.signals[theme.id] ?? 0;
          return (
            <div key={theme.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700">{theme.label}</span>
                <span className="font-semibold">{score}/5</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100">
                <div className="h-2 rounded-full bg-teal-600" style={{ width: `${score * 20}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EvidenceList({
  activeKey,
  evidenceItems,
  onSelect,
}: {
  activeKey: string;
  evidenceItems: Evidence[];
  onSelect: (item: Evidence) => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
            <TrendingUp className="h-4 w-4" />
            Evidence Feed
          </div>
          <h2 className="mt-1 text-2xl font-semibold">Select an excerpt to inspect</h2>
        </div>
        <span className="text-sm font-medium text-zinc-500">{evidenceItems.length} items</span>
      </div>
      <div className="max-h-[720px] overflow-y-auto">
        {evidenceItems.length ? (
          evidenceItems.map((item) => {
            const theme = themeById.get(item.theme);
            const isActive = evidenceKey(item) === activeKey;
            return (
              <button
                className={`grid w-full gap-3 border-b border-zinc-100 p-4 text-left last:border-b-0 hover:bg-zinc-50 ${
                  isActive ? "bg-teal-50" : ""
                }`}
                key={evidenceKey(item)}
                onClick={() => onSelect(item)}
                type="button"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-950">{item.company}</span>
                  <SignalBadge
                    direction={item.read}
                    label={item.read === "up" ? "Up" : item.read === "down" ? "Down" : "Mixed"}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                    {theme?.label ?? item.theme}
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {item.confidence}
                  </span>
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                    {item.source} · {item.date}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm leading-6 text-zinc-600">{item.excerpt}</p>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-sm text-zinc-600">
            No evidence matches the current filters.
          </div>
        )}
      </div>
    </section>
  );
}

function EvidenceDetail({ item }: { item?: Evidence }) {
  if (!item) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold">No evidence selected</h2>
        <p className="mt-3 text-sm text-zinc-600">Adjust the filters to restore matching filing excerpts.</p>
      </section>
    );
  }

  const theme = themeById.get(item.theme);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
        <FileText className="h-4 w-4" />
        Evidence Detail
      </div>
      <h2 className="mt-1 text-2xl font-semibold">{item.company}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
          {theme?.label ?? item.theme}
        </span>
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
          {item.source} · {item.date}
        </span>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
          {item.confidence}
        </span>
      </div>
      <p className="mt-5 text-base leading-7 text-zinc-700">{item.excerpt}</p>
      {item.url ? (
        <a
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-medium text-white hover:bg-zinc-800"
          href={item.url}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
          Open SEC filing
        </a>
      ) : null}
    </section>
  );
}
