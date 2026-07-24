import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { DocumentDetailClient } from "./components/document-detail-client";
import { RelationshipPanel } from "@/components/ui/relationship-panel";

export const dynamic = "force-dynamic";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const resolvedParams = await params;
  const documentId = resolvedParams.documentId;
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;

  if (!homeId) {
    return null;
  }

  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
      homeId: homeId,
    },
    include: {
      space: {
        include: {
          parentSpace: true,
        }
      },
      asset: true,
      home: true,
      uploadedBy: true,
      relatedMember: true,
      maintenance: true,
      expense: true,
    },
  });

  if (!document) {
    notFound();
  }

  // Fetch activities related to this document
  const activities = await prisma.activity.findMany({
    where: {
      homeId: homeId,
      targetId: documentId,
      targetType: "DOCUMENT",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: { name: true, avatar: true }
      }
    }
  });

  // Record a VIEW activity since they opened the document page
  // We do this asynchronously to not block the render
  prisma.activity.create({
    data: {
      type: "DOCUMENT_VIEWED",
      description: `Viewed document: ${document.title}`,
      targetId: documentId,
      targetType: "DOCUMENT",
      homeId: homeId,
      // We don't have the userId from cookies directly easily here without full auth,
      // but usually middleware handles it. For this feature it's okay to skip user tracking for simple views or handle it via a client-side API call.
    }
  }).catch(() => {});

  return (
    <DocumentDetailClient 
      document={document} 
      activities={activities} 
      relationshipsPanel={<RelationshipPanel homeId={homeId} targetId={document.id} targetType="DOCUMENT" />}
    />
  );
}
