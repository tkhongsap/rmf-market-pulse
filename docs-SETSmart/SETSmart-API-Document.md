
# Company Fundamental Data - API Specification V1.0

## Revision History

<table>
  <thead>
    <tr>
      <th>Effective Date</th>
      <th>Version</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2023-12-13</td>
<td>1.0</td>
<td>Create document</td>
    </tr>
  </tbody>
</table>

## Table of Content

<table>
    <thead>
    <tr>
        <th>Content</th>
        <th>Page</th>
    </tr>
    </thead>
    <tr>
        <td>1. EOD Price and Statistics by Symbol</td>
<td>2</td>
    </tr>
<tr>
        <td>2. EOD Price and Statistics all Symbols</td>
<td>3</td>
    </tr>
<tr>
        <td>3. Financial Data and Ratio by Symbol</td>
<td>5</td>
    </tr>
<tr>
        <td>4. Financial Data and Ratio all Symbols</td>
<td>6</td>
    </tr>
</table>

© The Stock Exchange of Thailand





# 1. EOD Price and Statistics by Symbol

<table>
  <tr>
    <th>Description</th>
    <td>EOD stock price and statistics such as P/E and dividend yield by symbol. Period of historical data is available according to SETSMART package.</td>
  </tr>
<tr>
    <th>URL</th>
    <td>https://www.setsmart.com/api/listed-company-api/eod-price-by-symbol</td>
  </tr>
<tr>
    <th>Method</th>
    <td>GET</td>
  </tr>
<tr>
    <th>Header</th>
    <td>api-key</td>
  </tr>
</table>

<table>
    <thead>
    <tr>
        <th colspan="3">Parameter</th>
    </tr>
<tr>
        <th>symbol</th>
        <th>String - Required</th>
        <th>Stock symbol (ex. PTT,AOT,EGCO). Only one symbol can be used per
<br/>
request.</th>
    </tr>
    </thead>
    <tr>
        <td>startDate</td>
<td>String - Required</td>
<td>Start date in "YYYY-MM-DD" format.</td>
    </tr>
<tr>
        <td>endDate</td>
<td>String - Optional</td>
<td>End date in "YYYY-MM-DD" format. The limitation on the period of time
per request is 6 years.</td>
    </tr>
<tr>
        <td>adjustedPriceFlag</td>
<td>String - Required</td>
<td>- 'Y' = Price and volume are adjusted (normalized) information.
<br/>
- 'N' = Price and volume are not adjusted (normalized) information.</td>
    </tr>
</table>

## Properties

<table>
    <thead>
    <tr>
        <th>No.</th>
        <th>Properties</th>
        <th>Type</th>
        <th>Format /
<br/>
Max Length</th>
        <th>Description</th>
    </tr>
    </thead>
    <tr>
        <td>1</td>
<td>date</td>
<td>String</td>
<td>YYYY-MM-DD</td>
<td>Trading date</td>
    </tr>
<tr>
        <td>2</td>
<td>symbol</td>
<td>String</td>
<td>20</td>
<td>Security symbol</td>
    </tr>
<tr>
        <td>3</td>
<td>securityType</td>
<td>String</td>
<td>3</td>
<td>Security Type
<br/>
- CS = Common Stock
- CSF = Foreign Stock
- PS =Preferred Stock
<br/>
- PSF = Preferred Foreign Stock
- W = Warrant
- TSR = Transferable Subscription Rights
- DWC = Derivative Call Warrants
<br/>
- DWP = Derivative Put Warrants
- DR = Depository Receipts
- ETF = Exchange Traded Fund
<br/>
- UT = Unit Trust</td>
    </tr>
<tr>
        <td>4</td>
<td>adjustedPriceFlag</td>
<td>String</td>
<td>1</td>
<td>Adjusted price flag
<br/>
- 'Y' = Price and volume are adjusted information
<br/>
- 'N' = Price and volume are not adjusted
<br/>
information</td>
    </tr>
