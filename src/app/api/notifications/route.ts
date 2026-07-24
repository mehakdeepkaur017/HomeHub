import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withHomeAuth, AuthenticatedRequest } from "@/lib/api-auth";
import { isToday, isYesterday, isThisWeek } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const GET = withHomeAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const homeId = req.home!.id;

    // Fetch the raw activities
    const activities = await prisma.activity.findMany({
      where: { homeId },
      orderBy: { createdAt: "desc" },
      take: 100, // Reasonable limit for the drawer
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        space: { select: { id: true, name: true } },
      }
    });

    // Smart Grouping Logic
    const groupedActivities = [];
    let currentGroup = null;

    for (const activity of activities) {
      if (!currentGroup) {
        currentGroup = { ...activity, groupCount: 1, groupItems: [activity] };
        continue;
      }

      // Group if same type, same day, and same severity
      const isSameDay = activity.createdAt.toDateString() === currentGroup.createdAt.toDateString();
      const isSameType = activity.type === currentGroup.type;

      // Some activity types don't make sense to group (e.g. HOME_UPDATED), but creation events do.
      const groupableTypes = ["ASSET_CREATED", "SPACE_CREATED", "DOCUMENT_UPLOADED", "MAINTENANCE_CREATED", "EXPENSE_CREATED"];

      if (isSameType && isSameDay && groupableTypes.includes(activity.type)) {
        currentGroup.groupCount += 1;
        currentGroup.groupItems.push(activity);
      } else {
        groupedActivities.push(currentGroup);
        currentGroup = { ...activity, groupCount: 1, groupItems: [activity] };
      }
    }
    
    if (currentGroup) {
      groupedActivities.push(currentGroup);
    }

    // Bucket into chronological groups
    const buckets = {
      today: [] as unknown[],
      yesterday: [] as unknown[],
      thisWeek: [] as unknown[],
      earlier: [] as unknown[]
    };

    groupedActivities.forEach(item => {
      if (isToday(item.createdAt)) {
        buckets.today.push(item);
      } else if (isYesterday(item.createdAt)) {
        buckets.yesterday.push(item);
      } else if (isThisWeek(item.createdAt)) {
        buckets.thisWeek.push(item);
      } else {
        buckets.earlier.push(item);
      }
    });

    return NextResponse.json(buckets);
  } catch (error) {
    console.error("[NOTIFICATIONS_API_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
