// @ts-nocheck
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors";
import { validationService } from "./validationService";
import { calculatePagination, PaginationInfo } from "../utils/responses";
import { PAGINATION } from "../config/constants";
import { config } from "../config/env";


type ProfileStatus = "draft" | "submitted" | "approved" | "rejected";

export class InvestorProfileService {
  /**
   * Create a new investor profile or update existing profile
   * Ensures only one profile exists per user/client - always updates if profile exists
   */
  async createProfile(userId: string | undefined, clientId: string | undefined, step1Data: any) {
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

    const existingProfile = await prisma.investorProfile.findFirst({
      where: whereClause,
      orderBy: {
        createdAt: "desc", // Get the most recent profile
      },
    });

    // If profile exists, update it instead of creating a new one
    // Reset status to draft when updating
    if (existingProfile) {
      // Reset status to draft if it was submitted/approved/rejected
      if (existingProfile.status !== "draft") {
        await prisma.investorProfile.update({
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
        await validationService.validateStep1(step1Data);

        const now = new Date();

        // Create profile
        const profile = await tx.investorProfile.create({
          data: {
            userId: userId || null,
            clientId: clientId || null,
            rrName: step1Data.rrName,
            rrNo: step1Data.rrNo,
            customerNames: step1Data.customerNames,
            accountNo: step1Data.accountNo,
            retirementAccount: step1Data.retirementAccount || false,
            retailAccount: step1Data.retailAccount || false,
            otherAccountTypeText: step1Data.otherAccountTypeText,
            status: "draft",
            lastCompletedStep: 1,
            stepCompletionStatus: {
              "1": { completed: true, updatedAt: now.toISOString() },
            },
          },
        });

        // Create account types
        if (step1Data.accountTypes && step1Data.accountTypes.length > 0) {
          await tx.investorProfileAccountType.createMany({
            data: step1Data.accountTypes.map((type: string) => ({
              profileId: profile.id,
              accountType: type as any,
            })),
          });
        }

        // Create additional designations
        if (step1Data.additionalDesignations && step1Data.additionalDesignations.length > 0) {
          await tx.investorProfileAdditionalDesignation.createMany({
            data: step1Data.additionalDesignations.map((designation: string) => ({
              profileId: profile.id,
              designationType: designation as any,
            })),
          });
        }

        // Create trust information if trust is selected
        if (step1Data.trustInformation) {
          await tx.trustInformation.create({
            data: {
              profileId: profile.id,
              establishmentDate: step1Data.trustInformation.establishmentDate
                ? new Date(step1Data.trustInformation.establishmentDate)
                : null,
              trustTypes: step1Data.trustInformation.trustTypes || [],
            },
          });
        }

        // Create joint account information if joint tenant is selected
        if (step1Data.jointAccountInformation) {
          await tx.jointAccountInformation.create({
            data: {
              profileId: profile.id,
              areAccountHoldersMarried: step1Data.jointAccountInformation.areAccountHoldersMarried as any,
              tenancyState: step1Data.jointAccountInformation.tenancyState,
              numberOfTenants: step1Data.jointAccountInformation.numberOfTenants,
              tenancyClauses: step1Data.jointAccountInformation.tenancyClauses || [],
            },
          });
        }

        // Create custodial account information if custodial is selected
        if (step1Data.custodialAccountInformation) {
          await tx.custodialAccountInformation.create({
            data: {
              profileId: profile.id,
              stateGiftGiven1: step1Data.custodialAccountInformation.stateGiftGiven1,
              dateGiftGiven1: step1Data.custodialAccountInformation.dateGiftGiven1
                ? new Date(step1Data.custodialAccountInformation.dateGiftGiven1)
                : null,
              stateGiftGiven2: step1Data.custodialAccountInformation.stateGiftGiven2,
              dateGiftGiven2: step1Data.custodialAccountInformation.dateGiftGiven2
                ? new Date(step1Data.custodialAccountInformation.dateGiftGiven2)
                : null,
            },
          });
        }

        // Create transfer on death information if TOD is selected
        if (step1Data.transferOnDeathInformation) {
          await tx.transferOnDeathInformation.create({
            data: {
              profileId: profile.id,
              individualAgreementDate: step1Data.transferOnDeathInformation.individualAgreementDate
                ? new Date(step1Data.transferOnDeathInformation.individualAgreementDate)
                : null,
              jointAgreementDate: step1Data.transferOnDeathInformation.jointAgreementDate
                ? new Date(step1Data.transferOnDeathInformation.jointAgreementDate)
                : null,
            },
          });
        }

        // Return the profile ID - we'll fetch the full profile outside the transaction
        // to avoid timeout issues with complex queries
        return profile.id;
      },
      {
        maxWait: 10000, // Maximum time to wait for a transaction slot (10 seconds)
        timeout: 15000, // Maximum time the transaction can run (15 seconds)
      }
    ).then(async (profileId) => {
      // Fetch the complete profile outside the transaction
      return await this.getProfileById(profileId, true);
    });
  }

  /**
   * Get profile by ID with optional relations (using transaction client)
   */
  private async getProfileByIdWithClient(
    client: TransactionClient | PrismaClient,
    profileId: string,
    includeRelations: boolean = true
  ) {
    const profile = await (client as any).investorProfile.findUnique({
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
          },
          investmentObjectives: true,
          investmentValues: true,
          trustedContact: true,
          signatures: true,
        }
        : undefined,
    });

    if (!profile) {
      throw new NotFoundError("Profile", profileId);
    }

    return profile;
  }

