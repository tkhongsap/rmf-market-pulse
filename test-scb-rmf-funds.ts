/**
 * Test SCB RMF Funds using SEC API
 *
 * This script searches for and displays information about SCB RMF funds
 * (like SCBM3) using the official Thailand SEC APIs:
 * 1. Fund Factsheet API - for fund discovery and metadata
 * 2. Fund Daily Info API - for NAV data and dividends
 */

import {
  fetchAMCList,
  searchFundsByAMC,
  testApiConnection as testFactsheetConnection,
  clearCache as clearFactsheetCache,
  type FundBasicInfo,
} from './server/services/secFundFactsheetApi';

import {
  fetchFundDailyNav,
  fetchFundNavHistory,
  fetchFundDividend,
  testApiConnection as testDailyInfoConnection,
  clearCache as clearDailyInfoCache,
  type FundDailyNav,
} from './server/services/secFundDailyInfoApi';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

function formatNumber(num: number | null | undefined, decimals: number = 4): string {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function printSection(title: string) {
  console.log('\n' + colors.bright + colors.cyan + '═'.repeat(80) + colors.reset);
  console.log(colors.bright + colors.cyan + title.toUpperCase() + colors.reset);
  console.log(colors.bright + colors.cyan + '═'.repeat(80) + colors.reset);
}

async function testSCBRMFFunds() {
  console.log(colors.bright + colors.yellow);
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                SCB RMF Funds - SEC API Integration Test                   ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  // Clear caches for fresh test
  clearFactsheetCache();
  clearDailyInfoCache();

  try {
    // Test 1: API Connections
    printSection('🔌 Test 1: API Connection & Authentication');

    const factsheetKey = process.env.SEC_FUND_FACTSHEET_KEY;
    const dailyInfoKey = process.env.SEC_FUND_DAILY_INFO_KEY;

    if (!factsheetKey) {
      console.log(`${colors.red}✗ SEC_FUND_FACTSHEET_KEY not found in environment${colors.reset}`);
      console.log(`${colors.yellow}Note: You provided SEC_FUND_FACTSHEET_KEY in your message.${colors.reset}`);
      console.log(`${colors.yellow}Please set it in your .env file or export it before running this script.${colors.reset}`);
      return;
    }

    console.log(`${colors.blue}Fund Factsheet API Key: ${factsheetKey.substring(0, 8)}...${colors.reset}`);

    if (dailyInfoKey) {
      console.log(`${colors.blue}Fund Daily Info API Key: ${dailyInfoKey.substring(0, 8)}...${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  SEC_FUND_DAILY_INFO_KEY not set - NAV data will not be available${colors.reset}`);
    }

    const isFactsheetConnected = await testFactsheetConnection();
    if (!isFactsheetConnected) {
      console.log(`${colors.red}✗ Fund Factsheet API connection failed${colors.reset}`);
      return;
    }
    console.log(`${colors.green}✓ Fund Factsheet API connection successful${colors.reset}`);

    if (dailyInfoKey) {
      const isDailyInfoConnected = await testDailyInfoConnection();
      if (!isDailyInfoConnected) {
        console.log(`${colors.yellow}⚠️  Fund Daily Info API connection failed${colors.reset}`);
      } else {
        console.log(`${colors.green}✓ Fund Daily Info API connection successful${colors.reset}`);
      }
    }

    // Test 2: Find SCB AMC
    printSection('🏢 Test 2: Find SCB Asset Management Company');

    console.log(`${colors.blue}Fetching list of Asset Management Companies...${colors.reset}\n`);
    const amcList = await fetchAMCList();
    console.log(`${colors.green}✓ Found ${amcList.length} AMCs${colors.reset}\n`);

    // Search for SCB AMC
    const scbAMCs = amcList.filter(amc =>
      amc.name_en?.toUpperCase().includes('SCB') ||
      amc.name_th?.includes('ไทยพาณิชย์')
    );

    if (scbAMCs.length === 0) {
      console.log(`${colors.red}✗ No SCB Asset Management Company found${colors.reset}`);
      return;
    }

    console.log(`${colors.green}✓ Found ${scbAMCs.length} SCB AMC(s):${colors.reset}\n`);
    scbAMCs.forEach(amc => {
      console.log(`  ${colors.bright}AMC ID:${colors.reset}      ${amc.unique_id}`);
      console.log(`  ${colors.bright}Name (EN):${colors.reset}   ${amc.name_en}`);
      console.log(`  ${colors.bright}Name (TH):${colors.reset}   ${amc.name_th}`);
      console.log();
    });

    // Test 3: Search for SCB RMF Funds
    printSection('🔍 Test 3: Search for SCB RMF Funds');

    console.log(`${colors.blue}Searching for SCB RMF funds...${colors.reset}\n`);

    // Search for funds with "SCB" in the name and filter for RMF
    const scbFunds = await searchFundsByAMC('SCB', 'RMF');

    if (scbFunds.length === 0) {
      console.log(`${colors.red}✗ No SCB RMF funds found${colors.reset}`);
      console.log(`${colors.yellow}Trying broader search for all SCB funds...${colors.reset}\n`);

      const allSCBFunds = await searchFundsByAMC('SCB');
      console.log(`${colors.green}✓ Found ${allSCBFunds.length} SCB funds (including non-RMF):${colors.reset}\n`);

      // Display first 20 funds
      const displayFunds = allSCBFunds.slice(0, 20);
      displayFunds.forEach((fund, index) => {
        const isRMF = fund.proj_id?.toUpperCase().includes('RMF') ||
                      fund.proj_name_en?.toUpperCase().includes('RMF');
        const rmfMarker = isRMF ? `${colors.green}[RMF]${colors.reset}` : '';

        console.log(`  ${colors.bright}${index + 1}. ${fund.proj_abbr_name}${colors.reset} ${rmfMarker}`);
        console.log(`     Project ID:    ${fund.proj_id}`);
        console.log(`     Name (EN):     ${fund.proj_name_en}`);
        console.log(`     Status:        ${fund.fund_status} ${fund.cancel_date ? '(Cancelled: ' + fund.cancel_date + ')' : '(Active)'}`);
        console.log();
      });

      if (allSCBFunds.length > 20) {
        console.log(`  ${colors.yellow}... and ${allSCBFunds.length - 20} more funds${colors.reset}\n`);
      }

      return;
    }

    console.log(`${colors.green}✓ Found ${scbFunds.length} SCB RMF fund(s):${colors.reset}\n`);

    // Display all SCB RMF funds
    scbFunds.forEach((fund, index) => {
      console.log(`  ${colors.bright}${index + 1}. ${fund.proj_abbr_name}${colors.reset}`);
      console.log(`     Project ID:    ${fund.proj_id}`);
      console.log(`     Regis ID:      ${fund.regis_id}`);
      console.log(`     Name (EN):     ${fund.proj_name_en}`);
      console.log(`     Name (TH):     ${fund.proj_name_th}`);
      console.log(`     AMC ID:        ${fund.unique_id}`);
      console.log(`     Status:        ${fund.fund_status} ${fund.cancel_date ? '(Cancelled: ' + fund.cancel_date + ')' : '(Active)'}`);
      console.log(`     Registered:    ${fund.regis_date}`);
      console.log();
    });

    // Test 4: Get NAV Data for Active SCB RMF Funds
    if (!dailyInfoKey) {
      console.log(`${colors.yellow}Skipping NAV data test - SEC_FUND_DAILY_INFO_KEY not configured${colors.reset}`);
      return;
    }

    printSection('📊 Test 4: Fetch Latest NAV Data');

    // Filter for active funds only
    const activeFunds = scbFunds.filter(fund => !fund.cancel_date);

    if (activeFunds.length === 0) {
      console.log(`${colors.yellow}⚠️  No active SCB RMF funds found${colors.reset}`);
      return;
    }

    console.log(`${colors.blue}Testing NAV data for ${activeFunds.length} active fund(s)...${colors.reset}\n`);

    // Test NAV data for each active fund
    for (const fund of activeFunds) {
      console.log(colors.bright + `Testing ${fund.proj_abbr_name} (${fund.proj_id})` + colors.reset);

      // Try to find the most recent NAV data (go back up to 10 days)
      const today = new Date();
      let latestNav: FundDailyNav | null = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!latestNav && attempts < maxAttempts) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - attempts);

        // Skip weekends
        const dayOfWeek = targetDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          attempts++;
          continue;
        }

        const dateStr = targetDate.toISOString().split('T')[0];

        try {
          latestNav = await fetchFundDailyNav(fund.proj_id, dateStr);
          if (latestNav) {
            console.log(`  ${colors.green}✓ Found NAV data for ${dateStr}${colors.reset}`);
            break;
          }
        } catch (error) {
          // Continue to next date
        }

        attempts++;
      }

      if (!latestNav) {
        console.log(`  ${colors.yellow}⚠️  No NAV data found in the last 10 days${colors.reset}\n`);
        continue;
      }

      // Display NAV data
      console.log(`  NAV Date:          ${colors.bright}${latestNav.nav_date}${colors.reset}`);
      console.log(`  Current NAV:       ${colors.bright}${formatNumber(latestNav.last_val)} THB${colors.reset}`);
      console.log(`  Previous NAV:      ${formatNumber(latestNav.previous_val)} THB`);

      const navChange = latestNav.last_val - latestNav.previous_val;
      const navChangePercent = latestNav.previous_val > 0 ? (navChange / latestNav.previous_val) * 100 : 0;

      if (latestNav.previous_val > 0) {
        const changeColor = navChange > 0 ? colors.green : navChange < 0 ? colors.red : colors.reset;
        const changeSign = navChange >= 0 ? '+' : '';
        console.log(`  NAV Change:        ${changeColor}${changeSign}${formatNumber(navChange)} THB (${changeSign}${navChangePercent.toFixed(2)}%)${colors.reset}`);
      }

      console.log(`  Net Assets:        ${formatNumber(latestNav.net_asset, 0)} THB`);
      console.log(`  Buy Price:         ${formatNumber(latestNav.buy_price)} THB`);
      console.log(`  Sell Price:        ${formatNumber(latestNav.sell_price)} THB`);
      console.log();
    }

    // Final Summary
    printSection('✅ Test Summary');

    console.log(`${colors.green}Tests completed!${colors.reset}\n`);
    console.log(colors.bright + 'Key Findings:' + colors.reset);
    console.log(`  ✓ SEC Fund Factsheet API is working`);
    console.log(`  ✓ Found ${scbAMCs.length} SCB Asset Management Company(ies)`);
    console.log(`  ✓ Found ${scbFunds.length} SCB RMF fund(s)`);
    console.log(`  ✓ ${activeFunds.length} active fund(s) available for NAV data`);
    console.log();

  } catch (error: any) {
    console.error(colors.bright + colors.red + '❌ Error during testing:' + colors.reset, error.message);
    if (error.stack) {
      console.error(colors.red + error.stack + colors.reset);
    }
    process.exit(1);
  }
}

// Run the test
console.log(colors.blue + 'Starting SCB RMF funds test using SEC APIs...\n' + colors.reset);
testSCBRMFFunds();
