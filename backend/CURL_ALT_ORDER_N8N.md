# Curl Command to Send Alt Order to n8n

## Option 1: Using the API endpoint to get formatted data, then send to n8n

First, get the formatted data from your API (replace `YOUR_TOKEN` and `ORDER_ID`):

```bash
# Get formatted alt order data
FORMATTED_DATA=$(curl -X GET "http://localhost:3000/api/alt-orders/ORDER_ID/n8n" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json")

# Extract the data field from response
DATA=$(echo $FORMATTED_DATA | jq -r '.data')

# Send to n8n webhook
curl -X POST "https://n8n.srv891599.hstgr.cloud/webhook/cbe7fd24-f355-450d-86cb-5306101e8a82" \
  -H "Content-Type: application/json" \
  -d "$DATA"
```

## Option 2: Direct curl with dummy data (all checkboxes = true to show sub-fields)

```bash
curl -X POST "https://n8n.srv891599.hstgr.cloud/webhook/cbe7fd24-f355-450d-86cb-5306101e8a82" \
  -H "Content-Type: application/json" \
  -d '{
  "form_type": "alt_order",
  "form_id": "CEICIAOTDF08242023",
  "order_id": "test-order-123",
  "status": "draft",
  "fields": {
    "rr_name": {"value": "John Smith", "label": "RR Name", "type": "text"},
    "rr_no": {"value": "RR123456", "label": "RR No.", "type": "text"},
    "customer_names": {"value": "John & Jane Doe", "label": "Customer Names(s)", "type": "text"},
    "proposed_principal_amount": {"value": "$1,000,000.00", "label": "Proposed Principal Amount", "type": "currency", "raw_value": 1000000},
    "qualified_account": {"value": "Yes", "label": "Qualified Account", "type": "yes_no", "is_yes": true},
    "solicited_trade": {"value": "Yes", "label": "Solicited Trade", "type": "yes_no", "is_yes": true},
    "tax_advantage_purchase": {"value": "Yes", "label": "Tax Advantage Purchase", "type": "yes_no", "is_yes": true},
    "custodian": {"value": "Fidelity", "label": "Custodian", "type": "dropdown"},
    "name_of_product": {"value": "Private Equity Fund XYZ", "label": "Name of Product", "type": "text"},
    "sponsor_issuer": {"value": "ABC Capital Partners", "label": "Sponsor/Issuer", "type": "text"},
    "date_of_ppm": {"value": "2024-01-15", "label": "Date of PPM", "type": "date", "raw_value": "2024-01-15"},
    "date_ppm_sent": {"value": "2024-01-20", "label": "Date PPM Sent", "type": "date", "raw_value": "2024-01-20"},
    "existing_illiquid_alt_positions": {"value": "$500,000.00", "label": "Existing Illiquid Alt Positions", "type": "currency", "raw_value": 500000},
    "existing_illiquid_alt_concentration": {"value": "25%", "label": "Existing Illiquid Alt Concentration", "type": "percentage", "raw_value": 25},
    "existing_semi_liquid_alt_positions": {"value": "$300,000.00", "label": "Existing Semi-liquid Alt Positions", "type": "currency", "raw_value": 300000},
    "existing_semi_liquid_alt_concentration": {"value": "15%", "label": "Existing Semi-liquid Alt Concentration", "type": "percentage", "raw_value": 15},
    "existing_tax_advantage_alt_positions": {"value": "$200,000.00", "label": "Existing Tax Advantage Alt Positions", "type": "currency", "raw_value": 200000},
    "existing_tax_advantage_alt_concentration": {"value": "10%", "label": "Existing Tax Advantage Alt Concentration", "type": "percentage", "raw_value": 10},
    "total_net_worth": {"value": "$5,000,000.00", "label": "Total Net Worth", "type": "currency", "raw_value": 5000000},
    "liquid_net_worth": {"value": "$4,000,000.00", "label": "Liquid Net Worth*", "type": "currency", "raw_value": 4000000, "notes": "*Excluding home and auto"},
    "total_concentration": {"value": "36%", "label": "Total Concentration*", "type": "percentage", "raw_value": 36, "notes": "*Concentration = Proposed and Existing (Illiquid and Semi-liquid Alts) / Total Net Worth"},
    "account_owner_signature": {"value": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "label": "Account Owner Signature", "type": "signature", "has_signature": true},
    "account_owner_printed_name": {"value": "John Doe", "label": "Account Owner Printed Name", "type": "text"},
    "account_owner_date": {"value": "2024-12-20", "label": "Account Owner Date", "type": "date", "raw_value": "2024-12-20"},
    "financial_professional_signature": {"value": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "label": "Financial Professional Signature", "type": "signature", "has_signature": true},
    "financial_professional_printed_name": {"value": "Jane Advisor", "label": "Financial Professional Printed Name", "type": "text"},
    "financial_professional_date": {"value": "2024-12-20", "label": "Financial Professional Date", "type": "date", "raw_value": "2024-12-20"},
    "registered_principal_signature": {"value": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "label": "Registered Principal Signature", "type": "signature", "has_signature": true},
    "registered_principal_printed_name": {"value": "Bob Principal", "label": "Registered Principal Printed Name", "type": "text"},
    "registered_principal_date": {"value": "2024-12-20", "label": "Registered Principal Date", "type": "date", "raw_value": "2024-12-20"},
    "notes": {"value": "Test order for n8n integration", "label": "Notes", "type": "textarea"},
    "reg_bi_delivery": {"value": true, "label": "Reg BI Delivery", "type": "checkbox", "checked": true},
    "state_registration": {"value": true, "label": "State Registration", "type": "checkbox", "checked": true},
    "ai_insight": {"value": true, "label": "AI Insight", "type": "checkbox", "checked": true},
    "statement_of_financial_condition": {"value": true, "label": "Statement of Financial Condition", "type": "checkbox", "checked": true},
    "suitability_received": {"value": true, "label": "Suitability Received", "type": "checkbox", "checked": true}
  },
  "conditional_fields": {
    "qualified_account_certification_text": {
      "value": "I certify that I have other sufficient qualified funds available to meet my required minimum distributions pursuant to IRS requirements until this product matures.",
      "label": "Qualified account certification text",
      "type": "text",
      "conditional_on": "qualified_account",
      "conditional_value": "Yes",
      "notes": "If purchasing this product in a qualified account, I certify that I have other sufficient qualified funds available to meet my required minimum distributions pursuant to IRS requirements until this product matures."
    },
    "joint_account_owner_signature": {
      "value": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "label": "Joint Account Owner Signature",
      "type": "signature",
      "conditional_on": "customer_names",
      "conditional_note": "Shown when customer_names contains multiple names",
      "has_signature": true
    },
    "joint_account_owner_printed_name": {
      "value": "Jane Doe",
      "label": "Joint Account Owner Printed Name",
      "type": "text",
      "conditional_on": "customer_names"
    },
    "joint_account_owner_date": {
      "value": "2024-12-20",
      "label": "Joint Account Owner Date",
      "type": "date",
      "raw_value": "2024-12-20",
      "conditional_on": "customer_names"
    }
  },
  "field_metadata": {
    "qualified_account_certification_text": {
      "conditional_on": "qualified_account",
      "conditional_value": "Yes",
      "notes": "If purchasing this product in a qualified account, I certify that I have other sufficient qualified funds available to meet my required minimum distributions pursuant to IRS requirements until this product matures."
    },
    "joint_account_owner_signature": {
      "conditional_on": "customer_names",
      "conditional_note": "Shown when customer_names contains multiple names or has joint owner"
    },
    "joint_account_owner_printed_name": {
      "conditional_on": "customer_names",
      "conditional_note": "Shown when customer_names contains multiple names or has joint owner"
    },
    "joint_account_owner_date": {
      "conditional_on": "customer_names",
      "conditional_note": "Shown when customer_names contains multiple names or has joint owner"
    }
  }
}'
```

## Key Points:

1. **All checkboxes are set to `true`** - This ensures n8n can see which checkboxes are checked
2. **Conditional fields are included** - When `qualified_account = "Yes"`, the `qualified_account_certification_text` sub-field is shown
3. **Joint account owner fields are included** - When `customer_names` contains "&" or "and", joint account owner fields are shown
4. **All field types are properly formatted**:
   - Currency fields have both formatted value (`$1,000,000.00`) and raw value (`1000000`)
   - Percentage fields have both formatted value (`25%`) and raw value (`25`)
   - Date fields have both formatted value (`2024-12-20`) and raw value
   - Signature fields have base64 encoded images and `has_signature: true`

## Testing:

Run the test script:
```bash
./backend/test-alt-order-n8n.sh
```

Or use the direct curl command above.

