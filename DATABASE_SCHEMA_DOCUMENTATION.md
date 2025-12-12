# Database Schema Documentation

## Overview

This document provides comprehensive documentation for the Investor Profile Form database schema. The schema is designed to store all data from the 7-step Investor Profile Form with proper normalization, relationships, and data integrity.

## Architecture

The database follows a normalized relational design using PostgreSQL with Prisma ORM. The schema supports:

- Complex relationships (one-to-one, one-to-many, many-to-many)
- Conditional data (Step 4 only exists for Joint/Trust accounts)
- Repeatable groups (Government IDs - 2 instances)
- Multicheck fields (multiple selections stored as arrays or junction tables)
- Signature data (base64 encoded images)
- Financial ranges (from/to values using Decimal precision)
- Investment knowledge tables

## Entity Relationship Diagram

```
User
  └── InvestorProfile (1:N)
        ├── InvestorProfileAccountType (N:M)
        ├── InvestorProfileAdditionalDesignation (N:M)
        ├── TrustInformation (1:1, conditional)
        ├── JointAccountInformation (1:1, conditional)
        ├── CustodialAccountInformation (1:1, conditional)
        ├── TransferOnDeathInformation (1:1, conditional)
        ├── PatriotActInformation (1:1)
        ├── AccountHolder (1:N)
        │     ├── AccountHolderAddress (1:N)
        │     ├── AccountHolderPhone (1:N)
        │     ├── AccountHolderMaritalStatus (N:M)
        │     ├── AccountHolderEmploymentAffiliation (N:M)
        │     ├── AccountHolderEmployment (1:1, conditional)
        │     │     └── AccountHolderAddress (employer)
        │     ├── AccountHolderInvestmentKnowledge (1:N)
        │     ├── AccountHolderFinancialInformation (1:1)
        │     ├── GovernmentIdentification (1:N, repeatable)
        │     ├── AdvisoryFirmInformation (1:1, conditional)
        │     ├── BrokerDealerInformation (1:1, conditional)
        │     ├── OtherBrokerageAccounts (1:1, conditional)
        │     ├── ExchangeFinraAffiliation (1:1, conditional)
        │     └── PublicCompanyInformation (1:1, conditional)
        ├── InvestmentObjectives (1:1)
        ├── InvestmentValue (1:N)
        ├── TrustedContact (1:1, conditional)
        └── Signature (1:N)
```

## Core Models

### User

**Purpose**: Authentication and user management

**Fields**:
- `id` (UUID, PK): Unique user identifier
- `email` (String, Unique): User email address
- `passwordHash` (String): Hashed password
- `fullName` (String): User's full name
- `role` (Enum: advisor, client, admin): User role
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relationships**:
- One-to-Many: `investorProfiles` → InvestorProfile

---

### InvestorProfile

**Purpose**: Main container for a complete investor profile submission

**Fields**:
- `id` (UUID, PK): Unique profile identifier
- `userId` (UUID, FK → User): Owner of the profile
- `status` (Enum: draft, submitted, approved, rejected): Profile status
- `rrName` (String, nullable): Registered Representative Name
- `rrNo` (String, nullable): Registered Representative Number
- `customerNames` (String, nullable): Customer Name(s)
- `accountNo` (String, nullable): Account Number
- `retirementAccount` (Boolean): Retirement account flag
- `retailAccount` (Boolean): Retail account flag
- `otherAccountTypeText` (String, nullable): Other account type specification
- `createdAt` (DateTime): Profile creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- `submittedAt` (DateTime, nullable): Submission timestamp

