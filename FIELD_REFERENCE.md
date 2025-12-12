# Investor Profile Form - Field Reference Guide

This document provides a complete reference for all fields in the Investor Profile Form, including their types, conditional visibility rules, validation requirements, and related fields.

## Field Reference Format

Each field entry includes:
- **Field ID**: Unique identifier
- **Label**: Display label
- **Type**: Field type (text, radio, multicheck, etc.)
- **Step**: Which step the field appears in
- **Options**: Available options (if applicable)
- **Conditional Visibility**: When the field is shown/hidden
- **Validation**: Required status and format validation
- **Related Fields**: Fields that depend on this field or that this field depends on

---

## Step 1: Account Registration

### Header Fields (Always Enabled)

| Field ID | Label | Type | Required | Notes |
|----------|-------|------|----------|-------|
| `rr_name` | RR Name | text | Yes | Always enabled, even when Retirement is checked |
| `rr_no` | RR No. | text | No | Always enabled, even when Retirement is checked |
| `customer_names` | Customer Name(s) | text | Yes | Always enabled, even when Retirement is checked |
| `account_no` | Account No. | text | No | Always enabled, even when Retirement is checked |

### Account Type Fields

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `retirement_checkbox` | Retirement (Skip to Step 2) | checkbox | - | Always visible | No |
| `retail_checkbox` | Retail | checkbox | - | Always visible | No |
| `type_of_account` | Type of Account - left column | multicheck | Individual, Corporation, Corporate Pension/Profit Sharing, Custodial, Estate, Joint Tenant, Limited Liability/Company, Individual Single Member LLC, Sole Proprietorship, Transfer on Death Individual, Transfer on Death Joint | Always visible | No |
| `type_of_account_right` | Type of Account - right column | multicheck | Trust, Nonprofit Organization, Partnership, Exempt Organization, Other | Always visible | No |
| `other_account_type_text` | Other - specify | text | - | Shows when `type_of_account_right` includes "Other" | No |

**Additional Designation Fields** (handled in AccountTypeSection):
- **Corporation**: Shows C Corp, S Corp checkboxes
- **Custodial**: Shows UGMA, UTMA checkboxes
- **Limited Liability Company**: Shows C Corp, S Corp, Partnership checkboxes
- **Transfer on Death Individual**: Shows Agreement Date input
- **Transfer on Death Joint**: Shows Agreement Date input
- **Trust**: Shows Establishment Date and Trust Type multicheck

### Trust Block Fields

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `trust_checkbox` | Trust | checkbox | - | Shows when `type_of_account_right` includes "trust" | No |
| `trust_establishment_date` | Establishment Date | date | - | Shows when Trust is selected | No |
| `trust_type` | Trust Type | multicheck | Charitable, Living, Irrevocable Living, Family, Revocable, Irrevocable, Testamentary | Shows when Trust is selected | No |

### Joint Accounts Section

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `joint_accounts_only` | For Joint Accounts Only | group | - | Shows when `type_of_account` includes "joint_tenant" | - |
| `are_account_holders_married` | Are the account holders married to each other? | yesno | Yes, No | Shows when Joint Tenant selected | No |
| `tenancy_state` | Tenancy State | text | - | Shows when Joint Tenant selected | No |
| `number_of_tenants` | Number of Tenants | number | - | Shows when Joint Tenant selected | No |
| `tenancy_clause` | Tenancy Clause options | multicheck | Community Property, Tenants by Entirety, Community Property with Rights of Survivorship, Joint Tenants with Rights of Survivorship, Tenants in Common | Shows when Joint Tenant selected | No |

