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
    const result = accountHolderSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Step 3 validation failed", result.error.errors);
    }
  }

  /**
   * Validate Step 4 data (Secondary Account Holder)
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
}

export const validationService = new ValidationService();