**Relationships**:
- Many-to-One: `user` → User
- One-to-Many: `accountTypes` → InvestorProfileAccountType
- One-to-Many: `additionalDesignations` → InvestorProfileAdditionalDesignation
- One-to-One: `trustInformation` → TrustInformation (conditional)
- One-to-One: `jointAccountInformation` → JointAccountInformation (conditional)
- One-to-One: `custodialAccountInformation` → CustodialAccountInformation (conditional)
- One-to-One: `transferOnDeathInformation` → TransferOnDeathInformation (conditional)
- One-to-One: `patriotActInformation` → PatriotActInformation
- One-to-Many: `accountHolders` → AccountHolder
- One-to-One: `investmentObjectives` → InvestmentObjectives
- One-to-Many: `investmentValues` → InvestmentValue
- One-to-One: `trustedContact` → TrustedContact (conditional)
- One-to-Many: `signatures` → Signature

**Indexes**:
- `userId`
- `status`
- `createdAt`

---

## Step 1: Account Registration Tables

### InvestorProfileAccountType

**Purpose**: Store selected account types (multicheck field)

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile)
- `accountType` (Enum): Account type selection

**Relationships**:
- Many-to-One: `profile` → InvestorProfile

**Unique Constraint**: `(profileId, accountType)`

**Account Types**:
- individual
- corporation
- corporate_pension_profit_sharing
- custodial
- estate
- joint_tenant
- limited_liability_company
- individual_single_member_llc
- sole_proprietorship
- transfer_on_death_individual
- transfer_on_death_joint
- nonprofit_organization
- partnership
- exempt_organization
- trust
- other

---

### InvestorProfileAdditionalDesignation

**Purpose**: Store additional designations (C Corp, S Corp, UGMA, UTMA, Partnership)

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile)
- `designationType` (Enum): Designation type

**Relationships**:
- Many-to-One: `profile` → InvestorProfile

**Unique Constraint**: `(profileId, designationType)`

**Designation Types**:
- c_corp
- s_corp
- ugma
- utma
- partnership

---

### TrustInformation

**Purpose**: Store trust block data (only when Trust selected)

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile, Unique)
- `establishmentDate` (DateTime, nullable): Trust establishment date
- `trustTypes` (Array<Enum>): Array of trust types

**Relationships**:
- One-to-One: `profile` → InvestorProfile

**Trust Types**:
- charitable
- living
- irrevocable_living
- family
- revocable
- irrevocable
- testamentary

---

### JointAccountInformation

**Purpose**: Store joint account data (only when Joint Tenant selected)

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile, Unique)
- `areAccountHoldersMarried` (Enum: Yes/No, nullable)
- `tenancyState` (String, nullable)
- `numberOfTenants` (Int, nullable)
- `tenancyClauses` (Array<Enum>): Array of tenancy clauses

**Relationships**:
- One-to-One: `profile` → InvestorProfile

**Tenancy Clauses**:
- community_property
- tenants_by_entirety
- community_property_with_rights
- joint_tenants_with_rights_of_survivorship
- tenants_in_common

---

### CustodialAccountInformation

**Purpose**: Store custodial account data (only when Custodial selected)

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile, Unique)
- `stateGiftGiven1` (String, nullable)
- `dateGiftGiven1` (DateTime, nullable)
- `stateGiftGiven2` (String, nullable)
- `dateGiftGiven2` (DateTime, nullable)

**Relationships**:
- One-to-One: `profile` → InvestorProfile

---

### TransferOnDeathInformation

**Purpose**: Store TOD agreement dates

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile, Unique)
- `individualAgreementDate` (DateTime, nullable)
- `jointAgreementDate` (DateTime, nullable)

**Relationships**:
- One-to-One: `profile` → InvestorProfile

---

## Step 2: Patriot Act Information

### PatriotActInformation

**Purpose**: Store source of funds information

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile, Unique)
- `initialSourceOfFunds` (Array<String>): Array of source of funds options
- `otherSourceOfFundsText` (String, nullable): Other source specification

**Relationships**:
- One-to-One: `profile` → InvestorProfile

