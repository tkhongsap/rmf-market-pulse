# Testing Plan: ABAPAC-RMF Data Availability

**Project**: Thai RMF Market Pulse  
**Reference Fund**: ABAPAC-RMF (abrdn Asia Pacific Equity Retirement Mutual Fund)  
**Date**: November 10, 2025  
**Status**: In Progress  

---

## Executive Summary

This testing plan validates what data we can actually retrieve from our API endpoints using ABAPAC-RMF as the reference case. This will inform which features from the target screenshots we can implement.

---

## 1. Test Objectives

### Primary Goals
1. ✅ Verify SETSMART API returns data for ABAPAC-RMF
2. ✅ Document all available data fields from SETSMART
3. ⚠️ Test Thailand SEC Fund Factsheet API (if accessible)
4. ✅ Map CSV metadata to fund symbol
5. ✅ Create comprehensive data availability report

### Success Criteria
- Successfully retrieve current NAV data for ABAPAC-RMF
- Document actual API response structure
- Identify which screenshot features are implementable
- Create data field mapping document

---

## 2. Reference Data: ABAPAC-RMF

From `docs/rmf-funds.csv`:

```csv
Symbol: ABAPAC-RMF
Fund Name: abrdn Asia Pacific Equity Retirement Mutual Fund
AMC: ABERDEEN ASSET MANAGEMENT (THAILAND) LIMITED
Fund Classification (AIMC): EQASxJP
Management Style: AM (Active Management)
Dividend Policy: No
Risk: 6 (High)
Fund for tax allowance: RMF
```

**Target Data from Screenshots:**
- Current NAV: 15.8339
- Benchmark: "68d MSCI AC Asia Pacific ex Japan"
- Performance metrics (YTD, 1W, 1M, 3M, 6M, 1Y, 3Y, 5Y, 10Y)
- Rankings (5/6 in RMF, 36/77 in category)
- Asset Allocation (Unit Trust 98.81%, etc.)
- Top Holdings (5 positions)

---

## 3. SETSMART API Test Results

### 3.1 Test: Current NAV Data

**Endpoint:**
```
GET /eod-price-by-symbol?symbol=ABAPAC-RMF&startDate={today}&endDate={today}&adjustedPriceFlag=N
```

**Status:** ⏳ Testing...

---

## 4. Data Availability Matrix

| Data Field | CSV | SETSMART | SEC Factsheet | Calculated | Status |
|------------|-----|----------|---------------|------------|--------|
| **Basic Information** |
| Fund Symbol | ✅ | ✅ | - | - | Available |
| Fund Name | ✅ | - | ⚠️ | - | CSV only |
| AMC Name | ✅ | - | ⚠️ | - | CSV only |
| Classification (AIMC) | ✅ | - | ⚠️ | - | CSV only |
| Management Style | ✅ | - | ⚠️ | - | CSV only |
| Dividend Policy | ✅ | - | ⚠️ | - | CSV only |
| Risk Level (1-8) | ✅ | - | ⚠️ | - | CSV only |
| Tax Allowance Type | ✅ | - | - | - | Available |
| Benchmark Name | ❌ | ❌ | ⚠️ | - | **TEST NEEDED** |
| Currency | ❌ | - | ⚠️ | - | Assume THB |
| **Current NAV** |
| Current NAV | - | ⏳ | ⚠️ | - | **TESTING** |
| NAV Date | - | ⏳ | ⚠️ | - | **TESTING** |
| Prior NAV | - | ⏳ | - | - | **TESTING** |
| NAV Change (Baht) | - | - | - | ✅ | Can Calculate |
| NAV Change (%) | - | - | - | ✅ | Can Calculate |
| **Trading Data** |
| Volume | - | ⏳ | - | - | **TESTING** |
| Value | - | ⏳ | - | - | **TESTING** |
| P/NAV Ratio | - | ⏳ | - | - | **TESTING** |
| **Performance** |
| YTD Return | - | - | ⚠️ | ⏳ | **TESTING** |
| 1 Week Return | - | - | ⚠️ | ⏳ | **TESTING** |
| 1 Month Return | - | - | ⚠️ | ⏳ | **TESTING** |
| 3 Months Return | - | - | ⚠️ | ⏳ | **TESTING** |
| 6 Months Return | - | - | ⚠️ | ⏳ | **TESTING** |
| 1 Year Return | - | - | ⚠️ | ⏳ | **TESTING** |
| 3 Year Return | - | - | ⚠️ | ⏳ | **TESTING** |
| 5 Year Return | - | - | ⚠️ | ⏳ | **TESTING** |
| 10 Year Return | - | - | ⚠️ | ⏳ | **TESTING** |
| Standard Deviation | - | - | ⚠️ | ⏳ | **TESTING** |
| **Rankings** |
| Rank in RMF | - | - | ❌ | ⚠️ | **Expensive** |
| Rank in Category | - | - | ❌ | ⚠️ | **Expensive** |
| Total Funds in Category | ✅ | - | ❌ | ✅ | Can count from CSV |
| **Portfolio Details** |
| Asset Allocation | - | - | ⚠️ | - | **TEST NEEDED** |
| Top Holdings | - | - | ⚠️ | - | **TEST NEEDED** |
| **Other** |
| Fees | - | - | ⚠️ | - | **TEST NEEDED** |
| Min Subscription | - | - | ⚠️ | - | **TEST NEEDED** |
| Inception Date | - | - | ⚠️ | - | **TEST NEEDED** |
| Factsheet PDF | - | - | ⚠️ | - | **TEST NEEDED** |

**Legend:**
- ✅ Confirmed available
- ⏳ Currently testing
- ⚠️ Needs testing to confirm
- ❌ Not available
- **TESTING** - Test in progress
- **TEST NEEDED** - Requires SEC API access
- **Expensive** - Requires many API calls (defer to Phase 4)

---

## 5. Test Execution Log

### Test 1: Current NAV Data
**Time:** ⏳ Starting...  
**Command:** Query ABAPAC-RMF current data  
**Result:** Pending...

### Test 2: Historical NAV Data (10 years)
**Time:** Pending  
**Command:** Query ABAPAC-RMF from 2015-11-10 to 2025-11-10  
**Result:** Pending...

### Test 3: CSV Metadata Verification
**Time:** ✅ Completed  
**Result:** Found ABAPAC-RMF with complete metadata  
**Data:**
- Symbol: ABAPAC-RMF
- Fund Name: abrdn Asia Pacific Equity Retirement Mutual Fund
- AMC: ABERDEEN ASSET MANAGEMENT (THAILAND) LIMITED
- Classification: EQASxJP (Asia Pacific Ex Japan)
- Management Style: AM (Active Management)
- Dividend Policy: No
- Risk: 6 (High)
- Tax Allowance: RMF

---

## 6. Next Steps

After completing tests:

1. ✅ Document actual API responses
2. ✅ Update data availability matrix
3. ✅ Calculate what performance metrics are possible
4. ⚠️ Investigate SEC Fund Factsheet API access
5. ✅ Create Phase 2 recommendations

---

**Document Status:** In Progress  
**Last Updated:** November 10, 2025
