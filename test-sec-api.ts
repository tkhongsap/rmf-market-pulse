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
  try {
    // Use the correct endpoint: /FundFactsheet/fund/amc (lists all AMCs)
    console.log(`\n[Test] Connecting to ${SEC_API_BASE_URL}/FundFactsheet/fund/amc...`);

    const response = await fetch(`${SEC_API_BASE_URL}/FundFactsheet/fund/amc`, {
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
    const amcCount = Array.isArray(data) ? data.length : 0;

    return {
      test: 'API Connectivity',
      success: true,
      message: `Successfully connected to SEC API. Retrieved ${amcCount} Asset Management Companies.`,
      data: {
        statusCode: response.status,
        amcCount,
        sampleAMC: Array.isArray(data) && data.length > 0 ? data[0] : null,
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
 * Test 3: Test Fetching Funds from AMC
 */
async function testFetchingFunds(): Promise<TestResult> {
  try {
    console.log('\n[Test] Testing fund data retrieval...');

    // First get list of AMCs
    const amcResponse = await fetch(`${SEC_API_BASE_URL}/FundFactsheet/fund/amc`, {
      headers: {
        'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!amcResponse.ok) {
      return {
        test: 'Fetching Funds',
        success: false,
        message: 'Failed to fetch AMC list',
      };
    }

    const amcs = await amcResponse.json();

    if (!Array.isArray(amcs) || amcs.length === 0) {
      return {
        test: 'Fetching Funds',
        success: false,
        message: 'No AMCs found in response',
      };
    }

    // Get the first AMC's unique_id
    const firstAMC = amcs[0];
    console.log(`[Test] Fetching funds from AMC: ${firstAMC.name_th || firstAMC.unique_id}`);

    // Fetch funds for this AMC
    const fundsResponse = await fetch(
      `${SEC_API_BASE_URL}/FundFactsheet/fund/amc/${firstAMC.unique_id}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!fundsResponse.ok) {
      return {
        test: 'Fetching Funds',
        success: false,
        message: `Failed to fetch funds for AMC ${firstAMC.unique_id}`,
      };
    }

    const funds = await fundsResponse.json();
    const fundCount = Array.isArray(funds) ? funds.length : 0;

    // Filter for RMF funds
    const rmfFunds = Array.isArray(funds) ? funds.filter((fund: any) =>
      fund.proj_id?.includes('RMF') ||
      fund.proj_abbr_name?.includes('RMF') ||
      fund.proj_name_th?.includes('เพื่อการเลี้ยงชีพ')
    ) : [];

    return {
      test: 'Fetching Funds',
      success: true,
      message: `Successfully fetched ${fundCount} funds from ${firstAMC.name_th || firstAMC.unique_id}. Found ${rmfFunds.length} RMF funds.`,
      data: {
        amc: {
          id: firstAMC.unique_id,
          name: firstAMC.name_th || firstAMC.name_en,
        },
        totalFunds: fundCount,
        rmfFunds: rmfFunds.length,
        sampleFund: fundCount > 0 ? funds[0] : null,
        sampleRMFFund: rmfFunds.length > 0 ? rmfFunds[0] : null,
      },
    };
  } catch (error: any) {
    return {
      test: 'Fetching Funds',
      success: false,
      message: 'Error fetching funds',
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

    // First get AMCs, then funds
    const amcResponse = await fetch(`${SEC_API_BASE_URL}/FundFactsheet/fund/amc`, {
      headers: {
        'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!amcResponse.ok) {
      return {
        test: 'Fund Daily Info',
        success: false,
        message: 'Failed to fetch AMC list for daily info test',
      };
    }

    const amcs = await amcResponse.json();
    if (!Array.isArray(amcs) || amcs.length === 0) {
      return {
        test: 'Fund Daily Info',
        success: false,
        message: 'No AMCs found',
      };
    }

    // Get funds from first AMC
    const fundsResponse = await fetch(
      `${SEC_API_BASE_URL}/FundFactsheet/fund/amc/${amcs[0].unique_id}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!fundsResponse.ok) {
      return {
        test: 'Fund Daily Info',
        success: false,
        message: 'Failed to fetch funds',
      };
    }

    const funds = await fundsResponse.json();

    // Find an RMF fund
    const rmfFund = Array.isArray(funds) ? funds.find((fund: any) =>
      fund.proj_id?.includes('RMF') || fund.proj_abbr_name?.includes('RMF')
    ) : null;

    const testFund = rmfFund || (Array.isArray(funds) && funds.length > 0 ? funds[0] : null);

    if (!testFund) {
      return {
        test: 'Fund Daily Info',
        success: false,
        message: 'No fund found to test daily info endpoint',
      };
    }

    console.log(`[Test] Fetching daily NAV for fund: ${testFund.proj_abbr_name} (${testFund.proj_id})`);

    // Get today's date in format required by API
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

    // Fetch daily NAV - using the endpoint pattern from GitHub repo
    const dailyResponse = await fetch(
      `${SEC_API_BASE_URL}/FundDailyInfo/${testFund.proj_id}/dailynav/${dateStr}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!dailyResponse.ok) {
      // Try without date to see if that works
      const alternativeResponse = await fetch(
        `${SEC_API_BASE_URL}/FundDailyInfo/${testFund.proj_id}`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!alternativeResponse.ok) {
        return {
          test: 'Fund Daily Info',
          success: false,
          message: `Failed to fetch daily info for fund ${testFund.proj_abbr_name}`,
          error: `Status: ${dailyResponse.status}`,
        };
      }

      const dailyInfo = await alternativeResponse.json();
      const navData = Array.isArray(dailyInfo) && dailyInfo.length > 0 ? dailyInfo[0] : dailyInfo;

      return {
        test: 'Fund Daily Info',
        success: true,
        message: `Successfully retrieved NAV data for ${testFund.proj_abbr_name} (using fallback endpoint)`,
        data: {
          fundCode: testFund.proj_abbr_name,
          fundName: testFund.proj_name_th,
          endpoint: 'fallback',
          navData,
        },
      };
    }

    const dailyInfo = await dailyResponse.json();

    return {
      test: 'Fund Daily Info',
      success: true,
      message: `Successfully retrieved NAV data for ${testFund.proj_abbr_name}`,
      data: {
        fundCode: testFund.proj_abbr_name,
        fundName: testFund.proj_name_th,
        date: dateStr,
        navData: dailyInfo,
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

    const amcResponse = await fetch(`${SEC_API_BASE_URL}/FundFactsheet/fund/amc`, {
      headers: {
        'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!amcResponse.ok) {
      return {
        test: 'Data Structure',
        success: false,
        message: 'Failed to fetch data for structure test',
      };
    }

    const amcs = await amcResponse.json();
    const sampleAMC = amcs[0];

    // Fetch funds from first AMC
    const fundsResponse = await fetch(
      `${SEC_API_BASE_URL}/FundFactsheet/fund/amc/${sampleAMC.unique_id}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': SEC_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!fundsResponse.ok) {
      return {
        test: 'Data Structure',
        success: false,
        message: 'Failed to fetch funds for structure test',
      };
    }

    const funds = await fundsResponse.json();
    const sampleFund = Array.isArray(funds) && funds.length > 0 ? funds[0] : null;

    if (!sampleFund) {
      return {
        test: 'Data Structure',
        success: false,
        message: 'No fund data available for structure test',
      };
    }

    // Check for expected fields
    const expectedFundFields = [
      'proj_id',
      'proj_abbr_name',
      'proj_name_th',
    ];

    const missingFields = expectedFundFields.filter(field => !(field in sampleFund));
    const hasAllFields = missingFields.length === 0;

    return {
      test: 'Data Structure',
      success: hasAllFields,
      message: hasAllFields
        ? 'Data structure matches expected format'
        : `Missing fields: ${missingFields.join(', ')}`,
      data: {
        amcFields: Object.keys(sampleAMC),
        fundFields: Object.keys(sampleFund),
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

  // Test 3: Fetching Funds
  console.log('\n► Running Test 3: Fetching Funds from AMC...');
  results.push(await testFetchingFunds());

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
