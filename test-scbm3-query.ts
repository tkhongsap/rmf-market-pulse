/**
 * Test script to query SCBM3 fund information using SEC API
 * Based on the SEC API examples in utility/sec-api-example/
 */

// SEC API Configuration
const SEC_API_BASE_URL = 'https://api.sec.or.th';
const SEC_FUND_FACTSHEET_KEY = '618a3ffe11944da093afa7fd33f10a28';

interface SECFundSearchResult {
  proj_id?: string;
  proj_name_th?: string;
  proj_name_en?: string;
  unique_id?: string;
  regis_date?: string;
  cancel_date?: string;
  amc_name_th?: string;
  amc_name_en?: string;
  [key: string]: any;
}

interface SECFundDetail {
  proj_id: string;
  [key: string]: any;
}

/**
 * Search for fund by name using SEC FundFactsheet API
 * Endpoint: POST /FundFactsheet/fund
 */
async function searchFundByName(fundName: string): Promise<SECFundSearchResult[]> {
  const url = `${SEC_API_BASE_URL}/FundFactsheet/fund`;

  console.log(`[SEC API] Searching for fund: "${fundName}"`);
  console.log(`[SEC API] POST ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Ocp-Apim-Subscription-Key': SEC_FUND_FACTSHEET_KEY,
    },
    body: JSON.stringify({
      name: fundName,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[SEC API] Error ${response.status}: ${errorText}`);
    throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[SEC API] Found ${Array.isArray(data) ? data.length : 1} result(s)`);

  return Array.isArray(data) ? data : [data];
}

/**
 * Get fund details by proj_id
 * Endpoint: GET /FundFactsheet/fund/amc/{proj_id}
 */
async function getFundDetail(projId: string): Promise<SECFundDetail> {
  const url = `${SEC_API_BASE_URL}/FundFactsheet/fund/amc/${projId}`;

  console.log(`[SEC API] Getting fund detail for proj_id: ${projId}`);
  console.log(`[SEC API] GET ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Ocp-Apim-Subscription-Key': SEC_FUND_FACTSHEET_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[SEC API] Error ${response.status}: ${errorText}`);
    throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get fund policy information
 * Endpoint: GET /FundFactsheet/fund/{proj_id}/policy
 */
async function getFundPolicy(projId: string): Promise<any> {
  const url = `${SEC_API_BASE_URL}/FundFactsheet/fund/${projId}/policy`;

  console.log(`[SEC API] Getting fund policy for proj_id: ${projId}`);
  console.log(`[SEC API] GET ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Ocp-Apim-Subscription-Key': SEC_FUND_FACTSHEET_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[SEC API] Error ${response.status}: ${errorText}`);
    throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Main test function
 */
async function main() {
  try {
    console.log('='.repeat(80));
    console.log('Testing SEC API Query for SCBM3 Fund');
    console.log('='.repeat(80));
    console.log('');

    // Step 1: Search for SCBM3
    console.log('STEP 1: Search for fund "SCBM3"');
    console.log('-'.repeat(80));
    const searchResults = await searchFundByName('SCBM3');

    if (searchResults.length === 0) {
      console.log('❌ No funds found with name "SCBM3"');
      return;
    }

    console.log('✅ Search Results:');
    searchResults.forEach((fund, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log(`  - Project ID: ${fund.proj_id}`);
      console.log(`  - Fund Name (TH): ${fund.proj_name_th}`);
      console.log(`  - Fund Name (EN): ${fund.proj_name_en}`);
      console.log(`  - Unique ID: ${fund.unique_id}`);
      console.log(`  - AMC Name (TH): ${fund.amc_name_th}`);
      console.log(`  - AMC Name (EN): ${fund.amc_name_en}`);
      console.log(`  - Registration Date: ${fund.regis_date}`);
      console.log(`  - Status: ${fund.cancel_date ? 'Cancelled' : 'Active'}`);
    });

    // Step 2: Get detailed information for the first result
    const firstFund = searchResults[0];
    if (!firstFund.proj_id) {
      console.log('\n❌ No proj_id found in search results');
      return;
    }

    console.log('\n\nSTEP 2: Get detailed fund information');
    console.log('-'.repeat(80));
    const fundDetail = await getFundDetail(firstFund.proj_id);
    console.log('✅ Fund Detail:');
    console.log(JSON.stringify(fundDetail, null, 2));

    // Step 3: Get fund policy
    console.log('\n\nSTEP 3: Get fund policy information');
    console.log('-'.repeat(80));
    const fundPolicy = await getFundPolicy(firstFund.proj_id);
    console.log('✅ Fund Policy:');
    console.log(JSON.stringify(fundPolicy, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test completed successfully!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
main();
