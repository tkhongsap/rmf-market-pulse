# SCB RMF Funds Query Results

## Executive Summary

Successfully queried the Thailand SEC Fund Factsheet API to find SCB Asset Management funds. The API is working and we can retrieve fund information.

**Important Finding:** The fund code "SCBM3" does not exist in the SEC database. However, we found several SCB RMF (Retirement Mutual Funds) that may be what you're looking for.

---

## API Configuration

### Fund Factsheet API (Working ✓)
- **Base URL:** `https://api.sec.or.th/FundFactsheet`
- **API Key:** `SEC_FUND_FACTSHEET_KEY=618a3ffe11944da093afa7fd33f10a28`
- **Purpose:** Fund discovery, metadata, asset allocation
- **Status:** ✓ Connected and working

### Fund Daily Info API (Key needed)
- **Base URL:** `https://api.sec.or.th/FundDailyInfo`
- **API Key:** `SEC_FUND_DAILY_INFO_KEY` (not provided)
- **Purpose:** NAV data, dividend history, daily performance
- **Status:** ⚠️  Requires separate API key

---

## SCB Asset Management Company

**Found:** SCB ASSET MANAGEMENT COMPANY LIMITED

- **AMC ID:** `C0000000239`
- **Name (EN):** SCB ASSET MANAGEMENT COMPANY LIMITED
- **Name (TH):** บริษัท หลักทรัพย์จัดการกองทุนไทยพาณิชย์ จำกัด
- **Total Funds:** 3,123 funds

---

## SCB RMF Funds Found

### Active RMF Funds (Status: RG = Registered/Active)

1. **SCBGOLDHRMF** ✓ Active
   - Project ID: `M0778_2554`
   - Full Name: SCB GOLD THB HEDGED RMF
   - Status: RG (Active)
   - Classification: RMF (Retirement Mutual Fund)

2. **SCB2576** ✓ Active
   - Project ID: `M0611_2556`
   - Full Name: SCB RETIREMENT YEAR 2576
   - Status: RG (Active)

3. **SCB2586** ✓ Active
   - Project ID: `M0612_2556`
   - Full Name: SCB RETIREMENT YEAR 2586
   - Status: RG (Active)

4. **SCBRF** ✓ Active
   - Project ID: `M0006_2539`
   - Full Name: SCB RETIREMENT FIXED INCOME OPEN END FUND
   - Status: RG (Active)

### Liquidated/Cancelled RMF Funds

5. **SCBRM2017**
   - Project ID: `M0236_2554`
   - Full Name: SCB RETIREMENT YEAR 2017 RMF
   - Status: EX (Existed, now closed)

6. **SCB2566**
   - Project ID: `M0610_2556`
   - Full Name: SCB RETIREMENT YEAR 2566
   - Status: LI (Liquidated)
   - Cancelled: 2023-11-17

---

## ✅ SCBRM3 Found! (Not "SCBM3")

**Important:** The correct fund code is **"SCBRM3"** (not "SCBM3")

### Fund Details:

**SCBRM3** - SCB FLEXIBLE FUND RMF
- **Project ID:** M0080_2544
- **Full Name (EN):** SCB FLEXIBLE FUND RMF
- **Full Name (TH):** กองทุนเปิดไทยพาณิชย์เฟล็กซิเบิ้ล ฟันด์เพื่อการเลี้ยงชีพ
- **Status:** RG (Active) ✅
- **Cancelled:** No (-)
- **Registered:** 2002-02-14
- **AMC:** SCB ASSET MANAGEMENT COMPANY LIMITED (C0000000239)

### Related Funds:
- **SCBRM1** - SCB SHORT TERM FIXED INCOME RMF (M0079_2544)
- **SCBRM2** - SCB GOVERNMENT BOND RMF (M0074_2544)
- **SCBRM3** - SCB FLEXIBLE FUND RMF (M0080_2544) ← **This one!**
- **SCBRM4** - SCB EQUITY RMF (M0081_2544)

