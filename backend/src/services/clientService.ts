import { prisma } from "../prisma";
import { NotFoundError } from "../utils/errors";
import { calculatePagination, PaginationInfo } from "../utils/responses";
import { PAGINATION } from "../config/constants";

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
}

export class ClientService {
  async createClient(adminId: string, data: CreateClientData) {
    return await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        createdBy: adminId,
      },
    });
  }

  async getClientById(clientId: string) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        investorProfiles: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        statementProfiles: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        additionalHolderProfiles: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        altOrderProfiles: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        accreditationProfiles: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    return client;
  }

  async listClients(
    page: number = 1,
    limit: number = PAGINATION.DEFAULT_LIMIT,
    search?: string
  ): Promise<{ clients: any[]; pagination: PaginationInfo }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          investorProfiles: {
            select: { id: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          statementProfiles: {
            select: { id: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          additionalHolderProfiles: {
            select: { id: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          altOrderProfiles: {
            select: { id: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          accreditationProfiles: {
            select: { id: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return {
      clients,
      pagination: calculatePagination(total, page, limit),
    };
  }

  async updateClient(clientId: string, data: UpdateClientData) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    return await prisma.client.update({
      where: { id: clientId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });
  }

  async deleteClient(clientId: string) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    // Cascade delete will handle profiles
    await prisma.client.delete({
      where: { id: clientId },
    });

    return { success: true };
  }
}

export const clientService = new ClientService();