  /**
   * Get profile by ID with optional relations
   */
  async getProfileById(profileId: string, includeRelations: boolean = true) {
    return await this.getProfileByIdWithClient(prisma, profileId, includeRelations);
  }

  /**
   * Update profile
   * Automatically resets status to draft if profile was submitted/approved/rejected
   */
  async updateProfile(profileId: string, updates: any) {
    const profile = await this.getProfileById(profileId, false);

    // Reset status to draft if it was submitted/approved/rejected
    const statusUpdate = profile.status !== "draft" ? { status: "draft" as const } : {};

    return await prisma.investorProfile.update({
      where: { id: profileId },
      data: {
        rrName: updates.rrName,
        rrNo: updates.rrNo,
        customerNames: updates.customerNames,
        accountNo: updates.accountNo,
        retirementAccount: updates.retirementAccount,
        retailAccount: updates.retailAccount,
        otherAccountTypeText: updates.otherAccountTypeText,
        ...statusUpdate,
      },
    });
  }

  /**
   * Update specific step
   * Automatically resets status to draft if profile was submitted/approved/rejected
   */
  async updateStep(profileId: string, stepNumber: number, stepData: any) {
    const profile = await this.getProfileById(profileId, false);

    // Reset status to draft if it was submitted/approved/rejected
    if (profile.status !== "draft") {
      await prisma.investorProfile.update({
        where: { id: profileId },
        data: { status: "draft" },
      });
    }

    switch (stepNumber) {
      case 1:
        await validationService.validateStep1(stepData);
        return await this.updateStep1(profileId, stepData);
      case 2:
        await validationService.validateStep2(stepData);
        return await this.updateStep2(profileId, stepData);
      case 3:
        await validationService.validateStep3(stepData);
        return await this.updateStep3(profileId, stepData);
      case 4:
        await validationService.validateStep4(stepData);
        return await this.updateStep4(profileId, stepData);
      case 5:
        await validationService.validateStep5(stepData);
        return await this.updateStep5(profileId, stepData);
      case 6:
        await validationService.validateStep6(stepData);
        return await this.updateStep6(profileId, stepData);
      case 7:
        await validationService.validateStep7(stepData);
        return await this.updateStep7(profileId, stepData);
      default:
        throw new ValidationError(`Invalid step number: ${stepNumber}`);
    }
  }

