"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHome } from "@/components/providers/home-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, ShieldAlert, PackageOpen, MapPin, Repeat } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { MaintenanceCard } from "../components/maintenance-card";

const steps = [
  { id: "target", title: "Target" },
  { id: "details", title: "Details" },
  { id: "schedule", title: "Schedule" },
  { id: "preview", title: "Preview" }
];

const MAINTENANCE_CATEGORIES = [
  "HVAC", "Plumbing", "Electrical", "Appliances", 
  "Exterior", "Interior", "Landscaping", "Security", "Other"
];

const FREQUENCIES = [
  { value: "ONCE", label: "One-time" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" }
];

export default function CreateMaintenancePage() {
  const router = useRouter();
  const { activeHome } = useHome();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    targetType: "HOME", // HOME, SPACE, ASSET
    spaceId: "",
    assetId: "",
    
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    
    scheduledDate: "",
    frequency: "ONCE",
    estimatedCost: "",
  });

  const { data: spaces } = useQuery({
    queryKey: ["spaces", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return [];
      const res = await fetch("/api/spaces", { headers: { "x-home-id": activeHome.id } });
      if (!res.ok) throw new Error("Failed to fetch spaces");
      const data = await res.json();
      return data.spaces || data || [];
    },
    enabled: !!activeHome?.id,
  });

  const { data: assets } = useQuery({
    queryKey: ["assets", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return [];
      const res = await fetch("/api/assets", { headers: { "x-home-id": activeHome.id } });
      if (!res.ok) throw new Error("Failed to fetch assets");
      return res.json();
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spaceId: formData.targetType === "SPACE" ? formData.spaceId : (formData.targetType === "ASSET" ? assets?.find((a: any) => a.id === formData.assetId)?.spaceId : null),
        assetId: formData.targetType === "ASSET" ? formData.assetId : null,
      };

      const res = await fetch("/api/care", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-home-id": activeHome!.id,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to schedule maintenance");
      }

      const newMaintenance = await res.json();
      router.push(`/care/${newMaintenance.id}`);
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

  const previewMaintenance = {
    id: "preview",
    title: formData.title || "Untitled Task",
    category: formData.category || "Uncategorized",
    priority: formData.priority,
    status: "SCHEDULED",
    scheduledDate: formData.scheduledDate || new Date().toISOString(),
    space: formData.targetType === "SPACE" ? selectedSpace : undefined,
    asset: formData.targetType === "ASSET" ? selectedAsset : undefined,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/care" className="p-2 rounded-full hover:bg-secondary/60 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-primary">Schedule Care</h1>
            <p className="text-sm text-muted-foreground mt-1">Protect your home&apos;s value.</p>
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
              
              {/* Step 1: Target */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif text-primary">What needs care?</h2>
                    <p className="text-muted-foreground mt-2 font-light">Select the scope of this maintenance task.</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                     <button
                       onClick={() => setFormData({ ...formData, targetType: "HOME" })}
                       className={cn("p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 group",
                         formData.targetType === "HOME" ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-secondary/10 hover:border-primary/50"
                       )}
                     >
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", formData.targetType === "HOME" ? "bg-primary text-primary-foreground" : "bg-background shadow-sm text-muted-foreground")}>
                          <span className="text-xl">🏡</span>
                        </div>
                        <span className={cn("text-sm font-medium", formData.targetType === "HOME" ? "text-primary" : "text-muted-foreground")}>Entire Home</span>
                     </button>
                     <button
                       onClick={() => setFormData({ ...formData, targetType: "SPACE" })}
                       className={cn("p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 group",
                         formData.targetType === "SPACE" ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-secondary/10 hover:border-primary/50"
                       )}
                     >
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", formData.targetType === "SPACE" ? "bg-primary text-primary-foreground" : "bg-background shadow-sm text-muted-foreground")}>
                          <MapPin className="h-5 w-5" />
                        </div>
                        <span className={cn("text-sm font-medium", formData.targetType === "SPACE" ? "text-primary" : "text-muted-foreground")}>Space</span>
                     </button>
                     <button
                       onClick={() => setFormData({ ...formData, targetType: "ASSET" })}
                       className={cn("p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 group",
                         formData.targetType === "ASSET" ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-secondary/10 hover:border-primary/50"
                       )}
                     >
                        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", formData.targetType === "ASSET" ? "bg-primary text-primary-foreground" : "bg-background shadow-sm text-muted-foreground")}>
                          <PackageOpen className="h-5 w-5" />
                        </div>
                        <span className={cn("text-sm font-medium", formData.targetType === "ASSET" ? "text-primary" : "text-muted-foreground")}>Asset</span>
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
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Details</h2>
                    <p className="text-muted-foreground mt-2">What exactly needs to be done?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">Task Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full h-14 px-5 text-lg bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="e.g. Replace AC Filter"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium pl-1">Category</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="">Select...</option>
                          {MAINTENANCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium pl-1">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Schedule</h2>
                    <p className="text-muted-foreground mt-2">When should this happen?</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">Scheduled Date</label>
                      <input
                        type="date"
                        required
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold tracking-widest uppercase text-muted-foreground pl-1 flex items-center gap-2">
                         <Repeat className="h-3.5 w-3.5" /> Recurring Schedule
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {FREQUENCIES.map(freq => (
                           <button
                             key={freq.value}
                             onClick={() => setFormData({ ...formData, frequency: freq.value })}
                             className={cn("py-3 px-2 rounded-xl border text-sm font-medium transition-colors text-center",
                               formData.frequency === freq.value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card border-border/50 text-muted-foreground hover:bg-secondary/50"
                             )}
                           >
                             {freq.label}
                           </button>
                        ))}
                      </div>
                      {formData.frequency !== "ONCE" && (
                        <p className="text-xs text-muted-foreground pl-1 mt-2">
                          HOMEHUB will automatically schedule the next occurrence once this task is marked complete.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Preview */}
              {currentStep === 3 && (
                <div className="space-y-8 text-center max-w-sm mx-auto">
                  <div>
                    <h2 className="text-3xl font-serif tracking-tight text-primary mb-2">Ready to schedule</h2>
                    <p className="text-sm text-muted-foreground">
                      Here is how this maintenance task will appear.
                    </p>
                  </div>

                  <div className="text-left">
                    <MaintenanceCard maintenance={previewMaintenance} />
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
                (currentStep === 0 && formData.targetType === "SPACE" && !formData.spaceId) ||
                (currentStep === 0 && formData.targetType === "ASSET" && !formData.assetId) ||
                (currentStep === 1 && (!formData.title || !formData.category)) ||
                (currentStep === 2 && !formData.scheduledDate)
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
              {loading ? "Scheduling..." : "Confirm Schedule"} <Save className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
