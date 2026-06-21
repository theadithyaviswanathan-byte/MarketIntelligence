# Cloud Software Market Pulse

A source-backed market trends dashboard for public cloud and software companies.

The MVP tracks signal strength across a cloud/software peer set using live SEC EDGAR filing metadata, primary 10-K / 10-Q filing documents, source excerpts, and company-level trend classification.

## MVP Peer Set

- Microsoft
- Amazon
- Alphabet
- Oracle
- Salesforce
- ServiceNow
- Snowflake
- Datadog

## Current Dashboard

- Industry pulse cards for the strongest market trends
- Trend heatmap by company and theme
- Company signal cards with filing period, key metric, and risk readout
- Evidence feed with source type, theme, confidence, and trend direction
- Links from each evidence item to the source SEC filing
- Company and theme filters
- Responsive layout with contained heatmap scrolling on mobile

## EDGAR Data Pipeline

The backend is a static data generation job so the app can publish on GitHub Pages without a server.

```bash
npm run edgar:generate
```

The script:

1. Fetches each company's latest 10-K or 10-Q metadata from the SEC submissions API.
2. Downloads the primary filing document from SEC Archives.
3. Converts filing HTML into text.
4. Scores filing excerpts against the trend taxonomy.
5. Writes `src/data/market-pulse.json` for the dashboard to import.

Set a descriptive SEC user agent before running the generator:

```bash
export SEC_USER_AGENT="MarketIntelligence/0.1 your-email@example.com"
npm run edgar:generate
```

## Trend Taxonomy

- AI monetization
- Cloud migration
- Enterprise budget scrutiny
- Net retention
- Margin discipline
- Pricing pressure

## Run Locally

```bash
npm install
npm run edgar:generate
npm run dev
```

Open http://127.0.0.1:3000.

If the development server hits a local file-watcher limit, build and run the production server:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

## Next Build Steps

1. Improve section extraction for Business, Risk Factors, and MD&A.
2. Add prior-quarter comparison for language change detection.
3. Add news ingestion as a recency and confirmation layer.
4. Persist company, filing, trend, and evidence records in a database when moving beyond GitHub Pages.
5. Replace keyword scoring with embeddings or an LLM classifier for stronger signal quality.
