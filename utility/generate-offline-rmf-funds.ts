import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

interface CSVFundRow {
  symbol: string;
  fund_name: string;
  amc: string;
  fund_classification: string;
  management_style: string;
  dividend_policy: string;
  risk_level: number;
  fund_type: string;
}

interface FundMappingEntry {
  proj_id: string;
  fund_name_th: string;
  fund_name_en: string;
  amc_id: string;
  amc_name: string;
  fund_status: string;
  regis_date: string;
  cancel_date: string | null;
}

interface FundMapping {
  mapping: Record<string, FundMappingEntry>;
}

function parseCSVFunds(csvContent: string): CSVFundRow[] {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(Boolean);
  const dataLines = lines.slice(1); // skip header
  const funds: CSVFundRow[] = [];

  for (const line of dataLines) {
    const fields = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);

    if (!fields || fields.length < 8) {
      continue;
    }

    const [symbol, fundName, amc, classification, managementStyle, dividendPolicy, riskLevel, fundType] = fields.map(field =>
      field.replace(/^"|"$/g, '').trim(),
    );

    funds.push({
      symbol,
      fund_name: fundName,
      amc,
      fund_classification: classification,
      management_style: managementStyle,
      dividend_policy: dividendPolicy,
      risk_level: Number(riskLevel) || 0,
      fund_type: fundType,
    });
  }

  return funds;
}

function loadFundMapping(mappingPath: string): FundMapping {
  const mappingRaw = readFileSync(mappingPath, 'utf-8');
  return JSON.parse(mappingRaw) as FundMapping;
}

function ensureCleanDirectory(dirPath: string) {
  if (existsSync(dirPath)) {
    const entries = readdirSync(dirPath);
    for (const entry of entries) {
      const entryPath = join(dirPath, entry);
      rmSync(entryPath, { recursive: true, force: true });
    }
  } else {
    mkdirSync(dirPath, { recursive: true });
  }
}

function main() {
  const repoRoot = process.cwd();
  const csvPath = join(repoRoot, 'docs', 'rmf-funds.csv');
  const mappingPath = join(repoRoot, 'data', 'fund-mapping.json');
  const outputDir = join(repoRoot, 'data', 'rmf-funds');

  const csvContent = readFileSync(csvPath, 'utf-8');
  const csvFunds = parseCSVFunds(csvContent);
  const mapping = loadFundMapping(mappingPath);

  ensureCleanDirectory(outputDir);

  const offlineReason = 'SEC APIs were unreachable in this environment; generated offline metadata only.';
  let generatedCount = 0;
  let missingMappingCount = 0;

  for (const fund of csvFunds) {
    const mappingEntry = mapping.mapping[fund.symbol];

    if (!mappingEntry) {
      missingMappingCount += 1;
    }

    const fundData = {
      fund_id: mappingEntry?.proj_id ?? null,
      symbol: fund.symbol,
      fund_name: fund.fund_name,
      amc: fund.amc,
      metadata: {
        fund_classification: fund.fund_classification,
        management_style: fund.management_style,
        dividend_policy: fund.dividend_policy,
        risk_level: fund.risk_level,
        fund_type: fund.fund_type,
      },
      latest_nav: null,
      nav_history_30d: [] as never[],
      dividends: [] as never[],
      performance: null,
      benchmark: null,
      risk_metrics: null,
      asset_allocation: null,
      category: null,
      fees: null,
      involved_parties: null,
      top_holdings: null,
      risk_factors: null,
      suitability: null,
      document_urls: null,
      investment_minimums: null,
      mapping_snapshot: mappingEntry
        ? {
            fund_name_th: mappingEntry.fund_name_th,
            fund_name_en: mappingEntry.fund_name_en,
            amc_id: mappingEntry.amc_id,
            amc_name: mappingEntry.amc_name,
            fund_status: mappingEntry.fund_status,
            regis_date: mappingEntry.regis_date,
            cancel_date: mappingEntry.cancel_date,
          }
        : null,
      data_fetched_at: new Date().toISOString(),
      errors: mappingEntry
        ? [offlineReason]
        : [
            'Fund mapping entry not found for this symbol.',
            offlineReason,
          ],
    };

    const outputPath = join(outputDir, `${fund.symbol.replace(/[/\\:*?"<>|]/g, '-')}.json`);
    writeFileSync(outputPath, JSON.stringify(fundData, null, 2), 'utf-8');
    generatedCount += 1;
  }

  console.log(`Generated ${generatedCount} offline RMF fund files.`);
  if (missingMappingCount > 0) {
    console.warn(`Warning: ${missingMappingCount} funds were missing from fund-mapping.json.`);
  }
}

main();
