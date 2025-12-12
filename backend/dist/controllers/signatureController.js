"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signatureController = exports.SignatureController = void 0;
const prisma_1 = require("../prisma");
const responses_1 = require("../utils/responses");
const errors_1 = require("../utils/errors");
class SignatureController {
    /**
     * Get all signatures for a profile
     */
    async getSignatures(req, res, next) {
        try {
            const { profileId } = req.params;
            const signatures = await prisma_1.prisma.signature.findMany({
                where: { profileId },
                orderBy: { signatureType: "asc" },
            });
            (0, responses_1.sendSuccess)(res, signatures);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get specific signature by type
     */
    async getSignature(req, res, next) {
        try {
            const { profileId, type } = req.params;
            const signature = await prisma_1.prisma.signature.findUnique({
                where: {
                    profileId_signatureType: {
                        profileId,
                        signatureType: type,
                    },
                },
            });
            if (!signature) {
                throw new errors_1.NotFoundError("Signature", `${profileId}-${type}`);
            }
            (0, responses_1.sendSuccess)(res, signature);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create or update signature
     */
    async createOrUpdateSignature(req, res, next) {
        try {
            const { profileId } = req.params;
            const { signatureType, signatureData, printedName, signatureDate } = req.body;
            const signature = await prisma_1.prisma.signature.upsert({
                where: {
                    profileId_signatureType: {
                        profileId,
                        signatureType: signatureType,
                    },
                },
                create: {
                    profileId,
                    signatureType: signatureType,
                    signatureData,
                    printedName,
                    signatureDate: new Date(signatureDate),
                },
                update: {
                    signatureData,
                    printedName,
                    signatureDate: new Date(signatureDate),
                },
            });
            (0, responses_1.sendSuccess)(res, signature, signature ? 200 : 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete signature
     */
    async deleteSignature(req, res, next) {
        try {
            const { profileId, type } = req.params;
            await prisma_1.prisma.signature.delete({
                where: {
                    profileId_signatureType: {
                        profileId,
                        signatureType: type,
                    },
                },
            });
            (0, responses_1.sendSuccess)(res, { message: "Signature deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SignatureController = SignatureController;
exports.signatureController = new SignatureController();