  /**
   * Update Step 1 - Simplified without transactions
   */
  private async updateStep1(profileId: string, stepData: any) {
    // Update profile
    await prisma.investorProfile.update({
      where: { id: profileId },
      data: {
        rrName: stepData.rrName,
        rrNo: stepData.rrNo,
        customerNames: stepData.customerNames,
        accountNo: stepData.accountNo,
        retirementAccount: stepData.retirementAccount || false,
        retailAccount: stepData.retailAccount || false,
        otherAccountTypeText: stepData.otherAccountTypeText,
      },
    });

    // Update account types
    await prisma.investorProfileAccountType.deleteMany({
      where: { profileId },
    });
    if (stepData.accountTypes && stepData.accountTypes.length > 0) {
      await prisma.investorProfileAccountType.createMany({
        data: stepData.accountTypes.map((type: string) => ({
          profileId,
          accountType: type as any,
        })),
      });
    }

    // Update additional designations
    await prisma.investorProfileAdditionalDesignation.deleteMany({
      where: { profileId },
    });
    if (stepData.additionalDesignations && stepData.additionalDesignations.length > 0) {
      await prisma.investorProfileAdditionalDesignation.createMany({
        data: stepData.additionalDesignations.map((designation: string) => ({
          profileId,
          designationType: designation as any,
        })),
      });
    }

    // Update trust information
    if (stepData.trustInformation) {
      await prisma.trustInformation.upsert({
        where: { profileId },
        create: {
          profileId,
          establishmentDate: stepData.trustInformation.establishmentDate
            ? new Date(stepData.trustInformation.establishmentDate)
            : null,
          trustTypes: stepData.trustInformation.trustTypes || [],
        },
        update: {
          establishmentDate: stepData.trustInformation.establishmentDate
            ? new Date(stepData.trustInformation.establishmentDate)
            : null,
          trustTypes: stepData.trustInformation.trustTypes || [],
        },
      });
    } else {
      await prisma.trustInformation.deleteMany({
        where: { profileId },
      });
    }

    // Update joint account information
    if (stepData.jointAccountInformation) {
      await prisma.jointAccountInformation.upsert({
        where: { profileId },
        create: {
          profileId,
          areAccountHoldersMarried: stepData.jointAccountInformation.areAccountHoldersMarried as any,
          tenancyState: stepData.jointAccountInformation.tenancyState,
          numberOfTenants: stepData.jointAccountInformation.numberOfTenants,
          tenancyClauses: stepData.jointAccountInformation.tenancyClauses || [],
        },
        update: {
          areAccountHoldersMarried: stepData.jointAccountInformation.areAccountHoldersMarried as any,
          tenancyState: stepData.jointAccountInformation.tenancyState,
          numberOfTenants: stepData.jointAccountInformation.numberOfTenants,
          tenancyClauses: stepData.jointAccountInformation.tenancyClauses || [],
        },
      });
    } else {
      await prisma.jointAccountInformation.deleteMany({
        where: { profileId },
      });
    }

    // Update custodial account information
    if (stepData.custodialAccountInformation) {
      await prisma.custodialAccountInformation.upsert({
        where: { profileId },
        create: {
          profileId,
          stateGiftGiven1: stepData.custodialAccountInformation.stateGiftGiven1,
          dateGiftGiven1: stepData.custodialAccountInformation.dateGiftGiven1
            ? new Date(stepData.custodialAccountInformation.dateGiftGiven1)
            : null,
          stateGiftGiven2: stepData.custodialAccountInformation.stateGiftGiven2,
          dateGiftGiven2: stepData.custodialAccountInformation.dateGiftGiven2
            ? new Date(stepData.custodialAccountInformation.dateGiftGiven2)
            : null,
        },
        update: {
          stateGiftGiven1: stepData.custodialAccountInformation.stateGiftGiven1,
          dateGiftGiven1: stepData.custodialAccountInformation.dateGiftGiven1
            ? new Date(stepData.custodialAccountInformation.dateGiftGiven1)
            : null,
          stateGiftGiven2: stepData.custodialAccountInformation.stateGiftGiven2,
          dateGiftGiven2: stepData.custodialAccountInformation.dateGiftGiven2
            ? new Date(stepData.custodialAccountInformation.dateGiftGiven2)
            : null,
        },
      });
    } else {
      await prisma.custodialAccountInformation.deleteMany({
        where: { profileId },
      });
    }

    // Update transfer on death information
    if (stepData.transferOnDeathInformation) {
      await prisma.transferOnDeathInformation.upsert({
        where: { profileId },
        create: {
          profileId,
          individualAgreementDate: stepData.transferOnDeathInformation.individualAgreementDate
            ? new Date(stepData.transferOnDeathInformation.individualAgreementDate)
            : null,
          jointAgreementDate: stepData.transferOnDeathInformation.jointAgreementDate
            ? new Date(stepData.transferOnDeathInformation.jointAgreementDate)
            : null,
        },
        update: {
          individualAgreementDate: stepData.transferOnDeathInformation.individualAgreementDate
            ? new Date(stepData.transferOnDeathInformation.individualAgreementDate)
            : null,
          jointAgreementDate: stepData.transferOnDeathInformation.jointAgreementDate
            ? new Date(stepData.transferOnDeathInformation.jointAgreementDate)
            : null,
        },
      });
    } else {
      await prisma.transferOnDeathInformation.deleteMany({
        where: { profileId },
      });
    }

    await this.markStepCompleted(profileId, 1);
    return await this.getProfileById(profileId, true);
  }

  /**
   * Update Step 2 - Simplified without transactions
   */
  private async updateStep2(profileId: string, stepData: any) {
    await prisma.patriotActInformation.upsert({
      where: { profileId },
      create: {
        profileId,
        initialSourceOfFunds: stepData.initialSourceOfFunds || [],
        otherSourceOfFundsText: stepData.otherSourceOfFundsText,
      },
      update: {
        initialSourceOfFunds: stepData.initialSourceOfFunds || [],
        otherSourceOfFundsText: stepData.otherSourceOfFundsText,
      },
    });

    await this.markStepCompleted(profileId, 2);
    return await this.getProfileById(profileId, true);
  }

