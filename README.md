# Cloud Software Market Pulse

A source-backed market trends dashboard for public cloud and software companies.

The MVP tracks signal strength across a cloud/software peer set using SEC-style filing excerpts, recent news signals, and company-level trend classification. The current version uses structured seed data so the product experience can be validated before live ingestion is added.

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
- Company and theme filters
- Responsive layout with contained heatmap scrolling on mobile

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
npm run dev
```

Open http://127.0.0.1:3000.

If the development server hits a local file-watcher limit, build and run the production server:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

## Next Build Steps

1. Add SEC EDGAR company lookup and filing fetch for latest 10-K / 10-Q.
2. Extract Business, Risk Factors, and MD&A sections.
3. Classify excerpts against the trend taxonomy with source citations.
4. Add news ingestion as a recency and confirmation layer.
5. Persist company, filing, trend, and evidence records in a database.
6. Replace seeded dashboard data with API-backed records.
