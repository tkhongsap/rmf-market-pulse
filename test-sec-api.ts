/**
 * SEC API Integration Test Script
 *
 * This script tests the Thailand Securities and Exchange Commission API
 * to verify connectivity, authentication, and data retrieval.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env file manually
const envPath = join(process.cwd(), '.env');
let SEC_API_KEY = process.env.SEC_API_KEY;

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const keyMatch = envContent.match(/SEC_API_KEY\s*=\s*(.+)/);
  if (keyMatch) {
    SEC_API_KEY = keyMatch[1].trim();
  }
} catch (error) {
  console.log('Note: Could not read .env file, using process.env.SEC_API_KEY');
}

const SEC_API_BASE_URL = 'https://api.sec.or.th';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Test 1: Verify API Key Configuration
 */
function testApiKeyConfig(): TestResult {
  if (!SEC_API_KEY) {
    return {
      test: 'API Key Configuration',
      success: false,
      message: 'SEC_API_KEY environment variable is not set',
      error: 'Missing API key in .env file'
    };
  }

  return {
    test: 'API Key Configuration',
    success: true,
    message: `API key found: ${SEC_API_KEY.substring(0, 8)}...`,
  };
}

/**
 * Test 2: Test Basic API Connectivity
 */
async function testApiConnectivity(): Promise<TestResult> {
  // Try multiple endpoint variations
  const endpointVariations = [
    '/FundFactsheet/all',
    '/FundFactSheet',
    '/fund-factsheet',
    '/api/FundFactsheet',
    '/v1/FundFactsheet',
  ];

  for (const endpoint of endpointVariations) {
    try {
      console.log(`\n[Test] Trying ${SEC_API_BASE_URL}${endpoint}...`);

      const response = await fetch(`${SEC_API_BASE_URL}${endpoint}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
          'Content-Type': 'application/json',
        },
      });

      console.log(`[Response] Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        // Found a working endpoint!
        const data = await response.json();
        const fundCount = Array.isArray(data) ? data.length : 0;

        return {
          test: 'API Connectivity',
          success: true,
          message: `Successfully connected to SEC API. Retrieved ${fundCount} funds.`,
          data: {
            workingEndpoint: endpoint,
            statusCode: response.status,
            fundCount,
            sampleFund: Array.isArray(data) && data.length > 0 ? data[0] : null,
          },
        };
      }
    } catch (error: any) {
      console.log(`[Error] ${endpoint}: ${error.message}`);
    }
  }

  // If we get here, none of the endpoints worked
  try {
    const response = await fetch(`${SEC_API_BASE_URL}/FundFactSheet`, {
      headers: {
        'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Response] Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        test: 'API Connectivity',
        success: false,
        message: `API returned error status: ${response.status}`,
        error: errorText || response.statusText,
      };
    }

    const data = await response.json();
    const fundCount = Array.isArray(data) ? data.length : 0;

    return {
      test: 'API Connectivity',
      success: true,
      message: `Successfully connected to SEC API. Retrieved ${fundCount} funds.`,
      data: {
        statusCode: response.status,
        fundCount,
        sampleFund: Array.isArray(data) && data.length > 0 ? data[0] : null,
      },
    };
  } catch (error: any) {
    return {
      test: 'API Connectivity',
      success: false,
      message: 'Failed to connect to SEC API',
      error: error.message || String(error),
    };
  }
}

/**
 * Test 3: Test RMF Fund Filtering
 */
async function testRMFFundFiltering(): Promise<TestResult> {
  try {
    console.log('\n[Test] Testing RMF fund filtering...');

    const response = await fetch(`${SEC_API_BASE_URL}/FundFactSheet`, {
      headers: {
        'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        test: 'RMF Fund Filtering',
        success: false,
        message: 'Failed to fetch fund list for filtering test',
      };
    }

    const allFunds = await response.json();

    // Filter for RMF funds (same logic as in secApi.ts)
    const rmfFunds = allFunds.filter((fund: any) =>
      fund.proj_id?.includes('RMF') ||
      fund.proj_abbr_name?.includes('RMF') ||
      fund.proj_name_th?.includes('เพื่อการเลี้ยงชีพ')
    );

    return {
      test: 'RMF Fund Filtering',
      success: true,
      message: `Found ${rmfFunds.length} RMF funds out of ${allFunds.length} total funds`,
      data: {
        totalFunds: allFunds.length,
        rmfFunds: rmfFunds.length,
        sampleRMFFunds: rmfFunds.slice(0, 3).map((f: any) => ({
          id: f.proj_id,
          code: f.proj_abbr_name,
          name: f.proj_name_th,
        })),
      },
    };
  } catch (error: any) {
    return {
      test: 'RMF Fund Filtering',
      success: false,
      message: 'Error during RMF fund filtering',
      error: error.message,
    };
  }
}

/**
 * Test 4: Test Fund Daily Info Endpoint
 */
async function testFundDailyInfo(): Promise<TestResult> {
  try {
    console.log('\n[Test] Testing FundDailyInfo endpoint...');

    // First get a sample fund ID
    const listResponse = await fetch(`${SEC_API_BASE_URL}/FundFactSheet`, {
      headers: {
        'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!listResponse.ok) {
      return {
        test: 'Fund Daily Info',
        success: false,
        message: 'Failed to fetch fund list for daily info test',
      };
    }

    const allFunds = await listResponse.json();
    const rmfFund = allFunds.find((fund: any) =>
      fund.proj_id?.includes('RMF') || fund.proj_abbr_name?.includes('RMF')
    );

    if (!rmfFund) {
      return {
        test: 'Fund Daily Info',
        success: false,
        message: 'No RMF fund found to test daily info endpoint',
      };
    }

    console.log(`[Test] Fetching daily info for fund: ${rmfFund.proj_abbr_name} (${rmfFund.proj_id})`);

    // Fetch daily info for this fund
    const dailyResponse = await fetch(
      `${SEC_API_BASE_URL}/FundDailyInfo/${rmfFund.proj_id}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!dailyResponse.ok) {
      return {
        test: 'Fund Daily Info',
        success: false,
        message: `Failed to fetch daily info for fund ${rmfFund.proj_abbr_name}`,
        error: `Status: ${dailyResponse.status}`,
      };
    }

    const dailyInfo = await dailyResponse.json();
    const latestNav = Array.isArray(dailyInfo) && dailyInfo.length > 0
      ? dailyInfo.sort((a: any, b: any) =>
          new Date(b.nav_date).getTime() - new Date(a.nav_date).getTime()
        )[0]
      : null;

    return {
      test: 'Fund Daily Info',
      success: true,
      message: `Successfully retrieved NAV data for ${rmfFund.proj_abbr_name}`,
      data: {
        fundCode: rmfFund.proj_abbr_name,
        fundName: rmfFund.proj_name_th,
        totalRecords: Array.isArray(dailyInfo) ? dailyInfo.length : 0,
        latestNav: latestNav ? {
          date: latestNav.nav_date,
          nav: latestNav.nav,
          priorNav: latestNav.prior_nav,
        } : null,
      },
    };
  } catch (error: any) {
    return {
      test: 'Fund Daily Info',
      success: false,
      message: 'Error testing FundDailyInfo endpoint',
      error: error.message,
    };
  }
}

/**
 * Test 5: Test Data Structure Compatibility
 */
async function testDataStructure(): Promise<TestResult> {
  try {
    console.log('\n[Test] Testing data structure compatibility...');

    const response = await fetch(`${SEC_API_BASE_URL}/FundFactSheet`, {
      headers: {
        'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        test: 'Data Structure',
        success: false,
        message: 'Failed to fetch data for structure test',
      };
    }

    const funds = await response.json();
    const sampleFund = funds[0];

    // Check for expected fields
    const expectedFields = [
      'proj_id',
      'proj_abbr_name',
      'proj_name_th',
      'management_company',
    ];

    const missingFields = expectedFields.filter(field => !(field in sampleFund));
    const hasAllFields = missingFields.length === 0;

    return {
      test: 'Data Structure',
      success: hasAllFields,
      message: hasAllFields
        ? 'Data structure matches expected format'
        : `Missing fields: ${missingFields.join(', ')}`,
      data: {
        sampleFundFields: Object.keys(sampleFund),
        missingFields: missingFields.length > 0 ? missingFields : undefined,
      },
    };
  } catch (error: any) {
    return {
      test: 'Data Structure',
      success: false,
      message: 'Error testing data structure',
      error: error.message,
    };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=================================================');
  console.log('    SEC API Integration Test');
  console.log('=================================================\n');
  console.log(`Testing API: ${SEC_API_BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Test 1: API Key Config
  console.log('► Running Test 1: API Key Configuration...');
  results.push(testApiKeyConfig());

  if (!results[0].success) {
    console.log('\n❌ Cannot proceed without API key. Please configure SEC_API_KEY in .env file.\n');
    printResults();
    return;
  }

  // Test 2: API Connectivity
  console.log('\n► Running Test 2: API Connectivity...');
  results.push(await testApiConnectivity());

  if (!results[1].success) {
    console.log('\n❌ Cannot proceed without API connectivity.\n');
    printResults();
    return;
  }

  // Test 3: RMF Fund Filtering
  console.log('\n► Running Test 3: RMF Fund Filtering...');
  results.push(await testRMFFundFiltering());

  // Test 4: Fund Daily Info
  console.log('\n► Running Test 4: Fund Daily Info Endpoint...');
  results.push(await testFundDailyInfo());

  // Test 5: Data Structure
  console.log('\n► Running Test 5: Data Structure Compatibility...');
  results.push(await testDataStructure());

  // Print final results
  printResults();
}

/**
 * Print test results
 */
function printResults() {
  console.log('\n=================================================');
  console.log('    Test Results Summary');
  console.log('=================================================\n');

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.test}`);
    console.log(`   ${result.message}`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.data) {
      console.log(`   Data:`, JSON.stringify(result.data, null, 2).split('\n').join('\n   '));
    }
    console.log('');
  });

  console.log('-------------------------------------------------');
  console.log(`Summary: ${passed}/${total} tests passed`);
  console.log('-------------------------------------------------\n');

  if (passed === total) {
    console.log('🎉 All tests passed! SEC API integration is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Fatal error running tests:', error);
  process.exit(1);
});