**Source of Funds Options** (stored as strings):
- Accounts Receivable
- Income From Earnings
- Legal Settlement
- Spouse/Parent
- Accumulated Savings
- Inheritance
- Lottery/Gaming
- Rental Income
- Alimony
- Insurance Proceeds
- Pension/IRA/Retirement Savings
- Sale of Business
- Gift
- Investment Proceeds
- Sale of Real Estate
- Other

---

## Step 3 & 4: Account Holder Tables

### AccountHolder

**Purpose**: Store common account holder information (Primary and Secondary)

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile)
- `holderType` (Enum: primary, secondary)
- `name` (String, nullable)
- `email` (String, nullable)
- `personEntity` (Enum: Person, Entity, nullable)
- `ssn` (String, nullable): Social Security Number (for Person)
- `ein` (String, nullable): Employer Identification Number (for Entity)
- `yesNoBox` (Enum: Yes/No, nullable): Yes/No checkbox (for Entity)
- `dateOfBirth` (DateTime, nullable): Date of Birth (for Person)
- `specifiedAdult` (Enum: Yes/No, nullable): Specified Adult flag (for Person)
- `primaryCitizenship` (String, nullable)
- `additionalCitizenship` (String, nullable)
- `gender` (Enum: Male, Female, nullable): Gender (for Person)
- `generalInvestmentKnowledge` (Enum: Limited, Moderate, Extensive, None, nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships**:
- Many-to-One: `profile` → InvestorProfile
- One-to-Many: `addresses` → AccountHolderAddress
- One-to-Many: `phones` → AccountHolderPhone
- One-to-Many: `maritalStatuses` → AccountHolderMaritalStatus
- One-to-Many: `employmentAffiliations` → AccountHolderEmploymentAffiliation
- One-to-One: `employment` → AccountHolderEmployment (conditional)
- One-to-Many: `investmentKnowledge` → AccountHolderInvestmentKnowledge
- One-to-One: `financialInformation` → AccountHolderFinancialInformation
- One-to-Many: `governmentIdentifications` → GovernmentIdentification
- One-to-One: `advisoryFirmInformation` → AdvisoryFirmInformation (conditional)
- One-to-One: `brokerDealerInformation` → BrokerDealerInformation (conditional)
- One-to-One: `otherBrokerageAccounts` → OtherBrokerageAccounts (conditional)
- One-to-One: `exchangeFinraAffiliation` → ExchangeFinraAffiliation (conditional)
- One-to-One: `publicCompanyInformation` → PublicCompanyInformation (conditional)

**Indexes**:
- `profileId`
- `holderType`

---

### AccountHolderAddress

**Purpose**: Store addresses (Legal, Mailing, Employer)

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder)
- `addressType` (Enum: legal, mailing, employer)
- `address` (String, nullable)
- `city` (String, nullable)
- `stateProvince` (String, nullable)
- `zipPostalCode` (String, nullable)
- `country` (String, nullable)
- `mailingSameAsLegal` (Boolean, nullable): Only for mailing addresses

**Relationships**:
- Many-to-One: `accountHolder` → AccountHolder

**Indexes**:
- `accountHolderId`
- `addressType`

---

### AccountHolderPhone

**Purpose**: Store phone numbers

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder)
- `phoneType` (Enum: home, business, mobile)
- `phoneNumber` (String, nullable)

**Relationships**:
- Many-to-One: `accountHolder` → AccountHolder

**Indexes**:
- `accountHolderId`

---

### AccountHolderMaritalStatus

**Purpose**: Store marital status selections (multicheck)

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder)
- `maritalStatus` (Enum): Marital status

**Relationships**:
- Many-to-One: `accountHolder` → AccountHolder

**Unique Constraint**: `(accountHolderId, maritalStatus)`

**Marital Statuses**:
- Single
- Married
- Divorced
- DomesticPartner
- Widow
- Widowed

---

### AccountHolderEmploymentAffiliation

**Purpose**: Store employment affiliations (multicheck)

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder)
- `affiliation` (Enum): Employment affiliation

**Relationships**:
- Many-to-One: `accountHolder` → AccountHolder

