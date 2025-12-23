// @ts-nocheck
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors";
import { validationService } from "./validationService";
import { calculatePagination, PaginationInfo } from "../utils/responses";
import { PAGINATION } from "../config/constants";
import { config } from "../config/env";

type ProfileStatus = "draft" | "submitted" | "approved" | "rejected";

export class AdditionalHolderService {
  /**
   * Create a new additional holder profile or update existing profile
   * Ensures only one profile exists per user/client - always updates if profile exists
   */
  async createAdditionalHolder(userId: string | undefined, clientId: string | undefined, step1Data: any) {
    if (!userId && !clientId) {
      throw new ValidationError("Either userId or clientId must be provided");
    }

    // Check if user/client already has ANY profile (regardless of status)
    const whereClause: any = {};
    if (clientId) {
      whereClause.clientId = clientId;
    } else if (userId) {
      whereClause.userId = userId;
    }

    // Ensure we don't accidentally include both
    if (clientId && whereClause.userId) {
      delete whereClause.userId;
    }

    const existingProfile = await prisma.additionalHolderProfile.findFirst({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // If profile exists, update it instead of creating a new one
    // Reset status to draft when updating
    if (existingProfile) {
      if (existingProfile.status !== "draft") {
        await prisma.additionalHolderProfile.update({
          where: { id: existingProfile.id },
          data: { status: "draft" },
        });
      }
      return await this.updateStep1(existingProfile.id, step1Data);
    }

    // No draft exists, create a new one
    return await prisma.$transaction(
      async (tx) => {
        // Validate Step 1 data
        await validationService.validateAdditionalHolderStep1(step1Data);

        const now = new Date();

        // Create profile
        const profile = await tx.additionalHolderProfile.create({
          data: {
            userId: userId || null,
            clientId: clientId || null,
            accountRegistration: step1Data.accountRegistration,
            rrName: step1Data.rrName,
            rrNo: step1Data.rrNo,
            name: step1Data.name,
            personEntity: step1Data.personEntity,
            ssn: step1Data.ssn,
            ein: step1Data.ein,
            holderParticipantRole: step1Data.holderParticipantRole,
            email: step1Data.email,
            dateOfBirth: step1Data.dateOfBirth ? new Date(step1Data.dateOfBirth) : null,
            positionHeld: step1Data.positionHeld,
            primaryCitizenship: step1Data.primaryCitizenship,
            additionalCitizenship: step1Data.additionalCitizenship,
            gender: step1Data.gender,
            maritalStatus: step1Data.maritalStatus || [],
            employmentStatus: step1Data.employmentStatus || [],
            occupation: step1Data.occupation,
            yearsEmployed: step1Data.yearsEmployed,
            typeOfBusiness: step1Data.typeOfBusiness,
            employerName: step1Data.employerName,
            overallInvestmentKnowledge: step1Data.overallInvestmentKnowledge,
            status: "draft",
            lastCompletedPage: 1,
            pageCompletionStatus: {
              "1": { completed: true, updatedAt: now.toISOString() },
            },
          },
        });

        // Create addresses
        if (step1Data.legalAddress) {
          await tx.additionalHolderAddress.create({
            data: {
              profileId: profile.id,
              addressType: "legal",
              addressLine: step1Data.legalAddress.addressLine,
              city: step1Data.legalAddress.city,
              stateProvince: step1Data.legalAddress.stateProvince,
              zipPostalCode: step1Data.legalAddress.zipPostalCode,
              country: step1Data.legalAddress.country,
            },
          });
        }

        if (step1Data.mailingAddress) {
          await tx.additionalHolderAddress.create({
            data: {
              profileId: profile.id,
              addressType: "mailing",
              addressLine: step1Data.mailingAddress.addressLine,
              city: step1Data.mailingAddress.city,
              stateProvince: step1Data.mailingAddress.stateProvince,
              zipPostalCode: step1Data.mailingAddress.zipPostalCode,
              country: step1Data.mailingAddress.country,
            },
          });
        }

        if (step1Data.employerAddress) {
          await tx.additionalHolderAddress.create({
            data: {
              profileId: profile.id,
              addressType: "employer",
              addressLine: step1Data.employerAddress.addressLine,
              city: step1Data.employerAddress.city,
              stateProvince: step1Data.employerAddress.stateProvince,
              zipPostalCode: step1Data.employerAddress.zipPostalCode,
              country: step1Data.employerAddress.country,
            },
          });
        }

        // Create phones
        if (step1Data.homePhone) {
          await tx.additionalHolderPhone.create({
            data: {
              profileId: profile.id,
              phoneType: "home",
              phoneNumber: step1Data.homePhone,
            },
          });
        }

        if (step1Data.businessPhone) {
          await tx.additionalHolderPhone.create({
            data: {
              profileId: profile.id,
              phoneType: "business",
              phoneNumber: step1Data.businessPhone,
            },
          });
        }

        if (step1Data.mobilePhone) {
          await tx.additionalHolderPhone.create({
            data: {
              profileId: profile.id,
              phoneType: "mobile",
              phoneNumber: step1Data.mobilePhone,
            },
          });
        }

        // Create investment knowledge
        if (step1Data.investmentKnowledge && step1Data.investmentKnowledge.length > 0) {
          await tx.additionalHolderInvestmentKnowledge.createMany({
            data: step1Data.investmentKnowledge.map((inv: any) => ({
              profileId: profile.id,
              investmentType: inv.investmentType,
              knowledgeLevel: inv.knowledgeLevel,
              sinceYear: inv.sinceYear,
            })),
          });
        }

        return profile.id;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    ).then(async (profileId) => {
      return await this.getAdditionalHolderById(profileId, true);
    });
  }

  /**
   * Get additional holder by ID with optional relations
   */
  async getAdditionalHolderById(profileId: string, includeRelations: boolean = true) {
    const profile = await prisma.additionalHolderProfile.findUnique({
      where: { id: profileId },
      include: includeRelations
        ? {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
              },
            },
            addresses: true,
            phones: true,
            governmentIds: true,
            investmentKnowledge: true,
          }
        : undefined,
    });

    if (!profile) {
      throw new NotFoundError("Additional Holder Profile", profileId);
    }

    return profile;
  }

  /**
   * Update specific step
   * Automatically resets status to draft if profile was submitted/approved/rejected
   */
  async updateStep(profileId: string, stepNumber: number, stepData: any) {
    const profile = await this.getAdditionalHolderById(profileId, false);

    // Reset status to draft if it was submitted/approved/rejected
    if (profile.status !== "draft") {
      await prisma.additionalHolderProfile.update({
        where: { id: profileId },
        data: { status: "draft" },
      });
    }

    switch (stepNumber) {
      case 1:
        await validationService.validateAdditionalHolderStep1(stepData);
        return await this.updateStep1(profileId, stepData);
      case 2:
        await validationService.validateAdditionalHolderStep2(stepData);
        return await this.updateStep2(profileId, stepData);
      default:
        throw new ValidationError(`Invalid step number: ${stepNumber}`);
    }
  }

  /**
   * Update Step 1
   */
  private async updateStep1(profileId: string, stepData: any) {
    // Update profile
    await prisma.additionalHolderProfile.update({
      where: { id: profileId },
      data: {
        accountRegistration: stepData.accountRegistration,
        rrName: stepData.rrName,
        rrNo: stepData.rrNo,
        name: stepData.name,
        personEntity: stepData.personEntity,
        ssn: stepData.ssn,
        ein: stepData.ein,
        holderParticipantRole: stepData.holderParticipantRole,
        email: stepData.email,
        dateOfBirth: stepData.dateOfBirth ? new Date(stepData.dateOfBirth) : null,
        positionHeld: stepData.positionHeld,
        primaryCitizenship: stepData.primaryCitizenship,
        additionalCitizenship: stepData.additionalCitizenship,
        gender: stepData.gender,
        maritalStatus: stepData.maritalStatus || [],
        employmentStatus: stepData.employmentStatus || [],
        occupation: stepData.occupation,
        yearsEmployed: stepData.yearsEmployed,
        typeOfBusiness: stepData.typeOfBusiness,
        employerName: stepData.employerName,
        overallInvestmentKnowledge: stepData.overallInvestmentKnowledge,
      },
    });

    // Update addresses
    await prisma.additionalHolderAddress.deleteMany({
      where: { profileId },
    });

    if (stepData.legalAddress) {
      await prisma.additionalHolderAddress.create({
        data: {
          profileId,
          addressType: "legal",
          addressLine: stepData.legalAddress.addressLine,
          city: stepData.legalAddress.city,
          stateProvince: stepData.legalAddress.stateProvince,
          zipPostalCode: stepData.legalAddress.zipPostalCode,
          country: stepData.legalAddress.country,
        },
      });
    }

    if (stepData.mailingAddress) {
      await prisma.additionalHolderAddress.create({
        data: {
          profileId,
          addressType: "mailing",
          addressLine: stepData.mailingAddress.addressLine,
          city: stepData.mailingAddress.city,
          stateProvince: stepData.mailingAddress.stateProvince,
          zipPostalCode: stepData.mailingAddress.zipPostalCode,
          country: stepData.mailingAddress.country,
        },
      });
    }

    if (stepData.employerAddress) {
      await prisma.additionalHolderAddress.create({
        data: {
          profileId,
          addressType: "employer",
          addressLine: stepData.employerAddress.addressLine,
          city: stepData.employerAddress.city,
          stateProvince: stepData.employerAddress.stateProvince,
          zipPostalCode: stepData.employerAddress.zipPostalCode,
          country: stepData.employerAddress.country,
        },
      });
    }

    // Update phones
    await prisma.additionalHolderPhone.deleteMany({
      where: { profileId },
    });

    if (stepData.homePhone) {
      await prisma.additionalHolderPhone.create({
        data: {
          profileId,
          phoneType: "home",
          phoneNumber: stepData.homePhone,
        },
      });
    }

    if (stepData.businessPhone) {
      await prisma.additionalHolderPhone.create({
        data: {
          profileId,
          phoneType: "business",
          phoneNumber: stepData.businessPhone,
        },
      });
    }

    if (stepData.mobilePhone) {
      await prisma.additionalHolderPhone.create({
        data: {
          profileId,
          phoneType: "mobile",
          phoneNumber: stepData.mobilePhone,
        },
      });
    }

    // Update investment knowledge
    await prisma.additionalHolderInvestmentKnowledge.deleteMany({
      where: { profileId },
    });

    if (stepData.investmentKnowledge && stepData.investmentKnowledge.length > 0) {
      await prisma.additionalHolderInvestmentKnowledge.createMany({
        data: stepData.investmentKnowledge.map((inv: any) => ({
          profileId,
          investmentType: inv.investmentType,
          knowledgeLevel: inv.knowledgeLevel,
          sinceYear: inv.sinceYear,
        })),
      });
    }

    await this.markPageCompleted(profileId, 1);
    return await this.getAdditionalHolderById(profileId, true);
  }

  /**
   * Update Step 2
   */
  private async updateStep2(profileId: string, stepData: any) {
    // Update profile
    await prisma.additionalHolderProfile.update({
      where: { id: profileId },
      data: {
        annualIncomeFrom: stepData.annualIncome?.from,
        annualIncomeTo: stepData.annualIncome?.to,
        netWorthFrom: stepData.netWorth?.from,
        netWorthTo: stepData.netWorth?.to,
        liquidNetWorthFrom: stepData.liquidNetWorth?.from,
        liquidNetWorthTo: stepData.liquidNetWorth?.to,
        taxBracket: stepData.taxBracket,
        yearsOfInvestmentExperience: stepData.yearsOfInvestmentExperience,
        employeeOfThisBrokerDealer: stepData.employeeOfThisBrokerDealer,
        relatedToEmployeeAtThisBrokerDealer: stepData.relatedToEmployeeAtThisBrokerDealer,
        employeeName: stepData.employeeName,
        relationship: stepData.relationship,
        employeeOfAnotherBrokerDealer: stepData.employeeOfAnotherBrokerDealer,
        brokerDealerName: stepData.brokerDealerName,
        relatedToEmployeeAtAnotherBrokerDealer: stepData.relatedToEmployeeAtAnotherBrokerDealer,
        brokerDealerName2: stepData.brokerDealerName2,
        employeeName2: stepData.employeeName2,
        relationship2: stepData.relationship2,
        maintainingOtherBrokerageAccounts: stepData.maintainingOtherBrokerageAccounts,
        withWhatFirms: stepData.withWhatFirms,
        affiliatedWithExchangeOrFinra: stepData.affiliatedWithExchangeOrFinra,
        whatIsTheAffiliation: stepData.whatIsTheAffiliation,
        seniorOfficerDirectorShareholder: stepData.seniorOfficerDirectorShareholder,
        companyNames: stepData.companyNames,
        signature: stepData.signature,
        printedName: stepData.printedName,
        signatureDate: stepData.signatureDate ? new Date(stepData.signatureDate) : null,
      },
    });

    // Update investment knowledge (can be updated in step 2 as well)
    if (stepData.investmentKnowledge && stepData.investmentKnowledge.length > 0) {
      await prisma.additionalHolderInvestmentKnowledge.deleteMany({
        where: { profileId },
      });

      await prisma.additionalHolderInvestmentKnowledge.createMany({
        data: stepData.investmentKnowledge.map((inv: any) => ({
          profileId,
          investmentType: inv.investmentType,
          knowledgeLevel: inv.knowledgeLevel,
          sinceYear: inv.sinceYear,
        })),
      });
    }

    // Update government IDs
    await prisma.additionalHolderGovernmentId.deleteMany({
      where: { profileId },
    });

    if (stepData.governmentIds && stepData.governmentIds.length > 0) {
      await prisma.additionalHolderGovernmentId.createMany({
        data: stepData.governmentIds.map((govId: any) => ({
          profileId,
          type: govId.type,
          idNumber: govId.idNumber,
          countryOfIssue: govId.countryOfIssue,
          dateOfIssue: govId.dateOfIssue ? new Date(govId.dateOfIssue) : null,
          dateOfExpiration: govId.dateOfExpiration ? new Date(govId.dateOfExpiration) : null,
        })),
      });
    }

    await this.markPageCompleted(profileId, 2);
    return await this.getAdditionalHolderById(profileId, true);
  }

  /**
   * Submit additional holder for review
   */
  async submitAdditionalHolder(profileId: string) {
    const profile = await this.getAdditionalHolderById(profileId, false);

    if (profile.status !== "draft") {
      throw new ConflictError("Additional Holder Profile is not in draft status");
    }

    // Validate profile completeness
    await validationService.validateCompleteAdditionalHolder(profileId);

    return await prisma.additionalHolderProfile.update({
      where: { id: profileId },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });
  }

  /**
   * Get additional holders by user with pagination and filtering
   */
  async getAdditionalHoldersByUser(
    userId: string | undefined,
    clientId: string | undefined,
    filters: { status?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: PAGINATION.DEFAULT_LIMIT }
  ) {
    if (!userId && !clientId) {
      throw new ValidationError("Either userId or clientId must be provided");
    }

    const where: Prisma.AdditionalHolderProfileWhereInput = {
      ...(clientId ? { clientId } : userId ? { userId } : {}),
      ...(filters.status && { status: filters.status as ProfileStatus }),
    };

    const [profiles, total] = await Promise.all([
      prisma.additionalHolderProfile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          addresses: true,
          phones: true,
        },
      }),
      prisma.additionalHolderProfile.count({ where }),
    ]);

    return {
      profiles: profiles,
      pagination: calculatePagination(total, pagination.page, pagination.limit),
    };
  }

  /**
   * Get additional holder progress
   */
  async getAdditionalHolderProgress(profileId: string) {
    const profile = await this.getAdditionalHolderById(profileId, false);
    return {
      lastCompletedPage: profile.lastCompletedPage,
      pageCompletionStatus: profile.pageCompletionStatus,
      status: profile.status,
    };
  }

  /**
   * Generate PDF via n8n webhook
   */
  /**
   * Format additional holder data for n8n PDF generation
   */
  formatAdditionalHolderForN8N(profile: any): any {
    const result: any = {
      form_type: "additional_holder",
      form_id: "REI-Additional-Holder",
      profile_id: profile.id,
      status: profile.status,
      fields: {},
      conditional_fields: {},
      field_metadata: {}
    };

    // Helper to format date
    const formatDate = (value: any) => {
      if (!value) return null;
      try {
        return new Date(value).toISOString().split('T')[0];
      } catch {
        return value;
      }
    };

    // Add all additional holder fields - basic structure
    // Handle checkbox fields with sub-values similar to other forms
    // When checkbox array includes "Other", set checkbox_name_other: true and include sub-value separately

    return result;
  }

  async generatePdf(profileId: string) {
    const profile = await this.getAdditionalHolderById(profileId, true);

    // Format the profile data for n8n
    const formattedData = this.formatAdditionalHolderForN8N(profile);

    const webhookUrl = "https://n8n.srv891599.hstgr.cloud/webhook/137ba27b-814e-4430-812f-c61979d0c086";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.statusText}`);
    }

    return { success: true };
  }

  /**
   * Mark a page as completed and update progress metadata
   */
  private async markPageCompleted(profileId: string, pageNumber: number) {
    const existing = await prisma.additionalHolderProfile.findUnique({
      where: { id: profileId },
      select: {
        lastCompletedPage: true,
        pageCompletionStatus: true,
      },
    });

    const statusMap = (existing?.pageCompletionStatus as any) || {};
    statusMap[String(pageNumber)] = {
      completed: true,
      updatedAt: new Date().toISOString(),
    };

    const nextCompleted = Math.max(existing?.lastCompletedPage || 0, pageNumber);

    await prisma.additionalHolderProfile.update({
      where: { id: profileId },
      data: {
        lastCompletedPage: nextCompleted,
        pageCompletionStatus: statusMap,
      },
    });
  }
}

export const additionalHolderService = new AdditionalHolderService();