### Custodial Accounts Section

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `for_custodial_accounts_only` | For Custodial Accounts Only | group | Shows when `type_of_account` includes "custodial" | - |
| `state_in_which_gift_was_given_1` | State in Which Gift was Given (1) | text | Shows when Custodial selected | No |
| `date_gift_was_given_1` | Date Gift Was Given (1) | date | Shows when Custodial selected | No |
| `state_in_which_gift_was_given_2` | State in Which Gift was Given (2) | text | Shows when Custodial selected | No |
| `date_gift_was_given_2` | Date Gift Was Given (2) | date | Shows when Custodial selected | No |

---

## Step 2: USA Patriot Act Information

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `initial_source_of_funds` | What is the initial source of funds for this account? | multicheck | Accounts Receivable, Income From Earnings, Legal Settlement, Spouse/Parent, Accumulated Savings, Inheritance, Lottery/Gaming, Rental Income, Alimony, Insurance Proceeds, Pension/IRA/Retirement Savings, Sale of Business, Gift, Investment Proceeds, Sale of Real Estate, Other | Always visible | No |
| `initial_source_of_funds_other_text` | Other - specify | text | - | Shows when "Other" is selected in `initial_source_of_funds` | No |

---

## Step 3: Primary Account Holder Information

### Basic Information

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_name` | Name | text | Always visible | Required |
| `primary_person_entity` | Person / Entity | radio | Always visible | Required |
| `primary_ssn` | Social Security (SSN) | text | Shows when Person/Entity = "Person" | Required when Person, Format: XXX-XX-XXXX |
| `primary_ein` | Employer Identification Number (EIN) | text | Shows when Person/Entity = "Entity" | Required when Entity, Format: XX-XXXXXXX |
| `primary_yes_no_box` | Yes/No (unspecified checkbox near EIN) | yesno | Shows when Person/Entity = "Entity" | No |
| `primary_email` | Email | text | Always visible | Format: email |
| `primary_dob` | Date of Birth | date | Shows when Person/Entity = "Person" | Required when Person, Must be in past |
| `primary_specified_adult` | Specified Adult (Yes/No) | yesno | Shows when Person/Entity = "Person" | No |

### Address Fields

#### Legal Address
| Field ID | Label | Type | Validation |
|----------|-------|------|------------|
| `primary_legal_address` | Legal Address (no P.O. Box) | textarea | Required |
| `primary_city` | City | text | Required |
| `primary_state_province` | State/Province | text | Required |
| `primary_zip_postal_code` | Zip/Postal code | text | Required |
| `primary_country` | Country | text | Required |

#### Mailing Address
| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_mailing_same_as_legal` | Mailing address same as legal address | checkbox | Always visible | No |
| `primary_mailing_address` | Mailing Address (if different from legal address) | textarea | Hides when "same as legal" is checked | Required when "same as legal" is unchecked |
| `primary_mailing_city` | Mailing City | text | Hides when "same as legal" is checked | Required when "same as legal" is unchecked |
| `primary_mailing_state_province` | Mailing State/Province | text | Hides when "same as legal" is checked | Required when "same as legal" is unchecked |
| `primary_mailing_zip_postal_code` | Mailing Zip/Postal code | text | Hides when "same as legal" is checked | Required when "same as legal" is unchecked |
| `primary_mailing_country` | Mailing Country | text | Hides when "same as legal" is checked | Required when "same as legal" is unchecked |

#### Employer Address
| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_employer_address` | Employer's Address | textarea | Shows when Employment includes "Employed" or "Self-Employed" | No |
| `primary_employer_city` | Employer City | text | Shows when Employment includes "Employed" or "Self-Employed" | No |
| `primary_employer_state_province` | Employer State/Province | text | Shows when Employment includes "Employed" or "Self-Employed" | No |
| `primary_employer_zip_postal_code` | Employer Zip/Postal Code | text | Shows when Employment includes "Employed" or "Self-Employed" | No |
| `primary_employer_country` | Employer Country | text | Shows when Employment includes "Employed" or "Self-Employed" | No |

### Phone Fields

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_home_phone` | Home Phone | text | Always visible | Format: phone |
| `primary_business_phone` | Business Phone | text | Always visible | Format: phone |
| `primary_mobile_phone` | Mobile Phone | text | Always visible | Format: phone |

