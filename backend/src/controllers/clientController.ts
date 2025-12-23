import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { clientService } from "../services/clientService";
import { sendSuccess, sendError } from "../utils/responses";
import { AppError } from "../utils/errors";

export class ClientController {
  async createClient(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user!.sub;
      const client = await clientService.createClient(adminId, req.body);
      return sendSuccess(res, client, 201);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error creating client:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to create client", 500);
    }
  }

  async getClient(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const client = await clientService.getClientById(id);
      return sendSuccess(res, client);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error getting client:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to get client", 500);
    }
  }

  async listClients(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;

      const result = await clientService.listClients(page, limit, search);
      return sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error listing clients:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to list clients", 500);
    }
  }

  async updateClient(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const client = await clientService.updateClient(id, req.body);
      return sendSuccess(res, client);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error updating client:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to update client", 500);
    }
  }

  async deleteClient(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await clientService.deleteClient(id);
      return sendSuccess(res, null);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.code, error.message, error.statusCode, error.details);
      }
      console.error("Error deleting client:", error);
      return sendError(res, "INTERNAL_SERVER_ERROR", error.message || "Failed to delete client", 500);
    }
  }
}

export const clientController = new ClientController();


