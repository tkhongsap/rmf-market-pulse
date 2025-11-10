
# API Service

## API Overview

## API Specification
* Get API Key
* Get Stock Quote
  - By Symbol
  - All Symbol
* Get Financial Data
  - By Symbol
  - All Symbol
* Document

## Feedback
* Give us your feedback  
* Email: infoproducts@set.or.th

----

# Get Financial Data by Symbol

Financial data and financial ratio in fiscal year by company. Period of historical data is available according to your SETSMART package.

### Specification | Try it

#### Request

**HTTP request**

```
https://www.setsmart.com/api/listed-company-api/financial-data-and-ratio-by-symbol
```

#### Parameters

The following table lists the parameters that this query supports. All of the parameters listed are query parameters.

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>api-key (header)</td>
<td>string • required</td>
<td>Your API key (that created at API Key page)</td>
</tr>
<tr>
<td>symbol (query)</td>
<td>string • required</td>
<td>Stock symbol (ex. PTT, AOT, EGCO). Only one symbol can be used per request.</td>
</tr>
<tr>
<td>startYear (query)</td>
<td>string • required</td>
<td>Fiscal year in "YYYY" format.</td>
</tr>
</tbody>
</table>






# API Service

<table>
<thead>
<tr>
<th>Parameters</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>startQuarter<br>(query)</td>
<td>string • required</td>
<td>Fiscal quarter of startYear. Value should be 1 to 4.</td>
</tr>
<tr>
<td>endYear<br>(query)</td>
<td>string</td>
<td>Fiscal year in "YYYY" format.</td>
</tr>
<tr>
<td>endQuarter<br>(query)</td>
<td>string</td>
<td>Fiscal quarter of endYear. Value should be 1 to 4.</td>
</tr>
</tbody>
</table>

## Response

```json
{
  "symbol": "string",
  "year": "string",
  "quarter": "string",
  "financialStatementType": "string",
  "dateAsof": "string",
  "accountPeriod": "string",
  "totalAssets": "number",
  "totalLiabilities": "number",
  "paidupShareCapital": "number",
  "shareholderEquity": "number",
  "totalEquity": "number",
  "totalRevenueQuarter": "number",
  "totalRevenueAccum": "number",
  "totalExpensesQuarter": "number",
  "totalExpensesAccum": "number",
  "ebitQuarter": "number",
  "ebitAccum": "number",
  "netProfitQuarter": "number",
  "netProfitAccum": "number",
  "epsQuarter": "number",
  "epsAccum": "number",
  "operatingCashFlow": "number",
  "investingCashFlow": "number",
  "financingCashFlow": "number",
  "roe": "number",
  "roa": "number",
  "netProfitMarginQuarter": "number",
  "netProfitMarginAccum": "number",
  "de": "number",
  "fixedAssetTurnover": "number",
  "totalAssetTurnover": "number"
}
```

## Properties

The following table defines the properties that appear in this resource:






<table>
    <thead>
    <tr>
        <th>Properties</th>
        <th>Type</th>
        <th>Description</th>
    </tr>
    </thead>
    <tr>
        <td>symbol</td>
        <td colspan="2">string Security symbol</td>
    </tr>
<tr>
        <td>year</td>
        <td colspan="2">string Year of financial statement</td>
    </tr>
<tr>
        <td>quarter</td>
        <td colspan="2">string Quarter of financial statement</td>
    </tr>
<tr>
        <td>financialStatementType</td>
        <td colspan="2">string Financial statement type
<br/>
- C = Consolidate
<br/>
- E = Equity Method
<br/>
- U = Company
<br/>
Only one financial statement type will be sent out for one
<br/>
symbol.
<br/>
- If there are financial statement type "C" and "U", only
<br/>
"C" will be sent out
<br/>
- If there are financial statement type "E" and "U", only
<br/>
"E" will be sent out
<br/>
- Financial statement type "U" will be sent out if there is
<br/>
no "C" nor "E"</td>
    </tr>
<tr>
        <td>dateAsof</td>
        <td colspan="2">string As of date of financial statement</td>
    </tr>
<tr>
        <td>accountPeriod</td>
        <td colspan="2">string Account Period
<br/>
- F = Fiscal Year
<br/>
- C = Calendar Year</td>
    </tr>
<tr>
        <td>totalAssets</td>
        <td colspan="2">number Total assets
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>totalLiabilities</td>
        <td colspan="2">number Total liabilities
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>paidupShareCapital</td>
        <td colspan="2">number Paidup capital
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>shareholderEquity</td>
        <td colspan="2">number Shareholders' equity
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>totalEquity</td>
        <td colspan="2">number Total equity
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>totalRevenueQuarter</td>
        <td colspan="2">number Total revenue (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>totalRevenueAccum</td>
        <td colspan="2">number Total revenue (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>totalExpensesQuarter</td>
        <td colspan="2">number Total expense (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>totalExpensesAccum</td>
        <td colspan="2">number Total expense (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
</table>







<table>
    <thead>
    <tr>
        <th>Properties</th>
        <th>Type</th>
        <th>Description</th>
    </tr>
    </thead>
    <tr>
        <td>ebitQuarter</td>
        <td colspan="2">number EBIT (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>ebitAccum</td>
        <td colspan="2">number EBIT (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>netProfitQuarter</td>
        <td colspan="2">number Net profit (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>netProfitAccum</td>
        <td colspan="2">number Net profit (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>epsQuarter</td>
        <td colspan="2">number Earning per share (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>epsAccum</td>
        <td colspan="2">number Earning per share (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>operatingCashFlow</td>
        <td colspan="2">number Operating cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>investingCashFlow</td>
        <td colspan="2">number Investing cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>financingCashFlow</td>
        <td colspan="2">number Financing cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>roe</td>
        <td colspan="2">number Return on equity</td>
    </tr>
<tr>
        <td>roa</td>
        <td colspan="2">number Return on asset</td>
    </tr>
<tr>
        <td>netProfitMarginQuarter</td>
        <td colspan="2">number Net profit margin (value of that quarter)</td>
    </tr>
<tr>
        <td>netProfitMarginAccum</td>
        <td colspan="2">number Net profit margin (accumulated value)</td>
    </tr>
<tr>
        <td>de</td>
        <td colspan="2">number Debt to equity ratio</td>
    </tr>
<tr>
        <td>fixedAssetTurnover</td>
        <td colspan="2">number Fixed asset turnover ratio</td>
    </tr>
<tr>
        <td>totalAssetTurnover</td>
        <td colspan="2">number Total asset turnover ratio</td>
    </tr>
</table>

## Errors

The following table identifies error messages that the API could return in response to a call to this method. Please see the error message documentation for more detail.

<table>
  <thead>
    <tr>
      <th>Status Code</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>400</td>
<td>Bad Request</td>
    </tr>
<tr>
      <td>401</td>
<td>Unauthorized</td>
    </tr>
<tr>
      <td>403</td>
<td>Forbidden</td>
    </tr>
  </tbody>
</table>






```
Status Code       Description
404               Not Found
```

The Stock Exchange of Thailand | All rights reserved.  
The contents contained in this website are provided for informative and educational purpose only. SET does not make any representations and hereby disclaims with respect to this website.  
Term & Condition of Use | Privacy Center | Cookies Policy | Third Party Terms  
