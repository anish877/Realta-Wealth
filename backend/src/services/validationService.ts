import { prisma } from "../prisma";
import { ValidationError, NotFoundError } from "../utils/errors";
import {
  step1Schema,
  step2Schema,
  step5Schema,
  step6Schema,
  step7Schema,
} from "../validators/investorProfileValidators";
import { accountHolderSchema } from "../validators/accountHolderValidators";
import {
  step1Schema as additionalHolderStep1Schema,
  step2Schema as additionalHolderStep2Schema,
} from "../validators/additionalHolderValidators";
import { altOrderSchema } from "../validators/altOrderValidators";
import { accreditationSchema } from "../validators/accreditationValidators";

export class ValidationService {
  /**
   * Validate Step 1 data
   */
  async validateStep1(data: unknown): Promise<void> {
    const result = step1Schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Step 1 validation failed", result.error.errors);
    }
  }

  /**
   * Validate Step 2 data
   */
  async validateStep2(data: unknown): Promise<void> {
    const result = step2Schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Step 2 validation failed", result.error.errors);
    }
  }

  /**
   * Validate Step 3 data (Primary Account Holder)
   */
  async validateStep3(data: unknown): Promise<void> {
    console.log("[DEBUG validateStep3] Received data:", JSON.stringify(data, null, 2));
    const result = accountHolderSchema.safeParse(data);
    if (!result.success) {
      console.log("[DEBUG validateStep3] Validation errors:", JSON.stringify(result.error.errors, null, 2));
      throw new ValidationError("Step 3 validation failed", result.error.errors);
    }
    console.log("[DEBUG validateStep3] Validation passed!");
  }

  /**
   * Validate Step 4 data (Secondary Account Holder)
   * Note: Step 4 should only be validated if the step is visible (Joint or Trust account selected).
   * The frontend filters out Step 4 when it's not visible, but backend validation should also
   * check account types before requiring Step 4 data. Currently, validation runs regardless
   * of visibility - this is acceptable since the frontend prevents Step 4 updates when hidden.
   */
  async validateStep4(data: unknown): Promise<void> {
    const result = accountHolderSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Step 4 validation failed", result.error.errors);
    }
  }

  /**
   * Validate Step 5 data
   */
  async validateStep5(data: unknown): Promise<void> {
    const result = step5Schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Step 5 validation failed", result.error.errors);
    }
  }

  /**
   * Validate Step 6 data
   */
  async validateStep6(data: unknown): Promise<void> {
    const result = step6Schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Step 6 validation failed", result.error.errors);
    }
  }

  /**
   * Validate Step 7 data
   */
  async validateStep7(data: unknown): Promise<void> {
    const result = step7Schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Step 7 validation failed", result.error.errors);
    }
  }

  /**
   * Validate complete profile before submission
   */
  async validateCompleteProfile(profileId: string): Promise<void> {
    const profile = await prisma.investorProfile.findUnique({
      where: { id: profileId },
      include: {
        patriotActInformation: true,
        accountHolders: {
          where: { holderType: "primary" },
        },
        investmentObjectives: true,
        trustedContact: true,
        signatures: true,
      },
    });

    if (!profile) {
      throw new NotFoundError("Profile", profileId);
    }

    console.log("[DEBUG validateCompleteProfile] Profile found:", profileId);
    console.log("[DEBUG validateCompleteProfile] Account holders:", profile.accountHolders?.length, profile.accountHolders?.map(h => ({ type: h.holderType, name: h.name })));
    console.log("[DEBUG validateCompleteProfile] Investment objectives:", !!profile.investmentObjectives);

    const errors: string[] = [];

    // Validate Step 1
    if (!profile.rrName || !profile.customerNames) {
      errors.push("Step 1: RR Name and Customer Names are required");
    }

    // Validate Step 2
    if (!profile.patriotActInformation) {
      errors.push("Step 2: Patriot Act Information is required");
    } else if (
      !profile.patriotActInformation.initialSourceOfFunds ||
      profile.patriotActInformation.initialSourceOfFunds.length === 0
    ) {
      errors.push("Step 2: At least one source of funds is required");
    }

    // Validate Step 3 (Primary Account Holder)
    const primaryHolder = profile.accountHolders.find((h) => h.holderType === "primary");
    if (!primaryHolder) {
      errors.push("Step 3: Primary Account Holder information is required");
    } else {
      if (!primaryHolder.name) {
        errors.push("Step 3: Primary Account Holder name is required");
      }
      if (!primaryHolder.personEntity) {
        errors.push("Step 3: Person/Entity selection is required");
      }
      if (primaryHolder.personEntity === "Person" && !primaryHolder.ssn) {
        errors.push("Step 3: SSN is required for Person");
      }
      if (primaryHolder.personEntity === "Entity" && !primaryHolder.ein) {
        errors.push("Step 3: EIN is required for Entity");
      }
    }

    // Validate Step 5
    if (!profile.investmentObjectives) {
      errors.push("Step 5: Investment Objectives are required");
    }

    // Validate Step 6 (if not declined)
    if (profile.trustedContact && !profile.trustedContact.declineToProvide) {
      if (!profile.trustedContact.name || !profile.trustedContact.email) {
        errors.push("Step 6: Trusted Contact name and email are required if not declined");
      }
    }

    // Validate Step 7
    if (!profile.signatures || profile.signatures.length === 0) {
      errors.push("Step 7: At least one signature is required");
    } else {
      const accountOwnerSignature = profile.signatures.find(
        (s) => s.signatureType === "account_owner"
      );
      if (!accountOwnerSignature) {
        errors.push("Step 7: Account Owner signature is required");
      }
    }

    if (errors.length > 0) {
      throw new ValidationError("Profile validation failed", errors);
    }
  }

  /**
   * Validate conditional fields based on form data
   */
  async validateConditionalFields(stepData: any, formData: any): Promise<void> {
    // Validate Person/Entity conditional fields
    if (stepData.personEntity === "Person") {
      if (!stepData.ssn) {
        throw new ValidationError("SSN is required for Person", undefined, "ssn");
      }
      if (!stepData.dateOfBirth) {
        throw new ValidationError("Date of Birth is required for Person", undefined, "dateOfBirth");
      }
    } else if (stepData.personEntity === "Entity") {
      if (!stepData.ein) {
        throw new ValidationError("EIN is required for Entity", undefined, "ein");
      }
    }

    // Validate employment fields
    if (stepData.employmentAffiliations?.includes("Employed") ||
      stepData.employmentAffiliations?.includes("SelfEmployed")) {
      if (!stepData.employment?.occupation) {
        throw new ValidationError("Occupation is required when Employed or Self-Employed", undefined, "occupation");
      }
    }

    // Validate advisory firm related fields
    if (stepData.advisoryFirmInformation?.relatedToEmployeeAdvisory === "Yes") {
      if (!stepData.advisoryFirmInformation.employeeNameAndRelationship) {
        throw new ValidationError(
          "Employee Name and Relationship is required when related to employee",
          undefined,
          "employeeNameAndRelationship"
        );
      }
    }

    // Validate broker dealer related fields
    if (stepData.brokerDealerInformation?.relatedToEmployeeBrokerDealer === "Yes") {
      if (!stepData.brokerDealerInformation.brokerDealerEmployeeName) {
        throw new ValidationError(
          "Broker Dealer Employee Name is required when related to employee",
          undefined,
          "brokerDealerEmployeeName"
        );
      }
    }
  }

  /**
   * Validate Additional Holder Step 1 data
   */
  async validateAdditionalHolderStep1(data: unknown): Promise<void> {
    const result = additionalHolderStep1Schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Additional Holder Step 1 validation failed", result.error.errors);
    }
  }

  /**
   * Validate Additional Holder Step 2 data
   */
  async validateAdditionalHolderStep2(data: unknown): Promise<void> {
    const result = additionalHolderStep2Schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Additional Holder Step 2 validation failed", result.error.errors);
    }
  }

  /**
   * Validate complete Additional Holder profile before submission
   */
  async validateCompleteAdditionalHolder(profileId: string): Promise<void> {
    const profile = await prisma.additionalHolderProfile.findUnique({
      where: { id: profileId },
      include: {
        addresses: true,
        phones: true,
        governmentIds: true,
        investmentKnowledge: true,
      },
    });

    if (!profile) {
      throw new NotFoundError("Additional Holder Profile", profileId);
    }

    const errors: string[] = [];

    // Validate Step 1 - Basic required fields
    if (!profile.name) {
      errors.push("Step 1: Name is required");
    }
    if (!profile.personEntity) {
      errors.push("Step 1: Person/Entity selection is required");
    }
    if (profile.personEntity === "Person" && !profile.ssn) {
      errors.push("Step 1: SSN is required for Person");
    }
    if (profile.personEntity === "Entity" && !profile.ein) {
      errors.push("Step 1: EIN is required for Entity");
    }

    // Validate Step 2 - Signature required
    if (!profile.signature || !profile.printedName || !profile.signatureDate) {
      errors.push("Step 2: Signature, printed name, and date are required");
    }

    if (errors.length > 0) {
      throw new ValidationError("Additional Holder Profile validation failed", errors);
    }
  }

  /**
   * Validate Alt Order data
   */
  async validateAltOrder(data: unknown): Promise<void> {
    const result = altOrderSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Alt Order validation failed", result.error.errors);
    }
  }

  /**
   * Validate complete Alt Order before submission
   */
  async validateCompleteAltOrder(orderId: string): Promise<void> {
    const order = await prisma.altOrderProfile.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Alt Order Profile", orderId);
    }

    const errors: string[] = [];

    // Validate required fields
    if (!order.rrName) {
      errors.push("RR Name is required");
    }
    if (!order.rrNo) {
      errors.push("RR No. is required");
    }
    if (!order.customerNames) {
      errors.push("Customer Names(s) is required");
    }
    if (!order.proposedPrincipalAmount) {
      errors.push("Proposed Principal Amount is required");
    }

    // Conditional: Qualified account certification text required if Qualified Account = "Yes"
    if (order.qualifiedAccount === "Yes" && !order.qualifiedAccountCertificationText) {
      errors.push("Qualified account certification text is required when Qualified Account is Yes");
    }

    // Validate signatures - at least account owner signature required
    if (!order.accountOwnerSignature || !order.accountOwnerPrintedName || !order.accountOwnerDate) {
      errors.push("Account Owner signature, printed name, and date are required");
    }

    if (errors.length > 0) {
      throw new ValidationError("Alt Order validation failed", errors);
    }
  }

  /**
   * Validate Accreditation data
   */
  async validateAccreditation(data: unknown): Promise<void> {
    const result = accreditationSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Accreditation validation failed", result.error.errors);
    }
  }

  /**
   * Validate complete Accreditation before submission
   */
  async validateCompleteAccreditation(profileId: string): Promise<void> {
    const profile = await prisma.accreditationProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundError("Accreditation Profile", profileId);
    }

    const errors: string[] = [];

    // Validate required fields
    if (!profile.rrName) {
      errors.push("RR Name is required");
    }
    if (!profile.rrNo) {
      errors.push("RR No. is required");
    }
    if (!profile.customerNames) {
      errors.push("Customer Name(s) is required");
    }

    // Validate signatures - at least account owner signature required
    if (!profile.accountOwnerSignature || !profile.accountOwnerPrintedName || !profile.accountOwnerDate) {
      errors.push("Account Owner signature, printed name, and date are required");
    }

    // If has joint owner, joint account owner signature is required
    if (profile.hasJointOwner) {
      if (!profile.jointAccountOwnerSignature || !profile.jointAccountOwnerPrintedName || !profile.jointAccountOwnerDate) {
        errors.push("Joint Account Owner signature, printed name, and date are required when joint owner is present");
      }
    }

    // Financial professional signature required
    if (!profile.financialProfessionalSignature || !profile.financialProfessionalPrintedName || !profile.financialProfessionalDate) {
      errors.push("Financial Professional signature, printed name, and date are required");
    }

    if (errors.length > 0) {
      throw new ValidationError("Accreditation validation failed", errors);
    }
  }
}

export const validationService = new ValidationService();

