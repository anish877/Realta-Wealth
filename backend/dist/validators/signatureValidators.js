"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignatureSchema = exports.signatureParamsSchema = exports.updateSignatureSchema = exports.createSignatureSchema = void 0;
const zod_1 = require("zod");
const investorProfileValidators_1 = require("./investorProfileValidators");
exports.createSignatureSchema = investorProfileValidators_1.signatureSchema;
exports.updateSignatureSchema = investorProfileValidators_1.signatureSchema.partial().extend({
    signatureType: investorProfileValidators_1.signatureTypeSchema,
});
exports.signatureParamsSchema = zod_1.z.object({
    profileId: zod_1.z.string().uuid(),
    type: investorProfileValidators_1.signatureTypeSchema.optional(),
});
exports.getSignatureSchema = zod_1.z.object({
    profileId: zod_1.z.string().uuid(),
    type: investorProfileValidators_1.signatureTypeSchema,
});
