#!/bin/bash

# Script to curl the Alt Order form with all fields formatted for n8n
# This shows all fields and sub-fields when checkboxes/conditions are true
#
# Usage:
#   ./curl-alt-order-n8n.sh <ORDER_ID> [AUTH_TOKEN]
#
# Example:
#   ./curl-alt-order-n8n.sh abc123-def456-ghi789
#   ./curl-alt-order-n8n.sh abc123-def456-ghi789 "your-auth-token-here"

ORDER_ID=$1
AUTH_TOKEN=$2

if [ -z "$ORDER_ID" ]; then
  echo "Usage: $0 <ORDER_ID> [AUTH_TOKEN]"
  echo ""
  echo "Example:"
  echo "  $0 abc123-def456-ghi789"
  echo "  $0 abc123-def456-ghi789 \"your-auth-token-here\""
  exit 1
fi

# Default to localhost:3000 if not set
API_URL=${API_URL:-"http://localhost:3000"}

# If token not provided, try to get from environment or prompt
if [ -z "$AUTH_TOKEN" ]; then
  if [ -z "$AUTH_TOKEN_ENV" ]; then
    echo "AUTH_TOKEN not provided. Please set AUTH_TOKEN_ENV or provide as second argument."
    exit 1
  fi
  AUTH_TOKEN=$AUTH_TOKEN_ENV
fi

echo "Fetching Alt Order $ORDER_ID formatted for n8n..."
echo ""

curl -X GET "${API_URL}/api/alt-orders/${ORDER_ID}/n8n" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  | jq '.'

echo ""
echo ""
echo "This response includes:"
echo "  - All form fields with values"
echo "  - Conditional sub-fields (shown when checkboxes/conditions are true)"
echo "  - Formatted values (currency with $, percentages with %, dates formatted)"
echo "  - Raw values for calculations"
echo "  - Field metadata (labels, types, conditional logic)"
echo ""
echo "Use this structure in n8n to fill PDF fields:"
echo "  - Access fields via: data.fields.<field_id>.value"
echo "  - Access conditional fields via: data.conditional_fields.<field_id>.value"
echo "  - Check if checkbox is checked: data.fields.<field_id>.checked === true"
