# Investor Profile Form - Deep Documentation

## Table of Contents
1. [Overview](#overview)
2. [Conditional Field Logic](#conditional-field-logic)
3. [Validation Rules](#validation-rules)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Data Transformation](#data-transformation)
7. [Edge Cases and Business Rules](#edge-cases-and-business-rules)

---

## Overview

The Investor Profile form is a 7-step multi-page form that collects comprehensive information about investors and their accounts. The form includes extensive conditional logic where fields and entire steps appear or disappear based on user selections.

**Form Structure:**
- **Step 1:** Account Registration (with conditional sections)
- **Step 2:** USA PATRIOT ACT Information
- **Step 3:** Primary Account Holder Information
- **Step 4:** Secondary Account Holder Information (conditional - only for Joint/Trust accounts)
- **Step 5:** Objectives and Investment Detail
- **Step 6:** Trusted Contact
- **Step 7:** Signatures & Taxpayer Certification

**Key Files:**
- Form Schema: `frontend/src/REI-Investor-Profile-v20240101-1.json`
- Conditional Logic: `frontend/src/utils/fieldDependencies.ts`
- Frontend Validation: `frontend/src/validators/investorProfileValidators.ts`
- Backend Validation: `backend/src/services/validationService.ts`
- Database Schema: `backend/prisma/schema.prisma`
- API Routes: `backend/src/routes/investorProfiles.ts`
- Service Layer: `backend/src/services/investorProfileService.ts`

---

## Conditional Field Logic

### Decision Tree Architecture

The conditional logic uses a rule-based system defined in `fieldDependencies.ts`. Each field can have:
- `showWhen`: Conditions that must be met for the field to be visible
- `hideWhen`: Conditions that hide the field (takes precedence over `showWhen`)
- `requireAll`: Boolean indicating if all conditions must match (AND) or any condition matches (OR)

### Step 1: Account Registration

#### Retirement Account Checkbox
**Field:** `retirement_checkbox`
- **Effect:** When checked, disables most Step 1 fields (except header fields: `rr_name`, `rr_no`, `customer_names`, `account_no`)
- **Implementation:** Fields are disabled but still visible
- **Note:** Step 1 is NOT skipped, only fields are disabled

#### Account Type Selection
**Fields:** `type_of_account` (left column), `type_of_account_right` (right column)

**Conditional Sections Based on Account Types:**

1. **Joint Account Fields** (`joint_accounts_only`)
   - **Show When:** `type_of_account` includes `joint_tenant` OR `transfer_on_death_joint`
   - **Fields Shown:**
     - `are_account_holders_married` (Yes/No)
     - `tenancy_state` (text)
     - `number_of_tenants` (number)
     - `tenancy_clause` (multicheck)
   - **Validation:** All fields required when visible

2. **Custodial Account Fields** (`for_custodial_accounts_only`)
   - **Show When:** `type_of_account` includes `custodial`
   - **Fields Shown:**
     - `state_in_which_gift_was_given_1` (text)
     - `date_gift_was_given_1` (date)
     - `state_in_which_gift_was_given_2` (text)
     - `date_gift_was_given_2` (date)
   - **Validation:** All fields required when visible

3. **Trust Block** (`trust_block`)
   - **Show When:** `type_of_account_right` includes `trust` OR `trust_checkbox` is checked
   - **Fields Shown:**
     - `trust_checkbox` (checkbox)
     - `trust_establishment_date` (date)
     - `trust_type` (multicheck)
   - **Validation:** Trust type and establishment date required when trust is selected
   - **Note:** Trust can be selected from right column OR via checkbox

4. **Other Account Type Text** (`other_account_type_text`)
   - **Show When:** `type_of_account_right` includes `other_account_type`
   - **Validation:** Required when "Other" is selected

5. **Transfer on Death Agreement Dates**
   - **Individual:** Show when `type_of_account` includes `transfer_on_death_individual`
   - **Joint:** Show when `type_of_account` includes `transfer_on_death_joint`
   - **Validation:** Agreement date required when respective account type is selected

#### Additional Designation Requirements
Based on account type selection:
- **Corporation:** Requires C Corp or S Corp designation
- **Custodial:** Requires UGMA or UTMA designation
- **Limited Liability Company:** Requires C Corp, S Corp, or Partnership designation

### Step 2: Patriot Act Information

**Conditional Fields:**
- `initial_source_of_funds_other_text`
  - **Show When:** `initial_source_of_funds` includes `"Other"`
  - **Validation:** Required when "Other" is selected

### Step 3: Primary Account Holder

#### Person/Entity Selection
**Field:** `primary_person_entity` (radio: "Person" or "Entity")

**When "Person" is selected:**
- **Show:** `primary_ssn`, `primary_dob`, `primary_gender`, `primary_marital_status`, `primary_specified_adult`
- **Hide:** `primary_ein`, `primary_yes_no_box`
- **Validation:** SSN and DOB required

**When "Entity" is selected:**
- **Show:** `primary_ein`, `primary_yes_no_box`
- **Hide:** `primary_ssn`, `primary_dob`, `primary_gender`, `primary_marital_status`, `primary_specified_adult`
- **Validation:** EIN required

#### Mailing Address Fields
**Field:** `primary_mailing_same_as_legal` (checkbox)

**When checked (same as legal):**
- **Hide:** All mailing address fields (`primary_mailing_address`, `primary_mailing_city`, `primary_mailing_state_province`, `primary_mailing_zip_postal_code`, `primary_mailing_country`)

**When unchecked (different address):**
- **Show:** All mailing address fields
- **Validation:** All mailing address fields required together

#### Employment Fields
**Field:** `primary_employment_affiliations` (multicheck)

**When includes "Employed" OR "Self-Employed":**
- **Show:** 
  - `primary_occupation`
  - `primary_years_employed`
  - `primary_type_of_business`
  - `primary_employer_name`
  - `primary_employer_address`
  - `primary_employer_city`
  - `primary_employer_state_province`
  - `primary_employer_zip_postal_code`
  - `primary_employer_country`
- **Validation:** Occupation and employer name required

#### Advisory Firm Information
**Field:** `primary_employee_of_advisory_firm` (Yes/No)

**When "Yes":**
- **Show:** `primary_related_to_employee_advisory`
- **When related is "Yes":**
  - **Show:** `primary_employee_name_and_relationship`
  - **Validation:** Required when related is "Yes"

#### Broker-Dealer Information
**Field:** `primary_employee_of_broker_dealer` (Yes/No)

**When "Yes":**
- **Show:** `primary_broker_dealer_name`
- **Show:** `primary_related_to_employee_broker_dealer`
- **When related is "Yes":**
  - **Show:** `primary_broker_dealer_employee_name`, `primary_broker_dealer_employee_relationship`
  - **Validation:** Both required when related is "Yes"

#### Other Brokerage Accounts
**Field:** `primary_maintaining_other_brokerage_accounts` (Yes/No)

**When "Yes":**
- **Show:** `primary_with_what_firms`, `primary_years_of_investment_experience`
- **Validation:** Firm names required

#### Exchange/FINRA Affiliation
**Field:** `primary_affiliated_with_exchange_or_finra` (Yes/No)

**When "Yes":**
- **Show:** `primary_affiliation_employer_authorization_required`
- **Validation:** Required

#### Public Company Information
**Field:** `primary_senior_officer_or_10pct_shareholder` (Yes/No)

**When "Yes":**
- **Show:** `primary_company_names`
- **Validation:** Required

### Step 4: Secondary Account Holder

#### Step Visibility
**Entire Step 4 is conditional:**
- **Show When:** `type_of_account` includes `joint_tenant` OR `type_of_account_right` includes `trust`
- **Implementation:** Step is filtered out of sections array when conditions not met
- **Note:** There's a bug - the check for trust looks in `type_of_account_right` but trust is actually in `type_of_account` array

#### Field-Level Conditionals
All conditionals from Step 3 apply to Step 4 with `secondary_` prefix:
- Person/Entity selection
- Mailing address fields
- Employment fields
- Advisory/Broker-Dealer fields
- Other brokerage accounts
- Exchange/FINRA affiliation
- Public company information

### Step 5: Investment Objectives

**Conditional Fields:**
- `other_investments_table`
  - **Hide When:** `other_investments_see_attached` is checked
  - **Effect:** Investment value table is hidden when "See Attached Statement" is checked

### Step 6: Trusted Contact

**Field:** `trusted_contact_decline_to_provide` (checkbox)

**When checked (declined):**
- **Hide:** All trusted contact fields:
  - `trusted_contact_name`
  - `trusted_contact_email`
  - `trusted_contact_home_phone`
  - `trusted_contact_business_phone`
  - `trusted_contact_mobile_phone`
  - `trusted_contact_mailing_address`
  - `trusted_contact_city`
  - `trusted_contact_state_province`
  - `trusted_contact_zip_postal_code`
  - `trusted_contact_country`

**When unchecked (providing contact):**
- **Show:** All trusted contact fields
- **Validation:** Name and email required

### Step 7: Signatures

**Conditional Fields:**
- `joint_account_owner_signature`, `joint_account_owner_printed_name`, `joint_account_owner_date`
  - **Show When:** `type_of_account` includes `joint_tenant`
  - **Validation:** All three fields required together when visible

---

## Validation Rules

### Validation Architecture

**Frontend Validation:**
- Uses Zod schemas in `frontend/src/validators/investorProfileValidators.ts`
- Validates on blur and before step navigation
- Maps errors to field IDs with proper prefixes (`primary_`, `secondary_`)

**Backend Validation:**
- Uses Zod schemas in `backend/src/validators/investorProfileValidators.ts`
- Step-by-step validation via `validationService`
- Complete profile validation before submission
- Conditional field validation based on Person/Entity type

### Step 1 Validation

**Required Fields (unless Retirement checked):**
- `rr_name` - Required unless retirement account
- `rr_no` - Required when RR name is provided
- `customer_names` - Required unless retirement account
- At least one account type from either column

**Conditional Validations:**

1. **Trust Information:**
   - Required when `trust_checkbox` is checked OR `type_of_account_right` includes `trust`
   - `trust_type` - At least one required
   - `trust_establishment_date` - Required

2. **Joint Account Information:**
   - Required when `type_of_account` includes `joint_tenant` OR `transfer_on_death_joint`
   - `are_account_holders_married` - Required
   - `tenancy_state` - Required
   - `number_of_tenants` - Required (positive integer)
   - `tenancy_clause` - At least one required

3. **Custodial Account Information:**
   - Required when `type_of_account` includes `custodial`
   - All four fields required: state 1, date 1, state 2, date 2

4. **Transfer on Death:**
   - Individual agreement date required when `transfer_on_death_individual` selected
   - Joint agreement date required when `transfer_on_death_joint` selected

5. **Other Account Type:**
   - `other_account_type_text` required when `other_account_type` selected

6. **Additional Designations:**
   - Corporation: C Corp or S Corp required
   - Custodial: UGMA or UTMA required
   - LLC: C Corp, S Corp, or Partnership required

### Step 2 Validation

**Required Fields:**
- `initial_source_of_funds` - At least one source required
- `initial_source_of_funds_other_text` - Required when "Other" is selected (min 2 chars, max 200 chars)

**Validation Rules:**
- Each item in array must be valid enum value
- Array cannot be empty

### Step 3 Validation (Primary Account Holder)

**Required Fields:**
- `primary_name` - Always required
- `primary_person_entity` - Always required
- `primary_ssn` - Required when Person selected
- `primary_ein` - Required when Entity selected
- `primary_dob` - Required when Person selected
- Legal address fields (all required together):
  - `primary_legal_address`
  - `primary_city`
  - `primary_state_province`
  - `primary_zip_postal_code`
  - `primary_country`

**Conditional Validations:**

1. **Mailing Address:**
   - All mailing fields required together when `primary_mailing_same_as_legal` is false

2. **Employment:**
   - `primary_occupation` - Required when Employed or Self-Employed
   - `primary_employer_name` - Required when Employed or Self-Employed

3. **Government IDs:**
   - If any gov ID field is filled, all fields for that ID are required:
     - ID 1: type, number, country, issue date, expiration date
     - ID 2: type, number, country, issue date, expiration date
   - Expiration date must be after issue date

4. **Advisory Firm:**
   - `primary_employee_name_and_relationship` - Required when `primary_related_to_employee_advisory` is "Yes"

5. **Broker-Dealer:**
   - `primary_broker_dealer_name` - Required when `primary_employee_of_broker_dealer` is "Yes"
   - `primary_broker_dealer_employee_name` - Required when `primary_related_to_employee_broker_dealer` is "Yes"
   - `primary_broker_dealer_employee_relationship` - Required when `primary_related_to_employee_broker_dealer` is "Yes"

6. **Other Brokerage Accounts:**
   - `primary_with_what_firms` - Required when `primary_maintaining_other_brokerage_accounts` is "Yes"

7. **Exchange/FINRA:**
   - `primary_affiliation_employer_authorization_required` - Required when `primary_affiliated_with_exchange_or_finra` is "Yes"

8. **Public Company:**
   - `primary_company_names` - Required when `primary_senior_officer_or_10pct_shareholder` is "Yes"

9. **Investment Knowledge:**
   - `other_investment_knowledge_label` - Required when `other_investment_knowledge_value` is selected

10. **Financial Information:**
    - Range validation: "To" values must be >= "From" values for:
      - Annual income
      - Net worth
      - Liquid net worth

### Step 4 Validation (Secondary Account Holder)

**Same validation rules as Step 3** but with `secondary_` prefix.

**Additional Note:**
- Step 4 should only be validated if the step is visible (Joint or Trust account selected)
- Currently, validation may run even when step is hidden - this should be fixed

### Step 5 Validation

**Required Fields:**
- `risk_exposure` - At least one required
- `account_investment_objectives` - At least one required

**Optional Fields:**
- `liquidity_needs` - Optional array
- `investment_time_horizon_from` / `to` - Optional text
- Investment value fields - Optional currency values
- `other_investments_see_attached` - Boolean (defaults to false)

**Validation Rules:**
- Each array item must be valid enum value
- If time horizon dates provided, "to" must be >= "from"

### Step 6 Validation

**Conditional Required Fields:**
- When `trusted_contact_decline_to_provide` is false:
  - `trusted_contact_name` - Required
  - `trusted_contact_email` - Required (valid email format)

**Optional Fields:**
- All other trusted contact fields are optional

### Step 7 Validation

**Required:**
- At least one complete signature set required (signature + printed name + date)

**Individual Signature Validation:**
- If any part of a signature is filled, all three parts are required:
  - Signature data
  - Printed name
  - Date

**Conditional Signatures:**
- Joint account owner signature only required when joint account type selected

---

## Database Schema

### Schema Overview

The database uses Prisma ORM with PostgreSQL. The schema is designed to handle conditional data through:
1. One-to-one relationships for conditional sections
2. Many-to-many relationships for account types and designations
3. Separate tables for account holders (primary/secondary via `holderType`)

### Core Models

#### InvestorProfile
**Table:** `investor_profiles`
**Purpose:** Main profile record containing Step 1 data and metadata

**Key Fields:**
- `id` (UUID, primary key)
- `userId` (UUID, foreign key to users)
- `status` (enum: draft, submitted, approved, rejected)
- `lastCompletedStep` (integer, tracks progress)
- `stepCompletionStatus` (JSON, detailed step completion tracking)
- Step 1 fields: `rrName`, `rrNo`, `customerNames`, `accountNo`, `retirementAccount`, `retailAccount`, `otherAccountTypeText`

**Relationships:**
- One-to-many: `accountTypes`, `additionalDesignations`
- One-to-one: `trustInformation`, `jointAccountInformation`, `custodialAccountInformation`, `transferOnDeathInformation`, `patriotActInformation`, `investmentObjectives`, `trustedContact`
- One-to-many: `accountHolders`, `investmentValues`, `signatures`

#### InvestorProfileAccountType
**Table:** `investor_profile_account_types`
**Purpose:** Junction table for many-to-many account types

**Fields:**
- `id` (UUID)
- `profileId` (UUID, foreign key)
- `accountType` (enum: individual, corporation, joint_tenant, trust, etc.)

**Unique Constraint:** `[profileId, accountType]` - prevents duplicates

#### TrustInformation
**Table:** `trust_information`
**Purpose:** Conditional Step 1 data for trust accounts

**Fields:**
- `id` (UUID)
- `profileId` (UUID, unique - one-to-one)
- `establishmentDate` (DateTime, nullable)
- `trustTypes` (enum array)

**Conditional Creation:**
- Created when trust checkbox checked OR trust account type selected
- Deleted when trust deselected

#### JointAccountInformation
**Table:** `joint_account_information`
**Purpose:** Conditional Step 1 data for joint accounts

**Fields:**
- `id` (UUID)
- `profileId` (UUID, unique - one-to-one)
- `areAccountHoldersMarried` (enum: Yes/No, nullable)
- `tenancyState` (string, nullable)
- `numberOfTenants` (integer, nullable)
- `tenancyClauses` (enum array)

**Conditional Creation:**
- Created when `joint_tenant` or `transfer_on_death_joint` selected
- Deleted when joint account deselected

#### CustodialAccountInformation
**Table:** `custodial_account_information`
**Purpose:** Conditional Step 1 data for custodial accounts

**Fields:**
- `id` (UUID)
- `profileId` (UUID, unique - one-to-one)
- `stateGiftGiven1`, `dateGiftGiven1`, `stateGiftGiven2`, `dateGiftGiven2` (all nullable)

**Conditional Creation:**
- Created when `custodial` account type selected
- Deleted when custodial deselected

#### TransferOnDeathInformation
**Table:** `transfer_on_death_information`
**Purpose:** Conditional Step 1 data for TOD accounts

**Fields:**
- `id` (UUID)
- `profileId` (UUID, unique - one-to-one)
- `individualAgreementDate`, `jointAgreementDate` (both nullable)

**Conditional Creation:**
- Created when TOD account type selected
- Deleted when TOD deselected

#### PatriotActInformation
**Table:** `patriot_act_information`
**Purpose:** Step 2 data

**Fields:**
- `id` (UUID)
- `profileId` (UUID, unique - one-to-one)
- `initialSourceOfFunds` (string array)
- `otherSourceOfFundsText` (string, nullable)

#### AccountHolder
**Table:** `account_holders`
**Purpose:** Step 3 and Step 4 data (primary and secondary holders)

**Key Fields:**
- `id` (UUID)
- `profileId` (UUID, foreign key)
- `holderType` (enum: primary, secondary) - distinguishes Step 3 vs Step 4
- Basic info: `name`, `email`, `personEntity`, `ssn`, `ein`, `dateOfBirth`, etc.

**Relationships:**
- One-to-many: `addresses`, `phones`, `maritalStatuses`, `employmentAffiliations`, `investmentKnowledge`, `governmentIdentifications`
- One-to-one: `employment`, `financialInformation`, `advisoryFirmInformation`, `brokerDealerInformation`, `otherBrokerageAccounts`, `exchangeFinraAffiliation`, `publicCompanyInformation`

**Conditional Creation:**
- Primary holder (Step 3): Always created
- Secondary holder (Step 4): Only created when Joint or Trust account selected

#### AccountHolderAddress
**Table:** `account_holder_addresses`
**Purpose:** Addresses for account holders

**Fields:**
- `id` (UUID)
- `accountHolderId` (UUID, foreign key)
- `addressType` (enum: legal, mailing, employer)
- Address fields: `address`, `city`, `stateProvince`, `zipPostalCode`, `country`
- `mailingSameAsLegal` (boolean, nullable)

**Usage:**
- Legal address: Always created for account holder
- Mailing address: Created when `mailingSameAsLegal` is false
- Employer address: Created when employment info provided

#### AccountHolderPhone
**Table:** `account_holder_phones`
**Purpose:** Phone numbers for account holders

**Fields:**
- `id` (UUID)
- `accountHolderId` (UUID, foreign key)
- `phoneType` (enum: home, business, mobile)
- `phoneNumber` (string, nullable)

#### AccountHolderInvestmentKnowledge
**Table:** `account_holder_investment_knowledge`
**Purpose:** Investment knowledge by type

**Fields:**
- `id` (UUID)
- `accountHolderId` (UUID, foreign key)
- `investmentType` (enum)
- `knowledgeLevel` (enum: Limited, Moderate, Extensive, None)
- `sinceYear` (string, nullable)
- `otherInvestmentLabel` (string, nullable - for "other" type)

**Unique Constraint:** `[accountHolderId, investmentType]` - one knowledge entry per type

#### InvestmentObjectives
**Table:** `investment_objectives`
**Purpose:** Step 5 data

**Fields:**
- `id` (UUID)
- `profileId` (UUID, unique - one-to-one)
- `riskExposure` (enum array)
- `accountInvestmentObjectives` (enum array)
- `seeAttachedStatement` (boolean)
- `timeHorizonFrom`, `timeHorizonTo` (string, nullable)
- `liquidityNeeds` (enum array)

#### InvestmentValue
**Table:** `investment_values`
**Purpose:** Investment values by type (Step 5)

**Fields:**
- `id` (UUID)
- `profileId` (UUID, foreign key)
- `investmentType` (enum)
- `value` (Decimal)

**Unique Constraint:** `[profileId, investmentType]` - one value per type

#### TrustedContact
**Table:** `trusted_contacts`
**Purpose:** Step 6 data

**Fields:**
- `id` (UUID)
- `profileId` (UUID, unique - one-to-one)
- `declineToProvide` (boolean)
- Contact fields: `name`, `email`, `homePhone`, `businessPhone`, `mobilePhone`, `mailingAddress`, `city`, `stateProvince`, `zipPostalCode`, `country`

#### Signature
**Table:** `signatures`
**Purpose:** Step 7 data

**Fields:**
- `id` (UUID)
- `profileId` (UUID, foreign key)
- `signatureType` (enum: account_owner, joint_account_owner, financial_professional, supervisor_principal)
- `signatureData` (string - base64 encoded image)
- `printedName` (string)
- `signatureDate` (DateTime)

**Unique Constraint:** `[profileId, signatureType]` - one signature per type

### Conditional Data Storage Patterns

1. **Upsert Pattern:**
   - Conditional tables use `upsert` operations
   - If data exists, update; if not, create
   - If condition no longer met, delete the record

2. **Junction Tables:**
   - Account types and designations use junction tables
   - On update: delete all existing, create new ones

3. **One-to-One Constraints:**
   - Conditional tables use `@unique` on `profileId`
   - Ensures only one record per profile

4. **Array Fields:**
   - Enums stored as arrays in Prisma (e.g., `trustTypes`, `tenancyClauses`)
   - Backend handles array serialization/deserialization

---

## API Architecture

### Endpoints Overview

All endpoints require authentication via JWT token.

**Base Path:** `/api/investor-profiles`

### Endpoint Details

#### 1. Create Profile
**Method:** `POST /api/investor-profiles`
**Purpose:** Create new profile (Step 1 data)

**Request Body:**
```json
{
  "rrName": "John Doe",
  "rrNo": "12345",
  "customerNames": "Jane Smith",
  "accountNo": "ACC001",
  "retirementAccount": false,
  "retailAccount": false,
  "accountTypes": ["individual", "joint_tenant"],
  "additionalDesignations": ["c_corp"],
  "trustInformation": {
    "establishmentDate": "2020-01-15T00:00:00Z",
    "trustTypes": ["living", "revocable"]
  },
  "jointAccountInformation": {
    "areAccountHoldersMarried": "Yes",
    "tenancyState": "CA",
    "numberOfTenants": 2,
    "tenancyClauses": ["joint_tenants_with_rights_of_survivorship"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "rrName": "John Doe",
    "status": "draft",
    "lastCompletedStep": 1,
    "stepCompletionStatus": {
      "1": {
        "completed": true,
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    },
    "accountTypes": [...],
    "trustInformation": {...},
    "jointAccountInformation": {...}
  }
}
```

**Behavior:**
- If user already has a profile, updates existing profile instead of creating new one
- Resets status to "draft" if updating existing profile
- Validates Step 1 data before saving

#### 2. Update Step
**Method:** `PATCH /api/investor-profiles/:id/step{N}`
**Purpose:** Update specific step (N = 1-7)

**Example - Step 1:**
```json
PATCH /api/investor-profiles/{id}/step1
{
  "accountTypes": ["individual"],
  "trustInformation": null  // Deletes trust info if previously existed
}
```

**Example - Step 3 (Primary Account Holder):**
```json
PATCH /api/investor-profiles/{id}/step3
{
  "name": "John Doe",
  "personEntity": "Person",
  "ssn": "123-45-6789",
  "dateOfBirth": "1990-01-15T00:00:00Z",
  "addresses": [
    {
      "addressType": "legal",
      "address": "123 Main St",
      "city": "San Francisco",
      "stateProvince": "CA",
      "zipPostalCode": "94102",
      "country": "USA"
    }
  ],
  "phones": [
    {
      "phoneType": "mobile",
      "phoneNumber": "555-1234"
    }
  ],
  "employment": {
    "occupation": "Engineer",
    "yearsEmployed": 5,
    "employerName": "Tech Corp",
    "employerAddress": {
      "addressType": "employer",
      "address": "456 Tech Ave",
      "city": "San Francisco",
      "stateProvince": "CA",
      "zipPostalCode": "94103",
      "country": "USA"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "draft",
    "lastCompletedStep": 3,
    "stepCompletionStatus": {
      "1": {"completed": true, "updatedAt": "..."},
      "2": {"completed": true, "updatedAt": "..."},
      "3": {"completed": true, "updatedAt": "..."}
    },
    "accountHolders": [
      {
        "holderType": "primary",
        "name": "John Doe",
        ...
      }
    ]
  }
}
```

**Behavior:**
- Validates step data before saving
- Marks step as completed in `stepCompletionStatus`
- Updates `lastCompletedStep` if step number is higher
- Resets status to "draft" if profile was submitted/approved/rejected

#### 3. Get Profile
**Method:** `GET /api/investor-profiles/:id`
**Purpose:** Get full profile with all relations

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "draft",
    "lastCompletedStep": 5,
    "stepCompletionStatus": {...},
    "rrName": "John Doe",
    "accountTypes": [...],
    "trustInformation": {...},
    "jointAccountInformation": {...},
    "patriotActInformation": {...},
    "accountHolders": [
      {
        "holderType": "primary",
        "name": "John Doe",
        "addresses": [...],
        "phones": [...],
        "employment": {...},
        "investmentKnowledge": [...],
        "financialInformation": {...},
        "governmentIdentifications": [...],
        ...
      },
      {
        "holderType": "secondary",
        ...
      }
    ],
    "investmentObjectives": {...},
    "investmentValues": [...],
    "trustedContact": {...},
    "signatures": [...]
  }
}
```

#### 4. Submit Profile
**Method:** `POST /api/investor-profiles/:id/submit`
**Purpose:** Submit profile for review

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "submitted",
    "submittedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Validation:**
- Validates complete profile before submission
- Checks all required steps are completed
- Checks conditional fields are filled when applicable
- Throws error if validation fails

#### 5. Get Profile Progress
**Method:** `GET /api/investor-profiles/:id/progress`
**Purpose:** Get completion status

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "draft",
    "lastCompletedStep": 3,
    "stepCompletionStatus": {
      "1": {"completed": true, "updatedAt": "..."},
      "2": {"completed": true, "updatedAt": "..."},
      "3": {"completed": true, "updatedAt": "..."}
    }
  }
}
```

### Conditional Data Handling

#### Step 1 Updates
- **Account Types:** Delete all existing, create new ones
- **Trust Information:** Upsert if trust selected, delete if not
- **Joint Account:** Upsert if joint selected, delete if not
- **Custodial:** Upsert if custodial selected, delete if not
- **Transfer on Death:** Upsert if TOD selected, delete if not

#### Step 3/4 Updates (Account Holders)
- **Primary Holder:** Find or create, then update all related data
- **Secondary Holder:** Only created/updated if Joint or Trust account selected
- **Addresses:** Delete all existing, create new ones
- **Phones:** Delete all existing, create new ones
- **Employment:** Upsert if employment affiliations include Employed/Self-Employed
- **Investment Knowledge:** Delete all existing, create new ones
- **Government IDs:** Delete all existing, create new ones

#### Step 5 Updates
- **Investment Objectives:** Upsert
- **Investment Values:** Delete all existing, create new ones

#### Step 6 Updates
- **Trusted Contact:** Upsert

#### Step 7 Updates
- **Signatures:** Delete all existing, create new ones

---

## Data Transformation

### Frontend to Backend Transformation

**File:** `frontend/src/utils/formDataToBackend.ts`

**Pattern:**
- Flat form data (snake_case) → Nested backend structure (camelCase)
- Conditional sections only included when visible/selected
- Arrays transformed from frontend format to backend format

**Key Transformations:**

1. **Step 1:**
   - `type_of_account` → `accountTypes[]`
   - `additional_designation_left` → `additionalDesignations[]`
   - `trust_checkbox` + `trust_type` + `trust_establishment_date` → `trustInformation` object (only if trust selected)
   - `are_account_holders_married`, etc. → `jointAccountInformation` object (only if joint selected)

2. **Step 3:**
   - `primary_*` fields → Account holder object without prefix
   - Address components → `addresses[]` array with `addressType`
   - Phone fields → `phones[]` array with `phoneType`
   - Investment knowledge fields → `investmentKnowledge[]` array

3. **Step 4:**
   - Same as Step 3 but with `secondary_` prefix

4. **Step 5:**
   - Investment value fields → `investmentValues[]` array
   - `investment_time_horizon_from/to` → `timeHorizonFrom/To`

5. **Step 6:**
   - `trusted_contact_*` fields → `trustedContact` object

6. **Step 7:**
   - Signature fields → `signatures[]` array with `signatureType`

### Backend to Frontend Transformation

**File:** `frontend/src/utils/backendToFormData.ts`

**Pattern:**
- Nested backend structure → Flat form data (snake_case)
- Reconstructs conditional sections based on account types
- Maps nested structures back to flat field IDs

**Key Transformations:**

1. **Step 1:**
   - `accountTypes[]` → `type_of_account[]`
   - `trustInformation` → `trust_checkbox`, `trust_type`, `trust_establishment_date`
   - `jointAccountInformation` → `are_account_holders_married`, etc.

2. **Step 3:**
   - Account holder object → `primary_*` fields
   - `addresses[]` → `primary_legal_address`, `primary_mailing_address`, etc.
   - `phones[]` → `primary_home_phone`, `primary_business_phone`, `primary_mobile_phone`
   - `investmentKnowledge[]` → `primary_*_knowledge` fields

3. **Step 4:**
   - Same as Step 3 but with `secondary_` prefix

---

## Edge Cases and Business Rules

### Edge Cases

1. **Retirement Account:**
   - When checked, Step 1 fields are disabled but step is not skipped
   - RR Name and Customer Names not required when retirement checked
   - User can uncheck retirement to re-enable fields

2. **Step 4 Visibility:**
   - Step 4 should only show for Joint or Trust accounts
   - Currently checks `type_of_account_right` for trust, but trust is in `type_of_account` array
   - **Bug:** Needs to be fixed

3. **One Profile Per User:**
   - Backend ensures only one profile exists per user
   - Creating a new profile updates existing one if it exists
   - Status resets to "draft" when updating

4. **Conditional Table Deletion:**
   - When conditional section is deselected, related table records are deleted
   - Example: Unchecking trust deletes `TrustInformation` record

5. **Mailing Address:**
   - When "same as legal" is checked, mailing address fields are hidden
   - Backend still stores `mailingSameAsLegal: true` flag
   - When unchecked, all mailing fields become required

6. **Government IDs:**
   - Two ID slots available (ID #1 and ID #2)
   - If any field for an ID is filled, all fields for that ID are required
   - Expiration date must be after issue date

7. **Investment Knowledge:**
   - "Other" investment type requires `otherInvestmentLabel`
   - "Since Year" is optional but recommended

8. **Signatures:**
   - Joint account owner signature only required when joint account selected
   - At least one complete signature set required (signature + name + date)
   - If any part of a signature is filled, all three parts required

### Business Rules

1. **Step Completion:**
   - Steps can be completed out of order
   - `lastCompletedStep` tracks highest completed step
   - `stepCompletionStatus` tracks individual step completion

2. **Profile Status:**
   - `draft`: Can be edited, cannot be submitted until all steps complete
   - `submitted`: Cannot be edited (would need approval workflow)
   - `approved`/`rejected`: Cannot be edited
   - Any edit resets status to "draft"

3. **Validation Timing:**
   - Frontend validates on blur and before navigation
   - Backend validates on save and before submission
   - Conditional validations only run when fields are visible

4. **Data Consistency:**
   - Conditional tables use upsert pattern to maintain consistency
   - Junction tables use delete-all/create-new pattern
   - Foreign key constraints ensure referential integrity

5. **Error Handling:**
   - Validation errors return field-specific messages
   - Backend returns structured error responses
   - Frontend maps errors to field IDs for display

---

## Known Issues and Fixes Needed

### Issue 1: Step 4 Visibility Check
**Location:** `frontend/src/components/ConditionalFieldManager.tsx`
**Problem:** Checks `type_of_account_right` for trust, but trust is in `type_of_account` array
**Fix Needed:** Update `shouldShowStep()` to check `type_of_account` array for trust

### Issue 2: Step 4 Validation When Hidden
**Problem:** Step 4 validation may run even when step is hidden
**Fix Needed:** Skip Step 4 validation if step should not be visible

### Issue 3: Conditional Validation Consistency
**Problem:** Some conditional validations exist in backend but may not be enforced in frontend
**Fix Needed:** Ensure all conditional validations are consistent between frontend and backend

---

## Conclusion

This documentation provides a comprehensive overview of the Investor Profile form's conditional logic, validation rules, database schema, and API architecture. Use this as a reference when:
- Adding new conditional fields
- Modifying validation rules
- Understanding data flow
- Debugging issues
- Onboarding new developers

For specific implementation details, refer to the source files listed in the Overview section.

