import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_PATH = path.join(process.cwd(), "src", "data", "market-pulse.json");

const SEC_USER_AGENT =
  process.env.SEC_USER_AGENT ??
  "MarketIntelligence/0.1 local-research contact@example.com";

const companies = [
  {
    name: "Microsoft",
    ticker: "MSFT",
    cik: "0000789019",
    segment: "Hyperscaler / productivity",
    metric: "Azure + AI demand",
  },
  {
    name: "Amazon",
    ticker: "AMZN",
    cik: "0001018724",
    segment: "Hyperscaler / marketplace",
    metric: "AWS operating leverage",
  },
  {
    name: "Alphabet",
    ticker: "GOOGL",
    cik: "0001652044",
    segment: "Hyperscaler / ads",
    metric: "Cloud AI adoption",
  },
  {
    name: "Oracle",
    ticker: "ORCL",
    cik: "0001341439",
    segment: "Database / cloud infrastructure",
    metric: "OCI backlog",
  },
  {
    name: "Salesforce",
    ticker: "CRM",
    cik: "0001108524",
    segment: "Enterprise applications",
    metric: "Agentic CRM pipeline",
  },
  {
    name: "ServiceNow",
    ticker: "NOW",
    cik: "0001373715",
    segment: "Workflow automation",
    metric: "Workflow AI adoption",
  },
  {
    name: "Snowflake",
    ticker: "SNOW",
    cik: "0001640147",
    segment: "Data cloud",
    metric: "Product revenue growth",
  },
  {
    name: "Datadog",
    ticker: "DDOG",
    cik: "0001561550",
    segment: "Observability / security",
    metric: "Usage expansion",
  },
];

const taxonomy = [
  {
    id: "ai-monetization",
    label: "AI monetization",
    description:
      "Commercial lift from AI products, agents, copilots, and infrastructure attach.",
    keywords: [
      "artificial intelligence",
      " ai ",
      "generative ai",
      "machine learning",
      "copilot",
      "agent",
      "agents",
      "automation",
      "model",
      "accelerated computing",
    ],
  },
  {
    id: "cloud-migration",
    label: "Cloud migration",
    description:
      "Demand for workloads moving from owned infrastructure to cloud platforms.",
    keywords: [
      "cloud",
      "workload",
      "workloads",
      "migration",
      "data center",
      "datacenter",
      "infrastructure",
      "platform",
      "subscription",
      "software as a service",
    ],
  },
  {
    id: "budget-scrutiny",
    label: "Budget scrutiny",
    description:
      "Enterprise optimization, slower approvals, and pressure on consumption.",
    keywords: [
      "optimize",
      "optimization",
      "macroeconomic",
      "uncertain",
      "budget",
      "spending",
      "consumption",
      "elongated",
      "sales cycle",
      "procurement",
      "slowdown",
    ],
  },
  {
    id: "net-retention",
    label: "Net retention",
    description:
      "Expansion, churn, seat growth, and workload growth inside existing accounts.",
    keywords: [
      "retention",
      "renewal",
      "renewals",
      "churn",
      "expansion",
      "upsell",
      "cross-sell",
      "customers",
      "customer growth",
      "remaining performance obligation",
    ],
  },
  {
    id: "margin-discipline",
    label: "Margin discipline",
    description:
      "Operating leverage, hiring restraint, infrastructure efficiency, and cost control.",
    keywords: [
      "operating margin",
      "operating income",
      "efficiency",
      "cost",
      "costs",
      "expense",
      "expenses",
      "headcount",
      "restructuring",
      "profitability",
      "capital expenditures",
    ],
  },
  {
    id: "pricing-competition",
    label: "Pricing pressure",
    description:
      "Competitive discounting, bundled AI features, and platform substitution risk.",
    keywords: [
      "competition",
      "competitive",
      "competitors",
      "pricing",
      "price",
      "discount",
      "discounting",
      "bundle",
      "bundled",
      "substitute",
      "market share",
    ],
  },
];

const themeDirection = {
  "ai-monetization": "up",
  "cloud-migration": "up",
  "budget-scrutiny": "flat",
  "net-retention": "flat",
  "margin-discipline": "up",
  "pricing-competition": "up",
};

async function secFetch(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": SEC_USER_AGENT,
      Accept: "application/json, text/html;q=0.9, */*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`SEC request failed ${response.status}: ${url}`);
  }

  return response;
}

function cikWithoutLeadingZeros(cik) {
  return String(Number(cik));
}

function findLatestAnnualOrQuarterlyFiling(submissions) {
  const recent = submissions.filings?.recent;
  if (!recent) return null;

  for (let index = 0; index < recent.form.length; index += 1) {
    const form = recent.form[index];
    if (form !== "10-K" && form !== "10-Q") continue;

    return {
      form,
      accessionNumber: recent.accessionNumber[index],
      filingDate: recent.filingDate[index],
      reportDate: recent.reportDate[index],
      primaryDocument: recent.primaryDocument[index],
    };
  }

  return null;
}

