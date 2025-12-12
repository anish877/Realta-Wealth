"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationService = exports.ValidationService = void 0;
const prisma_1 = require("../prisma");
const errors_1 = require("../utils/errors");
const investorProfileValidators_1 = require("../validators/investorProfileValidators");
const accountHolderValidators_1 = require("../validators/accountHolderValidators");
class ValidationService {
    /**
     * Validate Step 1 data
     */
    async validateStep1(data) {
        const result = investorProfileValidators_1.step1Schema.safeParse(data);
        if (!result.success) {
            throw new errors_1.ValidationError("Step 1 validation failed", result.error.errors);
        }
    }
    /**
     * Validate Step 2 data
     */
    async validateStep2(data) {
        const result = investorProfileValidators_1.step2Schema.safeParse(data);
        if (!result.success) {
            throw new errors_1.ValidationError("Step 2 validation failed", result.error.errors);
        }
    }
    /**
     * Validate Step 3 data (Primary Account Holder)
     */
    async validateStep3(data) {
        const result = accountHolderValidators_1.accountHolderSchema.safeParse(data);
        if (!result.success) {
            throw new errors_1.ValidationError("Step 3 validation failed", result.error.errors);
        }
    }
    /**
     * Validate Step 4 data (Secondary Account Holder)
     */
    async validateStep4(data) {
        const result = accountHolderValidators_1.accountHolderSchema.safeParse(data);
        if (!result.success) {
            throw new errors_1.ValidationError("Step 4 validation failed", result.error.errors);
        }
    }
    /**
     * Validate Step 5 data
     */
    async validateStep5(data) {
        const result = investorProfileValidators_1.step5Schema.safeParse(data);
        if (!result.success) {
            throw new errors_1.ValidationError("Step 5 validation failed", result.error.errors);
        }
    }
    /**
     * Validate Step 6 data
     */
    async validateStep6(data) {
        const result = investorProfileValidators_1.step6Schema.safeParse(data);
        if (!result.success) {
            throw new errors_1.ValidationError("Step 6 validation failed", result.error.errors);
        }
    }
    /**
     * Validate Step 7 data
     */
    async validateStep7(data) {
        const result = investorProfileValidators_1.step7Schema.safeParse(data);
        if (!result.success) {
            throw new errors_1.ValidationError("Step 7 validation failed", result.error.errors);
        }
    }
    /**
     * Validate complete profile before submission
     */
    async validateCompleteProfile(profileId) {
        const profile = await prisma_1.prisma.investorProfile.findUnique({
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
            throw new errors_1.NotFoundError("Profile", profileId);
        }
        const errors = [];
        // Validate Step 1
        if (!profile.rrName || !profile.customerNames) {
            errors.push("Step 1: RR Name and Customer Names are required");
        }
        // Validate Step 2
        if (!profile.patriotActInformation) {
            errors.push("Step 2: Patriot Act Information is required");
        }
        else if (!profile.patriotActInformation.initialSourceOfFunds ||
            profile.patriotActInformation.initialSourceOfFunds.length === 0) {
            errors.push("Step 2: At least one source of funds is required");
        }
        // Validate Step 3 (Primary Account Holder)
        const primaryHolder = profile.accountHolders.find((h) => h.holderType === "primary");
        if (!primaryHolder) {
            errors.push("Step 3: Primary Account Holder information is required");
        }
        else {
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
        }
        else {
            const accountOwnerSignature = profile.signatures.find((s) => s.signatureType === "account_owner");
            if (!accountOwnerSignature) {
                errors.push("Step 7: Account Owner signature is required");
            }
        }
        if (errors.length > 0) {
            throw new errors_1.ValidationError("Profile validation failed", errors);
        }
    }
    /**
     * Validate conditional fields based on form data
     */
    async validateConditionalFields(stepData, formData) {
        // Validate Person/Entity conditional fields
        if (stepData.personEntity === "Person") {
            if (!stepData.ssn) {
                throw new errors_1.ValidationError("SSN is required for Person", undefined, "ssn");
            }
            if (!stepData.dateOfBirth) {
                throw new errors_1.ValidationError("Date of Birth is required for Person", undefined, "dateOfBirth");
            }
        }
        else if (stepData.personEntity === "Entity") {
            if (!stepData.ein) {
                throw new errors_1.ValidationError("EIN is required for Entity", undefined, "ein");
            }
        }
        // Validate employment fields
        if (stepData.employmentAffiliations?.includes("Employed") ||
            stepData.employmentAffiliations?.includes("SelfEmployed")) {
            if (!stepData.employment?.occupation) {
                throw new errors_1.ValidationError("Occupation is required when Employed or Self-Employed", undefined, "occupation");
            }
        }
        // Validate advisory firm related fields
        if (stepData.advisoryFirmInformation?.relatedToEmployeeAdvisory === "Yes") {
            if (!stepData.advisoryFirmInformation.employeeNameAndRelationship) {
                throw new errors_1.ValidationError("Employee Name and Relationship is required when related to employee", undefined, "employeeNameAndRelationship");
            }
        }
        // Validate broker dealer related fields
        if (stepData.brokerDealerInformation?.relatedToEmployeeBrokerDealer === "Yes") {
            if (!stepData.brokerDealerInformation.brokerDealerEmployeeName) {
                throw new errors_1.ValidationError("Broker Dealer Employee Name is required when related to employee", undefined, "brokerDealerEmployeeName");
            }
        }
    }
}
exports.ValidationService = ValidationService;
exports.validationService = new ValidationService();