<tr>
        <td>5</td>
<td>prior</td>
<td>Numeric</td>
<td>Double</td>
<td>Prior closing price (If there are no trades yesterday,
<br/>
it will carry latest closing price)</td>
    </tr>
<tr>
        <td>6</td>
<td>open</td>
<td>Numeric</td>
<td>Double</td>
<td>Opening price of the day</td>
    </tr>
<tr>
        <td>7</td>
<td>high</td>
<td>Numeric</td>
<td>Double</td>
<td>Highest price of the day</td>
    </tr>
<tr>
        <td>8</td>
<td>low</td>
<td>Numeric</td>
<td>Double</td>
<td>Lowest price of the day</td>
    </tr>
<tr>
        <td>9</td>
<td>close</td>
<td>Numeric</td>
<td>Double</td>
<td>Last executed price</td>
    </tr>
<tr>
        <td>10</td>
<td>average</td>
<td>Numeric</td>
<td>Double</td>
<td>Average price</td>
    </tr>
<tr>
        <td>11</td>
<td>aomVolume</td>
<td>Numeric</td>
<td>Double</td>
<td>Auto-matching volume</td>
    </tr>
<tr>
        <td>12</td>
<td>aomValue</td>
<td>Numeric</td>
<td>Double</td>
<td>Auto-matching value</td>
    </tr>
<tr>
        <td>13</td>
<td>trVolume</td>
<td>Numeric</td>
<td>Double</td>
<td>Trade report volume</td>
    </tr>
<tr>
        <td>14</td>
<td>trValue</td>
<td>Numeric</td>
<td>Double</td>
<td>Trade report value</td>
    </tr>
<tr>
        <td>15</td>
<td>totalVolume</td>
<td>Numeric</td>
<td>Double</td>
<td>Total trading volume</td>
    </tr>
<tr>
        <td>16</td>
<td>totalValue</td>
<td>Numeric</td>
<td>Double</td>
<td>Total trading value</td>
    </tr>
<tr>
        <td>17</td>
<td>pe</td>
<td>Numeric</td>
<td>Double</td>
<td>P/E ratio will be null for these cases
<br/>
- P/E is negative.
<br/>
- P/E is not calculated, for example, a security
<br/>
posted with SP sign more than 3 months.
<br/>
- P/E for PF&REITs, Infrastructure Fund, ETF and
<br/>
UnitTrust.</td>
    </tr>
</table>

© The Stock Exchange of Thailand





# Company Fundamental Data - API Specification V1.0

<table>
    <tr>
        <td>18</td>
<td>pbv</td>
<td>Numeric</td>
<td>Double</td>
<td>P/BV ratio will be null for these cases
<br/>
- P/BV is negative.
<br/>
- P/BV is not calculated, for example, a security
<br/>
posted with SP sign more than 3 months.
<br/>
- P/BV for PF&REITs, Infrastructure Fund, ETF and
<br/>
UnitTrust.</td>
    </tr>
<tr>
        <td>19</td>
<td>bvps</td>
<td>Numeric</td>
<td>Double</td>
<td>Book value per share
<br/>
- Unit: Baht per Share
<br/>
- for PF&REIT, Infrastructure Fund, ETF or Unit
<br/>
trust, it means NAV</td>
    </tr>
<tr>
        <td>20</td>
<td>dividendYield</td>
<td>Numeric</td>
<td>Double</td>
<td>This value will be null if dividend yield is not
<br/>
calculated, for example,
<br/>
- a security which has no cash dividend payment
<br/>
- a security posted with SP sign more than 3 months</td>
    </tr>
<tr>
        <td>21</td>
<td>marketCap</td>
<td>Numeric</td>
<td>Double</td>
<td>- Unit: Baht
- This field will be null if market cap. is not
calculated, for example, a security posted with SP
<br/>
sign more than 3 months</td>
    </tr>
<tr>
        <td>22</td>