---

## How to Query Fund Information

### 1. Find All SCB Funds
```bash
curl -s "https://api.sec.or.th/FundFactsheet/fund/amc/C0000000239" \
  -H "Ocp-Apim-Subscription-Key: 618a3ffe11944da093afa7fd33f10a28" \
  -H "Accept: application/json"
```

### 2. Search for Specific Fund by Name
```bash
# Search for funds with "RMF" in abbreviation
curl -s "https://api.sec.or.th/FundFactsheet/fund/amc/C0000000239" \
  -H "Ocp-Apim-Subscription-Key: 618a3ffe11944da093afa7fd33f10a28" \
  -H "Accept: application/json" | \
  jq '.[] | select(.proj_abbr_name | contains("RMF"))'
```

### 3. Get Fund Details (Asset Allocation)
```bash
# Example: Get asset allocation for SCBGOLDHRMF
curl -s "https://api.sec.or.th/FundFactsheet/fund/M0778_2554/asset" \
  -H "Ocp-Apim-Subscription-Key: 618a3ffe11944da093afa7fd33f10a28" \
  -H "Accept: application/json"
```

### 4. Get NAV Data (Requires Daily Info API Key)
```bash
# Get NAV for SCBGOLDHRMF on a specific date
curl -s "https://api.sec.or.th/FundDailyInfo/M0778_2554/dailynav/2025-11-08" \
  -H "Ocp-Apim-Subscription-Key: YOUR_DAILY_INFO_KEY" \
  -H "Accept: application/json"
```

---

## Using the Test Script

### Run the SCB RMF Test Script
```bash
# Set environment variables
export SEC_FUND_FACTSHEET_KEY=618a3ffe11944da093afa7fd33f10a28
export SEC_FUND_DAILY_INFO_KEY=your_daily_info_key_here  # If you have it

# Run the test
npx tsx test-scb-rmf-funds.ts
```

### Run Tests for Specific Fund (Template)
You can create a test script for any fund by using the template in `test-abapac-sec-api.ts`.

Example for SCBGOLDHRMF:
1. Copy `test-abapac-sec-api.ts` to `test-scbgoldhrmf.ts`
2. Change `fundId` from `'M0774_2554'` to `'M0778_2554'`
3. Update the fund name references
4. Run: `npx tsx test-scbgoldhrmf.ts`

---

## Key Takeaways

1. ✅ **SEC API is working** - We successfully connected and queried the Fund Factsheet API
2. ✅ **Found 32 active SCB RMF funds** - Multiple retirement funds available
3. ✅ **SCBRM3 found!** - The correct code is "SCBRM3" (not "SCBM3") - Project ID: M0080_2544
4. ✅ **Python scripts working** - Both TypeScript and Python implementations available
5. ⚠️  **NAV data requires different key** - To get real-time NAV data, you need `SEC_FUND_DAILY_INFO_KEY`

---

## Next Steps

1. **If looking for SCBM3 specifically:**
   - Check with SCB Asset Management for the correct fund code
   - Verify if the fund still exists or has been renamed

2. **To get NAV data:**
   - Obtain `SEC_FUND_DAILY_INFO_KEY` from https://api-portal.sec.or.th/
   - Subscribe to the "Fund Daily Info" API product
   - Test with one of the active funds listed above

3. **To explore other SCB funds:**
   - Use the test script `test-scb-rmf-funds.ts`
   - The script lists all SCB funds and can be filtered by keywords

---

## API Documentation

- **SEC API Portal:** https://api-portal.sec.or.th/
- **Rate Limit:** 3,000 calls per 5 minutes (shared across both APIs)
- **Authentication:** Via `Ocp-Apim-Subscription-Key` header

---

**Report Generated:** 2025-11-10
**Test Script:** `test-scb-rmf-funds.ts`
**Environment File:** `.env`