**Unique Constraint**: `(accountHolderId, affiliation)`

**Employment Affiliations**:
- Employed
- SelfEmployed
- Retired
- Unemployed
- Student
- Homemaker

---

### AccountHolderEmployment

**Purpose**: Store employment details (only when Employed/Self-Employed)

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder, Unique)
- `occupation` (String, nullable)
- `yearsEmployed` (Int, nullable)
- `typeOfBusiness` (String, nullable)
- `employerName` (String, nullable)
- `employerAddressId` (UUID, FK → AccountHolderAddress, nullable)

**Relationships**:
- One-to-One: `accountHolder` → AccountHolder
- Many-to-One: `employerAddress` → AccountHolderAddress

---

### AccountHolderInvestmentKnowledge

**Purpose**: Store investment knowledge by type (table structure)

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder)
- `investmentType` (Enum): Investment type
- `knowledgeLevel` (Enum: Limited, Moderate, Extensive, None)
- `sinceYear` (String, nullable)
- `otherInvestmentLabel` (String, nullable): For "Other" type

**Relationships**:
- Many-to-One: `accountHolder` → AccountHolder

**Unique Constraint**: `(accountHolderId, investmentType)`

**Indexes**:
- `accountHolderId`
- `investmentType`

**Investment Types**:
- commodities_futures
- equities
- etf
- fixed_annuities
- fixed_insurance
- mutual_funds
- options
- precious_metals
- real_estate
- unit_investment_trusts
- variable_annuities
- leveraged_inverse_etfs
- complex_products
- alternative_investments
- other

---

### AccountHolderFinancialInformation

**Purpose**: Store financial ranges and tax bracket

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder, Unique)
- `annualIncomeFrom` (Decimal(19,2), nullable)
- `annualIncomeTo` (Decimal(19,2), nullable)
- `netWorthFrom` (Decimal(19,2), nullable)
- `netWorthTo` (Decimal(19,2), nullable)
- `liquidNetWorthFrom` (Decimal(19,2), nullable)
- `liquidNetWorthTo` (Decimal(19,2), nullable)
- `taxBracket` (Enum, nullable): Tax bracket

**Relationships**:
- One-to-One: `accountHolder` → AccountHolder

**Tax Brackets**:
- zero_to_15 (0 - 15%)
- fifteen_1_to_32 (15.1% - 32%)
- thirtytwo_1_to_50 (32.1% - 50%)
- fifty_1_plus (50.1% +)

---

### GovernmentIdentification

**Purpose**: Store government IDs (repeatable, 2 instances)

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder)
- `idNumber` (Int): 1 or 2 to distinguish instances
- `idType` (String, nullable): Type of ID
- `idNumberValue` (String, nullable): ID number
- `countryOfIssue` (String, nullable)
- `dateOfIssue` (DateTime, nullable)
- `dateOfExpiration` (DateTime, nullable)

**Relationships**:
- Many-to-One: `accountHolder` → AccountHolder

**Unique Constraint**: `(accountHolderId, idNumber)`

**Indexes**:
- `accountHolderId`

---

### AdvisoryFirmInformation

**Purpose**: Store advisory firm questions

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder, Unique)
- `employeeOfAdvisoryFirm` (Enum: Yes/No, nullable)
- `relatedToEmployeeAdvisory` (Enum: Yes/No, nullable)
- `employeeNameAndRelationship` (String, nullable)

**Relationships**:
- One-to-One: `accountHolder` → AccountHolder

---

### BrokerDealerInformation

**Purpose**: Store broker-dealer questions

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder, Unique)
- `employeeOfBrokerDealer` (Enum: Yes/No, nullable)
- `brokerDealerName` (String, nullable)
- `relatedToEmployeeBrokerDealer` (Enum: Yes/No, nullable)
- `brokerDealerEmployeeName` (String, nullable)
- `brokerDealerEmployeeRelationship` (String, nullable)

**Relationships**:
- One-to-One: `accountHolder` → AccountHolder

