# Weekly Time Tracking Form

A modern, user-friendly web application for tracking weekly time by team and customer. The form dynamically loads teams and customers directly from your published Google Sheets CSV.

## Setup

### 1. Publish Your Google Sheet

Make sure your Google Sheet is published to the web with CSV output enabled. The form is configured to read from:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vT3L6g88i7wMCyUrc2fPtH8vhTbDlPrY04E69r8-dzk7qRPNKxgYl6UOVblcwcYcgeu-qcUx_9gh3gJ/pub?output=csv
```

### 2. Open the Form

Simply open `index.html` in your web browser. The form will automatically:
- Fetch data from your published Google Sheet
- Extract teams and customers from the CSV
- Populate the form with the latest data

**No Python scripts or local files needed!** The form reads directly from your published sheet.

## How It Works

1. When you open the form, it fetches the CSV data from your published Google Sheet
2. The CSV is parsed to extract teams and customers
3. Teams are identified by matching: 'Product', 'Professional Services', 'Project Management', 'Customer Success'
4. Other valid entries in the sheet are treated as customer names
5. Users select their team and customers, then enter hours
6. Data is saved to browser localStorage

## Features

- **Team Selection**: Dynamically loaded from your Google Sheet
- **Customer Selection**: Dynamically loaded from your Google Sheet
- **Dynamic Hour Inputs**: Automatically generates hour input fields for each selected customer
- **Week Selection**: Select the week you're tracking time for
- **Data Storage**: Saves time tracking entries to browser localStorage
- **Summary Display**: Shows a summary of your time tracking after submission
- **Real-time Updates**: Always uses the latest data from your published sheet

## Updating the CSV URL

If you need to change the Google Sheets CSV URL, update it in `script.js`:

```javascript
const CONFIG = {
    csvUrl: 'YOUR_NEW_CSV_URL_HERE'
};
```

## CSV Format

The form automatically parses your CSV and looks for:
- **Teams**: Values matching 'Product', 'Professional Services', 'Project Management', or 'Customer Success'
- **Customers**: Other non-empty values that look like company/customer names

The parser automatically:
- Skips header rows (rows containing words like "team", "customer", "name", "hours", etc.)
- Handles quoted values with commas
- Sorts customers alphabetically
- Filters out invalid entries

## Troubleshooting

**Form shows "Could not load form data from Google Sheets"**
- Make sure your Google Sheet is published to the web
- Check that the CSV URL is correct and accessible
- Verify the sheet is not private or requires authentication
- The form will use default data if it can't connect

**Wrong teams or customers showing**
- Update your Google Sheet with the correct data
- Refresh the browser to reload the latest data
- The form always fetches fresh data when opened

**CSV URL changed**
- Update the `csvUrl` in `script.js` (see "Updating the CSV URL" above)
- Refresh the browser

## Browser Compatibility

This form uses modern JavaScript features and requires:
- A modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection (to fetch CSV data)