### Personal Details

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `primary_citizenship_primary` | Primary Citizenship(s) | text | - | Always visible | No |
| `primary_citizenship_additional` | Additional Citizenship(s) | text | - | Always visible | No |
| `primary_gender` | Gender | radio | Male, Female | Shows when Person/Entity = "Person" | No |
| `primary_marital_status` | Marital Status | multicheck | Single, Married, Divorced, Domestic Partner, Widow(er) | Shows when Person/Entity = "Person" | No |

### Employment Information

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `primary_employment_affiliations` | Employment and Industry Affiliations | multicheck | Employed, Self-Employed, Retired, Unemployed, Student | Always visible | No |
| `primary_occupation` | Occupation | text | - | Shows when Employment includes "Employed" or "Self-Employed" | Required when Employed/Self-Employed |
| `primary_years_employed` | Years Employed | number | - | Shows when Employment includes "Employed" or "Self-Employed" | No |
| `primary_type_of_business` | Type of Business | text | - | Shows when Employment includes "Employed" or "Self-Employed" | No |
| `primary_employer_name` | Employer Name | text | - | Shows when Employment includes "Employed" or "Self-Employed" | Required when Employed/Self-Employed |

### Investment Knowledge

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `primary_general_investment_knowledge` | General Investment Knowledge and Experience | radio | Limited, Moderate, Extensive, None | Always visible | No |
| `primary_investment_knowledge_by_type` | Knowledge and Experience by Investment Type (primary) | group | - | Always visible | - |

**Investment Knowledge Fields** (within group, each has Knowledge + Since Year):
- Commodities, Futures
- Equities
- Exchange Traded Funds
- Fixed Annuities
- Fixed Insurance
- Mutual Funds
- Options
- Precious Metals
- Real Estate
- Unit Investment Trusts
- Variable Annuities
- Leveraged/Inverse ETFs
- Complex Products
- Alternative Investments
- Other (with label field)

### Financial Information

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `financial_information` | Financial Information | group | Always visible | - |
| `annual_income_from` | Annual Income - From $ | currency | Within group | No |
| `annual_income_to` | Annual Income - To $ | currency | Within group | No |
| `net_worth_from` | Net Worth (excluding primary residence) - From $ | currency | Within group | No |
| `net_worth_to` | Net Worth (excluding primary residence) - To $ | currency | Within group | No |
| `liquid_net_worth_from` | Liquid Net Worth - From $ | currency | Within group | No |
| `liquid_net_worth_to` | Liquid Net Worth - To $ | currency | Within group | No |
| `tax_bracket` | Tax Bracket | select | 0 - 15%, 15.1% - 32%, 32.1% - 50%, 50.1% + | Within group | No |

### Government Identification

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `unexpired_government_identification` | Unexpired Government Identification (Primary) | group (repeatable) | Always visible | - |
| `gov_id_type` | Type of Unexpired Photo ID | text | Within group (2 instances) | No |
| `gov_id_number` | ID Number | text | Within group (2 instances) | No |
| `gov_id_country_of_issue` | Country of Issue | text | Within group (2 instances) | No |
| `gov_id_date_of_issue` | Date of Issue | date | Within group (2 instances) | No |
| `gov_id_date_of_expiration` | Date of Expiration | date | Within group (2 instances) | No |

