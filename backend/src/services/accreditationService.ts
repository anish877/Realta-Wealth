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
  async createAccreditation(userId: string, accreditationData: any) {
    // Check if user already has ANY profile (regardless of status)
    const existingProfile = await prisma.accreditationProfile.findFirst({
      where: {
        userId,
      },
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
            userId,
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
    userId: string,
    filters: { status?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: PAGINATION.DEFAULT_LIMIT }
  ) {
    const where: Prisma.AccreditationProfileWhereInput = {
      userId,
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
  async generatePdf(profileId: string) {
    const profile = await this.getAccreditationById(profileId, true);

    const webhookUrl = "https://n8n.srv891599.hstgr.cloud/webhook/b47bbb12-d35c-4329-9973-45aa0b851913";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileId,
        type: "accreditation",
        data: profile,
      }),
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

