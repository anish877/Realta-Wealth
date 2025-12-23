import { prisma } from "../prisma";
import { NotFoundError } from "../utils/errors";

export class AnalyticsService {
  async getDashboardAnalytics() {
    // Total clients count
    const totalClients = await prisma.client.count();

    // Forms completed count (by type) - only count client-scoped profiles
    const [
      investorCompleted,
      statementCompleted,
      additionalHolderCompleted,
      altOrderCompleted,
      accreditationCompleted,
    ] = await Promise.all([
      prisma.investorProfile.count({
        where: { status: "submitted", clientId: { not: null } },
      }),
      prisma.statementProfile.count({
        where: { status: "submitted", clientId: { not: null } },
      }),
      prisma.additionalHolderProfile.count({
        where: { status: "submitted", clientId: { not: null } },
      }),
      prisma.altOrderProfile.count({
        where: { status: "submitted", clientId: { not: null } },
      }),
      prisma.accreditationProfile.count({
        where: { status: "submitted", clientId: { not: null } },
      }),
    ]);

    // Forms in progress count - only count client-scoped profiles
    const [
      investorInProgress,
      statementInProgress,
      additionalHolderInProgress,
      altOrderInProgress,
      accreditationInProgress,
    ] = await Promise.all([
      prisma.investorProfile.count({
        where: { status: "draft", clientId: { not: null } },
      }),
      prisma.statementProfile.count({
        where: { status: "draft", clientId: { not: null } },
      }),
      prisma.additionalHolderProfile.count({
        where: { status: "draft", clientId: { not: null } },
      }),
      prisma.altOrderProfile.count({
        where: { status: "draft", clientId: { not: null } },
      }),
      prisma.accreditationProfile.count({
        where: { status: "draft", clientId: { not: null } },
      }),
    ]);

    // Total forms count (for completion rate calculation) - only count client-scoped profiles
    const [
      totalInvestor,
      totalStatement,
      totalAdditionalHolder,
      totalAltOrder,
      totalAccreditation,
    ] = await Promise.all([
      prisma.investorProfile.count({ where: { clientId: { not: null } } }),
      prisma.statementProfile.count({ where: { clientId: { not: null } } }),
      prisma.additionalHolderProfile.count({ where: { clientId: { not: null } } }),
      prisma.altOrderProfile.count({ where: { clientId: { not: null } } }),
      prisma.accreditationProfile.count({ where: { clientId: { not: null } } }),
    ]);

    // Completion rates per form type
    const completionRates = {
      investorProfile:
        totalInvestor > 0 ? (investorCompleted / totalInvestor) * 100 : 0,
      statement: totalStatement > 0 ? (statementCompleted / totalStatement) * 100 : 0,
      additionalHolder:
        totalAdditionalHolder > 0
          ? (additionalHolderCompleted / totalAdditionalHolder) * 100
          : 0,
      altOrder: totalAltOrder > 0 ? (altOrderCompleted / totalAltOrder) * 100 : 0,
      accreditation:
        totalAccreditation > 0
          ? (accreditationCompleted / totalAccreditation) * 100
          : 0,
    };

    // Recent activity (last 10 form submissions/updates)
    // Only include profiles that have a clientId (client-scoped profiles)
    const [investorActivities, statementActivities, additionalHolderActivities, altOrderActivities, accreditationActivities] = await Promise.all([
      // Investor profiles
      prisma.investorProfile.findMany({
        where: { clientId: { not: null } },
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          client: {
            select: { id: true, name: true },
          },
        },
      }),
      // Statement profiles
      prisma.statementProfile.findMany({
        where: { clientId: { not: null } },
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          client: {
            select: { id: true, name: true },
          },
        },
      }),
      // Additional holder profiles
      prisma.additionalHolderProfile.findMany({
        where: { clientId: { not: null } },
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          client: {
            select: { id: true, name: true },
          },
        },
      }),
      // Alt order profiles
      prisma.altOrderProfile.findMany({
        where: { clientId: { not: null } },
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          client: {
            select: { id: true, name: true },
          },
        },
      }),
      // Accreditation profiles
      prisma.accreditationProfile.findMany({
        where: { clientId: { not: null } },
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          status: true,
          updatedAt: true,
          client: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    // Flatten and sort by updatedAt, adding formType
    const allActivities = [
      ...investorActivities.map((a: any) => ({ ...a, formType: "investorProfile" })),
      ...statementActivities.map((a: any) => ({ ...a, formType: "statement" })),
      ...additionalHolderActivities.map((a: any) => ({ ...a, formType: "additionalHolder" })),
      ...altOrderActivities.map((a: any) => ({ ...a, formType: "altOrder" })),
      ...accreditationActivities.map((a: any) => ({ ...a, formType: "accreditation" })),
    ]
      .sort(
        (a: any, b: any) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 10);

    // Form status breakdown - only count client-scoped profiles
    const statusBreakdown = {
      investorProfile: {
        draft: await prisma.investorProfile.count({ where: { status: "draft", clientId: { not: null } } }),
        submitted: await prisma.investorProfile.count({
          where: { status: "submitted", clientId: { not: null } },
        }),
        approved: await prisma.investorProfile.count({
          where: { status: "approved", clientId: { not: null } },
        }),
        rejected: await prisma.investorProfile.count({
          where: { status: "rejected", clientId: { not: null } },
        }),
      },
      statement: {
        draft: await prisma.statementProfile.count({ where: { status: "draft", clientId: { not: null } } }),
        submitted: await prisma.statementProfile.count({
          where: { status: "submitted", clientId: { not: null } },
        }),
        approved: await prisma.statementProfile.count({
          where: { status: "approved", clientId: { not: null } },
        }),
        rejected: await prisma.statementProfile.count({
          where: { status: "rejected", clientId: { not: null } },
        }),
      },
      additionalHolder: {
        draft: await prisma.additionalHolderProfile.count({
          where: { status: "draft", clientId: { not: null } },
        }),
        submitted: await prisma.additionalHolderProfile.count({
          where: { status: "submitted", clientId: { not: null } },
        }),
        approved: await prisma.additionalHolderProfile.count({
          where: { status: "approved", clientId: { not: null } },
        }),
        rejected: await prisma.additionalHolderProfile.count({
          where: { status: "rejected", clientId: { not: null } },
        }),
      },
      altOrder: {
        draft: await prisma.altOrderProfile.count({ where: { status: "draft", clientId: { not: null } } }),
        submitted: await prisma.altOrderProfile.count({
          where: { status: "submitted", clientId: { not: null } },
        }),
        approved: await prisma.altOrderProfile.count({
          where: { status: "approved", clientId: { not: null } },
        }),
        rejected: await prisma.altOrderProfile.count({
          where: { status: "rejected", clientId: { not: null } },
        }),
      },
      accreditation: {
        draft: await prisma.accreditationProfile.count({
          where: { status: "draft", clientId: { not: null } },
        }),
        submitted: await prisma.accreditationProfile.count({
          where: { status: "submitted", clientId: { not: null } },
        }),
        approved: await prisma.accreditationProfile.count({
          where: { status: "approved", clientId: { not: null } },
        }),
        rejected: await prisma.accreditationProfile.count({
          where: { status: "rejected", clientId: { not: null } },
        }),
      },
    };

    return {
      totalClients,
      formsCompleted: {
        investorProfile: investorCompleted,
        statement: statementCompleted,
        additionalHolder: additionalHolderCompleted,
        altOrder: altOrderCompleted,
        accreditation: accreditationCompleted,
        total:
          investorCompleted +
          statementCompleted +
          additionalHolderCompleted +
          altOrderCompleted +
          accreditationCompleted,
      },
      formsInProgress: {
        investorProfile: investorInProgress,
        statement: statementInProgress,
        additionalHolder: additionalHolderInProgress,
        altOrder: altOrderInProgress,
        accreditation: accreditationInProgress,
        total:
          investorInProgress +
          statementInProgress +
          additionalHolderInProgress +
          altOrderInProgress +
          accreditationInProgress,
      },
      completionRates,
      recentActivity: allActivities,
      statusBreakdown,
    };
  }

  async getClientAnalytics(clientId: string) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    // Get all profiles for this client
    const [
      investorProfiles,
      statementProfiles,
      additionalHolderProfiles,
      altOrderProfiles,
      accreditationProfiles,
    ] = await Promise.all([
      prisma.investorProfile.findMany({
        where: { clientId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.statementProfile.findMany({
        where: { clientId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.additionalHolderProfile.findMany({
        where: { clientId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.altOrderProfile.findMany({
        where: { clientId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.accreditationProfile.findMany({
        where: { clientId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // Get latest profile for each type
    const latestInvestor = investorProfiles[0] || null;
    const latestStatement = statementProfiles[0] || null;
    const latestAdditionalHolder = additionalHolderProfiles[0] || null;
    const latestAltOrder = altOrderProfiles[0] || null;
    const latestAccreditation = accreditationProfiles[0] || null;

    // Count completed forms
    const completedCount = [
      latestInvestor?.status === "submitted",
      latestStatement?.status === "submitted",
      latestAdditionalHolder?.status === "submitted",
      latestAltOrder?.status === "submitted",
      latestAccreditation?.status === "submitted",
    ].filter(Boolean).length;

    return {
      client,
      forms: {
        investorProfile: latestInvestor,
        statement: latestStatement,
        additionalHolder: latestAdditionalHolder,
        altOrder: latestAltOrder,
        accreditation: latestAccreditation,
      },
      completionStatus: {
        completed: completedCount,
        total: 5,
        percentage: (completedCount / 5) * 100,
      },
    };
  }

}

export const analyticsService = new AnalyticsService();


