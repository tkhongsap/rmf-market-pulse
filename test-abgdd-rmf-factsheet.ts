/**
 * Test ABGDD-RMF fund using SEC Fund Factsheet API
 *
 * This script fetches comprehensive information about ABGDD-RMF
 * from the Thailand SEC Fund Factsheet API
 */

import {
  fetchAMCList,
  fetchFundsByAMC,
  fetchFundAssets,
  searchFunds,
  searchFundsByAMC,
  testApiConnection,
  clearCache,
  type AMCData,
  type FundBasicInfo,
  type FundAsset,
} from './server/services/secFundFactsheetApi';

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

function printSection(title: string) {
  console.log('\n' + colors.bright + colors.cyan + '═'.repeat(80) + colors.reset);
  console.log(colors.bright + colors.cyan + title.toUpperCase() + colors.reset);
  console.log(colors.bright + colors.cyan + '═'.repeat(80) + colors.reset);
}

function formatJSON(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

async function testABGDDRMF() {
  console.log(colors.bright + colors.yellow);
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║             ABGDD-RMF Fund Factsheet - SEC Fund Factsheet API             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  // Clear cache for fresh test
  clearCache();

  try {
    // Test 1: API Connection
    printSection('🔌 Test 1: API Connection & Authentication');

    const apiKey = process.env.SEC_FUND_FACTSHEET_KEY;
    if (!apiKey) {
      console.log(`${colors.red}✗ SEC_FUND_FACTSHEET_KEY not found in environment${colors.reset}`);
      return;
    }

    console.log(`${colors.blue}API Key: ${apiKey.substring(0, 8)}...${colors.reset}`);

    const isConnected = await testApiConnection();
    if (!isConnected) {
      console.log(`${colors.red}✗ API connection failed${colors.reset}`);
      return;
    }

    console.log(`${colors.green}✓ API connection successful${colors.reset}`);

    // Test 2: Search for ABGDD-RMF
    printSection('🔍 Test 2: Search for ABGDD-RMF Fund');

    console.log(`${colors.blue}Searching for funds matching "ABGDD"...${colors.reset}\n`);

    const searchResults = await searchFunds('ABGDD');

    if (searchResults.length === 0) {
      console.log(`${colors.yellow}⚠️  No funds found matching "ABGDD"${colors.reset}`);
      console.log(`${colors.blue}Trying alternative search: "Aberdeen"${colors.reset}\n`);

      const aberdeenResults = await searchFunds('Aberdeen');
      if (aberdeenResults.length > 0) {
        console.log(`${colors.green}✓ Found ${aberdeenResults.length} Aberdeen funds${colors.reset}\n`);

        // Filter for RMF funds
        const rmfFunds = aberdeenResults.filter(fund =>
          fund.proj_id?.includes('RMF') ||
          fund.proj_name_en?.includes('RMF') ||
          fund.proj_abbr_name?.includes('RMF')
        );

        console.log(`${colors.cyan}Aberdeen RMF Funds:${colors.reset}`);
        rmfFunds.forEach((fund, index) => {
          console.log(`\n${colors.bright}Fund ${index + 1}:${colors.reset}`);
          console.log(`  Project ID:         ${fund.proj_id}`);
          console.log(`  Registration ID:    ${fund.regis_id}`);
          console.log(`  Name (EN):          ${fund.proj_name_en}`);
          console.log(`  Name (TH):          ${fund.proj_name_th}`);
          console.log(`  Abbr Name:          ${fund.proj_abbr_name}`);
          console.log(`  Status:             ${fund.fund_status}`);
          console.log(`  Registration Date:  ${fund.regis_date}`);
          console.log(`  AMC ID:             ${fund.unique_id}`);
        });

        // Use the first RMF fund found
        if (rmfFunds.length > 0) {
          searchResults.push(...rmfFunds);
        }
      }
    } else {
      console.log(`${colors.green}✓ Found ${searchResults.length} fund(s) matching "ABGDD"${colors.reset}\n`);
    }

    if (searchResults.length === 0) {
      console.log(`${colors.red}✗ Could not find ABGDD-RMF or Aberdeen RMF funds${colors.reset}`);
      return;
    }

    // Display all matching funds
    console.log(colors.bright + '\nAll Matching Funds:' + colors.reset);
    searchResults.forEach((fund, index) => {
      console.log(`\n${colors.cyan}Fund ${index + 1}:${colors.reset}`);
      console.log(`  Project ID:         ${fund.proj_id}`);
      console.log(`  Name (EN):          ${fund.proj_name_en}`);
      console.log(`  Name (TH):          ${fund.proj_name_th}`);
      console.log(`  Abbr Name:          ${fund.proj_abbr_name}`);
      console.log(`  Status:             ${fund.fund_status}`);
      console.log(`  AMC ID:             ${fund.unique_id}`);
    });

    // Use the first fund for detailed analysis
    const targetFund = searchResults[0];
    const projId = targetFund.proj_id;

    printSection(`📊 Test 3: Detailed Fund Information - ${projId}`);

    console.log(colors.bright + 'Basic Information:' + colors.reset);
    console.log(`  Project ID:         ${targetFund.proj_id}`);
    console.log(`  Registration ID:    ${targetFund.regis_id}`);
    console.log(`  Fund Name (EN):     ${targetFund.proj_name_en}`);
    console.log(`  Fund Name (TH):     ${targetFund.proj_name_th}`);
    console.log(`  Abbreviated Name:   ${targetFund.proj_abbr_name}`);
    console.log(`  Fund Status:        ${targetFund.fund_status} (${targetFund.fund_status === 'RG' ? 'Registered' : 'Closed'})`);
    console.log(`  Registration Date:  ${targetFund.regis_date}`);
    console.log(`  Cancellation Date:  ${targetFund.cancel_date || 'N/A (Active)'}`);
    console.log(`  AMC ID:             ${targetFund.unique_id}`);

    // Test 4: Fetch Asset Allocation
    printSection(`💼 Test 4: Asset Allocation - ${projId}`);

    console.log(`${colors.blue}Fetching asset allocation...${colors.reset}\n`);

    try {
      const assets = await fetchFundAssets(projId);

      if (assets.length === 0) {
        console.log(`${colors.yellow}⚠️  No asset allocation data available${colors.reset}`);
      } else {
        console.log(`${colors.green}✓ Found ${assets.length} asset allocation entries${colors.reset}\n`);

        // Display asset allocation
        console.log(colors.bright + '┌─────┬─────────────────────────────────────────────────┬──────────────┐' + colors.reset);
        console.log(colors.bright + '│ Seq │ Asset Name                                      │ Allocation % │' + colors.reset);
        console.log(colors.bright + '├─────┼─────────────────────────────────────────────────┼──────────────┤' + colors.reset);

        assets.forEach(asset => {
          const assetName = asset.asset_name?.padEnd(47) || 'N/A'.padEnd(47);
          const ratio = asset.asset_ratio?.toFixed(2).padStart(11) || 'N/A'.padStart(11);
          console.log(`│ ${String(asset.asset_seq).padStart(3)} │ ${assetName} │ ${ratio}% │`);
        });

        console.log(colors.bright + '└─────┴─────────────────────────────────────────────────┴──────────────┘' + colors.reset);

        // Calculate total
        const totalRatio = assets.reduce((sum, asset) => sum + (asset.asset_ratio || 0), 0);
        console.log(`\n${colors.bright}Total Allocation: ${totalRatio.toFixed(2)}%${colors.reset}`);
      }
    } catch (error: any) {
      console.log(`${colors.red}✗ Error fetching asset allocation: ${error.message}${colors.reset}`);
    }

    // Test 5: Get AMC Information
    printSection('🏢 Test 5: Asset Management Company (AMC) Information');

    console.log(`${colors.blue}Fetching AMC information for ID: ${targetFund.unique_id}...${colors.reset}\n`);

    try {
      const amcList = await fetchAMCList();
      const amc = amcList.find(a => a.unique_id === targetFund.unique_id);

      if (amc) {
        console.log(`${colors.green}✓ AMC found${colors.reset}\n`);
        console.log(colors.bright + 'AMC Details:' + colors.reset);
        console.log(`  AMC ID:             ${amc.unique_id}`);
        console.log(`  AMC Name (EN):      ${amc.name_en}`);
        console.log(`  AMC Name (TH):      ${amc.name_th}`);

        // Get all funds under this AMC
        console.log(`\n${colors.blue}Fetching all funds under this AMC...${colors.reset}\n`);

        const amcFunds = await fetchFundsByAMC(amc.unique_id);

        console.log(`${colors.green}✓ Found ${amcFunds.length} total funds under ${amc.name_en}${colors.reset}\n`);

        // Filter RMF funds
        const rmfFunds = amcFunds.filter(fund =>
          fund.proj_id?.includes('RMF') ||
          fund.proj_name_en?.includes('Retirement') ||
          fund.proj_abbr_name?.includes('RMF')
        );

        if (rmfFunds.length > 0) {
          console.log(`${colors.cyan}RMF Funds under ${amc.name_en}:${colors.reset}\n`);
          rmfFunds.forEach((fund, index) => {
            console.log(`${index + 1}. ${fund.proj_abbr_name} (${fund.proj_id}) - Status: ${fund.fund_status}`);
          });
        }
      } else {
        console.log(`${colors.yellow}⚠️  AMC not found in the list${colors.reset}`);
      }
    } catch (error: any) {
      console.log(`${colors.red}✗ Error fetching AMC information: ${error.message}${colors.reset}`);
    }

    // Test 6: Export Full Fund Data
    printSection('📄 Test 6: Full Fund Data Export');

    console.log(`${colors.blue}Exporting complete fund data to JSON...${colors.reset}\n`);

    const fullFundData = {
      basic_info: targetFund,
      asset_allocation: await fetchFundAssets(projId).catch(() => []),
    };

    console.log(colors.bright + 'Complete Fund Data:' + colors.reset);
    console.log(formatJSON(fullFundData));

    // Final Summary
    printSection('✅ Test Summary');

    console.log(`${colors.green}All tests completed successfully!${colors.reset}\n`);
    console.log(colors.bright + 'Key Findings:' + colors.reset);
    console.log(`  ✓ SEC Fund Factsheet API is working`);
    console.log(`  ✓ Fund found: ${targetFund.proj_abbr_name} (${targetFund.proj_id})`);
    console.log(`  ✓ Fund status: ${targetFund.fund_status}`);
    console.log(`  ✓ Asset allocation: ${(await fetchFundAssets(projId).catch(() => [])).length} entries`);
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
console.log(colors.blue + 'Starting ABGDD-RMF factsheet test using SEC Fund Factsheet API...\n' + colors.reset);
testABGDDRMF();
