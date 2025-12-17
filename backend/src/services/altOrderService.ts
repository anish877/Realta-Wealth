// @ts-nocheck
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors";
import { validationService } from "./validationService";
import { calculatePagination, PaginationInfo } from "../utils/responses";
import { PAGINATION } from "../config/constants";
import { config } from "../config/env";

type ProfileStatus = "draft" | "submitted" | "approved" | "rejected";

export class AltOrderService {
  /**
   * Create a new alt order or update existing order
   * Ensures only one order exists per user - always updates if order exists
   */
  async createAltOrder(userId: string, orderData: any) {
    // Check if user already has ANY order (regardless of status)
    const existingOrder = await prisma.altOrderProfile.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If order exists, update it instead of creating a new one
    // Reset status to draft when updating
    if (existingOrder) {
      if (existingOrder.status !== "draft") {
        await prisma.altOrderProfile.update({
          where: { id: existingOrder.id },
          data: { status: "draft" },
        });
      }
      return await this.updateAltOrder(existingOrder.id, orderData);
    }

    // No draft exists, create a new one
    return await prisma.$transaction(
      async (tx) => {
        // Validate order data
        await validationService.validateAltOrder(orderData);

        const now = new Date();

        // Create order
        const order = await tx.altOrderProfile.create({
          data: {
            userId,
            rrName: orderData.rrName,
            rrNo: orderData.rrNo,
            customerNames: orderData.customerNames,
            proposedPrincipalAmount: orderData.proposedPrincipalAmount,
            qualifiedAccount: orderData.qualifiedAccount,
            qualifiedAccountCertificationText: orderData.qualifiedAccountCertificationText,
            solicitedTrade: orderData.solicitedTrade,
            taxAdvantagePurchase: orderData.taxAdvantagePurchase,
            custodian: orderData.custodian,
            nameOfProduct: orderData.nameOfProduct,
            sponsorIssuer: orderData.sponsorIssuer,
            dateOfPpm: orderData.dateOfPpm ? new Date(orderData.dateOfPpm) : null,
            datePpmSent: orderData.datePpmSent ? new Date(orderData.datePpmSent) : null,
            existingIlliquidAltPositions: orderData.existingIlliquidAltPositions,
            existingIlliquidAltConcentration: orderData.existingIlliquidAltConcentration,
            existingSemiLiquidAltPositions: orderData.existingSemiLiquidAltPositions,
            existingSemiLiquidAltConcentration: orderData.existingSemiLiquidAltConcentration,
            existingTaxAdvantageAltPositions: orderData.existingTaxAdvantageAltPositions,
            existingTaxAdvantageAltConcentration: orderData.existingTaxAdvantageAltConcentration,
            totalNetWorth: orderData.totalNetWorth,
            liquidNetWorth: orderData.liquidNetWorth,
            totalConcentration: orderData.totalConcentration,
            accountOwnerSignature: orderData.accountOwnerSignature,
            accountOwnerPrintedName: orderData.accountOwnerPrintedName,
            accountOwnerDate: orderData.accountOwnerDate ? new Date(orderData.accountOwnerDate) : null,
            jointAccountOwnerSignature: orderData.jointAccountOwnerSignature,
            jointAccountOwnerPrintedName: orderData.jointAccountOwnerPrintedName,
            jointAccountOwnerDate: orderData.jointAccountOwnerDate ? new Date(orderData.jointAccountOwnerDate) : null,
            financialProfessionalSignature: orderData.financialProfessionalSignature,
            financialProfessionalPrintedName: orderData.financialProfessionalPrintedName,
            financialProfessionalDate: orderData.financialProfessionalDate ? new Date(orderData.financialProfessionalDate) : null,
            registeredPrincipalSignature: orderData.registeredPrincipalSignature,
            registeredPrincipalPrintedName: orderData.registeredPrincipalPrintedName,
            registeredPrincipalDate: orderData.registeredPrincipalDate ? new Date(orderData.registeredPrincipalDate) : null,
            notes: orderData.notes,
            regBiDelivery: orderData.regBiDelivery || false,
            stateRegistration: orderData.stateRegistration || false,
            aiInsight: orderData.aiInsight || false,
            statementOfFinancialCondition: orderData.statementOfFinancialCondition || false,
            suitabilityReceived: orderData.suitabilityReceived || false,
            status: "draft",
            lastCompletedPage: 1,
            pageCompletionStatus: {
              "1": { completed: true, updatedAt: now.toISOString() },
            },
          },
        });

        return order.id;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    ).then(async (orderId) => {
      return await this.getAltOrderById(orderId, true);
    });
  }

  /**
   * Get alt order by ID with optional relations
   */
  async getAltOrderById(orderId: string, includeRelations: boolean = true) {
    const order = await prisma.altOrderProfile.findUnique({
      where: { id: orderId },
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

    if (!order) {
      throw new NotFoundError("Alt Order Profile", orderId);
    }

    return order;
  }

  /**
   * Update alt order
   * Automatically resets status to draft if order was submitted/approved/rejected
   */
  async updateAltOrder(orderId: string, orderData: any) {
    const order = await this.getAltOrderById(orderId, false);

    // Reset status to draft if it was submitted/approved/rejected
    if (order.status !== "draft") {
      await prisma.altOrderProfile.update({
        where: { id: orderId },
        data: { status: "draft" },
      });
    }

    // Validate order data
    await validationService.validateAltOrder(orderData);

    // Update order
    const updated = await prisma.altOrderProfile.update({
      where: { id: orderId },
      data: {
        rrName: orderData.rrName,
        rrNo: orderData.rrNo,
        customerNames: orderData.customerNames,
        proposedPrincipalAmount: orderData.proposedPrincipalAmount,
        qualifiedAccount: orderData.qualifiedAccount,
        qualifiedAccountCertificationText: orderData.qualifiedAccountCertificationText,
        solicitedTrade: orderData.solicitedTrade,
        taxAdvantagePurchase: orderData.taxAdvantagePurchase,
        custodian: orderData.custodian,
        nameOfProduct: orderData.nameOfProduct,
        sponsorIssuer: orderData.sponsorIssuer,
        dateOfPpm: orderData.dateOfPpm ? new Date(orderData.dateOfPpm) : null,
        datePpmSent: orderData.datePpmSent ? new Date(orderData.datePpmSent) : null,
        existingIlliquidAltPositions: orderData.existingIlliquidAltPositions,
        existingIlliquidAltConcentration: orderData.existingIlliquidAltConcentration,
        existingSemiLiquidAltPositions: orderData.existingSemiLiquidAltPositions,
        existingSemiLiquidAltConcentration: orderData.existingSemiLiquidAltConcentration,
        existingTaxAdvantageAltPositions: orderData.existingTaxAdvantageAltPositions,
        existingTaxAdvantageAltConcentration: orderData.existingTaxAdvantageAltConcentration,
        totalNetWorth: orderData.totalNetWorth,
        liquidNetWorth: orderData.liquidNetWorth,
        totalConcentration: orderData.totalConcentration,
        accountOwnerSignature: orderData.accountOwnerSignature,
        accountOwnerPrintedName: orderData.accountOwnerPrintedName,
        accountOwnerDate: orderData.accountOwnerDate ? new Date(orderData.accountOwnerDate) : null,
        jointAccountOwnerSignature: orderData.jointAccountOwnerSignature,
        jointAccountOwnerPrintedName: orderData.jointAccountOwnerPrintedName,
        jointAccountOwnerDate: orderData.jointAccountOwnerDate ? new Date(orderData.jointAccountOwnerDate) : null,
        financialProfessionalSignature: orderData.financialProfessionalSignature,
        financialProfessionalPrintedName: orderData.financialProfessionalPrintedName,
        financialProfessionalDate: orderData.financialProfessionalDate ? new Date(orderData.financialProfessionalDate) : null,
        registeredPrincipalSignature: orderData.registeredPrincipalSignature,
        registeredPrincipalPrintedName: orderData.registeredPrincipalPrintedName,
        registeredPrincipalDate: orderData.registeredPrincipalDate ? new Date(orderData.registeredPrincipalDate) : null,
        notes: orderData.notes,
        regBiDelivery: orderData.regBiDelivery ?? false,
        stateRegistration: orderData.stateRegistration ?? false,
        aiInsight: orderData.aiInsight ?? false,
        statementOfFinancialCondition: orderData.statementOfFinancialCondition ?? false,
        suitabilityReceived: orderData.suitabilityReceived ?? false,
      },
    });

    await this.markPageCompleted(orderId, 1);
    return await this.getAltOrderById(orderId, true);
  }

  /**
   * Submit alt order for review
   */
  async submitAltOrder(orderId: string) {
    const order = await this.getAltOrderById(orderId, false);

    if (order.status !== "draft") {
      throw new ConflictError("Alt Order Profile is not in draft status");
    }

    // Validate order completeness
    await validationService.validateCompleteAltOrder(orderId);

    return await prisma.altOrderProfile.update({
      where: { id: orderId },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });
  }

  /**
   * Get alt orders by user with pagination and filtering
   */
  async getAltOrdersByUser(
    userId: string,
    filters: { status?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: PAGINATION.DEFAULT_LIMIT }
  ) {
    const where: Prisma.AltOrderProfileWhereInput = {
      userId,
      ...(filters.status && { status: filters.status as ProfileStatus }),
    };

    const [orders, total] = await Promise.all([
      prisma.altOrderProfile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.altOrderProfile.count({ where }),
    ]);

    return {
      profiles: orders,
      pagination: calculatePagination(total, pagination.page, pagination.limit),
    };
  }

  /**
   * Get alt order progress
   */
  async getAltOrderProgress(orderId: string) {
    const order = await this.getAltOrderById(orderId, false);
    return {
      lastCompletedPage: order.lastCompletedPage,
      pageCompletionStatus: order.pageCompletionStatus,
      status: order.status,
    };
  }

  /**
   * Generate PDF via n8n webhook
   */
  async generatePdf(orderId: string) {
    const order = await this.getAltOrderById(orderId, true);

    const webhookUrl = "https://n8n.srv891599.hstgr.cloud/webhook/cbe7fd24-f355-450d-86cb-5306101e8a82";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        type: "altOrder",
        data: order,
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
  private async markPageCompleted(orderId: string, pageNumber: number) {
    const existing = await prisma.altOrderProfile.findUnique({
      where: { id: orderId },
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

    await prisma.altOrderProfile.update({
      where: { id: orderId },
      data: {
        lastCompletedPage: nextCompleted,
        pageCompletionStatus: statusMap,
      },
    });
  }
}

export const altOrderService = new AltOrderService();

