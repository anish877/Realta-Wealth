# Investor Profile Form - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Form Structure](#form-structure)
3. [Field Types](#field-types)
4. [Conditional Logic](#conditional-logic)
5. [Repetitive Patterns](#repetitive-patterns)
6. [Single vs Multiple Selects](#single-vs-multiple-selects)
7. [Validation Rules](#validation-rules)
8. [Component Architecture](#component-architecture)
9. [Data Flow](#data-flow)
10. [Special Cases](#special-cases)

---

## Overview

The Investor Profile Form is a comprehensive 7-step multi-page form for collecting detailed investor information for brokerage account registration. The form includes conditional field visibility, validation rules, and handles both single and multiple selection fields.

**Purpose**: Collect complete investor profile information including account registration details, personal/entity information, employment details, investment knowledge, objectives, trusted contact, and signatures.

**Total Steps**: 7 steps across multiple pages
**Total Fields**: 200+ fields with conditional visibility
**Form Type**: Multi-step wizard with progress tracking

---

## Form Structure

### Step 1: Account Registration
- **Page**: 1
- **Fields**: 20+
- **Key Sections**:
  - Header fields (RR Name, RR No., Customer Names, Account No.)
  - Retirement checkbox (disables Step 1 fields when checked)
  - Retail checkbox
  - Type of Account (left and right columns)
  - Additional Designations (C Corp, S Corp, UGMA, UTMA, etc.)
  - Trust block (when Trust selected)
  - Joint Accounts section (when Joint Tenant selected)
  - Custodial Accounts section (when Custodial selected)

### Step 2: USA Patriot Act Information
- **Page**: 2
- **Fields**: 1 multicheck field + 1 text field
- **Key Sections**:
  - Initial Source of Funds (16 options, multicheck)
  - Other - specify text field (conditional)

### Step 3: Primary Account Holder Information
- **Page**: 2-3
- **Fields**: 80+
- **Key Sections**:
  - Basic Information (Name, Person/Entity, SSN/EIN, Email, DOB)
  - Addresses (Legal, Mailing with "same as legal" option, Employer)
  - Phone Numbers (Home, Business, Mobile)
  - Personal Details (Gender, Marital Status, Citizenship)
  - Employment Information (conditional on employment status)
  - Investment Knowledge (General + by Investment Type table)
  - Financial Information (Income ranges, Net Worth, Tax Bracket)
  - Government Identification (repeatable, 2 instances)
  - Advisory Firm questions (conditional Yes/No)
  - Broker-Dealer questions (conditional Yes/No)
  - Other Brokerage Accounts (conditional Yes/No)
  - Exchange/FINRA Affiliation (conditional Yes/No)
  - Public Company Officer/Shareholder (conditional Yes/No)

### Step 4: Secondary Account Holder Information
- **Page**: 4-5
- **Fields**: 80+ (similar to Primary)
- **Visibility**: Only shown when Joint Account or Trust is selected in Step 1
- **Key Sections**: Same structure as Primary Account Holder

### Step 5: Objectives and Investment Detail
- **Page**: 5-6
- **Fields**: 20+
- **Key Sections**:
  - Risk Exposure (multicheck)
  - Account Investment Objectives (multicheck)
  - Other Investments (checkbox to see attached statement OR investment value table)
  - Investment Time Horizon (from/to text fields)
  - Liquidity Needs (multicheck)

### Step 6: Trusted Contact
- **Page**: 6
- **Fields**: 10+
- **Key Sections**:
  - Decline to Provide checkbox (hides all contact fields when checked)
  - Contact Information (Name, Email, Phones, Address)

### Step 7: Signatures & Taxpayer Certification
- **Page**: 6
- **Fields**: 12+
- **Key Sections**:
  - Agreement text (read-only)
  - Taxpayer Certification text (read-only)
  - Account Owner Signature (required)
  - Joint Account Owner Signature (conditional on Joint Account)
  - Financial Professional Signature (required)
  - Supervisor/Principal Signature (required)

---

## Field Types

### Text Fields (`text`)
- **Purpose**: Single-line text input
- **Examples**: Name, City, State, SSN, EIN
- **Component**: `TextField`
- **Validation**: Optional format validation (SSN, EIN)

### Textarea Fields (`textarea`)
- **Purpose**: Multi-line text input
- **Examples**: Legal Address, Mailing Address, Employer Address
- **Component**: `TextareaField`
- **Validation**: Length validation

### Number Fields (`number`)
- **Purpose**: Numeric input
- **Examples**: Years Employed, Number of Tenants
- **Component**: `NumberField`
- **Validation**: Min/max range validation

### Date Fields (`date`)
- **Purpose**: Date selection
- **Examples**: Date of Birth, Agreement Date, Signature Date
- **Component**: `DateField`
- **Validation**: Date format, past date validation for DOB

### Currency Fields (`currency`)
- **Purpose**: Monetary values
- **Examples**: Annual Income, Net Worth, Investment Values
- **Component**: `CurrencyField`
- **Validation**: Numeric format, non-negative

### Checkbox Fields (`checkbox`)
- **Purpose**: Boolean toggle
- **Examples**: Retirement, Retail, See Attached Statement
- **Component**: `CheckboxField`
- **Behavior**: Single boolean value (true/false)

### Yes/No Fields (`yesno`)
- **Purpose**: Single selection Yes/No
- **Examples**: All advisory firm, broker-dealer, brokerage account questions
- **Component**: `YesNoField`
- **Behavior**: Radio group with "Yes" and "No" options (exclusive selection)

### Radio Fields (`radio`)
- **Purpose**: Single selection from multiple options
- **Examples**: Person/Entity, Gender, General Investment Knowledge, Investment Knowledge levels
- **Component**: `RadioField`
- **Behavior**: Exclusive selection (only one option can be selected)

### Multicheck Fields (`multicheck`)
- **Purpose**: Multiple selection from options
- **Examples**: Type of Account, Marital Status, Employment Affiliations, Risk Exposure, Account Objectives
- **Component**: `MulticheckField`
- **Behavior**: Non-exclusive selection (multiple options can be selected)
- **Special**: Supports "Other" option with conditional text input

### Select Fields (`select`)
- **Purpose**: Dropdown single selection
- **Examples**: Tax Bracket
- **Component**: `SelectField`
- **Behavior**: Single selection from dropdown

### Signature Fields (`signature`)
- **Purpose**: Canvas-based signature capture
- **Examples**: All signature fields in Step 7
- **Component**: `SignatureField`
- **Behavior**: Canvas drawing with clear functionality

### Group Fields (`group`)
- **Purpose**: Container for related fields
- **Examples**: Trust block, Joint Accounts section, Investment Knowledge table
- **Component**: `FieldGroup`
- **Behavior**: Can be repeatable (e.g., Government ID - 2 instances)

---

## Conditional Logic

### Overview
Conditional logic is managed through `ConditionalFieldManager` and `fieldDependencies.ts`. Fields can be shown or hidden based on:
- Other field values
- Multiple conditions (AND/OR logic)
- Checkbox states
- Array includes checks

### Conditional Operators
- `equals`: Exact match
- `notEquals`: Not equal
- `includes`: Array contains value (for multicheck fields)
- `notIncludes`: Array does not contain value
- `checked`: Checkbox is checked or Yes/No is "Yes"
- `notChecked`: Checkbox is unchecked or Yes/No is "No"
- `anyChecked`: At least one value in array matches
- `noneChecked`: No values in array match

### Step 1 Conditional Rules

#### Account Type Dependencies
- **Joint Accounts Section**: Shows when `type_of_account` includes `joint_tenant`
- **Custodial Accounts Section**: Shows when `type_of_account` includes `custodial`
- **Other Account Type Text**: Shows when `type_of_account_right` includes `other_account_type`
- **Trust Block**: Shows when `type_of_account_right` includes `trust`
  - Trust Establishment Date: Shows when Trust is selected
  - Trust Type: Shows when Trust is selected
- **Transfer on Death Dates**:
  - Individual Date: Shows when `transfer_on_death_individual` is selected
  - Joint Date: Shows when `transfer_on_death_joint` is selected

#### Additional Designation Fields
Handled within `AccountTypeSection` component:
- **Corporation**: Shows C Corp and S Corp checkboxes
- **Custodial**: Shows UGMA and UTMA checkboxes
- **Limited Liability Company**: Shows C Corp, S Corp, and Partnership checkboxes
- **Transfer on Death**: Shows Agreement Date input
- **Trust**: Shows Establishment Date and Trust Type multicheck
- **Other**: Shows text input for specification

### Step 2 Conditional Rules

#### Source of Funds
- **Other Text Field**: Shows when `initial_source_of_funds` includes "Other"

### Step 3 Conditional Rules (Primary Account Holder)

#### Person/Entity Toggle
- **Person Fields** (show when `primary_person_entity` = "Person"):
  - SSN
  - Date of Birth
  - Gender
  - Marital Status
  - Specified Adult
- **Entity Fields** (show when `primary_person_entity` = "Entity"):
  - EIN
  - Yes/No Box

#### Mailing Address
- **Mailing Address Fields** (hide when `primary_mailing_same_as_legal` is checked):
  - Mailing Address
  - Mailing City
  - Mailing State/Province
  - Mailing Zip/Postal Code
  - Mailing Country

#### Employment Fields
- **Employment-Related Fields** (show when `primary_employment_affiliations` includes "Employed" OR "Self-Employed"):
  - Occupation
  - Years Employed
  - Type of Business
  - Employer Name
  - Employer Address (all fields)

#### Advisory Firm
- **Related to Employee**: Shows when `primary_employee_of_advisory_firm` = "Yes"
- **Employee Name/Relationship**: Shows when `primary_related_to_employee_advisory` = "Yes"

#### Broker-Dealer
- **Broker Dealer Name**: Shows when `primary_employee_of_broker_dealer` = "Yes"
- **Related to Employee**: Shows when `primary_employee_of_broker_dealer` = "Yes"
- **Employee Name/Relationship**: Shows when `primary_related_to_employee_broker_dealer` = "Yes"

#### Other Brokerage Accounts
- **With What Firms**: Shows when `primary_maintaining_other_brokerage_accounts` = "Yes"
- **Years of Investment Experience**: Shows when `primary_maintaining_other_brokerage_accounts` = "Yes"

#### Exchange/FINRA
- **Affiliation Details**: Shows when `primary_affiliated_with_exchange_or_finra` = "Yes"

#### Public Company
- **Company Names**: Shows when `primary_senior_officer_or_10pct_shareholder` = "Yes"

### Step 4 Conditional Rules (Secondary Account Holder)
Same conditional logic as Step 3, with `secondary_` prefix instead of `primary_`.

### Step 5 Conditional Rules

#### Investment Table
- **Investment Detail Table**: Hides when `other_investments_see_attached` is checked

### Step 6 Conditional Rules

#### Trusted Contact
- **All Contact Fields** (hide when `trusted_contact_decline_to_provide` is checked):
  - Name
  - Email
  - Home Phone
  - Business Phone
  - Mobile Phone
  - Mailing Address
  - City
  - State/Province
  - Zip/Postal Code
  - Country

### Step 7 Conditional Rules

#### Joint Account Owner Signature
- **Joint Account Owner Fields** (show when `type_of_account` includes `joint_tenant`):
  - Signature
  - Printed Name
  - Date

### Step-Level Conditional Logic

#### Step 1 Disabling (Retirement Checkbox)
- When `retirement_checkbox` is checked:
  - All Step 1 fields are disabled EXCEPT:
    - RR Name
    - RR No.
    - Customer Name(s)
    - Account No.
    - Retirement checkbox itself (to allow unchecking)
- Step 1 remains visible but fields are disabled

#### Step 4 Visibility
- Step 4 (Secondary Account Holder) only shows when:
  - `type_of_account` includes `joint_tenant` OR
  - `type_of_account_right` includes `trust`

---

## Repetitive Patterns

### 1. Primary vs Secondary Account Holder

**Pattern**: Nearly identical field structures for Primary and Secondary account holders.

**Fields Duplicated**:
- Basic Information (Name, Person/Entity, SSN/EIN, Email, DOB)
- Addresses (Legal, Mailing, Employer)
- Phone Numbers (Home, Business, Mobile)
- Personal Details (Gender, Marital Status, Citizenship)
- Employment Information
- Investment Knowledge
- Financial Information
- Government Identification
- Advisory Firm questions
- Broker-Dealer questions
- Other Brokerage Accounts
- Exchange/FINRA Affiliation
- Public Company questions

**Implementation**: 
- Fields use `primary_` and `secondary_` prefixes
- Same conditional logic applied to both
- Same validation rules for both

**Component Reuse**: 
- `AddressFieldGroup` handles both primary and secondary addresses
- `PhoneFieldsGroup` handles both primary and secondary phones
- `KnowledgeTableField` handles both primary and secondary investment knowledge

### 2. Address Field Groups

**Pattern**: Three types of addresses (Legal, Mailing, Employer) with identical structure.

**Fields in Each Address**:
- Address (textarea)
- City (text)
- State/Province (text)
- Zip/Postal Code (text)
- Country (text)

**Special Case**: Mailing Address has "same as legal" checkbox that hides all mailing fields when checked.

**Implementation**: 
- `AddressFieldGroup` component handles all three types
- Detects address type from field ID prefix
- Conditionally shows "same as legal" checkbox for mailing addresses

**Usage**:
- Primary Legal Address: `primary_legal_address`
- Primary Mailing Address: `primary_mailing_address`
- Primary Employer Address: `primary_employer_address`
- Secondary Legal Address: `secondary_legal_address`
- Secondary Mailing Address: `secondary_mailing_address`
- Secondary Employer Address: `secondary_employer_address`

### 3. Phone Field Groups

**Pattern**: Three phone number fields (Home, Business, Mobile) grouped together.

**Fields in Each Phone Group**:
- Home Phone
- Business Phone
- Mobile Phone

**Implementation**: 
- `PhoneFieldsGroup` component handles all phone fields
- Detects prefix (primary/secondary/trusted_contact) from field ID

**Usage**:
- Primary Phones: `primary_home_phone`
- Secondary Phones: `secondary_home_phone`
- Trusted Contact Phones: `trusted_contact_home_phone`

### 4. Investment Knowledge Tables

**Pattern**: Investment knowledge by type with consistent structure (Knowledge level + Since Year).

**Structure**:
- Investment Type (label)
- Knowledge Level (radio: Limited/Moderate/Extensive/None)
- Since Year (text input)

**Implementation**: 
- `KnowledgeTableField` component renders as table
- Handles both Primary and Secondary investment knowledge
- Includes "Other" investment type with label field for Primary

**Investment Types**:
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
- Other (Primary only - with label field)

### 5. Government Identification (Repeatable)

**Pattern**: Two instances of government ID information.

**Fields in Each ID**:
- Type of Unexpired Photo ID
- ID Number
- Country of Issue (Primary only)
- Date of Issue
- Date of Expiration

**Implementation**: 
- `GovernmentIdTableField` component
- Repeatable group with 2 instances
- Rendered as table with ID #1 and ID #2

**Usage**:
- Primary: `unexpired_government_identification`
- Secondary: `secondary_unexpired_government_identification`

### 6. Financial Information Groups

**Pattern**: Financial ranges (From/To) for income and net worth.

**Fields in Each Financial Group**:
- Annual Income - From $
- Annual Income - To $
- Net Worth (excluding primary residence) - From $
- Net Worth (excluding primary residence) - To $
- Liquid Net Worth - From $
- Liquid Net Worth - To $
- Tax Bracket (select dropdown)

**Implementation**: 
- `FinancialInformationSection` component
- Separate groups for Primary and Secondary

**Usage**:
- Primary: `financial_information`
- Secondary: `secondary_financial_information`

---

## Single vs Multiple Selects

### Single Select Fields (Radio/YesNo/Select)

These fields enforce exclusive selection - only one option can be selected at a time.

#### Radio Fields (Single Selection)
1. **Person/Entity** (Primary & Secondary)
   - Options: ["Person", "Entity"]
   - Determines which fields show (SSN vs EIN, DOB, Gender, etc.)

2. **Gender** (Primary & Secondary)
   - Options: ["Male", "Female"]
   - Only shown for Person (not Entity)

3. **General Investment Knowledge** (Primary & Secondary)
   - Options: ["Limited", "Moderate", "Extensive", "None"]

4. **Investment Knowledge Levels** (All investment types, Primary & Secondary)
   - Options: ["Limited", "Moderate", "Extensive", "None"]
   - One per investment type

5. **Tax Bracket** (Primary & Secondary)
   - Options: ["0 - 15%", "15.1% - 32%", "32.1% - 50%", "50.1% +"]
   - Select dropdown

#### Yes/No Fields (Single Selection)
All Yes/No questions use exclusive selection:
- Advisory Firm questions (Primary & Secondary)
- Broker-Dealer questions (Primary & Secondary)
- Other Brokerage Accounts (Primary & Secondary)
- Exchange/FINRA Affiliation (Primary & Secondary)
- Public Company Officer/Shareholder (Primary & Secondary)
- Specified Adult (Primary & Secondary)
- Are account holders married? (Step 1)

### Multiple Select Fields (Multicheck)

These fields allow non-exclusive selection - multiple options can be selected simultaneously.

1. **Type of Account** (Left Column)
   - Options: Individual, Corporation, Corporate Pension/Profit Sharing, Custodial, Estate, Joint Tenant, Limited Liability/Company, Individual Single Member LLC, Sole Proprietorship, Transfer on Death Individual, Transfer on Death Joint
   - Multiple account types can be selected

2. **Type of Account** (Right Column)
   - Options: Trust, Nonprofit Organization, Partnership, Exempt Organization, Other
   - Multiple account types can be selected

3. **Additional Designation**
   - Options: C Corp, S Corp, UGMA, UTMA, Partnership
   - Shown conditionally based on account type selected

4. **Trust Type**
   - Options: Charitable, Living, Irrevocable Living, Family, Revocable, Irrevocable, Testamentary
   - Multiple trust types can be selected

5. **Tenancy Clause**
   - Options: Community Property, Tenants by Entirety, Community Property with Rights of Survivorship, Joint Tenants with Rights of Survivorship, Tenants in Common
   - Multiple options can be selected

6. **Marital Status** (Primary & Secondary)
   - Options: ["Single", "Married", "Divorced", "Domestic Partner", "Widow(er)"]
   - Multiple statuses can be selected

7. **Employment Affiliations** (Primary & Secondary)
   - Options: ["Employed", "Self-Employed", "Retired", "Unemployed", "Student", "Homemaker" (Secondary only)]
   - Multiple affiliations can be selected

8. **Initial Source of Funds**
   - Options: 16 options including "Other"
   - Multiple sources can be selected
   - "Other" option shows conditional text input

9. **Risk Exposure**
   - Options: ["Low", "Moderate", "Speculation", "High Risk"]
   - Multiple risk levels can be selected

10. **Account Investment Objectives**
    - Options: ["Income", "Long-Term Growth", "Short-Term Growth"]
    - Multiple objectives can be selected

11. **Liquidity Needs**
    - Options: ["High", "Medium", "Low"]
    - Multiple options can be selected (though typically single selection)

### Selection Behavior Verification

- **RadioField**: Uses `RadioGroup` from Radix UI - enforces single selection ✓
- **YesNoField**: Uses `RadioGroup` from Radix UI - enforces single selection ✓
- **MulticheckField**: Uses individual `Checkbox` components - allows multiple selection ✓
- **SelectField**: Uses `Select` from Radix UI - enforces single selection ✓

---

## Validation Rules

### Validation System

Validation is handled through `formValidation.ts` utility. Rules can be:
- **Required**: Field must have a value
- **Conditionally Required**: Required when another field meets a condition
- **Format Validation**: SSN, EIN, Email, Phone, Date, Currency formats
- **Length Validation**: Min/max character length
- **Range Validation**: Min/max numeric values
- **Custom Validation**: Custom validation functions

### Required Fields

#### Always Required
- RR Name
- Customer Names
- Primary Name
- Primary Person/Entity
- Primary Legal Address (all fields)
- Account Owner Signature
- Account Owner Printed Name
- Account Owner Date
- Financial Professional Signature
- Financial Professional Printed Name
- Financial Professional Date

#### Conditionally Required

**Step 1**:
- None (all optional)

**Step 3 (Primary)**:
- SSN: Required when Person/Entity = "Person"
- EIN: Required when Person/Entity = "Entity"
- DOB: Required when Person/Entity = "Person"
- Mailing Address fields: Required when "Mailing same as legal" is unchecked
- Occupation: Required when Employment includes "Employed" or "Self-Employed"
- Employer Name: Required when Employment includes "Employed" or "Self-Employed"
- Employee Name/Relationship: Required when Related to Employee Advisory = "Yes"
- Broker Dealer Name: Required when Employee of Broker-Dealer = "Yes"
- Broker Dealer Employee Name: Required when Related to Employee Broker-Dealer = "Yes"
- Broker Dealer Employee Relationship: Required when Related to Employee Broker-Dealer = "Yes"
- With What Firms: Required when Maintaining Other Brokerage Accounts = "Yes"
- Years of Investment Experience: Required when Maintaining Other Brokerage Accounts = "Yes"
- Affiliation Details: Required when Affiliated with Exchange/FINRA = "Yes"
- Company Names: Required when Senior Officer/10% Shareholder = "Yes"

**Step 4 (Secondary)**: Same conditional requirements as Step 3 with `secondary_` prefix

**Step 6 (Trusted Contact)**:
- Name: Required when Decline to Provide is unchecked
- Email: Required when Decline to Provide is unchecked

**Step 7 (Signatures)**:
- Joint Account Owner Signature: Required when Joint Account is selected
- Joint Account Owner Printed Name: Required when Joint Account is selected
- Joint Account Owner Date: Required when Joint Account is selected

### Format Validation

#### SSN Format
- **Pattern**: XXX-XX-XXXX
- **Regex**: `/^\d{3}-\d{2}-\d{4}$/`
- **Fields**: `primary_ssn`, `secondary_ssn`

#### EIN Format
- **Pattern**: XX-XXXXXXX
- **Regex**: `/^\d{2}-\d{7}$/`
- **Fields**: `primary_ein`, `secondary_ein`

#### Email Format
- **Pattern**: Standard email format
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Fields**: `primary_email`, `secondary_email`, `trusted_contact_email`

#### Phone Format
- **Pattern**: Flexible - allows (XXX) XXX-XXXX, XXX-XXX-XXXX, XXXXXXXXXX
- **Validation**: Must contain at least 10 digits
- **Fields**: All phone fields

#### Date Format
- **Validation**: Must be valid date
- **Custom**: DOB must be in the past
- **Fields**: All date fields

#### Currency Format
- **Validation**: Must be valid number, non-negative
- **Fields**: All currency fields (income, net worth, investment values)

### Custom Validation

#### Date of Birth
- Must be in the past (cannot be today or future date)

#### Signatures
- Signature canvas must have content (not empty string)

---

## Component Architecture

### Core Components

#### InvestorProfileForm
- **Location**: `frontend/src/components/InvestorProfileForm.tsx`
- **Purpose**: Main form orchestrator
- **Responsibilities**:
  - Manages form state (`formData`)
  - Manages current step
  - Filters sections based on conditional logic
  - Handles field updates
  - Renders ProgressBar, StepContainer, FormNavigation

#### FieldRenderer
- **Location**: `frontend/src/components/FieldRenderer.tsx`
- **Purpose**: Dynamic field rendering based on field type
- **Responsibilities**:
  - Checks field visibility using `ConditionalFieldManager`
  - Renders appropriate field component based on type
  - Handles special cases (address groups, phone groups, tables)
  - Passes disabled state to fields

#### ConditionalFieldManager
- **Location**: `frontend/src/components/ConditionalFieldManager.tsx`
- **Purpose**: Manages field visibility logic
- **Methods**:
  - `shouldShow(fieldId, formData)`: Check if field should be visible
  - `shouldShowStep(stepNumber, formData)`: Check if step should be shown
  - `shouldSkipStep1(formData)`: Check if Step 1 should be disabled

### Field Components

#### Basic Field Components
- `TextField`: Text input
- `TextareaField`: Multi-line text input
- `NumberField`: Numeric input
- `DateField`: Date picker
- `CurrencyField`: Currency input with $ prefix
- `CheckboxField`: Boolean checkbox
- `YesNoField`: Yes/No radio group
- `RadioField`: Radio button group
- `MulticheckField`: Multiple checkbox group
- `SelectField`: Dropdown select
- `SignatureField`: Canvas-based signature

#### Specialized Section Components
- `AccountTypeSection`: Step 1 account type tables with conditional designations
- `PatriotActSection`: Step 2 source of funds 3-column grid
- `FinancialInformationSection`: Financial ranges and tax bracket
- `ObjectivesSection`: Step 5 objectives with investment table
- `TrustedContactSection`: Step 6 trusted contact with decline option
- `SignaturesSection`: Step 7 signatures with agreements

#### Group Components
- `AddressFieldGroup`: Handles Legal, Mailing, and Employer addresses
- `PhoneFieldsGroup`: Handles Home, Business, and Mobile phones
- `KnowledgeTableField`: Investment knowledge table
- `GovernmentIdTableField`: Repeatable government ID table
- `InvestmentTableField`: Investment values table

### Utility Components

#### ConditionalFieldManager
- Manages field visibility based on rules in `fieldDependencies.ts`

#### formValidation
- Validates form data against validation rules
- Provides `validateForm()` and `validateSingleField()` functions

---

## Data Flow

### Form State Management

```
InvestorProfileForm (State)
  ├── formData: Record<string, FieldValue>
  ├── currentStep: number
  └── sections: Section[] (filtered based on conditions)
```

### Field Update Flow

1. User interacts with field
2. Field component calls `onChange(value)`
3. `InvestorProfileForm.updateField(fieldId, value)` updates state
4. `formData` state updates
5. Conditional logic re-evaluates
6. Affected fields show/hide based on new state
7. Validation runs (if implemented)

### Conditional Visibility Flow

1. `FieldRenderer` receives field to render
2. Calls `ConditionalFieldManager.shouldShow(fieldId, formData)`
3. `ConditionalFieldManager` looks up rule in `fieldDependencies.ts`
4. Evaluates conditions against current `formData`
5. Returns boolean (show/hide)
6. `FieldRenderer` renders or returns null

### Step Navigation Flow

1. User clicks "Next" or "Previous"
2. `InvestorProfileForm` updates `currentStep`
3. `sections` array is filtered based on conditional logic
4. Effective step is calculated (handles filtered sections)
5. New step is rendered
6. Progress bar updates

---

## Special Cases

### 1. Retirement Checkbox Behavior

**Location**: Step 1

**Behavior**:
- When checked: Disables all Step 1 fields EXCEPT:
  - RR Name
  - RR No.
  - Customer Name(s)
  - Account No.
  - Retirement checkbox itself (to allow unchecking)
- Step 1 remains visible (not skipped)
- Fields are visually disabled (opacity) but Retirement checkbox remains interactive
- Informational message displayed when disabled

**Implementation**:
- `isStep1Disabled` state in `InvestorProfileForm`
- `alwaysEnabledFields` array excludes Retirement checkbox from disabling
- Retirement checkbox explicitly gets `disabled={false}`

### 2. Step 4 Conditional Visibility

**Location**: Step 4 (Secondary Account Holder)

**Behavior**:
- Only shows when:
  - `type_of_account` includes `joint_tenant` OR
  - `type_of_account_right` includes `trust`
- If neither condition is met, Step 4 is completely hidden from navigation

**Implementation**:
- `ConditionalFieldManager.shouldShowStep(4, formData)` checks conditions
- `sections` array is filtered to exclude Step 4 when conditions not met

### 3. Mailing Address "Same as Legal" Checkbox

**Location**: Step 3 and Step 4

**Behavior**:
- When checked: Hides all mailing address fields
- When unchecked: Shows all mailing address fields
- Checkbox is part of `AddressFieldGroup` component

**Implementation**:
- `hideWhen` condition in `fieldDependencies.ts`
- `AddressFieldGroup` conditionally renders fields based on checkbox state

### 4. Trusted Contact "Decline to Provide"

**Location**: Step 6

**Behavior**:
- When checked: Hides all trusted contact information fields
- When unchecked: Shows all trusted contact fields

**Implementation**:
- `hideWhen` condition for all trusted contact fields
- `TrustedContactSection` handles conditional rendering

### 5. Investment Table "See Attached Statement"

**Location**: Step 5

**Behavior**:
- When checked: Hides investment detail table
- When unchecked: Shows investment detail table

**Implementation**:
- `hideWhen` condition for `other_investments_table`
- `ObjectivesSection` conditionally renders table

### 6. "Other" Field Handling in Multicheck

**Location**: Multiple sections

**Behavior**:
- When "Other" option is selected in multicheck field:
  - Shows conditional text input field
  - Text input is required when "Other" is selected

**Implementation**:
- `MulticheckField` detects "Other" option
- Conditionally renders `TextField` when "Other" is selected
- Uses `otherFieldId` and `onOtherChange` props

**Fields with "Other" Option**:
- Initial Source of Funds
- Account Type (right column)

### 7. Account Type Additional Designations

**Location**: Step 1, `AccountTypeSection`

**Behavior**:
- Different account types show different additional designation options:
  - **Corporation**: C Corp, S Corp
  - **Custodial**: UGMA, UTMA
  - **Limited Liability Company**: C Corp, S Corp, Partnership
  - **Transfer on Death**: Agreement Date input
  - **Trust**: Establishment Date + Trust Type multicheck
  - **Other**: Text input for specification

**Implementation**:
- `AccountTypeSection.renderAdditionalDesignation()` method
- Conditionally renders based on selected account type
- Handled within component, not through fieldDependencies

### 8. Investment Knowledge "Other" Field (Primary Only)

**Location**: Step 3, Primary Investment Knowledge

**Behavior**:
- Primary investment knowledge includes "Other" investment type
- "Other" has three fields:
  - Label (text input)
  - Knowledge level (radio)
  - Since Year (text input)
- Secondary investment knowledge has "Alternative Investments" and "Other" but without label field

**Implementation**:
- `KnowledgeTableField` handles "Other" fields specially
- Merges "Other" fields from continued section into table
- Different handling for Primary vs Secondary

### 9. Government ID Repeatable Groups

**Location**: Step 3 and Step 4

**Behavior**:
- Always shows 2 instances (ID #1 and ID #2)
- Cannot add/remove instances (fixed at 2)
- Rendered as table

**Implementation**:
- `GovernmentIdTableField` component
- Initializes with 2 empty objects if data is empty
- Renders as table with ID #1 and ID #2 rows

### 10. Address and Phone Field Grouping

**Location**: Step 3 and Step 4

**Behavior**:
- Address fields are automatically grouped when detected by `FieldRenderer`
- Phone fields are automatically grouped when detected by `FieldRenderer`
- Individual address/phone fields are skipped in `InvestorProfileForm`

**Implementation**:
- `FieldRenderer` checks field ID patterns
- Detects address/phone field groups
- Renders `AddressFieldGroup` or `PhoneFieldsGroup` instead of individual fields
- Individual fields are skipped in form rendering

---

## Implementation Notes

### Field Type Consistency
- All field types are correctly assigned in JSON schema
- `risk_exposure` and `liquidity_needs` are `multicheck` (updated from `radio`)
- All selection behaviors are correctly implemented

### Conditional Logic Completeness
- All conditional rules are defined in `fieldDependencies.ts`
- Missing conditions have been added (related_to_employee fields)
- All showWhen/hideWhen conditions are verified

### Component Reusability
- Address fields use `AddressFieldGroup` (3 types, 2 account holders = 6 instances)
- Phone fields use `PhoneFieldsGroup` (3 types, 2 account holders + trusted contact = 7 instances)
- Investment knowledge uses `KnowledgeTableField` (2 account holders = 2 instances)
- Government ID uses `GovernmentIdTableField` (2 account holders = 2 instances)

### Validation Coverage
- Required fields are defined
- Conditional required fields are defined
- Format validation is implemented
- Custom validation for DOB and signatures

---

## Future Enhancements

### Potential Improvements
1. **Real-time Validation**: Show validation errors as user types
2. **Field Dependencies**: Add validation dependencies (e.g., "To" must be greater than "From")
3. **Auto-formatting**: Auto-format SSN, EIN, phone numbers as user types
4. **Save Draft**: Save form progress to localStorage or backend
5. **Form Submission**: Submit form data to backend API
6. **PDF Generation**: Generate PDF from form data
7. **Form Pre-filling**: Pre-fill form from existing data

---

## Testing Checklist

### Conditional Logic Testing
- [ ] Test all showWhen conditions
- [ ] Test all hideWhen conditions
- [ ] Test AND logic (requireAll: true)
- [ ] Test OR logic (requireAll: false)
- [ ] Test nested conditions
- [ ] Test Step 4 visibility
- [ ] Test Retirement checkbox disabling

### Selection Behavior Testing
- [ ] Verify radio fields only allow one selection
- [ ] Verify multicheck fields allow multiple selections
- [ ] Verify YesNo fields only allow one selection
- [ ] Test "Other" field handling in multicheck

### Validation Testing
- [ ] Test required field validation
- [ ] Test conditional required field validation
- [ ] Test format validation (SSN, EIN, Email, Phone)
- [ ] Test date validation (DOB in past)
- [ ] Test signature validation (not empty)

### Repetitive Pattern Testing
- [ ] Test AddressFieldGroup for all address types
- [ ] Test PhoneFieldsGroup for all phone groups
- [ ] Test KnowledgeTableField for Primary and Secondary
- [ ] Test GovernmentIdTableField (2 instances)
- [ ] Verify Primary and Secondary use same logic

---

## Conclusion

The Investor Profile Form is a comprehensive, well-structured multi-step form with:
- **200+ fields** with conditional visibility
- **7 steps** with dynamic step navigation
- **Multiple field types** with proper selection behaviors
- **Comprehensive validation** rules
- **Reusable components** for repetitive patterns
- **Special handling** for complex cases

All conditional logic, validation rules, and repetitive patterns have been documented and verified.