### Advisory Firm Questions

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_employee_of_advisory_firm` | Are you an employee of this advisor firm? | yesno | Always visible | No |
| `primary_related_to_employee_advisory` | Are you related to an employee at this advisory firm? | yesno | Shows when Employee of Advisory Firm = "Yes" | No |
| `primary_employee_name_and_relationship` | Employee Name / Relationship | text | Shows when Related to Employee Advisory = "Yes" | Required when Related = "Yes" |

### Broker-Dealer Questions

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_employee_of_broker_dealer` | Are you an employee of a broker-dealer? | yesno | Always visible | No |
| `primary_broker_dealer_name` | Broker Dealer Name | text | Shows when Employee of Broker-Dealer = "Yes" | Required when Employee = "Yes" |
| `primary_related_to_employee_broker_dealer` | Are you related to an employee at a broker-dealer? | yesno | Shows when Employee of Broker-Dealer = "Yes" | No |
| `primary_broker_dealer_employee_name` | Broker Dealer Employee Name | text | Shows when Related to Employee Broker-Dealer = "Yes" | Required when Related = "Yes" |
| `primary_broker_dealer_employee_relationship` | Broker Dealer Employee Relationship | text | Shows when Related to Employee Broker-Dealer = "Yes" | Required when Related = "Yes" |

### Other Brokerage Accounts

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_maintaining_other_brokerage_accounts` | Are you maintaining any other brokerage accounts? | yesno | Always visible | No |
| `primary_with_what_firms` | With what firm(s) are you maintaining other such accounts? | text | Shows when Maintaining Other Accounts = "Yes" | Required when Yes |
| `primary_years_of_investment_experience` | Years of Investment Experience | number | Shows when Maintaining Other Accounts = "Yes" | Required when Yes |

### Exchange/FINRA Affiliation

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_affiliated_with_exchange_or_finra` | Are you or any member of your immediate family affiliated with or employed by a Member of a stock exchange or the Financial Industry Regulatory authority? | yesno | Always visible | No |
| `primary_affiliation_employer_authorization_required` | Employer authorization required - What is the affiliation? | text | Shows when Affiliated with Exchange/FINRA = "Yes" | Required when Yes |

### Public Company

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `primary_senior_officer_or_10pct_shareholder` | Are you a senior officer, director, or 10% or more shareholder of a public company? | yesno | Always visible | No |
| `primary_company_names` | Company Name(s) | text | Shows when Senior Officer/10% Shareholder = "Yes" | Required when Yes |

---

## Step 4: Secondary Account Holder Information

**Note**: Step 4 only shows when Joint Account or Trust is selected in Step 1.

All fields in Step 4 mirror Step 3 fields with `secondary_` prefix instead of `primary_`. Conditional visibility and validation rules are identical.

### Key Differences from Primary:
- Field IDs use `secondary_` prefix
- `secondary_date_of_birth` instead of `primary_dob`
- `secondary_primary_citizenship` (no additional citizenship field)
- `secondary_marital_status` includes "Widowed" instead of "Widow(er)"
- `secondary_employment_affiliations` includes "Homemaker" option
- `secondary_affiliation_details` instead of `primary_affiliation_employer_authorization_required`
- `secondary_years_investment_experience` instead of `primary_years_of_investment_experience`

### Secondary Investment Knowledge
- Includes "Alternative Investments" and "Other" in continued section
- "Other" does not have a label field (unlike Primary)

---

## Step 5: Objectives and Investment Detail

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `risk_exposure` | Risk Exposure | multicheck | Low, Moderate, Speculation, High Risk | Always visible | No |
| `account_investment_objectives` | Account Investment Objectives | multicheck | Income, Long-Term Growth, Short-Term Growth | Always visible | No |
| `other_investments_see_attached` | Other Investments - See Attached Statement of Financial Condition | checkbox | - | Always visible | No |
| `other_investments_table` | Other Investments (table of values) | group | - | Hides when "See Attached" is checked | No |

**Investment Table Fields** (within `other_investments_table` group):
- Equities - Value $
- Options - Value $
- Fixed Income - Value $
- Mutual Funds - Value $
- Unit Investment Trusts - Value $
- Exchange-Traded Funds - Value $
- Real Estate - Value $
- Insurance - Value $
- Fixed Annuities - Value $
- Precious Metals - Value $
- Commodities/Futures - Value $
- Other - Value $ (3 instances)
- Variable Annuities - Value $

