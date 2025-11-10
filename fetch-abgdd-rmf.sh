#!/bin/bash

# ABGDD-RMF Fund Information Fetcher
# Uses SEC Fund Factsheet API to retrieve comprehensive fund data

API_KEY="618a3ffe11944da093afa7fd33f10a28"
BASE_URL="https://api.sec.or.th/FundFactsheet"
FUND_ID="M0570_2565"  # ABGDD-RMF

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to make API call
call_api() {
    local endpoint=$1
    local description=$2

    echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}${description}${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    echo -e "${BLUE}Endpoint: ${endpoint}${NC}\n"

    response=$(curl -s "${BASE_URL}${endpoint}" \
        -H "Ocp-Apim-Subscription-Key: ${API_KEY}" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json")

    if [ $? -eq 0 ]; then
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        echo -e "\n${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ API call failed${NC}"
    fi
}

echo -e "${BOLD}${YELLOW}"
echo "╔═════════════════════════════════════════════════════════════════╗"
echo "║        ABGDD-RMF Fund Factsheet - Complete Information         ║"
echo "║              abrdn Global Dynamic Dividend RMF                  ║"
echo "╚═════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# 1. Basic Fund Information
call_api "/fund/M0570_2565/specification" "1. Fund Specification"

# 2. Asset Allocation
call_api "/fund/M0570_2565/asset" "2. Asset Allocation"

# 3. Investment Policy
call_api "/fund/M0570_2565/policy" "3. Investment Policy"

# 4. Risk Information
call_api "/fund/M0570_2565/risk" "4. Risk Information"

# 5. Fee Structure
call_api "/fund/M0570_2565/fee" "5. Fee Structure"

# 6. Performance
call_api "/fund/M0570_2565/performance" "6. Fund Performance"

# 7. Return Information
call_api "/fund/M0570_2565/return" "7. Return Information"

# 8. Dividend History
call_api "/fund/M0570_2565/dividend" "8. Dividend History"

# 9. Fund Holdings (Portfolio)
call_api "/fund/M0570_2565/FundPort/latest" "9. Fund Holdings (Latest)"

# 10. Top 5 Holdings
call_api "/fund/M0570_2565/FundTop5/latest" "10. Top 5 Holdings (Latest)"

# 11. Benchmark
call_api "/fund/M0570_2565/benchmark" "11. Benchmark Information"

# 12. Suitability
call_api "/fund/M0570_2565/suitability" "12. Fund Suitability"

# 13. Redemption Information
call_api "/fund/M0570_2565/redemption" "13. Redemption Information"

# 14. Involved Parties
call_api "/fund/M0570_2565/InvolveParty" "14. Involved Parties"

# 15. Investment Information
call_api "/fund/M0570_2565/investment" "15. Investment Information"

# 16. Project Type
call_api "/fund/M0570_2565/project_type" "16. Project Type"

# 17. Turnover Ratio
call_api "/fund/M0570_2565/turnover_ratio" "17. Turnover Ratio"

# 18. 5 Year Loss Probability
call_api "/fund/M0570_2565/5YearLost" "18. 5-Year Loss Probability"

echo -e "\n${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}All API calls completed!${NC}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
