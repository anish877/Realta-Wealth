// @ts-nocheck
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors";
import { validationService } from "./validationService";
import { calculatePagination, PaginationInfo } from "../utils/responses";
import { PAGINATION } from "../config/constants";
import { config } from "../config/env";

type ProfileStatus = "draft" | "submitted" | "approved" | "rejected";

export class AccreditationService {
  /**
   * Create a new accreditation profile or update existing profile
   * Ensures only one profile exists per user - always updates if profile exists
   */
  async createAccreditation(userId: string | undefined, clientId: string | undefined, accreditationData: any) {
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

    const existingProfile = await prisma.accreditationProfile.findFirst({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // If profile exists, update it instead of creating a new one
    // Reset status to draft when updating
    if (existingProfile) {
      if (existingProfile.status !== "draft") {
        await prisma.accreditationProfile.update({
          where: { id: existingProfile.id },
          data: { status: "draft" },
        });
      }
      return await this.updateAccreditation(existingProfile.id, accreditationData);
    }

    // No draft exists, create a new one
    return await prisma.$transaction(
      async (tx) => {
        // Validate accreditation data
        await validationService.validateAccreditation(accreditationData);

        const now = new Date();

        // Create profile
        const profile = await tx.accreditationProfile.create({
          data: {
            userId: userId || null,
            clientId: clientId || null,
            rrName: accreditationData.rrName,
            rrNo: accreditationData.rrNo,
            customerNames: accreditationData.customerNames,
            hasJointOwner: accreditationData.hasJointOwner || false,
            accountOwnerSignature: accreditationData.accountOwnerSignature,
            accountOwnerPrintedName: accreditationData.accountOwnerPrintedName,
            accountOwnerDate: accreditationData.accountOwnerDate ? new Date(accreditationData.accountOwnerDate) : null,
            jointAccountOwnerSignature: accreditationData.jointAccountOwnerSignature,
            jointAccountOwnerPrintedName: accreditationData.jointAccountOwnerPrintedName,
            jointAccountOwnerDate: accreditationData.jointAccountOwnerDate ? new Date(accreditationData.jointAccountOwnerDate) : null,
            financialProfessionalSignature: accreditationData.financialProfessionalSignature,
            financialProfessionalPrintedName: accreditationData.financialProfessionalPrintedName,
            financialProfessionalDate: accreditationData.financialProfessionalDate ? new Date(accreditationData.financialProfessionalDate) : null,
            registeredPrincipalSignature: accreditationData.registeredPrincipalSignature,
            registeredPrincipalPrintedName: accreditationData.registeredPrincipalPrintedName,
            registeredPrincipalDate: accreditationData.registeredPrincipalDate ? new Date(accreditationData.registeredPrincipalDate) : null,
            status: "draft",
            lastCompletedPage: 1,
            pageCompletionStatus: {
              "1": { completed: true, updatedAt: now.toISOString() },
            },
          },
        });

        return profile.id;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    ).then(async (profileId) => {
      return await this.getAccreditationById(profileId, true);
    });
  }

  /**
   * Get accreditation by ID with optional relations
   */
  async getAccreditationById(profileId: string, includeRelations: boolean = true) {
    const profile = await prisma.accreditationProfile.findUnique({
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
        }
        : undefined,
    });

    if (!profile) {
      throw new NotFoundError("Accreditation Profile", profileId);
    }

    return profile;
  }

  /**
   * Update accreditation profile
   * Automatically resets status to draft if profile was submitted/approved/rejected
   */
  async updateAccreditation(profileId: string, accreditationData: any) {
    const profile = await this.getAccreditationById(profileId, false);

    // Reset status to draft if it was submitted/approved/rejected
    if (profile.status !== "draft") {
      await prisma.accreditationProfile.update({
        where: { id: profileId },
        data: { status: "draft" },
      });
    }

    // Validate accreditation data
    await validationService.validateAccreditation(accreditationData);

    // Update profile
    const updated = await prisma.accreditationProfile.update({
      where: { id: profileId },
      data: {
        rrName: accreditationData.rrName,
        rrNo: accreditationData.rrNo,
        customerNames: accreditationData.customerNames,
        hasJointOwner: accreditationData.hasJointOwner ?? false,
        accountOwnerSignature: accreditationData.accountOwnerSignature,
        accountOwnerPrintedName: accreditationData.accountOwnerPrintedName,
        accountOwnerDate: accreditationData.accountOwnerDate ? new Date(accreditationData.accountOwnerDate) : null,
        jointAccountOwnerSignature: accreditationData.jointAccountOwnerSignature,
        jointAccountOwnerPrintedName: accreditationData.jointAccountOwnerPrintedName,
        jointAccountOwnerDate: accreditationData.jointAccountOwnerDate ? new Date(accreditationData.jointAccountOwnerDate) : null,
        financialProfessionalSignature: accreditationData.financialProfessionalSignature,
        financialProfessionalPrintedName: accreditationData.financialProfessionalPrintedName,
        financialProfessionalDate: accreditationData.financialProfessionalDate ? new Date(accreditationData.financialProfessionalDate) : null,
        registeredPrincipalSignature: accreditationData.registeredPrincipalSignature,
        registeredPrincipalPrintedName: accreditationData.registeredPrincipalPrintedName,
        registeredPrincipalDate: accreditationData.registeredPrincipalDate ? new Date(accreditationData.registeredPrincipalDate) : null,
      },
    });

    await this.markPageCompleted(profileId, 1);
    return await this.getAccreditationById(profileId, true);
  }

  /**
   * Submit accreditation for review
   */
  async submitAccreditation(profileId: string) {
    const profile = await this.getAccreditationById(profileId, false);

    if (profile.status !== "draft") {
      throw new ConflictError("Accreditation Profile is not in draft status");
    }

    // Validate profile completeness
    await validationService.validateCompleteAccreditation(profileId);

    return await prisma.accreditationProfile.update({
      where: { id: profileId },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });
  }

  /**
   * Get accreditations by user with pagination and filtering
   */
  async getAccreditationsByUser(
    userId: string | undefined,
    clientId: string | undefined,
    filters: { status?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: PAGINATION.DEFAULT_LIMIT }
  ) {
    if (!userId && !clientId) {
      throw new ValidationError("Either userId or clientId must be provided");
    }

    const where: Prisma.AccreditationProfileWhereInput = {
      ...(clientId ? { clientId } : userId ? { userId } : {}),
      ...(filters.status && { status: filters.status as ProfileStatus }),
    };

    const [profiles, total] = await Promise.all([
      prisma.accreditationProfile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.accreditationProfile.count({ where }),
    ]);

    return {
      profiles: profiles,
      pagination: calculatePagination(total, pagination.page, pagination.limit),
    };
  }

  /**
   * Get accreditation progress
   */
  async getAccreditationProgress(profileId: string) {
    const profile = await this.getAccreditationById(profileId, false);
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
   * Format accreditation data for n8n PDF generation
   */
  formatAccreditationForN8N(profile: any): any {
    const result: any = {
      form_type: "accreditation",
      form_id: "REI-Accreditation",
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

    // Add all accreditation fields
    result.fields = {
      rr_name: profile.rrName,
      rr_no: profile.rrNo,
      customer_names: profile.customerNames,

      // Signatures - Account Owner
      account_owner_signature: profile.accountOwnerSignature,
      account_owner_printed_name: profile.accountOwnerPrintedName,
      account_owner_date: formatDate(profile.accountOwnerDate),

      // Signatures - Joint Account Owner
      joint_account_owner_signature: profile.jointAccountOwnerSignature,
      joint_account_owner_printed_name: profile.jointAccountOwnerPrintedName,
      joint_account_owner_date: formatDate(profile.jointAccountOwnerDate),

      // Signatures - Financial Professional
      financial_professional_signature: profile.financialProfessionalSignature,
      financial_professional_printed_name: profile.financialProfessionalPrintedName,
      financial_professional_date: formatDate(profile.financialProfessionalDate),

      // Signatures - Registered Principal
      registered_principal_signature: profile.registeredPrincipalSignature,
      registered_principal_printed_name: profile.registeredPrincipalPrintedName,
      registered_principal_date: formatDate(profile.registeredPrincipalDate),
    };

    // Add conditional fields / derived data
    result.conditional_fields = {
      has_joint_owner: profile.hasJointOwner
    };

    return result;
  }

  async generatePdf(profileId: string) {
    const profile = await this.getAccreditationById(profileId, true);

    // Format the profile data for n8n
    const formattedData = this.formatAccreditationForN8N(profile);

    console.log("Sending payload to n8n:", JSON.stringify(formattedData, null, 2));

    const webhookUrl = "https://n8n.srv891599.hstgr.cloud/webhook/b47bbb12-d35c-4329-9973-45aa0b851913";

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
    const existing = await prisma.accreditationProfile.findUnique({
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

    await prisma.accreditationProfile.update({
      where: { id: profileId },
      data: {
        lastCompletedPage: nextCompleted,
        pageCompletionStatus: statusMap,
      },
    });
  }
}

export const accreditationService = new AccreditationService();