| Field ID | Label | Type | Options | Conditional Visibility | Validation |
|----------|-------|------|---------|----------------------|------------|
| `investment_time_horizon_from` | Time Horizon - from (part 1) | text | - | Always visible | No |
| `investment_time_horizon_to` | Time Horizon - to (part 2) | text | - | Always visible | No |
| `liquidity_needs` | Liquidity Needs | multicheck | High, Medium, Low | Always visible | No |

---

## Step 6: Trusted Contact

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `trusted_contact_decline_to_provide` | I/We Decline to Provide Trusted Contact | checkbox | Always visible | No |
| `trusted_contact_name` | Trusted Contact - Name | text | Hides when "Decline to Provide" is checked | Required when not declined |
| `trusted_contact_email` | Trusted Contact - Email | text | Hides when "Decline to Provide" is checked | Required when not declined, Format: email |
| `trusted_contact_home_phone` | Trusted Contact - Home Phone | text | Hides when "Decline to Provide" is checked | Format: phone |
| `trusted_contact_business_phone` | Trusted Contact - Business Phone | text | Hides when "Decline to Provide" is checked | Format: phone |
| `trusted_contact_mobile_phone` | Trusted Contact - Mobile Phone | text | Hides when "Decline to Provide" is checked | Format: phone |
| `trusted_contact_mailing_address` | Trusted Contact - Mailing Address | textarea | Hides when "Decline to Provide" is checked | No |
| `trusted_contact_city` | Trusted Contact - City | text | Hides when "Decline to Provide" is checked | No |
| `trusted_contact_state_province` | Trusted Contact - State/Province | text | Hides when "Decline to Provide" is checked | No |
| `trusted_contact_zip_postal_code` | Trusted Contact - Zip/Postal Code | text | Hides when "Decline to Provide" is checked | No |
| `trusted_contact_country` | Trusted Contact - Country | text | Hides when "Decline to Provide" is checked | No |

---

## Step 7: Signatures & Taxpayer Certification

### Read-Only Information Fields

| Field ID | Label | Type | Notes |
|----------|-------|------|-------|
| `taxpayer_certification` | Taxpayer Certification (statements text) | textarea | Read-only, informational |
| `agreement_text` | Agreement full text (read-only) | textarea | Read-only, informational |

### Account Owner Signature

| Field ID | Label | Type | Validation |
|----------|-------|------|------------|
| `account_owner_signature` | Account Owner Signature | signature | Required, must not be empty |
| `account_owner_printed_name` | Account Owner Printed Name | text | Required |
| `account_owner_date` | Account Owner Date | date | Required, Format: date |

### Joint Account Owner Signature

| Field ID | Label | Type | Conditional Visibility | Validation |
|----------|-------|------|----------------------|------------|
| `joint_account_owner_signature` | Joint Account Owner Signature | signature | Shows when Joint Account selected | Required when Joint Account |
| `joint_account_owner_printed_name` | Joint Account Owner Printed Name | text | Shows when Joint Account selected | Required when Joint Account |
| `joint_account_owner_date` | Joint Account Owner Date | date | Shows when Joint Account selected | Required when Joint Account, Format: date |

### Financial Professional Signature

| Field ID | Label | Type | Validation |
|----------|-------|------|------------|
| `financial_professional_signature` | Financial Professional Signature | signature | Required, must not be empty |
| `financial_professional_printed_name` | Financial Professional Printed Name | text | Required |
| `financial_professional_date` | Financial Professional Date | date | Required, Format: date |

### Supervisor/Principal Signature

| Field ID | Label | Type | Validation |
|----------|-------|------|------------|
| `supervisor_principal_signature` | Supervisor / Principal Signature | signature | Required, must not be empty |
| `supervisor_principal_printed_name` | Supervisor / Principal Printed Name | text | Required |
| `supervisor_principal_date` | Supervisor / Principal Date | date | Required, Format: date |

