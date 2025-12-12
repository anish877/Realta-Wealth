import { prisma } from "../prisma";
import { NotFoundError, ConflictError } from "../utils/errors";
import { validationService } from "./validationService";
import { AccountHolderType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export class AccountHolderService {
  /**
   * Create account holder (Primary or Secondary)
   */
  async createAccountHolder(profileId: string, holderType: AccountHolderType, data: any) {
    return await prisma.$transaction(async (tx) => {
      // Validate data
      await validationService.validateConditionalFields(data, {});

      // Create account holder
      const accountHolder = await tx.accountHolder.create({
        data: {
          profileId,
          holderType,
          name: data.name,
          email: data.email,
          personEntity: data.personEntity,
          ssn: data.ssn,
          ein: data.ein,
          yesNoBox: data.yesNoBox,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          specifiedAdult: data.specifiedAdult,
          primaryCitizenship: data.primaryCitizenship,
          additionalCitizenship: data.additionalCitizenship,
          gender: data.gender,
          generalInvestmentKnowledge: data.generalInvestmentKnowledge,
        },
      });

      // Create addresses
      if (data.addresses && data.addresses.length > 0) {
        await tx.accountHolderAddress.createMany({
          data: data.addresses.map((addr: any) => ({
            accountHolderId: accountHolder.id,
            addressType: addr.addressType,
            address: addr.address,
            city: addr.city,
            stateProvince: addr.stateProvince,
            zipPostalCode: addr.zipPostalCode,
            country: addr.country,
            mailingSameAsLegal: addr.mailingSameAsLegal || false,
          })),
        });
      }

      // Create phones
      if (data.phones && data.phones.length > 0) {
        await tx.accountHolderPhone.createMany({
          data: data.phones.map((phone: any) => ({
            accountHolderId: accountHolder.id,
            phoneType: phone.phoneType,
            phoneNumber: phone.phoneNumber,
          })),
        });
      }

      // Create marital statuses
      if (data.maritalStatuses && data.maritalStatuses.length > 0) {
        await tx.accountHolderMaritalStatus.createMany({
          data: data.maritalStatuses.map((status: string) => ({
            accountHolderId: accountHolder.id,
            maritalStatus: status as any,
          })),
        });
      }

      // Create employment affiliations
      if (data.employmentAffiliations && data.employmentAffiliations.length > 0) {
        await tx.accountHolderEmploymentAffiliation.createMany({
          data: data.employmentAffiliations.map((affiliation: string) => ({
            accountHolderId: accountHolder.id,
            affiliation: affiliation as any,
          })),
        });
      }

      // Create employment
      if (data.employment) {
        let employerAddressId = null;
        if (data.employment.employerAddress) {
          const employerAddr = await tx.accountHolderAddress.create({
            data: {
              accountHolderId: accountHolder.id,
              addressType: "employer",
              address: data.employment.employerAddress.address,
              city: data.employment.employerAddress.city,
              stateProvince: data.employment.employerAddress.stateProvince,
              zipPostalCode: data.employment.employerAddress.zipPostalCode,
              country: data.employment.employerAddress.country,
            },
          });
          employerAddressId = employerAddr.id;
        }

        await tx.accountHolderEmployment.create({
          data: {
            accountHolderId: accountHolder.id,
            occupation: data.employment.occupation,
            yearsEmployed: data.employment.yearsEmployed,
            typeOfBusiness: data.employment.typeOfBusiness,
            employerName: data.employment.employerName,
            employerAddressId,
          },
        });
      }

      // Create investment knowledge
      if (data.investmentKnowledge && data.investmentKnowledge.length > 0) {
        await tx.accountHolderInvestmentKnowledge.createMany({
          data: data.investmentKnowledge.map((knowledge: any) => ({
            accountHolderId: accountHolder.id,
            investmentType: knowledge.investmentType,
            knowledgeLevel: knowledge.knowledgeLevel,
            sinceYear: knowledge.sinceYear,
            otherInvestmentLabel: knowledge.otherInvestmentLabel,
          })),
        });
      }

      // Create financial information
      if (data.financialInformation) {
        await tx.accountHolderFinancialInformation.create({
          data: {
            accountHolderId: accountHolder.id,
            annualIncomeFrom: data.financialInformation.annualIncomeFrom
              ? new Decimal(data.financialInformation.annualIncomeFrom)
              : null,
            annualIncomeTo: data.financialInformation.annualIncomeTo
              ? new Decimal(data.financialInformation.annualIncomeTo)
              : null,
            netWorthFrom: data.financialInformation.netWorthFrom
              ? new Decimal(data.financialInformation.netWorthFrom)
              : null,
            netWorthTo: data.financialInformation.netWorthTo
              ? new Decimal(data.financialInformation.netWorthTo)
              : null,
            liquidNetWorthFrom: data.financialInformation.liquidNetWorthFrom
              ? new Decimal(data.financialInformation.liquidNetWorthFrom)
              : null,
            liquidNetWorthTo: data.financialInformation.liquidNetWorthTo
              ? new Decimal(data.financialInformation.liquidNetWorthTo)
              : null,
            taxBracket: data.financialInformation.taxBracket,
          },
        });
      }

      // Create government identifications
      if (data.governmentIdentifications && data.governmentIdentifications.length > 0) {
        await tx.governmentIdentification.createMany({
          data: data.governmentIdentifications.map((govId: any) => ({
            accountHolderId: accountHolder.id,
            idNumber: govId.idNumber,
            idType: govId.idType,
            idNumberValue: govId.idNumberValue,
            countryOfIssue: govId.countryOfIssue,
            dateOfIssue: govId.dateOfIssue ? new Date(govId.dateOfIssue) : null,
            dateOfExpiration: govId.dateOfExpiration ? new Date(govId.dateOfExpiration) : null,
          })),
        });
      }

      // Create advisory firm information
      if (data.advisoryFirmInformation) {
        await tx.advisoryFirmInformation.create({
          data: {
            accountHolderId: accountHolder.id,
            employeeOfAdvisoryFirm: data.advisoryFirmInformation.employeeOfAdvisoryFirm,
            relatedToEmployeeAdvisory: data.advisoryFirmInformation.relatedToEmployeeAdvisory,
            employeeNameAndRelationship: data.advisoryFirmInformation.employeeNameAndRelationship,
          },
        });
      }

      // Create broker dealer information
      if (data.brokerDealerInformation) {
        await tx.brokerDealerInformation.create({
          data: {
            accountHolderId: accountHolder.id,
            employeeOfBrokerDealer: data.brokerDealerInformation.employeeOfBrokerDealer,
            brokerDealerName: data.brokerDealerInformation.brokerDealerName,
            relatedToEmployeeBrokerDealer: data.brokerDealerInformation.relatedToEmployeeBrokerDealer,
            brokerDealerEmployeeName: data.brokerDealerInformation.brokerDealerEmployeeName,
            brokerDealerEmployeeRelationship: data.brokerDealerInformation.brokerDealerEmployeeRelationship,
          },
        });
      }

      // Create other brokerage accounts
      if (data.otherBrokerageAccounts) {
        await tx.otherBrokerageAccounts.create({
          data: {
            accountHolderId: accountHolder.id,
            maintainingOtherAccounts: data.otherBrokerageAccounts.maintainingOtherAccounts,
            withWhatFirms: data.otherBrokerageAccounts.withWhatFirms,
            yearsOfInvestmentExperience: data.otherBrokerageAccounts.yearsOfInvestmentExperience,
          },
        });
      }

      // Create exchange/FINRA affiliation
      if (data.exchangeFinraAffiliation) {
        await tx.exchangeFinraAffiliation.create({
          data: {
            accountHolderId: accountHolder.id,
            affiliatedWithExchangeOrFinra: data.exchangeFinraAffiliation.affiliatedWithExchangeOrFinra,
            affiliationDetails: data.exchangeFinraAffiliation.affiliationDetails,
          },
        });
      }

      // Create public company information
      if (data.publicCompanyInformation) {
        await tx.publicCompanyInformation.create({
          data: {
            accountHolderId: accountHolder.id,
            seniorOfficerOr10PctShareholder: data.publicCompanyInformation.seniorOfficerOr10PctShareholder,
            companyNames: data.publicCompanyInformation.companyNames,
          },
        });
      }

      return this.getAccountHolderById(accountHolder.id);
    });
  }

  /**
   * Get account holder by ID
   */
  async getAccountHolderById(holderId: string) {
    const accountHolder = await prisma.accountHolder.findUnique({
      where: { id: holderId },
      include: {
        addresses: true,
        phones: true,
        maritalStatuses: true,
        employmentAffiliations: true,
        employment: {
          include: {
            employerAddress: true,
          },
        },
        investmentKnowledge: true,
        financialInformation: true,
        governmentIdentifications: true,
        advisoryFirmInformation: true,
        brokerDealerInformation: true,
        otherBrokerageAccounts: true,
        exchangeFinraAffiliation: true,
        publicCompanyInformation: true,
      },
    });

    if (!accountHolder) {
      throw new NotFoundError("Account Holder", holderId);
    }

    return accountHolder;
  }

  /**
   * Update account holder
   */
  async updateAccountHolder(holderId: string, updates: any) {
    const accountHolder = await this.getAccountHolderById(holderId);
    
    // Check if profile is in draft status
    const profile = await prisma.investorProfile.findUnique({
      where: { id: accountHolder.profileId },
    });

    if (!profile || profile.status !== "draft") {
      throw new ConflictError("Cannot update account holder for a profile that is not in draft status");
    }

    return await prisma.$transaction(async (tx) => {
      // Update account holder basic info
      await tx.accountHolder.update({
        where: { id: holderId },
        data: {
          name: updates.name,
          email: updates.email,
          personEntity: updates.personEntity,
          ssn: updates.ssn,
          ein: updates.ein,
          yesNoBox: updates.yesNoBox,
          dateOfBirth: updates.dateOfBirth ? new Date(updates.dateOfBirth) : null,
          specifiedAdult: updates.specifiedAdult,
          primaryCitizenship: updates.primaryCitizenship,
          additionalCitizenship: updates.additionalCitizenship,
          gender: updates.gender,
          generalInvestmentKnowledge: updates.generalInvestmentKnowledge,
        },
      });

      // Update addresses if provided
      if (updates.addresses !== undefined) {
        await tx.accountHolderAddress.deleteMany({
          where: { accountHolderId: holderId },
        });
        if (updates.addresses.length > 0) {
          await tx.accountHolderAddress.createMany({
            data: updates.addresses.map((addr: any) => ({
              accountHolderId: holderId,
              addressType: addr.addressType,
              address: addr.address,
              city: addr.city,
              stateProvince: addr.stateProvince,
              zipPostalCode: addr.zipPostalCode,
              country: addr.country,
              mailingSameAsLegal: addr.mailingSameAsLegal || false,
            })),
          });
        }
      }

      // Update phones if provided
      if (updates.phones !== undefined) {
        await tx.accountHolderPhone.deleteMany({
          where: { accountHolderId: holderId },
        });
        if (updates.phones.length > 0) {
          await tx.accountHolderPhone.createMany({
            data: updates.phones.map((phone: any) => ({
              accountHolderId: holderId,
              phoneType: phone.phoneType,
              phoneNumber: phone.phoneNumber,
            })),
          });
        }
      }

      // Update marital statuses if provided
      if (updates.maritalStatuses !== undefined) {
        await tx.accountHolderMaritalStatus.deleteMany({
          where: { accountHolderId: holderId },
        });
        if (updates.maritalStatuses.length > 0) {
          await tx.accountHolderMaritalStatus.createMany({
            data: updates.maritalStatuses.map((status: string) => ({
              accountHolderId: holderId,
              maritalStatus: status as any,
            })),
          });
        }
      }

      // Update employment affiliations if provided
      if (updates.employmentAffiliations !== undefined) {
        await tx.accountHolderEmploymentAffiliation.deleteMany({
          where: { accountHolderId: holderId },
        });
        if (updates.employmentAffiliations.length > 0) {
          await tx.accountHolderEmploymentAffiliation.createMany({
            data: updates.employmentAffiliations.map((affiliation: string) => ({
              accountHolderId: holderId,
              affiliation: affiliation as any,
            })),
          });
        }
      }

      // Update employment if provided
      if (updates.employment !== undefined) {
        await tx.accountHolderEmployment.deleteMany({
          where: { accountHolderId: holderId },
        });
        if (updates.employment) {
          let employerAddressId = null;
          if (updates.employment.employerAddress) {
            const employerAddr = await tx.accountHolderAddress.create({
              data: {
                accountHolderId: holderId,
                addressType: "employer",
                address: updates.employment.employerAddress.address,
                city: updates.employment.employerAddress.city,
                stateProvince: updates.employment.employerAddress.stateProvince,
                zipPostalCode: updates.employment.employerAddress.zipPostalCode,
                country: updates.employment.employerAddress.country,
              },
            });
            employerAddressId = employerAddr.id;
          }

          await tx.accountHolderEmployment.create({
            data: {
              accountHolderId: holderId,
              occupation: updates.employment.occupation,
              yearsEmployed: updates.employment.yearsEmployed,
              typeOfBusiness: updates.employment.typeOfBusiness,
              employerName: updates.employment.employerName,
              employerAddressId,
            },
          });
        }
      }

      // Update investment knowledge if provided
      if (updates.investmentKnowledge !== undefined) {
        await tx.accountHolderInvestmentKnowledge.deleteMany({
          where: { accountHolderId: holderId },
        });
        if (updates.investmentKnowledge.length > 0) {
          await tx.accountHolderInvestmentKnowledge.createMany({
            data: updates.investmentKnowledge.map((knowledge: any) => ({
              accountHolderId: holderId,
              investmentType: knowledge.investmentType,
              knowledgeLevel: knowledge.knowledgeLevel,
              sinceYear: knowledge.sinceYear,
              otherInvestmentLabel: knowledge.otherInvestmentLabel,
            })),
          });
        }
      }

      // Update financial information if provided
      if (updates.financialInformation !== undefined) {
        await tx.accountHolderFinancialInformation.upsert({
          where: { accountHolderId: holderId },
          create: {
            accountHolderId: holderId,
            annualIncomeFrom: updates.financialInformation.annualIncomeFrom
              ? new Decimal(updates.financialInformation.annualIncomeFrom)
              : null,
            annualIncomeTo: updates.financialInformation.annualIncomeTo
              ? new Decimal(updates.financialInformation.annualIncomeTo)
              : null,
            netWorthFrom: updates.financialInformation.netWorthFrom
              ? new Decimal(updates.financialInformation.netWorthFrom)
              : null,
            netWorthTo: updates.financialInformation.netWorthTo
              ? new Decimal(updates.financialInformation.netWorthTo)
              : null,
            liquidNetWorthFrom: updates.financialInformation.liquidNetWorthFrom
              ? new Decimal(updates.financialInformation.liquidNetWorthFrom)
              : null,
            liquidNetWorthTo: updates.financialInformation.liquidNetWorthTo
              ? new Decimal(updates.financialInformation.liquidNetWorthTo)
              : null,
            taxBracket: updates.financialInformation.taxBracket,
          },
          update: {
            annualIncomeFrom: updates.financialInformation.annualIncomeFrom
              ? new Decimal(updates.financialInformation.annualIncomeFrom)
              : null,
            annualIncomeTo: updates.financialInformation.annualIncomeTo
              ? new Decimal(updates.financialInformation.annualIncomeTo)
              : null,
            netWorthFrom: updates.financialInformation.netWorthFrom
              ? new Decimal(updates.financialInformation.netWorthFrom)
              : null,
            netWorthTo: updates.financialInformation.netWorthTo
              ? new Decimal(updates.financialInformation.netWorthTo)
              : null,
            liquidNetWorthFrom: updates.financialInformation.liquidNetWorthFrom
              ? new Decimal(updates.financialInformation.liquidNetWorthFrom)
              : null,
            liquidNetWorthTo: updates.financialInformation.liquidNetWorthTo
              ? new Decimal(updates.financialInformation.liquidNetWorthTo)
              : null,
            taxBracket: updates.financialInformation.taxBracket,
          },
        });
      }

      // Update government identifications if provided
      if (updates.governmentIdentifications !== undefined) {
        await tx.governmentIdentification.deleteMany({
          where: { accountHolderId: holderId },
        });
        if (updates.governmentIdentifications.length > 0) {
          await tx.governmentIdentification.createMany({
            data: updates.governmentIdentifications.map((govId: any) => ({
              accountHolderId: holderId,
              idNumber: govId.idNumber,
              idType: govId.idType,
              idNumberValue: govId.idNumberValue,
              countryOfIssue: govId.countryOfIssue,
              dateOfIssue: govId.dateOfIssue ? new Date(govId.dateOfIssue) : null,
              dateOfExpiration: govId.dateOfExpiration ? new Date(govId.dateOfExpiration) : null,
            })),
          });
        }
      }

      // Update advisory firm information if provided
      if (updates.advisoryFirmInformation !== undefined) {
        await tx.advisoryFirmInformation.upsert({
          where: { accountHolderId: holderId },
          create: {
            accountHolderId: holderId,
            employeeOfAdvisoryFirm: updates.advisoryFirmInformation.employeeOfAdvisoryFirm,
            relatedToEmployeeAdvisory: updates.advisoryFirmInformation.relatedToEmployeeAdvisory,
            employeeNameAndRelationship: updates.advisoryFirmInformation.employeeNameAndRelationship,
          },
          update: {
            employeeOfAdvisoryFirm: updates.advisoryFirmInformation.employeeOfAdvisoryFirm,
            relatedToEmployeeAdvisory: updates.advisoryFirmInformation.relatedToEmployeeAdvisory,
            employeeNameAndRelationship: updates.advisoryFirmInformation.employeeNameAndRelationship,
          },
        });
      }

      // Update broker dealer information if provided
      if (updates.brokerDealerInformation !== undefined) {
        await tx.brokerDealerInformation.upsert({
          where: { accountHolderId: holderId },
          create: {
            accountHolderId: holderId,
            employeeOfBrokerDealer: updates.brokerDealerInformation.employeeOfBrokerDealer,
            brokerDealerName: updates.brokerDealerInformation.brokerDealerName,
            relatedToEmployeeBrokerDealer: updates.brokerDealerInformation.relatedToEmployeeBrokerDealer,
            brokerDealerEmployeeName: updates.brokerDealerInformation.brokerDealerEmployeeName,
            brokerDealerEmployeeRelationship: updates.brokerDealerInformation.brokerDealerEmployeeRelationship,
          },
          update: {
            employeeOfBrokerDealer: updates.brokerDealerInformation.employeeOfBrokerDealer,
            brokerDealerName: updates.brokerDealerInformation.brokerDealerName,
            relatedToEmployeeBrokerDealer: updates.brokerDealerInformation.relatedToEmployeeBrokerDealer,
            brokerDealerEmployeeName: updates.brokerDealerInformation.brokerDealerEmployeeName,
            brokerDealerEmployeeRelationship: updates.brokerDealerInformation.brokerDealerEmployeeRelationship,
          },
        });
      }

      // Update other brokerage accounts if provided
      if (updates.otherBrokerageAccounts !== undefined) {
        await tx.otherBrokerageAccounts.upsert({
          where: { accountHolderId: holderId },
          create: {
            accountHolderId: holderId,
            maintainingOtherAccounts: updates.otherBrokerageAccounts.maintainingOtherAccounts,
            withWhatFirms: updates.otherBrokerageAccounts.withWhatFirms,
            yearsOfInvestmentExperience: updates.otherBrokerageAccounts.yearsOfInvestmentExperience,
          },
          update: {
            maintainingOtherAccounts: updates.otherBrokerageAccounts.maintainingOtherAccounts,
            withWhatFirms: updates.otherBrokerageAccounts.withWhatFirms,
            yearsOfInvestmentExperience: updates.otherBrokerageAccounts.yearsOfInvestmentExperience,
          },
        });
      }

      // Update exchange/FINRA affiliation if provided
      if (updates.exchangeFinraAffiliation !== undefined) {
        await tx.exchangeFinraAffiliation.upsert({
          where: { accountHolderId: holderId },
          create: {
            accountHolderId: holderId,
            affiliatedWithExchangeOrFinra: updates.exchangeFinraAffiliation.affiliatedWithExchangeOrFinra,
            affiliationDetails: updates.exchangeFinraAffiliation.affiliationDetails,
          },
          update: {
            affiliatedWithExchangeOrFinra: updates.exchangeFinraAffiliation.affiliatedWithExchangeOrFinra,
            affiliationDetails: updates.exchangeFinraAffiliation.affiliationDetails,
          },
        });
      }

      // Update public company information if provided
      if (updates.publicCompanyInformation !== undefined) {
        await tx.publicCompanyInformation.upsert({
          where: { accountHolderId: holderId },
          create: {
            accountHolderId: holderId,
            seniorOfficerOr10PctShareholder: updates.publicCompanyInformation.seniorOfficerOr10PctShareholder,
            companyNames: updates.publicCompanyInformation.companyNames,
          },
          update: {
            seniorOfficerOr10PctShareholder: updates.publicCompanyInformation.seniorOfficerOr10PctShareholder,
            companyNames: updates.publicCompanyInformation.companyNames,
          },
        });
      }

      return this.getAccountHolderById(holderId);
    });
  }

  /**
   * Get all account holders for a profile
   */
  async getAccountHoldersByProfile(profileId: string) {
    return await prisma.accountHolder.findMany({
      where: { profileId },
      include: {
        addresses: true,
        phones: true,
        maritalStatuses: true,
        employmentAffiliations: true,
        employment: {
          include: {
            employerAddress: true,
          },
        },
        investmentKnowledge: true,
        financialInformation: true,
        governmentIdentifications: true,
        advisoryFirmInformation: true,
        brokerDealerInformation: true,
        otherBrokerageAccounts: true,
        exchangeFinraAffiliation: true,
        publicCompanyInformation: true,
      },
      orderBy: { holderType: "asc" },
    });
  }
}

export const accountHolderService = new AccountHolderService();