<td>volumeTurnover</td>
<td>Numeric</td>
<td>Double</td>
<td>This value will be null if volume turnover is not
<br/>
calculated, for example,
<br/>
- a security posted with SP sign more than 3 months</td>
    </tr>
</table>

© The Stock Exchange of Thailand





# 2. EOD_Price_and_Statistics_by_Symbol

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>EOD stock price and statistics such as P/E and dividend yield of all symbols per day. Period of historical data is available according to your SETSMART package</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>URL</td>
<td>https://www.setsmart.com/api/listed-company-api/eod-price-by-security-type</td>
    </tr>
<tr>
      <td>Method</td>
<td>GET</td>
    </tr>
<tr>
      <td>Header</td>
<td>api-key</td>
    </tr>
  </tbody>
</table>

<table>
    <thead>
    <tr>
        <th colspan="3">Parameter</th>
    </tr>
<tr>
        <th>securityType</th>
        <th>String - Required</th>
        <th>Security Type
- All = All security types
- CS = Common Stock
- CSF = Foreign Stock
<br/>
- PS = Preferred Stock
- PSF = Preferred Foreign Stock
- W = Warrant
- TSR = Transferable Subscription Rights
<br/>
- DWC = Derivative Call Warrants
- DWP = Derivative Put Warrants
- DR = Depository Receipts
<br/>
- ETF = Exchange Traded Fund
- UT = Unit Trust</th>
    </tr>
    </thead>
    <tr>
        <td>date</td>
<td>String - Required</td>
<td>Date in "YYYY-MM-DD" format. Only one date can be used per request.</td>
    </tr>
<tr>
        <td>adjustedPriceFlag</td>
<td>String - Required</td>
<td>- 'Y' = Price and volume are adjusted (normalized) information.
<br/>
- 'N' = Price and volume are not adjusted (normalized) information.</td>
    </tr>
</table>

## Properties

<table>
    <thead>
    <tr>
        <th>No.</th>
        <th>Properties</th>
        <th>Type</th>
        <th>Format /
Max Length</th>
        <th>Description</th>
    </tr>
    </thead>
    <tr>
        <td>1</td>
<td>date</td>
<td>String</td>
<td>YYYY-MM-DD</td>
<td>Trading date</td>
    </tr>
<tr>
        <td>2</td>
<td>symbol</td>
<td>String</td>
<td>20</td>
<td>Security symbol</td>
    </tr>
<tr>
        <td>3</td>
<td>securityType</td>
<td>String</td>
<td>3</td>
<td>Security Type
- CS = Common Stock
<br/>
- CSF = Foreign Stock
- PS =Preferred Stock
- PSF = Preferred Foreign Stock
- W = Warrant
<br/>
- TSR = Transferable Subscription Rights
- DWC = Derivative Call Warrants
- DWP = Derivative Put Warrants
<br/>
- DR = Depository Receipts
- ETF = Exchange Traded Fund
- UT = Unit Trust</td>
    </tr>
<tr>
        <td>4</td>
<td>adjustedPriceFlag</td>
<td>String</td>
<td>1</td>
<td>Adjusted price flag
<br/>
- 'Y' = Price and volume are adjusted information
<br/>
- 'N' = Price and volume are not adjusted
<br/>
information</td>
    </tr>
<tr>
        <td>5</td>
<td>prior</td>
<td>Numeric</td>
<td>Double</td>
<td>Prior closing price (If there are no trades yesterday,
<br/>
it will carry latest closing price)</td>
    </tr>
<tr>
        <td>6</td>
<td>open</td>
<td>Numeric</td>
<td>Double</td>
<td>Opening price of the day</td>
    </tr>
<tr>
        <td>7</td>
<td>high</td>
<td>Numeric</td>
<td>Double</td>
<td>Highest price of the day</td>
    </tr>
<tr>
        <td>8</td>
<td>low</td>
<td>Numeric</td>
<td>Double</td>
<td>Lowest price of the day</td>
    </tr>