---

## Field Type Summary

### Text Fields (50+)
- Single-line text inputs
- Examples: Name, City, State, SSN, EIN, Occupation

### Textarea Fields (10+)
- Multi-line text inputs
- Examples: Addresses

### Number Fields (5+)
- Numeric inputs
- Examples: Years Employed, Number of Tenants

### Date Fields (15+)
- Date pickers
- Examples: DOB, Agreement Dates, Signature Dates, Gift Dates

### Currency Fields (20+)
- Monetary values with $ prefix
- Examples: Income, Net Worth, Investment Values

### Checkbox Fields (10+)
- Boolean toggles
- Examples: Retirement, Retail, See Attached, Decline to Provide

### Yes/No Fields (20+)
- Single selection Yes/No
- Examples: All advisory firm, broker-dealer questions

### Radio Fields (30+)
- Single selection from options
- Examples: Person/Entity, Gender, Investment Knowledge levels

### Multicheck Fields (15+)
- Multiple selection from options
- Examples: Type of Account, Marital Status, Employment, Risk Exposure

### Select Fields (2)
- Dropdown single selection
- Examples: Tax Bracket

### Signature Fields (4)
- Canvas-based signature capture
- Examples: All signature fields in Step 7

### Group Fields (10+)
- Container for related fields
- Examples: Trust block, Joint Accounts, Investment Knowledge, Financial Information

---

## Conditional Visibility Summary

### Always Visible Fields
- Header fields (RR Name, RR No., Customer Names, Account No.)
- Retirement and Retail checkboxes
- Type of Account selections
- Basic information fields (Name, Person/Entity, Email)
- Most Yes/No questions
- Investment Knowledge fields
- Objectives fields
- Signature fields

### Conditionally Visible Fields

**Step 1**:
- Joint Accounts section: When Joint Tenant selected
- Custodial section: When Custodial selected
- Trust block: When Trust selected
- Other account type text: When Other selected
- Transfer on Death dates: When respective account type selected

**Step 2**:
- Other text: When "Other" selected in source of funds

**Step 3 & 4**:
- Person fields (SSN, DOB, Gender, etc.): When Person selected
- Entity fields (EIN, Yes/No box): When Entity selected
- Mailing address fields: When "same as legal" is unchecked
- Employment fields: When Employed or Self-Employed selected
- Advisory firm fields: When Employee of Advisory Firm = "Yes"
- Broker-dealer fields: When Employee of Broker-Dealer = "Yes"
- Other brokerage fields: When Maintaining Other Accounts = "Yes"
- Exchange/FINRA fields: When Affiliated = "Yes"
- Public company fields: When Senior Officer/Shareholder = "Yes"

**Step 5**:
- Investment table: When "See Attached" is unchecked

**Step 6**:
- All contact fields: When "Decline to Provide" is unchecked

**Step 7**:
- Joint Account Owner signature: When Joint Account selected

---

## Validation Summary

### Always Required
- RR Name
- Customer Names
- Primary Name
- Primary Person/Entity
- Primary Legal Address (all fields)
- Account Owner Signature, Printed Name, Date
- Financial Professional Signature, Printed Name, Date
- Supervisor/Principal Signature, Printed Name, Date

### Conditionally Required
- SSN: When Person selected
- EIN: When Entity selected
- DOB: When Person selected
- Mailing Address fields: When "same as legal" is unchecked
- Employment fields: When Employed/Self-Employed selected
- All Yes/No follow-up fields: When respective Yes/No = "Yes"
- Trusted Contact fields: When not declined
- Joint Account Owner fields: When Joint Account selected

### Format Validation
- SSN: XXX-XX-XXXX
- EIN: XX-XXXXXXX
- Email: Standard email format
- Phone: At least 10 digits
- Date: Valid date format
- Currency: Valid number, non-negative
- DOB: Must be in the past
- Signatures: Must not be empty

