"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHome } from "@/components/providers/home-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, ShieldAlert, UploadCloud, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { DocumentCard } from "../components/document-card";

const steps = [
  { id: "upload", title: "Upload" },
  { id: "connections", title: "Connections" },
  { id: "metadata", title: "Metadata" },
  { id: "preview", title: "Preview" }
];

const SMART_CATEGORIES = [
  "Property", "Identity", "Insurance", "Bills", 
  "Warranty", "Manuals", "Medical", "Education", 
  "Finance", "Legal", "Other"
];

export default function UploadDocumentPage() {
  const router = useRouter();
  const { activeHome } = useHome();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    file: "",
    mimeType: "",
    size: "0",
    tags: "",
    expiryDate: "",
    spaceId: "",
    assetId: "",
  });

  // Real upload interaction
  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const toastId = toast.loading("Uploading securely to Cloudinary...");
    
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      setFormData({
        ...formData,
        file: data.url,
        mimeType: file.type,
        size: file.size.toString(),
        title: formData.title || file.name.split('.')[0]
      });
      
      toast.success("File uploaded securely", { id: toastId });
      
      // Auto advance
      setTimeout(() => handleNext(), 800);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

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
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-home-id": activeHome!.id,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload document");
      }

      const newDoc = await res.json();
      router.push(`/vault/${newDoc.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  // Preview Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedSpace = spaces?.find((s: any) => s.id === formData.spaceId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedAsset = assets?.find((a: any) => a.id === formData.assetId);
  
  const previewDoc = {
    id: "preview",
    title: formData.title || "Untitled Document",
    category: formData.category || "Uncategorized",
    file: formData.file,
    mimeType: formData.mimeType || "application/pdf",
    createdAt: new Date().toISOString(),
    expiryDate: formData.expiryDate || null,
    uploadedBy: { name: "You" },
    space: selectedSpace,
    asset: selectedAsset,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vault" className="p-2 rounded-full hover:bg-secondary/60 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-primary">Upload to Vault</h1>
            <p className="text-sm text-muted-foreground mt-1">Add to your home&apos;s memory.</p>
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
              
              {/* Step 1: Upload */}
              {currentStep === 0 && (
                <div className="space-y-6 text-center">
                  <div className="mb-8">
                    <h2 className="text-3xl font-serif text-primary">Secure Upload</h2>
                    <p className="text-muted-foreground mt-2 font-light">Select a file to securely store in the Vault.</p>
                  </div>
                  
                  {formData.file ? (
                    <div className="p-12 border-2 border-primary/50 bg-primary/5 rounded-3xl flex flex-col items-center">
                       <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
                       <h3 className="text-lg font-medium">File Attached Successfully</h3>
                       <p className="text-sm text-muted-foreground mt-1">Ready to organize.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="file" 
                        onChange={handleFileUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="p-12 border-2 border-dashed border-border/60 rounded-3xl bg-secondary/10 flex flex-col items-center justify-center hover:bg-secondary/20 hover:border-primary/50 transition-all">
                         <div className="h-20 w-20 rounded-full bg-background border border-border/50 flex items-center justify-center mb-6 shadow-sm">
                           <UploadCloud className="h-8 w-8 text-primary" />
                         </div>
                         <h3 className="text-lg font-medium">Drag & drop or click to upload</h3>
                         <p className="text-sm text-muted-foreground mt-2">Supports PDF, JPG, PNG up to 50MB</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Connections */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Connections</h2>
                    <p className="text-muted-foreground mt-2">Where does this document belong?</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold tracking-widest uppercase text-muted-foreground pl-1">Connect to an Asset</label>
                      <select
                        value={formData.assetId}
                        onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                        className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">None / General Home Document</option>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {assets?.map((asset: any) => (
                          <option key={asset.id} value={asset.id}>{asset.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold tracking-widest uppercase text-muted-foreground pl-1">Connect to a Space</label>
                      <select
                        value={formData.spaceId}
                        onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
                        disabled={!!formData.assetId} // If connected to asset, space is usually derived, but we allow manual if no asset
                        className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                      >
                        <option value="">None / General Home Document</option>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {spaces?.map((space: any) => (
                          <option key={space.id} value={space.id}>{space.name}</option>
                        ))}
                      </select>
                      {formData.assetId && (
                        <p className="text-xs text-muted-foreground pl-1">Space is inherited from the selected Asset.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Metadata */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Metadata</h2>
                    <p className="text-muted-foreground mt-2">Give it context for the memory system.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full h-14 px-5 text-lg bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="e.g. Refrigerator Warranty"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium pl-1">Smart Category</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="">Select...</option>
                          {SMART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium pl-1">Expiry Date <span className="text-muted-foreground font-normal">(Optional)</span></label>
                        <input
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                       <label className="text-sm font-medium pl-1">Tags <span className="text-muted-foreground font-normal">(Comma separated)</span></label>
                       <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full h-12 px-5 text-sm bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="e.g. tax2026, receipt, important"
                        />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Preview */}
              {currentStep === 3 && (
                <div className="space-y-8 text-center max-w-sm mx-auto">
                  <div>
                    <h2 className="text-3xl font-serif tracking-tight text-primary mb-2">Ready to save</h2>
                    <p className="text-sm text-muted-foreground">
                      Review how this document will appear in your Vault.
                    </p>
                  </div>

                  <div className="text-left w-64 mx-auto">
                    <DocumentCard document={previewDoc} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 border-t border-border/40 bg-card/80 backdrop-blur-xl flex items-center justify-between">
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
              disabled={(currentStep === 0 && !formData.file) || (currentStep === 2 && (!formData.title || !formData.category))}
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
              {loading ? "Saving..." : "Save to Vault"} <Save className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
