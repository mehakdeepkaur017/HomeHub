"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHome } from "@/components/providers/home-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, ShieldAlert, PackageOpen, MapPin, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const steps = [
  { id: "basic", title: "Basic Info" },
  { id: "relation", title: "Connection" },
  { id: "preview", title: "Preview" }
];

const EXPENSE_CATEGORIES = [
  "Utilities", "Groceries", "Maintenance", "Furniture", 
  "Appliances", "Insurance", "Property", "Renovation", 
  "Cleaning", "Education", "Healthcare", "Other"
];

export default function CreateExpensePage() {
  const router = useRouter();
  const { activeHome } = useHome();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    expenseDate: new Date().toISOString().split('T')[0],
    category: "",
    notes: "",
    
    targetType: "HOME", // HOME, SPACE, ASSET, MAINTENANCE
    spaceId: "",
    assetId: "",
    maintenanceId: "",
  });

  const { data: spaces } = useQuery({
    queryKey: ["spaces", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return [];
      const res = await fetch("/api/spaces", { headers: { "x-home-id": activeHome.id } });
      if (!res.ok) throw new Error("Failed to fetch spaces");
      const data = await res.json();
      return data.spaces || [];
    },
    enabled: !!activeHome?.id,
  });

  const { data: assets } = useQuery({
    queryKey: ["assets", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return [];
      const res = await fetch("/api/assets", { headers: { "x-home-id": activeHome.id } });
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      return Array.isArray(data) ? data : data.assets || [];
    },
    enabled: !!activeHome?.id,
  });

  const { data: maintenanceRecords } = useQuery({
    queryKey: ["maintenance", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return [];
      const res = await fetch("/api/care", { headers: { "x-home-id": activeHome.id } });
      if (!res.ok) throw new Error("Failed to fetch maintenance");
      const data = await res.json();
      return data.maintenanceRecords || data.records || [];
    },
    enabled: !!activeHome?.id,
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        spaceId: formData.targetType === "SPACE" ? formData.spaceId : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formData.targetType === "ASSET" ? assets?.find((a: any) => a.id === formData.assetId)?.spaceId : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formData.targetType === "MAINTENANCE" ? maintenanceRecords?.find((m: any) => m.id === formData.maintenanceId)?.spaceId : null
          )
        ),
        assetId: formData.targetType === "ASSET" ? formData.assetId : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formData.targetType === "MAINTENANCE" ? maintenanceRecords?.find((m: any) => m.id === formData.maintenanceId)?.assetId : null
        ),
        maintenanceId: formData.targetType === "MAINTENANCE" ? formData.maintenanceId : null,
        currency: activeHome?.currency || "USD",
      };

      const res = await fetch("/api/money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-home-id": activeHome!.id,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save expense");
      }

      const newExpense = await res.json();
      router.push(`/money/${newExpense.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedSpace = spaces?.find((s: any) => s.id === formData.spaceId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedAsset = assets?.find((a: any) => a.id === formData.assetId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedMaintenance = maintenanceRecords?.find((m: any) => m.id === formData.maintenanceId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/money" className="p-2 rounded-full hover:bg-secondary/60 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-primary">Log Expense</h1>
            <p className="text-sm text-muted-foreground mt-1">Record a financial event.</p>
          </div>
        </div>
        <div className="text-sm font-medium text-muted-foreground/50 hidden sm:block">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex-1 flex flex-col gap-2">
            <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${i <= currentStep ? "bg-primary" : "bg-secondary"}`} />
            <span className={`text-[10px] font-semibold tracking-widest uppercase transition-colors duration-500 hidden sm:block ${i === currentStep ? "text-primary" : "text-muted-foreground/40"}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-sm min-h-[500px] relative overflow-hidden flex flex-col">
        {error && (
          <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-xl mx-auto"
            >
              
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif text-primary">What was this for?</h2>
                    <p className="text-muted-foreground mt-2 font-light">Enter the basic details of the transaction.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-1 sm:col-span-2">
                        <label className="text-sm font-medium pl-1">Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full h-14 px-5 text-lg bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="e.g. Electric Bill, New Sofa..."
                        />
                      </div>

                      <div className="space-y-2 relative">
                        <label className="text-sm font-medium pl-1">Amount</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: activeHome?.currency || 'USD' }).formatToParts(0).find(p => p.type === 'currency')?.value || '$'}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full h-14 pl-12 pr-5 text-lg bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium pl-1">Date</label>
                        <input
                          type="date"
                          required
                          value={formData.expenseDate}
                          onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                          className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2 col-span-1 sm:col-span-2">
                        <label className="text-sm font-medium pl-1">Category</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="">Select...</option>
                          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Connections */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Connection</h2>
                    <p className="text-muted-foreground mt-2">Does this tie into a specific space, object, or service?</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                     <button
                       onClick={() => setFormData({ ...formData, targetType: "HOME" })}
                       className={cn("p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3",
                         formData.targetType === "HOME" ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-secondary/10 hover:border-primary/50"
                       )}
                     >
                        <span className="text-xl">🏡</span>
                        <span className={cn("text-xs font-medium text-center leading-tight", formData.targetType === "HOME" ? "text-primary" : "text-muted-foreground")}>General</span>
                     </button>
                     <button
                       onClick={() => setFormData({ ...formData, targetType: "SPACE" })}
                       className={cn("p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3",
                         formData.targetType === "SPACE" ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-secondary/10 hover:border-primary/50"
                       )}
                     >
                        <MapPin className="h-5 w-5" />
                        <span className={cn("text-xs font-medium text-center leading-tight", formData.targetType === "SPACE" ? "text-primary" : "text-muted-foreground")}>Space</span>
                     </button>
                     <button
                       onClick={() => setFormData({ ...formData, targetType: "ASSET" })}
                       className={cn("p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3",
                         formData.targetType === "ASSET" ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-secondary/10 hover:border-primary/50"
                       )}
                     >
                        <PackageOpen className="h-5 w-5" />
                        <span className={cn("text-xs font-medium text-center leading-tight", formData.targetType === "ASSET" ? "text-primary" : "text-muted-foreground")}>Asset</span>
                     </button>
                     <button
                       onClick={() => setFormData({ ...formData, targetType: "MAINTENANCE" })}
                       className={cn("p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3",
                         formData.targetType === "MAINTENANCE" ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-secondary/10 hover:border-primary/50"
                       )}
                     >
                        <Wrench className="h-5 w-5" />
                        <span className={cn("text-xs font-medium text-center leading-tight", formData.targetType === "MAINTENANCE" ? "text-primary" : "text-muted-foreground")}>Service</span>
                     </button>
                  </div>

                  {formData.targetType === "SPACE" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-4">
                      <label className="text-sm font-bold tracking-widest uppercase text-muted-foreground pl-1 mb-2 block">Select Space</label>
                      <select
                        value={formData.spaceId}
                        onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
                        className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Choose a room...</option>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {spaces?.map((space: any) => (
                          <option key={space.id} value={space.id}>{space.name}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {formData.targetType === "ASSET" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-4">
                      <label className="text-sm font-bold tracking-widest uppercase text-muted-foreground pl-1 mb-2 block">Select Asset</label>
                      <select
                        value={formData.assetId}
                        onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                        className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Choose an asset...</option>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {assets?.map((asset: any) => (
                          <option key={asset.id} value={asset.id}>{asset.name}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {formData.targetType === "MAINTENANCE" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-4">
                      <label className="text-sm font-bold tracking-widest uppercase text-muted-foreground pl-1 mb-2 block">Select Maintenance Record</label>
                      <select
                        value={formData.maintenanceId}
                        onChange={(e) => setFormData({ ...formData, maintenanceId: e.target.value })}
                        className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Choose a service record...</option>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {maintenanceRecords?.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.title} ({new Date(m.scheduledDate).toLocaleDateString()})</option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: Preview */}
              {currentStep === 2 && (
                <div className="space-y-8 text-center max-w-sm mx-auto">
                  <div>
                    <h2 className="text-3xl font-serif tracking-tight text-primary mb-2">Ready to save</h2>
                    <p className="text-sm text-muted-foreground">
                      This will be permanently recorded in your home&apos;s financial history.
                    </p>
                  </div>

                  <div className="text-left bg-background p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
                     <p className="font-serif text-2xl">{formatCurrency(parseFloat(formData.amount || "0"), activeHome?.currency)}</p>
                     <div>
                       <p className="font-medium">{formData.title || "Untitled"}</p>
                       <p className="text-sm text-muted-foreground">{formData.category}</p>
                     </div>
                     <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground space-y-2">
                       <p>Date: {formData.expenseDate}</p>
                       {formData.targetType === "SPACE" && <p>Connected to: {selectedSpace?.name}</p>}
                       {formData.targetType === "ASSET" && <p>Connected to: {selectedAsset?.name}</p>}
                       {formData.targetType === "MAINTENANCE" && <p>Connected to: {selectedMaintenance?.title}</p>}
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 border-t border-border/40 bg-card/80 backdrop-blur-xl flex items-center justify-between z-20">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
            className="rounded-xl px-4 sm:px-6 h-12"
          >
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 0 && (!formData.title || !formData.amount || !formData.category || !formData.expenseDate)) ||
                (currentStep === 1 && formData.targetType === "SPACE" && !formData.spaceId) ||
                (currentStep === 1 && formData.targetType === "ASSET" && !formData.assetId) ||
                (currentStep === 1 && formData.targetType === "MAINTENANCE" && !formData.maintenanceId)
              }
              className="rounded-xl px-6 sm:px-8 h-12 shadow-float"
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={loading}
              className="rounded-xl px-6 sm:px-8 h-12 shadow-float bg-forest hover:bg-forest/90 text-white"
            >
              {loading ? "Saving..." : "Save Expense"} <Save className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