---

### OtherBrokerageAccounts

**Purpose**: Store other brokerage account information

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder, Unique)
- `maintainingOtherAccounts` (Enum: Yes/No, nullable)
- `withWhatFirms` (String, nullable)
- `yearsOfInvestmentExperience` (Int, nullable)

**Relationships**:
- One-to-One: `accountHolder` → AccountHolder

---

### ExchangeFinraAffiliation

**Purpose**: Store Exchange/FINRA affiliation

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder, Unique)
- `affiliatedWithExchangeOrFinra` (Enum: Yes/No, nullable)
- `affiliationDetails` (String, nullable)

**Relationships**:
- One-to-One: `accountHolder` → AccountHolder

---

### PublicCompanyInformation

**Purpose**: Store public company officer/shareholder information

**Fields**:
- `id` (UUID, PK)
- `accountHolderId` (UUID, FK → AccountHolder, Unique)
- `seniorOfficerOr10PctShareholder` (Enum: Yes/No, nullable)
- `companyNames` (String, nullable)

**Relationships**:
- One-to-One: `accountHolder` → AccountHolder

---

## Step 5: Investment Objectives

### InvestmentObjectives

**Purpose**: Store investment objectives and risk exposure

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile, Unique)
- `riskExposure` (Array<Enum>): Array of risk exposure levels
- `accountInvestmentObjectives` (Array<Enum>): Array of investment objectives
- `seeAttachedStatement` (Boolean): See attached statement flag
- `timeHorizonFrom` (String, nullable)
- `timeHorizonTo` (String, nullable)
- `liquidityNeeds` (Array<Enum>): Array of liquidity needs

**Relationships**:
- One-to-One: `profile` → InvestorProfile

**Risk Exposure**:
- Low
- Moderate
- Speculation
- HighRisk

**Account Investment Objectives**:
- Income
- LongTermGrowth
- ShortTermGrowth

**Liquidity Needs**:
- High
- Medium
- Low

---

### InvestmentValue

**Purpose**: Store investment values table

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile)
- `investmentType` (Enum): Investment type
- `value` (Decimal(19,2)): Investment value

**Relationships**:
- Many-to-One: `profile` → InvestorProfile

**Unique Constraint**: `(profileId, investmentType)`

**Indexes**:
- `profileId`
- `investmentType`

---

## Step 6: Trusted Contact

### TrustedContact

**Purpose**: Store trusted contact information

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile, Unique)
- `declineToProvide` (Boolean): Decline to provide flag
- `name` (String, nullable)
- `email` (String, nullable)
- `homePhone` (String, nullable)
- `businessPhone` (String, nullable)
- `mobilePhone` (String, nullable)
- `mailingAddress` (String, nullable)
- `city` (String, nullable)
- `stateProvince` (String, nullable)
- `zipPostalCode` (String, nullable)
- `country` (String, nullable)

**Relationships**:
- One-to-One: `profile` → InvestorProfile

**Note**: If `declineToProvide` is true, other fields may be null.

---

## Step 7: Signatures

### Signature

**Purpose**: Store all signatures

**Fields**:
- `id` (UUID, PK)
- `profileId` (UUID, FK → InvestorProfile)
- `signatureType` (Enum): Type of signature
- `signatureData` (String): Base64 encoded image
- `printedName` (String): Printed name
- `signatureDate` (DateTime): Signature date

**Relationships**:
- Many-to-One: `profile` → InvestorProfile

**Unique Constraint**: `(profileId, signatureType)`

**Indexes**:
- `profileId`
- `signatureType`

**Signature Types**:
- account_owner
- joint_account_owner
- financial_professional
- supervisor_principal

---

## Data Type Decisions

### UUIDs
All primary keys use UUIDs for better distribution and security.

### Strings
- Names, addresses, text fields: VARCHAR with appropriate lengths
- Long text fields: TEXT type

### Boolean
Checkboxes and flags use Boolean type.

