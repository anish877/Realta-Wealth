import { z } from "zod";
import { signatureTypeSchema, signatureSchema } from "./investorProfileValidators";

export const createSignatureSchema = signatureSchema;

export const updateSignatureSchema = signatureSchema.partial().extend({
  signatureType: signatureTypeSchema,
});

export const signatureParamsSchema = z.object({
  profileId: z.string().uuid(),
  type: signatureTypeSchema.optional(),
});

export const getSignatureSchema = z.object({
  profileId: z.string().uuid(),
  type: signatureTypeSchema,
});

