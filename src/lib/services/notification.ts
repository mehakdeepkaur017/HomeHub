import { prisma } from "@/lib/prisma";

export type NotificationSeverity = "INFO" | "WARNING" | "ERROR" | "SUCCESS";
export type NotificationCategory = "SYSTEM" | "INVITATION" | "SECURITY" | "GENERAL";

export interface SendNotificationParams {
  title: string;
  description: string;
  homeId: string;
  userId: string;
  severity?: NotificationSeverity;
  category?: NotificationCategory;
}

export async function sendNotification(params: SendNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title: params.title,
        description: params.description,
        homeId: params.homeId,
        userId: params.userId,
        severity: params.severity || "INFO",
        category: params.category || "GENERAL",
      },
    });
    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
}
