import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { sendSuccess } from "../utils/responses";
import { NotFoundError } from "../utils/errors";
import { SignatureType } from "@prisma/client";

export class SignatureController {
  /**
   * Get all signatures for a profile
   */
  async getSignatures(req: Request, res: Response, next: NextFunction) {
    try {
      const { profileId } = req.params;
      const signatures = await prisma.signature.findMany({
        where: { profileId },
        orderBy: { signatureType: "asc" },
      });
      sendSuccess(res, signatures);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific signature by type
   */
  async getSignature(req: Request, res: Response, next: NextFunction) {
    try {
      const { profileId, type } = req.params;
      const signature = await prisma.signature.findUnique({
        where: {
          profileId_signatureType: {
            profileId,
            signatureType: type as SignatureType,
          },
        },
      });

      if (!signature) {
        throw new NotFoundError("Signature", `${profileId}-${type}`);
      }

      sendSuccess(res, signature);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create or update signature
   */
  async createOrUpdateSignature(req: Request, res: Response, next: NextFunction) {
    try {
      const { profileId } = req.params;
      const { signatureType, signatureData, printedName, signatureDate } = req.body;

      const signature = await prisma.signature.upsert({
        where: {
          profileId_signatureType: {
            profileId,
            signatureType: signatureType as SignatureType,
          },
        },
        create: {
          profileId,
          signatureType: signatureType as SignatureType,
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

      sendSuccess(res, signature, signature ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete signature
   */
  async deleteSignature(req: Request, res: Response, next: NextFunction) {
    try {
      const { profileId, type } = req.params;
      await prisma.signature.delete({
        where: {
          profileId_signatureType: {
            profileId,
            signatureType: type as SignatureType,
          },
        },
      });
      sendSuccess(res, { message: "Signature deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export const signatureController = new SignatureController();

