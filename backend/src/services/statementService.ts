// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors";
import { calculatePagination } from "../utils/responses";
import { PAGINATION } from "../config/constants";
import {
  statementStep1Schema,
  statementStep2Schema,
  statementStep1DraftSchema,
  statementStep2DraftSchema,
} from "../validators/statementValidators";
import { config } from "../config/env";

type StatementStatus = "draft" | "submitted" | "approved" | "rejected";

export class StatementService {
  /**
   * Create a new statement or update existing statement for user/client (one per user/client)
   */
  async createStatement(userId: string | undefined, clientId: string | undefined, step1Data: any) {
    if (!userId && !clientId) {
      throw new ValidationError("Either userId or clientId must be provided");
    }

    // Validate Step 1 data (draft schema - allows incomplete data for saves)
    const result = statementStep1DraftSchema.safeParse(step1Data);
    if (!result.success) {
      throw new ValidationError("Statement Step 1 validation failed", result.error.errors);
    }

    // Check if user/client already has a statement
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

    const existing = await prisma.statementProfile.findFirst({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      // Reset status to draft if needed and update step 1
      if (existing.status !== "draft") {
        await prisma.statementProfile.update({
          where: { id: existing.id },
          data: { status: "draft" },
        });
      }
      return await this.updateStep1(existing.id, step1Data);
    }

    // No existing statement - create new
    const now = new Date();
    const parsed = result.data;

    const statementId = await prisma.$transaction(
      async (tx) => {
        const statement = await tx.statementProfile.create({
          data: {
            userId: userId || null,
            clientId: clientId || null,
            rrName: parsed.rrName,
            rrNo: parsed.rrNo,
            customerNames: parsed.customerNames,
            notesPage1: parsed.notesPage1,
            status: "draft",
            lastCompletedPage: 1,
            pageCompletionStatus: {
              "1": { completed: true, updatedAt: now.toISOString() },
            },
          },
        });

        // Create financial rows if provided
        if (parsed.financialRows && parsed.financialRows.length > 0) {
          await tx.statementFinancialRow.createMany({
            data: parsed.financialRows.map((row: any) => ({
              statementId: statement.id,
              category: row.category as any,
              rowKey: row.rowKey,
              label: row.label,
              value: row.value,
              isTotal: row.isTotal ?? false,
            })),
          });
        }

        return statement.id;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );

    return await this.getStatementById(statementId, true);
  }

  /**
   * Get statement by ID with optional relations
   */
  async getStatementById(statementId: string, includeRelations: boolean = true) {
    const statement = await prisma.statementProfile.findUnique({
      where: { id: statementId },
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
            financialRows: true,
            signatures: true,
          }
        : undefined,
    });

    if (!statement) {
      throw new NotFoundError("StatementProfile", statementId);
    }

    return statement;
  }

  /**
   * Update specific step (page)
   */
  async updateStep(statementId: string, stepNumber: number, stepData: any) {
    const statement = await this.getStatementById(statementId, false);

    // Reset status to draft if needed
    if (statement.status !== "draft") {
      await prisma.statementProfile.update({
        where: { id: statementId },
        data: { status: "draft" },
      });
    }

    switch (stepNumber) {
      case 1:
        // validate with step1 draft schema (allows incomplete data for saves)
        {
          const result = statementStep1DraftSchema.safeParse(stepData);
          if (!result.success) {
            throw new ValidationError(
              "Statement Step 1 validation failed",
              result.error.errors
            );
          }
        }
        return await this.updateStep1(statementId, stepData);
      case 2:
        {
          // validate with step2 draft schema (allows incomplete data for saves)
          const result = statementStep2DraftSchema.safeParse(stepData);
          if (!result.success) {
            throw new ValidationError(
              "Statement Step 2 validation failed",
              result.error.errors
            );
          }
        }
        return await this.updateStep2(statementId, stepData);
      default:
        throw new ValidationError(`Invalid statement step number: ${stepNumber}`);
    }
  }

  /**
   * Update Step 1 - header + financial rows
   */
  private async updateStep1(statementId: string, stepData: any) {
    const parsed = stepData;

    await prisma.statementProfile.update({
      where: { id: statementId },
      data: {
        rrName: parsed.rrName,
        rrNo: parsed.rrNo,
        customerNames: parsed.customerNames,
        notesPage1: parsed.notesPage1,
      },
    });

    // Replace financial rows
    if (parsed.financialRows) {
      await prisma.statementFinancialRow.deleteMany({
        where: { statementId },
      });

      if (parsed.financialRows.length > 0) {
        await prisma.statementFinancialRow.createMany({
          data: parsed.financialRows.map((row: any) => ({
            statementId,
            category: row.category as any,
            rowKey: row.rowKey,
            label: row.label,
            value: row.value,
            isTotal: row.isTotal ?? false,
          })),
        });
      }
    }

    await this.markPageCompleted(statementId, 1);
    return await this.getStatementById(statementId, true);
  }

  /**
   * Update Step 2 - additional notes + signatures
   */
  private async updateStep2(statementId: string, stepData: any) {
    const parsed = stepData;

    await prisma.statementProfile.update({
      where: { id: statementId },
      data: {
        additionalNotes: parsed.additionalNotes,
      },
    });

    if (parsed.signatures && parsed.signatures.length > 0) {
      await prisma.statementSignature.deleteMany({
        where: { statementId },
      });

      await prisma.statementSignature.createMany({
        data: parsed.signatures.map((sig: any) => ({
          statementId,
          signatureType: sig.signatureType,
          signatureData: sig.signatureData,
          printedName: sig.printedName,
          signatureDate: new Date(sig.signatureDate),
        })),
      });
    }

    await this.markPageCompleted(statementId, 2);
    return await this.getStatementById(statementId, true);
  }

  /**
   * Submit statement
   */
  async submitStatement(statementId: string) {
    const statement = await this.getStatementById(statementId, true);

    if (statement.status !== "draft") {
      throw new ConflictError("Statement is not in draft status");
    }

    // Minimal completeness validation
    const errors: string[] = [];

    if (!statement.rrName || !statement.customerNames) {
      errors.push("Step 1: RR Name and Customer Names are required");
    }

    if (!statement.financialRows || statement.financialRows.length === 0) {
      errors.push("Step 1: At least one financial amount is required");
    }

    if (!statement.signatures || statement.signatures.length === 0) {
      errors.push("Step 2: At least one signature is required");
    } else {
      const accountOwnerSignature = statement.signatures.find(
        (s) => s.signatureType === "account_owner"
      );
      if (!accountOwnerSignature) {
        errors.push("Step 2: Account Owner signature is required");
      }
    }

    if (errors.length > 0) {
      throw new ValidationError("Statement validation failed", errors);
    }

    return await prisma.statementProfile.update({
      where: { id: statementId },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });
  }

  /**
   * Mark a page as completed and update progress metadata
   */
  private async markPageCompleted(statementId: string, pageNumber: number) {
    const existing = await prisma.statementProfile.findUnique({
      where: { id: statementId },
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

    await prisma.statementProfile.update({
      where: { id: statementId },
      data: {
        lastCompletedPage: nextCompleted,
        pageCompletionStatus: statusMap,
      },
    });
  }

  /**
   * Get statement progress
   */
  async getStatementProgress(statementId: string) {
    const statement = await prisma.statementProfile.findUnique({
      where: { id: statementId },
      select: {
        id: true,
        status: true,
        lastCompletedPage: true,
        pageCompletionStatus: true,
      },
    });

    if (!statement) {
      throw new NotFoundError("StatementProfile", statementId);
    }

    return statement;
  }

  /**
   * Get the user's/client's statement (one per user/client)
   */
  async getStatementByUser(userId: string | undefined, clientId: string | undefined) {
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

    const statement = await prisma.statementProfile.findFirst({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return statement;
  }

  /**
   * Get statements by user - returns array with at most one statement
   */
  async getStatementsByUser(
    userId: string | undefined,
    clientId: string | undefined,
    filters: {
      status?: StatementStatus;
    } = {},
    pagination: { page: number; limit: number } = {
      page: PAGINATION.DEFAULT_PAGE,
      limit: PAGINATION.DEFAULT_LIMIT,
    }
  ) {
    if (!userId && !clientId) {
      throw new ValidationError("Either userId or clientId must be provided");
    }

    const statement = await this.getStatementByUser(userId, clientId);

    let filteredStatement = statement;
    if (statement) {
      if (filters.status && statement.status !== filters.status) {
        filteredStatement = null;
      }
    }

    const statements = filteredStatement ? [filteredStatement] : [];

    return {
      statements,
      pagination: calculatePagination(1, 1, statements.length),
    };
  }

  /**
   * Generate PDF for a statement by sending data to n8n webhook
   */
  /**
   * Format statement data for n8n PDF generation
   */
  formatStatementForN8N(statement: any): any {
    const result: any = {
      form_type: "statement_of_financial_condition",
      form_id: "REI-Statement-of-Financial-Condition",
      statement_id: statement.id,
      status: statement.status,
      fields: {},
      conditional_fields: {},
      field_metadata: {}
    };

    // Helper to format currency
    const formatCurrency = (value: any) => {
      if (!value) return null;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

    // Add all statement fields - basic structure
    // This is a placeholder - expand based on actual statement fields
    // Handle checkbox fields with sub-values similar to other forms

    return result;
  }

  async generatePdf(statementId: string) {
    const statement = await this.getStatementById(statementId, true);

    if (!statement) {
      throw new NotFoundError("StatementProfile", statementId);
    }

    // Format the statement data for n8n
    const formattedData = this.formatStatementForN8N(statement);

    const webhookUrl = "https://n8n.srv891599.hstgr.cloud/webhook/7b947ec6-e173-45f9-aee9-a1c8f44ceae6";
    
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text().catch(() => "Unknown error");
      throw new Error(`Failed to generate Statement PDF: ${webhookResponse.status} ${errorText}`);
    }

    return {
      message: "Statement PDF generation request sent successfully",
      statementId,
    };
  }
}

export const statementService = new StatementService();