<tr>
        <td>9</td>
<td>close</td>
<td>Numeric</td>
<td>Double</td>
<td>Last executed price</td>
    </tr>
<tr>
        <td>10</td>
<td>average</td>
<td>Numeric</td>
<td>Double</td>
<td>Average price</td>
    </tr>
<tr>
        <td>11</td>
<td>aomVolume</td>
<td>Numeric</td>
<td>Double</td>
<td>Auto-matching volume</td>
    </tr>
<tr>
        <td>12</td>
<td>aomValue</td>
<td>Numeric</td>
<td>Double</td>
<td>Auto-matching value</td>
    </tr>
<tr>
        <td>13</td>
<td>trVolume</td>
<td>Numeric</td>
<td>Double</td>
<td>Trade report volume</td>
    </tr>
<tr>
        <td>14</td>
<td>trValue</td>
<td>Numeric</td>
<td>Double</td>
<td>Trade report value</td>
    </tr>
</table>

© The Stock Exchange of Thailand





# Company Fundamental Data - API Specification V1.0

<table>
    <thead>
    <tr>
        <th>15</th>
        <th>totalVolume</th>
        <th>Numeric</th>
        <th>Double</th>
        <th>Total trading volume</th>
    </tr>
    </thead>
    <tr>
        <td>16</td>
<td>totalValue</td>
<td>Numeric</td>
<td>Double</td>
<td>Total trading value</td>
    </tr>
<tr>
        <td>17</td>
<td>pe</td>
<td>Numeric</td>
<td>Double</td>
<td>P/E ratio will be null for these cases
<br/>
- P/E is negative.
<br/>
- P/E is not calculated, for example, a security
<br/>
posted with SP sign more than 3 months.
<br/>
- P/E for PF&REITs, Infrastructure Fund, ETF and
<br/>
UnitTrust.</td>
    </tr>
<tr>
        <td>18</td>
<td>pbv</td>
<td>Numeric</td>
<td>Double</td>
<td>P/BV ratio will be null for these cases
<br/>
- P/BV is negative.
<br/>
- P/BV is not calculated, for example, a security
<br/>
posted with SP sign more than 3 months.
<br/>
- P/BV for PF&REITs, Infrastructure Fund, ETF and
<br/>
UnitTrust.</td>
    </tr>
<tr>
        <td>19</td>
<td>bvps</td>
<td>Numeric</td>
<td>Double</td>
<td>Book value per share
<br/>
- Unit: Baht per Share
<br/>
- for PF&REIT, Infrastructure Fund, ETF or Unit
<br/>
trust, it means NAV</td>
    </tr>
<tr>
        <td>20</td>
<td>dividendYield</td>
<td>Numeric</td>
<td>Double</td>
<td>This value will be null if dividend yield is not
<br/>
calculated, for example,
<br/>
- a security which has no cash dividend payment
<br/>
- a security posted with SP sign more than 3 months</td>
    </tr>
<tr>
        <td>21</td>
<td>marketCap</td>
<td>Numeric</td>
<td>Double</td>
<td>- Unit: Baht
- This field will be null if market cap. is not
<br/>
calculated, for example, a security posted with SP
sign more than 3 months</td>
    </tr>
<tr>
        <td>22</td>
<td>volumeTurnover</td>
<td>Numeric</td>
<td>Double</td>
<td>This value will be null if volume turnover is not
<br/>
calculated, for example,
<br/>
- a security posted with SP sign more than 3 months</td>
    </tr>
</table>

© The Stock Exchange of Thailand





# 3. Financial Data and Ratio by Symbol

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Financial data and financial ratio in fiscal year by company. The period of historical data is available according to your SETSMART package.</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>URL</td>
<td>https://www.setsmart.com/api/listed-company-api/financial-data-and-ratio-by-symbol</td>
    </tr>
<tr>
      <td>Method</td>
