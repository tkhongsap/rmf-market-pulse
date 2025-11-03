/**
 * SET SMART API Integration Test Script
 *
 * This script tests the Stock Exchange of Thailand SMART API
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

const SETSMART_API_BASE_URL = 'https://www.setsmart.com/api/listed-company-api';

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
 * Test 2: Test Basic API Connectivity with Stock Quote
 */
async function testApiConnectivity(): Promise<TestResult> {
  try {
    // Test with PTT stock (one of the largest stocks in SET)
    const testSymbol = 'PTT';
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 days ago

    const url = `${SETSMART_API_BASE_URL}/eod-price-by-symbol?symbol=${testSymbol}&startDate=${startDate}&endDate=${endDate}&adjustedPriceFlag=N`;

    console.log(`\n[Test] Connecting to ${url}...`);

    const response = await fetch(url, {
      headers: {
        'api-key': SEC_API_KEY!,
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
    const recordCount = Array.isArray(data) ? data.length : 0;

    return {
      test: 'API Connectivity',
      success: true,
      message: `Successfully connected to SET SMART API. Retrieved ${recordCount} records for ${testSymbol}.`,
      data: {
        statusCode: response.status,
        symbol: testSymbol,
        recordCount,
        dateRange: `${startDate} to ${endDate}`,
        sampleData: Array.isArray(data) && data.length > 0 ? data[0] : null,
      },
    };
  } catch (error: any) {
    return {
      test: 'API Connectivity',
      success: false,
      message: 'Failed to connect to SET SMART API',
      error: error.message || String(error),
    };
  }
}

/**
 * Test 3: Test Multiple Stock Symbols
 */
async function testMultipleStocks(): Promise<TestResult> {
  try {
    console.log('\n[Test] Testing multiple stock symbols...');

    const symbols = ['PTT', 'AOT', 'CPALL']; // Major SET stocks
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 2 days ago

    const results: any[] = [];

    for (const symbol of symbols) {
      const url = `${SETSMART_API_BASE_URL}/eod-price-by-symbol?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}&adjustedPriceFlag=N`;

      const response = await fetch(url, {
        headers: {
          'api-key': SEC_API_KEY!,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const latestData = Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null;

        if (latestData) {
          results.push({
            symbol: latestData.symbol,
            date: latestData.date,
            close: latestData.close,
            change: latestData.close - latestData.prior,
            volume: latestData.totalVolume,
          });
        }
      }
    }

    return {
      test: 'Multiple Stock Symbols',
      success: results.length === symbols.length,
      message: `Successfully fetched data for ${results.length}/${symbols.length} stocks`,
      data: {
        stocks: results,
      },
    };
  } catch (error: any) {
    return {
      test: 'Multiple Stock Symbols',
      success: false,
      message: 'Error testing multiple stocks',
      error: error.message,
    };
  }
}

/**
 * Test 4: Test Data Structure and Fields
 */
async function testDataStructure(): Promise<TestResult> {
  try {
    console.log('\n[Test] Testing data structure...');

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const url = `${SETSMART_API_BASE_URL}/eod-price-by-symbol?symbol=PTT&startDate=${startDate}&endDate=${endDate}&adjustedPriceFlag=N`;

    const response = await fetch(url, {
      headers: {
        'api-key': SEC_API_KEY!,
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

    const data = await response.json();
    const sampleRecord = Array.isArray(data) && data.length > 0 ? data[0] : null;

    if (!sampleRecord) {
      return {
        test: 'Data Structure',
        success: false,
        message: 'No data returned from API',
      };
    }

    // Expected fields from documentation
    const expectedFields = [
      'date', 'symbol', 'securityType', 'adjustedPriceFlag',
      'prior', 'open', 'high', 'low', 'close', 'average',
      'totalVolume', 'totalValue', 'pe', 'pbv', 'dividendYield', 'marketCap'
    ];

    const presentFields = expectedFields.filter(field => field in sampleRecord);
    const missingFields = expectedFields.filter(field => !(field in sampleRecord));

    const hasAllFields = missingFields.length === 0;

    return {
      test: 'Data Structure',
      success: hasAllFields,
      message: hasAllFields
        ? 'Data structure matches expected format'
        : `${presentFields.length}/${expectedFields.length} expected fields present`,
      data: {
        sampleRecord,
        presentFields,
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
 * Test 5: Test Adjusted vs Non-Adjusted Prices
 */
async function testAdjustedPrices(): Promise<TestResult> {
  try {
    console.log('\n[Test] Testing adjusted vs non-adjusted prices...');

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch non-adjusted
    const nonAdjustedUrl = `${SETSMART_API_BASE_URL}/eod-price-by-symbol?symbol=PTT&startDate=${startDate}&endDate=${endDate}&adjustedPriceFlag=N`;
    const nonAdjustedResponse = await fetch(nonAdjustedUrl, {
      headers: {
        'api-key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    // Fetch adjusted
    const adjustedUrl = `${SETSMART_API_BASE_URL}/eod-price-by-symbol?symbol=PTT&startDate=${startDate}&endDate=${endDate}&adjustedPriceFlag=Y`;
    const adjustedResponse = await fetch(adjustedUrl, {
      headers: {
        'api-key': SEC_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!nonAdjustedResponse.ok || !adjustedResponse.ok) {
      return {
        test: 'Adjusted Prices',
        success: false,
        message: 'Failed to fetch adjusted price data',
      };
    }

    const nonAdjustedData = await nonAdjustedResponse.json();
    const adjustedData = await adjustedResponse.json();

    const nonAdjustedRecord = Array.isArray(nonAdjustedData) && nonAdjustedData.length > 0 ? nonAdjustedData[0] : null;
    const adjustedRecord = Array.isArray(adjustedData) && adjustedData.length > 0 ? adjustedData[0] : null;

    return {
      test: 'Adjusted Prices',
      success: true,
      message: 'Successfully retrieved both adjusted and non-adjusted prices',
      data: {
        nonAdjusted: nonAdjustedRecord ? {
          date: nonAdjustedRecord.date,
          close: nonAdjustedRecord.close,
          volume: nonAdjustedRecord.totalVolume,
          flag: nonAdjustedRecord.adjustedPriceFlag,
        } : null,
        adjusted: adjustedRecord ? {
          date: adjustedRecord.date,
          close: adjustedRecord.close,
          volume: adjustedRecord.totalVolume,
          flag: adjustedRecord.adjustedPriceFlag,
        } : null,
      },
    };
  } catch (error: any) {
    return {
      test: 'Adjusted Prices',
      success: false,
      message: 'Error testing adjusted prices',
      error: error.message,
    };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=================================================');
  console.log('    SET SMART API Integration Test');
  console.log('=================================================\n');
  console.log(`Testing API: ${SETSMART_API_BASE_URL}`);
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

  // Test 3: Multiple Stocks
  console.log('\n► Running Test 3: Multiple Stock Symbols...');
  results.push(await testMultipleStocks());

  // Test 4: Data Structure
  console.log('\n► Running Test 4: Data Structure...');
  results.push(await testDataStructure());

  // Test 5: Adjusted Prices
  console.log('\n► Running Test 5: Adjusted vs Non-Adjusted Prices...');
  results.push(await testAdjustedPrices());

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
    console.log('🎉 All tests passed! SET SMART API integration is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Fatal error running tests:', error);
  process.exit(1);
});
