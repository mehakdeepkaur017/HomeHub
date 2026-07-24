import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export type RelationItem = {
  id: string;
  title: string;
  type: "SPACE" | "ASSET" | "DOCUMENT" | "MAINTENANCE" | "EXPENSE" | "MEMBER";
  subtitle?: string;
  link: string;
};

export type GlobalRelations = {
  spaces: RelationItem[];
  assets: RelationItem[];
  documents: RelationItem[];
  maintenance: RelationItem[];
  expenses: RelationItem[];
  members: RelationItem[];
  insights: string[];
};

export type TargetType = "SPACE" | "ASSET" | "DOCUMENT" | "MAINTENANCE" | "EXPENSE" | "MEMBER";

export async function getGlobalRelations(
  homeId: string,
  targetId: string,
  targetType: TargetType
): Promise<GlobalRelations> {
  const relations: GlobalRelations = {
    spaces: [],
    assets: [],
    documents: [],
    maintenance: [],
    expenses: [],
    members: [],
    insights: [],
  };

  try {
    const home = await prisma.home.findUnique({ where: { id: homeId }, select: { currency: true } });
    const currency = home?.currency || "USD";

    if (targetType === "SPACE") {
      const space = await prisma.space.findUnique({
        where: { id: targetId, homeId },
        include: {
          assets: true,
          documents: true,
          maintenance: true,
          expenses: true,
          createdBy: true,
          childSpaces: true,
          parentSpace: true,
        },
      });

      if (space) {
        if (space.parentSpace) {
          relations.spaces.push({ id: space.parentSpace.id, title: space.parentSpace.name, type: "SPACE", link: `/spaces/${space.parentSpace.id}`, subtitle: "Parent Space" });
        }
        space.childSpaces.forEach(c => relations.spaces.push({ id: c.id, title: c.name, type: "SPACE", link: `/spaces/${c.id}`, subtitle: "Sub-space" }));
        space.assets.forEach(a => relations.assets.push({ id: a.id, title: a.name, type: "ASSET", link: `/assets/${a.id}`, subtitle: a.category }));
        space.documents.forEach(d => relations.documents.push({ id: d.id, title: d.title, type: "DOCUMENT", link: `/vault/${d.id}`, subtitle: d.category }));
        space.maintenance.forEach(m => relations.maintenance.push({ id: m.id, title: m.title, type: "MAINTENANCE", link: `/care/${m.id}`, subtitle: m.status }));
        space.expenses.forEach(e => relations.expenses.push({ id: e.id, title: e.title, type: "EXPENSE", link: `/money/${e.id}`, subtitle: `${e.currency} ${e.amount}` }));
        
        if (space.createdBy) {
          relations.members.push({ id: space.createdBy.id, title: space.createdBy.name || "Unknown", type: "MEMBER", link: `/family/${space.createdBy.id}`, subtitle: "Creator" });
        }

        // Insights
        if (space.assets.length > 0) {
          relations.insights.push(`This space contains ${space.assets.length} documented asset${space.assets.length > 1 ? "s" : ""}.`);
        }
        const totalInvestment = space.expenses.reduce((acc, exp) => acc + exp.amount, 0) + space.assets.reduce((acc, a) => acc + (a.purchasePrice || 0), 0);
        if (totalInvestment > 0) {
          relations.insights.push(`This space represents a combined investment of ${formatCurrency(totalInvestment, currency)}.`);
        }
      }
    }

    if (targetType === "ASSET") {
      const asset = await prisma.asset.findUnique({
        where: { id: targetId, homeId },
        include: {
          space: true,
          documents: true,
          maintenance: true,
          expenses: true,
          createdBy: true,
        },
      });

      if (asset) {
        if (asset.space) {
          relations.spaces.push({ id: asset.space.id, title: asset.space.name, type: "SPACE", link: `/spaces/${asset.space.id}`, subtitle: "Location" });
        }
        asset.documents.forEach(d => relations.documents.push({ id: d.id, title: d.title, type: "DOCUMENT", link: `/vault/${d.id}`, subtitle: d.category }));
        asset.maintenance.forEach(m => relations.maintenance.push({ id: m.id, title: m.title, type: "MAINTENANCE", link: `/care/${m.id}`, subtitle: m.status }));
        asset.expenses.forEach(e => relations.expenses.push({ id: e.id, title: e.title, type: "EXPENSE", link: `/money/${e.id}`, subtitle: `${e.currency} ${e.amount}` }));
        
        if (asset.createdBy) {
          relations.members.push({ id: asset.createdBy.id, title: asset.createdBy.name || "Unknown", type: "MEMBER", link: `/family/${asset.createdBy.id}`, subtitle: "Added by" });
        }

        // Insights
        if (asset.maintenance.length > 0) {
          relations.insights.push(`This asset has required maintenance ${asset.maintenance.length} time${asset.maintenance.length > 1 ? "s" : ""}.`);
        }
        if (asset.documents.some(d => d.category.toLowerCase().includes("warranty"))) {
          relations.insights.push("Warranty documentation is safely stored and linked.");
        }
      }
    }

    if (targetType === "DOCUMENT") {
      const doc = await prisma.document.findUnique({
        where: { id: targetId, homeId },
        include: {
          space: true,
          asset: true,
          maintenance: true,
          expense: true,
          uploadedBy: true,
          relatedMember: true,
        },
      });

      if (doc) {
        if (doc.space) relations.spaces.push({ id: doc.space.id, title: doc.space.name, type: "SPACE", link: `/spaces/${doc.space.id}` });
        if (doc.asset) relations.assets.push({ id: doc.asset.id, title: doc.asset.name, type: "ASSET", link: `/assets/${doc.asset.id}` });
        if (doc.maintenance) relations.maintenance.push({ id: doc.maintenance.id, title: doc.maintenance.title, type: "MAINTENANCE", link: `/care/${doc.maintenance.id}` });
        if (doc.expense) relations.expenses.push({ id: doc.expense.id, title: doc.expense.title, type: "EXPENSE", link: `/money/${doc.expense.id}` });
        if (doc.uploadedBy) relations.members.push({ id: doc.uploadedBy.id, title: doc.uploadedBy.name || "Unknown", type: "MEMBER", link: `/family/${doc.uploadedBy.id}`, subtitle: "Uploader" });
        if (doc.relatedMember && doc.relatedMember.id !== doc.uploadedBy?.id) {
          relations.members.push({ id: doc.relatedMember.id, title: doc.relatedMember.name || "Unknown", type: "MEMBER", link: `/family/${doc.relatedMember.id}`, subtitle: "Subject" });
        }

        const refCount = [doc.space, doc.asset, doc.maintenance, doc.expense, doc.relatedMember].filter(Boolean).length;
        if (refCount > 0) {
          relations.insights.push(`This document is cross-referenced by ${refCount} other record${refCount > 1 ? "s" : ""}.`);
        }
      }
    }

    if (targetType === "MAINTENANCE") {
      const task = await prisma.maintenance.findUnique({
        where: { id: targetId, homeId },
        include: {
          space: true,
          asset: true,
          documents: true,
          expenses: true,
          createdBy: true,
          assignedTo: true,
          completedBy: true,
        },
      });

      if (task) {
        if (task.space) relations.spaces.push({ id: task.space.id, title: task.space.name, type: "SPACE", link: `/spaces/${task.space.id}` });
        if (task.asset) relations.assets.push({ id: task.asset.id, title: task.asset.name, type: "ASSET", link: `/assets/${task.asset.id}` });
        task.documents.forEach(d => relations.documents.push({ id: d.id, title: d.title, type: "DOCUMENT", link: `/vault/${d.id}` }));
        task.expenses.forEach(e => relations.expenses.push({ id: e.id, title: e.title, type: "EXPENSE", link: `/money/${e.id}` }));
        
        if (task.createdBy) relations.members.push({ id: task.createdBy.id, title: task.createdBy.name || "Unknown", type: "MEMBER", link: `/family/${task.createdBy.id}`, subtitle: "Creator" });
        if (task.assignedTo && task.assignedTo.id !== task.createdBy?.id) relations.members.push({ id: task.assignedTo.id, title: task.assignedTo.name || "Unknown", type: "MEMBER", link: `/family/${task.assignedTo.id}`, subtitle: "Assignee" });
        if (task.completedBy && task.completedBy.id !== task.assignedTo?.id && task.completedBy.id !== task.createdBy?.id) relations.members.push({ id: task.completedBy.id, title: task.completedBy.name || "Unknown", type: "MEMBER", link: `/family/${task.completedBy.id}`, subtitle: "Completed by" });

        const totalCost = task.expenses.reduce((sum, e) => sum + e.amount, 0) + (task.actualCost || 0);
        if (totalCost > 0) {
          relations.insights.push(`This task incurred a total recorded cost of ${formatCurrency(totalCost, currency)}.`);
        }
      }
    }

    if (targetType === "EXPENSE") {
      const expense = await prisma.expense.findUnique({
        where: { id: targetId, homeId },
        include: {
          space: true,
          asset: true,
          maintenance: true,
          documents: true,
          createdBy: true,
          approvedBy: true,
        },
      });

      if (expense) {
        if (expense.space) relations.spaces.push({ id: expense.space.id, title: expense.space.name, type: "SPACE", link: `/spaces/${expense.space.id}` });
        if (expense.asset) relations.assets.push({ id: expense.asset.id, title: expense.asset.name, type: "ASSET", link: `/assets/${expense.asset.id}` });
        if (expense.maintenance) relations.maintenance.push({ id: expense.maintenance.id, title: expense.maintenance.title, type: "MAINTENANCE", link: `/care/${expense.maintenance.id}` });
        expense.documents.forEach(d => relations.documents.push({ id: d.id, title: d.title, type: "DOCUMENT", link: `/vault/${d.id}` }));
        
        if (expense.createdBy) relations.members.push({ id: expense.createdBy.id, title: expense.createdBy.name || "Unknown", type: "MEMBER", link: `/family/${expense.createdBy.id}`, subtitle: "Creator" });
        if (expense.approvedBy && expense.approvedBy.id !== expense.createdBy?.id) relations.members.push({ id: expense.approvedBy.id, title: expense.approvedBy.name || "Unknown", type: "MEMBER", link: `/family/${expense.approvedBy.id}`, subtitle: "Approver" });
      }
    }

    if (targetType === "MEMBER") {
      // Find what they created/own
      const [assets, docs, spaces, maintenance, expenses] = await Promise.all([
        prisma.asset.findMany({ where: { homeId, createdById: targetId }, take: 5, orderBy: { createdAt: 'desc' } }),
        prisma.document.findMany({ where: { homeId, uploadedById: targetId }, take: 5, orderBy: { createdAt: 'desc' } }),
        prisma.space.findMany({ where: { homeId, createdById: targetId }, take: 5, orderBy: { createdAt: 'desc' } }),
        prisma.maintenance.findMany({ where: { homeId, assignedToId: targetId }, take: 5, orderBy: { createdAt: 'desc' } }),
        prisma.expense.findMany({ where: { homeId, createdById: targetId }, take: 5, orderBy: { createdAt: 'desc' } }),
      ]);

      spaces.forEach(s => relations.spaces.push({ id: s.id, title: s.name, type: "SPACE", link: `/spaces/${s.id}` }));
      assets.forEach(a => relations.assets.push({ id: a.id, title: a.name, type: "ASSET", link: `/assets/${a.id}` }));
      docs.forEach(d => relations.documents.push({ id: d.id, title: d.title, type: "DOCUMENT", link: `/vault/${d.id}` }));
      maintenance.forEach(m => relations.maintenance.push({ id: m.id, title: m.title, type: "MAINTENANCE", link: `/care/${m.id}` }));
      expenses.forEach(e => relations.expenses.push({ id: e.id, title: e.title, type: "EXPENSE", link: `/money/${e.id}` }));

      const totalItems = assets.length + docs.length + spaces.length + maintenance.length + expenses.length;
      if (totalItems > 0) {
        relations.insights.push(`This member is actively connected to ${totalItems}+ items in the home.`);
      }
    }

  } catch (error) {
    console.error("Error fetching relations:", error);
  }

  return relations;
}