<td>GET</td>
    </tr>
<tr>
      <td>Header</td>
<td>api-key</td>
    </tr>
  </tbody>
</table>

<table>
    <thead>
    <tr>
        <th colspan="3">Parameter</th>
    </tr>
<tr>
        <th>symbol</th>
        <th>String - Required</th>
        <th>Stock symbol (ex. PTT,AOT,EGCO). Only one symbol can be used per
<br/>
request.</th>
    </tr>
    </thead>
    <tr>
        <td>startYear</td>
<td>String - Required</td>
<td>Fiscal year in "YYYY" format.</td>
    </tr>
<tr>
        <td>startQuarter</td>
<td>String - Required</td>
<td>Fiscal quarter of startYear. Value should be 1 to 4.</td>
    </tr>
<tr>
        <td>endYear</td>
<td>String - Optional</td>
<td>Fiscal year in "YYYY" format.</td>
    </tr>
<tr>
        <td>endQuarter</td>
<td>String - Optional</td>
<td>Fiscal quarter of endYear. Value should be 1 to 4.</td>
    </tr>
</table>

## Specification

<table>
    <thead>
    <tr>
        <th>No.</th>
        <th>Properties</th>
        <th>Type</th>
        <th>Format /
Max Length</th>
        <th>Description</th>
    </tr>
    </thead>
    <tr>
        <td>1</td>
<td>symbol</td>
<td>String</td>
<td>20</td>
<td>Security symbol</td>
    </tr>
<tr>
        <td>2</td>
<td>year</td>
<td>String</td>
<td>4</td>
<td>Year of financial statement</td>
    </tr>
<tr>
        <td>3</td>
<td>quarter</td>
<td>String</td>
<td>1</td>
<td>Quarter of financial statement</td>
    </tr>
<tr>
        <td>4</td>
<td>financialStatementType</td>
<td>String</td>
<td>1</td>
<td>Financial statement type
<br/>
- C = Consolidate
- E = Equity Method
- U = Company
<br/>
Only one financial statement type will be sent out for
one symbol.
- If there are financial statement type "C" and "U",
only "C" will be sent out
<br/>
- If there are financial statement type "E" and "U",
only "E" will be sent out
- Financial statement type "U" will be sent out if
<br/>
there is no "C" nor "E"</td>
    </tr>
<tr>
        <td>5</td>
<td>dateAsof</td>
<td>String</td>
<td>YYYY-MM-DD</td>
<td>As of date of financial statement</td>
    </tr>
<tr>
        <td>6</td>
<td>accountPeriod</td>
<td>String</td>
<td>1</td>
<td>Account Period
- F = Fiscal Year</td>
    </tr>
<tr>
        <td>7</td>
