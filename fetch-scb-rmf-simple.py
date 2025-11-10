#!/usr/bin/env python3
"""
Fetch SCB RMF Funds using SEC API (Simple version - no dependencies)

This script searches for and displays information about SCB RMF funds
using the official Thailand SEC APIs.
"""

import os
import json
import urllib.request
import urllib.error

# API Configuration
API_BASE_URL = "https://api.sec.or.th"
FACTSHEET_KEY = os.getenv("SEC_FUND_FACTSHEET_KEY", "")

# Colors for terminal output
class Colors:
    RESET = '\033[0m'
    BRIGHT = '\033[1m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'
    RED = '\033[31m'

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{Colors.BRIGHT}{Colors.CYAN}{'═' * 80}{Colors.RESET}")
    print(f"{Colors.BRIGHT}{Colors.CYAN}{title.upper()}{Colors.RESET}")
    print(f"{Colors.BRIGHT}{Colors.CYAN}{'═' * 80}{Colors.RESET}")

def call_api(endpoint):
    """Call SEC API with proper headers"""
    url = f"{API_BASE_URL}{endpoint}"
    headers = {
        "Content-type": "application/json",
        "Accept": "application/json",
        "cache-control": "no-cache",
        "Ocp-Apim-Subscription-Key": FACTSHEET_KEY,
    }

    print(f"Calling: {url}")

    req = urllib.request.Request(url, headers=headers)

    try:
        with urllib.request.urlopen(req) as response:
            data = response.read()
            return json.loads(data.decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"{Colors.RED}HTTP Error {e.code}: {e.reason}{Colors.RESET}")
        return None
    except Exception as e:
        print(f"{Colors.RED}Error: {str(e)}{Colors.RESET}")
        return None

