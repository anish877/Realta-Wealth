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
   * Ensures only one order exists per user/client - always updates if order exists
   */
  async createAltOrder(userId: string | undefined, clientId: string | undefined, orderData: any) {
    if (!userId && !clientId) {
      throw new ValidationError("Either userId or clientId must be provided");
    }

    // Check if user/client already has ANY order (regardless of status)
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

    const existingOrder = await prisma.altOrderProfile.findFirst({
      where: whereClause,
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
            userId: userId || null,
            clientId: clientId || null,
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

    // Build update data object, only including defined fields (omitting undefined)
    // Prisma will omit fields with undefined values, but we explicitly exclude them to be safe
    const updateData: any = {};
    
    if (orderData.rrName !== undefined) updateData.rrName = orderData.rrName;
    if (orderData.rrNo !== undefined) updateData.rrNo = orderData.rrNo;
    if (orderData.customerNames !== undefined) updateData.customerNames = orderData.customerNames;
    if (orderData.proposedPrincipalAmount !== undefined) updateData.proposedPrincipalAmount = orderData.proposedPrincipalAmount;
    if (orderData.qualifiedAccount !== undefined) updateData.qualifiedAccount = orderData.qualifiedAccount;
    if (orderData.qualifiedAccountCertificationText !== undefined) updateData.qualifiedAccountCertificationText = orderData.qualifiedAccountCertificationText;
    if (orderData.solicitedTrade !== undefined) updateData.solicitedTrade = orderData.solicitedTrade;
    if (orderData.taxAdvantagePurchase !== undefined) updateData.taxAdvantagePurchase = orderData.taxAdvantagePurchase;
    if (orderData.custodian !== undefined) updateData.custodian = orderData.custodian;
    if (orderData.nameOfProduct !== undefined) updateData.nameOfProduct = orderData.nameOfProduct;
    if (orderData.sponsorIssuer !== undefined) updateData.sponsorIssuer = orderData.sponsorIssuer;
    if (orderData.dateOfPpm !== undefined) updateData.dateOfPpm = orderData.dateOfPpm ? new Date(orderData.dateOfPpm) : null;
    if (orderData.datePpmSent !== undefined) updateData.datePpmSent = orderData.datePpmSent ? new Date(orderData.datePpmSent) : null;
    if (orderData.existingIlliquidAltPositions !== undefined) updateData.existingIlliquidAltPositions = orderData.existingIlliquidAltPositions;
    if (orderData.existingIlliquidAltConcentration !== undefined) updateData.existingIlliquidAltConcentration = orderData.existingIlliquidAltConcentration;
    if (orderData.existingSemiLiquidAltPositions !== undefined) updateData.existingSemiLiquidAltPositions = orderData.existingSemiLiquidAltPositions;
    if (orderData.existingSemiLiquidAltConcentration !== undefined) updateData.existingSemiLiquidAltConcentration = orderData.existingSemiLiquidAltConcentration;
    if (orderData.existingTaxAdvantageAltPositions !== undefined) updateData.existingTaxAdvantageAltPositions = orderData.existingTaxAdvantageAltPositions;
    if (orderData.existingTaxAdvantageAltConcentration !== undefined) updateData.existingTaxAdvantageAltConcentration = orderData.existingTaxAdvantageAltConcentration;
    if (orderData.totalNetWorth !== undefined) updateData.totalNetWorth = orderData.totalNetWorth;
    if (orderData.liquidNetWorth !== undefined) updateData.liquidNetWorth = orderData.liquidNetWorth;
    if (orderData.totalConcentration !== undefined) updateData.totalConcentration = orderData.totalConcentration;
    if (orderData.accountOwnerSignature !== undefined) updateData.accountOwnerSignature = orderData.accountOwnerSignature;
    if (orderData.accountOwnerPrintedName !== undefined) updateData.accountOwnerPrintedName = orderData.accountOwnerPrintedName;
    if (orderData.accountOwnerDate !== undefined) updateData.accountOwnerDate = orderData.accountOwnerDate ? new Date(orderData.accountOwnerDate) : null;
    if (orderData.jointAccountOwnerSignature !== undefined) updateData.jointAccountOwnerSignature = orderData.jointAccountOwnerSignature;
    if (orderData.jointAccountOwnerPrintedName !== undefined) updateData.jointAccountOwnerPrintedName = orderData.jointAccountOwnerPrintedName;
    if (orderData.jointAccountOwnerDate !== undefined) updateData.jointAccountOwnerDate = orderData.jointAccountOwnerDate ? new Date(orderData.jointAccountOwnerDate) : null;
    if (orderData.financialProfessionalSignature !== undefined) updateData.financialProfessionalSignature = orderData.financialProfessionalSignature;
    if (orderData.financialProfessionalPrintedName !== undefined) updateData.financialProfessionalPrintedName = orderData.financialProfessionalPrintedName;
    if (orderData.financialProfessionalDate !== undefined) updateData.financialProfessionalDate = orderData.financialProfessionalDate ? new Date(orderData.financialProfessionalDate) : null;
    if (orderData.registeredPrincipalSignature !== undefined) updateData.registeredPrincipalSignature = orderData.registeredPrincipalSignature;
    if (orderData.registeredPrincipalPrintedName !== undefined) updateData.registeredPrincipalPrintedName = orderData.registeredPrincipalPrintedName;
    if (orderData.registeredPrincipalDate !== undefined) updateData.registeredPrincipalDate = orderData.registeredPrincipalDate ? new Date(orderData.registeredPrincipalDate) : null;
    if (orderData.notes !== undefined) updateData.notes = orderData.notes;
    if (orderData.regBiDelivery !== undefined) updateData.regBiDelivery = orderData.regBiDelivery ?? false;
    if (orderData.stateRegistration !== undefined) updateData.stateRegistration = orderData.stateRegistration ?? false;
    if (orderData.aiInsight !== undefined) updateData.aiInsight = orderData.aiInsight ?? false;
    if (orderData.statementOfFinancialCondition !== undefined) updateData.statementOfFinancialCondition = orderData.statementOfFinancialCondition ?? false;
    if (orderData.suitabilityReceived !== undefined) updateData.suitabilityReceived = orderData.suitabilityReceived ?? false;

    // Update order
    const updated = await prisma.altOrderProfile.update({
      where: { id: orderId },
      data: updateData,
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
    userId: string | undefined,
    clientId: string | undefined,
    filters: { status?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: PAGINATION.DEFAULT_LIMIT }
  ) {
    if (!userId && !clientId) {
      throw new ValidationError("Either userId or clientId must be provided");
    }

    const where: Prisma.AltOrderProfileWhereInput = {
      ...(clientId ? { clientId } : userId ? { userId } : {}),
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
   * Format alt order data for n8n PDF filling
   * Shows all fields and sub-fields when conditions are met
   */
  formatAltOrderForN8N(order: any): any {
    const result: any = {
      form_type: "alt_order",
      form_id: "CEICIAOTDF08242023",
      order_id: order.id,
      status: order.status,
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

    // Helper to format percentage
    const formatPercentage = (value: any) => {
      if (!value) return null;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return `${num}%`;
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

    // Customer/Account Information
    result.fields.rr_name = { value: order.rrName || null, label: "RR Name", type: "text" };
    result.fields.rr_no = { value: order.rrNo || null, label: "RR No.", type: "text" };
    result.fields.customer_names = { value: order.customerNames || null, label: "Customer Names(s)", type: "text" };
    result.fields.proposed_principal_amount = { 
      value: order.proposedPrincipalAmount ? formatCurrency(order.proposedPrincipalAmount) : null, 
      label: "Proposed Principal Amount", 
      type: "currency",
      raw_value: order.proposedPrincipalAmount
    };
    result.fields.qualified_account = { 
      value: order.qualifiedAccount === "Yes" ? true : (order.qualifiedAccount === "No" ? false : null),
      label: "Qualified Account", 
      type: "yes_no",
      is_yes: order.qualifiedAccount === "Yes"
    };
    
    // Sub-field: qualified_account_certification_text (always include when qualified_account is Yes)
    if (order.qualifiedAccount === "Yes") {
      result.fields.qualified_account_certification_text = {
        value: order.qualifiedAccountCertificationText || null,
        label: "Qualified account certification text",
        type: "text",
        notes: "If purchasing this product in a qualified account, I certify that I have other sufficient qualified funds available to meet my required minimum distributions pursuant to IRS requirements until this product matures."
      };
    }
    
    result.fields.solicited_trade = { 
      value: order.solicitedTrade || null, 
      label: "Solicited Trade", 
      type: "yes_no",
      is_yes: order.solicitedTrade === "Yes"
    };
    result.fields.tax_advantage_purchase = { 
      value: order.taxAdvantagePurchase || null, 
      label: "Tax Advantage Purchase", 
      type: "yes_no",
      is_yes: order.taxAdvantagePurchase === "Yes"
    };

    // Customer Order Information
    result.fields.custodian = { value: order.custodian || null, label: "Custodian", type: "dropdown" };
    result.fields.name_of_product = { value: order.nameOfProduct || null, label: "Name of Product", type: "text" };
    result.fields.sponsor_issuer = { value: order.sponsorIssuer || null, label: "Sponsor/Issuer", type: "text" };
    result.fields.date_of_ppm = { value: formatDate(order.dateOfPpm), label: "Date of PPM", type: "date", raw_value: order.dateOfPpm };
    result.fields.date_ppm_sent = { value: formatDate(order.datePpmSent), label: "Date PPM Sent", type: "date", raw_value: order.datePpmSent };
    result.fields.existing_illiquid_alt_positions = { 
      value: order.existingIlliquidAltPositions ? formatCurrency(order.existingIlliquidAltPositions) : null, 
      label: "Existing Illiquid Alt Positions", 
      type: "currency",
      raw_value: order.existingIlliquidAltPositions
    };
    result.fields.existing_illiquid_alt_concentration = { 
      value: order.existingIlliquidAltConcentration ? formatPercentage(order.existingIlliquidAltConcentration) : null, 
      label: "Existing Illiquid Alt Concentration", 
      type: "percentage",
      raw_value: order.existingIlliquidAltConcentration
    };
    result.fields.existing_semi_liquid_alt_positions = { 
      value: order.existingSemiLiquidAltPositions ? formatCurrency(order.existingSemiLiquidAltPositions) : null, 
      label: "Existing Semi-liquid Alt Positions", 
      type: "currency",
      raw_value: order.existingSemiLiquidAltPositions
    };
    result.fields.existing_semi_liquid_alt_concentration = { 
      value: order.existingSemiLiquidAltConcentration ? formatPercentage(order.existingSemiLiquidAltConcentration) : null, 
      label: "Existing Semi-liquid Alt Concentration", 
      type: "percentage",
      raw_value: order.existingSemiLiquidAltConcentration
    };
    result.fields.existing_tax_advantage_alt_positions = { 
      value: order.existingTaxAdvantageAltPositions ? formatCurrency(order.existingTaxAdvantageAltPositions) : null, 
      label: "Existing Tax Advantage Alt Positions", 
      type: "currency",
      raw_value: order.existingTaxAdvantageAltPositions
    };
    result.fields.existing_tax_advantage_alt_concentration = { 
      value: order.existingTaxAdvantageAltConcentration ? formatPercentage(order.existingTaxAdvantageAltConcentration) : null, 
      label: "Existing Tax Advantage Alt Concentration", 
      type: "percentage",
      raw_value: order.existingTaxAdvantageAltConcentration
    };
    result.fields.total_net_worth = { 
      value: order.totalNetWorth ? formatCurrency(order.totalNetWorth) : null, 
      label: "Total Net Worth", 
      type: "currency",
      raw_value: order.totalNetWorth
    };
    result.fields.liquid_net_worth = { 
      value: order.liquidNetWorth ? formatCurrency(order.liquidNetWorth) : null, 
      label: "Liquid Net Worth*", 
      type: "currency",
      raw_value: order.liquidNetWorth,
      notes: "*Excluding home and auto"
    };
    result.fields.total_concentration = { 
      value: order.totalConcentration ? formatPercentage(order.totalConcentration) : null, 
      label: "Total Concentration*", 
      type: "percentage",
      raw_value: order.totalConcentration,
      notes: "*Concentration = Proposed and Existing (Illiquid and Semi-liquid Alts) / Total Net Worth"
    };

    // Signatures
    result.fields.account_owner_signature = { 
      value: order.accountOwnerSignature || null, 
      label: "Account Owner Signature", 
      type: "signature",
      has_signature: !!order.accountOwnerSignature
    };
    result.fields.account_owner_printed_name = { value: order.accountOwnerPrintedName || null, label: "Account Owner Printed Name", type: "text" };
    result.fields.account_owner_date = { value: formatDate(order.accountOwnerDate), label: "Account Owner Date", type: "date", raw_value: order.accountOwnerDate };
    
    // Conditional sub-fields: joint_account_owner fields (shown when customer_names contains multiple names or has joint owner)
    const hasJointOwner = order.customerNames && (order.customerNames.includes('&') || order.customerNames.includes('and') || order.jointAccountOwnerSignature);
    if (hasJointOwner || order.jointAccountOwnerSignature) {
      result.conditional_fields.joint_account_owner_signature = {
        value: order.jointAccountOwnerSignature || null,
        label: "Joint Account Owner Signature",
        type: "signature",
        conditional_on: "customer_names",
        conditional_note: "Shown when customer_names contains multiple names",
        has_signature: !!order.jointAccountOwnerSignature
      };
      result.conditional_fields.joint_account_owner_printed_name = {
        value: order.jointAccountOwnerPrintedName || null,
        label: "Joint Account Owner Printed Name",
        type: "text",
        conditional_on: "customer_names"
      };
      result.conditional_fields.joint_account_owner_date = {
        value: formatDate(order.jointAccountOwnerDate),
        label: "Joint Account Owner Date",
        type: "date",
        raw_value: order.jointAccountOwnerDate,
        conditional_on: "customer_names"
      };
    }
    
    result.fields.financial_professional_signature = { 
      value: order.financialProfessionalSignature || null, 
      label: "Financial Professional Signature", 
      type: "signature",
      has_signature: !!order.financialProfessionalSignature
    };
    result.fields.financial_professional_printed_name = { value: order.financialProfessionalPrintedName || null, label: "Financial Professional Printed Name", type: "text" };
    result.fields.financial_professional_date = { value: formatDate(order.financialProfessionalDate), label: "Financial Professional Date", type: "date", raw_value: order.financialProfessionalDate };
    result.fields.registered_principal_signature = { 
      value: order.registeredPrincipalSignature || null, 
      label: "Registered Principal Signature", 
      type: "signature",
      has_signature: !!order.registeredPrincipalSignature
    };
    result.fields.registered_principal_printed_name = { value: order.registeredPrincipalPrintedName || null, label: "Registered Principal Printed Name", type: "text" };
    result.fields.registered_principal_date = { value: formatDate(order.registeredPrincipalDate), label: "Registered Principal Date", type: "date", raw_value: order.registeredPrincipalDate };

    // Internal Use Only - Checkboxes (show sub-fields when true)
    result.fields.notes = { value: order.notes || null, label: "Notes", type: "textarea" };
    
    result.fields.reg_bi_delivery = { 
      value: order.regBiDelivery || false, 
      label: "Reg BI Delivery", 
      type: "checkbox",
      checked: order.regBiDelivery === true
    };
    
    result.fields.state_registration = { 
      value: order.stateRegistration || false, 
      label: "State Registration", 
      type: "checkbox",
      checked: order.stateRegistration === true
    };
    
    result.fields.ai_insight = { 
      value: order.aiInsight || false, 
      label: "AI Insight", 
      type: "checkbox",
      checked: order.aiInsight === true
    };
    
    result.fields.statement_of_financial_condition = { 
      value: order.statementOfFinancialCondition || false, 
      label: "Statement of Financial Condition", 
      type: "checkbox",
      checked: order.statementOfFinancialCondition === true
    };
    
    result.fields.suitability_received = { 
      value: order.suitabilityReceived || false, 
      label: "Suitability Received", 
      type: "checkbox",
      checked: order.suitabilityReceived === true
    };

    // Add metadata for all fields
    result.field_metadata = {
      qualified_account_certification_text: {
        conditional_on: "qualified_account",
        conditional_value: "Yes",
        notes: "If purchasing this product in a qualified account, I certify that I have other sufficient qualified funds available to meet my required minimum distributions pursuant to IRS requirements until this product matures."
      },
      joint_account_owner_signature: {
        conditional_on: "customer_names",
        conditional_note: "Shown when customer_names contains multiple names or has joint owner"
      },
      joint_account_owner_printed_name: {
        conditional_on: "customer_names",
        conditional_note: "Shown when customer_names contains multiple names or has joint owner"
      },
      joint_account_owner_date: {
        conditional_on: "customer_names",
        conditional_note: "Shown when customer_names contains multiple names or has joint owner"
      }
    };

    return result;
  }

  /**
   * Generate PDF via n8n webhook
   */
  async generatePdf(orderId: string) {
    const order = await this.getAltOrderById(orderId, true);
    
    // Format the order data for n8n with all fields and conditional sub-fields
    const formattedData = this.formatAltOrderForN8N(order);

    const webhookUrl = "https://n8n.srv891599.hstgr.cloud/webhook/cbe7fd24-f355-450d-86cb-5306101e8a82";

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

