#!/usr/bin/env python3
"""
Fetch SCB RMF Funds using SEC API

This script searches for and displays information about SCB RMF funds
using the official Thailand SEC APIs.

Based on the utility/sec-api-example templates.
"""

import os
import sys
import requests
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

# Add utility path for imports
sys.path.append(str(Path(__file__).parent / "utility" / "sec-api-example"))

# Try to load dotenv if available
try:
    from dotenv import load_dotenv
    load_dotenv(Path(".env"))
except ImportError:
    print("Note: python-dotenv not installed, using environment variables directly")

# API Configuration
API_BASE_URL = os.getenv("Url", "https://api.sec.or.th")
FACTSHEET_KEY = os.getenv("SEC_FUND_FACTSHEET_KEY")
DAILY_INFO_KEY = os.getenv("SEC_FUND_DAILY_INFO_KEY")

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

def call_api(endpoint, api_key):
    """Call SEC API with proper headers"""
    url = f"{API_BASE_URL}{endpoint}"
    headers = {
        "Content-type": "application/json",
        "Accept": "application/json",
        "cache-control": "no-cache",
        "Ocp-Apim-Subscription-Key": api_key,
    }

    print(f"Calling: {url}")
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"{Colors.RED}Error {response.status_code}: {response.text}{Colors.RESET}")
        return None

def fetch_amc_list():
    """Fetch list of all Asset Management Companies"""
    return call_api("/FundFactsheet/fund/amc", FACTSHEET_KEY)

def fetch_funds_by_amc(amc_id):
    """Fetch all funds under a specific AMC"""
    return call_api(f"/FundFactsheet/fund/amc/{amc_id}", FACTSHEET_KEY)

def fetch_fund_asset(proj_id):
    """Fetch asset allocation for a specific fund"""
    return call_api(f"/FundFactsheet/fund/{proj_id}/asset", FACTSHEET_KEY)

def fetch_fund_nav(proj_id, nav_date):
    """Fetch NAV data for a specific fund and date"""
    if not DAILY_INFO_KEY:
        return None
    return call_api(f"/FundDailyInfo/{proj_id}/dailynav/{nav_date}", DAILY_INFO_KEY)

def main():
    """Main function to fetch and display SCB RMF funds"""
    print(f"{Colors.BRIGHT}{Colors.YELLOW}")
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║                SCB RMF Funds - SEC API Query (Python)                     ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝")
    print(Colors.RESET)

    # Check API keys
    if not FACTSHEET_KEY:
        print(f"{Colors.RED}✗ SEC_FUND_FACTSHEET_KEY not found in environment{Colors.RESET}")
        print(f"{Colors.YELLOW}Please set it in your .env file or export it{Colors.RESET}")
        return

    print(f"{Colors.BLUE}Fund Factsheet API Key: {FACTSHEET_KEY[:8]}...{Colors.RESET}")

    if DAILY_INFO_KEY:
        print(f"{Colors.BLUE}Fund Daily Info API Key: {DAILY_INFO_KEY[:8]}...{Colors.RESET}")
    else:
        print(f"{Colors.YELLOW}⚠️  SEC_FUND_DAILY_INFO_KEY not set - NAV data will not be available{Colors.RESET}")

    # Step 1: Find SCB AMC
    print_section("🔍 Step 1: Finding SCB Asset Management Company")

    amc_list = fetch_amc_list()
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

    all_scb_funds = fetch_funds_by_amc(scb_amc['unique_id'])
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

    if not active_rmf_funds:
        print(f"{Colors.YELLOW}No active RMF funds found{Colors.RESET}")
        print(f"\nShowing all RMF funds (including inactive):\n")
        active_rmf_funds = rmf_funds

    # Display active RMF funds
    print(f"{Colors.BRIGHT}Active SCB RMF Funds:{Colors.RESET}\n")

    for idx, fund in enumerate(active_rmf_funds, 1):
        status_color = Colors.GREEN if fund.get('fund_status') == 'RG' else Colors.YELLOW
        print(f"{Colors.BRIGHT}{idx}. {fund.get('proj_abbr_name')}{Colors.RESET}")
        print(f"   Project ID:    {fund.get('proj_id')}")
        print(f"   Full Name:     {fund.get('proj_name_en')}")
        print(f"   Name (TH):     {fund.get('proj_name_th')}")
        print(f"   Status:        {status_color}{fund.get('fund_status')}{Colors.RESET} ({fund.get('cancel_date')})")
        print(f"   Registered:    {fund.get('regis_date')}")
        print()

    # Step 4: Search for SCBM3 specifically
    print_section("🔎 Step 4: Searching for SCBM3")

    scbm3_fund = [fund for fund in all_scb_funds if fund.get('proj_abbr_name') == 'SCBM3']

    if scbm3_fund:
        print(f"{Colors.GREEN}✓ Found SCBM3!{Colors.RESET}")
        print(scbm3_fund[0])
    else:
        print(f"{Colors.RED}✗ No fund with code 'SCBM3' found{Colors.RESET}")
        print(f"{Colors.YELLOW}The fund may have been renamed, merged, or delisted{Colors.RESET}")

    # Step 5: Get asset allocation for one fund (example)
    if active_rmf_funds:
        print_section("📈 Step 5: Example - Asset Allocation")

        example_fund = active_rmf_funds[0]
        print(f"Fetching asset allocation for {example_fund.get('proj_abbr_name')}...\n")

        assets = fetch_fund_asset(example_fund.get('proj_id'))

        if assets:
            print(f"{Colors.GREEN}✓ Asset Allocation:{Colors.RESET}\n")
            df = pd.DataFrame(assets)

            # Display as table
            if not df.empty:
                print(df[['asset_seq', 'asset_name', 'asset_ratio']].to_string(index=False))
            else:
                print(f"{Colors.YELLOW}No asset data available{Colors.RESET}")
        else:
            print(f"{Colors.YELLOW}⚠️  Could not fetch asset allocation{Colors.RESET}")

    # Step 6: Export to Excel
    print_section("💾 Step 6: Export to Excel")

    try:
        # Create DataFrame
        df_funds = pd.DataFrame(active_rmf_funds)

        # Select relevant columns
        columns = ['proj_id', 'proj_abbr_name', 'proj_name_en', 'proj_name_th',
                   'fund_status', 'regis_date', 'cancel_date']
        df_export = df_funds[columns] if not df_funds.empty else df_funds

        # Export to Excel
        filename = f"scb_rmf_funds_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        df_export.to_excel(filename, index=False, sheet_name='SCB RMF Funds')

        print(f"{Colors.GREEN}✓ Data exported to: {filename}{Colors.RESET}")
        print(f"  Total records: {len(df_export)}")
    except Exception as e:
        print(f"{Colors.YELLOW}⚠️  Could not export to Excel: {str(e)}{Colors.RESET}")
        print(f"{Colors.YELLOW}Install openpyxl: pip install openpyxl{Colors.RESET}")

    # Summary
    print_section("✅ Summary")

    print(f"{Colors.GREEN}Query completed successfully!{Colors.RESET}\n")
    print(f"{Colors.BRIGHT}Key Findings:{Colors.RESET}")
    print(f"  ✓ SEC API is working")
    print(f"  ✓ Found SCB Asset Management Company")
    print(f"  ✓ Total SCB funds: {len(all_scb_funds)}")
    print(f"  ✓ Active RMF funds: {len(active_rmf_funds)}")
    print(f"  ✗ SCBM3: Not found in database")
    print()

if __name__ == "__main__":
    main()
