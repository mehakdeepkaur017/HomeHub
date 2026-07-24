"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banknote, Plus, PackageOpen, MapPin, FileText, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useHome } from "@/components/providers/home-provider";
import { formatCurrency } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MoneyDashboardClient({ initialExpenses }: { initialExpenses: any[] }) {
  const [activeTab, setActiveTab] = useState("overview");
  const { completion } = useOnboarding();
  const { activeHome } = useHome();

  const hasData = initialExpenses.length > 0;

  // Basic aggregations
  const totalSpent = initialExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const now = new Date();
  const thisMonthExpenses = initialExpenses.filter(e => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by Space
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spaceSpending: any = {};
  initialExpenses.forEach(exp => {
    if (exp.space) {
      if (!spaceSpending[exp.space.id]) {
        spaceSpending[exp.space.id] = { name: exp.space.name, total: 0, count: 0 };
      }
      spaceSpending[exp.space.id].total += exp.amount;
      spaceSpending[exp.space.id].count += 1;
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topSpaces = Object.values(spaceSpending).sort((a: any, b: any) => b.total - a.total).slice(0, 5);

  // Group by Asset
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assetSpending: any = {};
  initialExpenses.forEach(exp => {
    if (exp.asset) {
      if (!assetSpending[exp.asset.id]) {
        assetSpending[exp.asset.id] = { name: exp.asset.name, total: 0, count: 0 };
      }
      assetSpending[exp.asset.id].total += exp.amount;
      assetSpending[exp.asset.id].count += 1;
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topAssets = Object.values(assetSpending).sort((a: any, b: any) => b.total - a.total).slice(0, 5);

  // Group by Category for Pie Chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categorySpending: any = {};
  initialExpenses.forEach(exp => {
    const cat = exp.category || "Uncategorized";
    if (!categorySpending[cat]) {
      categorySpending[cat] = 0;
    }
    categorySpending[cat] += exp.amount;
  });
  
  const pieData = Object.entries(categorySpending).map(([name, value]) => ({
    name, value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })).sort((a: any, b: any) => b.value - a.value);

  const COLORS = ['#2D3648', '#3E4C59', '#7B8794', '#9AA5B1', '#CBD2D9', '#E4E7EB'];

  // Monthly Trend for Bar Chart
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monthlyDataMap: any = {};
  
  // Last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
    monthlyDataMap[key] = 0;
  }

  initialExpenses.forEach(exp => {
    const d = new Date(exp.expenseDate);
    const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
    if (monthlyDataMap[key] !== undefined) {
      monthlyDataMap[key] += exp.amount;
    }
  });

  const barData = Object.entries(monthlyDataMap).map(([name, total]) => ({
    name,
    total
  }));

  // Recommendations Engine
  const insights = [];
  if (pieData.length > 0) {
    insights.push(`Your highest spending category is ${pieData[0].name}, accounting for ${Math.round((pieData[0].value as number / totalSpent) * 100)}% of total expenses.`);
  }
  if (topSpaces.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insights.push(`The ${(topSpaces[0] as any).name} accounts for the most spatial investment at ${formatCurrency((topSpaces[0] as any).total, activeHome?.currency)}.`);
  }

  if (thisMonthTotal > 0) {
    insights.push(`You have recorded ${formatCurrency(thisMonthTotal, activeHome?.currency)} in expenses this month.`);
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-32 space-y-10"
    >
      <PageHeader
        title="Financial Memory."
        description="Track and connect every investment to your home."
        actions={
          <Link href="/money/create" className="hidden sm:block">
            <Button className="h-12 rounded-2xl px-6 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Log Expense
            </Button>
          </Link>
        }
      />

      {!hasData ? (
         <motion.section 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="mt-16"
         >
           <Card className="p-8 md:p-16 border border-border/50 bg-card shadow-sm rounded-[2.5rem]">
             <EmptyState
               icon={Banknote}
               title={!completion.isComplete ? "Track your investments." : "Your home's financial history."}
               description={!completion.isComplete ? "Track every investment you make into your home." : "Log your first expense or renovation to start tracking your home's total cost of ownership."}
               actionLabel="Record First Expense"
               onAction={() => window.location.href = "/money/create"}
             />
           </Card>
         </motion.section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
             
             {/* Key Metrics */}
             <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 border border-border/50 rounded-3xl bg-card shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                   <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">Total Recorded Investment</h3>
                   <div className="flex items-baseline gap-2">
                     <span className="text-4xl md:text-5xl font-serif text-primary">{formatCurrency(totalSpent, activeHome?.currency)}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm border-t border-border/40 pt-4">
                     <span className="text-muted-foreground">This month</span>
                     <span className="font-medium text-foreground">{formatCurrency(thisMonthTotal, activeHome?.currency)}</span>
                   </div>
                </Card>

                <Card className="p-8 border border-border/50 rounded-3xl bg-card shadow-sm flex flex-col space-y-6 relative overflow-hidden">
                   <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Insights</h3>
                   <div className="flex-1 flex flex-col gap-4 justify-center">
                     {insights.slice(0, 2).map((insight, i) => (
                       <div key={i} className="flex gap-3 items-start">
                         <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                         <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
                       </div>
                     ))}
                   </div>
                </Card>
             </section>

             {/* TABS Navigation */}
             <div className="flex items-center gap-6 border-b border-border/40 pb-4">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={cn("text-sm font-medium transition-colors relative", activeTab === "overview" ? "text-primary" : "text-muted-foreground")}
                >
                  Overview
                  {activeTab === "overview" && (
                    <motion.div layoutId="moneyTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab("recent")}
                  className={cn("text-sm font-medium transition-colors relative", activeTab === "recent" ? "text-primary" : "text-muted-foreground")}
                >
                  Recent
                  {activeTab === "recent" && (
                    <motion.div layoutId="moneyTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab("spaces")}
                  className={cn("text-sm font-medium transition-colors relative", activeTab === "spaces" ? "text-primary" : "text-muted-foreground")}
                >
                  Spaces
                  {activeTab === "spaces" && (
                    <motion.div layoutId="moneyTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab("assets")}
                  className={cn("text-sm font-medium transition-colors relative", activeTab === "assets" ? "text-primary" : "text-muted-foreground")}
                >
                  Assets
                  {activeTab === "assets" && (
                    <motion.div layoutId="moneyTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
             </div>

             {/* Tab Contents */}
             <div className="min-h-[400px]">
                {activeTab === "overview" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     
                     {/* Charts */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
                           <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6">6-Month Trend</h3>
                           <div className="h-[200px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={barData}>
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} dy={10} />
                                 <YAxis hide />
                                 <RechartsTooltip 
                                   cursor={{ fill: 'var(--secondary)' }}
                                   contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                   formatter={(value: any) => [formatCurrency(value, activeHome?.currency), 'Spent']}
                                 />
                                 <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                               </BarChart>
                             </ResponsiveContainer>
                           </div>
                        </div>
                        
                        <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
                           <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6">Category Distribution</h3>
                           <div className="h-[200px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                 <Pie
                                   data={pieData}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={60}
                                   outerRadius={80}
                                   paddingAngle={2}
                                   dataKey="value"
                                   stroke="none"
                                 >
                                   {pieData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                   ))}
                                 </Pie>
                                 <RechartsTooltip 
                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                   formatter={(value: any) => [formatCurrency(value, activeHome?.currency), 'Spent']}
                                   labelStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
                                   contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                 />
                                 <Legend 
                                   verticalAlign="bottom" 
                                   height={36}
                                   iconType="circle"
                                   formatter={(value) => <span style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 500 }}>{value}</span>}
                                 />
                               </PieChart>
                             </ResponsiveContainer>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeTab === "recent" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                     {initialExpenses.slice(0, 10).map((exp: any) => (
                       <Link href={`/money/${exp.id}`} key={exp.id}>
                         <div className="group flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/30 transition-colors shadow-sm">
                           <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                               <Banknote className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                             </div>
                             <div>
                               <p className="font-medium text-sm group-hover:text-primary transition-colors truncate max-w-[200px] md:max-w-xs">{exp.title}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{exp.category}</span>
                                 <span className="text-muted-foreground/30">•</span>
                                 <span className="text-xs text-muted-foreground">{new Date(exp.expenseDate).toLocaleDateString()}</span>
                               </div>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="font-serif font-medium">{formatCurrency(exp.amount, activeHome?.currency)}</p>
                             {exp.space && (
                               <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{exp.space.name}</p>
                             )}
                           </div>
                         </div>
                       </Link>
                     ))}
                  </motion.div>
                )}

                {activeTab === "spaces" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                     {topSpaces.length > 0 ? topSpaces.map((space: any, i: number) => (
                       <div key={i} className="p-6 bg-card border border-border/50 rounded-3xl shadow-sm">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                             <MapPin className="h-4 w-4" />
                           </div>
                           <p className="font-medium">{space.name}</p>
                         </div>
                         <p className="text-2xl font-serif">{formatCurrency(space.total, activeHome?.currency)}</p>
                         <p className="text-xs text-muted-foreground mt-1">{space.count} expenses</p>
                       </div>
                     )) : (
                       <div className="col-span-full p-8 text-center bg-secondary/10 border border-border/50 border-dashed rounded-3xl text-muted-foreground">
                         <p className="text-sm">No expenses explicitly tied to spaces yet.</p>
                       </div>
                     )}
                  </motion.div>
                )}

                {activeTab === "assets" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                     {topAssets.length > 0 ? topAssets.map((asset: any, i: number) => (
                       <div key={i} className="p-6 bg-card border border-border/50 rounded-3xl shadow-sm">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                             <PackageOpen className="h-4 w-4" />
                           </div>
                           <p className="font-medium truncate">{asset.name}</p>
                         </div>
                         <p className="text-2xl font-serif">{formatCurrency(asset.total, activeHome?.currency)}</p>
                         <p className="text-xs text-muted-foreground mt-1">{asset.count} expenses</p>
                       </div>
                     )) : (
                       <div className="col-span-full p-8 text-center bg-secondary/10 border border-border/50 border-dashed rounded-3xl text-muted-foreground">
                         <p className="text-sm">No expenses explicitly tied to assets yet.</p>
                       </div>
                     )}
                  </motion.div>
                )}
             </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             
             {/* Quick Actions */}
             <Card className="p-6 border border-border/50 rounded-[2rem] bg-card shadow-sm space-y-4">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Quick Actions</h3>
                <Link href="/money/create" className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 hover:bg-secondary transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border/50">
                      <Banknote className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Log Expense</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                </Link>
                <Link href="/vault/upload" className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 hover:bg-secondary transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border/50">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Upload Receipt</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                </Link>
             </Card>

             {/* Recent Connections */}
             <Card className="p-6 border border-border/50 rounded-[2rem] bg-card shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Recent Connections</h3>
                </div>
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {initialExpenses.filter((e: any) => e.space || e.asset).slice(0, 4).map((e: any) => (
                    <div key={e.id} className="flex gap-3">
                      <div className="mt-0.5">
                        {e.asset ? <PackageOpen className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{e.asset ? e.asset.name : e.space.name}</p>
                        <p className="text-xs text-muted-foreground">Connected to {e.title}</p>
                      </div>
                    </div>
                  ))}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {initialExpenses.filter((e: any) => e.space || e.asset).length === 0 && (
                    <p className="text-sm text-muted-foreground">Tie expenses to spaces and assets to build connections.</p>
                  )}
                </div>
             </Card>

          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Button onClick={() => window.location.href = "/money/create"} size="icon" className="h-14 w-14 rounded-full shadow-float bg-primary text-primary-foreground">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </motion.div>
  );
}