---

## Related Fields Mapping

### Person/Entity Toggle
- **Person** → Shows: SSN, DOB, Gender, Marital Status, Specified Adult
- **Entity** → Shows: EIN, Yes/No box

### Account Type Dependencies
- **Joint Tenant** → Shows: Joint Accounts section, Joint Account Owner signature
- **Custodial** → Shows: Custodial section
- **Trust** → Shows: Trust block, Step 4 (if not already shown)
- **Transfer on Death** → Shows: Agreement Date input

### Employment Dependencies
- **Employed OR Self-Employed** → Shows: Occupation, Years Employed, Type of Business, Employer Name, Employer Address

### Yes/No Dependencies
- **Employee of Advisory Firm = Yes** → Shows: Related to Employee question
- **Related to Employee Advisory = Yes** → Shows: Employee Name/Relationship
- **Employee of Broker-Dealer = Yes** → Shows: Broker Dealer Name, Related to Employee question
- **Related to Employee Broker-Dealer = Yes** → Shows: Employee Name/Relationship
- **Maintaining Other Accounts = Yes** → Shows: With What Firms, Years of Experience
- **Affiliated with Exchange/FINRA = Yes** → Shows: Affiliation Details
- **Senior Officer/Shareholder = Yes** → Shows: Company Names

### Mailing Address Dependencies
- **Same as Legal = Checked** → Hides: All mailing address fields
- **Same as Legal = Unchecked** → Shows: All mailing address fields (required)

### Trusted Contact Dependencies
- **Decline to Provide = Checked** → Hides: All contact fields
- **Decline to Provide = Unchecked** → Shows: All contact fields (Name and Email required)

---

## Field Grouping Patterns

### Address Groups
- Legal Address (always shown)
- Mailing Address (conditional on "same as legal" checkbox)
- Employer Address (conditional on employment status)

### Phone Groups
- Home Phone
- Business Phone
- Mobile Phone

### Investment Knowledge Groups
- Knowledge Level (radio)
- Since Year (text)
- Other Investment (Primary only: Label + Knowledge + Since Year)

### Financial Information Groups
- Annual Income (From/To)
- Net Worth (From/To)
- Liquid Net Worth (From/To)
- Tax Bracket (select)

### Signature Groups
- Signature (canvas)
- Printed Name (text)
- Date (date)

---

## Notes

1. **Field Naming Convention**: 
   - Primary fields use `primary_` prefix
   - Secondary fields use `secondary_` prefix
   - Trusted contact fields use `trusted_contact_` prefix

2. **Repeatable Groups**:
   - Government Identification: Always 2 instances (ID #1 and ID #2)
   - Cannot add/remove instances

3. **Special Field Handling**:
   - Address and Phone fields are automatically grouped by `FieldRenderer`
   - Individual address/phone fields are skipped in form rendering
   - Investment Knowledge is rendered as table by `KnowledgeTableField`

4. **Conditional Logic**:
   - All conditional rules are defined in `fieldDependencies.ts`
   - `ConditionalFieldManager` evaluates visibility before rendering
   - Supports AND/OR logic for multiple conditions

5. **Validation**:
   - Validation rules are defined in `formValidation.ts`
   - Supports required, conditional required, format, and custom validation
   - Validation can be run on entire form or single field

---

## Quick Reference: Field Count by Type

- **Text**: ~50 fields
- **Textarea**: ~10 fields
- **Number**: ~5 fields
- **Date**: ~15 fields
- **Currency**: ~20 fields
- **Checkbox**: ~10 fields
- **Yes/No**: ~20 fields
- **Radio**: ~30 fields
- **Multicheck**: ~15 fields
- **Select**: ~2 fields
- **Signature**: ~4 fields
- **Group**: ~10 groups

**Total**: ~200+ individual fields across 7 steps