### Decimal
Currency values and financial ranges use `Decimal(19,2)` for precision:
- 19 digits total
- 2 decimal places
- Prevents floating-point precision errors

### Date
Date fields use DateTime type for full timestamp support.

### Enum
Fixed option sets use Prisma enums for type safety and validation.

### Arrays
Multicheck fields use PostgreSQL arrays of enums/strings for efficient storage and querying.

### Base64 Text
Signature images stored as base64 encoded strings. Consider file storage (S3) for production.

---

## Special Considerations

### Conditional Tables
Some tables only have data when specific conditions are met:
- `TrustInformation`: Only when Trust account type selected
- `JointAccountInformation`: Only when Joint Tenant selected
- `CustodialAccountInformation`: Only when Custodial selected
- `TransferOnDeathInformation`: Only when TOD selected
- `AccountHolderEmployment`: Only when Employed/Self-Employed
- `AdvisoryFirmInformation`: Conditional on Yes/No answers
- `BrokerDealerInformation`: Conditional on Yes/No answers
- `OtherBrokerageAccounts`: Conditional on Yes/No answers
- `ExchangeFinraAffiliation`: Conditional on Yes/No answers
- `PublicCompanyInformation`: Conditional on Yes/No answers
- `TrustedContact`: Optional, can be declined

### Repeatable Groups
- `GovernmentIdentification`: Uses `idNumber` (1 or 2) to distinguish instances
- Multiple addresses per account holder (legal, mailing, employer)
- Multiple phones per account holder (home, business, mobile)

### Multicheck Fields
Stored as:
- PostgreSQL arrays for simple multicheck fields (e.g., `riskExposure`, `liquidityNeeds`)
- Junction tables for many-to-many relationships (e.g., `AccountType`, `MaritalStatus`)

### Data Validation
- Enforce constraints at database level where possible
- Use Prisma validation for type safety
- Application-level validation for business rules

### Soft Deletes
Currently using hard deletes. Consider adding `deletedAt` field for audit trail if needed.

### Versioning
Consider form version tracking if form structure changes over time.

---

## Indexes

### Performance Indexes
1. `InvestorProfile`: `userId`, `status`, `createdAt`
2. `AccountHolder`: `profileId`, `holderType`
3. `AccountHolderAddress`: `accountHolderId`, `addressType`
4. `AccountHolderPhone`: `accountHolderId`
5. `AccountHolderInvestmentKnowledge`: `accountHolderId`, `investmentType`
6. `GovernmentIdentification`: `accountHolderId`
7. `InvestmentValue`: `profileId`, `investmentType`
8. `Signature`: `profileId`, `signatureType`

### Unique Constraints
- `InvestorProfileAccountType`: `(profileId, accountType)`
- `InvestorProfileAdditionalDesignation`: `(profileId, designationType)`
- `AccountHolderMaritalStatus`: `(accountHolderId, maritalStatus)`
- `AccountHolderEmploymentAffiliation`: `(accountHolderId, affiliation)`
- `AccountHolderInvestmentKnowledge`: `(accountHolderId, investmentType)`
- `GovernmentIdentification`: `(accountHolderId, idNumber)`
- `InvestmentValue`: `(profileId, investmentType)`
- `Signature`: `(profileId, signatureType)`

---

## Relationships Summary

### One-to-One Relationships
- `InvestorProfile` → `TrustInformation` (conditional)
- `InvestorProfile` → `JointAccountInformation` (conditional)
- `InvestorProfile` → `CustodialAccountInformation` (conditional)
- `InvestorProfile` → `TransferOnDeathInformation` (conditional)
- `InvestorProfile` → `PatriotActInformation`
- `InvestorProfile` → `InvestmentObjectives`
- `InvestorProfile` → `TrustedContact` (conditional)
- `AccountHolder` → `AccountHolderEmployment` (conditional)
- `AccountHolder` → `AccountHolderFinancialInformation`
- `AccountHolder` → `AdvisoryFirmInformation` (conditional)
- `AccountHolder` → `BrokerDealerInformation` (conditional)
- `AccountHolder` → `OtherBrokerageAccounts` (conditional)
- `AccountHolder` → `ExchangeFinraAffiliation` (conditional)
- `AccountHolder` → `PublicCompanyInformation` (conditional)

