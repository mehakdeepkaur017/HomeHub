import { MemberProfileClient } from "./components/member-profile-client";
import { RelationshipPanel } from "@/components/ui/relationship-panel";
import { cookies } from "next/headers";

export default async function MemberProfilePage({ params }: { params: Promise<{ memberId: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const homeId = cookieStore.get("homeId")?.value;
  
  if (!homeId) return null;

  return (
    <MemberProfileClient 
      memberId={resolvedParams.memberId} 
      relationshipsPanel={<RelationshipPanel homeId={homeId} targetId={resolvedParams.memberId} targetType="MEMBER" />}
    />
  );
}
