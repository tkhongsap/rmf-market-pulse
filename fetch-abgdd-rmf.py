#!/usr/bin/env python3
"""
ABGDD-RMF Fund Information Fetcher
Uses SEC Fund Factsheet API to retrieve comprehensive fund data
"""

import requests
import json
import sys

API_KEY = "618a3ffe11944da093afa7fd33f10a28"
BASE_URL = "https://api.sec.or.th/FundFactsheet"
FUND_ID = "M0570_2565"  # ABGDD-RMF

# Colors
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    BOLD = '\033[1m'
    NC = '\033[0m'

def call_api(endpoint, description):
    """Make API call and display results"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'═'*70}{Colors.NC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{description}{Colors.NC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'═'*70}{Colors.NC}\n")
    print(f"{Colors.BLUE}Endpoint: {endpoint}{Colors.NC}\n")

    headers = {
        "Ocp-Apim-Subscription-Key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=10)
        response.raise_for_status()

        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        print(f"\n{Colors.GREEN}✓ Success{Colors.NC}")

        return data
    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}✗ API call failed: {str(e)}{Colors.NC}")
        return None
    except json.JSONDecodeError as e:
        print(f"{Colors.RED}✗ JSON decode error: {str(e)}{Colors.NC}")
        print(f"Response text: {response.text[:500]}")
        return None

def main():
    print(f"{Colors.BOLD}{Colors.YELLOW}")
    print("╔═════════════════════════════════════════════════════════════════╗")
    print("║        ABGDD-RMF Fund Factsheet - Complete Information         ║")
    print("║              abrdn Global Dynamic Dividend RMF                  ║")
    print("╚═════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.NC}\n")

    # Collect all data
    all_data = {}

    # API endpoints to call
    endpoints = [
        ("/fund/M0570_2565/specification", "1. Fund Specification"),
        ("/fund/M0570_2565/asset", "2. Asset Allocation"),
        ("/fund/M0570_2565/policy", "3. Investment Policy"),
        ("/fund/M0570_2565/risk", "4. Risk Information"),
        ("/fund/M0570_2565/fee", "5. Fee Structure"),
        ("/fund/M0570_2565/performance", "6. Fund Performance"),
        ("/fund/M0570_2565/return", "7. Return Information"),
        ("/fund/M0570_2565/dividend", "8. Dividend History"),
        ("/fund/M0570_2565/FundPort/latest", "9. Fund Holdings (Latest)"),
        ("/fund/M0570_2565/FundTop5/latest", "10. Top 5 Holdings (Latest)"),
        ("/fund/M0570_2565/benchmark", "11. Benchmark Information"),
        ("/fund/M0570_2565/suitability", "12. Fund Suitability"),
        ("/fund/M0570_2565/redemption", "13. Redemption Information"),
        ("/fund/M0570_2565/InvolveParty", "14. Involved Parties"),
        ("/fund/M0570_2565/investment", "15. Investment Information"),
        ("/fund/M0570_2565/project_type", "16. Project Type"),
        ("/fund/M0570_2565/turnover_ratio", "17. Turnover Ratio"),
        ("/fund/M0570_2565/5YearLost", "18. 5-Year Loss Probability"),
    ]

    for endpoint, description in endpoints:
        key = description.split(". ")[1]  # Extract the name
        data = call_api(endpoint, description)
        if data is not None:
            all_data[key] = data

    print(f"\n{Colors.BOLD}{Colors.GREEN}{'═'*70}{Colors.NC}")
    print(f"{Colors.BOLD}{Colors.GREEN}All API calls completed!{Colors.NC}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'═'*70}{Colors.NC}\n")

    # Save to file
    output_file = "abgdd-rmf-complete-data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)

    print(f"{Colors.BOLD}{Colors.CYAN}Complete data saved to: {output_file}{Colors.NC}\n")

    # Print summary
    print(f"{Colors.BOLD}{Colors.YELLOW}Summary:{Colors.NC}")
    print(f"  Total API endpoints called: {len(endpoints)}")
    print(f"  Successful responses: {len(all_data)}")
    print(f"  Failed responses: {len(endpoints) - len(all_data)}\n")

if __name__ == "__main__":
    main()
