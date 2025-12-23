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
    const { accountHolderService } = await import("./accountHolderService");
    
    // Find or create primary account holder
    const existingHolder = await prisma.accountHolder.findFirst({
      where: {
        profileId,
        holderType: "primary",
      },
    });

    if (existingHolder) {
      await accountHolderService.updateAccountHolder(existingHolder.id, stepData);
    } else {
      await accountHolderService.createAccountHolder(profileId, "primary", stepData);
    }

    await this.markStepCompleted(profileId, 3);
    return this.getProfileById(profileId, true);
  }

  /**
   * Update Step 4 (Secondary Account Holder) - delegated to AccountHolderService
   */
  private async updateStep4(profileId: string, stepData: any) {
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
   * Format investor profile data for n8n PDF generation
   */
  formatProfileForN8N(profile: any): any {
    const result: any = {
      form_type: "investor_profile",
      form_id: "REI-Investor-Profile",
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

    // Step 1: Basic Information
    result.fields.rr_name = { value: profile.rrName || null, label: "RR Name", type: "text" };
    result.fields.rr_no = { value: profile.rrNo || null, label: "RR No.", type: "text" };
    result.fields.customer_names = { value: profile.customerNames || null, label: "Customer Names(s)", type: "text" };
    result.fields.account_no = { value: profile.accountNo || null, label: "Account No.", type: "text" };
    
    // Account Types - handle "Other" checkbox
    const accountTypes = (profile.accountTypes || []).map((at: any) => at.accountType);
    if (accountTypes.length > 0) {
      // Check if "Other" is in the array
      const hasOther = accountTypes.includes("Other");
      if (hasOther) {
        // Set other checkbox to true
        result.fields.account_types_other = { value: true, type: "checkbox", is_checked: true, label: "Other" };
        // Include other text as separate field
        if (profile.otherAccountTypeText) {
          result.fields.other_account_type_text = { value: profile.otherAccountTypeText, type: "text", label: "Other Account Type Text" };
        }
        // Include other account types (excluding "Other")
        const otherTypes = accountTypes.filter((t: string) => t !== "Other");
        if (otherTypes.length > 0) {
          result.fields.account_types = { value: otherTypes, type: "array", label: "Account Types" };
        }
      } else {
        result.fields.account_types = { value: accountTypes, type: "array", label: "Account Types" };
      }
    }

    // Step 2: Source of Funds - handle "Other" checkbox
    const patriotActInfo = profile.patriotActInformation;
    if (patriotActInfo) {
      const sourceOfFunds = patriotActInfo.initialSourceOfFunds || [];
      if (sourceOfFunds.length > 0) {
        const hasOther = sourceOfFunds.includes("Other");
        if (hasOther) {
          // Set other checkbox to true
          result.fields.initial_source_of_funds_other = { value: true, type: "checkbox", is_checked: true, label: "Other" };
          // Include other text as separate field
          if (patriotActInfo.otherSourceOfFundsText) {
            result.fields.other_source_of_funds_text = { value: patriotActInfo.otherSourceOfFundsText, type: "text", label: "Other Source of Funds Text" };
          }
          // Include other sources (excluding "Other")
          const otherSources = sourceOfFunds.filter((s: string) => s !== "Other");
          if (otherSources.length > 0) {
            result.fields.initial_source_of_funds = { value: otherSources, type: "array", label: "Initial Source of Funds" };
          }
        } else {
          result.fields.initial_source_of_funds = { value: sourceOfFunds, type: "array", label: "Initial Source of Funds" };
        }
      }
    }

    // Additional designations
    if (profile.additionalDesignations && profile.additionalDesignations.length > 0) {
      result.fields.additional_designations = {
        value: profile.additionalDesignations.map((ad: any) => ad.designationType),
        type: "array",
        label: "Additional Designations"
      };
    }

    // Add more fields as needed (account holders, etc.)
    // This is a basic implementation - can be expanded

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