  /**
   * Update Step 3 (Primary Account Holder) - delegated to AccountHolderService
   */
  private async updateStep3(profileId: string, stepData: any) {
    console.log("[DEBUG updateStep3] Called with profileId:", profileId);
    console.log("[DEBUG updateStep3] stepData.name:", stepData.name, "personEntity:", stepData.personEntity);

    const { accountHolderService } = await import("./accountHolderService");

    // Find or create primary account holder
    const existingHolder = await prisma.accountHolder.findFirst({
      where: {
        profileId,
        holderType: "primary",
      },
    });

    console.log("[DEBUG updateStep3] existingHolder:", existingHolder?.id || "none");

    if (existingHolder) {
      console.log("[DEBUG updateStep3] Updating existing holder");
      await accountHolderService.updateAccountHolder(existingHolder.id, stepData);
    } else {
      console.log("[DEBUG updateStep3] Creating new holder");
      await accountHolderService.createAccountHolder(profileId, "primary", stepData);
    }

    console.log("[DEBUG updateStep3] Account holder created/updated, marking step completed");
    await this.markStepCompleted(profileId, 3);
    return this.getProfileById(profileId, true);
  }

  /**
   * Update Step 4 (Secondary Account Holder) - delegated to AccountHolderService
   */
  private async updateStep4(profileId: string, stepData: any) {
    console.log('[updateStep4] Called for profile:', profileId);
    console.log('[updateStep4] Received stepData:', JSON.stringify(stepData, null, 2));
    const { accountHolderService } = await import("./accountHolderService");

    // Find or create secondary account holder
    const existingHolder = await prisma.accountHolder.findFirst({
      where: {
        profileId,
        holderType: "secondary",
      },
    });

    if (existingHolder) {
      await accountHolderService.updateAccountHolder(existingHolder.id, stepData);
    } else {
      await accountHolderService.createAccountHolder(profileId, "secondary", stepData);
    }

    await this.markStepCompleted(profileId, 4);
    return this.getProfileById(profileId, true);
  }

  /**
   * Update Step 5 - Simplified without transactions
   */
  private async updateStep5(profileId: string, stepData: any) {
    console.log('[updateStep5] Called for profile:', profileId);
    console.log('[updateStep5] Received stepData:', JSON.stringify(stepData, null, 2));
    // Update investment objectives
    await prisma.investmentObjectives.upsert({
      where: { profileId },
      create: {
        profileId,
        riskExposure: stepData.riskExposure || [],
        accountInvestmentObjectives: stepData.accountInvestmentObjectives || [],
        seeAttachedStatement: stepData.seeAttachedStatement || false,
        timeHorizonFrom: stepData.timeHorizonFrom,
        timeHorizonTo: stepData.timeHorizonTo,
        liquidityNeeds: stepData.liquidityNeeds || [],
      },
      update: {
        riskExposure: stepData.riskExposure || [],
        accountInvestmentObjectives: stepData.accountInvestmentObjectives || [],
        seeAttachedStatement: stepData.seeAttachedStatement || false,
        timeHorizonFrom: stepData.timeHorizonFrom,
        timeHorizonTo: stepData.timeHorizonTo,
        liquidityNeeds: stepData.liquidityNeeds || [],
      },
    });

    // Update investment values
    if (stepData.investmentValues) {
      await prisma.investmentValue.deleteMany({
        where: { profileId },
      });
      await prisma.investmentValue.createMany({
        data: stepData.investmentValues.map((iv: any) => ({
          profileId,
          investmentType: iv.investmentType,
          value: iv.value,
        })),
      });
    }

    await this.markStepCompleted(profileId, 5);
    return await this.getProfileById(profileId, true);
  }

  /**
   * Update Step 6 - Simplified without transactions
   */
  private async updateStep6(profileId: string, stepData: any) {
    await prisma.trustedContact.upsert({
      where: { profileId },
      create: {
        profileId,
        declineToProvide: stepData.declineToProvide || false,
        name: stepData.name,
        email: stepData.email,
        homePhone: stepData.homePhone,
        businessPhone: stepData.businessPhone,
        mobilePhone: stepData.mobilePhone,
        mailingAddress: stepData.mailingAddress,
        city: stepData.city,
        stateProvince: stepData.stateProvince,
        zipPostalCode: stepData.zipPostalCode,
        country: stepData.country,
      },
      update: {
        declineToProvide: stepData.declineToProvide || false,
        name: stepData.name,
        email: stepData.email,
        homePhone: stepData.homePhone,
        businessPhone: stepData.businessPhone,
        mobilePhone: stepData.mobilePhone,
        mailingAddress: stepData.mailingAddress,
        city: stepData.city,
        stateProvince: stepData.stateProvince,
        zipPostalCode: stepData.zipPostalCode,
        country: stepData.country,
      },
    });

    await this.markStepCompleted(profileId, 6);
    return await this.getProfileById(profileId, true);
  }

  /**
   * Update Step 7 - Simplified without transactions
   */
  private async updateStep7(profileId: string, stepData: any) {
    if (stepData.signatures && stepData.signatures.length > 0) {
      // Delete existing signatures
      await prisma.signature.deleteMany({
        where: { profileId },
      });

      // Create new signatures
      await prisma.signature.createMany({
        data: stepData.signatures.map((sig: any) => ({
          profileId,
          signatureType: sig.signatureType,
          signatureData: sig.signatureData,
          printedName: sig.printedName,
          signatureDate: new Date(sig.signatureDate),
        })),
      });
    }

    await this.markStepCompleted(profileId, 7);
    return await this.getProfileById(profileId, true);
  }

