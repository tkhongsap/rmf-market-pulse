# OpenAI Apps SDK Golden Prompts

This document defines test prompts for validating Thai Fund Market Pulse OpenAI App SDK integration. These prompts test discovery accuracy (when tools are invoked), data quality, and component rendering.

## Overview

Golden prompts are categorized into three types:
- **Direct Prompts**: Explicit requests that should ALWAYS trigger our tools
- **Indirect Prompts**: Conversational queries that should intelligently trigger our tools
- **Negative Prompts**: Out-of-scope queries that should NOT trigger our tools

## Direct Prompts (Must Trigger Tools)

These prompts explicitly request RMF fund data and should always invoke our MCP tools.

### 1. List Query
```
Show me top RMF funds
```
**Expected Behavior:**
- Tool: `get_rmf_funds`
- Component: Fund List Widget (carousel)
- Data: Top 10-20 funds by recent performance
- Display: Inline carousel with fund cards

### 2. Search Query
```
Find RMF funds from Krungsri Asset Management
```
**Expected Behavior:**
- Tool: `search_rmf_funds`
- Parameters: `{ "amc": "Krungsri Asset Management" }`
- Component: Fund List Widget (carousel)
- Data: All RMF funds from specified AMC
- Display: Inline carousel with fund cards

### 3. Detail Query
```
Tell me about B-ASEANRMF fund
```
**Expected Behavior:**
- Tool: `get_rmf_fund_detail`
- Parameters: `{ "fundCode": "B-ASEANRMF" }`
- Component: Fund Card Widget (single fund)
- Data: Complete fund details (NAV, performance, risk, fees)
- Display: Inline card with "View Details" button

### 4. Performance Query
```
Show me RMF funds with the best 1-year performance
```
**Expected Behavior:**
- Tool: `get_rmf_fund_performance`
- Parameters: `{ "period": "1y", "sortBy": "desc", "limit": 10 }`
- Component: Fund List Widget (carousel) with performance sorting
- Data: Top 10 funds by 1Y return
- Display: Inline carousel highlighting performance metrics

### 5. Chart Query
```
Show me the NAV history for B-ASEANRMF over the last 30 days
```
**Expected Behavior:**
- Tool: `get_rmf_fund_nav_history`
- Parameters: `{ "fundCode": "B-ASEANRMF", "days": 30 }`
- Component: Performance Chart Widget
- Data: 30-day NAV history with dates and values
- Display: Inline line chart with zoom controls

## Indirect Prompts (Should Trigger Tools)

These prompts don't explicitly mention "RMF funds" but should intelligently trigger our tools based on context.

### 6. Retirement Planning
```
I want to save for retirement with tax benefits in Thailand
```
**Expected Behavior:**
- Tool: `get_rmf_funds`
- Context: ChatGPT should recognize RMF funds offer retirement tax benefits in Thailand
- Component: Fund List Widget (carousel)
- Data: Top RMF funds with explanation of tax benefits
- Display: Inline carousel with educational context

### 7. Tax Deduction
```
What are the best tax-deductible investment options in Thailand?
```
**Expected Behavior:**
- Tool: `get_rmf_funds`
- Context: ChatGPT should know RMF funds offer tax deductions up to THB 500,000/year
- Component: Fund List Widget (carousel)
- Data: Top RMF funds grouped by risk level
- Display: Inline carousel with tax benefit explanation

### 8. Risk-Based Query
```
I'm a conservative investor looking for low-risk retirement funds
```
**Expected Behavior:**
- Tool: `search_rmf_funds`
- Parameters: `{ "riskLevel": "low" }`
- Component: Fund List Widget (carousel)
- Data: RMF funds with risk_level 1-3
- Display: Inline carousel filtered by risk

### 9. Asset Manager Query
```
Which funds does Krungsri offer for retirement?
```
**Expected Behavior:**
- Tool: `search_rmf_funds`
- Parameters: `{ "amc": "Krungsri Asset Management" }`
- Component: Fund List Widget (carousel)
- Data: All Krungsri RMF funds
- Display: Inline carousel

### 10. Comparison Query
```
Compare B-ASEANRMF and KFRMF-FIXED
```
**Expected Behavior:**
- Tool: `compare_rmf_funds`
- Parameters: `{ "fundCodes": ["B-ASEANRMF", "KFRMF-FIXED"] }`
- Component: Comparison Widget (fullscreen recommended)
- Data: Side-by-side comparison of both funds
- Display: Fullscreen table or card comparison

