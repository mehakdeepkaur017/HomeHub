"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PackageOpen, 
  MapPin, 
  FileText, 
  Wrench, 
  CreditCard, 
  User, 
  LucideIcon 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type NodeType = "ASSET" | "SPACE" | "DOCUMENT" | "MAINTENANCE" | "EXPENSE" | "MEMBER";

export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  subtitle?: string;
  image?: string | null;
  link: string;
}

interface ConnectedHomeGraphProps {
  centralNode: GraphNode;
  satellites: GraphNode[];
}

const TYPE_CONFIG: Record<NodeType, { icon: LucideIcon; color: string; bg: string }> = {
  ASSET: { icon: PackageOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  SPACE: { icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  DOCUMENT: { icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
  MAINTENANCE: { icon: Wrench, color: "text-rose-500", bg: "bg-rose-500/10" },
  EXPENSE: { icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10" },
  MEMBER: { icon: User, color: "text-indigo-500", bg: "bg-indigo-500/10" }
};

export function ConnectedHomeGraph({ centralNode, satellites }: ConnectedHomeGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  
  const radius = Math.min(dimensions.width, dimensions.height) / 2.5;

  const positions = useMemo(() => {
    const total = satellites.length;
    return satellites.map((node, index) => {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [satellites, centerX, centerY, radius]);

  const renderNodeCard = ({ node, isCenter, x, y }: { node: GraphNode, isCenter?: boolean, x: number, y: number }) => {
    const config = TYPE_CONFIG[node.type];
    const Icon = config.icon;
    const isHovered = hoveredNode === node.id;
    const opacity = hoveredNode === null ? 1 : (isHovered || isCenter ? 1 : 0.4);

    return (
      <motion.div
        key={`node-${node.id}`}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ left: x, top: y }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        whileHover={{ scale: 1.05 }}
      >
        <Link href={node.link}>
          <div className={cn(
            "relative flex items-center gap-4 rounded-3xl border bg-card/60 backdrop-blur-2xl transition-all duration-500",
            isCenter ? "p-4 border-primary/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-4 ring-primary/10" : "p-3 border-border/60 hover:border-primary/40 hover:bg-card/90",
            isHovered && "shadow-float border-primary/50 scale-105 bg-card"
          )}>
            <div className={cn("p-2.5 rounded-xl shrink-0", config.bg)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div className="pr-4 whitespace-nowrap">
              <p className={cn("font-medium", isCenter ? "text-base" : "text-sm")}>{node.name}</p>
              {node.subtitle && <p className="text-xs text-muted-foreground">{node.subtitle}</p>}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="w-full relative rounded-3xl border border-border/50 bg-secondary/20 overflow-hidden" style={{ height: "600px" }} ref={containerRef}>
      
      {/* Background ambient glow based on hovered node */}
      <div className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-700 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* SVG Connectors */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <AnimatePresence>
          {positions.map((pos, index) => {
            const isHovered = hoveredNode === pos.id || hoveredNode === centralNode.id;
            const strokeColor = isHovered ? "hsl(var(--primary))" : "hsl(var(--border))";
            const strokeWidth = isHovered ? 2 : 1.5;
            const opacity = hoveredNode === null ? 0.3 : (isHovered ? 0.8 : 0.1);
            
            // Organic Bezier Curves
            const dx = pos.x - centerX;
            const dy = pos.y - centerY;
            const sign = index % 2 === 0 ? 1 : -1;
            const cp1x = centerX + dx * 0.4 + dy * 0.2 * sign;
            const cp1y = centerY + dy * 0.4 - dx * 0.2 * sign;
            const cp2x = centerX + dx * 0.6 - dy * 0.2 * sign;
            const cp2y = centerY + dy * 0.6 + dx * 0.2 * sign;
            
            const pathData = `M ${centerX} ${centerY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pos.x} ${pos.y}`;

            return (
              <motion.path
                key={`line-${pos.id}`}
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                filter={isHovered ? "url(#glow)" : ""}
                strokeDasharray={isHovered ? "none" : "4 4"}
              />
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Center Node */}
      {renderNodeCard({ node: centralNode, isCenter: true, x: centerX, y: centerY })}

      {/* Satellite Nodes */}
      {positions.map((pos) => renderNodeCard({ node: pos, x: pos.x, y: pos.y }))}

      {satellites.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No connections found.
        </div>
      )}
    </div>
  );
}