  /**
   * Submit profile for review
   */
  async submitProfile(profileId: string) {
    const profile = await this.getProfileById(profileId, false);

    if (profile.status !== "draft") {
      throw new ConflictError("Profile is not in draft status");
    }

    // Validate profile completeness
    await validationService.validateCompleteProfile(profileId);

    return await prisma.investorProfile.update({
      where: { id: profileId },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });
  }

  /**
   * Delete profile (soft delete - can be implemented later)
   */
  async deleteProfile(profileId: string) {
    const profile = await this.getProfileById(profileId, false);

    if (profile.status === "submitted" || profile.status === "approved") {
      throw new ConflictError("Cannot delete a submitted or approved profile");
    }

    return await prisma.investorProfile.delete({
      where: { id: profileId },
    });
  }

  /**
   * Mark a step as completed and update progress metadata - Simplified without transactions
   */
  private async markStepCompleted(
    profileId: string,
    stepNumber: number
  ) {
    const existing = await prisma.investorProfile.findUnique({
      where: { id: profileId },
      select: {
        lastCompletedStep: true,
        stepCompletionStatus: true,
      },
    });

    const statusMap = (existing?.stepCompletionStatus as any) || {};
    statusMap[String(stepNumber)] = {
      completed: true,
      updatedAt: new Date().toISOString(),
    };

    const nextCompleted = Math.max(existing?.lastCompletedStep || 0, stepNumber);

    await prisma.investorProfile.update({
      where: { id: profileId },
      data: {
        lastCompletedStep: nextCompleted,
        stepCompletionStatus: statusMap,
      },
    });
  }

