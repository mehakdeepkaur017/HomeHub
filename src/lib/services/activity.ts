import { prisma } from "@/lib/prisma";

export type ActivitySeverity = "INFO" | "WARNING" | "ERROR" | "SUCCESS";

export interface LogActivityParams {
  type: string;
  description: string;
  homeId: string;
  userId?: string;
  targetId?: string;
  targetType?: string;
  spaceId?: string;
  severity?: ActivitySeverity;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const activity = await prisma.activity.create({
      data: {
        type: params.type,
        description: params.description,
        homeId: params.homeId,
        userId: params.userId,
        targetId: params.targetId,
        targetType: params.targetType,
        spaceId: params.spaceId,
        severity: params.severity || "INFO",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: params.metadata ? (params.metadata as any) : undefined,
      },
    });
    return activity;
  } catch (error) {
    console.error("Failed to log activity:", error);
    // We don't want activity logging failures to break the main application flow
    return null;
  }
}