<td>totalAssets</td>
<td>Numeric</td>
<td>Double</td>
<td>Total assets
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>8</td>
<td>totalLiabilities</td>
<td>Numeric</td>
<td>Double</td>
<td>Total liabilities
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>9</td>
<td>paidupShareCapital</td>
<td>Numeric</td>
<td>Double</td>
<td>Paidup capital
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>10</td>
<td>shareholderEquity</td>
<td>Numeric</td>
<td>Double</td>
<td>Shareholders' equity
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>11</td>
<td>totalEquity</td>
<td>Numeric</td>
<td>Double</td>
<td>Total equity
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>12</td>
<td>totalRevenueQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Total revenue (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>13</td>
<td>totalRevenueAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Total revenue (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>14</td>
<td>totalExpensesQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Total expense (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>15</td>
<td>totalExpensesAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Total expense (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>16</td>
<td>ebitQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>EBIT (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
</table>

© The Stock Exchange of Thailand





# Company Fundamental Data - API Specification V1.0

<table>
    <tr>
        <td>17</td>
<td>ebitAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>EBIT (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>18</td>
<td>netProfitQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Net profit (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>19</td>
<td>netProfitAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Net profit (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>20</td>
<td>epsQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Earning per share (value of that quarter)
<br/>
Unit: Baht</td>
    </tr>
<tr>
        <td>21</td>
<td>epsAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Earning per share (accumulated value)
<br/>
Unit: Baht</td>
    </tr>
<tr>
        <td>22</td>
<td>operatingCashFlow</td>
<td>Numeric</td>
<td>Double</td>
<td>Operating cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>23</td>
<td>investingCashFlow</td>
<td>Numeric</td>
<td>Double</td>
<td>Investing cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>24</td>
<td>financingCashFlow</td>
<td>Numeric</td>
<td>Double</td>
<td>Financing cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>25</td>
<td>roe</td>
<td>Numeric</td>
<td>Double</td>
<td>Return on equity</td>
    </tr>
<tr>
        <td>26</td>
<td>roa</td>
<td>Numeric</td>
<td>Double</td>
<td>Return on asset</td>
    </tr>
<tr>
        <td>27</td>
<td>netProfitMarginQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Net profit margin (value of that quarter)</td>
    </tr>
<tr>
        <td>28</td>
<td>netProfitMarginAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Net profit margin (accumulated value)</td>
    </tr>
<tr>
        <td>29</td>
<td>de</td>
<td>Numeric</td>
<td>Double</td>
<td>Debt to equity ratio</td>
    </tr>
<tr>
        <td>30</td>
<td>fixedAssetTurnover</td>
<td>Numeric</td>
<td>Double</td>
<td>Fixed asset turnover ratio</td>
    </tr>
<tr>
        <td>31</td>
<td>totalAssetTurnover</td>
<td>Numeric</td>
<td>Double</td>
<td>Total asset turnover ratio</td>
    </tr>
</table>

© The Stock Exchange of Thailand





# 4. Financial_Data_and_Ratio_all_Symbols

<table>
<thead>
<tr>
<th>Description</th>
<th>Financial data and financial ratio of all companies per quarter (Both fiscal year and calendar year are available). The period of historical data is available according to your SETSMART package.</th>
</tr>
</thead>
<tbody>
<tr>
<td>URL</td>
<td>https://www.setsmart.com/api/listed-company-api/financial-data-and-ratio</td>
</tr>
<tr>
<td>Method</td>
<td>GET</td>
</tr>
<tr>
<td>Header</td>
<td>api-key</td>
</tr>
</tbody>
</table>

<table>
    <thead>
    <tr>
        <th colspan="3">Parameter</th>
    </tr>
<tr>
        <th>accountPeriod</th>
        <th>String - Required</th>
        <th>Account Period of financial data
- F = Fiscal Year
- C = Calendar Year</th>
    </tr>
    </thead>
    <tr>
        <td>year</td>
<td>String - Required</td>
<td>Year in "YYYY" format</td>
    </tr>
<tr>
        <td>quarter</td>
<td>String - Required</td>
<td>Quarter. Value should be 1 to 4.</td>
    </tr>
</table>

## Specification

<table>
    <thead>
    <tr>
        <th>No.</th>
        <th>Properties</th>
        <th>Type</th>
        <th>Format /
Max Length</th>
        <th>Description</th>
    </tr>
    </thead>
    <tr>
        <td>1</td>
<td>symbol</td>
<td>String</td>
<td>20</td>
<td>Security symbol</td>
    </tr>
<tr>
        <td>2</td>
<td>year</td>
<td>String</td>
<td>4</td>
<td>Year of financial statement</td>
    </tr>
<tr>
        <td>3</td>
<td>quarter</td>
<td>String</td>
<td>1</td>
<td>Quarter of financial statement</td>
    </tr>
<tr>
        <td>4</td>
<td>financialStatementType</td>
<td>String</td>
<td>1</td>
<td>Financial statement type
<br/>
- C = Consolidate
- E = Equity Method
- U = Company
<br/>
Only one financial statement type will be sent out for
one symbol.
- If there are financial statement type "C" and "U",
only "C" will be sent out
<br/>
- If there are financial statement type "E" and "U",
only "E" will be sent out
- Financial statement type "U" will be sent out if
<br/>
there is no "C" nor "E"</td>
    </tr>
<tr>
        <td>5</td>
<td>dateAsof</td>
<td>String</td>
<td>YYYY-MM-DD</td>
<td>As of date of financial statement</td>
    </tr>
<tr>
        <td>6</td>
<td>accountPeriod</td>
<td>String</td>
<td>1</td>
<td>Account Period
- F = Fiscal Year
- C = Calendar Year</td>
    </tr>
<tr>
        <td>7</td>
<td>totalAssets</td>
<td>Numeric</td>
<td>Double</td>
<td>Total assets
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>8</td>
<td>totalLiabilities</td>
<td>Numeric</td>
<td>Double</td>
<td>Total liabilities
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>9</td>
<td>paidupShareCapital</td>
<td>Numeric</td>
<td>Double</td>
<td>Paidup capital
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>10</td>
<td>shareholderEquity</td>
<td>Numeric</td>
<td>Double</td>
<td>Shareholders' equity
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>11</td>
<td>totalEquity</td>
<td>Numeric</td>
<td>Double</td>
<td>Total equity
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>12</td>
<td>totalRevenueQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Total revenue (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>13</td>
<td>totalRevenueAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Total revenue (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>14</td>
<td>totalExpensesQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Total expense (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>15</td>
<td>totalExpensesAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Total expense (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>16</td>
<td>ebitQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>EBIT (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
</table>

© The Stock Exchange of Thailand





# Company Fundamental Data - API Specification V1.0

<table>
    <tr>
        <td>17</td>
<td>ebitAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>EBIT (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>18</td>
<td>netProfitQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Net profit (value of that quarter)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>19</td>
<td>netProfitAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Net profit (accumulated value)
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>20</td>
<td>epsQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Earning per share (value of that quarter)
<br/>
Unit: Baht</td>
    </tr>
<tr>
        <td>21</td>
<td>epsAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Earning per share (accumulated value)
<br/>
Unit: Baht</td>
    </tr>
<tr>
        <td>22</td>
<td>operatingCashFlow</td>
<td>Numeric</td>
<td>Double</td>
<td>Operating cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>23</td>
<td>investingCashFlow</td>
<td>Numeric</td>
<td>Double</td>
<td>Investing cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>24</td>
<td>financingCashFlow</td>
<td>Numeric</td>
<td>Double</td>
<td>Financing cash flow
<br/>
Unit: Thousand Baht</td>
    </tr>
<tr>
        <td>25</td>
<td>roe</td>
<td>Numeric</td>
<td>Double</td>
<td>Return on equity</td>
    </tr>
<tr>
        <td>26</td>
<td>roa</td>
<td>Numeric</td>
<td>Double</td>
<td>Return on asset</td>
    </tr>
<tr>
        <td>27</td>
<td>netProfitMarginQuarter</td>
<td>Numeric</td>
<td>Double</td>
<td>Net profit margin (value of that quarter)</td>
    </tr>
<tr>
        <td>28</td>
<td>netProfitMarginAccum</td>
<td>Numeric</td>
<td>Double</td>
<td>Net profit margin (accumulated value)</td>
    </tr>
<tr>
        <td>29</td>
<td>de</td>
<td>Numeric</td>
<td>Double</td>
<td>Debt to equity ratio</td>
    </tr>
<tr>
        <td>30</td>
<td>fixedAssetTurnover</td>
<td>Numeric</td>
<td>Double</td>
<td>Fixed asset turnover ratio</td>
    </tr>
<tr>
        <td>31</td>
<td>totalAssetTurnover</td>
<td>Numeric</td>
<td>Double</td>
<td>Total asset turnover ratio</td>
    </tr>
</table>

© The Stock Exchange of Thailand
