"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.investorProfileService = exports.InvestorProfileService = void 0;
const prisma_1 = require("../prisma");
const errors_1 = require("../utils/errors");
const validationService_1 = require("./validationService");
const responses_1 = require("../utils/responses");
const constants_1 = require("../config/constants");
const env_1 = require("../config/env");
class InvestorProfileService {
    /**
     * Create a new investor profile or update existing profile
     * Ensures only one profile exists per user - always updates if profile exists
     */
    async createProfile(userId, step1Data) {
        // Check if user already has ANY profile (regardless of status)
        const existingProfile = await prisma_1.prisma.investorProfile.findFirst({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc", // Get the most recent profile
            },
        });
        // If profile exists, update it instead of creating a new one
        // Reset status to draft when updating
        if (existingProfile) {
            // Reset status to draft if it was submitted/approved/rejected
            if (existingProfile.status !== "draft") {
                await prisma_1.prisma.investorProfile.update({
                    where: { id: existingProfile.id },
                    data: { status: "draft" },
                });
            }
            return await this.updateStep1(existingProfile.id, step1Data);
        }
        // No draft exists, create a new one
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Validate Step 1 data
            await validationService_1.validationService.validateStep1(step1Data);
            const now = new Date();
            // Create profile
            const profile = await tx.investorProfile.create({
                data: {
                    userId,
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
                    data: step1Data.accountTypes.map((type) => ({
                        profileId: profile.id,
                        accountType: type,
                    })),
                });
            }
            // Create additional designations
            if (step1Data.additionalDesignations && step1Data.additionalDesignations.length > 0) {
                await tx.investorProfileAdditionalDesignation.createMany({
                    data: step1Data.additionalDesignations.map((designation) => ({
                        profileId: profile.id,
                        designationType: designation,
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
                        areAccountHoldersMarried: step1Data.jointAccountInformation.areAccountHoldersMarried,
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
        }, {
            maxWait: 10000, // Maximum time to wait for a transaction slot (10 seconds)
            timeout: 15000, // Maximum time the transaction can run (15 seconds)
        }).then(async (profileId) => {
            // Fetch the complete profile outside the transaction
            return await this.getProfileById(profileId, true);
        });
    }
    /**
     * Get profile by ID with optional relations (using transaction client)
     */
    async getProfileByIdWithClient(client, profileId, includeRelations = true) {
        const profile = await client.investorProfile.findUnique({
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
            throw new errors_1.NotFoundError("Profile", profileId);
        }
        return profile;
    }
    /**
     * Get profile by ID with optional relations
     */
    async getProfileById(profileId, includeRelations = true) {
        return await this.getProfileByIdWithClient(prisma_1.prisma, profileId, includeRelations);
    }
    /**
     * Update profile
     * Automatically resets status to draft if profile was submitted/approved/rejected
     */
    async updateProfile(profileId, updates) {
        const profile = await this.getProfileById(profileId, false);
        // Reset status to draft if it was submitted/approved/rejected
        const statusUpdate = profile.status !== "draft" ? { status: "draft" } : {};
        return await prisma_1.prisma.investorProfile.update({
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
    async updateStep(profileId, stepNumber, stepData) {
        const profile = await this.getProfileById(profileId, false);
        // Reset status to draft if it was submitted/approved/rejected
        if (profile.status !== "draft") {
            await prisma_1.prisma.investorProfile.update({
                where: { id: profileId },
                data: { status: "draft" },
            });
        }
        switch (stepNumber) {
            case 1:
                await validationService_1.validationService.validateStep1(stepData);
                return await this.updateStep1(profileId, stepData);
            case 2:
                await validationService_1.validationService.validateStep2(stepData);
                return await this.updateStep2(profileId, stepData);
            case 3:
                await validationService_1.validationService.validateStep3(stepData);
                return await this.updateStep3(profileId, stepData);
            case 4:
                await validationService_1.validationService.validateStep4(stepData);
                return await this.updateStep4(profileId, stepData);
            case 5:
                await validationService_1.validationService.validateStep5(stepData);
                return await this.updateStep5(profileId, stepData);
            case 6:
                await validationService_1.validationService.validateStep6(stepData);
                return await this.updateStep6(profileId, stepData);
            case 7:
                await validationService_1.validationService.validateStep7(stepData);
                return await this.updateStep7(profileId, stepData);
            default:
                throw new errors_1.ValidationError(`Invalid step number: ${stepNumber}`);
        }
    }
    /**
     * Update Step 1 - Simplified without transactions
     */
    async updateStep1(profileId, stepData) {
        // Update profile
        await prisma_1.prisma.investorProfile.update({
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
        await prisma_1.prisma.investorProfileAccountType.deleteMany({
            where: { profileId },
        });
        if (stepData.accountTypes && stepData.accountTypes.length > 0) {
            await prisma_1.prisma.investorProfileAccountType.createMany({
                data: stepData.accountTypes.map((type) => ({
                    profileId,
                    accountType: type,
                })),
            });
        }
        // Update additional designations
        await prisma_1.prisma.investorProfileAdditionalDesignation.deleteMany({
            where: { profileId },
        });
        if (stepData.additionalDesignations && stepData.additionalDesignations.length > 0) {
            await prisma_1.prisma.investorProfileAdditionalDesignation.createMany({
                data: stepData.additionalDesignations.map((designation) => ({
                    profileId,
                    designationType: designation,
                })),
            });
        }
        // Update trust information
        if (stepData.trustInformation) {
            await prisma_1.prisma.trustInformation.upsert({
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
        }
        else {
            await prisma_1.prisma.trustInformation.deleteMany({
                where: { profileId },
            });
        }
        // Update joint account information
        if (stepData.jointAccountInformation) {
            await prisma_1.prisma.jointAccountInformation.upsert({
                where: { profileId },
                create: {
                    profileId,
                    areAccountHoldersMarried: stepData.jointAccountInformation.areAccountHoldersMarried,
                    tenancyState: stepData.jointAccountInformation.tenancyState,
                    numberOfTenants: stepData.jointAccountInformation.numberOfTenants,
                    tenancyClauses: stepData.jointAccountInformation.tenancyClauses || [],
                },
                update: {
                    areAccountHoldersMarried: stepData.jointAccountInformation.areAccountHoldersMarried,
                    tenancyState: stepData.jointAccountInformation.tenancyState,
                    numberOfTenants: stepData.jointAccountInformation.numberOfTenants,
                    tenancyClauses: stepData.jointAccountInformation.tenancyClauses || [],
                },
            });
        }
        else {
            await prisma_1.prisma.jointAccountInformation.deleteMany({
                where: { profileId },
            });
        }
        // Update custodial account information
        if (stepData.custodialAccountInformation) {
            await prisma_1.prisma.custodialAccountInformation.upsert({
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
        }
        else {
            await prisma_1.prisma.custodialAccountInformation.deleteMany({
                where: { profileId },
            });
        }
        // Update transfer on death information
        if (stepData.transferOnDeathInformation) {
            await prisma_1.prisma.transferOnDeathInformation.upsert({
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
        }
        else {
            await prisma_1.prisma.transferOnDeathInformation.deleteMany({
                where: { profileId },
            });
        }
        await this.markStepCompleted(profileId, 1);
        return await this.getProfileById(profileId, true);
    }
    /**
     * Update Step 2 - Simplified without transactions
     */
    async updateStep2(profileId, stepData) {
        await prisma_1.prisma.patriotActInformation.upsert({
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
    async updateStep3(profileId, stepData) {
        const { accountHolderService } = await Promise.resolve().then(() => __importStar(require("./accountHolderService")));
        // Find or create primary account holder
        const existingHolder = await prisma_1.prisma.accountHolder.findFirst({
            where: {
                profileId,
                holderType: "primary",
            },
        });
        if (existingHolder) {
            await accountHolderService.updateAccountHolder(existingHolder.id, stepData);
        }
        else {
            await accountHolderService.createAccountHolder(profileId, "primary", stepData);
        }
        await this.markStepCompleted(profileId, 3);
        return this.getProfileById(profileId, true);
    }
    /**
     * Update Step 4 (Secondary Account Holder) - delegated to AccountHolderService
     */
    async updateStep4(profileId, stepData) {
        const { accountHolderService } = await Promise.resolve().then(() => __importStar(require("./accountHolderService")));
        // Find or create secondary account holder
        const existingHolder = await prisma_1.prisma.accountHolder.findFirst({
            where: {
                profileId,
                holderType: "secondary",
            },
        });
        if (existingHolder) {
            await accountHolderService.updateAccountHolder(existingHolder.id, stepData);
        }
        else {
            await accountHolderService.createAccountHolder(profileId, "secondary", stepData);
        }
        await this.markStepCompleted(profileId, 4);
        return this.getProfileById(profileId, true);
    }
    /**
     * Update Step 5 - Simplified without transactions
     */
    async updateStep5(profileId, stepData) {
        // Update investment objectives
        await prisma_1.prisma.investmentObjectives.upsert({
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
            await prisma_1.prisma.investmentValue.deleteMany({
                where: { profileId },
            });
            await prisma_1.prisma.investmentValue.createMany({
                data: stepData.investmentValues.map((iv) => ({
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
    async updateStep6(profileId, stepData) {
        await prisma_1.prisma.trustedContact.upsert({
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
    async updateStep7(profileId, stepData) {
        if (stepData.signatures && stepData.signatures.length > 0) {
            // Delete existing signatures
            await prisma_1.prisma.signature.deleteMany({
                where: { profileId },
            });
            // Create new signatures
            await prisma_1.prisma.signature.createMany({
                data: stepData.signatures.map((sig) => ({
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
    async submitProfile(profileId) {
        const profile = await this.getProfileById(profileId, false);
        if (profile.status !== "draft") {
            throw new errors_1.ConflictError("Profile is not in draft status");
        }
        // Validate profile completeness
        await validationService_1.validationService.validateCompleteProfile(profileId);
        return await prisma_1.prisma.investorProfile.update({
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
    async deleteProfile(profileId) {
        const profile = await this.getProfileById(profileId, false);
        if (profile.status === "submitted" || profile.status === "approved") {
            throw new errors_1.ConflictError("Cannot delete a submitted or approved profile");
        }
        return await prisma_1.prisma.investorProfile.delete({
            where: { id: profileId },
        });
    }
    /**
     * Mark a step as completed and update progress metadata - Simplified without transactions
     */
    async markStepCompleted(profileId, stepNumber) {
        const existing = await prisma_1.prisma.investorProfile.findUnique({
            where: { id: profileId },
            select: {
                lastCompletedStep: true,
                stepCompletionStatus: true,
            },
        });
        const statusMap = existing?.stepCompletionStatus || {};
        statusMap[String(stepNumber)] = {
            completed: true,
            updatedAt: new Date().toISOString(),
        };
        const nextCompleted = Math.max(existing?.lastCompletedStep || 0, stepNumber);
        await prisma_1.prisma.investorProfile.update({
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
    async getProfileProgress(profileId) {
        const profile = await prisma_1.prisma.investorProfile.findUnique({
            where: { id: profileId },
            select: {
                id: true,
                status: true,
                lastCompletedStep: true,
                stepCompletionStatus: true,
            },
        });
        if (!profile) {
            throw new errors_1.NotFoundError("Profile", profileId);
        }
        return profile;
    }
    /**
     * Get the user's profile (only one profile per user)
     * Returns the most recent profile if multiple exist (shouldn't happen with new logic)
     */
    async getProfileByUser(userId) {
        const profile = await prisma_1.prisma.investorProfile.findFirst({
            where: { userId },
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
    async getProfilesByUser(userId, filters = {}, pagination = {
        page: constants_1.PAGINATION.DEFAULT_PAGE,
        limit: constants_1.PAGINATION.DEFAULT_LIMIT,
    }) {
        // Since each user should only have one profile, we get the single profile
        const profile = await this.getProfileByUser(userId);
        // Apply filters if profile exists
        let filteredProfile = profile;
        if (profile) {
            if (filters.status && profile.status !== filters.status) {
                filteredProfile = null;
            }
            if (filters.search && filteredProfile) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch = profile.customerNames?.toLowerCase().includes(searchLower) ||
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
            pagination: (0, responses_1.calculatePagination)(1, 1, profiles.length),
        };
    }
    /**
     * Generate PDF for a profile by sending data to n8n webhook
     */
    async generatePdf(profileId) {
        // Get full profile data with all relations
        const profile = await this.getProfileById(profileId, true);
        if (!profile) {
            throw new errors_1.NotFoundError("Profile", profileId);
        }
        // Send to n8n webhook
        const webhookResponse = await fetch(env_1.config.n8nWebhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                profileId: profileId,
                profileData: profile,
                timestamp: new Date().toISOString(),
            }),
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
exports.InvestorProfileService = InvestorProfileService;
exports.investorProfileService = new InvestorProfileService();
