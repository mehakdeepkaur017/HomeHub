"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Home, Box, PackageOpen, FileText, Wrench, Users, Activity, ActivitySquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const nodes = [
  { id: "home", label: "HOME", icon: Home, x: 50, y: 10 },
  { id: "rooms", label: "ROOMS", icon: Box, x: 20, y: 40 },
  { id: "family", label: "FAMILY", icon: Users, x: 80, y: 40 },
  { id: "assets", label: "ASSETS", icon: PackageOpen, x: 20, y: 70 },
  { id: "documents", label: "DOCUMENTS", icon: FileText, x: 50, y: 60 },
  { id: "activity", label: "ACTIVITY", icon: Activity, x: 80, y: 70 },
  { id: "maintenance", label: "MAINTENANCE", icon: Wrench, x: 35, y: 90 },
  { id: "health", label: "HOME HEALTH", icon: ActivitySquare, x: 65, y: 90 },
];

const connections = [
  ["home", "rooms"],
  ["home", "family"],
  ["rooms", "assets"],
  ["assets", "documents"],
  ["assets", "maintenance"],
  ["family", "activity"],
  ["rooms", "activity"],
  ["maintenance", "health"],
  ["activity", "health"],
  ["documents", "health"],
];

export function EcosystemGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getIsConnected = (n1: string, n2: string) => {
    if (!hoveredNode) return true; // all connected if nothing hovered
    if (n1 === hoveredNode || n2 === hoveredNode) {
      return connections.some(c => (c[0] === n1 && c[1] === n2) || (c[0] === n2 && c[1] === n1));
    }
    return false;
  };

  const getIsNodeActive = (id: string) => {
    if (!hoveredNode) return true;
    if (id === hoveredNode) return true;
    return connections.some(c => (c[0] === id && c[1] === hoveredNode) || (c[0] === hoveredNode && c[1] === id));
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      
      {/* SVG Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map(([source, target], i) => {
          const sourceNode = nodes.find(n => n.id === source)!;
          const targetNode = nodes.find(n => n.id === target)!;
          
          const isConnected = getIsConnected(source, target);
          const isDirectlyHovered = hoveredNode === source || hoveredNode === target;

          return (
            <motion.line
              key={`${source}-${target}`}
              x1={`${sourceNode.x}%`}
              y1={`${sourceNode.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              stroke="var(--color-primary)"
              strokeWidth={isDirectlyHovered ? 2 : 1}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: isConnected ? (isDirectlyHovered ? 0.6 : 0.2) : 0.05 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const isActive = getIsNodeActive(node.id);
        const Icon = node.icon;

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: i * 0.1 + 0.5 }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <Card 
              variant="floating" 
              className={`flex items-center gap-3 p-3 transition-all duration-300 ${
                isActive 
                  ? "bg-background shadow-md border-primary/20 scale-105" 
                  : "bg-background/50 opacity-40 scale-95 border-transparent shadow-none"
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-label ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {node.label}
              </span>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
