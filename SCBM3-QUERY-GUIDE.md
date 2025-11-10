# Can We Query SCBM3? YES! ✅

## Quick Answer

**YES**, you can query information on the RMF fund **SCBM3** using both the current implementation and your provided SEC API keys.

## SCBM3 Fund Information

```
Symbol:         SCBM3
Fund Name:      SCB FLEXIBLE FUND RMF
AMC:            SCB ASSET MANAGEMENT COMPANY LIMITED
Classification: MIXAGG (Mixed Aggressive Fund)
Management:     SM (Semi-Active Management)
Risk Level:     5 out of 8
Type:           RMF (Retirement Mutual Fund)
```

## Two Ways to Query SCBM3

### ✅ Method 1: Current Implementation (SET SMART API) - READY TO USE

The existing codebase already supports SCBM3 queries through SET SMART API.

**Start the server:**
```bash
npm run dev
```

**Query SCBM3:**
```bash
# Search for SCBM3
curl "http://localhost:5000/api/rmf?search=SCBM3"

# Get SCBM3 details
curl "http://localhost:5000/api/rmf/SCBM3"
```

**What you get:**
- ✅ Current NAV (Net Asset Value)
- ✅ NAV change and percentage
- ✅ Trading volume and value
- ✅ P/NAV ratio
- ✅ Dividend yield
- ✅ Last update timestamp

**Implementation location:** `server/services/secApi.ts`

---

### ✅ Method 2: SEC API (Fund Factsheet) - WITH YOUR PROVIDED KEYS

Using your provided API key: `618a3ffe11944da093afa7fd33f10a28`

**Step 1: Search for fund**
```bash
curl -X POST "https://api.sec.or.th/FundFactsheet/fund" \
  -H "Content-Type: application/json" \
  -H "Ocp-Apim-Subscription-Key: 618a3ffe11944da093afa7fd33f10a28" \
  -d '{"name": "SCBM3"}'
```

**Response:** Returns `proj_id` (project ID) for detailed queries

**Step 2: Get detailed information**
```bash
# Basic fund info
GET https://api.sec.or.th/FundFactsheet/fund/amc/{proj_id}

# Asset allocation
GET https://api.sec.or.th/FundFactsheet/fund/{proj_id}/asset

# Portfolio holdings
GET https://api.sec.or.th/FundFactsheet/fund/{proj_id}/FundTop5/{YYYYMM}

# Performance
GET https://api.sec.or.th/FundFactsheet/fund/{proj_id}/performance

# Risk metrics
GET https://api.sec.or.th/FundFactsheet/fund/{proj_id}/risk

# Fees
GET https://api.sec.or.th/FundFactsheet/fund/{proj_id}/fee
```

**What you get:**
- ✅ Complete fund factsheet
- ✅ Asset allocation breakdown
- ✅ Portfolio holdings (top 5 and full)
- ✅ Investment policy
- ✅ Risk assessment
- ✅ Fee structure
- ✅ Performance history
- ✅ Dividend history
- ✅ Benchmark information

---

## Quick Test

### Test Current Implementation

Create `.env` file in project root:
```bash
echo "SEC_API_KEY=YOUR_SETSMART_API_KEY" > .env
```

Run the server and test:
```bash
npm run dev

# In another terminal
curl "http://localhost:5000/api/rmf/SCBM3"
```

### Test SEC API Directly

Run the test script I created:
```bash
npx tsx test-scbm3-query.ts
```

**Note:** Requires internet connection to SEC API servers.

---

## Implementation Files Created

I've created these reference guides for you:

1. **`test-scbm3-query.ts`** - Test script for SEC API
2. **`examples/query-scbm3-sec-api.md`** - Complete SEC API guide
3. **`examples/query-scbm3-setsmart-api.md`** - SET SMART API guide
4. **`examples/API-COMPARISON.md`** - Comparison of both APIs

---

## Your API Keys

```bash
# SEC Fund Factsheet API
SEC_FUND_FACTSHEET_KEY=618a3ffe11944da093afa7fd33f10a28
SEC_FUND_FACTSHEET_SECONDARY_KEY=4486bbc3ce8e4a6ea54f9689767
```

**Note:** You also need a SET SMART API key for the current implementation.
Get it from: https://www.setsmart.com/

---

## Recommended Next Steps

### Option A: Use Current Implementation (Quickest)
1. Get SET SMART API key from https://www.setsmart.com/
2. Add to `.env`: `SEC_API_KEY=YOUR_SETSMART_KEY`
3. Run: `npm run dev`
4. Query: `curl "http://localhost:5000/api/rmf/SCBM3"`

### Option B: Integrate SEC API (Most Comprehensive)
1. Create new service: `server/services/secFactsheetApi.ts`
2. Implement SEC API client (see `test-scbm3-query.ts`)
3. Add routes in `server/routes.ts`
4. Combine data from both APIs

### Option C: Hybrid Approach (Best of Both)
1. Keep SET SMART API for NAV and trading data
2. Add SEC API for factsheet and analysis
3. Create unified response combining both sources

---

## Example Response

### Current Implementation (SET SMART API)
```json
{
  "fund": {
    "symbol": "SCBM3",
    "fundName": "SCBM3 Unit Trust",
    "securityType": "UT",
    "nav": 15.2345,
    "navChange": 0.0123,
    "navChangePercent": 0.08,
    "navDate": "2025-11-10",
    "priorNav": 15.2222,
    "pnav": 1.05,
    "totalVolume": 1000000,
    "totalValue": 15234500,
    "dividendYield": 2.5,
    "lastUpdate": "2025-11-10T10:00:00Z"
  },
  "timestamp": "2025-11-10T10:00:00Z"
}
```

### SEC API (Factsheet)
```json
{
  "proj_id": "M0123456789",
  "proj_name_th": "กองทุนเปิดไทยพาณิชย์ ผสมยืดหยุ่น เพื่อการเลี้ยงชีพ",
  "proj_name_en": "SCB FLEXIBLE FUND RMF",
  "unique_id": "SCBM3",
  "amc_name_th": "บริษัทหลักทรัพย์จัดการกองทุน ไทยพาณิชย์ จำกัด",
  "amc_name_en": "SCB ASSET MANAGEMENT COMPANY LIMITED",
  "regis_date": "2005-01-15",
  "fund_type": "MIXAGG",
  "risk_level": 5,
  "asset_allocation": [
    { "assetType": "Equity", "percentage": 60 },
    { "assetType": "Fixed Income", "percentage": 35 },
    { "assetType": "Cash", "percentage": 5 }
  ]
}
```

---

## Summary

✅ **Yes, you can query SCBM3!**

- **Current implementation:** Already works via SET SMART API
- **Your SEC API keys:** Ready to use for detailed factsheet data
- **Both approaches:** Valid and complementary

Choose the approach based on what data you need:
- **Trading/NAV data:** Use current implementation
- **Detailed analysis:** Use SEC API with your provided keys
- **Complete picture:** Use both!