## Negative Prompts (Should NOT Trigger Tools)

These prompts are outside our scope and should NOT invoke our MCP tools.

### 11. US Stock Market
```
Show me S&P 500 index performance
```
**Expected Behavior:**
- Tool: NONE (our tools should not be invoked)
- Response: ChatGPT uses general knowledge or other tools
- Reason: We only cover Thai RMF funds, not US indices

### 12. Real Estate
```
What are good real estate investment trusts in Thailand?
```
**Expected Behavior:**
- Tool: NONE (our tools should not be invoked)
- Response: ChatGPT uses general knowledge
- Reason: We don't cover REITs, only RMF funds

### 13. Cryptocurrency
```
Should I invest in Bitcoin for retirement?
```
**Expected Behavior:**
- Tool: NONE (our tools should not be invoked)
- Response: ChatGPT provides general advice
- Reason: We don't cover cryptocurrency

### 14. Individual Stocks
```
Show me the top Thai stocks today
```
**Expected Behavior:**
- Tool: NONE (our tools should not be invoked)
- Response: ChatGPT might use other market data tools
- Reason: We don't cover individual stocks, only mutual funds

### 15. Non-Thailand Markets
```
What are the best retirement funds in Singapore?
```
**Expected Behavior:**
- Tool: NONE (our tools should not be invoked)
- Response: ChatGPT uses general knowledge
- Reason: We only cover Thailand SEC-regulated funds

## Edge Cases & Clarification Prompts

These prompts test how the system handles ambiguity and edge cases.

### 16. Ambiguous Fund Type
```
Show me ESG funds
```
**Expected Behavior:**
- Tool: NONE initially (our app is RMF-only, but we also have ESG data)
- Response: ChatGPT should ask for clarification: "Are you looking for Thai ESG funds or RMF funds with ESG focus?"
- Follow-up: If user says "Thai ESG", our tools should NOT trigger (we focus on RMF)

### 17. Invalid Fund Code
```
Tell me about INVALID-FUND-CODE
```
**Expected Behavior:**
- Tool: `get_rmf_fund_detail` is invoked
- Response: Tool returns error/empty result
- Component: Error message card
- ChatGPT: Should gracefully handle "Fund not found" and ask if user wants to search

### 18. Partial Fund Name
```
Show me funds with "ASEAN" in the name
```
**Expected Behavior:**
- Tool: `search_rmf_funds`
- Parameters: `{ "search": "ASEAN" }`
- Component: Fund List Widget (carousel)
- Data: All RMF funds matching "ASEAN" (e.g., B-ASEANRMF, SCB-ASEANRMF)

### 19. Mixed Query
```
Compare B-ASEANRMF performance with the S&P 500
```
**Expected Behavior:**
- Tool: `get_rmf_fund_detail` for B-ASEANRMF
- Component: Fund Card Widget for B-ASEANRMF
- Response: ChatGPT shows RMF fund data via our tool, then uses general knowledge for S&P 500 comparison

### 20. Conversational Context
```
User: "Show me top RMF funds"
Assistant: [Shows carousel]
User: "What about the second one?"
```
**Expected Behavior:**
- Tool: `get_rmf_fund_detail` with fund code from conversation context
- Component: Fund Detail Widget (fullscreen)
- Context: ChatGPT should remember which fund was "second" in previous response

## Testing Guidelines

### Discovery Testing
1. Test each prompt category to ensure tools are invoked correctly
2. Verify tool parameters match expected values
3. Check that negative prompts don't trigger tools

### Component Testing
1. Verify correct widget is rendered for each tool
2. Check data hydration (structuredContent → component state)
3. Test theme switching (light/dark mode)
4. Validate responsive layouts on mobile

### Conversation Testing
1. Test multi-turn conversations with context
2. Verify state persistence across turns
3. Test follow-up questions and clarifications

### Error Handling
1. Test invalid fund codes
2. Test empty search results
3. Test API failures
4. Verify graceful degradation

## Success Metrics

- **Discovery Accuracy**: 100% for direct prompts, 80%+ for indirect prompts, 0% for negative prompts
- **Component Rendering**: All widgets render correctly in < 2 seconds
- **Data Quality**: All displayed data matches source JSON files
- **Accessibility**: WCAG AA compliance for all widgets
- **Mobile Support**: All widgets work on iOS/Android ChatGPT apps

## Revision History

- 2025-11-12: Initial version (20 golden prompts defined)
