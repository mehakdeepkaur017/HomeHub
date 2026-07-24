import { getGlobalRelations, TargetType, RelationItem } from "@/lib/relations";
import { Box, FileText, Receipt, Wrench, Users, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface RelationshipPanelProps {
  homeId: string;
  targetId: string;
  targetType: TargetType;
}

export async function RelationshipPanel({ homeId, targetId, targetType }: RelationshipPanelProps) {
  const relations = await getGlobalRelations(homeId, targetId, targetType);

  const hasRelations =
    relations.spaces.length > 0 ||
    relations.assets.length > 0 ||
    relations.documents.length > 0 ||
    relations.maintenance.length > 0 ||
    relations.expenses.length > 0 ||
    relations.members.length > 0 ||
    relations.insights.length > 0;

  if (!hasRelations) return null;

  return (
    <div className="flex flex-col gap-8">
      {relations.insights.length > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
          <h3 className="flex items-center text-sm font-bold text-primary mb-4 uppercase tracking-widest">
            <Info className="h-4 w-4 mr-2" />
            Home Knowledge
          </h3>
          <div className="space-y-3">
            {relations.insights.map((insight, idx) => (
              <p key={idx} className="text-sm text-foreground/80 leading-relaxed font-serif">
                &quot;{insight}&quot;
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-primary mb-6 uppercase tracking-widest border-b border-border/40 pb-4">
          Everything Connected
        </h3>
        
        <div className="space-y-8">
          <RelationSection title="Related Spaces" items={relations.spaces} icon={Box} />
          <RelationSection title="Related Assets" items={relations.assets} icon={Box} />
          <RelationSection title="Related Documents" items={relations.documents} icon={FileText} />
          <RelationSection title="Related Maintenance" items={relations.maintenance} icon={Wrench} />
          <RelationSection title="Related Expenses" items={relations.expenses} icon={Receipt} />
          <RelationSection title="Related Members" items={relations.members} icon={Users} />
        </div>
      </div>
    </div>
  );
}

function RelationSection({ title, items, icon: Icon }: { title: string; items: RelationItem[]; icon: React.ElementType }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="flex items-center text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5 mr-2 opacity-70" />
        {title} <Badge variant="secondary" className="ml-2 bg-secondary/50 text-[10px] px-1.5 py-0">{items.length}</Badge>
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={item.link}
            className="group flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-secondary/40 transition-colors"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
              {item.subtitle && (
                <span className="text-xs text-muted-foreground truncate mt-0.5">{item.subtitle}</span>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
