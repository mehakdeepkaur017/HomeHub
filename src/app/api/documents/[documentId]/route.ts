import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const documentId = resolvedParams.documentId;
    
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        homeId: req.home!.id,
      },
      include: {
        space: true,
        asset: true,
        uploadedBy: { select: { name: true, avatar: true } },
        relatedMember: { select: { name: true, avatar: true } },
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const documentId = resolvedParams.documentId;

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        homeId: req.home!.id,
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await prisma.document.delete({
      where: { id: documentId }
    });

    await prisma.activity.create({
      data: {
        type: "DOCUMENT_DELETED",
        description: `Deleted document: ${document.title}`,
        targetId: documentId,
        targetType: "DOCUMENT",
        homeId: req.home!.id,
        userId: req.user!.id,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
});