  /**
   * Get profile progress
   */
  async getProfileProgress(profileId: string) {
    const profile = await prisma.investorProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        status: true,
        lastCompletedStep: true,
        stepCompletionStatus: true,
      },
    });

    if (!profile) {
      throw new NotFoundError("Profile", profileId);
    }

    return profile;
  }

  /**
   * Get the user's/client's profile (only one profile per user/client)
   * Returns the most recent profile if multiple exist (shouldn't happen with new logic)
   */
  async getProfileByUser(userId: string | undefined, clientId: string | undefined) {
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

    const profile = await prisma.investorProfile.findFirst({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        accountTypes: true,
        accountHolders: {
          where: { holderType: "primary" },
          select: { name: true },
        },
      },
    });

    return profile;
  }

  /**
   * Get profiles by user - returns array with at most one profile
   * Maintains compatibility with existing API but ensures only one profile per user
   */
  async getProfilesByUser(
    userId: string | undefined,
    clientId: string | undefined,
    filters: {
      status?: ProfileStatus;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = {
      page: PAGINATION.DEFAULT_PAGE,
      limit: PAGINATION.DEFAULT_LIMIT,
    }
  ) {
    if (!userId && !clientId) {
      throw new ValidationError("Either userId or clientId must be provided");
    }

    // Since each user/client should only have one profile, we get the single profile
    const profile = await this.getProfileByUser(userId, clientId);

    // Apply filters if profile exists
    let filteredProfile = profile;
    if (profile) {
      if (filters.status && profile.status !== filters.status) {
        filteredProfile = null;
      }
      if (filters.search && filteredProfile) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          profile.customerNames?.toLowerCase().includes(searchLower) ||
          profile.accountNo?.toLowerCase().includes(searchLower) ||
          profile.rrName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          filteredProfile = null;
        }
      }
    }

    // Return as array for API compatibility
    const profiles = filteredProfile ? [filteredProfile] : [];

    return {
      profiles,
      pagination: calculatePagination(1, 1, profiles.length),
    };
  }

  /**
   * Format investor profile data for n8n PDF generation - includes ALL form fields
   */
  formatProfileForN8N(profile: any): any {
    const result: any = {
      form_type: "investor_profile",
      form_id: "REI-Investor-Profile",
      profile_id: profile.id,
      status: profile.status,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
      submitted_at: profile.submittedAt,
      fields: {},
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

    // Helper to format currency
    const formatCurrency = (value: any) => {
      if (!value) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    // ============================================
    // STEP 1: Account Registration
    // ============================================
    result.fields.rr_name = profile.rrName || null;
    result.fields.rr_no = profile.rrNo || null;
    result.fields.customer_names = profile.customerNames || null;
    result.fields.account_no = profile.accountNo || null;
    result.fields.retirement_account = profile.retirementAccount || false;
    result.fields.retail_account = profile.retailAccount || false;
    result.fields.other_account_type_text = profile.otherAccountTypeText || null;

    // Account Types
    const accountTypes = (profile.accountTypes || []).map((at: any) => at.accountType);
    result.fields.account_types = accountTypes;

    // Additional Designations
    const additionalDesignations = (profile.additionalDesignations || []).map((ad: any) => ad.designationType);
    result.fields.additional_designations = additionalDesignations;

    // Trust Information
    const trustInfo = profile.trustInformation;
    if (trustInfo) {
      result.fields.trust_establishment_date = formatDate(trustInfo.establishmentDate);
      result.fields.trust_types = trustInfo.trustTypes || [];
    }

    // Joint Account Information
    const jointInfo = profile.jointAccountInformation;
    if (jointInfo) {
      result.fields.are_account_holders_married = jointInfo.areAccountHoldersMarried || null;
      result.fields.tenancy_state = jointInfo.tenancyState || null;
      result.fields.number_of_tenants = jointInfo.numberOfTenants || null;
      result.fields.tenancy_clauses = jointInfo.tenancyClauses || [];
    }

    // Custodial Account Information
    const custodialInfo = profile.custodialAccountInformation;
    if (custodialInfo) {
      result.fields.state_gift_given_1 = custodialInfo.stateGiftGiven1 || null;
      result.fields.date_gift_given_1 = formatDate(custodialInfo.dateGiftGiven1);
      result.fields.state_gift_given_2 = custodialInfo.stateGiftGiven2 || null;
      result.fields.date_gift_given_2 = formatDate(custodialInfo.dateGiftGiven2);
    }

    // Transfer on Death Information
    const todInfo = profile.transferOnDeathInformation;
    if (todInfo) {
      result.fields.transfer_on_death_individual_agreement_date = formatDate(todInfo.individualAgreementDate);
      result.fields.transfer_on_death_joint_agreement_date = formatDate(todInfo.jointAgreementDate);
    }

    // ============================================
    // STEP 2: Patriot Act Information
    // ============================================
    const patriotActInfo = profile.patriotActInformation;
    if (patriotActInfo) {
      result.fields.initial_source_of_funds = patriotActInfo.initialSourceOfFunds || [];
      result.fields.other_source_of_funds_text = patriotActInfo.otherSourceOfFundsText || null;
    }

    // ============================================
    // STEP 3 & 4: Account Holders
    // ============================================
    const formatAccountHolder = (holder: any, prefix: string) => {
      if (!holder) return;

      // Basic Info
      result.fields[`${prefix}_name`] = holder.name || null;
      result.fields[`${prefix}_email`] = holder.email || null;
      result.fields[`${prefix}_person_entity`] = holder.personEntity || null;
      result.fields[`${prefix}_ssn`] = holder.ssn || null;
      result.fields[`${prefix}_ein`] = holder.ein || null;
      result.fields[`${prefix}_yes_no_box`] = holder.yesNoBox || null;
      result.fields[`${prefix}_date_of_birth`] = formatDate(holder.dateOfBirth);
      result.fields[`${prefix}_specified_adult`] = holder.specifiedAdult || null;
      result.fields[`${prefix}_primary_citizenship`] = holder.primaryCitizenship || null;
      result.fields[`${prefix}_additional_citizenship`] = holder.additionalCitizenship || null;
      result.fields[`${prefix}_gender`] = holder.gender || null;
      result.fields[`${prefix}_general_investment_knowledge`] = holder.generalInvestmentKnowledge || null;

      // Marital Statuses
      const maritalStatuses = (holder.maritalStatuses || []).map((ms: any) => ms.maritalStatus);
      result.fields[`${prefix}_marital_status`] = maritalStatuses;

      // Employment Affiliations
      const employmentAffiliations = (holder.employmentAffiliations || []).map((ea: any) => ea.affiliation);
      result.fields[`${prefix}_employment_affiliations`] = employmentAffiliations;

      // Addresses
      const addresses = holder.addresses || [];
      addresses.forEach((addr: any) => {
        const addrType = addr.addressType; // 'legal', 'mailing', 'employer'
        result.fields[`${prefix}_${addrType}_address`] = addr.address || null;
        result.fields[`${prefix}_${addrType}_city`] = addr.city || null;
        result.fields[`${prefix}_${addrType}_state_province`] = addr.stateProvince || null;
        result.fields[`${prefix}_${addrType}_zip_postal_code`] = addr.zipPostalCode || null;
        result.fields[`${prefix}_${addrType}_country`] = addr.country || null;
        if (addrType === 'mailing') {
          result.fields[`${prefix}_mailing_same_as_legal`] = addr.mailingSameAsLegal || false;
        }
      });

      // Phones
      const phones = holder.phones || [];
      phones.forEach((phone: any) => {
        const phoneType = phone.phoneType; // 'home', 'business', 'mobile'
        result.fields[`${prefix}_${phoneType}_phone`] = phone.phoneNumber || null;
      });

      // Employment
      const employment = holder.employment;
      if (employment) {
        result.fields[`${prefix}_occupation`] = employment.occupation || null;
        result.fields[`${prefix}_years_employed`] = employment.yearsEmployed || null;
        result.fields[`${prefix}_type_of_business`] = employment.typeOfBusiness || null;
        result.fields[`${prefix}_employer_name`] = employment.employerName || null;
      }

      // Financial Information
      const financialInfo = holder.financialInformation;
      if (financialInfo) {
        result.fields[`${prefix}_annual_income_from`] = formatCurrency(financialInfo.annualIncomeFrom);
        result.fields[`${prefix}_annual_income_to`] = formatCurrency(financialInfo.annualIncomeTo);
        result.fields[`${prefix}_net_worth_from`] = formatCurrency(financialInfo.netWorthFrom);
        result.fields[`${prefix}_net_worth_to`] = formatCurrency(financialInfo.netWorthTo);
        result.fields[`${prefix}_liquid_net_worth_from`] = formatCurrency(financialInfo.liquidNetWorthFrom);
        result.fields[`${prefix}_liquid_net_worth_to`] = formatCurrency(financialInfo.liquidNetWorthTo);
        result.fields[`${prefix}_tax_bracket`] = financialInfo.taxBracket || null;
      }

      // Government Identifications
      const govIds = holder.governmentIdentifications || [];
      govIds.forEach((govId: any) => {
        const idNum = govId.idNumber; // 1 or 2
        const suffix = idNum === 1 ? '' : '_2';
        result.fields[`${prefix}_gov_id_type${suffix}`] = govId.idType || null;
        result.fields[`${prefix}_gov_id_number${suffix}`] = govId.idNumberValue || null;
        result.fields[`${prefix}_gov_id_country_of_issue${suffix}`] = govId.countryOfIssue || null;
        result.fields[`${prefix}_gov_id_date_of_issue${suffix}`] = formatDate(govId.dateOfIssue);
        result.fields[`${prefix}_gov_id_date_of_expiration${suffix}`] = formatDate(govId.dateOfExpiration);
      });

      // Investment Knowledge
      const investmentKnowledge = holder.investmentKnowledge || [];
      investmentKnowledge.forEach((ik: any) => {
        const investmentType = ik.investmentType;
        result.fields[`${prefix}_${investmentType}_knowledge`] = ik.knowledgeLevel || null;
        result.fields[`${prefix}_${investmentType}_since`] = ik.sinceYear || null;
        if (investmentType === 'other' && ik.otherInvestmentLabel) {
          result.fields[`${prefix}_other_investment_label`] = ik.otherInvestmentLabel || null;
        }
      });

      // Advisory Firm Information
      const advisoryInfo = holder.advisoryFirmInformation;
      if (advisoryInfo) {
        result.fields[`${prefix}_employee_of_advisory_firm`] = advisoryInfo.employeeOfAdvisoryFirm || null;
        result.fields[`${prefix}_related_to_employee_advisory`] = advisoryInfo.relatedToEmployeeAdvisory || null;
        result.fields[`${prefix}_employee_name_and_relationship`] = advisoryInfo.employeeNameAndRelationship || null;
      }

      // Broker Dealer Information
      const brokerInfo = holder.brokerDealerInformation;
      if (brokerInfo) {
        result.fields[`${prefix}_employee_of_broker_dealer`] = brokerInfo.employeeOfBrokerDealer || null;
        result.fields[`${prefix}_broker_dealer_name`] = brokerInfo.brokerDealerName || null;
        result.fields[`${prefix}_related_to_employee_broker_dealer`] = brokerInfo.relatedToEmployeeBrokerDealer || null;
        result.fields[`${prefix}_broker_dealer_employee_name`] = brokerInfo.brokerDealerEmployeeName || null;
        result.fields[`${prefix}_broker_dealer_employee_relationship`] = brokerInfo.brokerDealerEmployeeRelationship || null;
      }

      // Other Brokerage Accounts
      const otherBrokerageInfo = holder.otherBrokerageAccounts;
      if (otherBrokerageInfo) {
        result.fields[`${prefix}_maintaining_other_brokerage_accounts`] = otherBrokerageInfo.maintainingOtherAccounts || null;
        result.fields[`${prefix}_with_what_firms`] = otherBrokerageInfo.withWhatFirms || null;
        result.fields[`${prefix}_years_of_investment_experience`] = otherBrokerageInfo.yearsOfInvestmentExperience || null;
      }

      // Exchange/FINRA Affiliation
      const exchangeInfo = holder.exchangeFinraAffiliation;
      if (exchangeInfo) {
        result.fields[`${prefix}_affiliated_with_exchange_or_finra`] = exchangeInfo.affiliatedWithExchangeOrFinra || null;
        result.fields[`${prefix}_affiliation_details`] = exchangeInfo.affiliationDetails || null;
      }

      // Public Company Information
      const publicCompanyInfo = holder.publicCompanyInformation;
      if (publicCompanyInfo) {
        result.fields[`${prefix}_senior_officer_or_10pct_shareholder`] = publicCompanyInfo.seniorOfficerOr10PctShareholder || null;
        result.fields[`${prefix}_company_names`] = publicCompanyInfo.companyNames || null;
      }
    };

    // Format Primary Account Holder (Step 3)
    const primaryHolder = (profile.accountHolders || []).find((h: any) => h.holderType === 'primary');
    formatAccountHolder(primaryHolder, 'primary');

    // Format Secondary Account Holder (Step 4)
    const secondaryHolder = (profile.accountHolders || []).find((h: any) => h.holderType === 'secondary');
    formatAccountHolder(secondaryHolder, 'secondary');

    // ============================================
    // STEP 5: Investment Objectives
    // ============================================
    const investmentObjectives = profile.investmentObjectives;
    if (investmentObjectives) {
      result.fields.risk_exposure = investmentObjectives.riskExposure || [];
      result.fields.account_investment_objectives = investmentObjectives.accountInvestmentObjectives || [];
      result.fields.see_attached_statement = investmentObjectives.seeAttachedStatement || false;
      result.fields.time_horizon_from = investmentObjectives.timeHorizonFrom || null;
      result.fields.time_horizon_to = investmentObjectives.timeHorizonTo || null;
      result.fields.liquidity_needs = investmentObjectives.liquidityNeeds || [];
    }

    // Investment Values
    console.log('[formatProfileForN8N] profile.investmentValues:', JSON.stringify(profile.investmentValues, null, 2));
    const investmentValues = profile.investmentValues || [];
    console.log('[formatProfileForN8N] investmentValues array length:', investmentValues.length);

    let otherCount = 0;
    investmentValues.forEach((iv: any) => {
      const investmentType = iv.investmentType;
      let fieldName = `investment_${investmentType}_value`;

      if (investmentType === 'other') {
        otherCount++;
        fieldName = `investment_other_${otherCount}_value`;
      }

      console.log(`[formatProfileForN8N] Adding investment value: ${fieldName} = ${iv.value}`);
      result.fields[fieldName] = formatCurrency(iv.value);
    });

    // ============================================
    // STEP 6: Trusted Contact
    // ============================================
    const trustedContact = profile.trustedContact;
    if (trustedContact) {
      result.fields.trusted_contact_decline_to_provide = trustedContact.declineToProvide || false;
      result.fields.trusted_contact_name = trustedContact.name || null;
      result.fields.trusted_contact_email = trustedContact.email || null;
      result.fields.trusted_contact_home_phone = trustedContact.homePhone || null;
      result.fields.trusted_contact_business_phone = trustedContact.businessPhone || null;
      result.fields.trusted_contact_mobile_phone = trustedContact.mobilePhone || null;
      result.fields.trusted_contact_mailing_address = trustedContact.mailingAddress || null;
      result.fields.trusted_contact_city = trustedContact.city || null;
      result.fields.trusted_contact_state_province = trustedContact.stateProvince || null;
      result.fields.trusted_contact_zip_postal_code = trustedContact.zipPostalCode || null;
      result.fields.trusted_contact_country = trustedContact.country || null;
    }

    // ============================================
    // STEP 7: Signatures
    // ============================================
    const signatures = profile.signatures || [];
    signatures.forEach((sig: any) => {
      const sigType = sig.signatureType; // 'account_owner', 'joint_account_owner', 'financial_professional', 'supervisor_principal'
      result.fields[`${sigType}_signature`] = sig.signatureData || null;
      result.fields[`${sigType}_printed_name`] = sig.printedName || null;
      result.fields[`${sigType}_date`] = formatDate(sig.signatureDate);
    });

    return result;
  }

  /**
   * Generate PDF for a profile by sending data to n8n webhook
   */
  async generatePdf(profileId: string) {
    // Get full profile data with all relations
    const profile = await this.getProfileById(profileId, true);

    if (!profile) {
      throw new NotFoundError("Profile", profileId);
    }

    // Format the profile data for n8n
    const formattedData = this.formatProfileForN8N(profile);

    // Log the data being sent to n8n
    console.log('=== Investor Profile PDF Generation - Data being sent to n8n ===');
    console.log(JSON.stringify(formattedData, null, 2));
    console.log('=== End of n8n payload ===');

    // Send to n8n webhook
    const webhookResponse = await fetch(config.n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text().catch(() => "Unknown error");
      throw new Error(`Failed to generate PDF: ${webhookResponse.status} ${errorText}`);
    }

    return {
      message: "PDF generation request sent successfully",
      profileId: profileId,
    };
  }
}

export const investorProfileService = new InvestorProfileService();

