
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

## Get Stock Quote by Symbol

EOD stock price (both original price and adjusted price are available) and statistics such as P/E and dividend yield by symbol. Period of historical data is available according to SETSMART package.

### Specification | Try it

### Request

HTTP request

```
https://www.setsmart.com/api/listed-company-api/eod-price-by-symbol
```

### Parameters

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
<td>startDate<br>(query)</td>
<td>string • required</td>
<td>Start date in "YYYY-MM-DD" format.</td>
</tr>
<tr>
<td>endDate<br>(query)</td>
<td>string</td>
<td>End date in "YYYY-MM-DD" format. A limitation on period of time per request is 6 years.</td>
</tr>
<tr>
<td>adjustedPriceFlag<br>(query)</td>
<td>string • required</td>
<td>
- 'Y' = Price and volume are adjusted information.<br>
- 'N' = Price and volume are not adjusted information.
</td>
</tr>
</tbody>
</table>

## Response

```json
{
  "date": "string",
  "symbol": "string",
  "securityType": "string",
  "adjustedPriceFlag": "string",
  "prior": "number",
  "open": "number",
  "high": "number",
  "low": "number",
  "close": "number",
  "average": "number",
  "aomVolume": "number",
  "aomValue": "number",
  "trVolume": "number",
  "trValue": "number",
  "totalVolume": "number",
  "totalValue": "number",
  "pe": "number",
  "pbv": "number",
  "bvps": "number",
  "dividendYield": "number",
  "marketCap": "number",
  "volumeTurnover": "number"
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
<tbody>
<tr>
<td>date</td>
<td>string</td>
<td>Trading date</td>
</tr>
<tr>
<td>symbol</td>
<td>string</td>
<td>Security symbol</td>
</tr>
</tbody>
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
        <td>securityType</td>
        <td colspan="2">string Security Type
<br/>
- CS = Common Stock
<br/>
- CSF = Foreign Stock
<br/>
- PS = Preferred Stock
<br/>
- PSF = Preferred Foreign Stock
<br/>
- W = Warrant
<br/>
- TSR = Transferable Subscription Rights
<br/>
- DWC = Derivative Call Warrants
<br/>
- DWP = Derivative Put Warrants
<br/>
- DR = Depository Receipts
<br/>
- ETF = Exchange Traded Fund
<br/>
- UT = Unit Trust</td>
    </tr>
<tr>
        <td>adjustedPriceFlag</td>
        <td colspan="2">string Adjusted price flag
<br/>
- 'Y' = Price and volume are adjusted information
<br/>
- 'N' = Price and volume are not adjusted information</td>
    </tr>
<tr>
        <td>prior</td>
        <td colspan="2">number Prior closing price (If there is no trades yesterday, it will
<br/>
carry latest closing price)</td>
    </tr>
<tr>
        <td>open</td>
        <td colspan="2">number Opening price of the day</td>
    </tr>
<tr>
        <td>high</td>
        <td colspan="2">number Highest price of the day</td>
    </tr>
<tr>
        <td>low</td>
        <td colspan="2">number Lowest price of the day</td>
    </tr>
<tr>
        <td>close</td>
        <td colspan="2">number Last executed price</td>
    </tr>
<tr>
        <td>average</td>
        <td colspan="2">number Average price</td>
    </tr>
<tr>
        <td>aomVolume</td>
        <td colspan="2">number Auto-matching volume</td>
    </tr>
<tr>
        <td>aomValue</td>
        <td colspan="2">number Auto-matching value</td>
    </tr>
<tr>
        <td>trVolume</td>
        <td colspan="2">number Trade report volume</td>
    </tr>
<tr>
        <td>trValue</td>
        <td colspan="2">number Trade report value</td>
    </tr>
<tr>
        <td>totalVolume</td>
        <td colspan="2">number Total trading volume</td>
    </tr>
<tr>
        <td>totalValue</td>
        <td colspan="2">number Total trading value</td>
    </tr>
<tr>
        <td>pe</td>
        <td colspan="2">number P/E ratio
<br/>
- If P/E is negative, this field will be -100000.00.
<br/>
- If P/E is not calculated, for example, a security posted
<br/>
with SP sign more than 3 months, this field will be null.
<br/>
- P/E is not calculated for PF&REITs, Infrastructure Fund,
<br/>
ETF and UnitTrust. This field will be null</td>
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
<tbody>
<tr>
<td>pbv</td>
<td>number</td>
<td>
P/BV ratio<br/>
- If P/BV is negative, this field will be -100000.00.<br/>
- If P/BV is not calculated, for example, a security posted with SP sign more than 3 months, this field will be null.<br/>
- For PF&amp;REITs, Infrastructure Fund, ETF and UnitTrust, this field means P/NAV
</td>
</tr>
<tr>
<td>bvps</td>
<td>number</td>
<td>
Book value per share<br/>
- Unit: Baht per Share<br/>
- for PF&amp;REIT, Infrastructure Fund, ETF or Unit trust, it means NAV
</td>
</tr>
<tr>
<td>dividendYield</td>
<td>number</td>
<td>
This value will be null if dividend yield is not calculated, for example,<br/>
- a security which has no cash dividend payment<br/>
- a security posted with SP sign more than 3 months
</td>
</tr>
<tr>
<td>marketCap</td>
<td>number</td>
<td>
- Unit: Baht<br/>
- This field will be null if market cap. is not calculated, for example, a security posted with SP sign more than 3 months
</td>
</tr>
<tr>
<td>volumeTurnover</td>
<td>number</td>
<td>
This value will be null if volume turnover is not calculated, for example,<br/>
- a security posted with SP sign more than 3 months
</td>
</tr>
</tbody>
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
<tr>
<td>404</td>
<td>Not Found</td>
</tr>
</tbody>
</table>