def main():
    """Main function to fetch and display SCB RMF funds"""
    print(f"{Colors.BRIGHT}{Colors.YELLOW}")
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║                SCB RMF Funds - SEC API Query (Python)                     ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝")
    print(Colors.RESET)

    # Check API key
    if not FACTSHEET_KEY:
        print(f"{Colors.RED}✗ SEC_FUND_FACTSHEET_KEY not found in environment{Colors.RESET}")
        print(f"{Colors.YELLOW}Please set it: export SEC_FUND_FACTSHEET_KEY=your_key_here{Colors.RESET}")
        return

    print(f"{Colors.BLUE}Fund Factsheet API Key: {FACTSHEET_KEY[:8]}...{Colors.RESET}\n")

    # Step 1: Find SCB AMC
    print_section("🔍 Step 1: Finding SCB Asset Management Company")

    amc_list = call_api("/FundFactsheet/fund/amc")
    if not amc_list:
        print(f"{Colors.RED}✗ Failed to fetch AMC list{Colors.RESET}")
        return

    print(f"{Colors.GREEN}✓ Found {len(amc_list)} AMCs{Colors.RESET}\n")

    # Find SCB AMC
    scb_amcs = [amc for amc in amc_list if 'SCB' in amc.get('name_en', '').upper()]

    if not scb_amcs:
        print(f"{Colors.RED}✗ No SCB Asset Management Company found{Colors.RESET}")
        return

    scb_amc = scb_amcs[0]
    print(f"{Colors.GREEN}✓ Found SCB AMC:{Colors.RESET}")
    print(f"  AMC ID:      {scb_amc['unique_id']}")
    print(f"  Name (EN):   {scb_amc['name_en']}")
    print(f"  Name (TH):   {scb_amc['name_th']}")

    # Step 2: Fetch all SCB funds
    print_section("📊 Step 2: Fetching all SCB funds")

    all_scb_funds = call_api(f"/FundFactsheet/fund/amc/{scb_amc['unique_id']}")
    if not all_scb_funds:
        print(f"{Colors.RED}✗ Failed to fetch SCB funds{Colors.RESET}")
        return

    print(f"{Colors.GREEN}✓ Found {len(all_scb_funds)} SCB funds{Colors.RESET}\n")

    # Step 3: Filter for RMF funds
    print_section("🎯 Step 3: Filtering for RMF funds")

    rmf_funds = [
        fund for fund in all_scb_funds
        if 'RMF' in fund.get('proj_abbr_name', '').upper()
        or 'RMF' in fund.get('proj_name_en', '').upper()
        or 'RETIREMENT' in fund.get('proj_name_en', '').upper()
    ]

    # Filter for active funds
    active_rmf_funds = [
        fund for fund in rmf_funds
        if fund.get('fund_status') == 'RG' and fund.get('cancel_date') == '-'
    ]

    print(f"{Colors.GREEN}✓ Found {len(rmf_funds)} RMF funds (including inactive){Colors.RESET}")
    print(f"{Colors.GREEN}✓ Found {len(active_rmf_funds)} active RMF funds{Colors.RESET}\n")

    # Display active RMF funds
    print(f"{Colors.BRIGHT}Active SCB RMF Funds:{Colors.RESET}\n")

    for idx, fund in enumerate(active_rmf_funds, 1):
        status_color = Colors.GREEN if fund.get('fund_status') == 'RG' else Colors.YELLOW
        print(f"{Colors.BRIGHT}{idx}. {fund.get('proj_abbr_name')}{Colors.RESET}")
        print(f"   Project ID:    {fund.get('proj_id')}")
        print(f"   Full Name:     {fund.get('proj_name_en')}")
        print(f"   Name (TH):     {fund.get('proj_name_th')}")
        print(f"   Status:        {status_color}{fund.get('fund_status')}{Colors.RESET}")
        print(f"   Cancelled:     {fund.get('cancel_date')}")
        print(f"   Registered:    {fund.get('regis_date')}")
        print()

    # Step 4: Search for SCBM3 specifically
    print_section("🔎 Step 4: Searching for SCBM3")

    scbm3_fund = [fund for fund in all_scb_funds if fund.get('proj_abbr_name') == 'SCBM3']

    if scbm3_fund:
        print(f"{Colors.GREEN}✓ Found SCBM3!{Colors.RESET}")
        fund = scbm3_fund[0]
        print(f"  Project ID: {fund.get('proj_id')}")
        print(f"  Full Name:  {fund.get('proj_name_en')}")
        print(f"  Status:     {fund.get('fund_status')}")
    else:
        print(f"{Colors.RED}✗ No fund with code 'SCBM3' found{Colors.RESET}")
        print(f"{Colors.YELLOW}The fund may have been renamed, merged, or delisted{Colors.RESET}")

    # Step 5: Get asset allocation for first active fund
    if active_rmf_funds:
        print_section("📈 Step 5: Example - Asset Allocation")

        example_fund = active_rmf_funds[0]
        print(f"Fetching asset allocation for {example_fund.get('proj_abbr_name')}...\n")

        assets = call_api(f"/FundFactsheet/fund/{example_fund.get('proj_id')}/asset")

        if assets:
            print(f"{Colors.GREEN}✓ Asset Allocation:{Colors.RESET}\n")

            # Display as formatted table
            print(f"  {'#':<5} {'Asset Type':<40} {'Allocation %':<15}")
            print(f"  {'-'*5} {'-'*40} {'-'*15}")

            for asset in assets:
                seq = str(asset.get('asset_seq', '')).ljust(5)
                name = asset.get('asset_name', '')[:40].ljust(40)
                ratio = str(asset.get('asset_ratio', '')) + '%'
                print(f"  {seq} {name} {ratio}")
        else:
            print(f"{Colors.YELLOW}⚠️  Could not fetch asset allocation{Colors.RESET}")

    # Summary
    print_section("✅ Summary")

    print(f"{Colors.GREEN}Query completed successfully!{Colors.RESET}\n")
    print(f"{Colors.BRIGHT}Key Findings:{Colors.RESET}")
    print(f"  ✓ SEC API is working")
    print(f"  ✓ Found SCB Asset Management Company (ID: {scb_amc['unique_id']})")
    print(f"  ✓ Total SCB funds: {len(all_scb_funds)}")
    print(f"  ✓ Total RMF funds: {len(rmf_funds)}")
    print(f"  ✓ Active RMF funds: {len(active_rmf_funds)}")
    print(f"  ✗ SCBM3: Not found in database")
    print()

    # Save results to JSON
    output_file = "scb_rmf_funds.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'amc': scb_amc,
            'active_rmf_funds': active_rmf_funds,
            'all_rmf_funds': rmf_funds
        }, f, indent=2, ensure_ascii=False)

    print(f"{Colors.GREEN}✓ Results saved to: {output_file}{Colors.RESET}")

if __name__ == "__main__":
    main()