### One-to-Many Relationships
- `User` → `InvestorProfile`
- `InvestorProfile` → `InvestorProfileAccountType`
- `InvestorProfile` → `InvestorProfileAdditionalDesignation`
- `InvestorProfile` → `AccountHolder`
- `InvestorProfile` → `InvestmentValue`
- `InvestorProfile` → `Signature`
- `AccountHolder` → `AccountHolderAddress`
- `AccountHolder` → `AccountHolderPhone`
- `AccountHolder` → `AccountHolderMaritalStatus`
- `AccountHolder` → `AccountHolderEmploymentAffiliation`
- `AccountHolder` → `AccountHolderInvestmentKnowledge`
- `AccountHolder` → `GovernmentIdentification`

### Many-to-Many Relationships (via junction tables)
- `InvestorProfile` ↔ `AccountType` (via `InvestorProfileAccountType`)
- `InvestorProfile` ↔ `AdditionalDesignation` (via `InvestorProfileAdditionalDesignation`)
- `AccountHolder` ↔ `MaritalStatus` (via `AccountHolderMaritalStatus`)
- `AccountHolder` ↔ `EmploymentAffiliation` (via `AccountHolderEmploymentAffiliation`)

---

## Migration Strategy

1. Run `prisma migrate dev` to create initial migration
2. Review generated migration SQL
3. Test migration on development database
4. Apply to staging/production with `prisma migrate deploy`

---

## Query Patterns

### Get Complete Profile
```prisma
const profile = await prisma.investorProfile.findUnique({
  where: { id: profileId },
  include: {
    accountTypes: true,
    additionalDesignations: true,
    trustInformation: true,
    jointAccountInformation: true,
    custodialAccountInformation: true,
    transferOnDeathInformation: true,
    patriotActInformation: true,
    accountHolders: {
      include: {
        addresses: true,
        phones: true,
        maritalStatuses: true,
        employmentAffiliations: true,
        employment: { include: { employerAddress: true } },
        investmentKnowledge: true,
        financialInformation: true,
        governmentIdentifications: true,
        advisoryFirmInformation: true,
        brokerDealerInformation: true,
        otherBrokerageAccounts: true,
        exchangeFinraAffiliation: true,
        publicCompanyInformation: true,
      },
    },
    investmentObjectives: true,
    investmentValues: true,
    trustedContact: true,
    signatures: true,
  },
});
```

### Get Profiles by User
```prisma
const profiles = await prisma.investorProfile.findMany({
  where: { userId },
  include: {
    accountTypes: true,
    accountHolders: {
      where: { holderType: "primary" },
      select: { name: true },
    },
  },
  orderBy: { createdAt: "desc" },
});
```

---

## Best Practices

1. **Always use transactions** for multi-table operations
2. **Validate data** at both schema and application level
3. **Use Prisma types** for type safety
4. **Handle conditional data** properly (check existence before accessing)
5. **Use indexes** for frequently queried fields
6. **Consider caching** for read-heavy operations
7. **Monitor query performance** and optimize as needed
8. **Backup regularly** especially before migrations
9. **Test migrations** in development first
10. **Document schema changes** in migration files

---

## Future Enhancements

1. **Soft Deletes**: Add `deletedAt` field for audit trail
2. **Versioning**: Track form version for schema changes
3. **File Storage**: Move signature images to S3 or similar
4. **Full-Text Search**: Add search capabilities for profiles
5. **Audit Log**: Track all changes to profiles
6. **Export/Import**: Add data export/import functionality
7. **Archiving**: Archive old profiles after retention period