function filingDocumentUrl(company, filing) {
  const accessionNoDashes = filing.accessionNumber.replaceAll("-", "");
  return `https://www.sec.gov/Archives/edgar/data/${cikWithoutLeadingZeros(
    company.cik,
  )}/${accessionNoDashes}/${filing.primaryDocument}`;
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<ix:header[\s\S]*?<\/ix:header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    )
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 80 && sentence.length <= 700);
}

function scoreSentence(sentence, keywords) {
  const normalized = ` ${sentence.toLowerCase()} `;
  return keywords.reduce((score, keyword) => {
    return normalized.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

function trimExcerpt(sentence) {
  const clean = sentence.replace(/\s+/g, " ").trim();
  if (clean.length <= 280) return clean;
  return `${clean.slice(0, 277).trim()}...`;
}

function classifyFiling(company, filing, filingText, documentUrl) {
  const sentences = splitIntoSentences(filingText);
  const signals = {};
  const evidence = [];

  for (const theme of taxonomy) {
    const ranked = sentences
      .map((sentence) => ({
        sentence,
        score: scoreSentence(sentence, theme.keywords),
      }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score || b.sentence.length - a.sentence.length);

    const topScore = ranked[0]?.score ?? 0;
    signals[theme.id] = signalStrength(topScore, ranked.length);

    if (ranked[0]) {
      evidence.push({
        company: company.name,
        ticker: company.ticker,
        theme: theme.id,
        source: filing.form,
        date: filing.filingDate,
        excerpt: trimExcerpt(ranked[0].sentence),
        read: themeDirection[theme.id],
        confidence: topScore >= 2 ? "High" : "Medium",
        url: documentUrl,
      });
    }
  }

  return { signals, evidence };
}

function signalStrength(topScore, matchCount) {
  if (matchCount === 0) return 0;
  if (topScore >= 4 || matchCount >= 80) return 5;
  if (topScore >= 3 || matchCount >= 35) return 4;
  if (topScore >= 2 || matchCount >= 12) return 3;
  return 2;
}

function buildPulse(company, signals) {
  const ranked = Object.entries(signals)
    .sort(([, a], [, b]) => b - a)
    .map(([themeId]) => taxonomy.find((theme) => theme.id === themeId))
    .filter(Boolean);
  const primary = ranked[0]?.label.toLowerCase() ?? "cloud software demand";
  const secondary = ranked[1]?.label.toLowerCase() ?? "operating execution";

  return `${company.name} shows the strongest filing signal around ${primary}, with secondary evidence around ${secondary}.`;
}

function buildRisk(company, signals) {
  if ((signals["budget-scrutiny"] ?? 0) >= 3) {
    return "Filing language points to customer spending scrutiny, optimization, or slower approval cycles as the main watch item.";
  }

  if ((signals["pricing-competition"] ?? 0) >= 3) {
    return "Competitive and pricing language is elevated, so margin durability and differentiation remain key watch items.";
  }

  return "The latest filing contains source-backed trend signals, but risk language is not concentrated in one theme.";
}

function buildThemeSummaries(companyRows) {
  return taxonomy.map((theme) => {
    const values = companyRows.map((company) => company.signals[theme.id] ?? 0);
    const strength = Math.min(5, Math.round(values.reduce((sum, value) => sum + value, 0) / values.length));
    const companiesFlagged = values.filter((value) => value >= 2).length;

    return {
      id: theme.id,
      label: theme.label,
      description: theme.description,
      momentum: themeDirection[theme.id],
      strength,
      companies: companiesFlagged,
    };
  });
}

async function buildCompany(company) {
  console.log(`Fetching ${company.ticker} filings`);
  const submissionsUrl = `https://data.sec.gov/submissions/CIK${company.cik}.json`;
  const submissions = await (await secFetch(submissionsUrl)).json();
  const filing = findLatestAnnualOrQuarterlyFiling(submissions);

  if (!filing) {
    throw new Error(`No 10-K or 10-Q found for ${company.ticker}`);
  }

  const documentUrl = filingDocumentUrl(company, filing);
  const html = await (await secFetch(documentUrl)).text();
  const filingText = htmlToText(html);
  const classified = classifyFiling(company, filing, filingText, documentUrl);

  return {
    company: {
      name: company.name,
      ticker: company.ticker,
      cik: company.cik,
      segment: company.segment,
      filing: `Latest ${filing.form}`,
      period: filing.reportDate || filing.filingDate,
      filingDate: filing.filingDate,
      filingUrl: documentUrl,
      pulse: buildPulse(company, classified.signals),
      risk: buildRisk(company, classified.signals),
      metric: company.metric,
      signals: classified.signals,
    },
    evidence: classified.evidence,
  };
}

async function main() {
  const companyResults = [];

  for (const company of companies) {
    companyResults.push(await buildCompany(company));
  }

  const companyRows = companyResults.map((result) => result.company);
  const evidence = companyResults
    .flatMap((result) => result.evidence)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 48);

  const output = {
    generatedAt: new Date().toISOString(),
    sourceMix: [
      { label: "SEC filings", value: 100 },
      { label: "News signals", value: 0 },
      { label: "Company metrics", value: 0 },
    ],
    themes: buildThemeSummaries(companyRows),
    companies: companyRows,
    evidence,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
